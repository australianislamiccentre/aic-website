import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy initialize Stripe
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, email } = body;

    // Validate required fields
    if (!subscriptionId || typeof subscriptionId !== "string") {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required for verification" },
        { status: 400 }
      );
    }

    // Retrieve subscription to verify ownership
    const subscription = await getStripe().subscriptions.retrieve(
      subscriptionId,
      {
        expand: ["customer"],
      }
    );

    // Verify the email matches the customer
    const customer = subscription.customer as Stripe.Customer;
    if (!customer.email || customer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email does not match subscription" },
        { status: 403 }
      );
    }

    // Verify this is a campaign subscription
    if (!subscription.metadata?.campaignId) {
      return NextResponse.json(
        { error: "This is not a campaign subscription" },
        { status: 400 }
      );
    }

    // Check if already cancelled
    if (subscription.cancel_at_period_end || subscription.status === "canceled") {
      return NextResponse.json(
        { error: "This subscription is already cancelled" },
        { status: 400 }
      );
    }

    // Cancel the subscription at period end (allows current day to complete)
    await getStripe().subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Your subscription will be cancelled after today's donation is processed",
      campaignTitle: subscription.metadata?.campaignTitle || "Campaign",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === "resource_missing") {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Payment service error. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Failed to cancel subscription. Please try again." },
      { status: 500 }
    );
  }
}
