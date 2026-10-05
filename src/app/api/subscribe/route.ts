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
 * Every request is logged with its sender's request details, and every accepted
 * sign-up is stored privately with them (see `lib/submission-record`). The
 * details go to staff only — never into the response.
 *
 * @route POST /api/subscribe
 * @module api/subscribe
 * @see src/lib/email-templates.ts — subscribeNotificationEmail
 * @see src/lib/form-settings.ts   — Sanity-based form toggle & recipient lookup
 * @see src/lib/submission-record.ts — stored record, log line, Sentry context
 */
import { NextRequest, NextResponse } from "next/server";
import { addToNewsletterAudience, sendEmail } from "@/lib/email-delivery";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";
import { subscribeNotificationEmail } from "@/lib/email-templates";
import {
  finishSubmission,
  logSubmission,
  reportSubmissionError,
  startSubmission,
  type SubmissionEmails,
} from "@/lib/submission-record";

/** Verified domain sender, falls back to Resend's testing sender during dev. */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/** Resend Audience ID for managing newsletter subscribers. Optional — omit to skip audience sync. */
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Processes a newsletter subscription.
 *
 * Pipeline: capture request details → toggle check → rate limit → honeypot →
 * validate email → audience sync → notify admin → store the record.
 *
 * @returns `{ success: true }` on success, `{ error: string }` with appropriate HTTP status on failure.
 */
export async function POST(request: NextRequest) {
  const submission = startSubmission("subscribe", request);
  try {
    // Check if form is enabled in Sanity (allows staff to disable without a deploy)
    const enabled = await isFormEnabled("newsletter");
    if (!enabled) {
      logSubmission(submission, "disabled");
      return NextResponse.json(
        { error: "Newsletter subscription is currently disabled." },
        { status: 403 }
      );
    }

    // Rate limiting — 5 requests per hour per IP (best-effort on serverless).
    // IP comes from a trusted, platform-set source — never the spoofable
    // left-most x-forwarded-for value (issue #69).
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      logSubmission(submission, "rate_limited");
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot: hidden field filled by bots — return fake success to avoid tipping them off
    if (body._gotcha) {
      logSubmission(submission, "honeypot");
      return NextResponse.json({ success: true });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const whatsapp = body.whatsapp === true;

    if (!email || !EMAIL_RE.test(email)) {
      logSubmission(submission, "invalid");
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!phone) {
      logSubmission(submission, "invalid");
      return NextResponse.json({ error: "Please enter your phone number." }, { status: 400 });
    }

    const emails: SubmissionEmails = { notification: null };
    let outcome: "accepted" | "error" = "error";

    try {
      // Add to Resend Audience if configured (enables broadcast campaigns from Resend dashboard).
      // Production only — see src/lib/email-delivery.ts.
      if (AUDIENCE_ID) {
        const [firstName, ...rest] = name.split(" ");
        await addToNewsletterAudience({
          audienceId: AUDIENCE_ID,
          email,
          firstName: firstName || undefined,
          lastName: rest.join(" ") || undefined,
          unsubscribed: false,
          properties: {
            phone: phone || "",
            whatsapp: whatsapp ? "yes" : "no",
          },
        });
      }

      // Notify admin with branded template, with the request details
      const toEmail = await getFormRecipientEmail("newsletter");
      const notification = subscribeNotificationEmail(
        { email, name: name || undefined, phone: phone || undefined, whatsapp },
        submission,
      );

      emails.notification = await sendEmail({
        from: `AIC Website <${FROM_EMAIL}>`,
        to: toEmail,
        replyTo: email,
        subject: notification.subject,
        html: notification.html,
      });
      outcome = "accepted";
    } finally {
      // Keep the record even if an email failed; storage problems never fail the request
      await finishSubmission(submission, outcome, { fields: { email, name, phone, whatsapp }, emails });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] /api/subscribe POST error:", error);
    reportSubmissionError(submission, error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
