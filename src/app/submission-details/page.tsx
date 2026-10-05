/**
 * Request Submission Details Page
 *
 * Opened by the "Request details" link at the bottom of every staff
 * notification email. Shows one button that emails the submission's full
 * stored record (with the sender's IP, location and browser) to IT. Sending on
 * a button press, not on page load, stops email link scanners from triggering
 * it.
 *
 * Internal utility page: not in navigation or the sitemap, never indexed, and
 * deliberately not editable in Sanity. Only links carrying this site's
 * signature get the button.
 *
 * @module app/submission-details
 * @see src/lib/submission-link.ts — link signing
 * @see src/app/api/submission-details/route.ts — sends the details
 */
import type { Metadata } from "next";
import { pageTitle } from "@/lib/seo";
import { verifyRecordPath } from "@/lib/submission-link";
import SubmissionDetailsContent from "./SubmissionDetailsContent";

export const metadata: Metadata = {
  title: pageTitle(undefined, "Request submission details"),
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

export default async function SubmissionDetailsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const record = single(params.record);
  const sig = single(params.sig);
  const valid = verifyRecordPath(record, sig);
  const reference = valid ? (record?.match(/_([0-9a-f-]{36})\.json$/)?.[1] ?? null) : null;

  return <SubmissionDetailsContent record={record} sig={sig} reference={reference} valid={valid} />;
}
