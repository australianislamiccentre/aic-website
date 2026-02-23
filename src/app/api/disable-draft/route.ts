/**
 * Disable Draft Mode
 *
 * POST-only endpoint to exit Next.js draft mode. Called by the preview
 * banner's "Exit Preview" button. Validates same-origin to prevent CSRF.
 * GET is blocked — state-changing operations must use POST.
 *
 * @route POST /api/disable-draft
 * @module api/disable-draft
 * @see src/app/api/draft/route.ts     — enables draft mode
 * @see src/components/PreviewBanner.tsx — UI that calls this endpoint
 */
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Disables draft mode after verifying same-origin.
 * Checks `Origin` header against `Host` to prevent cross-site requests.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Allow if origin matches host, or if no origin (same-origin requests)
  if (origin && host && !origin.includes(host.split(":")[0])) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const draft = await draftMode();
  draft.disable();

  return NextResponse.json({ disabled: true });
}

/** GET is blocked — state-changing operations must use POST. */
export async function GET() {
  return NextResponse.json(
    { error: "Use POST method" },
    { status: 405 }
  );
}
