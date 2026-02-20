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

// Use verified domain, fall back to Resend's testing sender
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(request: NextRequest) {
  try {
    // Check if form is enabled in Sanity
    const enabled = await isFormEnabled("serviceInquiry");
    if (!enabled) {
      return NextResponse.json(
        { error: "This form is currently disabled." },
        { status: 403 }
      );
    }

    // Rate limiting
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

    // Parse and validate
    const body = await request.json();

    // Honeypot: if filled, it's a bot - return fake success
    if (body._gotcha) {
      return NextResponse.json({ success: true });
    }

    const result = validateServiceInquiry(body);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data } = result;
    const resend = getResendClient();

    // Check if this service has a specific recipient email set in Sanity
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

    // Send notification to AIC
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
    console.error("Service inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry. Please try again." },
      { status: 500 }
    );
  }
}
