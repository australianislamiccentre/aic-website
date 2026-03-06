import { NextResponse } from "next/server";
import { getYouTubeLiveStream } from "@/lib/youtube";

// Cache the result in memory for 60 seconds
let cachedResult: {
  isLive: boolean;
  videoId?: string;
  title?: string;
  url?: string;
} = { isLive: false };
let lastFetchTime = 0;
const CACHE_DURATION = 60_000; // 60 seconds

export async function GET() {
  const now = Date.now();

  if (now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedResult);
  }

  try {
    const liveStream = await getYouTubeLiveStream();
    cachedResult = {
      isLive: liveStream.isLive,
      videoId: liveStream.videoId,
      title: liveStream.title,
      url: liveStream.url,
    };
    lastFetchTime = now;
    return NextResponse.json(cachedResult);
  } catch (error) {
    console.error("Failed to check live stream status:", error);
    return NextResponse.json({ isLive: false }, { status: 500 });
  }
}
