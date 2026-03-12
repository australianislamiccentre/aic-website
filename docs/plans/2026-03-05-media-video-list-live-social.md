# Media Page: Video List, Live Indicator & Social Links — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the thumbnail strip with a vertical video list (show 4, expand to 8), add a site-wide live stream banner + media page live indicator, and add social links between videos and photos.

**Architecture:** Three independent features layered onto the existing media page. The live banner is a new server-fetched component rendered in `layout.tsx`. The video list and social links are changes to `MediaContent.tsx`. A new `getYouTubeLiveStream()` function is added to `youtube.ts`.

**Tech Stack:** Next.js 16 (App Router), React 19, Framer Motion, Tailwind CSS 4, YouTube Data API v3, Vitest + Testing Library.

---

### Task 1: Add `getYouTubeLiveStream()` to youtube.ts

**Files:**
- Modify: `src/lib/youtube.ts`

**Step 1: Add the `YouTubeLiveStream` type and fetch function**

Add below the existing `getYouTubeVideos` function:

```typescript
/** Live stream status for the AIC YouTube channel. */
export interface YouTubeLiveStream {
  isLive: boolean;
  videoId?: string;
  title?: string;
  url?: string;
}

/** Checks if the AIC YouTube channel is currently live streaming. Cached for 60s. */
export async function getYouTubeLiveStream(): Promise<YouTubeLiveStream> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return { isLive: false };
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&eventType=live&type=video&maxResults=1`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      console.error("YouTube Live API error:", res.status, await res.text());
      return { isLive: false };
    }

    const data = await res.json();
    const items = data.items || [];

    if (items.length === 0) {
      return { isLive: false };
    }

    const item = items[0];
    return {
      isLive: true,
      videoId: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    };
  } catch (error) {
    console.error("Failed to check live stream:", error);
    return { isLive: false };
  }
}
```

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/lib/youtube.ts
git commit -m "feat(youtube): add getYouTubeLiveStream() function"
```

---

### Task 2: Create LiveBanner component

**Files:**
- Create: `src/components/LiveBanner.tsx`
- Create: `src/components/LiveBanner.test.tsx`

**Step 1: Write the failing test**

Create `src/components/LiveBanner.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { LiveBanner } from "./LiveBanner";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...rest}>{children}</div>
    ),
    span: ({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...rest}>{children}</span>
    ),
  },
}));

describe("LiveBanner", () => {
  it("renders nothing when not live", () => {
    const { container } = render(
      <LiveBanner liveStream={{ isLive: false }} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders banner when live", () => {
    render(
      <LiveBanner
        liveStream={{
          isLive: true,
          videoId: "abc123",
          title: "Friday Khutbah",
          url: "https://www.youtube.com/watch?v=abc123",
        }}
      />
    );

    expect(screen.getByText(/live/i)).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=abc123");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows the stream title", () => {
    render(
      <LiveBanner
        liveStream={{
          isLive: true,
          videoId: "abc123",
          title: "Friday Khutbah",
          url: "https://www.youtube.com/watch?v=abc123",
        }}
      />
    );

    expect(screen.getByText(/Friday Khutbah/)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/LiveBanner.test.tsx`
Expected: FAIL — module not found

**Step 3: Write the component**

Create `src/components/LiveBanner.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { YouTubeLiveStream } from "@/lib/youtube";

interface LiveBannerProps {
  liveStream: YouTubeLiveStream;
}

export function LiveBanner({ liveStream }: LiveBannerProps) {
  if (!liveStream.isLive || !liveStream.url) return null;

  return (
    <div className="bg-red-600 text-white">
      <a
        href={liveStream.url}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium hover:bg-red-700 transition-colors"
      >
        {/* Pulsing red dot */}
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

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/LiveBanner.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/LiveBanner.tsx src/components/LiveBanner.test.tsx
git commit -m "feat: add LiveBanner component for live stream indicator"
```

---

### Task 3: Wire LiveBanner into root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Import and fetch live stream in layout**

In `src/app/layout.tsx`, add the import at the top:

```typescript
import { getYouTubeLiveStream } from "@/lib/youtube";
import { LiveBanner } from "@/components/LiveBanner";
```

Add `getYouTubeLiveStream()` to the existing `Promise.all`:

```typescript
const [{ isEnabled: isDraftMode }, siteSettings, donationSettings, formSettingsRaw, liveStream] = await Promise.all([
  draftMode(),
  getSiteSettings(),
  getDonationSettings(),
  getFormSettings(),
  getYouTubeLiveStream(),
]);
```

Render `<LiveBanner>` just before `<HeaderB />`:

```tsx
<LiveBanner liveStream={liveStream} />
<HeaderB />
```

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire LiveBanner into root layout"
```

---

### Task 4: Replace thumbnail strip with video list in MediaContent

**Files:**
- Modify: `src/app/media/MediaContent.tsx`
- Modify: `src/app/media/MediaContent.test.tsx`

**Step 1: Update tests for the video list behaviour**

In `src/app/media/MediaContent.test.tsx`, replace the video section `describe` block. Key tests to add/change:

- Remove test: "renders thumbnail strip when multiple videos exist"
- Remove test: "does not render thumbnail strip for a single video"
- Remove test: "switches featured video when thumbnail is clicked"
- Add test: "shows first 4 videos in the list"
- Add test: "hides remaining videos behind Show More button"
- Add test: "Show More reveals all 8 videos"
- Add test: "clicking a video in the list loads it into the player"
- Add test: "shows View all videos on YouTube link after expanding"
- Add test: "active video is visually distinguished"

Also add a mock for `SiteSettingsContext` since we'll be using `useSiteSettings()` for social links:

```tsx
// Mock SiteSettingsContext
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/@aic",
    },
  }),
}));
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: FAIL — old tests reference thumbnail strip, new tests reference missing elements

**Step 3: Rewrite the video section in MediaContent.tsx**

Replace the thumbnail strip (`{/* Thumbnail Strip */}` block, lines 184-223) with:

1. Add state: `const [showAllVideos, setShowAllVideos] = useState(false);`
2. Remove: `thumbnailStripRef` (no longer needed)
3. Remove: `useRef` import if no other refs remain
4. Compute: `const visibleVideos = showAllVideos ? youtubeVideos : youtubeVideos.slice(0, 4);`
5. Compute: `const youtubeChannelUrl = useSiteSettings().socialMedia.youtube;`

Replace the thumbnail strip JSX with:

```tsx
{/* Video List */}
{youtubeVideos.length > 1 && (
  <div className="max-w-[900px] sm:mx-auto mt-6 space-y-2">
    {visibleVideos.map((video, index) => (
      <button
        key={video.id}
        onClick={() => setFeaturedVideoIndex(
          youtubeVideos.findIndex((v) => v.id === video.id)
        )}
        className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
          youtubeVideos[featuredVideoIndex]?.id === video.id
            ? "bg-[#01476b]/5 border-l-4 border-[#01476b]"
            : "hover:bg-gray-50"
        }`}
        aria-label={`Play ${video.title}`}
      >
        <div className="relative shrink-0 w-28 sm:w-32 aspect-video rounded-md overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="128px"
          />
          {youtubeVideos[featuredVideoIndex]?.id !== video.id && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-3 h-3 text-red-600 ml-0.5" />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {video.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(video.publishedAt)}
          </p>
        </div>
      </button>
    ))}

    {/* Show More / Channel Link */}
    <div className="flex items-center justify-center gap-4 pt-2">
      {!showAllVideos && youtubeVideos.length > 4 && (
        <button
          onClick={() => setShowAllVideos(true)}
          className="text-sm font-medium text-[#01476b] hover:text-[#01476b]/80 transition-colors"
        >
          Show More
        </button>
      )}
      {showAllVideos && (
        <a
          href={youtubeChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#01476b] hover:text-[#01476b]/80 transition-colors"
        >
          View all videos on YouTube
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  </div>
)}
```

Also update the featured player max-width for mobile responsiveness. Change:
```tsx
<div className="max-w-[900px] mx-auto">
```
to:
```tsx
<div className="sm:max-w-[900px] sm:mx-auto">
```

**Step 4: Run tests**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: PASS

**Step 5: Run type-check and lint**

Run: `npm run type-check && npm run lint`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app/media/MediaContent.tsx src/app/media/MediaContent.test.tsx
git commit -m "feat(media): replace thumbnail strip with video list + show more"
```

---

### Task 5: Add live stream indicator to MediaContent

**Files:**
- Modify: `src/app/media/page.tsx`
- Modify: `src/app/media/MediaContent.tsx`
- Modify: `src/app/media/MediaContent.test.tsx`

**Step 1: Add tests for live stream on media page**

Add to `MediaContent.test.tsx` inside the video section describe:

```tsx
it("shows LIVE NOW badge when live stream is active", () => {
  render(
    <MediaContent
      galleryImages={[]}
      youtubeVideos={[makeVideo()]}
      liveStream={{ isLive: true, videoId: "live1", title: "Live Khutbah", url: "https://youtube.com/watch?v=live1" }}
    />
  );

  expect(screen.getByText("LIVE")).toBeInTheDocument();
});

it("loads live stream into featured player when live", () => {
  render(
    <MediaContent
      galleryImages={[]}
      youtubeVideos={[makeVideo({ id: "regular1" })]}
      liveStream={{ isLive: true, videoId: "live1", title: "Live Khutbah", url: "https://youtube.com/watch?v=live1" }}
    />
  );

  expect(screen.getByTitle("Live Khutbah")).toBeInTheDocument();
});

it("does not show LIVE badge when not live", () => {
  render(
    <MediaContent
      galleryImages={[]}
      youtubeVideos={[makeVideo()]}
      liveStream={{ isLive: false }}
    />
  );

  expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: FAIL — `liveStream` prop not accepted

**Step 3: Add `liveStream` prop to MediaContent**

In `MediaContent.tsx`, update the props interface:

```typescript
import type { YouTubeVideo, YouTubeLiveStream } from "@/lib/youtube";

interface MediaContentProps {
  galleryImages: SanityGalleryImage[];
  youtubeVideos?: YouTubeVideo[];
  liveStream?: YouTubeLiveStream;
}
```

Add destructuring: `liveStream` from props.

Compute the effective featured video — if live, override:

```typescript
const isLive = liveStream?.isLive && liveStream.videoId;

// When live, the featured player shows the live stream
const effectiveVideoId = isLive ? liveStream.videoId! : featuredVideo?.id;
const effectiveTitle = isLive ? liveStream.title || "Live Stream" : featuredVideo?.title;
const effectiveUrl = isLive ? liveStream.url : featuredVideo?.url;
```

Update the iframe `src` and info section to use `effectiveVideoId`, `effectiveTitle`, `effectiveUrl`.

Add a LIVE badge above or on the player when live:

```tsx
{isLive && (
  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
    LIVE
  </div>
)}
```

**Step 4: Update page.tsx to fetch live stream**

In `src/app/media/page.tsx`:

```typescript
import { getYouTubeVideos, getYouTubeLiveStream } from "@/lib/youtube";

export default async function MediaPage() {
  const [galleryImages, youtubeVideos, liveStream] = await Promise.all([
    getGalleryImages() as Promise<SanityGalleryImage[]>,
    getYouTubeVideos(),
    getYouTubeLiveStream(),
  ]);

  return (
    <MediaContent
      galleryImages={galleryImages}
      youtubeVideos={youtubeVideos}
      liveStream={liveStream}
    />
  );
}
```

**Step 5: Run tests**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app/media/page.tsx src/app/media/MediaContent.tsx src/app/media/MediaContent.test.tsx
git commit -m "feat(media): add live stream indicator to featured player"
```

---

### Task 6: Add social links section to MediaContent

**Files:**
- Modify: `src/app/media/MediaContent.tsx`
- Modify: `src/app/media/MediaContent.test.tsx`

**Step 1: Add tests for social links**

Add a new describe block in `MediaContent.test.tsx`:

```tsx
describe("social links", () => {
  it("renders social media icons with correct links", () => {
    render(
      <MediaContent
        galleryImages={[makeImage()]}
        youtubeVideos={[makeVideo()]}
      />
    );

    const fbLink = screen.getByLabelText("Follow us on Facebook");
    expect(fbLink).toHaveAttribute("href", "https://facebook.com/aic");
    expect(fbLink).toHaveAttribute("target", "_blank");

    const igLink = screen.getByLabelText("Follow us on Instagram");
    expect(igLink).toHaveAttribute("href", "https://instagram.com/aic");

    const ytLink = screen.getByLabelText("Follow us on YouTube");
    expect(ytLink).toHaveAttribute("href", "https://youtube.com/@aic");
  });

  it("renders Follow us heading", () => {
    render(
      <MediaContent
        galleryImages={[makeImage()]}
        youtubeVideos={[makeVideo()]}
      />
    );

    expect(screen.getByText("Follow Us")).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: FAIL

**Step 3: Add social links section to MediaContent.tsx**

Add import:

```typescript
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Facebook, Instagram, Youtube } from "lucide-react";
```

Note: `Youtube` may already be available or may need `Play` replaced. Use the lucide-react `Youtube`, `Facebook`, `Instagram` icons.

Add between the video section `</section>` and the photo gallery `<section>`:

```tsx
{/* ── Social Links ── */}
<section className="py-8 bg-white border-t border-gray-100">
  <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
    <span className="text-sm font-medium text-gray-600">Follow Us</span>
    <div className="flex items-center gap-4">
      {socialMedia.facebook && (
        <a
          href={socialMedia.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#01476b] hover:text-white transition-colors"
          aria-label="Follow us on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>
      )}
      {socialMedia.instagram && (
        <a
          href={socialMedia.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#01476b] hover:text-white transition-colors"
          aria-label="Follow us on Instagram"
        >
          <Instagram className="w-5 h-5" />
        </a>
      )}
      {socialMedia.youtube && (
        <a
          href={socialMedia.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#01476b] hover:text-white transition-colors"
          aria-label="Follow us on YouTube"
        >
          <Youtube className="w-5 h-5" />
        </a>
      )}
    </div>
  </div>
</section>
```

Get social media at the top of the component:

```typescript
const { socialMedia } = useSiteSettings();
```

**Step 4: Run tests**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/media/MediaContent.tsx src/app/media/MediaContent.test.tsx
git commit -m "feat(media): add social links section between videos and photos"
```

---

### Task 7: Final validation

**Files:** None (validation only)

**Step 1: Run full type-check**

Run: `npm run type-check`
Expected: PASS with zero errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: Zero new warnings

**Step 3: Run all tests**

Run: `npm run test:run`
Expected: All MediaContent and LiveBanner tests pass. Pre-existing Sanity schema failures are unrelated.

**Step 4: Manual verification**

- Check `/media` at 375px, 768px, 1024px widths
- Verify video list shows 4 items, expands to 8 on Show More
- Verify clicking a video list item loads it in the player
- Verify social links appear between videos and photos
- Verify live banner is hidden when not live (expected in dev since channel is unlikely live)

**Step 5: Commit any fixes and final commit**

```bash
git add -A
git commit -m "chore: final validation fixes for media page redesign"
```
