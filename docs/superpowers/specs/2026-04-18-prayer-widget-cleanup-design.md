# Prayer Widget Cleanup — Design

**Date:** 2026-04-18
**Scope:** Visual and behavioural cleanup of the existing `PrayerWidget`. No new Sanity fields, no new schemas, no new routes.

## Goals

Three focused changes to `src/components/layout/PrayerWidget.tsx`:

1. Swap the visual hierarchy in the six-prayer grid so the athan time is the primary (large) number and iqamah is secondary (small).
2. Add a "Melbourne" location label at the top of the expanded modal.
3. Pulse the iqamah time inside the hero block during the athan-to-iqamah window, then stop pulsing and advance to the next prayer once iqamah passes.

Non-goals: Hijri date, Arabic prayer names, notifications, audio adhan, qibla, schema changes, pill redesign, new Islamic motifs, ambient colour shifts.

## Change 1 — Swap hierarchy in the six-prayer grid

**Current behaviour** (`PrayerWidget.tsx` lines 491–521): each grid cell renders the iqamah time large (`text-xl`, medium weight) and the athan time small (`text-xs`, gray) below it.

**New behaviour:** athan time is the large number; iqamah renders beneath it, smaller and dimmer.

**Concrete markup change:**
- The first `<time>` in each cell renders `row.adhan` with the current large styles (`text-xl font-mono tracking-tight ...`).
- The second `<time>` renders `row.iqamah` with the current small styles (`text-xs text-gray-400 font-mono`), prefixed with a small `Iqamah` label in gray-500 so users don't read two unlabeled times as one value. (Minor design call — if the user prefers unlabeled, drop the prefix; positions alone still imply which is which once the hierarchy is consistent across all six cells.)
- The "is next" highlight logic (green dot, darker colour for the primary time) now applies to the **athan** time, not the iqamah, preserving the visual indication of which prayer is next.

The hero block at the top of the modal (lines 434–488) **does not change** for this item — it already renders athan as the big number and iqamah in a secondary row.

## Change 2 — Melbourne location label

The expanded modal currently shows this header:

```
Prayer Times
Thursday, 18 April 2026
```

New header:

```
Prayer Times
Melbourne · Thursday, 18 April 2026
```

The location string is hard-coded as `"Melbourne"` in the component. Reuse the existing `data-testid="widget-date-label"` wrapper — prepend `Melbourne · ` to the formatted date. The pill does not change.

## Change 3 — Iqamah pulse during the athan-to-iqamah window

### Behaviour

For the prayer currently in its athan-to-iqamah window (e.g. Asr athan 3:42 PM, iqamah 4:00 PM, current time between 3:42 and 4:00):

- The hero block shows **that prayer**, not the next one. Prayer name, athan time, iqamah time all refer to the in-window prayer.
- The iqamah time inside the hero block pulses — a gentle green glow breathing at approximately 1.4s per cycle. The existing `prayer-widget-pulse-ring` utility class used for the pill's status dot is the reference aesthetic; we will create an equivalent class or reuse it if the visual fits.
- Once the current Melbourne minute-of-day is greater than or equal to the iqamah time, the hero advances to the next prayer and renders normally (no pulse). "Advances" means the hero component now reads the next prayer from the shifted selector.
- Outside any iqamah window, the hero behaves exactly as it does today — show the next upcoming prayer, no pulse.

### Implementation

**New selector helper, added to `src/lib/prayer-times.ts`:**

```ts
/**
 * Returns the prayer currently in its athan-to-iqamah window, or null if
 * no prayer is in that window. Sunrise is excluded (no iqamah).
 */
export function getPrayerInIqamahWindow(
  date: Date = new Date(),
  prayerSettings?: SanityPrayerSettings | null,
): (PrayerTime & { isNextDay: false }) | null;
```

Logic: compute the Melbourne minute-of-day via `getMelbourneMinutesOfDay(date)` (already imported). For each non-sunrise prayer today, convert its athan and iqamah strings through `to24Hour` and compare: if `adhanMinutes <= currentMinutes < iqamahMinutes`, return that prayer. Otherwise return `null`.

Date comparisons, minute-of-day, and any timezone-aware calculation go through `src/lib/time.ts`. No direct calls to `getHours`/`getMinutes`/`setHours` in the widget or the new helper — existing patterns in `prayer-times.ts` already follow this rule.

**New hook, added to `src/hooks/usePrayerTimes.ts`:**

```ts
/**
 * Returns the prayer currently in its athan-to-iqamah window, or null.
 * Re-computes every 15 seconds so the window closes promptly at iqamah time.
 */
export function usePrayerInIqamahWindow(
  prayerSettings?: SanityPrayerSettings | null,
): (PrayerTime & { isNextDay: false }) | null;
```

Tick interval is 15 seconds — chosen so the pulse stops within 15 seconds of iqamah passing, which is visually acceptable for a 10-minute window. The existing `useNextPrayer` ticks at 60 seconds; we use a faster tick here because window-edge precision matters more than for a countdown label.

**Hero display logic in `PrayerWidget.tsx`:**

```ts
const nextPrayer = useNextPrayer(prayerSettings);
const inWindow = usePrayerInIqamahWindow(prayerSettings);
const heroPrayer = inWindow ?? nextPrayer;
const isInIqamahWindow = inWindow !== null;
```

The hero block renders from `heroPrayer` (displayName, adhan, iqamah). When `isInIqamahWindow` is true, add a `prayer-widget-iqamah-pulse` class to the iqamah `<time>` element.

During an iqamah window, the eyebrow label and countdown retarget to the iqamah moment: the eyebrow reads `Iqamah` (not `Next Prayer`) and the countdown shows time remaining until iqamah (e.g. `Iqamah · in 6 min`). This reinforces the pulse — the visual emphasis and the text both point at the same 10-minute window. Once iqamah passes, both revert to `Next Prayer · in X` against the next upcoming prayer. Implementation: when `isInIqamahWindow`, build `countdownTarget` from `heroPrayer.iqamah` (today); otherwise from `nextPrayer.adhan` with `isNextDay`.

### Pulse CSS

Add a new keyframe animation and class. The existing `prayer-widget-pulse-ring` is a radial ring animation on the pill's status dot; the iqamah pulse is a softer text-level glow (the iqamah is a text value, not a dot). Define in the same stylesheet as `prayer-widget-pulse-ring`:

```css
@keyframes prayer-widget-iqamah-glow {
  0%, 100% {
    text-shadow: 0 0 0 rgba(0, 173, 76, 0);
    opacity: 1;
  }
  50% {
    text-shadow: 0 0 12px rgba(0, 173, 76, 0.55);
    opacity: 0.85;
  }
}
.prayer-widget-iqamah-pulse {
  animation: prayer-widget-iqamah-glow 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .prayer-widget-iqamah-pulse {
    animation: none;
    color: #00ad4c; /* keep the emphasis, drop the motion */
  }
}
```

Reduced-motion users see a steady green emphasis instead of a pulse — matches the existing widget's reduced-motion approach (see `prefersReducedMotion` handling on backdrop/pill/dialog transitions).

## Testing

Co-located with source, using the existing `@/test/test-utils` and the `TZ=Australia/Melbourne` pin in `vitest.config.ts`.

1. **Grid hierarchy swap** (`PrayerWidget.test.tsx`): for a grid cell, assert the athan time is rendered with the primary size class and the iqamah with the secondary size class. Assert the "is next" highlight attaches to the athan element, not the iqamah.

2. **Melbourne label** (`PrayerWidget.test.tsx`): the widget-date-label element contains the string `Melbourne · ` before the formatted date.

3. **Iqamah window selector** (`prayer-times.test.ts`): with a fixed `prayerSettings` producing known athan/iqamah times, use `vi.setSystemTime` to place the clock (a) before athan → returns null, (b) exactly at athan → returns that prayer, (c) one minute before iqamah → returns that prayer, (d) exactly at iqamah → returns null, (e) after iqamah → returns null.

4. **Hook tick** (`usePrayerTimes.test.tsx`): with fake timers, render a harness using `usePrayerInIqamahWindow`. Advance `vi.setSystemTime` through the window edges and `vi.advanceTimersByTime(15_000)` to trigger re-renders. Assert the hook's return transitions from null → prayer → null at the right moments.

5. **Hero pulse rendering** (`PrayerWidget.test.tsx`): with `vi.setSystemTime` placing the clock inside a prayer's iqamah window, render the widget in the open state (`testOpenInitially`). Assert the hero's iqamah `<time>` element has the `prayer-widget-iqamah-pulse` class and the eyebrow reads `Iqamah · in X min`. Advance the clock past iqamah, advance timers by 15s, assert the class is gone and the hero now shows the next prayer with the `Next Prayer` eyebrow.

6. **Reduced-motion** (covered by existing reduced-motion mock pattern): assert the iqamah element still has the pulse class (CSS strips the animation via media query; behaviour is CSS-driven, not JS-driven, so the assertion is about the class being present and the CSS rule existing).

Regression coverage for existing behaviour (grid renders all six prayers, date picker, focus trap, Esc to close, etc.) stays unchanged.

## Files Touched

| File | Change |
|---|---|
| `src/components/layout/PrayerWidget.tsx` | Grid hierarchy swap; Melbourne label; hero `heroPrayer` selector; pulse class application; eyebrow copy. |
| `src/components/layout/PrayerWidget.test.tsx` | New tests 1, 2, 5. Adjust any existing grid-cell tests that asserted the old hierarchy. |
| `src/lib/prayer-times.ts` | New exported `getPrayerInIqamahWindow` helper. |
| `src/lib/prayer-times.test.ts` | New tests 3 (five cases). |
| `src/hooks/usePrayerTimes.ts` | New `usePrayerInIqamahWindow` hook (15s tick). |
| `src/hooks/usePrayerTimes.test.tsx` (new or existing) | New test 4 for hook ticking. |
| `src/app/globals.css` (or wherever `prayer-widget-pulse-ring` lives) | New `@keyframes prayer-widget-iqamah-glow` and `.prayer-widget-iqamah-pulse` class with reduced-motion fallback. |

## Out of Scope

Package-2 items that I previously proposed but the user cut from this pass: Hijri date, Arabic prayer names under English, ambient tints per time of day, geometric pattern watermarks, Friday Jumu'ah hero state, mobile layout rework. These remain future candidates; this spec does not touch them.
