import { NextResponse } from "next/server";
import { getYouTubeLiveStream } from "@/lib/youtube";

// In-memory cache to minimise YouTube API quota usage
let cachedResult: {
  isLive: boolean;
  videoId?: string;
  title?: string;
  url?: string;
} = { isLive: false };
let lastFetchTime = 0;

/** Cache for 60s during Friday Khutbah (12pm–3pm Melbourne), 5 min otherwise. */
const FRIDAY_CACHE_MS = 60_000;
const DEFAULT_CACHE_MS = 300_000;

function isFridayPrayerWindow(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Australia/Melbourne",
    weekday: "long",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  return weekday === "Friday" && hour >= 12 && hour < 15;
}

export async function GET() {
  const now = Date.now();
  const cacheDuration = isFridayPrayerWindow() ? FRIDAY_CACHE_MS : DEFAULT_CACHE_MS;

  if (now - lastFetchTime < cacheDuration) {
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
