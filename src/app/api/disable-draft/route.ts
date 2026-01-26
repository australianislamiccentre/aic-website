import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// Disable draft mode
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const slug = request.nextUrl.searchParams.get("slug") || "/";
  redirect(slug);
}
