# Prayer Widget v2 — Design Spec

**Date:** 2026-04-19
**Status:** Spec only. Not yet implemented. Do **not** touch production code until PR #58 (hydration fix) merges — this work goes on a fresh branch off `main` after that.
**Scope:** Visual + structural redesign of `PrayerWidget.tsx`. No Sanity schema changes. No new data requirements.

---

## Motivation

A long interactive design session (19 April 2026) produced a consolidated direction for the widget's typography, structure, and interaction model. The current production widget (shipped via PR #57) is functional but:
- Repeats information (prayer name appears 3 times in the hero block)
- Has mixed typographic register (Title Case mixed with UPPERCASE)
- Shows a seconds countdown on the pill that isn't strictly needed
- Doesn't cleanly signal the "iqamah is imminent" state across pill + hero + list
- Has a "Prayer Times" modal title that's redundant context

This v2 design tightens the information hierarchy, unifies the typography to all-caps, introduces an `UPCOMING` badge as the state indicator, and makes the iqamah transition a coherent widget-wide state change.

---

## Design decisions

### Global typography
- **All text in the widget is UPPERCASE.** `text-transform: uppercase` at the widget root plus tightened letter-spacing (`0.02–0.05em` depending on context). Applies to pill, hero, prayer list rows, column headers, and special-prayers rows.
- Prayer times stay in monospace (`JetBrains Mono`). Everything else is `Inter`.
- No display-serif fonts. No Playfair/Amiri experimentation — those were tried and rejected in the mockup session.

### Pill — normal (next-prayer) state

```
● [UPCOMING]  MAGHRIB  5:54 PM      ⌃
```

- Lime-400 dot on the left with the existing pulse ring animation.
- **`UPCOMING` badge**: small pill (9px uppercase, 0.14em tracking, 4px 8px padding, `rgba(255,255,255,0.1)` bg, `rgba(255,255,255,0.15)` border, rounded-full). Sits where the "NEXT PRAYER" label used to.
- **Prayer name** (`MAGHRIB`) and **athan time** (`5:54 PM`) at base pill size, same weight.
- **No separators** (`·`) between items. Spacing + the badge provide the rhythm.
- **No countdown in the pill** during normal state. The countdown that used to read `in 58:24` is removed.
- Chevron-up icon + optional `TAP` label on viewports ≥ 520px. Narrow viewports: chevron only.
- Width: `max-width: calc(100vw - 24px)`, auto-sized to content, so no dead space.

### Pill — iqamah state

```
● DHUHR  IQAMAH IN 6:23      ⌃
```

- **Whole pill pulses** with a soft halo matching the dot colour (lime drop-shadow, 1.8s breath, ~1.5% scale up at peak). Respect `prefers-reduced-motion` → steady glow instead of animation.
- `[UPCOMING]` badge hidden.
- Prayer name (`DHUHR`) + full countdown phrase (`IQAMAH IN 6:23`) as one combined text. No iqamah time, no state label, no separators.
- The countdown text format is `IQAMAH IN M:SS` under 1 hour, `IQAMAH IN H:MM:SS` at or over 1 hour.
- Reverts to the normal-state pill once the iqamah minute passes (same transition logic already used by `usePrayerInIqamahWindow`).

### Modal header

```
Melbourne · Saturday 19 April 2026      ‹ 📅 Today ›      ×
```

- **Single row**. No "Prayer Times" title (context makes it obvious).
- Left: `Melbourne · {formatMelbourneDate(selectedDate)}`. Truncates with ellipsis on very narrow viewports (doesn't wrap).
- Centre: date navigation. `‹` prev, `Today` as a **chip button** (pill-shaped, subtle `rgba(255,255,255,0.08)` bg, small calendar icon before the label, rounded-full), `›` next. `Reset` button appears when not viewing today.
- Right: `×` close button. Rotates 90° on hover (220ms ease). Scales down slightly on press.
- Row wraps cleanly to two rows on very narrow viewports via `flex-wrap: wrap`.

### Hero card — normal state

```
[UPCOMING]  MAGHRIB  5:54 PM  ·  IQAMAH  5:59 PM
```

- **One line** — no stacking. `flex-wrap: nowrap; white-space: nowrap`.
- **`UPCOMING` badge** top-aligned (`align-self: flex-start`, 1px margin-top), matches the pill badge chrome exactly.
- **Prayer name + athan time**: bold (700), 28px desktop / 22px mobile.
- **Single separator `·`** between the name+time group and the iqamah group. No separator between name and its time (just a 10px gap).
- **`IQAMAH` label + iqamah time**: regular (400), 18px desktop / 14px mobile, 55% opacity. Monospace time.
- **No countdown eyebrow**. The "NEXT PRAYER · in X" row above the name is gone.
- **No `hero-sub` row**. All info on the one line above.
- **No `hero-stats`** (Hijri/sunset/qibla) — that was a Design E exploration, not shipping in v2.

### Hero card — iqamah state

```
DHUHR  IQAMAH IN 6:23
```

- Hero transforms into a focused iqamah view:
  - `[UPCOMING]` badge **hidden**.
  - Trailing `· IQAMAH 5:59 PM` group **hidden** (separator + label + time).
  - `hero-name` unchanged (still displays `DHUHR`).
  - `hero-time` now carries the full countdown phrase `IQAMAH IN 6:23` — this replaces the athan time during the window.
- **Hero card background shifts** from `rgba(255,255,255,0.06)` to `rgba(163,230,53,0.1)` (lime wash) with a lime-tinted border (`rgba(163,230,53,0.3)`). The card itself signals the state change at a glance.
- **Countdown text pulses** softly (existing `prayer-widget-iqamah-pulse` keyframe, retuned to lime colour on the dark navy/neutral backgrounds).

### Prayer list

```
              ATHAN   IQAMAH
FAJR          5:20 AM   5:50 AM
SUNRISE       6:46 AM   7:01 AM
DHUHR        12:22 PM  12:32 PM
ASR           3:26 PM   3:36 PM
● MAGHRIB     5:54 PM   5:59 PM    ← next, highlighted
ISHA          7:02 PM   7:12 PM
```

- **Single column on all viewports**. Each row: prayer name (left), athan time (centre-right, larger), iqamah time (far right, smaller/dimmer). Columns align via CSS subgrid.
- **Column headers** `ATHAN` and `IQAMAH` as uppercase 11px muted labels with a thin divider below.
- **All prayer names in UPPERCASE** (no letter-spacing wider than 0.05em — the caps do the work).
- **Passed prayers** remain at `opacity: 0.4` when viewing today and the iqamah has passed (existing behaviour).
- **Next prayer** row has `bg-white/[0.08]` + a small dot before the name. Existing behaviour.

#### Iqamah mode — list state transitions

This is new and important. When in an iqamah window:

1. The **active prayer's row** (e.g. Dhuhr in the Dhuhr→Dhuhr-iqamah window) gets a pulsing row treatment:
   - Opacity back to 1 (not dimmed as "passed").
   - A gentle background pulse (1.8s ease-in-out infinite, peak at `rgba(190,242,100,0.2)`, low at transparent).
   - A small pulsing dot next to the name (scales 1 → 1.3 → 1 with opacity variation).
2. The **originally-next row** (Maghrib) has its `.next` treatment suppressed: background back to transparent, dot hidden, name opacity 0.6. It visually becomes a normal upcoming row, not a highlighted one.
3. When iqamah passes: active row's pulse stops, passed treatment reapplied, Maghrib's `.next` highlight is restored.

Data flow: the `data-prayer="dhuhr"` attribute on each row already lets CSS + JS target the correct prayer without string matching inside render.

### Special-prayers block (Jumu'ah / Taraweeh / Eid)

- **No `Congregational` label above the block.** Explicitly removed in the mockup session — context is clear from row labels.
- Hairline divider (`border-top: 1px solid rgba(255,255,255,0.08)`) separates this block from the six-prayer list.
- **All row labels UPPERCASE** (`JUMU'AH`, `TARAWEEH`, `EID AL-FITR`, `EID AL-ADHA`).
- Jumu'ah keeps its consolidated single-row format from the existing production widget: `JUMU'AH    ARABIC 12:30 PM │ ENGLISH 1:45 PM`.
- Taraweeh / Eid each stay as their own single row: `TARAWEEH    8:30 PM`.

### Micro-interactions

1. **Pill hover**: lifts 2px (`translateY(-2px)`, 220ms ease-out).
2. **Pill press**: `scale(0.96)` over 80ms — tactile press feedback.
3. **Pill → modal transition**: pill slides down + fades out (220ms + 400ms cubic-bezier), modal slides up from bottom with a gentle overshoot cubic-bezier `(0.34, 1.12, 0.64, 1)`, 520ms. Backdrop fades in 400ms.
4. **Modal close `×` hover**: rotates 90° (220ms ease-out). Opacity 0.6 → 1. Background fills to `rgba(255,255,255,0.1)`.
5. **Modal close press**: `rotate(90deg) scale(0.9)` over 80ms.
6. **Date-nav buttons press**: `scale(0.94)` over 60ms.
7. **Grab handle**: hidden on `md+` viewports (it's a mobile bottom-sheet convention; misleading on desktop modals).

### Responsive behaviour

- **Pill** — auto-width capped at `calc(100vw - 24px)`. Mobile (≤480px) shrinks font 15px → 14px, padding 14px/20px → 11px/14px, gap 12px → 9px. Tap label hides at ≤520px. Countdown never appears (design decision — always hidden on pill).
- **Hero** — single line. Typography scales: name/athan 28px → 22px at mobile; iqamah label/time 18px → 14px.
- **Modal** — width `min(720px, calc(100vw - 24px))`, max-height `calc(100vh - 40px)`, auto-height based on content. Header row wraps on very narrow viewports.
- **Prayer list** — single column always. Column gap tightens (`gap-x-8` → `gap-x-6`) below `sm`.

---

## Implementation notes

### What changes in code

- `src/components/layout/PrayerWidget.tsx` — substantial rewrite of the JSX. Current file structure is mostly preserved; the changes are in what gets rendered and the CSS classes / inline styles.
- `src/components/layout/PrayerWidget.test.tsx` — update assertions for new text content (`Upcoming` badge, uppercase text, no countdown in pill, no "Prayer Times" title). Add assertions for the active-row pulse in iqamah mode.
- `src/app/globals.css` — add the whole-pill pulse keyframe (`pillPulse`) and the row active-state keyframes (`rowActivePulse`, `rowDotPulse`). Keep the existing `prayer-widget-iqamah-pulse` for the hero countdown text.
- No schema changes, no fetch function changes, no hook changes.

### What stays the same

- `usePrayerInIqamahWindow` hook — correct as-is (with PR #58's hydration fix).
- `getPrayerInIqamahWindow` helper — correct as-is.
- `useNextPrayer`, `usePrayerTimes` hooks — untouched.
- `src/lib/time.ts` — untouched.
- All Sanity schemas, queries, fetch functions — untouched.
- The `prayer-widget-iqamah-pulse` CSS class used for the iqamah countdown text glow — keep but retune colours.

### Tests to update

- `renders the pill with the next prayer name and time` — now asserts `UPCOMING` badge present and no countdown in the pill
- `renders an 'Iqamah' label next to the secondary time` (if still applicable after list rewrite) — adjust
- `renders the hero countdown in MM:SS format` — this test asserts the hero countdown appears in `in M:SS` format. In the new design the countdown is NOT in the hero during normal state at all. Test should be deleted or rewritten to assert countdown appears only in iqamah state's hero as part of `IQAMAH IN 6:23`.
- `allow multiple 'Athan' occurrences` — still valid (column header + hero + list all have "ATHAN"/"Athan")
- Several `expect(screen.getByText("Athan"))` style assertions need to become `getAllByText` because of CAPS + multiple occurrences
- New test: **iqamah-mode row pulse** — asserts Dhuhr's row gets the `.active` class (or data attribute) and Maghrib's `.next` is suppressed when the clock is inside Dhuhr's iqamah window

### Tests to add

1. **Upcoming badge renders in pill and hero** (next state only). With system time in a next-prayer state, assert `screen.getAllByText("Upcoming")` finds two elements (pill + hero).
2. **Upcoming badge hides in iqamah mode**. With system time inside an iqamah window, assert no `Upcoming` text appears.
3. **Pill shows no countdown in normal state**. Assert the pill text doesn't contain `in ` followed by a time format.
4. **Active-row pulse in iqamah mode**. Assert the prayer row for the in-window prayer has the row-pulse class AND the previously-next row no longer has its highlight class.
5. **Active-row pulse stops at iqamah boundary**. Using `vi.advanceTimersByTime` across the boundary, assert the pulse class is removed and the list returns to its normal arrangement.
6. **Today chip renders with calendar icon**. Assert an SVG is present inside the `Today` button.

### File-by-file checklist

- [ ] `PrayerWidget.tsx` — rewrite pill JSX (badge structure, remove countdown, remove separators)
- [ ] `PrayerWidget.tsx` — rewrite modal header JSX (single row, no title, Today chip with icon, desktop grab-handle hide)
- [ ] `PrayerWidget.tsx` — rewrite hero JSX (single-line layout, badge, bold/light weight split)
- [ ] `PrayerWidget.tsx` — rewrite prayer list iqamah-mode logic (swap .next → .active on the in-window prayer; suppress .next on the normal-next prayer)
- [ ] `PrayerWidget.tsx` — apply uppercase styling at a high level via Tailwind classes or a single `text-transform: uppercase` on the root widget container
- [ ] `globals.css` — add `pillPulse` keyframe, `rowActivePulse` keyframe, `rowDotPulse` keyframe. Retune `prayer-widget-iqamah-pulse` colour to lime on the dark bg.
- [ ] `PrayerWidget.test.tsx` — update all existing assertions to match new text content (CAPS, no countdown in pill, no title, etc.). Delete obsolete tests. Add new tests per the "Tests to add" list.
- [ ] Delete the `formatCountdown` (seconds-precision) helper if it's no longer called anywhere after the pill countdown is removed. Keep `formatCountdownForSR` — the SR live region still needs minute-precision announcements. Verify before deleting.
- [ ] Verify `useIsMounted` gate still applies to any `Date.now()`-dependent render output.

### Verification

- [ ] `npm run type-check`
- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] Visual smoke test: open widget in dev (`/` → click pill), verify pill + modal layout matches spec at 390px mobile and 1200px desktop viewport widths.
- [ ] Manually advance system time to inside an iqamah window (DevTools date override) to verify iqamah-mode transitions on pill, hero, and list.
- [ ] Sentry check after deploy — confirm no new hydration errors.

---

## Explicit non-goals

These were explored in the mockup session and rejected (or deferred):

- **Hijri date / qibla direction / sunset time** in the hero. Tried in Design E ("Dashboard"), felt like dashboard bloat. Out of scope.
- **Arabic prayer names** (e.g. `الفجر` under `FAJR`). Tried in Design B ("Warm Mosque"). Not in v2 — might revisit as a Sanity-toggled option later.
- **Light-theme widget variant**. Tried in Designs D and H. Widget stays dark-themed to match the site footer. A light variant would require separate token sets.
- **Bento-grid prayer layout**. Not explored in depth; not in v2.
- **Browser notifications before iqamah**. Product change, not a polish pass. Keep for future.
- **Audio adhan preview / qibla compass**. Same — future.

---

## Credits / source

Captured from a ~4-hour interactive mockup session on 2026-04-19 between the user and Claude, iterating through 10 design variants (labelled A–J) inside `/Users/rashidelhouli/australian-islamic-centre/.superpowers/mockups/prayer-widget-designs.html` (file has since been removed). Key moments:
- Settled on dark-neutral-900 bg with white accents over lime/gold alternatives.
- Adopted the `[UPCOMING]` badge pattern and one-line hero from mid-session iterations.
- Removed the seconds countdown from the pill — "keep the hero simple" per the user.
- Decided on the active-row pulse in iqamah mode after a critique identified the inconsistency between hero and list.
- Removed the "Prayer Times" title from the modal header — "it is evident what the widget does by context".
- Went ALL CAPS across the widget on 2026-04-19 as the final typographic decision.
