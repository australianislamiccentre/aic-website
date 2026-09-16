/**
 * Event Inquiry API Route
 *
 * Handles POST submissions from event detail pages. Same pipeline as the
 * contact route (toggle → rate limit → honeypot → validate → emails), with
 * one twist: the notification email can be routed to an event-specific
 * contact email if one was set on the event document in Sanity.
 *
 * Security: Rate-limited (5 req/hr per IP), honeypot field, Sanity toggle.
 * The request only names the event by slug; the event title and recipient
 * are read from Sanity, and only events using the enquiry form are accepted —
 * otherwise anyone could send AIC-branded email to an address of their choice.
 *
 * @route POST /api/event-inquiry
 * @module api/event-inquiry
 * @see src/lib/contact-validation.ts — validateEventInquiry
 * @see src/lib/email-templates.ts    — eventNotificationEmail, eventConfirmationEmail
 * @see src/lib/form-settings.ts      — Sanity-based form toggle & recipient lookup
 */
import { NextRequest, NextResponse } from "next/server";
import { stegaClean } from "next-sanity";
import { sendEmail } from "@/lib/email-delivery";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";
import { validateEventInquiry } from "@/lib/contact-validation";
import {
  eventNotificationEmail,
  eventConfirmationEmail,
} from "@/lib/email-templates";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";
import { getEventBySlug } from "@/sanity/lib/fetch";

/** Verified domain sender, falls back to Resend's testing sender during dev. */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/**
 * Processes an event inquiry submission.
 *
 * Pipeline: toggle check → rate limit → honeypot → validate → send emails.
 *
 * @returns `{ success: true }` on success, `{ error: string }` with appropriate HTTP status on failure.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if event inquiry form is enabled in Sanity (allows staff to disable without a deploy)
    const enabled = await isFormEnabled("eventInquiry");
    if (!enabled) {
      return NextResponse.json(
        { error: "Event inquiries are currently disabled." },
        { status: 403 }
      );
    }

    // Rate limiting — 5 requests per hour per IP (best-effort on serverless).
    // IP comes from a trusted, platform-set source — never the spoofable
    // left-most x-forwarded-for value (issue #69).
    const ip = getClientIp(request);
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

    const result = validateEventInquiry(body);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { eventSlug, ...submission } = result.data;

    // Only real events that show the enquiry form can receive enquiries.
    const event = await getEventBySlug(eventSlug);
    if (!event || event.formType !== "contact") {
      return NextResponse.json(
        { error: "This event isn't accepting enquiries." },
        { status: 404 }
      );
    }

    // stegaClean: in draft mode the lookup returns strings with invisible stega characters
    const data = { ...submission, eventName: stegaClean(event.title) };

    // Use event-specific contact email if set in Sanity, otherwise fall back to global recipient
    const toEmail = stegaClean(event.contactEmail) || await getFormRecipientEmail("eventInquiry");

    // Send notification to AIC staff
    const notification = eventNotificationEmail(data);
    await sendEmail({
      from: `AIC Website <${FROM_EMAIL}>`,
      to: toEmail,
      replyTo: data.email,
      subject: notification.subject,
      html: notification.html,
    });

    // Send confirmation to the submitter
    const confirmation = eventConfirmationEmail(data);
    await sendEmail({
      from: `Australian Islamic Centre <${FROM_EMAIL}>`,
      to: data.email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] /api/event-inquiry POST error:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry. Please try again." },
      { status: 500 }
    );
  }
}
