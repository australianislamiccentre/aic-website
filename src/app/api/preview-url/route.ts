/**
 * Preview URL Resolver
 *
 * Maps a Sanity document type (and optional slug) to its preview URL.
 * Used by the Sanity Studio "Open preview" button — Studio POSTs the
 * document type and slug, and this endpoint returns a full draft-mode URL.
 *
 * @route POST /api/preview-url
 * @module api/preview-url
 * @see src/app/api/draft/route.ts — the draft URL this endpoint redirects through
 */
import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aic-website.vercel.app";
const previewSecret = process.env.SANITY_PREVIEW_SECRET || "";

/**
 * Maps each Sanity document type to the frontend path where it's displayed.
 * Documents with individual detail pages (events) include the slug in the path.
 */
const previewUrlMap: Record<string, (slug?: string) => string> = {
  event: (slug) => `/events${slug ? `/${slug}` : ""}`,
  service: () => "/services",
  announcement: () => "/announcements",
  donationCause: () => "/donate",
  galleryImage: () => "/media",
  testimonial: () => "/",
  faq: () => "/visit",
  etiquette: () => "/visit",
  tourType: () => "/visit",
  siteSettings: () => "/",
  prayerSettings: () => "/worshippers",
  teamMember: () => "/about",
  pageContent: () => "/",
  resource: () => "/resources",
};

/**
 * Resolves a preview URL from `{ documentType, slug }`.
 * Returns `{ url }` pointing to `/api/draft?secret=xxx&slug=/path`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, slug } = body;

    if (!documentType || typeof documentType !== "string") {
      return NextResponse.json({ error: "Missing documentType" }, { status: 400 });
    }

    const urlMapper = previewUrlMap[documentType];
    if (!urlMapper) {
      return NextResponse.json({ error: "Unknown document type" }, { status: 400 });
    }

    const path = urlMapper(slug);

    const previewUrl = new URL("/api/draft", baseUrl);
    previewUrl.searchParams.set("secret", previewSecret);
    previewUrl.searchParams.set("slug", path);

    return NextResponse.json({ url: previewUrl.toString() });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
