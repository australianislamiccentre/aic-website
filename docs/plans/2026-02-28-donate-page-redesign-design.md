# Donate Page Redesign — Design Document

**Date:** 2026-02-28
**Status:** Approved

## Problem

The current donate page has a fragile layout (absolute-positioned floating form), no trust-building content between the hero and campaigns, and a generic feel. The page jumps from hook to action with no narrative arc.

## Design Decision

Rethink the full page structure using a side-by-side hero layout inspired by industry-standard nonprofit donation pages (e.g. Yaqeen Institute). Form visible on landing, trust content below the fold.

## Page Flow

```
┌─────────────────────────────────────────────┐
│  Hero (warm bg, no image)                   │
│  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Badge            │  │ Fundraise Up    │  │
│  │ Heading          │  │ Form Embed      │  │
│  │ Description      │  │                 │  │
│  │ Quran ayah       │  │                 │  │
│  └──────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────┤
│  Impact Stats (3-4 numbers)     [optional]  │
├─────────────────────────────────────────────┤
│  Campaign Cards Grid            [optional]  │
└─────────────────────────────────────────────┘
```

## Section 1: Hero with Side-by-Side Form

- Warm gradient background (soft greens/teals), no hero image
- Two-column flexbox on desktop (lg+): left = text, right = Fundraise Up form embed
- Stacks vertically on mobile/tablet: text -> form
- Left column: badge pill ("Make a Difference"), heroHeading (Sanity), heroDescription (Sanity), Quran ayah blockquote
- Right column: Fundraise Up form embed in natural container, no absolute positioning
- Mobile: full-width stacked, form in subtle card wrapper for visual separation
- When no form (`showForm = false`): left column centers full-width, ayah below description
- Visual style: warmer and softer than homepage — approachable, not bold

## Section 2: Impact Stats Row

- Full-width section with subtle background shift (light warm gray or soft green tint)
- 3-4 stats horizontal on desktop, 2x2 grid on mobile
- Each stat: large number + short label (e.g. "500+" / "Families Supported")
- Data source: new `impactStats` array field on `donatePageSettings` Sanity singleton
- Schema: `{ value: string, label: string }` — editor controls formatting
- Hardcoded fallback defaults if Sanity empty
- Presence-based: section doesn't render if no stats configured and no fallbacks desired

## Section 3: Campaign Cards

- White background, section header ("Active Campaigns" + subtitle)
- Responsive grid: 1 col mobile -> 2 tablet -> 3-4 desktop
- Raw Fundraise Up widget embeds, no extra wrapping UI
- Only renders when active campaigns exist (existing `showCampaigns` pattern)

## Sanity Schema Changes

### `donatePageSettings` — add field:

- `impactStats`: array of objects `{ value: string, label: string }`, max 4 items

### No other schema changes

Existing fields (`heroHeading`, `heroDescription`, `formElement`, `campaigns`) remain as-is.

## Data Flow

- Same pattern: Sanity data first, hardcoded fallback if empty
- Same fetch functions and GROQ queries (extend `donatePageSettingsQuery` for `impactStats`)
- Same security sanitization for Fundraise Up elements
- Same presence-based visibility for all optional sections

## Constraints

- Fundraise Up form is an embed — we don't control its internals
- Campaign cards are Fundraise Up widgets — they handle their own title/layout/description
- `useCdn: false`, ISR revalidation at 120s (existing pattern)
