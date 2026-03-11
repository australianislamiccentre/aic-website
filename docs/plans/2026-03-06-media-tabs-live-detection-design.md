# Media Page Redesign — Tabs, Autoplay & Live Detection

**Date**: 2026-03-06
**Branch**: `feature/media-redesign`

## Overview

Three changes to the media page: tab-based video layout, autoplay with scroll-to-player, and client-side live stream polling. Plus a bug fix for the live stream locking the player.

## 1. Page Layout

```
┌──────────────────────────────────────────────┐
│  Page Header / Breadcrumb                    │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │         Video Player (iframe)          │  │
│  └────────────────────────────────────────┘  │
│  Video Title • Date • "View on YouTube"      │
├──────────────────────────────────────────────┤
│  [ Latest Videos* ]  [ Playlists ]  [ Friday Khutbas ]  │
├──────────────────────────────────────────────┤
│  (Tab content renders here)                  │
├──────────────────────────────────────────────┤
│  Social Links                                │
├──────────────────────────────────────────────┤
│  Photo Gallery (album preview — unchanged)   │
└──────────────────────────────────────────────┘
```

One persistent `<iframe>` player at the top, shared across all tabs. Clicking any video from any tab:
- Updates the player with `?autoplay=1`
- Scrolls the player into view via `scrollIntoView({ behavior: 'smooth' })`

## 2. Tab: Latest Videos (default)

Current video grid layout. 4 videos visible initially, "Show More" expands to all. When a live stream is active, the live video appears as the first card with a red "LIVE" badge. The badge stays on the card regardless of which video is playing in the player.

## 3. Tab: Playlists

Fetched from YouTube Playlists API via new functions.

**Display**: Compact accordion list. Each row shows playlist title, video count, and chevron. Click to expand reveals a video grid. Playlist videos are fetched client-side on expand (lazy load via `/api/youtube/playlists/[id]`).

## 4. Tab: Friday Khutbas

Filters for a playlist matching "Friday Khutba" (or similar) from the API results. Displays as a flat video grid (no accordion — single playlist). Empty state if no matching playlist found.

## 5. Live Stream Detection — Client-Side Polling

### API Route
New `/api/youtube/live/route.ts` that calls `getYouTubeLiveStream()` and caches the result server-side for 60 seconds.

### LiveBanner Update
- Accepts initial `liveStream` prop from server (first render unchanged)
- Starts polling `/api/youtube/live` every 60 seconds via `useEffect` + `setInterval`
- Updates state with each response
- Server-side cache ensures YouTube API is hit at most once per 60 seconds regardless of concurrent users

### MediaContent Update
- Same polling pattern — checks `/api/youtube/live` every 60 seconds
- Updates LIVE badge on video card and player availability in real-time

## 6. Bug Fix: Live Stream Locks Player

**Current bug**: `effectiveVideoId` is hardcoded to the live stream when `isLive` is true. Users cannot click away to other videos.

**Fix**: Remove the `effectiveVideoId` override. When live:
- Insert the live video as the first card in Latest Videos with a LIVE badge
- Auto-select it on page load (`featuredVideoIndex = 0`)
- Clicking any other video updates the player normally
- LIVE badge stays on the card until the stream ends — does not follow the player

## 7. New API Routes and YouTube Functions

```typescript
// src/lib/youtube.ts — new exports
getYouTubePlaylists(): Promise<YouTubePlaylist[]>
getPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]>

// src/app/api/youtube/live/route.ts
GET → { isLive, videoId, title, url }  // cached 60s server-side

// src/app/api/youtube/playlists/[id]/route.ts
GET → YouTubeVideo[]  // videos for a playlist, cached 1 hour
```

## What Stays the Same

- Photo gallery (album preview) — unchanged
- Social links section — unchanged
- LiveBanner in root layout — still rendered, now polls client-side
