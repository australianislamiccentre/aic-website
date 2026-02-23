/**
 * Newsletter Subscribe API Route
 *
 * Handles POST submissions from the newsletter signup form (footer / contact page).
 * Two actions on success:
 * 1. Adds the subscriber to the **Resend Audience** (if RESEND_AUDIENCE_ID is set),
 *    enabling broadcast campaigns from Resend's dashboard.
 * 2. Sends a **notification email** to AIC staff so they know who subscribed.
 *
 * Unlike contact/event/service routes, no confirmation email is sent to the user —
 * the subscription itself is the acknowledgement.
 *
 * Security: Rate-limited (5 req/hr per IP), honeypot field, Sanity toggle.
 *
 * @route POST /api/subscribe
 * @module api/subscribe
 * @see src/lib/email-templates.ts — subscribeNotificationEmail
 * @see src/lib/form-settings.ts   — Sanity-based form toggle & recipient lookup
 */
import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";
import { subscribeNotificationEmail } from "@/lib/email-templates";

/** Verified domain sender, falls back to Resend's testing sender during dev. */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/** Resend Audience ID for managing newsletter subscribers. Optional — omit to skip audience sync. */
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Processes a newsletter subscription.
 *
 * Pipeline: toggle check → rate limit → honeypot → validate email → audience sync → notify admin.
 *
 * @returns `{ success: true }` on success, `{ error: string }` with appropriate HTTP status on failure.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if form is enabled in Sanity (allows staff to disable without a deploy)
    const enabled = await isFormEnabled("newsletter");
    if (!enabled) {
      return NextResponse.json(
        { error: "Newsletter subscription is currently disabled." },
        { status: 403 }
      );
    }

    // Rate limiting — 5 requests per hour per IP (best-effort on serverless)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot: hidden field filled by bots — return fake success to avoid tipping them off
    if (body._gotcha) {
      return NextResponse.json({ success: true });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const resend = getResendClient();

    // Add to Resend Audience if configured (enables broadcast campaigns from Resend dashboard)
    if (AUDIENCE_ID) {
      const [firstName, ...rest] = name.split(" ");
      await resend.contacts.create({
        audienceId: AUDIENCE_ID,
        email,
        firstName: firstName || undefined,
        lastName: rest.join(" ") || undefined,
        unsubscribed: false,
      });
    }

    // Notify admin with branded template
    const toEmail = await getFormRecipientEmail("newsletter");
    const notification = subscribeNotificationEmail({ email, name: name || undefined, phone: phone || undefined });

    await resend.emails.send({
      from: `AIC Website <${FROM_EMAIL}>`,
      to: toEmail,
      replyTo: email,
      subject: notification.subject,
      html: notification.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] /api/subscribe POST error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
