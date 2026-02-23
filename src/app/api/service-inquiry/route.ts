/**
 * Service Inquiry API Route
 *
 * Handles POST submissions from service detail pages. Same pipeline as the
 * contact route (toggle → rate limit → honeypot → validate → emails), with
 * one twist: the notification email can be routed to a service-specific
 * recipient if one was set on the service document in Sanity.
 *
 * Security: Rate-limited (5 req/hr per IP), honeypot field, Sanity toggle.
 *
 * @route POST /api/service-inquiry
 * @module api/service-inquiry
 * @see src/lib/contact-validation.ts — validateServiceInquiry
 * @see src/lib/email-templates.ts    — serviceNotificationEmail, serviceConfirmationEmail
 * @see src/lib/form-settings.ts      — Sanity-based form toggle & recipient lookup
 * @see src/sanity/lib/fetch.ts       — getServiceBySlug (per-service recipient lookup)
 */
import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateServiceInquiry } from "@/lib/contact-validation";
import {
  serviceNotificationEmail,
  serviceConfirmationEmail,
} from "@/lib/email-templates";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";
import { getServiceBySlug } from "@/sanity/lib/fetch";

/** Verified domain sender, falls back to Resend's testing sender during dev. */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/**
 * Processes a service inquiry submission.
 *
 * Pipeline: toggle check → rate limit → honeypot → validate → recipient lookup → send emails.
 * The recipient lookup checks for a per-service email in Sanity before falling back to global.
 *
 * @returns `{ success: true }` on success, `{ error: string }` with appropriate HTTP status on failure.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if form is enabled in Sanity (allows staff to disable without a deploy)
    const enabled = await isFormEnabled("serviceInquiry");
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

    const result = validateServiceInquiry(body);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data } = result;
    const resend = getResendClient();

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

    // Send notification to AIC staff
    const notification = serviceNotificationEmail(data);
    await resend.emails.send({
      from: `AIC Website <${FROM_EMAIL}>`,
      to: toEmail,
      replyTo: data.email,
      subject: notification.subject,
      html: notification.html,
    });

    // Send confirmation to the submitter
    const confirmation = serviceConfirmationEmail(data);
    await resend.emails.send({
      from: `Australian Islamic Centre <${FROM_EMAIL}>`,
      to: data.email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] /api/service-inquiry POST error:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry. Please try again." },
      { status: 500 }
    );
  }
}
