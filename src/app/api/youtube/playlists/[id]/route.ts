/**
 * YouTube Playlist Videos API Route
 *
 * Fetches videos for a specific YouTube playlist via the YouTube Data API.
 * Results are cached for 1 hour (s-maxage) with 30-minute stale-while-revalidate.
 *
 * @route GET /api/youtube/playlists/[id]
 * @module api/youtube/playlists/[id]
 * @see src/lib/youtube.ts — getPlaylistVideos()
 */
import { NextResponse } from "next/server";
import { getPlaylistVideos } from "@/lib/youtube";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Playlist ID is required" },
      { status: 400 }
    );
  }

  try {
    const videos = await getPlaylistVideos(id);
    return NextResponse.json(videos, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Failed to fetch playlist videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist videos" },
      { status: 500 }
    );
  }
}
