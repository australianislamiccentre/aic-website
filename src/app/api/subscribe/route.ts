import { NextRequest, NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { getFormRecipientEmail, isFormEnabled } from "@/lib/form-settings";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // Check if form is enabled in Sanity
    const enabled = await isFormEnabled("newsletter");
    if (!enabled) {
      return NextResponse.json(
        { error: "Newsletter subscription is currently disabled." },
        { status: 403 }
      );
    }

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

    // Honeypot
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

    // Add to Resend Audience if configured
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

    // Notify admin
    const toEmail = await getFormRecipientEmail("newsletter");
    const details = [
      `<p><strong>Email:</strong> ${email}</p>`,
      name ? `<p><strong>Name:</strong> ${name}</p>` : "",
      phone ? `<p><strong>Phone:</strong> ${phone}</p>` : "",
    ].join("");

    await resend.emails.send({
      from: `AIC Website <${FROM_EMAIL}>`,
      to: toEmail,
      replyTo: email,
      subject: `New Newsletter Subscriber: ${name || email}`,
      html: `<p>A new subscriber has signed up for the AIC newsletter:</p>${details}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
