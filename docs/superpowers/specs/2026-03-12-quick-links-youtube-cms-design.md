# CMS-Managed Quick Links & YouTube Video

## Problem

The QuickAccessSection (quick links below the prayer strip) has hardcoded cards and links. The MediaHighlightSection has a hardcoded YouTube video ID. The admin needs full control over both.

## Solution

Add new fields to the `homepageSettings` Sanity singleton for quick links and the featured YouTube video. Reorder existing schema fields so they match the visual page order.

## Schema: `homepageSettings.ts`

Fields ordered to match page layout:

1. **Hero section** (existing: heroMode, heroVideoUrl, heroSlides, heroVideoOverlays)
2. **Quick Links section** (new)
3. **Featured YouTube Video** (new)
4. **Welcome Section** (existing, moved after new fields)
5. **CTA Banner** (existing)

### Quick Links Fields

```
quickLinksSection (object):
  enabled (boolean, default true)
  quickLinkCards (array of objects, name: "quickLinkCard"):
    title (string, required, max 50) — card heading, e.g. "For Worshippers"
    subtitle (string, max 80) — secondary text, e.g. "Prayer & Services"
    accentColor (string, dropdown, default "green"):
      green / sky / lime / amber / rose / purple / teal
    links (array of objects, name: "quickLink", min 1, max 6):
      label (string, required, max 40)
      linkType (radio: internal / external), default "internal"
      internalPage (string dropdown, shared internalPageOptions, hidden when linkType != "internal")
      url (url field, hidden when linkType != "external", validation: uri with allowRelative + http/https/mailto/tel)
    active (boolean, default true)
    preview: show "(Inactive) " prefix + title + subtitle
  bottomCtaText (string) — e.g. "Can't find what you're looking for?"
```

#### `enabled` behaviour

Follows the same pattern as `ctaBanner.enabled`:
- `enabled: false` → component returns `null`, section is hidden entirely
- `enabled: true` (or undefined/missing) → section renders using Sanity cards if available, otherwise hardcoded fallback

#### Fallback chain

1. `quickLinksSection.enabled` is false → return null (hide section)
2. `quickLinksSection.quickLinkCards` has active cards with links → render Sanity cards
3. Otherwise → render hardcoded `buildAccessCards()` defaults

#### Grid adaptation

Dynamic Tailwind classes based on active card count:
- 1 card: `sm:grid-cols-1 max-w-md mx-auto`
- 2 cards: `sm:grid-cols-2 max-w-3xl mx-auto`
- 3+ cards: `sm:grid-cols-3` (current layout)

Mobile stays accordion regardless of count.

#### Design decisions

- No icon picker for links. The component uses arrow icons for internal links and external-link icons for external links.
- The card header icon is derived from `accentColor` — each colour maps to a fixed icon in the component (green = Clock, sky = Compass, lime = Users, etc.). If no mapping exists, a generic Bookmark icon is used.
- `accentColor` is a constrained list of 7 named presets. The component maps each name to its Tailwind classes (bg, border, text) via a lookup object.
- Cards can contain 1-6 links each. Admin can add/remove entire cards freely.
- `bottomCtaText` defaults to "Can't find what you're looking for?". The link destination is always `/contact` (hardcoded). Only the text is editable.

#### Stega safety on `accentColor`

Production reads use the `client` with `stega: false`, so property lookups on `accentColor` work normally. In draft preview mode (stega enabled), string matching may break — the component should fall back to the default colour preset ("green") when no lookup match is found. This is acceptable since draft preview is for content review, not pixel-perfect styling.

### Featured YouTube Video Field

```
featuredYoutubeUrl (url) — full YouTube URL
```

Single URL field on `homepageSettings`. The component extracts the video ID via a shared utility (`src/lib/youtube.ts`) that supports `watch?v=`, `youtu.be/`, and `/embed/` formats. Falls back to the current hardcoded video ID `BckNzo1ufDw` when empty or unparseable.

## TypeScript Types: `types/sanity.ts`

Add to `SanityHomepageSettings`:

```ts
quickLinksSection?: {
  enabled?: boolean;
  quickLinkCards?: Array<{
    title: string;
    subtitle?: string;
    accentColor?: string;
    links?: Array<{
      label: string;
      linkType?: "internal" | "external";
      internalPage?: string;
      url?: string;
    }>;
    active?: boolean;
  }>;
  bottomCtaText?: string;
};
featuredYoutubeUrl?: string;
```

## GROQ Query

Add to `homepageSettingsQuery` with explicit nested projection:

```groq
quickLinksSection {
  enabled,
  quickLinkCards[] {
    title,
    subtitle,
    accentColor,
    links[] {
      label,
      linkType,
      internalPage,
      url
    },
    active
  },
  bottomCtaText
},
featuredYoutubeUrl
```

## Component Changes

### QuickAccessSection

- Accept `quickLinksSection` prop (typed from `SanityHomepageSettings["quickLinksSection"]`)
- Apply the fallback chain described above
- Map `accentColor` to Tailwind classes via lookup, fall back to "green" preset on miss
- Resolve link URLs: `linkType === "external"` → use `url`; otherwise → use `internalPage` (fall back to `url` for legacy compatibility)
- External links get `target="_blank"` with external-link icon; internal links get arrow icon
- No changes to the existing college link from `useSiteSettings()` — the hardcoded fallback cards still use it when Sanity data is absent

### MediaHighlightSection

- Accept `featuredYoutubeUrl` prop (optional string)
- Use `extractYoutubeVideoId()` from `src/lib/youtube.ts` to parse the URL
- Fall back to hardcoded `BckNzo1ufDw` if no URL or parsing fails

### page.tsx

- Pass `homepageSettings?.quickLinksSection` to `QuickAccessSection`
- Pass `homepageSettings?.featuredYoutubeUrl` to `MediaHighlightSection`

## New Files

### `src/lib/youtube.ts`

YouTube URL parsing utility:

```ts
export function extractYoutubeVideoId(url: string): string | null
```

Supports: `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID`. Returns null on failure.

### `src/lib/youtube.test.ts`

Unit tests for the parser (various URL formats, edge cases, invalid URLs).

### `src/components/sections/QuickAccessSection.test.tsx` (new file)

New test file following the existing section test patterns. Mocks: framer-motion, FadeIn, next/image, SiteSettingsContext.

## Tests

### QuickAccessSection tests (new file)
- Renders Sanity quick link cards when provided
- Falls back to hardcoded cards when no Sanity data
- Filters out inactive cards
- Falls back to defaults when all cards are inactive
- Renders correct number of cards
- Returns null when enabled is false
- Resolves internal page links
- Resolves external URL links
- Renders external link indicator for external links
- Renders custom bottom CTA text
- Falls back to default bottom CTA text

### MediaHighlightSection tests (add to existing file)
- Renders with custom YouTube URL
- Falls back to default video ID when URL is empty/missing

### YouTube utility tests (new file)
- Extracts video ID from watch URL format
- Extracts video ID from youtu.be format
- Extracts video ID from embed format
- Returns null for invalid URLs
- Returns null for empty string
- Handles URLs with extra query params

## Verification

After implementation:
1. `npm run validate` (type-check + lint + test + build)
2. Sanity Studio at /studio: verify homepageSettings fields appear in correct page order
3. Dev server: verify quick links render from Sanity data, fallback works when empty
4. Dev server: verify YouTube video plays with custom URL
