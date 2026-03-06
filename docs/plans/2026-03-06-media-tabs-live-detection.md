# Media Tabs, Autoplay & Live Detection — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add tabbed video layout (Latest Videos, Playlists, Friday Khutbas), autoplay with scroll-to-player, client-side live stream polling, and fix the live-stream-locks-player bug.

**Architecture:** Persistent shared video player at top of page. Three tabs below it swap content. New YouTube API functions for playlists. New `/api/youtube/live` and `/api/youtube/playlists/[id]` API routes. LiveBanner and MediaContent poll `/api/youtube/live` every 60s client-side.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, YouTube Data API v3, Vitest + Testing Library

**Design doc:** `docs/plans/2026-03-06-media-tabs-live-detection-design.md`

---

### Task 1: YouTube Playlist API Functions

Add `getYouTubePlaylists()` and `getPlaylistVideos()` to `src/lib/youtube.ts`.

**Files:**
- Modify: `src/lib/youtube.ts`

**Step 1: Add YouTubePlaylist type and getYouTubePlaylists function**

Add after the existing `getYouTubeVideos` function:

```typescript
/** A YouTube playlist with metadata. */
export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
}

/** Fetches all playlists from the AIC YouTube channel. Cached for 1 hour. */
export async function getYouTubePlaylists(): Promise<YouTubePlaylist[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlists?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,contentDetails&maxResults=50`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("YouTube Playlists API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return (data.items || []).map(
      (item: {
        id: string;
        snippet: { title: string; description: string; thumbnails: { high: { url: string } } };
        contentDetails: { itemCount: number };
      }) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        videoCount: item.contentDetails.itemCount,
      })
    );
  } catch (error) {
    console.error("Failed to fetch YouTube playlists:", error);
    return [];
  }
}
```

**Step 2: Add getPlaylistVideos function**

Add after `getYouTubePlaylists`:

```typescript
/** Fetches videos from a specific YouTube playlist. Cached for 1 hour. */
export async function getPlaylistVideos(playlistId: string, maxResults = 50): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=${maxResults}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("YouTube PlaylistItems API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return (data.items || [])
      .filter((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId)
      .map(
        (item: {
          snippet: {
            resourceId: { videoId: string };
            title: string;
            thumbnails: { high?: { url: string }; default: { url: string } };
            publishedAt: string;
          };
        }) => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        })
      );
  } catch (error) {
    console.error("Failed to fetch playlist videos:", error);
    return [];
  }
}
```

**Step 3: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/lib/youtube.ts
git commit -m "feat(youtube): add getYouTubePlaylists and getPlaylistVideos functions"
```

---

### Task 2: Live Stream API Route

Create `/api/youtube/live/route.ts` that calls `getYouTubeLiveStream()` with server-side caching.

**Files:**
- Create: `src/app/api/youtube/live/route.ts`

**Step 1: Create the API route**

```typescript
import { NextResponse } from "next/server";
import { getYouTubeLiveStream } from "@/lib/youtube";

// Cache the result in memory for 60 seconds
let cachedResult: { isLive: boolean; videoId?: string; title?: string; url?: string } = { isLive: false };
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
```

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/api/youtube/live/route.ts
git commit -m "feat(api): add /api/youtube/live route with 60s server-side cache"
```

---

### Task 3: Playlist Videos API Route

Create `/api/youtube/playlists/[id]/route.ts` for client-side lazy-loading of playlist videos.

**Files:**
- Create: `src/app/api/youtube/playlists/[id]/route.ts`

**Step 1: Create the API route**

```typescript
import { NextResponse } from "next/server";
import { getPlaylistVideos } from "@/lib/youtube";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to fetch playlist videos" }, { status: 500 });
  }
}
```

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/api/youtube/playlists/\[id\]/route.ts
git commit -m "feat(api): add /api/youtube/playlists/[id] route for playlist videos"
```

---

### Task 4: Update LiveBanner with Client-Side Polling

Modify `LiveBanner` to poll `/api/youtube/live` every 60 seconds after initial server render.

**Files:**
- Modify: `src/components/LiveBanner.tsx`
- Modify: `src/components/LiveBanner.test.tsx`

**Step 1: Update LiveBanner component**

Replace the entire file:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { YouTubeLiveStream } from "@/lib/youtube";

interface LiveBannerProps {
  liveStream: YouTubeLiveStream;
}

export function LiveBanner({ liveStream: initialLiveStream }: LiveBannerProps) {
  const [liveStream, setLiveStream] = useState(initialLiveStream);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/youtube/live");
        if (res.ok) {
          const data = await res.json();
          setLiveStream(data);
        }
      } catch {
        // Silently fail — keep last known state
      }
    };

    const interval = setInterval(poll, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!liveStream.isLive || !liveStream.url) return null;

  return (
    <div className="bg-red-600 text-white">
      <a
        href={liveStream.url}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-2.5 h-2.5 rounded-full bg-white shrink-0"
        />
        <span>
          We&apos;re Live{liveStream.title ? ` — ${liveStream.title}` : ""}
        </span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
      </a>
    </div>
  );
}
```

**Step 2: Update LiveBanner tests**

Add a test for polling behaviour. In `src/components/LiveBanner.test.tsx`, add after existing tests:

```typescript
it("polls /api/youtube/live and updates when stream starts", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({
      isLive: true,
      videoId: "live123",
      title: "Friday Khutbah",
      url: "https://www.youtube.com/watch?v=live123",
    }))
  );

  const { rerender } = render(
    <LiveBanner liveStream={{ isLive: false }} />
  );

  // Initially hidden
  expect(screen.queryByText(/live/i)).not.toBeInTheDocument();

  // Advance past the 60s interval
  await vi.advanceTimersByTimeAsync(61_000);

  // Re-render to pick up state change
  rerender(<LiveBanner liveStream={{ isLive: false }} />);

  // Should now show banner from polled data
  expect(fetchSpy).toHaveBeenCalledWith("/api/youtube/live");

  fetchSpy.mockRestore();
  vi.useRealTimers();
});
```

**Step 3: Run tests**

Run: `npx vitest run src/components/LiveBanner.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/LiveBanner.tsx src/components/LiveBanner.test.tsx
git commit -m "feat(LiveBanner): add client-side polling for live stream detection"
```

---

### Task 5: Update page.tsx to Fetch Playlists

Add `getYouTubePlaylists()` to the server-side data fetching in `src/app/media/page.tsx`.

**Files:**
- Modify: `src/app/media/page.tsx`

**Step 1: Update page.tsx**

```typescript
import { getMediaGallery } from "@/sanity/lib/fetch";
import { getYouTubeVideos, getYouTubeLiveStream, getYouTubePlaylists } from "@/lib/youtube";
import MediaContent from "./MediaContent";

export const metadata = {
  title: "Media Gallery | Australian Islamic Centre",
  description: "Photos and videos from the Australian Islamic Centre community.",
};

export default async function MediaPage() {
  const [mediaGalleryImages, youtubeVideos, liveStream, playlists] = await Promise.all([
    getMediaGallery(),
    getYouTubeVideos(),
    getYouTubeLiveStream(),
    getYouTubePlaylists(),
  ]);

  return (
    <MediaContent
      mediaGalleryImages={mediaGalleryImages}
      youtubeVideos={youtubeVideos}
      liveStream={liveStream}
      playlists={playlists}
    />
  );
}
```

**Step 2: Run type-check (will fail until Task 6 updates MediaContent props)**

This is expected — Task 6 adds the `playlists` prop to MediaContent.

**Step 3: Commit**

```bash
git add src/app/media/page.tsx
git commit -m "feat(media): fetch playlists server-side in page.tsx"
```

---

### Task 6: Rewrite MediaContent with Tabs, Autoplay, Scroll, and Live Bug Fix

This is the largest task. Rewrite `MediaContent.tsx` to add:
- Tab layout (Latest Videos, Playlists, Friday Khutbas)
- Autoplay on video click (`?autoplay=1`) + scroll player into view
- Live stream bug fix (remove `effectiveVideoId` override)
- Live stream polling (same pattern as LiveBanner)
- LIVE badge on video card (stays even when user clicks another video)
- Playlists accordion with lazy-loaded videos

**Files:**
- Modify: `src/app/media/MediaContent.tsx`

**Key changes:**

1. **Props**: Add `playlists?: YouTubePlaylist[]`
2. **State**: Add `activeTab`, `autoplay`, `liveStreamState`, `expandedPlaylist`, `playlistVideos`
3. **Player ref**: `useRef` for scroll-to-player
4. **Remove** the `effectiveVideoId` / `effectiveTitle` / `effectiveUrl` override logic
5. **Live stream as first video**: When live, prepend a synthetic video entry to the list with LIVE badge
6. **Tabs**: Three tab buttons below the player, content swaps based on `activeTab`
7. **Autoplay**: When clicking a video, set `autoplay=true` and call `playerRef.current.scrollIntoView({ behavior: 'smooth' })`
8. **Polling**: `useEffect` with `setInterval(60_000)` fetching `/api/youtube/live`
9. **Playlists tab**: Accordion list with chevron toggle. On expand, fetch `/api/youtube/playlists/[id]` and cache in state
10. **Friday Khutbas tab**: Filter playlists for title containing "khutba" (case-insensitive), display as flat video grid

The full implementation is complex — the subagent should:
- Keep existing photo gallery and lightbox code unchanged
- Keep existing social links section unchanged
- Import `YouTubePlaylist` from `@/lib/youtube`
- Add `useRef` for `playerRef` on the player container div
- Add `ChevronDown` to lucide-react imports

**Step 1: Implement all changes to MediaContent.tsx**

See design doc `docs/plans/2026-03-06-media-tabs-live-detection-design.md` for layout structure.

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/media/MediaContent.tsx
git commit -m "feat(media): add tabs, autoplay, scroll-to-player, and fix live stream lock"
```

---

### Task 7: Update MediaContent Tests

Update tests to cover new tab behaviour, autoplay, live stream bug fix, playlists, and Friday Khutbas.

**Files:**
- Modify: `src/app/media/MediaContent.test.tsx`

**New/updated tests needed:**

```typescript
// Tab tests
"renders three tab buttons"
"Latest Videos tab is selected by default"
"clicking Playlists tab switches content"
"clicking Friday Khutbas tab switches content"

// Autoplay + scroll tests
"clicking a video adds autoplay=1 to iframe src"
"clicking a video scrolls player into view" (mock scrollIntoView)

// Live stream bug fix tests
"user can click another video when live stream is active"
"LIVE badge stays on live video card when another video is playing"
"live stream appears as first video in Latest Videos"

// Playlists tab tests
"renders playlist accordion items"
"expanding a playlist fetches videos from API" (mock fetch)
"playlist shows video count"

// Friday Khutbas tab tests
"shows videos from khutba playlist"
"shows empty state when no khutba playlist found"

// Live polling tests
"polls /api/youtube/live every 60 seconds"
```

**Mock additions needed:**
- Mock `fetch` for `/api/youtube/live` and `/api/youtube/playlists/[id]` responses
- Mock `scrollIntoView` on elements
- Add `YouTubePlaylist` type to imports

**Step 1: Update all test mocks and add new test cases**

**Step 2: Run tests**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/app/media/MediaContent.test.tsx
git commit -m "test(media): add tests for tabs, autoplay, playlists, and live stream fix"
```

---

### Task 8: Update Test Setup Mock

Add `getYouTubePlaylists` and `getPlaylistVideos` to the global test setup mocks.

**Files:**
- Modify: `src/test/setup.tsx`

**Step 1: Add mocks**

In the `vi.mock("@/lib/youtube")` or equivalent section, add:

```typescript
getYouTubePlaylists: vi.fn().mockResolvedValue([]),
getPlaylistVideos: vi.fn().mockResolvedValue([]),
```

**Step 2: Run all tests**

Run: `npm run test:run`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/test/setup.tsx
git commit -m "test: add getYouTubePlaylists and getPlaylistVideos mocks to setup"
```

---

### Task 9: Final Validation

Run the full validation suite.

**Step 1: Type-check**

Run: `npm run type-check`
Expected: PASS with zero errors

**Step 2: Lint**

Run: `npm run lint`
Expected: No new warnings from our code

**Step 3: All tests**

Run: `npm run test:run`
Expected: ALL PASS

**Step 4: Push**

```bash
git push origin feature/media-redesign
```
