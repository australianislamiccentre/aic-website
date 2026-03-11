/**
 * YouTube Streams API Route
 *
 * Fetches completed live streams (past broadcasts) from the AIC YouTube channel.
 * Results are cached for 1 hour (s-maxage) with 30-minute stale-while-revalidate.
 *
 * @route GET /api/youtube/streams
 * @module api/youtube/streams
 * @see src/lib/youtube.ts — getYouTubeStreams()
 */
import { NextResponse } from "next/server";
import { getYouTubeStreams } from "@/lib/youtube";

export async function GET() {
  try {
    const streams = await getYouTubeStreams();
    return NextResponse.json(streams, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Failed to fetch YouTube streams:", error);
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 }
    );
  }
}
