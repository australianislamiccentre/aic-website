import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { client } from "@/sanity/lib/client";
import { donationCampaignBySlugQuery } from "@/sanity/lib/queries";
import { SanityDonationCampaign } from "@/types/sanity";

// Lazy initialize Stripe to avoid issues during build
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripe = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripe;
}

// Sanitize strings to remove hidden Unicode characters that can exceed Stripe's 500 char limit
function sanitizeMetadata(str: string | undefined): string {
  if (!str) return "";
  // Remove non-printable ASCII characters and trim
  return str.replace(/[^\x20-\x7E]/g, "").trim().slice(0, 500);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignSlug, dailyAmount, billingType = "daily", donorInfo } = body;

    // Validate required fields
    if (!campaignSlug || typeof campaignSlug !== "string") {
      return NextResponse.json(
        { error: "Campaign slug is required" },
        { status: 400 }
      );
    }

    if (!dailyAmount || typeof dailyAmount !== "number") {
      return NextResponse.json(
        { error: "Daily amount is required" },
        { status: 400 }
      );
    }

    if (!donorInfo?.email || typeof donorInfo.email !== "string") {
      return NextResponse.json(
        { error: "Donor email is required" },
        { status: 400 }
      );
    }

    // 1. Server-side validation - Fetch campaign from Sanity (source of truth)
    const campaign = await client.fetch<SanityDonationCampaign | null>(
      donationCampaignBySlugQuery,
      { slug: campaignSlug }
    );

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // 2. Validate campaign is active
    if (campaign.active === false) {
      return NextResponse.json(
        { error: "This campaign is not currently active" },
        { status: 400 }
      );
    }

    // 3. Validate signup window is open
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (campaign.signupStartDate && campaign.signupStartDate > today) {
      return NextResponse.json(
        { error: `Signup opens on ${campaign.signupStartDate}` },
        { status: 400 }
      );
    }

    // For ongoing campaigns, only check signupEndDate if it exists
    // For time-bound campaigns, fallback to endDate
    const signupEnd = campaign.signupEndDate || campaign.endDate;
    if (signupEnd && signupEnd < today) {
      return NextResponse.json(
        { error: "Signup for this campaign has closed" },
        { status: 400 }
      );
    }

    // 4. Validate amount against campaign settings
    const amount = parseFloat(String(dailyAmount));
    if (isNaN(amount) || amount < campaign.minimumAmount) {
      return NextResponse.json(
        { error: `Minimum daily amount is $${campaign.minimumAmount}` },
        { status: 400 }
      );
    }

    if (campaign.maximumAmount && amount > campaign.maximumAmount) {
      return NextResponse.json(
        { error: `Maximum daily amount is $${campaign.maximumAmount}` },
        { status: 400 }
      );
    }

    // Validate against preset amounts if custom not allowed
    if (
      !campaign.allowCustomAmount &&
      !campaign.presetAmounts.includes(amount)
    ) {
      return NextResponse.json(
        { error: "Please select a valid preset amount" },
        { status: 400 }
      );
    }

    // 5. Calculate billing schedule
    const startDate = new Date(campaign.startDate + "T00:00:00Z");
    const nowDate = new Date();
    const isOngoing = campaign.isOngoing || !campaign.endDate;

    // For ongoing campaigns, endDate is optional
    const endDate = campaign.endDate
      ? new Date(campaign.endDate + "T23:59:59Z")
      : null;

    // Determine actual billing start
    let billingStartDate: Date;
    let isLateJoin = false;

    if (nowDate < startDate) {
      // Pre-signup: billing starts on campaign start date
      billingStartDate = startDate;
    } else {
      // Late join: billing starts tomorrow
      billingStartDate = new Date(nowDate);
      billingStartDate.setDate(billingStartDate.getDate() + 1);
      billingStartDate.setHours(0, 0, 0, 0);
      isLateJoin = true;
    }

    // Calculate remaining days from billing start to end (inclusive)
    // For ongoing campaigns, remainingDays is undefined
    let remainingDays: number | undefined;
    if (endDate) {
      remainingDays =
        Math.ceil(
          (endDate.getTime() - billingStartDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      if (remainingDays < 1) {
        return NextResponse.json(
          { error: "This campaign has ended" },
          { status: 400 }
        );
      }
    }

    // 6. Calculate Unix timestamps for Stripe
    // For ongoing campaigns, no cancel_at is set
    const cancelAt = endDate ? Math.floor(endDate.getTime() / 1000) : undefined;

    // If billing starts in the future, use trial_end to delay first charge
    // Stripe requires trial_end to be at least 2 days in the future
    const twoDaysFromNow = new Date(nowDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    const trialEnd =
      billingStartDate > twoDaysFromNow
        ? Math.floor(billingStartDate.getTime() / 1000)
        : undefined;

    // 7. Create Stripe checkout session
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const amountInCents = Math.round(amount * 100);
    const totalAmountInCents = remainingDays ? amountInCents * remainingDays : 0;

    let session: Stripe.Checkout.Session;

    if (billingType === "upfront") {
      // Upfront payment only available for time-bound campaigns
      if (isOngoing || !remainingDays) {
        return NextResponse.json(
          { error: "Upfront payment is not available for ongoing campaigns" },
          { status: 400 }
        );
      }

      // One-time payment for the full campaign amount
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        customer_email: donorInfo.email,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "aud",
              product_data: {
                name: sanitizeMetadata(`Campaign Donation - ${campaign.title}`),
                description: `$${amount}/day × ${remainingDays} days (${campaign.startDate} to ${campaign.endDate})`,
                metadata: {
                  campaignId: campaign._id,
                  campaignSlug: sanitizeMetadata(campaign.slug),
                },
              },
              unit_amount: totalAmountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "campaign_upfront",
          campaignId: campaign._id,
          campaignSlug: sanitizeMetadata(campaign.slug),
          campaignTitle: sanitizeMetadata(campaign.title),
          dailyAmount: amount.toString(),
          totalDays: remainingDays.toString(),
          totalAmount: (amount * remainingDays).toString(),
          startDate: campaign.startDate,
          endDate: campaign.endDate || "",
          isLateJoin: isLateJoin.toString(),
          donorFirstName: sanitizeMetadata(donorInfo.firstName),
          donorLastName: sanitizeMetadata(donorInfo.lastName),
          donorPhone: sanitizeMetadata(donorInfo.phone),
          donorMessage: sanitizeMetadata(donorInfo.message),
          anonymous: donorInfo.anonymous ? "true" : "false",
        },
        success_url: `${baseUrl}/campaigns/${campaign.slug}/success?session_id={CHECKOUT_SESSION_ID}&type=upfront`,
        cancel_url: `${baseUrl}/campaigns/${campaign.slug}?cancelled=true`,
      };

      session = await getStripe().checkout.sessions.create(sessionParams);
    } else {
      // Daily subscription billing
      // Build description based on whether campaign is ongoing or time-bound
      const subscriptionDescription = isOngoing
        ? `$${amount}/day - Ongoing daily donation (starting ${campaign.startDate})`
        : `$${amount}/day for ${remainingDays} days (${campaign.startDate} to ${campaign.endDate})`;

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        customer_email: donorInfo.email,
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "aud",
              product_data: {
                name: sanitizeMetadata(`Daily Donation - ${campaign.title}`),
                description: subscriptionDescription,
                metadata: {
                  campaignId: campaign._id,
                  campaignSlug: sanitizeMetadata(campaign.slug),
                },
              },
              unit_amount: amountInCents,
              recurring: {
                interval: "day",
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            type: "campaign_subscription",
            campaignId: campaign._id,
            campaignSlug: sanitizeMetadata(campaign.slug),
            campaignTitle: sanitizeMetadata(campaign.title),
            dailyAmount: amount.toString(),
            totalDays: remainingDays?.toString() || "ongoing",
            startDate: campaign.startDate,
            endDate: campaign.endDate || "ongoing",
            isOngoing: isOngoing ? "true" : "false",
            // Store cancel_at timestamp so webhook can set it on subscription creation (only for time-bound)
            ...(cancelAt && { cancelAtTimestamp: cancelAt.toString() }),
            isLateJoin: isLateJoin.toString(),
            donorFirstName: sanitizeMetadata(donorInfo.firstName),
            donorLastName: sanitizeMetadata(donorInfo.lastName),
            donorPhone: sanitizeMetadata(donorInfo.phone),
            donorMessage: sanitizeMetadata(donorInfo.message),
            anonymous: donorInfo.anonymous ? "true" : "false",
          },
          // Delay first charge until campaign start if signing up early
          ...(trialEnd && { trial_end: trialEnd }),
        },
        metadata: {
          type: "campaign_subscription",
          campaignId: campaign._id,
          campaignSlug: campaign.slug,
          isOngoing: isOngoing ? "true" : "false",
        },
        success_url: `${baseUrl}/campaigns/${campaign.slug}/success?session_id={CHECKOUT_SESSION_ID}&type=daily${isOngoing ? "&ongoing=true" : ""}`,
        cancel_url: `${baseUrl}/campaigns/${campaign.slug}?cancelled=true`,
      };

      session = await getStripe().checkout.sessions.create(sessionParams);
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      billingInfo: {
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        remainingDays,
        dailyAmount: amount,
        totalAmount: remainingDays ? amount * remainingDays : undefined,
        isLateJoin,
        isOngoing,
      },
    });
  } catch (error) {
    console.error("Campaign subscription error:", error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: "Payment service error. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create subscription. Please try again." },
      { status: 500 }
    );
  }
}
