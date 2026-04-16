# Prayer Times Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a persistent site-wide prayer times widget — a bottom-center pill that morphs into a full widget — and remove the existing homepage hero prayer bar and `/worshippers` prayer schedule.

**Architecture:** One client component (`PrayerWidget.tsx`) mounted in the root layout, reading the existing `prayerSettings` Sanity singleton via existing `usePrayerTimes` / `useNextPrayer` hooks. Pure CSS transitions (no Framer Motion) for the morph animation. A single scroll-direction hook controls auto-hide. No Sanity schema changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Vitest + Testing Library, existing Sanity client + hooks (read-only).

**Branch:** `feature/prayer-times-widget` (already created from main).

**Spec:** [docs/superpowers/specs/2026-04-15-prayer-widget-design.md](../specs/2026-04-15-prayer-widget-design.md).

---

## File Plan

### Create

| Path | Responsibility |
|---|---|
| `src/hooks/usePrayerWidgetScroll.ts` | Hook: returns `isHidden: boolean` based on scroll direction. Respects `prefers-reduced-motion` and an external `paused` flag. |
| `src/hooks/usePrayerWidgetScroll.test.ts` | Unit tests for the scroll-direction hook. |
| `src/components/layout/PrayerWidget.tsx` | The persistent widget — pill when collapsed, full widget when expanded. Manages all UI state (open/close, selected date). Reads Sanity prayer settings. |
| `src/components/layout/PrayerWidget.test.tsx` | Component tests (rendering, open/close, date picker, scroll, accessibility). |

### Modify

| Path | Change |
|---|---|
| `src/app/globals.css` | Add a small block: one `@keyframes` for the pulsing status dot. |
| `src/app/layout.tsx` | Fetch `prayerSettings` and mount `<PrayerWidget prayerSettings={...} />` at the end of the provider tree. |
| `src/app/page.tsx` | Stop passing `prayerSettings` into `<HeroSection>` (homepage hero no longer needs it). |
| `src/components/sections/HeroSection.tsx` | Remove the entire prayer-times bar below the hero section. Drop `prayerSettings`, `usePrayerTimes`, `useNextPrayer`, `TARAWEEH_CONFIG`, `EID_CONFIG`, `jumuahTimes` imports and references. |
| `src/components/sections/HeroSection.test.tsx` | Remove tests that assert the prayer bar renders. Keep carousel / video / Sanity-slides tests. |
| `src/app/worshippers/WorshippersClient.tsx` | Remove the "Prayer Schedule" section (prayer cards grid + date picker). Keep hero, mosque etiquette, Jumu'ah/Taraweeh/Eid inline row, YouTube section, Get Directions CTA. |
| `src/app/worshippers/WorshippersClient.test.tsx` | Remove tests that assert the prayer schedule grid. Keep other assertions. |

### Delete

| Path | Reason |
|---|---|
| `src/components/ui/PrayerTimesCard.tsx` | Dead code after the hero and worshippers page stop using it. Before deleting, verify no imports remain with `grep -R "PrayerTimesCard" src/`. |

---

## Task 1: Create the scroll-direction hook

**Files:**
- Create: `src/hooks/usePrayerWidgetScroll.ts`
- Test: `src/hooks/usePrayerWidgetScroll.test.ts`

- [ ] **Step 1: Write the failing test file**

Create `src/hooks/usePrayerWidgetScroll.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrayerWidgetScroll } from "./usePrayerWidgetScroll";

describe("usePrayerWidgetScroll", () => {
  beforeEach(() => {
    window.scrollY = 0;
    // Default matchMedia mock returns matches: false (reduced motion disabled)
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function dispatchScroll(y: number) {
    window.scrollY = y;
    window.dispatchEvent(new Event("scroll"));
  }

  it("returns false initially", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    expect(result.current).toBe(false);
  });

  it("hides when scrolling down past the 80px threshold", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(200));
    expect(result.current).toBe(true);
  });

  it("reveals when scrolling up", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(200));
    expect(result.current).toBe(true);
    act(() => dispatchScroll(100));
    expect(result.current).toBe(false);
  });

  it("stays visible when within 80px of top regardless of direction", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(40));
    expect(result.current).toBe(false);
    act(() => dispatchScroll(10));
    expect(result.current).toBe(false);
  });

  it("stays visible when paused", () => {
    const { result } = renderHook(() => usePrayerWidgetScroll(true));
    act(() => dispatchScroll(300));
    expect(result.current).toBe(false);
  });

  it("stays visible when prefers-reduced-motion is set", () => {
    const matchMediaMock = vi.fn().mockImplementation((q: string) => ({
      matches: q.includes("prefers-reduced-motion"),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
    Object.defineProperty(window, "matchMedia", { writable: true, value: matchMediaMock });

    const { result } = renderHook(() => usePrayerWidgetScroll());
    act(() => dispatchScroll(300));
    expect(result.current).toBe(false);
  });

  it("removes scroll listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => usePrayerWidgetScroll());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run src/hooks/usePrayerWidgetScroll.test.ts
```

Expected: FAIL — "Cannot find module './usePrayerWidgetScroll'".

- [ ] **Step 3: Write the hook implementation**

Create `src/hooks/usePrayerWidgetScroll.ts`:

```ts
/**
 * Prayer Widget Scroll Hook
 *
 * Tracks scroll direction to auto-hide the prayer widget pill on scroll down
 * and reveal it on scroll up. Stays visible within 80px of the top.
 * Respects prefers-reduced-motion and an external paused flag (e.g. when the
 * widget is expanded).
 *
 * @module hooks/usePrayerWidgetScroll
 */
"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD_PX = 80;
const DIRECTION_THRESHOLD_PX = 4; // minimum scroll delta to count as a direction change

export function usePrayerWidgetScroll(paused: boolean = false): boolean {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (paused) {
      setIsHidden(false);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const onScroll = () => {
      const y = window.scrollY;
      if (y < SCROLL_THRESHOLD_PX) {
        setIsHidden(false);
      } else if (y > lastScrollY.current + DIRECTION_THRESHOLD_PX) {
        setIsHidden(true);
      } else if (y < lastScrollY.current - DIRECTION_THRESHOLD_PX) {
        setIsHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [paused]);

  return isHidden;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/hooks/usePrayerWidgetScroll.test.ts
```

Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePrayerWidgetScroll.ts src/hooks/usePrayerWidgetScroll.test.ts
git commit -m "feat(prayer-widget): add scroll-direction hook"
```

---

## Task 2: PrayerWidget skeleton — renders the pill only

**Files:**
- Create: `src/components/layout/PrayerWidget.tsx`
- Create: `src/components/layout/PrayerWidget.test.tsx`
- Modify: `src/app/globals.css` (add pulse keyframe)

- [ ] **Step 1: Add pulse keyframe to globals.css**

Append to the end of `src/app/globals.css`:

```css
/* ===== Prayer Widget animation ===== */
@keyframes prayer-widget-pulse-ring {
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(2.5); opacity: 0; }
}

.prayer-widget-pulse-ring {
  animation: prayer-widget-pulse-ring 2s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .prayer-widget-pulse-ring { animation: none; }
}
```

- [ ] **Step 2: Write the failing skeleton test**

Create `src/components/layout/PrayerWidget.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { PrayerWidget } from "./PrayerWidget";

// Override the default next/navigation mock so we can vary pathname per test
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  usePathname: vi.fn(() => "/"),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the prayer hooks
vi.mock("@/hooks/usePrayerTimes", () => ({
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
}));

// Mock the scroll hook so we don't deal with scroll events in component tests.
// Using vi.fn() lets Task 6's tests override the return value per-test with mockReturnValue.
vi.mock("@/hooks/usePrayerWidgetScroll", () => ({
  usePrayerWidgetScroll: vi.fn(() => false),
}));

describe("PrayerWidget — pill skeleton", () => {
  beforeEach(() => {
    // Freeze time so countdown is stable
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T03:19:00+10:00")); // Melbourne AEST = 3:19 PM, 23 min before Asr
  });

  it("renders the pill with the next prayer name and time", () => {
    render(<PrayerWidget prayerSettings={null} />);
    expect(screen.getByRole("button", { name: /open prayer times/i })).toBeInTheDocument();
    expect(screen.getByText("Next prayer")).toBeInTheDocument();
    expect(screen.getByText("Asr")).toBeInTheDocument();
    expect(screen.getByText("3:42 PM")).toBeInTheDocument();
  });

  it("shows a countdown to the next prayer", () => {
    render(<PrayerWidget prayerSettings={null} />);
    // Asr is at 3:42 PM, current time is 3:19 PM → 23 minutes
    expect(screen.getByText(/in 23 min/i)).toBeInTheDocument();
  });

  it("widget content is not visible by default", () => {
    render(<PrayerWidget prayerSettings={null} />);
    // The expanded widget's title "Prayer Times" should be hidden (aria-hidden or display:none)
    const dialog = screen.queryByRole("dialog");
    expect(dialog).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: FAIL — "Cannot find module './PrayerWidget'".

- [ ] **Step 4: Write the skeleton component**

Create `src/components/layout/PrayerWidget.tsx`:

```tsx
/**
 * Prayer Widget
 *
 * A persistent site-wide widget pinned to the bottom-center of every page.
 * Collapsed state: a pill showing the next prayer name, time, and a countdown.
 * Expanded state: a full panel with all six prayer times, special prayers
 * (Jumu'ah/Taraweeh/Eid), and a date picker. A single element morphs between
 * the two shapes with CSS transitions.
 *
 * All prayer times and date operations use the Australia/Melbourne timezone
 * via the existing `usePrayerTimes` / `useNextPrayer` hooks and the
 * `getPrayerTimesForDate` utility. Reads from the existing `prayerSettings`
 * Sanity singleton (read-only — no schema changes).
 *
 * @module components/layout/PrayerWidget
 */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
import type { SanityPrayerSettings } from "@/types/sanity";

interface PrayerWidgetProps {
  prayerSettings: SanityPrayerSettings | null;
}

/**
 * Parse a prayer time string like "3:42 PM" into a Date for today (or
 * tomorrow if `isNextDay`) in the local timezone. Returns `null` on parse
 * failure, which skips the countdown.
 */
function parsePrayerTimeToDate(time: string, isNextDay: boolean): Date | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const target = new Date();
  if (isNextDay) target.setDate(target.getDate() + 1);
  target.setHours(hours, minutes, 0, 0);
  return target;
}

function formatCountdown(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `in ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `in ${h}h ${m}m`;
}

export function PrayerWidget({ prayerSettings }: PrayerWidgetProps) {
  const pathname = usePathname();
  const nextPrayer = useNextPrayer(prayerSettings);

  // Tick countdown every 30s so the "in N min" stays fresh
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Hide on /studio routes (Sanity Studio)
  if (pathname?.startsWith("/studio")) return null;

  const countdownTarget = parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay);
  const countdown = formatCountdown(countdownTarget);
  void now; // Reference `now` so the useEffect-driven re-render re-computes countdown

  return (
    <>
      {/* Pill — collapsed state */}
      <button
        type="button"
        aria-label="Open prayer times"
        className="fixed left-1/2 -translate-x-1/2 bottom-5 flex items-center gap-3 px-4 py-3
                   rounded-full text-white text-sm border border-white/10 z-[1000]
                   cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]
                   hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]
                   transition-[transform,box-shadow] duration-300
                   max-[440px]:w-[calc(100vw-20px)] max-[440px]:rounded-2xl max-[440px]:bottom-3.5 max-[440px]:justify-between"
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #01365c 100%)",
          width: "360px",
        }}
      >
        <span className="flex items-center gap-3 flex-1 max-[440px]:flex-initial">
          <span className="relative w-2 h-2 rounded-full bg-lime-400 flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-lime-400 prayer-widget-pulse-ring" aria-hidden="true" />
          </span>
          <span className="text-white/65 text-[11px] uppercase tracking-wider font-medium max-[440px]:text-[10px]">
            Next prayer
          </span>
          <span className="font-semibold">{nextPrayer.displayName}</span>
          <span className="text-lime-300 font-bold font-mono">{nextPrayer.adhan}</span>
        </span>
        <span className="flex items-center gap-2">
          {countdown && <span className="text-white/55 text-xs">{countdown}</span>}
          <span className="text-white/40 text-[10px]" aria-hidden="true">▴</span>
        </span>
      </button>
    </>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx src/app/globals.css
git commit -m "feat(prayer-widget): add pill skeleton component and pulse keyframe"
```

---

## Task 3: Expanded widget content (next prayer card + grid + special chips)

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx`
- Modify: `src/components/layout/PrayerWidget.test.tsx`

- [ ] **Step 1: Write failing tests for expanded content**

Append these tests to `src/components/layout/PrayerWidget.test.tsx` (inside the existing `describe` block, after the three skeleton tests — or add a new `describe("PrayerWidget — expanded content")` block):

```tsx
describe("PrayerWidget — expanded content (when forced open for layout testing)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T03:19:00+10:00"));
  });

  it("renders all six prayer cards", () => {
    // Use testOpenInitially prop so we don't need to click yet
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    expect(screen.getByText("Fajr")).toBeInTheDocument();
    expect(screen.getByText("Sunrise")).toBeInTheDocument();
    expect(screen.getByText("Dhuhr")).toBeInTheDocument();
    // There may be multiple "Asr" (one in the pill, one in the grid, one in next-prayer card)
    expect(screen.getAllByText("Asr").length).toBeGreaterThan(0);
    expect(screen.getByText("Maghrib")).toBeInTheDocument();
    expect(screen.getByText("Isha")).toBeInTheDocument();
  });

  it("renders the next-prayer highlight card with athan and iqamah", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    expect(screen.getByText("Next Prayer")).toBeInTheDocument();
    expect(screen.getByText("Athan")).toBeInTheDocument();
    expect(screen.getByText("Iqamah")).toBeInTheDocument();
    // 3:42 PM = athan, 3:52 PM = iqamah
    expect(screen.getByText("3:42 PM")).toBeInTheDocument();
    expect(screen.getByText("3:52 PM")).toBeInTheDocument();
  });

  it("renders Jumu'ah chips from Sanity when provided", () => {
    const settings = {
      jumuahArabicTime: "1:00 PM",
      jumuahEnglishTime: "2:15 PM",
    } as unknown as import("@/types/sanity").SanityPrayerSettings;

    render(<PrayerWidget prayerSettings={settings} testOpenInitially />);
    expect(screen.getByText(/Jumu'ah Arabic/i)).toBeInTheDocument();
    expect(screen.getByText("1:00 PM")).toBeInTheDocument();
    expect(screen.getByText(/Jumu'ah English/i)).toBeInTheDocument();
    expect(screen.getByText("2:15 PM")).toBeInTheDocument();
  });

  it("renders Taraweeh chip only when enabled in Sanity", () => {
    const { rerender } = render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    expect(screen.queryByText(/Taraweeh/i)).not.toBeInTheDocument();

    rerender(
      <PrayerWidget
        prayerSettings={{
          taraweehEnabled: true,
          taraweehTime: "8:30 PM",
        } as unknown as import("@/types/sanity").SanityPrayerSettings}
        testOpenInitially
      />
    );
    expect(screen.getByText(/Taraweeh/i)).toBeInTheDocument();
    expect(screen.getByText("8:30 PM")).toBeInTheDocument();
  });

  it("renders Eid al-Fitr chip only when eidFitrActive is true", () => {
    render(
      <PrayerWidget
        prayerSettings={{
          eidFitrActive: true,
          eidFitrTime: "7:00 AM",
        } as unknown as import("@/types/sanity").SanityPrayerSettings}
        testOpenInitially
      />
    );
    expect(screen.getByText(/Eid al-Fitr/i)).toBeInTheDocument();
    expect(screen.getByText("7:00 AM")).toBeInTheDocument();
  });

  it("highlights the next prayer card visually (has is-next class)", () => {
    const { container } = render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const asrCard = container.querySelector('[data-prayer="asr"]');
    expect(asrCard).toHaveAttribute("data-is-next", "true");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: FAIL — expanded content not yet rendered; `testOpenInitially` prop does not exist.

- [ ] **Step 3: Extend the component with expanded content (always-rendered pattern)**

**Critical detail:** CSS transitions do NOT fire on mount/unmount. For the pill↔widget morph to animate smoothly, both elements must always exist in the DOM. We toggle their visibility with `opacity`, `transform`, `pointer-events`, and `aria-hidden` — letting CSS transitions handle the animation. `queryByRole("dialog")` in tests will still return `null` for an `aria-hidden="true"` dialog, so the existing `"widget content is not visible by default"` test from Task 2 still passes.

Replace the entire content of `src/components/layout/PrayerWidget.tsx`:

```tsx
/**
 * Prayer Widget
 *
 * A persistent site-wide widget pinned to the bottom-center of every page.
 * Collapsed state: a pill showing the next prayer name, time, and a countdown.
 * Expanded state: a full panel with all six prayer times, special prayers
 * (Jumu'ah/Taraweeh/Eid), and a date picker. A single element morphs between
 * the two shapes with CSS transitions.
 *
 * All prayer times and date operations use the Australia/Melbourne timezone
 * via the existing `usePrayerTimes` / `useNextPrayer` hooks and the
 * `getPrayerTimesForDate` utility. Reads from the existing `prayerSettings`
 * Sanity singleton (read-only — no schema changes).
 *
 * @module components/layout/PrayerWidget
 */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
import { getPrayerTimesForDate, type PrayerName, type TodaysPrayerTimes } from "@/lib/prayer-times";
import type { SanityPrayerSettings } from "@/types/sanity";

interface PrayerWidgetProps {
  prayerSettings: SanityPrayerSettings | null;
  /** Test-only: forces the widget to render in the expanded state on mount. */
  testOpenInitially?: boolean;
}

interface PrayerRowConfig {
  key: PrayerName;
  displayName: string;
}

const PRAYER_ORDER: PrayerRowConfig[] = [
  { key: "fajr",    displayName: "Fajr" },
  { key: "sunrise", displayName: "Sunrise" },
  { key: "dhuhr",   displayName: "Dhuhr" },
  { key: "asr",     displayName: "Asr" },
  { key: "maghrib", displayName: "Maghrib" },
  { key: "isha",    displayName: "Isha" },
];

function parsePrayerTimeToDate(time: string, isNextDay: boolean): Date | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const target = new Date();
  if (isNextDay) target.setDate(target.getDate() + 1);
  target.setHours(hours, minutes, 0, 0);
  return target;
}

function formatCountdown(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `in ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `in ${h}h ${m}m`;
}

function formatCountdownShort(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m`;
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
}

export function PrayerWidget({ prayerSettings, testOpenInitially = false }: PrayerWidgetProps) {
  const pathname = usePathname();
  const todaysPrayers = usePrayerTimes(prayerSettings);
  const nextPrayer = useNextPrayer(prayerSettings);
  const [isOpen, setIsOpen] = useState(testOpenInitially);

  // Tick countdown every 30s
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  void now;

  if (pathname?.startsWith("/studio")) return null;

  const countdownTarget = parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay);
  const countdown = formatCountdown(countdownTarget);
  const countdownShort = formatCountdownShort(countdownTarget);

  const jumuahArabic = prayerSettings?.jumuahArabicTime;
  const jumuahEnglish = prayerSettings?.jumuahEnglishTime;
  const taraweehEnabled = prayerSettings?.taraweehEnabled ?? false;
  const taraweehTime = prayerSettings?.taraweehTime;
  const eidFitrActive = prayerSettings?.eidFitrActive ?? false;
  const eidFitrTime = prayerSettings?.eidFitrTime;
  const eidAdhaActive = prayerSettings?.eidAdhaActive ?? false;
  const eidAdhaTime = prayerSettings?.eidAdhaTime;

  return (
    <>
      {/* Pill — always rendered, hidden via CSS when expanded */}
      <button
        type="button"
        aria-label="Open prayer times"
        aria-hidden={isOpen ? "true" : undefined}
        tabIndex={isOpen ? -1 : 0}
        onClick={() => setIsOpen(true)}
        className="fixed left-1/2 flex items-center gap-3 px-4 py-3
                   rounded-full text-white text-sm border border-white/10 z-[1000]
                   cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]
                   hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]
                   max-[440px]:rounded-2xl max-[440px]:justify-between"
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #01365c 100%)",
          width: "360px",
          bottom: "20px",
          transform: isOpen
            ? "translateX(-50%) translateY(120px) scale(0.9)"
            : "translateX(-50%)",
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? "none" : "auto",
          transition:
            "opacity 220ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "transform 400ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "box-shadow 300ms ease",
        }}
      >
        <span className="flex items-center gap-3 flex-1 max-[440px]:flex-initial">
          <span className="relative w-2 h-2 rounded-full bg-lime-400 flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-lime-400 prayer-widget-pulse-ring" aria-hidden="true" />
          </span>
          <span className="text-white/65 text-[11px] uppercase tracking-wider font-medium max-[440px]:text-[10px]">
            Next prayer
          </span>
          <span className="font-semibold">{nextPrayer.displayName}</span>
          <span className="text-lime-300 font-bold font-mono">{nextPrayer.adhan}</span>
        </span>
        <span className="flex items-center gap-2">
          {countdown && <span className="text-white/55 text-xs">{countdown}</span>}
          <span className="text-white/40 text-[10px]" aria-hidden="true">▴</span>
        </span>
      </button>

      {/* Expanded widget — always rendered, hidden via CSS when collapsed */}
      <div
        role="dialog"
        aria-label="Prayer Times"
        aria-hidden={isOpen ? undefined : "true"}
        aria-modal={isOpen ? "true" : undefined}
        className="fixed left-1/2 bottom-0 bg-white z-[950]
                   rounded-t-3xl overflow-hidden flex flex-col
                   shadow-[0_-24px_64px_rgba(0,0,0,0.22),0_-4px_16px_rgba(0,0,0,0.08)]
                   max-[440px]:w-[calc(100vw-24px)]"
        style={{
          width: "min(720px, calc(100vw - 24px))",
          height: "min(540px, calc(100vh - 40px))",
          transform: isOpen
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(100%)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "opacity 320ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "transform 520ms cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      >
          <div className="w-12 h-[5px] bg-gray-300 rounded-full mx-auto mt-2.5 flex-shrink-0" aria-hidden="true" />

          {/* Header — date picker nav will be filled in Task 5 */}
          <div className="px-6 pb-4 pt-2 border-b border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
            <div>
              <h2 className="text-xl font-serif text-gray-900">Prayer Times</h2>
              <div className="text-xs text-gray-500 font-medium" data-testid="widget-date-label">
                {/* Filled by Task 5 */}
              </div>
            </div>
            {/* date-picker-nav placeholder — Task 5 */}
          </div>

          <div className="px-6 py-5 pb-6 overflow-y-auto flex-1">
            {/* Next prayer card */}
            <div
              className="relative overflow-hidden rounded-2xl border p-4 mb-5 flex items-center gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(0,173,76,0.10) 0%, rgba(132,204,22,0.08) 100%)",
                borderColor: "rgba(0,173,76,0.22)",
              }}
            >
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0"
                style={{
                  width: "52px",
                  height: "52px",
                  background: "linear-gradient(135deg, #00ad4c 0%, #84cc16 100%)",
                  boxShadow: "0 6px 16px rgba(0,173,76,0.3)",
                }}
                aria-hidden="true"
              >
                ☪
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-green-600 font-bold tracking-wider uppercase mb-0.5">
                  Next Prayer
                </div>
                <div className="text-lg font-bold text-gray-900 font-serif">{nextPrayer.displayName}</div>
                <div className="flex gap-4 text-[13px] mt-1 flex-wrap">
                  <span className="text-gray-500">
                    Athan <strong className="text-gray-900 font-mono font-bold">{nextPrayer.adhan}</strong>
                  </span>
                  <span className="text-gray-500">
                    Iqamah <strong className="text-green-600 font-mono font-bold">{nextPrayer.iqamah}</strong>
                  </span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-center flex-shrink-0 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">In</div>
                <div className="text-base font-bold text-green-600 font-mono mt-0.5">{countdownShort}</div>
              </div>
            </div>

            {/* Prayer grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
              {PRAYER_ORDER.map(({ key, displayName }) => {
                const row = todaysPrayers[key];
                const isNext = nextPrayer.name === key;
                return (
                  <div
                    key={key}
                    data-prayer={key}
                    data-is-next={isNext ? "true" : "false"}
                    className={
                      "rounded-xl p-3 text-center border " +
                      (isNext
                        ? "bg-white border-green-500 shadow-[0_0_0_2px_rgba(0,173,76,0.15),0_4px_12px_rgba(0,173,76,0.1)]"
                        : "bg-gray-50 border-gray-200")
                    }
                  >
                    <div className={"text-xs font-semibold mb-1.5 uppercase tracking-wide " + (isNext ? "text-green-600" : "text-gray-600")}>
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{row.adhan}</div>
                    <div
                      className={
                        "text-sm font-bold font-mono mt-1 pt-1 border-t border-gray-200 " +
                        (isNext ? "text-green-600" : key === "sunrise" ? "text-amber-500" : "text-gray-900")
                      }
                    >
                      {row.iqamah}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special prayers row */}
            {(jumuahArabic || jumuahEnglish || (taraweehEnabled && taraweehTime) || (eidFitrActive && eidFitrTime) || (eidAdhaActive && eidAdhaTime)) && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {jumuahArabic && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(1,71,107,0.06)" }}>
                    <span className="text-gray-500 font-medium">Jumu&apos;ah Arabic</span>
                    <span className="font-bold font-mono" style={{ color: "#01476b" }}>{jumuahArabic}</span>
                  </div>
                )}
                {jumuahEnglish && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(1,71,107,0.06)" }}>
                    <span className="text-gray-500 font-medium">Jumu&apos;ah English</span>
                    <span className="font-bold font-mono" style={{ color: "#01476b" }}>{jumuahEnglish}</span>
                  </div>
                )}
                {taraweehEnabled && taraweehTime && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-purple-50">
                    <span className="text-purple-700 font-medium">Taraweeh</span>
                    <span className="text-purple-600 font-bold font-mono">{taraweehTime}</span>
                  </div>
                )}
                {eidFitrActive && eidFitrTime && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-amber-50">
                    <span className="text-amber-700 font-medium">Eid al-Fitr</span>
                    <span className="text-amber-600 font-bold font-mono">{eidFitrTime}</span>
                  </div>
                )}
                {eidAdhaActive && eidAdhaTime && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-amber-50">
                    <span className="text-amber-700 font-medium">Eid al-Adha</span>
                    <span className="text-amber-600 font-bold font-mono">{eidAdhaTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </>
  );
}
```

Note: We import `getPrayerTimesForDate` and `TodaysPrayerTimes` now even though they're used in the next task (date picker). Including now keeps Task 5's diff smaller.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: PASS — all skeleton + expanded content tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer-widget): add expanded content (next prayer card, grid, special chips)"
```

---

## Task 4: Open/close interactions + morph CSS

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx`
- Modify: `src/components/layout/PrayerWidget.test.tsx`

Note: Task 3 already laid the foundation — both pill and widget are always rendered with opacity/transform transitions. This task wires up the click handlers (open pill → set state), the close button, a backdrop element, and the Escape key.

- [ ] **Step 1: Write failing tests for open/close interactions**

Append to `src/components/layout/PrayerWidget.test.tsx`:

```tsx
import userEvent from "@testing-library/user-event";

describe("PrayerWidget — open/close interactions", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T03:19:00+10:00"));
  });

  it("clicking the pill opens the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    await user.click(pill);
    expect(screen.getByRole("dialog", { name: /prayer times/i })).toBeInTheDocument();
  });

  it("clicking the close button closes the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open prayer times/i })).toBeInTheDocument();
  });

  it("clicking the backdrop closes the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const backdrop = screen.getByTestId("prayer-widget-backdrop");
    await user.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("pressing Escape closes the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("backdrop is hidden (opacity 0, non-interactive) when widget is closed", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const backdrop = screen.getByTestId("prayer-widget-backdrop");
    expect(backdrop).toHaveStyle({ opacity: "0" });
    expect(backdrop).toHaveStyle({ pointerEvents: "none" });
  });

  it("backdrop becomes interactive when widget is open", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const backdrop = screen.getByTestId("prayer-widget-backdrop");
    expect(backdrop).toHaveStyle({ opacity: "1" });
    expect(backdrop).toHaveStyle({ pointerEvents: "auto" });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx -t "open/close interactions"
```

Expected: FAIL — close button, backdrop, Escape handler not yet implemented.

- [ ] **Step 3: Add Esc handler, close button, and backdrop**

In `src/components/layout/PrayerWidget.tsx`:

**a) Add the Esc key handler** near the other `useEffect` hooks:

```tsx
  // Close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);
```

**b) Add the close button** inside the widget header's right side. Replace the empty comment `{/* date-picker-nav placeholder — Task 5 */}` with:

```tsx
            <div className="flex items-center gap-1.5">
              {/* date-picker-nav buttons — filled by Task 5 */}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 border-none bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 text-xl flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
```

**c) Add the backdrop** as a new sibling at the start of the return's fragment, always rendered with opacity toggled by state. Insert this element as the first child of the `<>` fragment, before the pill button:

```tsx
      {/* Backdrop — always rendered, opacity toggles */}
      <div
        data-testid="prayer-widget-backdrop"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className="fixed inset-0 z-[900]"
        style={{
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 400ms cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      />
```

(The pill and widget JSX from Task 3 stays unchanged — pill still has `onClick={() => setIsOpen(true)}`, widget is still always rendered.)

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: PASS, all interactions tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer-widget): add open/close interactions, backdrop, and Esc handler"
```

---

## Task 5: Date picker (prev/next/today/native/back-to-today, Melbourne timezone)

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx`
- Modify: `src/components/layout/PrayerWidget.test.tsx`

- [ ] **Step 1: Write failing tests for date picker behavior**

Append to `src/components/layout/PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — date picker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T03:19:00+10:00"));
  });

  it("shows today's date in the header", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dateLabel = screen.getByTestId("widget-date-label");
    // Melbourne format: "Wednesday, 15 April 2026"
    expect(dateLabel.textContent).toContain("15 April 2026");
  });

  it("clicking the next-day button shifts to tomorrow", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const nextBtn = screen.getByRole("button", { name: /next day/i });
    await user.click(nextBtn);
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("16 April 2026");
  });

  it("clicking the previous-day button shifts to yesterday", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const prevBtn = screen.getByRole("button", { name: /previous day/i });
    await user.click(prevBtn);
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("14 April 2026");
  });

  it("shows 'Back to today' button when viewing a non-today date, hidden when today", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    expect(screen.queryByRole("button", { name: /back to today/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /next day/i }));
    expect(screen.getByRole("button", { name: /back to today/i })).toBeInTheDocument();
  });

  it("clicking 'Back to today' returns to today's prayer times", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    await user.click(screen.getByRole("button", { name: /next day/i }));
    await user.click(screen.getByRole("button", { name: /back to today/i }));
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("15 April 2026");
  });

  it("hides the next-prayer highlight when viewing a non-today date", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    // Today: Asr card should have data-is-next="true"
    expect(container.querySelector('[data-prayer="asr"]')).toHaveAttribute("data-is-next", "true");
    // Move to tomorrow
    await user.click(screen.getByRole("button", { name: /next day/i }));
    // No prayer should be marked as "next" on a non-today view
    expect(container.querySelectorAll('[data-is-next="true"]').length).toBe(0);
  });

  it("native date input updates the selected date", async () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const input = screen.getByLabelText(/pick a date/i) as HTMLInputElement;
    // Simulate a native date picker change using fireEvent (userEvent doesn't fully support <input type="date">)
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(input, { target: { value: "2026-04-20" } });
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("20 April 2026");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx -t "date picker"
```

Expected: FAIL — date label empty, no prev/next buttons exist.

- [ ] **Step 3: Add date picker state, helpers, and UI**

In `src/components/layout/PrayerWidget.tsx`:

Add these imports at the top of the file (adjust the existing import block):

```tsx
import { getPrayerTimesForDate, type PrayerName, type TodaysPrayerTimes } from "@/lib/prayer-times";
```

Add this helper function near the other helpers (outside the component):

```tsx
const MELBOURNE_TZ = "Australia/Melbourne";

function formatMelbourneDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: MELBOURNE_TZ,
  });
}

function formatDateInputValue(date: Date): string {
  // Format as YYYY-MM-DD in Melbourne's calendar day
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: MELBOURNE_TZ,
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

function isSameMelbourneDay(a: Date, b: Date): boolean {
  return (
    a.toLocaleDateString("en-AU", { timeZone: MELBOURNE_TZ }) ===
    b.toLocaleDateString("en-AU", { timeZone: MELBOURNE_TZ })
  );
}
```

Inside the component, add the selectedDate state and handlers (near the other state hooks):

```tsx
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const viewedPrayers: TodaysPrayerTimes = isSameMelbourneDay(selectedDate, new Date())
    ? todaysPrayers
    : getPrayerTimesForDate(selectedDate, prayerSettings ?? undefined);

  const isViewingToday = isSameMelbourneDay(selectedDate, new Date());

  const shiftDate = (days: number) => {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // YYYY-MM-DD
    if (!value) return;
    const next = new Date(value + "T12:00:00");
    if (!isNaN(next.getTime())) setSelectedDate(next);
  };

  const goToToday = () => setSelectedDate(new Date());
```

Then, in the prayer-grid JSX, change `todaysPrayers[key]` to `viewedPrayers[key]` and change the `isNext` check to only apply when viewing today:

```tsx
            {PRAYER_ORDER.map(({ key, displayName }) => {
              const row = viewedPrayers[key];
              const isNext = isViewingToday && nextPrayer.name === key;
              // ... rest unchanged
```

Finally, fill in the header's date-picker-nav area. Replace the empty `<div className="flex items-center gap-1.5">` (that currently only has the close button) with:

```tsx
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous day"
                  onClick={() => shiftDate(-1)}
                  className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center transition-colors"
                >
                  ‹
                </button>
                <label className="relative">
                  <span className="sr-only">Pick a date</span>
                  <button
                    type="button"
                    className="h-8 px-3 border-none rounded-lg text-white text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
                    style={{ background: "#01476b" }}
                  >
                    📅 Today
                  </button>
                  <input
                    type="date"
                    aria-label="Pick a date"
                    value={formatDateInputValue(selectedDate)}
                    onChange={handleDateInputChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                <button
                  type="button"
                  aria-label="Next day"
                  onClick={() => shiftDate(1)}
                  className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center transition-colors"
                >
                  ›
                </button>
                {!isViewingToday && (
                  <button
                    type="button"
                    aria-label="Back to today"
                    onClick={goToToday}
                    className="w-8 h-8 border-none rounded-lg text-white flex items-center justify-center transition-colors"
                    style={{ background: "#1e293b" }}
                    title="Back to today"
                  >
                    ↶
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 border-none bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 text-xl flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
```

And fill in the date label `<div data-testid="widget-date-label">`:

```tsx
              <div className="text-xs text-gray-500 font-medium" data-testid="widget-date-label">
                {formatMelbourneDate(selectedDate)}
              </div>
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: PASS, all date picker tests plus all previous tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer-widget): add date picker with Melbourne timezone support"
```

---

## Task 6: Scroll auto-hide wire-up

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx`
- Modify: `src/components/layout/PrayerWidget.test.tsx`

- [ ] **Step 1: Write failing test for scroll-hide integration**

Append to `src/components/layout/PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — scroll auto-hide", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T03:19:00+10:00"));
    window.scrollY = 0;
  });

  it("hides the pill when usePrayerWidgetScroll returns true", async () => {
    const { usePrayerWidgetScroll } = await import("@/hooks/usePrayerWidgetScroll");
    vi.mocked(usePrayerWidgetScroll).mockReturnValueOnce(true);

    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("data-hidden-by-scroll", "true");
  });

  it("keeps the pill visible when scroll hook returns false", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("data-hidden-by-scroll", "false");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx -t "scroll auto-hide"
```

Expected: FAIL — pill does not yet have `data-hidden-by-scroll` attribute.

- [ ] **Step 3: Wire the scroll hook into the pill's existing style logic**

In `src/components/layout/PrayerWidget.tsx`, add the import at the top:

```tsx
import { usePrayerWidgetScroll } from "@/hooks/usePrayerWidgetScroll";
```

Inside the component, add this line near the other state hooks:

```tsx
  // Hide pill on scroll down; paused while widget is open so the widget doesn't disappear mid-view
  const isHiddenByScroll = usePrayerWidgetScroll(isOpen);
```

The pill from Task 3 already uses inline `style={{ transform, opacity, pointerEvents }}` driven by `isOpen`. Extend that logic so `isHiddenByScroll` also hides the pill. Update the pill's `style` block and add the `data-hidden-by-scroll` attribute for the test:

```tsx
      <button
        type="button"
        aria-label="Open prayer times"
        aria-hidden={isOpen ? "true" : undefined}
        tabIndex={isOpen ? -1 : 0}
        onClick={() => setIsOpen(true)}
        data-hidden-by-scroll={isHiddenByScroll ? "true" : "false"}
        className="fixed left-1/2 flex items-center gap-3 px-4 py-3
                   rounded-full text-white text-sm border border-white/10 z-[1000]
                   cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]
                   hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]
                   max-[440px]:rounded-2xl max-[440px]:justify-between"
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #01365c 100%)",
          width: "360px",
          bottom: "20px",
          transform: isOpen
            ? "translateX(-50%) translateY(120px) scale(0.9)"
            : isHiddenByScroll
            ? "translateX(-50%) translateY(120px)"
            : "translateX(-50%)",
          opacity: isOpen || isHiddenByScroll ? 0 : 1,
          pointerEvents: isOpen || isHiddenByScroll ? "none" : "auto",
          transition:
            "opacity 220ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "transform 400ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "box-shadow 300ms ease",
        }}
      >
```

(Everything inside the button — the dot, label, name, time, chevron — stays unchanged.)

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx src/app/globals.css
git commit -m "feat(prayer-widget): wire auto-hide scroll behavior"
```

---

## Task 7: Accessibility & edge cases

**Files:**
- Modify: `src/components/layout/PrayerWidget.tsx`
- Modify: `src/components/layout/PrayerWidget.test.tsx`

- [ ] **Step 1: Write failing accessibility tests**

Append to `src/components/layout/PrayerWidget.test.tsx`:

```tsx
describe("PrayerWidget — accessibility & edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T03:19:00+10:00"));
  });

  it("does not render on /studio routes", async () => {
    const nav = await import("next/navigation");
    (nav.usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/studio");

    const { container } = render(<PrayerWidget prayerSettings={null} />);
    expect(container).toBeEmptyDOMElement();

    (nav.usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/");
  });

  it("pill is keyboard-focusable and has aria-label", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("aria-label", "Open prayer times");
    expect(pill.tabIndex).not.toBe(-1);
  });

  it("dialog has role=dialog and aria-modal=true", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Prayer Times");
  });

  it("closing the widget returns focus to the pill", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    pill.focus();
    await user.click(pill);
    await user.click(screen.getByRole("button", { name: /close/i }));
    // After close, the pill should exist again and have focus
    const pillAfter = screen.getByRole("button", { name: /open prayer times/i });
    expect(document.activeElement).toBe(pillAfter);
  });

  it("pulse dot has aria-hidden=true", () => {
    const { container } = render(<PrayerWidget prayerSettings={null} />);
    const pulseRing = container.querySelector(".prayer-widget-pulse-ring");
    expect(pulseRing).toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx -t "accessibility"
```

Expected: Some may already pass (pathname check, aria-label, dialog role). The focus-return test will fail.

- [ ] **Step 3: Add focus-return logic**

In `src/components/layout/PrayerWidget.tsx`, add a ref to the pill and return focus on close:

Add imports:

```tsx
import { useEffect, useRef, useState } from "react";
```

Inside the component, add a ref:

```tsx
  const pillRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
```

Add an effect to manage focus return:

```tsx
  // When transitioning from open→closed, return focus to the pill
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      // Re-focus after the pill is rendered again
      setTimeout(() => pillRef.current?.focus(), 0);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);
```

Add `ref={pillRef}` to the pill button JSX.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/components/layout/PrayerWidget.test.tsx
```

Expected: PASS — all tests including accessibility.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PrayerWidget.tsx src/components/layout/PrayerWidget.test.tsx
git commit -m "feat(prayer-widget): accessibility — focus return, ARIA, /studio exclusion"
```

---

## Task 8: Mount PrayerWidget in the root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Import PrayerWidget and getPrayerSettings**

In `src/app/layout.tsx`, add these imports:

```tsx
import { PrayerWidget } from "@/components/layout/PrayerWidget";
```

And update the existing `getPrayerSettings` import from `@/sanity/lib/fetch` — add it to the existing import list:

```tsx
import { getSiteSettings, getDonationSettings, getContactFormSettings, getServiceInquiryFormSettings, getNewsletterSettings, getNavigationPages, getPrayerSettings } from "@/sanity/lib/fetch";
```

- [ ] **Step 2: Add getPrayerSettings to the Promise.all**

Update the destructuring in the existing Promise.all:

```tsx
  const [
    { isEnabled: isDraftMode },
    siteSettings,
    donationSettings,
    contactFormSettingsRaw,
    serviceInquiryFormSettingsRaw,
    newsletterSettingsRaw,
    liveStream,
    navigationPages,
    prayerSettings,
  ] = await Promise.all([
    draftMode(),
    getSiteSettings(),
    getDonationSettings(),
    getContactFormSettings(),
    getServiceInquiryFormSettings(),
    getNewsletterSettings(),
    getYouTubeLiveStream(),
    getNavigationPages(),
    getPrayerSettings(),
  ]);
```

- [ ] **Step 3: Mount the widget in the provider tree**

Add `<PrayerWidget prayerSettings={prayerSettings} />` inside the `<FormSettingsProvider>` tree, after the `<Footer />`:

```tsx
          <FormSettingsProvider
            contactFormSettings={contactFormSettingsRaw}
            serviceInquiryFormSettings={serviceInquiryFormSettingsRaw}
            newsletterSettings={newsletterSettingsRaw}
          >
            <FundraiseUpScript settings={donationSettings} />
            <ScrollToTop />
            <ScrollProgress />
            <LiveBanner liveStream={liveStream} />
            <HeaderB />
            <main id="main-content" className="overflow-x-hidden">{children}</main>
            <Footer />
            <PrayerWidget prayerSettings={prayerSettings} />
          </FormSettingsProvider>
```

- [ ] **Step 4: Run type-check and build**

```bash
npm run type-check && npm run build
```

Expected: both succeed with no errors.

- [ ] **Step 5: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass (existing tests unaffected; new widget tests pass).

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(prayer-widget): mount PrayerWidget in root layout with Sanity settings"
```

---

## Task 9: Remove the prayer bar from HeroSection

**Files:**
- Modify: `src/components/sections/HeroSection.tsx`
- Modify: `src/components/sections/HeroSection.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update HeroSection test to remove prayer-bar assertions**

In `src/components/sections/HeroSection.test.tsx`, remove the `"renders prayer times bar"` test (around line 132) — the entire `it(...)` block:

```tsx
    it("renders prayer times bar", () => {
      render(<HeroSection />);

      expect(screen.getAllByText("Fajr").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Dhuhr").length).toBeGreaterThanOrEqual(1);
    });
```

Also remove the `vi.mock("@/hooks/usePrayerTimes", ...)` block (lines ~76–92) since the prayer hooks are no longer used by HeroSection.

- [ ] **Step 2: Remove prayer-related code from HeroSection.tsx**

In `src/components/sections/HeroSection.tsx`:

1. Remove these imports:
   ```tsx
   import { Sunrise, Sun, Cloud, Sunset, Moon, Star } from "lucide-react";
   import { jumuahTimes } from "@/data/content";
   import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
   import { TARAWEEH_CONFIG, EID_CONFIG } from "@/lib/prayer-config";
   import type { PrayerName } from "@/lib/prayer-times";
   ```

   (Note: keep `aicImages` from `@/data/content`; keep `ArrowRight`, `Play`, `ChevronLeft`, `ChevronRight` from `lucide-react`.)

2. Remove the `PRAYER_ICONS` constant block (around lines 70–77).

3. Remove the `prayerSettings` prop from the `HeroSectionProps` interface:

   ```tsx
   interface HeroSectionProps {
     heroMode?: "carousel" | "video";
     heroVideoUrl?: string;
     heroSlides?: SanityHomepageSettings["heroSlides"];
     heroVideoOverlays?: SanityHomepageSettings["heroVideoOverlays"];
   }
   ```

4. Update the function signature:

   ```tsx
   export function HeroSection({ heroMode, heroVideoUrl, heroSlides, heroVideoOverlays }: HeroSectionProps) {
   ```

5. Remove the block of code that derives prayer-related values from props (lines ~88–94: `taraweehActive`, `taraweehTime`, etc.).

6. Remove the block computing `prayerTimes`, `nextPrayerData`, `jumuahArabicTime`, `jumuahEnglishTime`, and the `prayers` array (lines ~152–175).

7. Remove the `nextPrayer` derived object.

8. Remove the entire `<motion.div id="prayer-times">` block at the bottom (roughly lines 443–731 — the whole prayer-times bar below the hero). The closing `</>` fragment should now only wrap the hero `<section>`.

9. Update the return to just the hero section (drop the fragment since only one JSX root remains):

   ```tsx
     return (
       <section ref={containerRef} className="relative h-[45vh] md:h-[55vh] lg:h-[65vh] min-h-[400px] overflow-hidden bg-black">
         {/* ... existing hero content unchanged ... */}
       </section>
     );
   ```

- [ ] **Step 3: Update page.tsx to stop passing prayerSettings**

In `src/app/page.tsx`, remove `prayerSettings` from the destructured fetches and from the `<HeroSection>` props. Find:

```tsx
<HeroSection
  prayerSettings={prayerSettings}
  heroMode={...}
  heroVideoUrl={...}
  heroSlides={...}
  heroVideoOverlays={...}
/>
```

Change to:

```tsx
<HeroSection
  heroMode={...}
  heroVideoUrl={...}
  heroSlides={...}
  heroVideoOverlays={...}
/>
```

If `prayerSettings` is no longer used anywhere else in `page.tsx`, also remove it from the `getPrayerSettings()` call and the Promise.all destructuring.

- [ ] **Step 4: Run tests and build**

```bash
npm run test:run && npm run build
```

Expected: all tests pass (the removed prayer-bar test is gone; other HeroSection tests still pass). Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HeroSection.tsx src/components/sections/HeroSection.test.tsx src/app/page.tsx
git commit -m "refactor(hero): remove prayer times bar (replaced by PrayerWidget)"
```

---

## Task 10: Remove prayer schedule from WorshippersClient

**Files:**
- Modify: `src/app/worshippers/WorshippersClient.tsx`
- Modify: `src/app/worshippers/WorshippersClient.test.tsx`

- [ ] **Step 1: Update WorshippersClient test**

In `src/app/worshippers/WorshippersClient.test.tsx`, remove or rewrite any `it()` blocks that test the "Prayer Schedule" section, the prayer grid, or the date picker. Keep tests that assert:
- Hero section renders
- Mosque etiquette section renders
- Jumu'ah/Taraweeh/Eid inline row
- YouTube videos (if present)
- Get Directions CTA

Remove any assertions mentioning prayer card names in a schedule-grid context. (Prayer names still appear in the Jumu'ah/Eid chips — those stay.)

- [ ] **Step 2: Remove the "Prayer Times Section" from WorshippersClient.tsx**

In `src/app/worshippers/WorshippersClient.tsx`, delete the entire `<section id="prayers">` block (the "Prayer Schedule" with date navigation and the 6-prayer grid — roughly lines 270–378).

Also:

1. Remove the `nextPrayerKey` reference and any code that references the next-prayer card overlay on the hero image (the `{isViewingToday && (...)}` block inside the hero image overlay — the `absolute -bottom-4 -right-4 bg-white rounded-xl` card showing the next prayer). The widget now handles that info.

2. Remove now-unused imports:
   - `getPrayerTimesForDate` from `@/lib/prayer-times`
   - `useNextPrayer` from `@/hooks/usePrayerTimes`
   - `PrayerName` if unused elsewhere
   - `Moon, Sun, Sunrise, Sunset, Cloud, ChevronLeft, ChevronRight, RotateCcw, Calendar` from lucide-react (keep icons that are still used like `Heart`, `Clock`, `MapPin`, `CheckCircle2`, `Footprints`, `Shirt`, `Volume2`, `HandHeart`, `Droplets`, `HelpCircle`, `Star`, `Play`, `ArrowRight`, `Users`).

3. Remove the `PRAYER_ICONS` constant if it's now unused.

4. Remove state variables that are now unused:
   - `selectedDate` and `setSelectedDate`
   - `prayerTimes` (from `getPrayerTimesForDate`)
   - `isViewingToday` (if only used for the schedule)
   - `prayerList` array
   - `formatDisplayDate`, `formatInputDate`, `goToPreviousDay`, `goToNextDay`, `goToToday`, `handleDateChange` helper functions

5. The Jumu'ah/Taraweeh/Eid inline row (the `<FadeIn>` block with special chips below the prayer grid) should **stay** but needs to be relocated into a standalone section since it's currently inside the `<section id="prayers">` that's being removed. Create a new simple section for it:

   ```tsx
   {/* Jumu'ah, Taraweeh & Eid — standalone reference section */}
   <section className="py-10 md:py-14 bg-white">
     <div className="max-w-7xl mx-auto px-6">
       <FadeIn>
         <div className="mb-6">
           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Special Prayers</h2>
           <p className="text-gray-500 text-sm">Jumu'ah, Taraweeh, and Eid prayer times</p>
         </div>
         <div className="flex flex-wrap items-center gap-3">
           {/* Keep the existing chips markup as-is */}
         </div>
       </FadeIn>
     </div>
   </section>
   ```

6. Keep everything else: breadcrumb, hero heading and description, badge pills, YouTube Islamic Talks section, mosque etiquette, Get Directions CTA.

- [ ] **Step 3: Run tests and build**

```bash
npm run test:run && npm run build
```

Expected: pass.

- [ ] **Step 4: Manual smoke check**

```bash
npm run dev
```

Open `http://localhost:3000/worshippers`. Verify:
- Hero section looks correct (badge, heading, description, badge pills)
- No prayer schedule grid / date picker
- Special Prayers section renders Jumu'ah chips
- Mosque etiquette section renders
- CTA renders

Open a few other routes (`/`, `/events`, `/donate`): widget pill should appear at bottom on all of them.

Stop the dev server (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git add src/app/worshippers/WorshippersClient.tsx src/app/worshippers/WorshippersClient.test.tsx
git commit -m "refactor(worshippers): remove prayer schedule (replaced by PrayerWidget)"
```

---

## Task 11: Delete dead PrayerTimesCard + full validation

**Files:**
- Delete: `src/components/ui/PrayerTimesCard.tsx`

- [ ] **Step 1: Verify PrayerTimesCard has no remaining imports**

```bash
grep -R "PrayerTimesCard\|NextPrayerIndicator\|PrayerTimesHeaderBar" src/
```

Expected: no matches outside of `src/components/ui/PrayerTimesCard.tsx` itself.

If any match remains, that file needs its import removed first — go back and clean it up, commit that fix, then return here.

- [ ] **Step 2: Delete the file**

```bash
git rm src/components/ui/PrayerTimesCard.tsx
```

- [ ] **Step 3: Run full validation**

```bash
npm run validate
```

Expected: `type-check` → `lint` → `test:run` → `build` all pass with zero errors.

If any step fails, fix the issue before committing.

- [ ] **Step 4: Manual QA**

```bash
npm run dev
```

Verify on http://localhost:3000:

| Check | Pass? |
|---|---|
| `/` — Widget pill visible, homepage hero has no prayer bar | |
| `/events` — Widget pill visible | |
| `/donate` — Widget pill visible | |
| `/about` — Widget pill visible | |
| `/worshippers` — Widget pill visible; prayer schedule grid is gone; etiquette/Jumu'ah/videos/CTA remain | |
| `/studio` — Widget pill is **not** visible (Sanity Studio is clean) | |
| Click pill on any page — widget opens, next prayer highlighted | |
| Click prev/next day — dates shift, "Back to today" button appears | |
| Pick a date via native picker — widget updates | |
| Click "Back to today" — returns to today | |
| Close widget (×, backdrop, Esc) — all three work, focus returns to pill | |
| Scroll down a long page (e.g. `/events`) past 80px — pill hides | |
| Scroll up — pill reappears | |
| Mobile viewport (375px) — pill becomes full-width bar | |
| Mobile widget opens and is usable | |
| System prefers-reduced-motion on — pill stays visible on scroll, no pulse, transitions are instant | |

If any check fails, create a new task with a fix, commit it, and re-verify.

- [ ] **Step 5: Commit the deletion**

```bash
git commit -m "chore(prayer-widget): delete dead PrayerTimesCard component"
```

- [ ] **Step 6: Push the branch**

```bash
git fetch origin main
git rebase origin/main
npm run validate
git push -u origin feature/prayer-times-widget
```

Expected: CI passes on the PR.

---

## Rollout / PR

Open a PR on GitHub:

```bash
gh pr create --title "feat: persistent prayer times widget" --body "$(cat <<'EOF'
## Summary
- Adds a persistent site-wide prayer times widget (bottom-center pill that morphs into a full widget)
- Removes the homepage hero prayer strip
- Removes the prayer schedule from /worshippers (keeps etiquette, Jumu'ah/Eid, videos, CTA)
- No Sanity schema changes — widget is a read-only consumer of the existing prayerSettings singleton
- All times use Australia/Melbourne timezone via existing prayer-times.ts infrastructure

## Test plan
- [ ] npm run validate passes
- [ ] Widget visible on every public route
- [ ] Widget NOT visible on /studio
- [ ] Click pill → morph opens smoothly; close → morphs back
- [ ] Date picker: prev/next/today/native input all work; "Back to today" appears on non-today dates
- [ ] Next-prayer highlight hidden when viewing non-today dates
- [ ] Scroll down hides pill, scroll up reveals
- [ ] Mobile (375px) — full-width bar variant
- [ ] prefers-reduced-motion disables pulse and scroll auto-hide
- [ ] Keyboard: Tab to pill, Space opens, Esc closes, focus returns to pill
- [ ] Change a Sanity prayer setting (e.g., taraweehEnabled) and publish — pill updates on next navigation

Spec: `docs/superpowers/specs/2026-04-15-prayer-widget-design.md`
Plan: `docs/superpowers/plans/2026-04-15-prayer-widget.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
