/**
 * Contact Form API Route
 *
 * Handles POST submissions from the /contact page. Validates the payload,
 * checks rate limits and honeypot, then sends two emails via Resend:
 * 1. **Admin notification** — to the AIC staff recipient configured in Sanity.
 * 2. **User confirmation** — branded acknowledgement to the submitter.
 *
 * Security: Rate-limited (5 req/hr per IP), honeypot field, Sanity toggle.
 *
 * @route POST /api/contact
 * @module api/contact
 * @see src/lib/contact-validation.ts — validates the request body
 * @see src/lib/email-templates.ts    — generates branded HTML emails
 * @see src/lib/form-settings.ts      — Sanity-based form toggle & recipient lookup
 */
import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateContactForm } from "@/lib/contact-validation";
import {
  contactNotificationEmail,
  contactConfirmationEmail,
} from "@/lib/email-templates";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";

/** Verified domain sender, falls back to Resend's testing sender during dev. */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/**
 * Processes a contact form submission.
 *
 * Pipeline: toggle check → rate limit → honeypot → validate → send emails.
 *
 * @returns `{ success: true }` on success, `{ error: string }` with appropriate HTTP status on failure.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if form is enabled in Sanity (allows staff to disable without a deploy)
    const enabled = await isFormEnabled("contact");
    if (!enabled) {
      return NextResponse.json(
        { error: "This form is currently disabled." },
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

    const result = validateContactForm(body);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data } = result;
    const resend = getResendClient();
    const toEmail = await getFormRecipientEmail("contact");

    // Send notification to AIC staff
    const notification = contactNotificationEmail(data);
    await resend.emails.send({
      from: `AIC Website <${FROM_EMAIL}>`,
      to: toEmail,
      replyTo: data.email,
      subject: notification.subject,
      html: notification.html,
    });

    // Send confirmation to the submitter
    const confirmation = contactConfirmationEmail(data);
    await resend.emails.send({
      from: `Australian Islamic Centre <${FROM_EMAIL}>`,
      to: data.email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] /api/contact POST error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
