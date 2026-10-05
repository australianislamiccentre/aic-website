/**
 * Service Inquiry API Route
 *
 * Handles POST submissions from service detail pages. Same pipeline as the
 * contact route (toggle → rate limit → honeypot → validate → emails), with
 * one twist: the notification email can be routed to a service-specific
 * recipient if one was set on the service document in Sanity.
 *
 * Security: Rate-limited (5 req/hr per IP), honeypot field, Sanity toggle.
 * Every request is logged with its sender's request details, and every accepted
 * submission is stored privately with them (see `lib/submission-record`). The
 * details go to staff only — never into the response or the confirmation email.
 *
 * @route POST /api/service-inquiry
 * @module api/service-inquiry
 * @see src/lib/contact-validation.ts — validateServiceInquiry
 * @see src/lib/email-templates.ts    — serviceNotificationEmail, serviceConfirmationEmail
 * @see src/lib/form-settings.ts      — Sanity-based form toggle & recipient lookup
 * @see src/sanity/lib/fetch.ts       — getServiceBySlug (per-service recipient lookup)
 * @see src/lib/submission-record.ts  — stored record, log line, Sentry context
 */
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-delivery";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";
import { validateServiceInquiry } from "@/lib/contact-validation";
import {
  serviceNotificationEmail,
  serviceConfirmationEmail,
} from "@/lib/email-templates";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";
import { getServiceBySlug } from "@/sanity/lib/fetch";
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

/**
 * Processes a service inquiry submission.
 *
 * Pipeline: capture request details → toggle check → rate limit → honeypot →
 * validate → recipient lookup → send emails → store the record.
 * The recipient lookup checks for a per-service email in Sanity before falling back to global.
 *
 * @returns `{ success: true }` on success, `{ error: string }` with appropriate HTTP status on failure.
 */
export async function POST(request: NextRequest) {
  const submission = startSubmission("service-inquiry", request);
  try {
    // Check if form is enabled in Sanity (allows staff to disable without a deploy)
    const enabled = await isFormEnabled("serviceInquiry");
    if (!enabled) {
      logSubmission(submission, "disabled");
      return NextResponse.json(
        { error: "This form is currently disabled." },
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

    const result = validateServiceInquiry(body);
    if (!result.valid) {
      logSubmission(submission, "invalid");
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data } = result;
    const emails: SubmissionEmails = { notification: null, confirmation: null };
    let outcome: "accepted" | "error" = "error";

    try {
      // Recipient resolution: per-service email (Sanity) → global serviceInquiry recipient → fallback
      let toEmail = await getFormRecipientEmail("serviceInquiry");
      if (body.serviceSlug) {
        try {
          const service = await getServiceBySlug(body.serviceSlug);
          if (service?.formRecipientEmail) {
            toEmail = service.formRecipientEmail;
          }
        } catch {
          // Fall back to global recipient if lookup fails
        }
      }

      // Send notification to AIC staff, with the request details
      const notification = serviceNotificationEmail(data, submission);
      emails.notification = await sendEmail({
        from: `AIC Website <${FROM_EMAIL}>`,
        to: toEmail,
        replyTo: data.email,
        subject: notification.subject,
        html: notification.html,
      });

      // Send confirmation to the submitter
      const confirmation = serviceConfirmationEmail(data);
      emails.confirmation = await sendEmail({
        from: `Australian Islamic Centre <${FROM_EMAIL}>`,
        to: data.email,
        subject: confirmation.subject,
        html: confirmation.html,
      });
      outcome = "accepted";
    } finally {
      // Keep the record even if an email failed; storage problems never fail the request
      await finishSubmission(submission, outcome, { fields: data, emails, messageLength: data.message.length });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] /api/service-inquiry POST error:", error);
    reportSubmissionError(submission, error);
    return NextResponse.json(
      { error: "Failed to send inquiry. Please try again." },
      { status: 500 }
    );
  }
}
