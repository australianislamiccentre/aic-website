# Media Gallery Separation Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan from this design.

**Goal:** Separate media page photos from general website images in Sanity, with bulk upload support for media page photos and a compact preview UI.

## Sanity Schema Changes

### New: `mediaGallery` Singleton

- **Schema name:** `mediaGallery`
- **Studio title:** "Media Page Gallery"
- **Studio description:** "Photos displayed on the /media page. Upload multiple images at once."
- **Singleton:** Yes — registered like other singletons (`siteSettings`, `prayerSettings`, etc.)
- **Fields:**
  - `images` — array of objects, each containing:
    - `image` (required, type `image`, hotspot enabled)
    - `alt` (required, type `string`, description: "Describe the image for accessibility")
    - `caption` (optional, type `string`)
  - Drag-and-drop reordering within the array
  - First image in the array = hero/main image on the media page

### Existing: `galleryImage` — Rename Title Only

- **Schema `name` stays `galleryImage`** (no data migration)
- **Change `title`** from `"Gallery Image"` to `"Website Image"`
- **Update description** to: "Images used across the website (homepage gallery strip, etc.). Not for the media page."
- All existing fields unchanged (image, alt, caption, category, featured, order)
- All existing data untouched

## Media Page UI Change

Replace the current masonry grid (CSS columns with category overlays) with a compact album-preview layout:

- **Main image** — large, prominent, the first image from the `mediaGallery` array
- **3-4 smaller thumbnails** — displayed beside or below the main image
- **`+N` tile** — the last visible tile shows a count of remaining images (e.g., `+12`), styled as a semi-transparent overlay
- **Click behaviour:** clicking any thumbnail or the `+N` tile opens the existing lightbox to browse all images
- **Empty state:** if no images exist, show the current empty state (camera icon + message)

## Data Flow

```
mediaGallery singleton
  → mediaGalleryQuery (GROQ)
  → getMediaGallery() (fetch function)
  → page.tsx (server component fetches)
  → MediaContent.tsx (receives as prop, renders preview + lightbox)
```

### New GROQ Query

```groq
*[_id == "mediaGallery"][0] {
  images[] {
    image,
    alt,
    caption
  }
}
```

### New Fetch Function

`getMediaGallery()` in `src/sanity/lib/fetch.ts` — returns `{ images: MediaGalleryImage[] } | null`

### New Type

```typescript
export interface MediaGalleryImage {
  image: SanityImage;
  alt: string;
  caption?: string;
}
```

### Props Change in MediaContent

- Remove `galleryImages: SanityGalleryImage[]` prop
- Add `mediaGalleryImages: MediaGalleryImage[]` prop
- Update `page.tsx` to fetch from `getMediaGallery()` instead of `getGalleryImages()`

## What Stays the Same

- **Homepage `GalleryStripSection`** — continues using `getFeaturedGalleryImages()` from `galleryImage` documents
- **`getGalleryImages()` and `getFeaturedGalleryImages()`** — kept for homepage use
- **Lightbox component** inside MediaContent — reused for expanded view
- **All existing `galleryImage` data in Sanity** — untouched
- **Revalidation webhook** at `/api/revalidate` — add `"mediaGallery"` tag

## Sanity Studio Organisation

Clear separation in the Studio sidebar:
- "Media Page Gallery" — singleton, for /media page photos (bulk upload)
- "Website Images" — document list, for site-wide images (homepage strip, etc.)
