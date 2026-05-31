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

  // Validate the ID format before using it — blocks query-parameter injection
  // into the outbound YouTube API request (issue #74). YouTube playlist IDs are
  // URL-safe tokens (letters, digits, '-', '_'); reject anything containing
  // &, ?, =, or whitespace that could tamper with the outbound request.
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid playlist ID" },
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
