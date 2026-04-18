# Prayer Widget Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three focused cleanup changes to the existing `PrayerWidget`: swap grid hierarchy (athan primary, iqamah secondary), add a Melbourne location label in the modal header, and pulse the iqamah time in the hero block during the athan→iqamah window.

**Architecture:** One new pure helper in `src/lib/prayer-times.ts` (`getPrayerInIqamahWindow`) and one new React hook in `src/hooks/usePrayerTimes.ts` (`usePrayerInIqamahWindow`) that ticks every 15 seconds. The widget consumes both and, when a prayer is in its iqamah window, swaps the hero data source to that prayer, retargets the countdown to iqamah, and applies a new CSS pulse class. Grid-cell markup reorders athan first, iqamah second with an "Iqamah" micro-label.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest + Testing Library (`jsdom`), Tailwind CSS 4, `Australia/Melbourne` timezone enforced via `src/lib/time.ts` and `vitest.config.ts`.

**Spec:** [docs/superpowers/specs/2026-04-18-prayer-widget-cleanup-design.md](../specs/2026-04-18-prayer-widget-cleanup-design.md)

---

## File Structure

| Path | Responsibility | Change type |
|---|---|---|
| `src/lib/prayer-times.ts` | Pure prayer-time math. Gets new `getPrayerInIqamahWindow` export. | Modify |
| `src/lib/prayer-times.test.ts` | Pure-helper tests. | Modify (append describe block) |
| `src/hooks/usePrayerTimes.ts` | Client hooks that wrap the pure math with tick intervals. Gets new `usePrayerInIqamahWindow` hook. | Modify |
| `src/hooks/usePrayerTimes.test.tsx` | Hook tests. **New file.** | Create |
| `src/app/globals.css` | Global stylesheet; already hosts `prayer-widget-pulse-ring`. Gets new `prayer-widget-iqamah-pulse`. | Modify |
| `src/components/layout/PrayerWidget.tsx` | The widget component. All three user-visible changes land here. | Modify |
| `src/components/layout/PrayerWidget.test.tsx` | Widget tests. New assertions for grid swap, Melbourne label, and pulse behaviour. | Modify |

No new routes, no new Sanity schemas, no new types in `src/types/sanity.ts`.

---

## Task 1: Add `getPrayerInIqamahWindow` pure helper

**Files:**
- Modify: `src/lib/prayer-times.ts` (add new exported function at end of file)
- Test: `src/lib/prayer-times.test.ts` (append new describe block)

**Context for the engineer:**
- Melbourne tz is enforced via `getMelbourneMinutesOfDay(date)` (already imported at line 11 of `prayer-times.ts`). Do not call `date.getHours()` or similar — see CLAUDE.md "Dates and hydration" rules.
- `to24Hour(timeStr)` is a file-private helper defined at line 534 of `prayer-times.ts`. Use it directly — no export needed since we're in the same module.
- The existing `getNextPrayer` at line 698 is the template. It iterates the six prayers and skips `sunrise`. Mirror that structure.
- Vitest's `TZ` is pinned to `Australia/Melbourne` in `vitest.config.ts`, so `new Date("2026-04-15T15:42:00")` in a test is interpreted as Melbourne-local.

- [ ] **Step 1: Write the failing tests**

Append this describe block at the end of `src/lib/prayer-times.test.ts`:

```ts
describe("getPrayerInIqamahWindow", () => {
  // 2026-04-15 is a non-DST autumn day in Melbourne (AEST, UTC+10).
  // Using the default prayer schedule + default iqamah offsets for that day.
  // Asr on 2026-04-15 is 3:42 PM athan → 3:52 PM iqamah (10-min gap).
  // We verify by querying getPrayerTimesForDate to avoid hard-coding the schedule.
  const baseDate = new Date("2026-04-15T12:00:00+10:00");
  const schedule = getPrayerTimesForDate(baseDate);
  const asrAthan = schedule.asr.adhan;   // e.g. "3:42 PM"
  const asrIqamah = schedule.asr.iqamah; // e.g. "3:52 PM"

  function timeOnDate(time: string, dayISO: string): Date {
    // Parse "3:42 PM" → { h:15, m:42 } and construct a Melbourne-local Date.
    const match = time.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i)!;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
    // TZ=Australia/Melbourne is pinned by vitest.config.ts, so this constructor
    // interprets h:m as Melbourne-local.
    return new Date(`${dayISO}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
  }

  it("returns null one minute before athan", () => {
    const oneMinBefore = new Date(timeOnDate(asrAthan, "2026-04-15").getTime() - 60_000);
    expect(getPrayerInIqamahWindow(oneMinBefore)).toBeNull();
  });

  it("returns the prayer exactly at athan time", () => {
    const atAthan = timeOnDate(asrAthan, "2026-04-15");
    const result = getPrayerInIqamahWindow(atAthan);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("asr");
    expect(result!.adhan).toBe(asrAthan);
    expect(result!.iqamah).toBe(asrIqamah);
  });

  it("returns the prayer one minute before iqamah", () => {
    const oneMinBeforeIqamah = new Date(timeOnDate(asrIqamah, "2026-04-15").getTime() - 60_000);
    const result = getPrayerInIqamahWindow(oneMinBeforeIqamah);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("asr");
  });

  it("returns null exactly at iqamah time (window is closed-open)", () => {
    const atIqamah = timeOnDate(asrIqamah, "2026-04-15");
    expect(getPrayerInIqamahWindow(atIqamah)).toBeNull();
  });

  it("returns null well after iqamah", () => {
    const wellAfter = new Date(timeOnDate(asrIqamah, "2026-04-15").getTime() + 30 * 60_000);
    expect(getPrayerInIqamahWindow(wellAfter)).toBeNull();
  });

  it("skips sunrise (no congregational iqamah)", () => {
    // Force an instant at sunrise athan by reading from the schedule.
    const sunriseAthan = schedule.sunrise.adhan;
    const atSunrise = timeOnDate(sunriseAthan, "2026-04-15");
    expect(getPrayerInIqamahWindow(atSunrise)).toBeNull();
  });
});
```

Also update the top-level import so the test file has `getPrayerTimesForDate` and `getPrayerInIqamahWindow`:

```ts
import { getNextPrayer, addMinutesToTime, getPrayerTimesForDate, getPrayerInIqamahWindow } from "./prayer-times";
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/prayer-times.test.ts`
Expected: FAIL with "getPrayerInIqamahWindow is not a function" (or similar export error).

- [ ] **Step 3: Implement the helper**

Append this export at the end of `src/lib/prayer-times.ts` (after `getPrayerTimesSimple`):

```ts
/**
 * Returns the prayer currently inside its athan→iqamah congregational window,
 * or `null` if no prayer is in that window right now.
 *
 * The window is closed-open: `[adhan, iqamah)`. At the exact iqamah minute the
 * window closes and this returns `null` — the widget hero then advances to the
 * next prayer.
 *
 * Sunrise is skipped because there is no congregational iqamah.
 * All comparisons are in Melbourne minute-of-day via `getMelbourneMinutesOfDay`.
 */
export function getPrayerInIqamahWindow(
  date: Date = new Date(),
  prayerSettings?: SanityPrayerSettings | null,
): (PrayerTime & { isNextDay: false }) | null {
  const times = getPrayerTimesForDate(date, prayerSettings);
  const currentMinutes = getMelbourneMinutesOfDay(date);

  const prayers: PrayerTime[] = [
    times.fajr,
    times.sunrise,
    times.dhuhr,
    times.asr,
    times.maghrib,
    times.isha,
  ];

  for (const prayer of prayers) {
    if (prayer.name === "sunrise") continue;

    const adhan24 = to24Hour(prayer.adhan);
    const iqamah24 = to24Hour(prayer.iqamah);
    const [adhanH, adhanM] = adhan24.split(":").map(Number);
    const [iqamahH, iqamahM] = iqamah24.split(":").map(Number);
    const adhanMinutes = adhanH * 60 + adhanM;
    const iqamahMinutes = iqamahH * 60 + iqamahM;

    if (currentMinutes >= adhanMinutes && currentMinutes < iqamahMinutes) {
      return { ...prayer, isNextDay: false };
    }
  }

  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/prayer-times.test.ts`
Expected: PASS (all existing tests plus the six new cases in the new describe block).

- [ ] **Step 5: Commit**

```bash
git add src/lib/prayer-times.ts src/lib/prayer-times.test.ts
git commit -m "feat(prayer): add getPrayerInIqamahWindow helper"
```

---

## Task 2: Add `usePrayerInIqamahWindow` React hook

**Files:**
- Modify: `src/hooks/usePrayerTimes.ts` (add new hook)
- Create: `src/hooks/usePrayerTimes.test.tsx` (new file)

**Context for the engineer:**
- The existing `useNextPrayer` at line 74 of `usePrayerTimes.ts` is the template. It uses a `tick` state + `setInterval` to force re-computation. Our hook mirrors that pattern but with a 15s interval (vs 60s for `useNextPrayer`) so the window closes promptly at iqamah.
- No existing test file for hooks. Create `usePrayerTimes.test.tsx` using the project's `@/test/test-utils` custom render helper. See `src/components/layout/PrayerWidget.test.tsx` lines 1–12 for the import pattern and mock style.
- Use `renderHook` from `@testing-library/react` — already available in the project because `@testing-library/react` is a direct dependency.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/usePrayerTimes.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrayerInIqamahWindow } from "./usePrayerTimes";
import { getPrayerTimesForDate } from "@/lib/prayer-times";

describe("usePrayerInIqamahWindow", () => {
  const baseDate = new Date("2026-04-15T12:00:00+10:00");
  const schedule = getPrayerTimesForDate(baseDate);
  const asrIqamah = schedule.asr.iqamah; // e.g. "3:52 PM"

  function parseTimeOnDay(time: string, dayISO: string): Date {
    const m = time.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i)!;
    let h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
    return new Date(
      `${dayISO}T${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`
    );
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null before the window opens", () => {
    // 2026-04-15 3:00 PM Melbourne — before Asr (3:42)
    vi.setSystemTime(new Date("2026-04-15T15:00:00+10:00"));
    const { result } = renderHook(() => usePrayerInIqamahWindow(null));
    expect(result.current).toBeNull();
  });

  it("returns the prayer inside the window", () => {
    // 1 minute after Asr athan — solidly inside the 10-minute window
    const atAthan = parseTimeOnDay(schedule.asr.adhan, "2026-04-15");
    vi.setSystemTime(new Date(atAthan.getTime() + 60_000));
    const { result } = renderHook(() => usePrayerInIqamahWindow(null));
    expect(result.current).not.toBeNull();
    expect(result.current!.name).toBe("asr");
  });

  it("transitions to null after iqamah passes and the 15s tick fires", () => {
    // Start 30s before iqamah — still inside the window
    const iqamah = parseTimeOnDay(asrIqamah, "2026-04-15");
    vi.setSystemTime(new Date(iqamah.getTime() - 30_000));
    const { result } = renderHook(() => usePrayerInIqamahWindow(null));
    expect(result.current).not.toBeNull();

    // Advance system time past iqamah and run the hook's 15s tick
    act(() => {
      vi.setSystemTime(new Date(iqamah.getTime() + 1_000));
      vi.advanceTimersByTime(15_000);
    });

    expect(result.current).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/hooks/usePrayerTimes.test.tsx`
Expected: FAIL with "usePrayerInIqamahWindow is not exported from ./usePrayerTimes".

- [ ] **Step 3: Implement the hook**

Append this to `src/hooks/usePrayerTimes.ts` (below `useNextPrayer`):

```ts
import { getPrayerInIqamahWindow } from "@/lib/prayer-times";

/**
 * Returns the prayer currently inside its athan→iqamah congregational window,
 * or `null` if no prayer is in that window right now.
 *
 * Re-computes every 15 seconds so the window closes promptly (within 15s of
 * the iqamah minute) and the widget's pulse ends at the right moment.
 */
export function usePrayerInIqamahWindow(
  prayerSettings?: SanityPrayerSettings | null,
): ReturnType<typeof getPrayerInIqamahWindow> {
  const [tick, setTick] = useState(0);
  const bumpTick = useCallback(() => setTick((t) => t + 1), []);

  const inWindow = useMemo(
    () => getPrayerInIqamahWindow(new Date(), prayerSettings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prayerSettings, tick],
  );

  useEffect(() => {
    const interval = setInterval(bumpTick, 15 * 1000);
    return () => clearInterval(interval);
  }, [bumpTick]);

  return inWindow;
}
```

Note: the existing top-of-file import already has `useState, useEffect, useMemo, useCallback` and `SanityPrayerSettings`. The only new import is `getPrayerInIqamahWindow`. Add it to the existing import block from `@/lib/prayer-times`:

```ts
import {
  getPrayerTimesForDate,
  getNextPrayer,
  getPrayerInIqamahWindow,
  type TodaysPrayerTimes,
  type PrayerTime,
} from "@/lib/prayer-times";
```

Remove the duplicate standalone `import { getPrayerInIqamahWindow } ...` line if you added one.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/hooks/usePrayerTimes.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePrayerTimes.ts src/hooks/usePrayerTimes.test.tsx
git commit -m "feat(prayer): add usePrayerInIqamahWindow hook (15s tick)"
```

---

## Task 3: Add pulse CSS

**Files:**
- Modify: `src/app/globals.css` (append after the existing `prayer-widget-pulse-ring` block at line ~353)

**Context:** The iqamah pulse is a soft green text glow — the iqamah value is text, not a dot, so we use `text-shadow` + `opacity` rather than a scale/ring animation. Reduced-motion users get a steady green colour instead of a pulse (consistent with how the existing widget handles reduced motion elsewhere).

- [ ] **Step 1: Append the keyframes and class**

Add to `src/app/globals.css` after the `.prayer-widget-pulse-ring` reduced-motion block (so both prayer-widget animations live together):

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
  color: #00ad4c;
}

@media (prefers-reduced-motion: reduce) {
  .prayer-widget-iqamah-pulse {
    animation: none;
    color: #00ad4c;
  }
}
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npm run build`
Expected: build succeeds. No test gate for CSS — visual verification happens in Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(prayer): add iqamah pulse animation class"
```

---

## Task 4: Swap grid hierarchy in `PrayerWidget`

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` lines 491–522 (the grid block)
- Modify: `src/components/layout/PrayerWidget.test.tsx` (add new assertions)

**Context:**
- Current grid shows iqamah as the big number (`text-xl`) and adhan as the small secondary (`text-xs`). We flip these.
- A `Iqamah` micro-label renders next to the small secondary time to keep the two numbers readable.
- The "is next" highlight (green dot + darker weight) currently applies to the iqamah element; it moves to the athan element.

- [ ] **Step 1: Write the failing tests**

Add this describe block to `src/components/layout/PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — grid hierarchy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders athan as the primary (large) time and iqamah as the secondary (small) time", async () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const asrCell = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrCell).not.toBeNull();

    const timeElements = asrCell.querySelectorAll("time");
    expect(timeElements.length).toBe(2);

    const primary = timeElements[0];
    const secondary = timeElements[1];

    // Primary is athan ("3:42 PM"), secondary is iqamah ("3:52 PM")
    expect(primary.textContent).toContain("3:42 PM");
    expect(secondary.textContent).toContain("3:52 PM");

    // Primary carries the large size class, secondary carries the small
    expect(primary.className).toMatch(/text-xl/);
    expect(secondary.className).toMatch(/text-xs/);
  });

  it("renders an 'Iqamah' label next to the secondary time", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const asrCell = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrCell.textContent).toMatch(/Iqamah/);
  });

  it("applies the 'is next' emphasis class to the athan (primary) element, not iqamah", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const asrCell = document.querySelector('[data-prayer="asr"][data-is-next="true"]') as HTMLElement;
    expect(asrCell).not.toBeNull();
    const [primary, secondary] = asrCell.querySelectorAll("time");
    expect(primary.className).toMatch(/font-semibold/);
    expect(secondary.className).not.toMatch(/font-semibold/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "grid hierarchy"`
Expected: FAIL — the current markup has iqamah as primary.

- [ ] **Step 3: Rewrite the grid cell markup**

Replace the existing grid cell block in `src/components/layout/PrayerWidget.tsx` (lines ~491–522, inside the `grid-cols-3 md:grid-cols-6` container) with:

```tsx
{PRAYER_ORDER.map(({ key, displayName }) => {
  const row = viewedPrayers[key];
  const isNext = isViewingToday && nextPrayer.name === key;
  return (
    <div
      key={key}
      data-prayer={key}
      data-is-next={isNext ? "true" : undefined}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {isNext && <span className="w-1 h-1 rounded-full bg-green-600" aria-hidden="true" />}
        <div className={"text-[10px] font-semibold uppercase tracking-[0.12em] " + (isNext ? "text-green-600" : "text-gray-400")}>
          {displayName}
        </div>
      </div>
      <time
        className={
          "block text-xl font-mono tracking-tight " +
          (isNext ? "text-gray-900 font-semibold" : "text-gray-900 font-medium")
        }
        dateTime={toISO24Hour(row.adhan)}
      >
        {row.adhan}
      </time>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Iqamah</span>
        <time
          className="block text-xs text-gray-400 font-mono"
          dateTime={toISO24Hour(row.iqamah)}
        >
          {row.iqamah}
        </time>
      </div>
    </div>
  );
})}
```

Key changes from the existing code:
- First `<time>` now renders `row.adhan` (was `row.iqamah`).
- Second `<time>` now renders `row.iqamah` (was `row.adhan`), wrapped in a flex row next to an `Iqamah` label.
- The `isNext` semibold emphasis stays on the first `<time>` — since that element is now athan, the emphasis moves with it.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "grid hierarchy"`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full widget test suite to check for regressions**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx`
Expected: all previously passing tests still pass. If any existing test asserted the old hierarchy (primary = iqamah), it was a valid assertion of the buggy layout and should be updated to match the new layout — note the change in the commit message.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer): swap grid hierarchy to athan-primary iqamah-secondary"
```

---

## Task 5: Add Melbourne label to modal header

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` line 371 (the `widget-date-label` div)
- Modify: `src/components/layout/PrayerWidget.test.tsx` (add assertion)

**Context:** The date label already exists at line 371–373 with `data-testid="widget-date-label"`. We prepend the string `Melbourne · ` to the formatted date. The pill does not change.

- [ ] **Step 1: Write the failing test**

Append to `PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — Melbourne label", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("prefixes the date label with 'Melbourne · '", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const label = screen.getByTestId("widget-date-label");
    expect(label.textContent).toMatch(/^Melbourne · /);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "Melbourne label"`
Expected: FAIL — label currently starts with the date string.

- [ ] **Step 3: Update the label**

In `src/components/layout/PrayerWidget.tsx`, change the div at line 371 from:

```tsx
<div className="text-xs text-gray-500 mt-0.5" data-testid="widget-date-label">
  {formatMelbourneDate(selectedDate)}
</div>
```

to:

```tsx
<div className="text-xs text-gray-500 mt-0.5" data-testid="widget-date-label">
  Melbourne · {formatMelbourneDate(selectedDate)}
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "Melbourne label"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer): add Melbourne location label to modal header"
```

---

## Task 6: Wire the iqamah pulse into the hero block

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx` (import new hook; compute `heroPrayer`, `isInIqamahWindow`, retargeted countdown; apply pulse class and eyebrow copy)
- Modify: `src/components/layout/PrayerWidget.test.tsx` (add pulse tests)

**Context:**
- When `usePrayerInIqamahWindow` returns a prayer, the hero renders that prayer (not `useNextPrayer`'s return). The eyebrow becomes `Iqamah` and the countdown targets the iqamah minute.
- When it returns `null`, behaviour is identical to today: hero shows next prayer, eyebrow says `Next Prayer`, countdown targets the next prayer's adhan.
- Existing `parsePrayerTimeToDate(time, isNextDay)` (line 52) is the helper you'll reuse — pass `iqamah` instead of `adhan` during a window, `false` for `isNextDay` (the iqamah is always today).

- [ ] **Step 1: Write the failing tests**

Append to `PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — iqamah pulse in hero block", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("pulses the iqamah time in the hero when a prayer is inside its iqamah window", async () => {
    // 1 minute after Asr athan — inside the 10-minute window.
    // Asr athan = 3:42 PM, iqamah = 3:52 PM per the test mock at top of file.
    vi.setSystemTime(new Date("2026-04-15T15:43:00+10:00"));

    // Re-import with pulse-aware hook mock — the global mock at the top of this file
    // stubs useNextPrayer/usePrayerTimes only. We need the real usePrayerInIqamahWindow
    // to run, so extend the existing mock to also return a value for the new hook.
    // (This test relies on the mock extension in Step 3 below.)
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const pulsing = document.querySelector(".prayer-widget-iqamah-pulse");
    expect(pulsing).not.toBeNull();
    // The pulse must land on a <time> element showing the iqamah time
    expect(pulsing!.tagName).toBe("TIME");
    expect(pulsing!.textContent).toContain("3:52 PM");
  });

  it("shows an 'Iqamah' eyebrow label (not 'Next Prayer') during the window", () => {
    vi.setSystemTime(new Date("2026-04-15T15:43:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const dialog = screen.getByRole("dialog");
    // The hero eyebrow — case-insensitive match for "Iqamah"
    expect(dialog.textContent).toMatch(/Iqamah/);
  });

  it("does not apply the pulse class outside any iqamah window", () => {
    // 3:19 PM — 23 min before Asr athan, no prayer in window
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    expect(document.querySelector(".prayer-widget-iqamah-pulse")).toBeNull();
  });
});
```

- [ ] **Step 2: Extend the mock at the top of `PrayerWidget.test.tsx`**

The current mock block (lines 15–27) mocks `usePrayerTimes` and `useNextPrayer`. Extend it to also export `usePrayerInIqamahWindow` whose return value depends on the frozen system time. The simplest approach: have the mock compute its return by calling the real `getPrayerInIqamahWindow` on `new Date()`.

Replace the mock block (lines 15–27) with (do **not** add a top-level import for `getPrayerInIqamahWindow` — the async factory pulls it from `vi.importActual`):

```tsx
vi.mock("@/hooks/usePrayerTimes", async () => {
  const real = await vi.importActual<typeof import("@/lib/prayer-times")>(
    "@/lib/prayer-times"
  );
  return {
    usePrayerTimes: () => ({
      fajr:    { name: "fajr",    displayName: "Fajr",    adhan: "4:58 AM", iqamah: "5:15 AM" },
      sunrise: { name: "sunrise", displayName: "Sunrise", adhan: "6:31 AM", iqamah: "6:46 AM" },
      dhuhr:   { name: "dhuhr",   displayName: "Dhuhr",   adhan: "1:15 PM", iqamah: "1:25 PM" },
      asr:     { name: "asr",     displayName: "Asr",     adhan: "3:42 PM", iqamah: "3:52 PM" },
      maghrib: { name: "maghrib", displayName: "Maghrib", adhan: "5:51 PM", iqamah: "5:56 PM" },
      isha:    { name: "isha",    displayName: "Isha",    adhan: "7:14 PM", iqamah: "7:24 PM" },
    }),
    useNextPrayer: () => ({
      name: "asr", displayName: "Asr", adhan: "3:42 PM", iqamah: "3:52 PM", isNextDay: false,
    }),
    usePrayerInIqamahWindow: () => real.getPrayerInIqamahWindow(new Date()),
  };
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "iqamah pulse"`
Expected: FAIL — `prayer-widget-iqamah-pulse` class is never applied.

- [ ] **Step 4: Wire the hook and pulse into the widget**

Edit `src/components/layout/PrayerWidget.tsx`:

**(a)** Update the hook import block (line 21):

```ts
import { usePrayerTimes, useNextPrayer, usePrayerInIqamahWindow } from "@/hooks/usePrayerTimes";
```

**(b)** Inside the component body, just after the existing `const nextPrayer = useNextPrayer(prayerSettings);` line (around line 119), add:

```ts
const inIqamahWindow = usePrayerInIqamahWindow(prayerSettings);
const heroPrayer = inIqamahWindow ?? nextPrayer;
const isInIqamahWindow = inIqamahWindow !== null;
```

**(c)** Retarget the countdown. Replace the existing line computing `countdownTarget` (around line 254):

```ts
const countdownTarget = parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay);
```

with:

```ts
const countdownTarget = isInIqamahWindow
  ? parsePrayerTimeToDate(heroPrayer.iqamah, false)
  : parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay);
```

**(d)** Rewrite the hero block to use `heroPrayer` and switch the eyebrow/pulse class. Replace the whole "Next prayer — hero block" block (lines ~433–488) with:

```tsx
{/* Hero block — Next prayer OR current prayer in its iqamah window */}
<div
  className="relative mb-8 p-5 pl-6 rounded-2xl overflow-hidden"
  style={{ background: "rgba(0, 173, 76, 0.06)" }}
>
  <span
    className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"
    aria-hidden="true"
  />

  <div className="flex items-center gap-3 mb-4 flex-wrap">
    <span className="text-[10px] font-semibold text-green-700 uppercase tracking-[0.18em]">
      {isInIqamahWindow ? "Iqamah" : "Next Prayer"}
    </span>
    {countdown && (
      <>
        <span className="text-green-300" aria-hidden="true">·</span>
        <span
          className="text-xs font-semibold text-green-700"
          aria-live="polite"
          aria-atomic="true"
        >
          {countdown}
        </span>
      </>
    )}
  </div>

  <div className="flex items-baseline justify-between gap-4 flex-wrap mb-3">
    <div className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-none">
      {heroPrayer.displayName}
    </div>
    <time
      className="text-4xl md:text-5xl font-mono font-semibold text-gray-900 tracking-tight leading-none"
      dateTime={toISO24Hour(heroPrayer.adhan)}
    >
      {heroPrayer.adhan}
    </time>
  </div>

  <div className="flex items-center gap-3 text-sm text-gray-600">
    <span>
      Athan{" "}
      <time className="text-gray-700 font-mono" dateTime={toISO24Hour(heroPrayer.adhan)}>
        {heroPrayer.adhan}
      </time>
    </span>
    <span className="text-green-300" aria-hidden="true">·</span>
    <span>
      Iqamah{" "}
      <time
        className={
          "font-mono font-semibold " +
          (isInIqamahWindow
            ? "prayer-widget-iqamah-pulse"
            : "text-green-700")
        }
        dateTime={toISO24Hour(heroPrayer.iqamah)}
      >
        {heroPrayer.iqamah}
      </time>
    </span>
  </div>
</div>
```

- [ ] **Step 5: Run the pulse tests to verify they pass**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx -t "iqamah pulse"`
Expected: PASS (3 tests).

- [ ] **Step 6: Run the full widget test suite**

Run: `npx vitest run src/components/layout/PrayerWidget.test.tsx`
Expected: all tests pass, including the unchanged pill-skeleton and hydration-regression tests.

- [ ] **Step 7: Run the full validate suite**

Run: `npm run validate`
Expected: type-check, lint, test:run, and build all pass.

- [ ] **Step 8: Manual smoke test**

Start dev server: `npm run dev`

Open http://localhost:3000 in a browser. Verify:
1. Pill shows "Next prayer ... 3:42 PM ... in X min" (unchanged).
2. Click the pill. Modal opens. Header shows `Melbourne · Thursday, 18 April 2026`.
3. In the six-prayer grid, each cell shows the athan time as the big number on top, and "Iqamah 3:52 PM" (or similar) small underneath.
4. If the current Melbourne time happens to fall in any prayer's athan→iqamah window, the iqamah line in the hero block will be pulsing green and the eyebrow will say "Iqamah · in X min". Otherwise hero shows "Next Prayer · in X min" with no pulse.

If the clock isn't naturally in a window during your test, manually override it: open DevTools console and run `Date.now = () => new Date("2026-04-15T15:43:00+10:00").getTime()` then reload — you will be inside the mocked Asr window. **Revert this override before continuing.**

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer): pulse iqamah in hero during athan-to-iqamah window"
```

---

## Post-implementation: PR preparation

- [ ] **Step 1: Confirm branch is rebased on latest main**

```bash
git fetch origin main
git rebase origin/main
npm run validate
```

- [ ] **Step 2: Push**

```bash
git push
```

- [ ] **Step 3: Open PR**

Use `gh pr create` with title `feat(prayer-widget): cleanup pass — grid hierarchy, Melbourne label, iqamah pulse` and a body that summarises the three changes and references the spec at `docs/superpowers/specs/2026-04-18-prayer-widget-cleanup-design.md`.
