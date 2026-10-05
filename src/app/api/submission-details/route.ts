/**
 * Submission Details API Route
 *
 * Called by the button on `/submission-details`, the page the "Request details"
 * link in every staff notification email opens. Emails the full stored record
 * of that submission — fields plus the sender's IP, location and browser — to
 * the fixed `SUBMISSION_DETAILS_RECIPIENTS`. The details never go to whoever
 * clicked, so a forwarded staff email can't leak them.
 *
 * The page needs a button press because email security scanners open every
 * link in incoming mail; a link that sent on open would fire for every email.
 *
 * Security: the record path must carry this site's signature (see
 * `lib/submission-link`); rate-limited (5 req/hr per IP). Each request is logged.
 *
 * @route POST /api/submission-details
 * @module api/submission-details
 * @see src/lib/submission-link.ts   — signing, recipients
 * @see src/lib/submission-record.ts — the stored record
 */
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { sendEmail } from "@/lib/email-delivery";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";
import { submissionDetailsEmail } from "@/lib/email-templates";
import { SUBMISSION_DETAILS_RECIPIENTS, verifyRecordPath } from "@/lib/submission-link";
import { readSubmissionRecord } from "@/lib/submission-record";

/** Verified domain sender, falls back to Resend's testing sender during dev. */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/**
 * Emails a submission's stored record to the details recipients.
 *
 * Body: `{ record: string, sig: string }`, as carried by the "Request details" link.
 *
 * @returns `{ success: true }` once sent, `{ error: string }` with appropriate HTTP status otherwise.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip).allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    let body: { record?: unknown; sig?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { record: pathname, sig } = body ?? {};
    if (!verifyRecordPath(pathname, sig)) {
      return NextResponse.json({ error: "This link isn't valid." }, { status: 403 });
    }

    const record = await readSubmissionRecord(pathname);
    if (!record) {
      return NextResponse.json(
        { error: "We couldn't find the details for this submission." },
        { status: 404 }
      );
    }

    const details = submissionDetailsEmail(record, pathname);
    const emailId = await sendEmail({
      from: `AIC Website <${FROM_EMAIL}>`,
      to: SUBMISSION_DETAILS_RECIPIENTS,
      subject: details.subject,
      html: details.html,
    });
    if (!emailId) {
      throw new Error(`Submission details email for ${record.submissionId} was not sent`);
    }

    // Audit trail: who asked for whose details (metadata only)
    console.info(
      JSON.stringify({
        event: "submission_details_requested",
        submissionId: record.submissionId,
        record: pathname,
        ip,
        requestId: request.headers.get("x-vercel-id"),
        emailId,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] /api/submission-details POST error:", error);
    Sentry.captureException(error, { tags: { route: "submission-details" } });
    return NextResponse.json(
      { error: "Couldn't send the details. Please try again." },
      { status: 500 }
    );
  }
}
