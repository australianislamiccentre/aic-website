/**
 * Draft Mode Toggle — Enable Preview of Unpublished Content
 *
 * Two entry points:
 * - **GET** `/api/draft?secret=xxx&slug=/events` — Direct URL with secret (e.g. bookmark).
 *   Validates the secret, enables draft mode, then redirects to the target page.
 * - **POST** — Used by the Sanity Presentation tool (iframe). Validates same-origin
 *   via `Origin`/`Referer` headers, enables draft mode, returns JSON.
 *
 * Security: GET requires `SANITY_PREVIEW_SECRET`; POST requires same-origin.
 * Slug is validated as a relative path to prevent open-redirect attacks.
 *
 * @route GET  /api/draft?secret=xxx&slug=/events
 * @route POST /api/draft
 * @module api/draft
 * @see src/app/api/disable-draft/route.ts — disables draft mode
 * @see src/app/api/preview-url/route.ts   — generates draft URLs for Sanity Studio
 */
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler — enables draft mode via secret query parameter.
 * After enabling, redirects to the requested slug.
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug = request.nextUrl.searchParams.get("slug") || "/";

  // Validate the secret
  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  // Validate slug is a relative path only (prevent open redirect attacks)
  if (!slug.startsWith("/") || slug.startsWith("//") || slug.includes("://")) {
    return new Response("Invalid redirect path", { status: 400 });
  }

  // Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the path
  redirect(slug);
}

/**
 * POST handler — enables draft mode for the Sanity Presentation tool.
 * The Presentation tool embeds the site in an iframe and sends a POST
 * request from the same origin. Validates origin to prevent CSRF.
 */
export async function POST(request: NextRequest) {
  // Verify the request is from our Sanity Studio (same origin)
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Allow requests from the same domain or from Sanity Studio
  // Uses exact origin match (not startsWith) to prevent subdomain spoofing
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    "https://aic-website.vercel.app",
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  // Prefer origin header; only fall back to referer origin if origin is absent
  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      // Invalid referer — leave as null
    }
  }

  const isAllowedOrigin = requestOrigin
    ? allowedOrigins.includes(requestOrigin)
    : false;

  if (!isAllowedOrigin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  return NextResponse.json({ enabled: true });
}
