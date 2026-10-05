/**
 * Form Submission Records — Durable Security Trail for Every Form
 *
 * Each form route calls into this module so every submission leaves:
 * 1. **A private stored record** — one JSON file per accepted submission in a
 *    private Vercel Blob store: the validated fields, the request's security
 *    record (`lib/request-meta`) and the Resend IDs of the emails sent.
 *    Private stores need authentication for every read; no URL is public.
 * 2. **One structured log line** — request metadata only. Form contents
 *    (names, emails, phone numbers, messages) never go to the logs.
 * 3. **Sentry context** — the security record, tagged with the form and
 *    submission ID, on any error captured during the request.
 *
 * Storage never throws and never changes the response: a failure is reported
 * to Sentry and the form carries on. Records are filed as
 * `{environment}/{form}/{UTC date}/{UTC time}_{submissionId}.json`, so preview
 * test submissions never mix with production records.
 *
 * Nothing here is ever returned to the submitter.
 *
 * Reading records: `vercel blob list --prefix production/contact/` then
 * `vercel blob get <pathname> --access private`, or the store's page under
 * Storage in the Vercel dashboard.
 *
 * @module lib/submission-record
 * @see src/lib/request-meta.ts — what the security record contains
 * @see https://vercel.com/docs/vercel-blob/private-storage
 */
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import * as Sentry from "@sentry/nextjs";
import { captureRequestMeta, type RequestMeta } from "@/lib/request-meta";

/** The site's form endpoints, named after their API routes. */
export type FormName = "contact" | "event-inquiry" | "service-inquiry" | "subscribe";

/** How a request to a form endpoint ended. */
export type SubmissionOutcome =
  | "accepted"
  | "disabled"
  | "rate_limited"
  | "honeypot"
  | "invalid"
  | "not_found"
  | "error";

/** Resend IDs of the emails sent for a submission, by role; `null` when nothing was sent. */
export type SubmissionEmails = Partial<Record<"notification" | "confirmation", string | null>>;

/** A request to a form endpoint, from the moment it arrives. */
export interface Submission {
  submissionId: string;
  form: FormName;
  meta: RequestMeta;
}

/** Submissions that already have their log line — one line per request. */
const logged = new WeakSet<Submission>();

/** The security record as flat Sentry context (nested objects render poorly there). */
function sentryContext({ submissionId, form, meta }: Submission): Record<string, string | null> {
  return {
    submissionId,
    form,
    receivedAt: meta.receivedAt,
    ip: meta.ip,
    ...meta.ipHeaders,
    ...meta.location,
    ...meta.vercel,
    ...meta.client,
    host: meta.host,
  };
}

/** Sentry capture options carrying the submission's tags and context. */
function sentryScope(submission: Submission) {
  return {
    tags: { form: submission.form, submission_id: submission.submissionId },
    contexts: { form_submission: sentryContext(submission) },
  };
}

/**
 * Starts the record for a request: gives it an ID, captures the security
 * record, and attaches both to Sentry for the rest of the request.
 * Call it first thing in a form route, before any check that can reject.
 */
export function startSubmission(form: FormName, request: NextRequest): Submission {
  const submission: Submission = {
    submissionId: randomUUID(),
    form,
    meta: captureRequestMeta(request),
  };

  Sentry.setTag("form", form);
  Sentry.setTag("submission_id", submission.submissionId);
  Sentry.setContext("form_submission", sentryContext(submission));

  return submission;
}

/** `production`, `preview`, or `development` (local). */
function environment(): string {
  return process.env.VERCEL_ENV || "development";
}

/** Where a record is filed: `{environment}/{form}/{UTC date}/{UTC time}_{submissionId}.json`. */
function recordPath({ submissionId, form, meta }: Submission): string {
  const date = meta.receivedAt.slice(0, 10);
  const time = meta.receivedAt.replace(/[:.]/g, "-");
  return `${environment()}/${form}/${date}/${time}_${submissionId}.json`;
}

/**
 * Writes the submission's private record. Never throws.
 *
 * @returns Whether the record was stored.
 */
export async function storeSubmission(
  submission: Submission,
  fields: object,
  emails: SubmissionEmails,
): Promise<boolean> {
  // Connecting the Blob store sets BLOB_STORE_ID (OIDC sign-in); BLOB_READ_WRITE_TOKEN is the non-Vercel alternative
  const configured = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
  if (!configured) {
    if (!process.env.VERCEL_ENV) {
      console.warn(
        `[form-record] Not stored: no Blob store connected (BLOB_STORE_ID is unset). Run \`vercel env pull\` to test storage locally.`,
      );
      return false;
    }
    // On a deployment this means every record is being lost — make it loud
    const error = new Error("No Blob store is connected to this deployment; form submission records are not being stored");
    console.error(`[form-record] ${error.message} (${submission.submissionId})`);
    Sentry.captureException(error, sentryScope(submission));
    return false;
  }

  const record = {
    submissionId: submission.submissionId,
    form: submission.form,
    environment: environment(),
    fields,
    security: submission.meta,
    emails,
  };

  try {
    await put(recordPath(submission), JSON.stringify(record, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    return true;
  } catch (error) {
    console.error(`[form-record] Failed to store submission ${submission.submissionId}:`, error);
    Sentry.captureException(error, sentryScope(submission));
    return false;
  }
}

/**
 * Writes the request's single structured log line: metadata only, never the
 * form's contents. Only the first call per submission logs.
 */
export function logSubmission(
  submission: Submission,
  outcome: SubmissionOutcome,
  details: { stored?: boolean; emails?: SubmissionEmails; messageLength?: number } = {},
): void {
  if (logged.has(submission)) return;
  logged.add(submission);

  const { meta } = submission;
  console.info(
    JSON.stringify({
      event: "form_submission",
      form: submission.form,
      submissionId: submission.submissionId,
      outcome,
      receivedAt: meta.receivedAt,
      ip: meta.ip,
      country: meta.location.country,
      region: meta.location.countryRegion,
      city: meta.location.city,
      requestId: meta.vercel.requestId,
      userAgent: meta.client.userAgent,
      ...details,
    }),
  );
}

/**
 * Stores and logs a submission that passed validation. Call it from a
 * `finally` around the email sends, so a record is kept even when an email
 * fails. Never throws.
 */
export async function finishSubmission(
  submission: Submission,
  outcome: "accepted" | "error",
  { fields, emails, messageLength }: { fields: object; emails: SubmissionEmails; messageLength?: number },
): Promise<void> {
  const stored = await storeSubmission(submission, fields, emails);
  logSubmission(submission, outcome, { stored, emails, messageLength });
}

/** Reports an unexpected route error to Sentry with the security record, and logs it. */
export function reportSubmissionError(submission: Submission, error: unknown): void {
  Sentry.captureException(error, sentryScope(submission));
  logSubmission(submission, "error");
}
