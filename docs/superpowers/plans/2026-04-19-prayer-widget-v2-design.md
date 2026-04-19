# Prayer Widget v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the production `PrayerWidget` to adopt the v2 design: ALL-CAPS typography, `UPCOMING` badge, single-line hero, pill without countdown, modal header without title, whole-pill pulse + active-row pulse in iqamah mode, clickable `Today` chip with calendar icon, and polished micro-interactions.

**Architecture:** No hooks or data-layer changes. All edits are in `src/components/layout/PrayerWidget.tsx`, its test file, and `src/app/globals.css`. The `usePrayerInIqamahWindow` hook (now SSR-safe from PR #58), `useNextPrayer`, `usePrayerTimes`, and `src/lib/time.ts` are load-bearing for the new iqamah-mode row transitions but need no changes themselves.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest + Testing Library (`jsdom`), `lucide-react` icons, CSS keyframe animations, CSS subgrid.

**Spec:** [docs/superpowers/specs/2026-04-19-prayer-widget-v2-design.md](../specs/2026-04-19-prayer-widget-v2-design.md)

---

## File Structure

| Path | Responsibility | Change |
|---|---|---|
| `src/app/globals.css` | Global CSS. Already hosts `prayer-widget-pulse-ring` + `prayer-widget-iqamah-pulse`. Gets `pill-pulse`, `row-active-pulse`, `row-dot-pulse` keyframes plus their CSS custom properties. | Modify (append) |
| `src/components/layout/PrayerWidget.tsx` | The entire widget JSX + local helpers. All v2 design changes land here. | Modify (multiple sections) |
| `src/components/layout/PrayerWidget.test.tsx` | Widget tests. Many existing assertions reference removed text (`Next prayer` label, `Prayer Times` title, pill countdown, mixed casing) — update those + add new tests for v2 behaviour. | Modify |

No new files. No file splits — the widget is already ~700 lines but coherent; splitting mid-refactor risks churn without benefit.

---

## Task 1: Add CSS keyframes for whole-pill pulse and active-row pulse

**Files:**
- Modify: `src/app/globals.css` (append after the existing `prayer-widget-iqamah-pulse` block)

**Context for the engineer:**
- The file already has two prayer-widget animations at roughly line 340: `prayer-widget-pulse-ring` (the dot's halo) and `prayer-widget-iqamah-pulse` (the text-glow on the hero's iqamah countdown).
- The new animations:
  - `prayer-widget-pill-pulse` — full-pill glow via `filter: drop-shadow()` (preserves the pill's own `box-shadow` layers) + ~1.5% scale up at peak. Colour driven by CSS custom property `--pill-pulse-glow` so the navy production pill uses a lime glow.
  - `prayer-widget-row-active` — soft background pulse for the active prayer row in iqamah mode. Colour via `--row-pulse-bg`.
  - `prayer-widget-row-dot` — scale+opacity pulse for the small dot inside the active row.
- Respect `prefers-reduced-motion`: animations stop, but the "active" state should still be visible as a static colour shift.

- [ ] **Step 1: Append the new keyframes**

Open `src/app/globals.css` and find the existing block ending with the `prayer-widget-iqamah-pulse` reduced-motion media query (should be near line ~370 after previous work). Append:

```css
/* ===== Prayer Widget — whole-pill pulse (iqamah mode) ===== */
@keyframes prayer-widget-pill-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
    transform: translateX(-50%) scale(1);
  }
  50% {
    filter: drop-shadow(0 0 18px var(--pill-pulse-glow, rgba(163, 230, 53, 0.55)));
    transform: translateX(-50%) scale(1.015);
  }
}
.prayer-widget-pill-pulse {
  --pill-pulse-glow: rgba(163, 230, 53, 0.55);
  animation: prayer-widget-pill-pulse 1.8s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .prayer-widget-pill-pulse {
    animation: none;
    filter: drop-shadow(0 0 12px var(--pill-pulse-glow, rgba(163, 230, 53, 0.55)));
  }
}

/* ===== Prayer Widget — active prayer row (iqamah mode) ===== */
@keyframes prayer-widget-row-active {
  0%, 100% { background-color: transparent; }
  50%      { background-color: var(--row-pulse-bg, rgba(163, 230, 53, 0.18)); }
}
.prayer-widget-row-active {
  --row-pulse-bg: rgba(163, 230, 53, 0.18);
  animation: prayer-widget-row-active 1.8s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .prayer-widget-row-active {
    animation: none;
    background-color: var(--row-pulse-bg, rgba(163, 230, 53, 0.18));
  }
}

/* ===== Prayer Widget — active row dot pulse ===== */
@keyframes prayer-widget-row-dot {
  0%, 100% { transform: scale(1);   opacity: 1;   }
  50%      { transform: scale(1.3); opacity: 0.8; }
}
.prayer-widget-row-dot {
  animation: prayer-widget-row-dot 1.8s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .prayer-widget-row-dot { animation: none; }
}
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npm run build`
Expected: build succeeds. No test gate here — visual verification lands in later tasks that actually apply these classes.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(prayer): add v2 widget keyframes (pill pulse + active row)"
```

---

## Task 2: Replace pill "Next prayer" label with `Upcoming` badge, remove countdown

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` — the pill `<button>` block (currently around lines 340–397)
- Modify: `src/components/layout/PrayerWidget.test.tsx` — pill tests

**Context for the engineer:**
- Current pill renders (in order): dot → `Next prayer` label (hidden ≤480px) → prayer name → athan time (lime) → countdown (hidden ≤380px) → Tap+chevron (tap hidden ≤520px) → chevron (visible only ≤520px).
- v2 pill renders (in order): dot → `Upcoming` badge → prayer name → athan time → Tap+chevron (same breakpoints) → narrow chevron. **No countdown, anywhere on the pill.**
- The badge is a small rounded-full pill with its own border + subtle bg. In iqamah mode, the badge hides and the pill gets the whole-pill pulse from Task 1.
- The existing production widget's pill CSS (background gradient, shadow, hover, etc.) is preserved. Only the contents change.

- [ ] **Step 1: Write the failing tests**

Add to `src/components/layout/PrayerWidget.test.tsx`, inside the existing `describe("PrayerWidget — pill skeleton", ...)` block (or a new describe block if you prefer to keep them grouped):

```tsx
describe("PrayerWidget — pill v2", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00")); // 23 min before Asr
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the UPCOMING badge on the pill (not 'Next prayer')", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill.textContent).toMatch(/UPCOMING/i);
    expect(pill.textContent).not.toMatch(/Next prayer/i);
  });

  it("does not render a countdown on the pill in normal state", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    // Countdown would be "in 23:00" (seconds precision) or "in 23 min" (minute).
    // The pill must contain neither.
    expect(pill.textContent).not.toMatch(/\bin \d+:\d{2}\b/);
    expect(pill.textContent).not.toMatch(/\bin \d+ min\b/);
  });

  it("UPCOMING badge is hidden when a prayer is inside its iqamah window", () => {
    // 1 minute after Asr athan on 2026-04-15 — inside the iqamah window
    // (real schedule: Asr adhan 3:29 PM, iqamah 3:39 PM).
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill.textContent).not.toMatch(/UPCOMING/i);
    // And the pulse class is applied to the pill
    expect(pill.className).toMatch(/prayer-widget-pill-pulse/);
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "pill v2"`
Expected: all three tests FAIL. First two complain about `UPCOMING` text and unwanted countdown. Third fails because `prayer-widget-pill-pulse` class isn't applied yet.

- [ ] **Step 3: Rewrite the pill JSX**

In `src/components/layout/PrayerWidget.tsx`, find the `<button ref={pillRef}` block starting near line 341. Replace its children (everything between the opening `<button ...>` and the matching `</button>`) with the new content:

```tsx
        <span className="relative w-2.5 h-2.5 rounded-full bg-lime-400 flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-lime-400 prayer-widget-pulse-ring" aria-hidden="true" />
        </span>
        {!isInIqamahWindow && (
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/75
                       bg-white/10 border border-white/15 rounded-full px-2 py-1
                       whitespace-nowrap flex-shrink-0"
          >
            Upcoming
          </span>
        )}
        <span className="font-semibold text-base uppercase tracking-wide whitespace-nowrap">
          {isInIqamahWindow ? heroPrayer.displayName : nextPrayer.displayName}
        </span>
        {isInIqamahWindow ? (
          <span className="text-lime-300 font-semibold text-base uppercase tracking-wide whitespace-nowrap tabular-nums">
            {`Iqamah ${countdown}`}
          </span>
        ) : (
          <time
            className="text-lime-300 font-bold font-mono text-base whitespace-nowrap"
            dateTime={toISO24Hour(nextPrayer.adhan)}
          >
            {nextPrayer.adhan}
          </time>
        )}
        <span
          className="flex items-center gap-1 text-white/50 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap ml-1 max-[520px]:hidden"
          aria-hidden="true"
        >
          Tap
          <ChevronUp className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
        <ChevronUp
          className="w-4 h-4 text-white/50 ml-1 min-[521px]:hidden"
          aria-hidden="true"
          strokeWidth={2.5}
        />
```

Notes on this rewrite:
- `heroPrayer.displayName` is used when in iqamah window (it's the prayer currently active). Outside the window, `nextPrayer.displayName` is used.
- `countdown` variable (existing, `in MM:SS` string) is now reused to build the iqamah-mode pill phrase `Iqamah in 6:23`.
- The `Next prayer` text span, the separate countdown span, the 15px-wide `·` separators — all removed.
- `uppercase tracking-wide` is added on the name and iqamah phrase for the v2 typography.

- [ ] **Step 4: Apply the pill-pulse class conditionally**

On the `<button ref={pillRef}` element itself, change the `className` to append the pulse class only when in an iqamah window. Find the current `className` string literal and append a trailing conditional. Change from:

```tsx
        className="fixed left-1/2 flex items-center gap-3 px-5 py-3.5
                   rounded-full text-white text-base border border-white/10 z-[1000]
                   cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]
                   hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]
                   max-[480px]:gap-2 max-[480px]:px-4 max-[480px]:py-3"
```

to:

```tsx
        className={
          "fixed left-1/2 flex items-center gap-3 px-5 py-3.5 " +
          "rounded-full text-white text-base border border-white/10 z-[1000] " +
          "cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)] " +
          "hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)] " +
          "max-[480px]:gap-2 max-[480px]:px-4 max-[480px]:py-3" +
          (isInIqamahWindow ? " prayer-widget-pill-pulse" : "")
        }
```

- [ ] **Step 5: Run the pill v2 tests — they should pass**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "pill v2"`
Expected: all three PASS.

- [ ] **Step 6: Run the existing pill tests — some may need updating**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "pill skeleton"`

There's an existing test at roughly `it("shows a countdown to the next prayer", ...)` that asserts `in 23:00` appears on screen. That test is now wrong (by design — pill has no countdown in normal state). **Delete that test** — it's obsolete under v2. Commit message should call this out.

There may also be a test `it("renders the pill with the next prayer name and time", ...)` — it checks for `Next prayer`, `Asr`, `3:42 PM`. Adjust the regex from `getByText("Next prayer")` to `getByText(/UPCOMING/i)` and leave the prayer-name / time assertions (they still hold, though the time is now wrapped in a `<time>` element, so `getAllByText("3:42 PM")` still works).

- [ ] **Step 7: Run the full widget test file**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx`
Expected: all tests pass. If any unrelated test breaks, it's likely because the test asserted some text that we removed (e.g. a `·` separator). Update assertions — do not weaken them beyond necessity.

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer): v2 pill — Upcoming badge, no countdown, iqamah pulse"
```

---

## Task 3: Rewrite modal header — drop title, combine rows, Today chip with icon, desktop grab-handle hide

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` — modal header + date-nav section (currently around lines 436–502)
- Modify: `src/components/layout/PrayerWidget.test.tsx` — header tests

**Context for the engineer:**
- Current modal opens with: grab handle → `<h2>Prayer Times</h2>` + close button row → `Melbourne · <date>` sub-row → separate date-nav row (centred, prev/Today/next/Reset).
- v2 modal opens with: grab handle (mobile only) → single row: `Melbourne · <date>` on the left, date-nav centred, close button on the right. No `Prayer Times` title anywhere.
- `Today` becomes a chip: pill-shaped button with a small calendar icon before the label. Use `CalendarDays` from `lucide-react`.
- The close `×` button gets a hover rotation (transition added in a later task; for now just keep the button).
- The grab handle (`w-8 h-1 bg-white/20 rounded-full`) should be hidden at `md:` breakpoint (Tailwind's 768px).

- [ ] **Step 1: Import the calendar icon**

In `src/components/layout/PrayerWidget.tsx` near the top, update the lucide import to include `CalendarDays`:

```tsx
import { ChevronUp, CalendarDays } from "lucide-react";
```

- [ ] **Step 2: Write failing tests**

Append to `src/components/layout/PrayerWidget.test.tsx` (in a new describe block near the existing header tests):

```tsx
describe("PrayerWidget — modal header v2", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render a 'Prayer Times' title", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    // No <h2>Prayer Times</h2> in the dialog. The dialog itself still has
    // aria-label="Prayer Times" for SR users — that's fine (accessible name,
    // not visible text). Scope the check to the visible title region.
    const dialog = screen.getByRole("dialog");
    const visibleTitle = dialog.querySelector("h2");
    expect(visibleTitle).toBeNull();
  });

  it("renders the Melbourne date subtitle with data-testid=widget-date-label", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const label = screen.getByTestId("widget-date-label");
    expect(label.textContent).toMatch(/^Melbourne · /);
  });

  it("renders the Today chip with a calendar icon", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const todayButton = screen.getByRole("button", { name: /open date picker/i });
    // The chip should contain an SVG (the calendar icon from lucide)
    const svg = todayButton.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(todayButton.textContent).toMatch(/Today/);
  });
});
```

- [ ] **Step 3: Run failing tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "modal header v2"`
Expected: test 1 FAILS (h2 still present), test 2 PASSES or FAILS depending on exact Melbourne formatting; test 3 FAILS (no SVG in the Today button yet).

- [ ] **Step 4: Replace the modal header block**

Find the existing modal header block starting with `<div className="w-8 h-1 bg-white/20 rounded-full mx-auto mt-2.5 flex-shrink-0"` (the grab handle) and ending just before the `<div className="px-6 pt-4 pb-6 overflow-y-auto flex-1">` content area. Replace with:

```tsx
          {/* Grab handle — bottom-sheet convention, only shown on mobile */}
          <div
            className="w-8 h-1 bg-white/20 rounded-full mx-auto mt-2.5 flex-shrink-0 md:hidden"
            aria-hidden="true"
          />

          {/* Single-row header: date · nav · close */}
          <div className="px-6 pt-4 pb-3 border-b border-white/10 flex-shrink-0 flex items-center justify-between gap-3 flex-wrap">
            <div
              className="text-xs text-white/60 flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
              data-testid="widget-date-label"
            >
              Melbourne · {formatMelbourneDate(selectedDate)}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => shiftDate(-1)}
                className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-md text-xl font-light transition-colors flex items-center justify-center"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-label={
                    isViewingToday
                      ? "Open date picker"
                      : `Selected date ${formatMelbourneDate(selectedDate)}, open date picker`
                  }
                  onClick={openNativeDatePicker}
                  className="h-9 px-3 text-xs font-medium text-white/85 hover:text-white hover:bg-white/12 bg-white/8 border border-white/10 rounded-full transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <CalendarDays className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                  {isViewingToday ? "Today" : formatMelbourneDate(selectedDate, { month: "short", day: "numeric" })}
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  aria-label="Pick a date"
                  value={getMelbourneDateString(selectedDate)}
                  onChange={handleDateInputChange}
                  tabIndex={-1}
                  className="sr-only"
                />
              </div>
              <button
                type="button"
                aria-label="Next day"
                onClick={() => shiftDate(1)}
                className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-md text-xl font-light transition-colors flex items-center justify-center"
              >
                <span aria-hidden="true">›</span>
              </button>
              {!isViewingToday && (
                <button
                  type="button"
                  aria-label="Back to today"
                  onClick={goToToday}
                  className="h-9 px-2.5 ml-1 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              type="button"
              aria-label="Close prayer times"
              onClick={closeWidget}
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-md text-2xl font-light leading-none transition-colors flex items-center justify-center flex-shrink-0"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
```

Tailwind class notes:
- `md:hidden` on the grab handle — hides it at `>=768px`.
- `bg-white/8` and `hover:bg-white/12` aren't stock Tailwind fractions; use arbitrary values `bg-[rgba(255,255,255,0.08)]` and `hover:bg-[rgba(255,255,255,0.12)]` if Tailwind 4 rejects the shorthand. (Tailwind 4 supports opacity modifiers on any colour, so `bg-white/10` works — use `bg-white/10` and `hover:bg-white/20` as safe stand-ins if the intermediate values don't compile.)

- [ ] **Step 5: Re-run the v2 header tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "modal header v2"`
Expected: all three PASS.

- [ ] **Step 6: Run the full widget test file**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx`

There's an existing test somewhere named like `renders Prayer Times header` or similar that finds the `<h2>Prayer Times</h2>`. If present, **delete it** — the v2 design has no visible title. There may also be a `Melbourne label` describe block whose assertions survive unchanged. Adjust any focus-trap test that counts focusable buttons — we removed the h2 but kept all 4 buttons (prev/Today/next/close); focus trap should still work.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer): v2 modal header — single row, no title, Today chip"
```

---

## Task 4: Rewrite hero — single-line layout, Upcoming badge, simplified iqamah state

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` — hero block (currently around lines 506–562)
- Modify: `src/components/layout/PrayerWidget.test.tsx` — hero tests

**Context for the engineer:**
- Current hero block is three visual stripes: eyebrow (`Next Prayer · in 58:24`) → big name + big time (space-between) → sub-line (`Athan 5:54 PM · Iqamah 5:59 PM`).
- v2 hero in normal state is one line: `[UPCOMING] MAGHRIB 5:54 PM · IQAMAH 5:59 PM`. Name + athan time are bold (700); the `IQAMAH` label + iqamah time are regular (400) at 55% opacity. Separator `·` only between the two groups.
- v2 hero in iqamah state: badge hidden, iqamah trailer (separator + label + iqamah time) hidden, `hero-time` element carries the phrase `IQAMAH IN 6:23` instead of the athan time, card background shifts to a lime wash.
- No countdown in the hero in normal state. The `countdown` variable is repurposed to build the iqamah-mode hero phrase.

- [ ] **Step 1: Write failing tests**

Append to `src/components/layout/PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — hero v2 (normal state)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00")); // 23 min before Asr
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders UPCOMING badge in the hero", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    // Two Upcoming badges appear — one in the pill, one in the hero
    const badges = screen.getAllByText(/^Upcoming$/i);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders hero as single-line: name + athan time + separator + IQAMAH + iqamah time", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    // The hero text must contain Asr, its athan (3:42 PM), and its iqamah (3:52 PM)
    // The word "IQAMAH" should appear (label in the hero trailer)
    expect(dialog.textContent).toMatch(/Asr/i);
    expect(dialog.textContent).toMatch(/3:42 PM/);
    expect(dialog.textContent).toMatch(/3:52 PM/);
    expect(dialog.textContent).toMatch(/IQAMAH/);
  });

  it("does NOT render a countdown or 'Next Prayer' eyebrow in the hero", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    // No countdown format like "in 23:00" or "in 23 min"
    expect(dialog.textContent).not.toMatch(/\bin \d+:\d{2}\b/);
    expect(dialog.textContent).not.toMatch(/\bin \d+ min\b/);
    // The old "Next Prayer" eyebrow (case-sensitive, as a phrase) shouldn't appear
    // (it's replaced by the Upcoming badge, which is rendered as "Upcoming")
    expect(dialog.textContent).not.toMatch(/Next Prayer/);
  });
});

describe("PrayerWidget — hero v2 (iqamah state)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("collapses to DHUHR + 'IQAMAH IN M:SS' and hides the Upcoming badge", () => {
    // 3:30 PM Melbourne — inside the real-schedule Asr iqamah window
    // (adhan 3:29, iqamah 3:39 on 2026-04-15)
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    // The hero should contain the active prayer name (Asr in this scenario)
    expect(dialog.textContent).toMatch(/Asr/i);
    // And the iqamah phrase (label + countdown) e.g. "Iqamah in 6:23"
    // Case-insensitive match on the word; the time part is dynamic.
    expect(dialog.textContent).toMatch(/Iqamah\s+in\s+\d/i);
    // No standalone Upcoming badge in iqamah mode (the badge disappears).
    // The pill still has its own state-aware logic; we only check the hero.
    const hero = dialog.querySelector('[data-testid="prayer-widget-hero"]');
    expect(hero).not.toBeNull();
    expect(hero!.textContent).not.toMatch(/Upcoming/i);
  });
});
```

- [ ] **Step 2: Run failing tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "hero v2"`
Expected: all FAIL until Step 3.

- [ ] **Step 3: Replace the hero block JSX**

Find the hero block starting with `<div className="relative mb-4 p-4 sm:p-5 rounded-2xl overflow-hidden border border-white/10"` and ending just before the prayer list `<div className="grid grid-cols-[auto_1fr_auto] gap-x-6 sm:gap-x-8 pb-4 mb-4 border-b border-white/10">`. Replace the hero block entirely with:

```tsx
            {/* Hero block — single-line v2 layout */}
            <div
              data-testid="prayer-widget-hero"
              data-iqamah={isInIqamahWindow ? "true" : undefined}
              className={
                "relative mb-4 px-4 py-4 sm:px-5 rounded-2xl overflow-hidden border flex items-baseline gap-2.5 flex-nowrap " +
                (isInIqamahWindow
                  ? "border-lime-400/30"
                  : "border-white/10")
              }
              style={{
                background: isInIqamahWindow
                  ? "rgba(163, 230, 53, 0.1)"
                  : "rgba(255, 255, 255, 0.06)",
              }}
            >
              {!isInIqamahWindow && (
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/75
                             bg-white/10 border border-white/15 rounded-full px-2 py-1 flex-shrink-0
                             self-start mt-1 whitespace-nowrap"
                >
                  Upcoming
                </span>
              )}
              <span className="font-bold text-xl sm:text-2xl md:text-[28px] uppercase tracking-wide text-white whitespace-nowrap">
                {heroPrayer.displayName}
              </span>
              {isInIqamahWindow ? (
                <time
                  className={
                    "font-mono font-bold text-xl sm:text-2xl md:text-[28px] uppercase tracking-wide whitespace-nowrap tabular-nums " +
                    "prayer-widget-iqamah-pulse"
                  }
                  dateTime={toISO24Hour(heroPrayer.iqamah)}
                >
                  {`Iqamah ${countdown}`}
                </time>
              ) : (
                <>
                  <time
                    className="font-mono font-bold text-xl sm:text-2xl md:text-[28px] uppercase tracking-wide text-white whitespace-nowrap"
                    dateTime={toISO24Hour(heroPrayer.adhan)}
                  >
                    {heroPrayer.adhan}
                  </time>
                  <span className="text-white/25 text-sm self-center" aria-hidden="true">·</span>
                  <span className="font-medium text-sm sm:text-base uppercase tracking-wide text-white/55 whitespace-nowrap">
                    Iqamah
                  </span>
                  <time
                    className="font-mono font-medium text-sm sm:text-base uppercase tracking-wide text-white/55 whitespace-nowrap"
                    dateTime={toISO24Hour(heroPrayer.iqamah)}
                  >
                    {heroPrayer.iqamah}
                  </time>
                </>
              )}
            </div>
```

Notes:
- `data-testid="prayer-widget-hero"` added so the test can scope checks to the hero alone.
- The iqamah-mode `<time>` uses the existing `prayer-widget-iqamah-pulse` class (the text-glow animation that already exists in `globals.css`). The pulse colour was retuned to white in an earlier session; whatever the current colour is, it still reads as emphasis on the lime-tinted hero bg.
- Typography scales down on narrow viewports: `text-xl` (mobile) → `text-2xl` (sm) → `text-[28px]` (md+).

- [ ] **Step 4: Re-run hero v2 tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "hero v2"`
Expected: all 4 tests PASS.

- [ ] **Step 5: Run full widget tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx`

The existing iqamah-mode hero tests from `describe("PrayerWidget — iqamah pulse in hero block", ...)` may need updates:
- They assert `prayer-widget-iqamah-pulse` on the iqamah `<time>` — still valid, but the element structure changed.
- `expect(pulsing!.textContent).toContain(expectedIqamah)` — in v2 the pulsing element contains `Iqamah ${countdown}`, not the raw iqamah time. Update the expectation to match `/Iqamah\s+in\s+\d/i`.

Also the hero-countdown-seconds test (`describe("PrayerWidget — hero countdown with seconds", ...)`) asserts `in M:SS` appears in the dialog. In v2, that format only appears inside the iqamah-mode phrase `Iqamah in M:SS`. Scope the test to iqamah state by setting system time to `15:30:00+10:00` before rendering, and the assertion still holds.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer): v2 hero — single line, Upcoming badge, simplified iqamah"
```

---

## Task 5: Prayer-list iqamah-mode row transitions (active row pulses, next row suppressed)

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` — the `PRAYER_ORDER.map(...)` block inside the prayer list (currently around lines 576–618)
- Modify: `src/components/layout/PrayerWidget.test.tsx` — add iqamah-mode list tests

**Context for the engineer:**
- Today, the prayer list highlights the "next" prayer (e.g. Maghrib) with a white/8% background + dot. Dhuhr (if its iqamah window is live) is shown as `.passed` (dimmed).
- v2: during an iqamah window, the in-window prayer gets the active-row treatment (pulse from Task 1), and the "next" prayer's highlight is suppressed (just a normal row).
- Logic: a row is "active" when `isInIqamahWindow && inIqamahWindow.name === key`. A row is "next" (original highlight) only when NOT `isInIqamahWindow` AND it matches `nextPrayer.name`.
- `inIqamahWindow` is the value returned by `usePrayerInIqamahWindow(prayerSettings)` — which is `null` outside a window and the in-window `PrayerTime & { isNextDay: false }` inside. Read the existing `const inIqamahWindow = usePrayerInIqamahWindow(prayerSettings);` at the top of the component.

- [ ] **Step 1: Write failing tests**

Append to `src/components/layout/PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — prayer list iqamah-mode transitions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("inside iqamah window: active prayer row has the pulse class, dot animates", () => {
    // 3:30 PM Melbourne — inside real Asr iqamah window on 2026-04-15
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    // Look up the row whose data-prayer attr matches the in-window prayer.
    // On the mocked real schedule for 2026-04-15, the active prayer is Asr.
    const asrRow = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrRow).not.toBeNull();
    expect(asrRow.className).toMatch(/prayer-widget-row-active/);
    // The dot inside the row animates
    const dot = asrRow.querySelector(".prayer-widget-row-dot");
    expect(dot).not.toBeNull();
    // data attribute flips so CSS / tests can observe the state
    expect(asrRow.dataset.isActive).toBe("true");
  });

  it("inside iqamah window: 'next' highlight is suppressed (Maghrib is no longer highlighted)", () => {
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const maghribRow = document.querySelector('[data-prayer="maghrib"]') as HTMLElement;
    expect(maghribRow).not.toBeNull();
    // In v2, when another prayer is active, the "next" bg and dot are suppressed.
    expect(maghribRow.className).not.toMatch(/bg-white\/\[0\.08\]/);
    expect(maghribRow.dataset.isNext).toBeUndefined();
  });

  it("outside iqamah window: next prayer is highlighted normally", () => {
    // 3:19 PM — 10 min before real-schedule Asr adhan (3:29 PM)
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const asrRow = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrRow).not.toBeNull();
    // No active-row pulse
    expect(asrRow.className).not.toMatch(/prayer-widget-row-active/);
    // But the next-highlight is on (bg, dot)
    expect(asrRow.dataset.isNext).toBe("true");
  });
});
```

- [ ] **Step 2: Run failing tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "prayer list iqamah-mode"`
Expected: all FAIL.

- [ ] **Step 3: Update the prayer-row map**

Replace the `{PRAYER_ORDER.map(({ key, displayName }) => { ... })}` block inside the prayer list container with:

```tsx
              {PRAYER_ORDER.map(({ key, displayName }) => {
                const row = viewedPrayers[key];
                const isActive =
                  isViewingToday &&
                  isInIqamahWindow &&
                  inIqamahWindow !== null &&
                  inIqamahWindow.name === key;
                const isNext =
                  isViewingToday &&
                  !isInIqamahWindow &&
                  nextPrayer.name === key;
                const [iqH, iqM] = toISO24Hour(row.iqamah).split(":").map(Number);
                const iqamahMinutes = iqH * 60 + iqM;
                const isPassed =
                  isViewingToday &&
                  currentMelbMinutes !== null &&
                  currentMelbMinutes >= iqamahMinutes &&
                  !isNext &&
                  !isActive;
                return (
                  <div
                    key={key}
                    data-prayer={key}
                    data-is-next={isNext ? "true" : undefined}
                    data-is-active={isActive ? "true" : undefined}
                    data-is-passed={isPassed ? "true" : undefined}
                    className={
                      "grid grid-cols-subgrid col-span-3 items-baseline px-3 py-2.5 sm:py-3.5 rounded-lg transition-colors " +
                      (isPassed ? "opacity-40 " : "") +
                      (isActive ? "prayer-widget-row-active " : "") +
                      (isNext ? "bg-white/[0.08]" : "")
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      {isNext && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" aria-hidden="true" />}
                      {isActive && (
                        <span
                          className="w-2 h-2 rounded-full bg-lime-300 flex-shrink-0 prayer-widget-row-dot"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={
                          "text-sm uppercase tracking-wider font-semibold " +
                          (isActive ? "text-lime-300 " : isNext ? "text-white " : "text-white/60")
                        }
                      >
                        {displayName}
                      </span>
                    </div>
                    <time
                      className="block text-xl font-mono tracking-tight text-white whitespace-nowrap justify-self-end"
                      dateTime={toISO24Hour(row.adhan)}
                    >
                      {row.adhan}
                    </time>
                    <time
                      className="block text-base font-mono text-white/50 whitespace-nowrap justify-self-end"
                      dateTime={toISO24Hour(row.iqamah)}
                    >
                      {row.iqamah}
                    </time>
                  </div>
                );
              })}
```

Note the three-way state: `isActive` takes precedence, then `isNext`, then the fall-through. `isPassed` excludes both so the active row is never shown as passed even if `currentMelbMinutes` has exceeded the iqamah minute for that specific row (during the window it's *active*, not *passed*).

- [ ] **Step 4: Re-run iqamah-mode list tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "prayer list iqamah-mode"`
Expected: all 3 PASS.

- [ ] **Step 5: Run full widget tests**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx`

Existing passed-prayers tests (`describe("PrayerWidget — passed prayers dimmed", ...)`) still apply. The "active prayer not marked as passed" is now enforced by the `!isActive` guard on `isPassed`. If an existing test asserted Dhuhr at 3:30 PM was passed, update it to reflect the v2 semantics: at 3:30 PM Dhuhr has long passed (iqamah at 12:32), so Dhuhr IS passed — but Asr is active. Re-read the test carefully before editing.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer): v2 prayer list — active-row pulse in iqamah mode"
```

---

## Task 6: Micro-interactions (press feedback, hover rotation, modal overshoot)

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` — pill transition, close button, modal transition

**Context for the engineer:**
- Pill currently has `:hover { translateY(-2px) }` and `:active { scale(0.96) }` — leave as is if already present; verify.
- Modal currently slides with `cubic-bezier(0.33, 1, 0.68, 1)` (standard ease-out). v2 uses `cubic-bezier(0.34, 1.12, 0.64, 1)` — slight overshoot for a subtle settle.
- Close `×` button rotates 90° on hover. We already transition colour/bg; add a `transform` transition and a `:hover` rule.
- Date-nav prev/next/reset buttons: add scale-down on `:active` for tactile press feedback.

Most of these live in the element's `className` (Tailwind utilities) or inline `style` for cubic-bezier precision. Tailwind 4 supports arbitrary easing via `ease-[cubic-bezier(...)]`, but for reliability use inline `style`.

- [ ] **Step 1: Update the modal transition to use overshoot bezier**

In `src/components/layout/PrayerWidget.tsx`, find the modal `style={{ ... transition: prefersReducedMotion ... }}` block (around line 430). Change the transform cubic-bezier to `cubic-bezier(0.34, 1.12, 0.64, 1)`:

```tsx
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : "opacity 320ms cubic-bezier(0.33, 1, 0.68, 1), " +
              "transform 520ms cubic-bezier(0.34, 1.12, 0.64, 1)",
```

- [ ] **Step 2: Add close-button hover rotation**

Find the close button (the one with `aria-label="Close prayer times"`). It already has `transition-colors`; swap to a richer transition and add `group` semantics. Update `className` from:

```tsx
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-md text-2xl font-light leading-none transition-colors flex items-center justify-center flex-shrink-0"
```

to:

```tsx
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 hover:rotate-90 active:scale-90 rounded-md text-2xl font-light leading-none transition-all duration-200 ease-out flex items-center justify-center flex-shrink-0"
```

Tailwind 4 supports `hover:rotate-90`, `active:scale-90`, and `transition-all`.

- [ ] **Step 3: Add date-nav button press feedback**

Find the three date-nav buttons (`Previous day`, `Next day`, `Reset`) and add `active:scale-95` and `transition-transform` to each. Example for the prev button:

```tsx
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 active:scale-95 rounded-md text-xl font-light transition-all duration-150 flex items-center justify-center"
```

Do the same for the next button and the Reset button. The Today chip gets the same `active:scale-95` treatment.

- [ ] **Step 4: Verify pill press state is still present**

Check that the pill button (at line 341) has both `:hover` lift and `:active` scale. If not present, add to the pill's inline style via a Tailwind class on the className string:

If the className currently contains `"cursor-pointer ..."`, append `"... active:scale-[0.96] ..."` and ensure `transition` includes `transform`.

The existing inline style already has `transform` in its transition list, so Tailwind's `active:scale-[0.96]` should take effect.

- [ ] **Step 5: Run the full widget test suite**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx`
Expected: all tests still pass. Micro-interactions are presentational; they should not affect assertions.

- [ ] **Step 6: Visual smoke**

Run: `npm run dev`

Open localhost:3000. Hover the × → it rotates. Click the pill → subtle scale-down before the slide-down. Click next/prev → small scale-down. Modal slides up with a slight settle at the end.

If nothing visibly changes, check that Tailwind 4 actually compiled the new utility classes (sometimes arbitrary values fail silently). Fall back to inline `style` if utility classes don't apply.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx
git commit -m "feat(prayer): v2 micro-interactions (close rotate, modal overshoot, press feedback)"
```

---

## Task 7: Full validate + cleanup + PR

**Files:**
- Potentially modify: `src/components/layout/PrayerWidget.tsx` — remove now-unused helpers
- Potentially modify: `src/components/layout/PrayerWidget.test.tsx` — remove now-obsolete tests

**Context for the engineer:**
- By the end of Task 6, the widget should fully match the v2 spec.
- Some helpers may now be unused. Specifically: `formatCountdown` is used only inside the iqamah-mode hero and pill strings (`Iqamah ${countdown}`) and the SR live region. Verify before deleting. `formatCountdownForSR` is used only for the SR live region — still needed.
- Any test that asserts a `·` separator in the pill, or the old `Athan 5:54 PM` sub-line, is now obsolete and should be removed.

- [ ] **Step 1: Grep for unused helpers**

Run: `grep -n "formatCountdown\b\|formatCountdownForSR" src/components/layout/PrayerWidget.tsx`
Expected: both should still appear — `formatCountdown` inside the `countdown` memo (line ~306), `formatCountdownForSR` inside the SR region. If either is no longer referenced (beyond its own definition), delete it.

- [ ] **Step 2: Grep for stale assertions in tests**

Run: `grep -nE "Next prayer|Prayer Times|Athan.*PM.*Iqamah" src/components/layout/PrayerWidget.test.tsx`

Each match is a candidate for removal or update. The `aria-label="Prayer Times"` on the dialog is fine — keep tests that assert role=dialog by accessible name. The visible `<h2>Prayer Times</h2>` is gone; any test that `getByText("Prayer Times")` must be removed.

Update or delete as needed. Commit each obsolete-test removal separately if they're mechanically distinct, or bundle them into one cleanup commit.

- [ ] **Step 3: Run the full validate**

Run: `npm run validate`
Expected: zero errors, zero warnings, all tests pass, build succeeds, Sanity content audit clean.

If any step fails:
- Type errors — usually a stale reference to a variable that was removed. Read the error line carefully.
- Lint warnings — Tailwind class order or unused imports. Auto-fixable via `npm run lint:fix` for most.
- Test failures — either a stale assertion (see Step 2) or a genuine regression. Treat genuine regressions as bugs, not test noise; fix the code or the spec, whichever is right.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`

Checklist in the browser (localhost:3000):
- Pill shows `● [UPCOMING] MAGHRIB 5:54 PM` (or current next prayer). No countdown. Tap label shows on ≥520px. ✓
- Click pill → modal slides up with a subtle overshoot. ✓
- Header reads `Melbourne · <date>` on left, `‹ 📅 Today ›` in middle, `×` on right. No "Prayer Times" title. ✓
- Hero shows `[UPCOMING] <NAME> <ATHAN> · IQAMAH <IQAMAH>` in one line. No countdown. ✓
- Hover × → rotates 90°. Click × → modal slides down. ✓
- Resize to narrow mobile (≤480px) — Tap label hides, grab handle shows. ✓
- Resize to wide desktop (≥768px) — grab handle hides. ✓
- If the clock is inside an iqamah window (you can simulate with DevTools date override): pill pulses + shows `● <NAME> IQAMAH IN <MM:SS>`; hero shows `<NAME> IQAMAH IN <MM:SS>` with lime wash bg; the active prayer's row in the list pulses; the originally-next prayer has no highlight. ✓

- [ ] **Step 5: Rebase onto latest main if needed**

Run:
```bash
git fetch origin main
git rebase origin/main
npm run validate
```

If the rebase produces conflicts, resolve them (likely in `PrayerWidget.tsx` only since other files weren't touched in this branch). Re-run validate.

- [ ] **Step 6: Push**

```bash
git push -u origin feature/prayer-widget-v2-design
```

- [ ] **Step 7: Open PR**

```bash
gh pr create --title "feat(prayer-widget): v2 design (Upcoming badge, single-line hero, iqamah mode)" --body "$(cat <<'EOF'
## Summary

Implements the v2 prayer widget design per [spec](docs/superpowers/specs/2026-04-19-prayer-widget-v2-design.md):

- **Pill**: `UPCOMING` badge replaces the "Next prayer" label. Countdown removed. Whole-pill pulse when a prayer is in its iqamah window. All-caps text.
- **Modal header**: single row — `Melbourne · <date>` + centred date-nav + close button. No "Prayer Times" title (context-obvious). Grab handle hidden on desktop.
- **Today chip**: pill-shaped button with a calendar icon.
- **Hero**: one line — `[UPCOMING] <NAME> <ATHAN> · IQAMAH <IQAMAH>`. Bold name+athan, lighter iqamah trailer. Collapses to `<NAME> IQAMAH IN M:SS` on a lime-washed card during an iqamah window.
- **Prayer list**: the in-window prayer gets an active-row pulse (lime tint + dot pulse). The originally-next prayer's highlight is suppressed during iqamah so pill/hero/list agree on state.
- **Micro-interactions**: press scale on pill + nav buttons, 90° close rotation, modal slide-up with slight overshoot.

No hook changes, no schema changes. Reuses existing `usePrayerInIqamahWindow` (now SSR-safe from PR #58).

## Test plan

- [x] `npm run type-check`
- [x] `npm run lint`
- [x] `npm run test:run`
- [x] `npm run build`
- [x] Manual: pill, modal header, hero, list — all three states (normal, iqamah, passed)
- [x] Manual: mobile (390px) and desktop (1200px) viewports
- [x] Manual: reduced-motion preference (pulse stops, static glow remains)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 8: Mark task complete**

Return the PR URL.
