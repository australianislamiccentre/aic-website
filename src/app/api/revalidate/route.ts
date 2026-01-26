import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Secret token to secure the webhook - set this in your environment variables
const REVALIDATION_SECRET = process.env.SANITY_REVALIDATE_SECRET;

// Map Sanity document types to the paths that need revalidation
const documentTypeToPath: Record<string, string[]> = {
  event: ["/events", "/"],
  announcement: ["/announcements", "/"],
  program: ["/programs", "/"],
  service: ["/services"],
  donationCause: ["/donate"],
  galleryImage: ["/media", "/"],
  testimonial: ["/"],
  faq: ["/resources"],
  etiquette: ["/visit"],
  tourType: ["/visit"],
};

export async function POST(request: NextRequest) {
  try {
    // Verify the secret token
    const secret = request.nextUrl.searchParams.get("secret");

    if (!REVALIDATION_SECRET) {
      console.warn("SANITY_REVALIDATE_SECRET is not set");
      // In development, allow without secret
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { message: "Revalidation secret not configured" },
          { status: 500 }
        );
      }
    } else if (secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: "Invalid secret" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Sanity webhook payload contains _type
    const documentType = body._type as string;

    if (!documentType) {
      return NextResponse.json(
        { message: "No document type provided" },
        { status: 400 }
      );
    }

    // Get paths to revalidate for this document type
    const pathsToRevalidate = documentTypeToPath[documentType] || [];

    // Revalidate each path
    for (const path of pathsToRevalidate) {
      revalidatePath(path);
      console.log(`Revalidated: ${path}`);
    }

    return NextResponse.json({
      revalidated: true,
      paths: pathsToRevalidate,
      documentType,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating", error: String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path");

  if (REVALIDATION_SECRET && secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  }

  // Revalidate all content paths
  const allPaths = ["/", "/events", "/announcements", "/programs", "/services", "/donate", "/visit", "/resources", "/media"];
  for (const p of allPaths) {
    revalidatePath(p);
  }

  return NextResponse.json({ revalidated: true, paths: allPaths });
}
