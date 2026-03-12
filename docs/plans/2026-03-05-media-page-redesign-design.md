# Media Page Redesign — Design

## Goal

Redesign `/media` so YouTube videos are the primary content with an embedded on-site player, and the photo gallery shows all Sanity images in a masonry layout without category filters.

## Current Problems

- Videos link out to YouTube instead of playing on-site
- Uniform square grid for photos looks flat
- Six hardcoded category filters are overkill for the current content
- Page title "Media Gallery" undersells the video content
- No visual hierarchy between videos and photos

## Design

### Page Structure

Single-page, two-section layout (no tabs):

1. **Videos section** (top, primary) — featured player + thumbnail strip
2. **Photo gallery** (below, secondary) — masonry grid, no filters

### Video Section

**Featured player:**
- Large embedded YouTube iframe, 16:9 aspect ratio, max-width ~900px centered
- Most recent video auto-loads (not auto-playing)
- Video title and publish date displayed below the player
- "View on YouTube" text link below metadata

**Thumbnail strip:**
- Horizontal scrollable row of video thumbnails below the featured player
- Active video highlighted with a teal ring/border
- Clicking a thumbnail swaps it into the featured player (updates iframe src)
- Shows video title below each thumbnail, truncated to 2 lines

**Responsive:**
- Mobile: player goes full-width, thumbnail strip scrolls horizontally
- Tablet: 2-up thumbnail grid or horizontal scroll
- Desktop: horizontal strip showing 4-5 thumbnails

### Photo Gallery Section

**Layout:**
- Show ALL photos from Sanity — no category filters, no filter buttons
- CSS columns masonry layout with natural image heights (not uniform squares)
- 2 columns mobile, 3 columns tablet, 4 columns desktop
- Gap between images: 16px

**Hover state:**
- Gradient overlay from bottom
- Caption text (from Sanity `caption` field)
- Category label as a small badge

**Lightbox:**
- Keep existing lightbox with prev/next navigation and keyboard support
- Show caption, category, and alt text in the info panel
- Keep thumbnail strip at bottom for quick navigation

**Empty state:**
- If no photos in Sanity, show a "No Photos Available" message with camera icon
- If no videos from YouTube API, hide the entire video section

### Data Flow

No changes to Sanity schema or fetch layer needed. Videos come from `getYouTubeVideos()`, photos from `getGalleryImages()`. Both already fetched in parallel in `page.tsx`.

### What Changes

| File | Change |
|------|--------|
| `src/app/media/MediaContent.tsx` | Full rewrite of client component |
| `src/app/media/page.tsx` | No changes needed |
| `src/lib/youtube.ts` | No changes needed |

### What Stays

- Server/client component split pattern
- Sanity gallery schema and queries
- YouTube API integration
- Lightbox keyboard navigation
- FadeIn animations
