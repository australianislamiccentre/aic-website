# Media Page: Video List, Live Indicator & Social Links

**Date:** 2026-03-05
**Status:** Approved
**Branch:** feature/media-redesign

## Overview

Three additions to the media page redesign:
1. Replace the horizontal thumbnail strip with a vertical video list
2. Add a live stream indicator (site-wide banner + media page player)
3. Add social links to the media page

## 1. Video List (replaces thumbnail strip)

### Layout
- Vertical list below the featured player, within the same max-w-[900px] container
- Each row: small thumbnail (~120px wide, 16:9), title, formatted date
- Clicking any video loads it into the featured player iframe
- Active video highlighted with teal (#01476b) left border

### Show More / Channel Link
- Initially display 4 videos
- "Show More" button reveals the remaining 4 (8 total from API)
- After all 8 visible: "View all videos on YouTube" link to the channel URL

### Responsive
- Desktop: thumbnail + title/date side by side
- Mobile (<640px): same layout, thumbnail scales down, title truncates to 2 lines
- Featured player goes full-width on mobile (remove max-width constraint)

### No backend changes
- Keeps existing `getYouTubeVideos(8)` call

## 2. Live Stream Indicator

### Site-wide Banner
- Slim banner at the very top of the page, above the header
- Pulsing red dot + "We're Live" text + link to the YouTube live stream
- Shows on ALL pages when a live stream is active
- Hidden when no live stream

### Media Page Integration
- "LIVE NOW" badge on the featured player area
- When live, the featured player loads the live stream embed instead of the latest video
- Live stream takes priority over the regular video list

### Backend
- New `getYouTubeLiveStream()` function in `src/lib/youtube.ts`
- Uses YouTube Data API v3 search endpoint with `eventType=live` and `channelId`
- Returns `{ isLive: boolean; videoId?: string; title?: string; url?: string }` or similar
- Cached with short revalidation (~60s) via `next: { revalidate: 60 }`
- Returns `{ isLive: false }` if API key is missing or API fails

### Data Flow
- `page.tsx` (server component) fetches live status alongside videos and gallery images
- Live data passed to `MediaContent` for player swap
- For site-wide banner: live data passed from root layout or fetched in a shared component
- Layout-level component renders the banner conditionally

### New Type
```typescript
export interface YouTubeLiveStream {
  isLive: boolean;
  videoId?: string;
  title?: string;
  url?: string;
}
```

## 3. Social Links

### Placement
- Displayed between the video section and the photo gallery
- "Follow us" label + row of icon links (Facebook, Instagram, YouTube)

### Data Source
- Uses `useSiteSettings()` from `SiteSettingsContext`
- Social URLs already available: `socialMedia.facebook`, `socialMedia.instagram`, `socialMedia.youtube`
- Icons from lucide-react (Facebook, Instagram, Youtube) — already used in Footer

### Behaviour
- Links open in new tab with `target="_blank" rel="noopener noreferrer"`
- Simple hover effect (opacity or colour shift)

## Files to Change

| File | Change |
|------|--------|
| `src/lib/youtube.ts` | Add `getYouTubeLiveStream()`, add `YouTubeLiveStream` type |
| `src/app/media/page.tsx` | Fetch live stream status, pass to MediaContent |
| `src/app/media/MediaContent.tsx` | Replace thumbnail strip with video list, add live player swap, add social links |
| `src/app/media/MediaContent.test.tsx` | Update tests for new video list, live indicator, social links |
| `src/app/layout.tsx` or new component | Add site-wide live banner |
| `src/components/LiveBanner.tsx` (new) | Site-wide live stream banner component |
| `src/components/LiveBanner.test.tsx` (new) | Tests for live banner |

## API Quota Impact

- `getYouTubeLiveStream()` uses the search endpoint: 100 quota units per call
- Called on every page load but cached for 60s, so effective rate is ~1 call/minute
- Well within YouTube's default 10,000 units/day quota
