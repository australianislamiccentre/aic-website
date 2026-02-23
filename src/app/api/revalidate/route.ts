/**
 * On-Demand ISR Revalidation Webhook
 *
 * Called by Sanity via a GROQ-powered webhook whenever a document is
 * published, updated, or deleted. Looks up which Next.js paths display
 * that document type and revalidates them so the site reflects changes
 * within seconds (instead of waiting for the 120s ISR fallback).
 *
 * Security: Requires a shared secret (`SANITY_REVALIDATE_SECRET`) passed
 * as a `?secret=` query parameter. GET is blocked (POST only).
 *
 * @route POST /api/revalidate?secret=xxx
 * @module api/revalidate
 * @see src/sanity/lib/fetch.ts — ISR caching with 120s revalidate fallback
 */
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/** Shared secret between Sanity webhook and this endpoint. */
const REVALIDATION_SECRET = process.env.SANITY_REVALIDATE_SECRET;

/** Only these Sanity document types are allowed to trigger revalidation. */
const validDocumentTypes = new Set([
  "event",
  "announcement",
  "service",
  "donationSettings",
  "donationCampaign",
  "donatePageSettings",
  "galleryImage",
  "faq",
  "etiquette",
  "tourType",
  "siteSettings",
  "prayerSettings",
  "formSettings",
  "teamMember",
  "pageContent",
  "resource",
]);

/**
 * Maps each Sanity document type to the Next.js pages that display it.
 * When a document is published, every listed path is revalidated.
 */
const documentTypeToPath: Record<string, string[]> = {
  event: ["/events", "/", "/worshippers"],
  announcement: ["/announcements", "/"],
  service: ["/services", "/worshippers"],
  donationSettings: ["/", "/donate"],
  donationCampaign: ["/", "/donate"],
  donatePageSettings: ["/", "/donate"],
  galleryImage: ["/media", "/"],
  faq: ["/resources", "/visit"],
  etiquette: ["/visit", "/worshippers"],
  tourType: ["/visit"],
  siteSettings: ["/"],
  prayerSettings: ["/", "/worshippers"],
  formSettings: ["/contact", "/services"],
  teamMember: ["/about", "/imams"],
  pageContent: ["/"],
  resource: ["/resources"],
};

/**
 * Handles Sanity webhook payloads. Validates the secret, resolves affected
 * paths from the document type (and slug if present), then calls
 * `revalidatePath()` on each.
 *
 * @returns `{ revalidated: true, paths, documentType }` on success.
 */
export async function POST(request: NextRequest) {
  try {
    // Always require secret — no exceptions
    const secret = request.nextUrl.searchParams.get("secret");

    if (!REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: "Revalidation secret not configured" },
        { status: 500 }
      );
    }

    if (secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: "Invalid secret" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Sanity webhook payload contains _type
    const documentType = body._type;

    // Validate document type
    if (!documentType || typeof documentType !== "string") {
      return NextResponse.json(
        { message: "No document type provided" },
        { status: 400 }
      );
    }

    // Only allow known document types
    if (!validDocumentTypes.has(documentType)) {
      return NextResponse.json(
        { message: "Unknown document type" },
        { status: 400 }
      );
    }

    // Get paths to revalidate for this document type
    const pathsToRevalidate = [...(documentTypeToPath[documentType] || [])];

    // Also revalidate the individual detail page if the document has a slug
    const slug = body.slug?.current;
    if (slug && typeof slug === "string") {
      const detailPathPrefix: Record<string, string> = {
        event: "/events",
        announcement: "/announcements",
        service: "/services",
        resource: "/resources",
        teamMember: "/about",
      };
      const prefix = detailPathPrefix[documentType];
      if (prefix) {
        pathsToRevalidate.push(`${prefix}/${slug}`);
      }
    }

    // Revalidate each path
    for (const path of pathsToRevalidate) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      paths: pathsToRevalidate,
      documentType,
    });
  } catch {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}

/** GET is blocked — state-changing operations must use POST. */
export async function GET() {
  return NextResponse.json(
    { message: "Use POST method with valid secret" },
    { status: 405 }
  );
}
