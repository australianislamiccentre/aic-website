import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateEventInquiry } from "@/lib/contact-validation";
import {
  eventNotificationEmail,
  eventConfirmationEmail,
} from "@/lib/email-templates";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(request: NextRequest) {
  try {
    // Check if event inquiry form is enabled in Sanity
    const enabled = await isFormEnabled("eventInquiry");
    if (!enabled) {
      return NextResponse.json(
        { error: "Event inquiries are currently disabled." },
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

    const body = await request.json();

    // Honeypot check
    if (body._gotcha) {
      return NextResponse.json({ success: true });
    }

    const result = validateEventInquiry(body);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data } = result;
    const resend = getResendClient();

    // Use event-specific contact email if provided, otherwise global event inquiry recipient
    const toEmail = data.contactEmail || await getFormRecipientEmail("eventInquiry");

    // Send notification to AIC
    const notification = eventNotificationEmail(data);
    await resend.emails.send({
      from: `AIC Website <${FROM_EMAIL}>`,
      to: toEmail,
      replyTo: data.email,
      subject: notification.subject,
      html: notification.html,
    });

    // Send confirmation to the submitter
    const confirmation = eventConfirmationEmail(data);
    await resend.emails.send({
      from: `Australian Islamic Centre <${FROM_EMAIL}>`,
      to: data.email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry. Please try again." },
      { status: 500 }
    );
  }
}
