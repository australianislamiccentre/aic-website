/**
 * Signed "Request details" Links for Form Submissions
 *
 * Staff notification emails carry a reference and a "Request details" link
 * instead of the sender's IP and browser details. The link opens a page with a
 * single button that emails the full stored record to a fixed list of people.
 *
 * Each link names its record's Blob pathname and carries an HMAC-SHA256
 * signature of it (secret: `SUBMISSION_LINK_SECRET`), so nobody can build a
 * link for another submission. Without the secret no links are made and none
 * are accepted.
 *
 * The recipients are hardcoded on purpose, not editable in Sanity: anyone who
 * could change them could redirect submitters' IP addresses to themselves.
 * Change them here, in a reviewed commit.
 *
 * @module lib/submission-link
 * @see src/app/submission-details/ — the page the link opens
 * @see src/app/api/submission-details/route.ts — sends the details
 */
import { createHmac } from "node:crypto";
import { safeEqual } from "@/lib/timing-safe";

/** Who receives the full details of a submission when someone requests them. */
export const SUBMISSION_DETAILS_RECIPIENTS = [
  "taher@australianislamiccentre.org",
  "developer@australianislamiccentre.org",
];

/** `{environment}/{form}/{UTC date}/{UTC time}_{submissionId}.json` — see `lib/submission-record`. */
const RECORD_PATH =
  /^(production|preview|development)\/(contact|event-inquiry|service-inquiry|subscribe)\/\d{4}-\d{2}-\d{2}\/[0-9TZ-]+_[0-9a-f-]{36}\.json$/;

/** True for a path a submission record could be stored under — nothing else is ever signed or read. */
export function isRecordPath(value: unknown): value is string {
  return typeof value === "string" && RECORD_PATH.test(value);
}

function secret(): string | undefined {
  return process.env.SUBMISSION_LINK_SECRET?.trim() || undefined;
}

/** Signs a record path, or returns null when the secret isn't set or the path isn't a record path. */
export function signRecordPath(pathname: string): string | null {
  const key = secret();
  if (!key || !isRecordPath(pathname)) return null;
  return createHmac("sha256", key).update(pathname).digest("base64url");
}

/** True only when `signature` is this site's signature for `pathname`. */
export function verifyRecordPath(pathname: unknown, signature: unknown): pathname is string {
  if (!isRecordPath(pathname) || typeof signature !== "string") return false;
  return safeEqual(signRecordPath(pathname), signature);
}

/** The "Request details" link for a record, or null when links can't be signed. */
export function submissionDetailsUrl(origin: string, pathname: string): string | null {
  const signature = signRecordPath(pathname);
  if (!signature) return null;

  const url = new URL("/submission-details", origin);
  url.searchParams.set("record", pathname);
  url.searchParams.set("sig", signature);
  return url.toString();
}
