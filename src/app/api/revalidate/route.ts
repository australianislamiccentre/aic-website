import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Secret token to secure the webhook - set this in your environment variables
const REVALIDATION_SECRET = process.env.SANITY_REVALIDATE_SECRET;

// Valid document types that can trigger revalidation
const validDocumentTypes = new Set([
  "event",
  "announcement",
  "program",
  "service",
  "donationSettings",
  "donateModalSettings",
  "donationCampaign",
  "donationGoalMeter",
  "galleryImage",
  "testimonial",
  "faq",
  "etiquette",
  "tourType",
  "siteSettings",
  "prayerSettings",
  "teamMember",
  "pageContent",
  "resource",
]);

// Map Sanity document types to the paths that need revalidation
const documentTypeToPath: Record<string, string[]> = {
  event: ["/events", "/"],
  announcement: ["/announcements", "/"],
  program: ["/programs", "/"],
  service: ["/services"],
  donationSettings: ["/", "/donate"],
  donateModalSettings: ["/", "/donate"],
  donationCampaign: ["/", "/donate"],
  donationGoalMeter: ["/"],
  galleryImage: ["/media", "/"],
  testimonial: ["/"],
  faq: ["/resources"],
  etiquette: ["/visit"],
  tourType: ["/visit"],
  siteSettings: ["/"],
  prayerSettings: ["/", "/worshippers"],
  teamMember: ["/about", "/imams"],
  pageContent: ["/"],
  resource: ["/resources"],
};

export async function POST(request: NextRequest) {
  try {
    // Always require secret - no exceptions
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
    const pathsToRevalidate = documentTypeToPath[documentType] || [];

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

// Remove GET handler - state-changing operations should use POST only
export async function GET() {
  return NextResponse.json(
    { message: "Use POST method with valid secret" },
    { status: 405 }
  );
}
