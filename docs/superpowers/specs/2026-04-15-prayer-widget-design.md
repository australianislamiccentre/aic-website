# Prayer Times Widget — Design Spec

**Date:** 2026-04-15
**Branch:** `feature/prayer-times-widget`
**Status:** Design approved, pending implementation

---

## Context

The Australian Islamic Centre site currently surfaces prayer times in two heavy, disconnected places:

1. **Homepage `HeroSection.tsx`** — A large prayer-times strip wedged below the hero with three responsive variants (xl desktop, md tablet, mobile). Consumes significant vertical space and only appears on `/`.
2. **`/worshippers` page (`WorshippersClient.tsx`)** — A full prayer schedule with date picker. Only appears on that one route.

Every other page on the site — events, donate, services, about, architecture, contact, etc. — has **no prayer times at all**. A user reading an event announcement who wants to know when Asr is has to navigate away.

### Goal

Replace both existing displays with a **single persistent widget** visible across every page of the site. A collapsed "pill" at the bottom of every viewport shows the next prayer at a glance; tapping expands it into a full prayer panel with all six prayers, Jumu'ah/Taraweeh/Eid times, and a date picker.

### Decisions already locked in

| Decision | Rationale |
|---|---|
| **Replace both existing UIs entirely.** Hero strip goes away; `/worshippers` becomes a focused page for etiquette, Jumu'ah/Eid details, and Islamic talks. | User chose "Option A — Full replacement" during brainstorming. Avoids redundancy on the homepage where the widget would duplicate the hero strip. |
| **Floating pill design (bottom-center).** Single element that morphs between pill and widget shapes. | Chosen from 11 variations explored in the visual companion. |
| **Morph animation, 600ms, `cubic-bezier(0.33, 1, 0.68, 1)` (ease-out cubic).** Shape, background, and content transitions all aligned to the same curve and duration. | Multiple iterations (snappy, laggy, balanced) settled on pure ease-out with no sticky middle. |
| **Full-width bar on mobile** (≤440px viewport). | Full-width gives breathing room and info density that a shrunken 360px pill can't on phones. |
| **Auto-hide on scroll down, reveal on scroll up.** | Gets out of the way when reading long content, reappears when the user scrolls back. |
| **No dismiss option.** Pill is always present. | Simplest UX. Ensures prayer times are always one tap away. Close only applies to the expanded widget. |

---

## User Flow

### Collapsed pill — default state

Every page on the site renders a pill at the bottom-center of the viewport showing:

- Pulsing lime dot (status indicator)
- Label: `Next prayer`
- Prayer name (e.g. `Asr`)
- Athan time (e.g. `3:42 PM`)
- Countdown in minutes (e.g. `in 23 min`)
- Small chevron (▴) hinting at expansion

Desktop dimensions: 360×48 px, navy gradient background, 999px border-radius, positioned `bottom: 20px`, centered horizontally.

Mobile (≤440px viewport): stretches to `calc(100vw - 20px)` width, positioned `bottom: 14px`, 14px border-radius (not pill-rounded), same content but laid out as left-group (dot + label + name + time) / right-group (countdown + chevron).

### Expanding the widget

Tapping the pill triggers the morph:

1. Shape transitions: `width` (360→720), `height` (48→540), `bottom` (20→0), `border-radius` (999→24px top-only). All run 600ms on the same curve.
2. Background crossfades: navy gradient fades out (400ms), white fades in (400ms, 120ms delay).
3. Pill content fades out with `opacity: 0, translateY(-6px), scale(0.97)` in 180ms.
4. Widget content fades in (opacity 300ms at 180ms delay); individual reveal items stagger in (drag handle → header → next-prayer card → 6 prayer cards → 2 Jumu'ah chips) with all reveals completing by 580ms — before the morph itself lands.
5. Backdrop fades in with `backdrop-filter: blur(6px)` at `rgba(15, 23, 42, 0.42)`.

### Expanded widget contents

1. **Drag handle** (4px grey bar, 48×5, top-center) — visual affordance, no actual drag behavior needed in v1.
2. **Header row**
   - Left: "Prayer Times" (Playfair Display) + current viewing date ("Wednesday, 15 April 2026")
   - Right: `‹` prev day, `📅 Today` button (opens native date input), `›` next day, `×` close
3. **Next prayer card** — prominent green-tinted card with:
   - Icon in gradient square (green → lime)
   - "Next Prayer" label + prayer name
   - Both athan and iqamah times (iqamah in green)
   - Countdown pill (white, right-aligned) with minutes remaining
4. **Prayer grid** — 6 cards (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) in a `grid-cols-6` layout (desktop) or `grid-cols-3` (mobile). Each card shows:
   - Prayer name (uppercase, small)
   - Label (Athan / Sunrise)
   - Athan time
   - Iqamah or Shuruk time (bold)
   - The current next prayer card has a green border + soft glow
5. **Special prayers row** — Inline chips below a thin divider:
   - `Jumu'ah Arabic · 1:00 PM`
   - `Jumu'ah English · 2:15 PM`
   - `Taraweeh · 8:30 PM` (only when `taraweehEnabled` in Sanity)
   - `Eid al-Fitr · 7:00 AM` / `Eid al-Adha · 7:00 AM` (only when the respective `eid*Active` flag is true in Sanity)

### Date navigation

- `‹ / ›` buttons shift `selectedDate` by one day.
- `📅 Today` button: on desktop, opens a native `<input type="date">` behind the button (matches the existing pattern in `WorshippersClient.tsx`). On mobile, same native date input behavior. Label changes to "📅 Apr 18" when viewing a non-today date.
- An additional "Back to today" button appears only when viewing a non-today date (small navy button, `↶` icon).
- When viewing a past/future date, the "next prayer" highlight and countdown disappear (no "next" when you're not viewing today).

### Closing the widget

1. Click × button, click backdrop, or press `Esc`.
2. Everything reverses: expanded content fades out, shape shrinks back to pill, pill content fades back in, backdrop fades out.
3. Same 600ms duration and easing.

### Scroll behavior

- Listen to `scroll` events on `window`, throttled to once per 100ms via `requestAnimationFrame`.
- Compare current `scrollY` to previous; if scrolling down and scrolled more than 80px from top, hide pill (`transform: translateY(120px)` + opacity 0).
- If scrolling up (any amount), show pill again.
- If scroll position is within 80px of top, always show pill.
- When widget is expanded, scroll listener is suspended (widget opens above scroll anyway).
- Respects `prefers-reduced-motion`: when reduced motion is preferred, pill stays visible at all times regardless of scroll.

---

## Component Architecture

### New files

Following the existing project conventions (`src/components/layout/` for layout-shell components with co-located tests; `src/hooks/` for hooks):

```
src/components/layout/PrayerWidget.tsx          (client component — the pill + widget shell)
src/components/layout/PrayerWidget.test.tsx     (tests — rendering, open/close, responsiveness, scroll)
src/hooks/usePrayerWidgetScroll.ts              (hook — scroll-direction detection with throttling)
```

### Modifications

| File | Change |
|---|---|
| `src/app/layout.tsx` | Add `<PrayerWidget prayerSettings={prayerSettings} />` inside the providers tree. Fetch `prayerSettings` in the same `Promise.all` that already fetches site/donation/form settings. |
| `src/components/sections/HeroSection.tsx` | **Remove** the entire prayer-times bar below the hero (lines 443–731 approx). HeroSection becomes just the carousel/video hero with CTA buttons. Drop imports of `usePrayerTimes`, `useNextPrayer`, `TARAWEEH_CONFIG`, `EID_CONFIG`, `jumuahTimes`, `SanityPrayerSettings`. Drop the `prayerSettings` prop entirely. |
| `src/app/page.tsx` | Stop passing `prayerSettings` to `HeroSection`. |
| `src/app/worshippers/WorshippersClient.tsx` | **Remove** the "Prayer Schedule" section (prayer cards + date picker) entirely — replaced by widget. **Keep** hero section, mosque etiquette, Jumu'ah/Taraweeh/Eid inline row (as deep-dive reference), YouTube talks, Get Directions CTA. Drop unused imports. |
| `src/app/worshippers/page.tsx` | No changes needed (still fetches `prayerSettings` for etiquette/Jumu'ah rendering — already scoped). |
| `src/components/ui/PrayerTimesCard.tsx` | **Delete** — dead code (not referenced anywhere after the changes above). |
| `src/sanity/lib/fetch.ts` | No changes (existing `getPrayerSettings` already used). |
| `src/sanity/schemas/singletons/prayerSettings.ts` | No changes — existing schema covers everything the widget needs. |

### Data flow

```
Sanity prayerSettings singleton
        │
        ▼
getPrayerSettings() in fetch.ts
        │
        ▼
src/app/layout.tsx — server component, Promise.all fetch
        │
        ▼
<PrayerWidget prayerSettings={prayerSettings} />  (client component)
        │
        ▼
usePrayerTimes(prayerSettings) + useNextPrayer(prayerSettings) hooks
        │                       │
        ▼                       ▼
  all 6 prayers            next prayer name/time/countdown
        │
        ▼
    Rendered content
```

Fallbacks behave as they currently do: if Sanity returns null, the widget falls back to `DAILY_PRAYERS_CONFIG` / `JUMUAH_CONFIG` / `TARAWEEH_CONFIG` / `EID_CONFIG` from `src/lib/prayer-config.ts`.

---

## Visual Design

### Color palette (existing AIC brand)

| Token | Value | Usage |
|---|---|---|
| `--aic-navy` | `#01476b` | Pill background (collapsed), header headings |
| `--aic-navy-dark` | `#01365c` | Gradient bottom in pill |
| `--aic-green` | `#00ad4c` | Next-prayer accents, iqamah times, primary CTA button |
| `--aic-lime` | `#84cc16` | Pulsing dot, time in collapsed pill, countdown glow |
| `--aic-gold` | `#d4a017` | (Reserved — not used in widget v1) |

### Typography

- Pill content: Inter (system font stack fallback). Time values in `ui-monospace` for visual stability when the countdown ticks.
- Widget title ("Prayer Times", prayer names in next-prayer card): Playfair Display (serif).
- Body copy: Inter.
- Arabic script is **not** rendered in the widget — reserved for the standalone worshippers page.

### Shadows & depth

- Pill: `0 12px 32px rgba(1, 71, 107, 0.35), 0 4px 12px rgba(0, 0, 0, 0.1)`. Hover lifts 2px with deeper shadow.
- Widget: `0 -24px 64px rgba(0, 0, 0, 0.22), 0 -4px 16px rgba(0, 0, 0, 0.08)` (upward shadow since it's anchored to the bottom).
- Backdrop: `rgba(15, 23, 42, 0.42)` + `backdrop-filter: blur(6px)`.

### Spacing

- Widget body padding: 20px 24px 24px.
- Widget header padding: 8px 24px 16px, with 1px bottom border.
- Prayer grid gap: 8px.
- Special prayers row: 16px top padding, 1px top border.

---

## Animation Specification

All animations use CSS transitions (not Framer Motion) to stay lightweight and avoid hydration mismatches on initial render.

### Primary transitions

| Property | Duration | Easing | Delay |
|---|---|---|---|
| `width` | 600ms | `cubic-bezier(0.33, 1, 0.68, 1)` | — |
| `height` | 600ms | `cubic-bezier(0.33, 1, 0.68, 1)` | — |
| `bottom` | 600ms | `cubic-bezier(0.33, 1, 0.68, 1)` | — |
| `border-radius` | 600ms | `cubic-bezier(0.33, 1, 0.68, 1)` | — |
| `box-shadow` | 600ms | `cubic-bezier(0.33, 1, 0.68, 1)` | — |
| Pill content opacity | 180ms | same | — |
| Widget content opacity | 300ms | same | 180ms |
| Drag handle | 340ms | same | 200ms |
| Widget header | 360ms | same | 240ms |
| Reveal items | 360ms | same | 280–540ms (staggered 40ms apart) |
| Backdrop | 600ms | same | — |

### Hover/press states

- Pill hover: `translateY(-2px)` with deeper shadow, 300ms.
- Pill press: no special animation (click triggers morph).
- Prayer cards inside widget: `translateY(-2px)` on hover, 220ms.

### Pulse animation on status dot

```css
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(2.5); opacity: 0; }
}
```
Runs infinite, 2s duration. Paused if `prefers-reduced-motion: reduce`.

### Reduced motion

When `prefers-reduced-motion: reduce`:
- All transitions collapse to ≤150ms opacity fades.
- No scale, translate, or morphing.
- Pulse on dot is disabled (dot remains solid lime).
- Scroll auto-hide is disabled (pill stays visible).

---

## Responsive Behavior

### Viewport thresholds

| Breakpoint | Width | Pill appearance | Widget width |
|---|---|---|---|
| ≤440px | mobile | Full-width bar, 14px radius, `left: 10px, right: 10px, bottom: 14px` | `100vw - 24px` |
| 441–768px | tablet | 360px pill, centered, bottom: 20px | `min(720px, 100vw - 24px)` |
| ≥769px | desktop | 360px pill, centered, bottom: 20px | 720px |

### Widget content responsive

- `.prayer-grid` switches from `grid-cols-6` to `grid-cols-3` at 640px.
- `.next-prayer-card` flex layout wraps on narrow screens (countdown pill moves under info column).
- `.date-picker-nav` reduces button sizes and hides labels on very narrow screens.
- `.widget-body` maintains `overflow-y: auto` for landscape phones where total content exceeds viewport height.

### Height constraint

`.prayer-widget.expanded { height: min(540px, calc(100vh - 40px)); }` — caps to `540px` on tall desktops, shrinks on phones in landscape.

---

## Scroll Behavior (Auto-hide)

### Implementation

Custom hook: `usePrayerWidgetScroll()`

```ts
// Returns `isHidden: boolean`
// - false initially
// - true when scrolling down past 80px from top
// - false when scrolling up or within 80px of top
```

Uses `requestAnimationFrame` throttle (not setTimeout) and a ref to store last-seen scroll position.

The hook is disabled (always returns `false`) when:
- `prefers-reduced-motion: reduce` is set
- Widget is expanded (no auto-hide while open)

### Visual

Hidden state applies to the pill only:
```css
.prayer-morph.hidden-scroll {
  transform: translateX(-50%) translateY(120px);
  opacity: 0;
  pointer-events: none;
  transition: transform 280ms cubic-bezier(0.25, 0.1, 0.25, 1),
              opacity 200ms ease-out;
}
```

Expanded widget is never hidden by scroll.

---

## Sanity Integration

**No schema changes required.** The existing `prayerSettings` singleton contains all fields needed:

- Daily prayer iqamah modes/times/delays (fajr, dhuhr, asr, maghrib, isha, plus sunrise handled implicitly)
- `jumuahArabicTime`, `jumuahEnglishTime`
- `taraweehEnabled`, `taraweehTime`
- `eidFitrActive`, `eidFitrTime`, `eidAdhaActive`, `eidAdhaTime`

The widget reads these via `getPrayerSettings()` in the root layout and passes them through the `usePrayerTimes(prayerSettings)` and `useNextPrayer(prayerSettings)` hooks. Sanity overrides apply; fallbacks in `src/lib/prayer-config.ts` are used if Sanity returns null.

### Revalidation

`src/app/api/revalidate/route.ts` already knows about `prayerSettings` in `validDocumentTypes` and triggers `revalidatePath("/")` on updates. No changes needed there. Changes to prayerSettings in Studio will revalidate pages and propagate to the widget on next navigation.

---

## Accessibility

- The pill is a `<button>` (or `role="button"` on a `div`) with `tabindex="0"` and `aria-label="Open prayer times"`.
- Space/Enter opens the widget when focused.
- Esc closes the widget.
- Focus is trapped inside the widget while open (tab cycles through date buttons + close button + scrollable prayer cards).
- When the widget closes, focus returns to the pill.
- The widget has `role="dialog"` and `aria-modal="true"`.
- Prayer times include `<time>` elements with `datetime` attributes for machine readability.
- The pulsing dot has `aria-hidden="true"`.
- Screen reader announces the next prayer change (via `aria-live="polite"` on the countdown).
- All interactive elements meet WCAG AA contrast (4.5:1 text, 3:1 large text).
- Touch targets inside the widget are ≥44×44 px.

---

## Testing Requirements

### `PrayerWidget.test.tsx`

1. **Renders pill with next prayer data** from `usePrayerTimes` / `useNextPrayer`.
2. **Clicking pill opens widget** — assert widget becomes visible and has `aria-modal="true"`.
3. **Close button hides widget** and returns focus to pill.
4. **Esc key closes widget**.
5. **Backdrop click closes widget**.
6. **Date picker navigates days** — click `›`, selectedDate advances by 1, prayer times update.
7. **"Today" button returns to today** when viewing a non-today date.
8. **Next-prayer highlight is absent when viewing non-today dates**.
9. **Auto-hide on scroll down** (simulate scroll events, assert pill has hidden class).
10. **Auto-reveal on scroll up**.
11. **No auto-hide when `prefers-reduced-motion: reduce`** is set.
12. **Falls back to default prayer config when Sanity returns null**.
13. **Renders Jumu'ah chips** (always) and Taraweeh / Eid chips conditionally (based on Sanity settings).
14. **Widget displays correctly at mobile viewport (375px)** — full-width bar, not narrow pill.

### `HeroSection.test.tsx` (modification)

- Remove assertions for prayer times appearing below the hero (they're gone).
- Add assertion that the hero renders without calling `usePrayerTimes`.

### `WorshippersClient.test.tsx` (modification)

- Remove assertions for the prayer schedule grid / date picker.
- Keep assertions for etiquette, Jumu'ah/Taraweeh/Eid inline row, YouTube section, Get Directions CTA.

---

## Edge Cases

| Case | Behavior |
|---|---|
| User is on `/studio` (Sanity Studio route) | Widget should **not** render inside the Studio iframe. Handled by checking `pathname.startsWith("/studio")` and returning `null`. |
| User is in draft mode | Widget renders normally with draft prayer settings from `previewClient`. |
| Sanity returns null (network/permissions error) | Fallback to hardcoded `DAILY_PRAYERS_CONFIG`. Widget remains functional. |
| Selected date is far in the past / future | Hooks calculate times for that date correctly. Next-prayer highlight and countdown are suppressed. |
| User opens widget while `navigator.onLine === false` | Widget works — prayer times are calculated client-side from the Sanity config already in the page bundle. |
| Very tall / short viewports | Widget caps at `min(540px, 100vh - 40px)`. Body scrolls if content overflows. |

---

## Verification Plan

After implementation:

1. `npm run validate` — type-check, lint, tests, build all pass.
2. Manual dev server test (`npm run dev`):
   - Homepage `/` — widget pill visible, hero strip gone, hero carousel looks correct.
   - `/events`, `/donate`, `/about`, `/services` — widget pill visible on all pages.
   - `/worshippers` — prayer schedule grid gone; etiquette, Jumu'ah/Eid, videos, CTA remain.
   - `/studio` — widget NOT visible.
   - Click pill on any page — morph animation plays smoothly, widget opens, content staggers in.
   - Click ×, click backdrop, press Esc — widget closes, pill returns.
   - Change Sanity prayer settings (e.g., fajrDelay) and publish — pill on next page load reflects the change.
   - Scroll down a long page — pill slides out; scroll back up — pill reappears.
3. Mobile test: Chrome DevTools device toolbar at iPhone SE / iPhone 14 Pro / Pixel 7 widths:
   - Pill becomes full-width bar, reads correctly.
   - Widget opens, fits viewport, date picker usable.
4. Accessibility:
   - Keyboard: Tab reaches pill, Space opens, focus trapped in widget, Esc closes.
   - Screen reader (VoiceOver): pill announces "Open prayer times", expanded widget announces as dialog.
   - Reduced motion: transitions collapse to fades, pulse stops.

---

## Open Questions

*None — all major UX decisions captured above.*

Minor details that can be resolved during implementation:
- Whether to show athan or iqamah as the primary time on the pill. **Current plan: show athan** (matches existing `HeroSection` "Next Prayer" card pattern). Can be switched to iqamah in a one-line change if preferred after review.
- Exact scroll threshold (currently 80px). Easy to tune based on testing.
- Whether the native date picker on mobile should use `<input type="date">` (native picker) or a custom calendar overlay. **Current plan: native `<input type="date">`** (matches existing `WorshippersClient.tsx` pattern, works well on iOS and Android).
