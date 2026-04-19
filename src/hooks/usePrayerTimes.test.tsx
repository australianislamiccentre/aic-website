import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { usePrayerInIqamahWindow } from "./usePrayerTimes";
import { getPrayerTimesForDate } from "@/lib/prayer-times";

describe("usePrayerInIqamahWindow", () => {
  const baseDate = new Date("2026-04-15T12:00:00+10:00");
  const schedule = getPrayerTimesForDate(baseDate);
  const asrIqamah = schedule.asr.iqamah;

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
    vi.setSystemTime(new Date("2026-04-15T15:00:00+10:00"));
    const { result } = renderHook(() => usePrayerInIqamahWindow(null));
    expect(result.current).toBeNull();
  });

  it("returns the prayer inside the window", () => {
    const atAthan = parseTimeOnDay(schedule.asr.adhan, "2026-04-15");
    vi.setSystemTime(new Date(atAthan.getTime() + 60_000));
    const { result } = renderHook(() => usePrayerInIqamahWindow(null));
    expect(result.current).not.toBeNull();
    expect(result.current!.name).toBe("asr");
  });

  it("transitions to null after iqamah passes and the 15s tick fires", () => {
    const iqamah = parseTimeOnDay(asrIqamah, "2026-04-15");
    vi.setSystemTime(new Date(iqamah.getTime() - 30_000));
    const { result } = renderHook(() => usePrayerInIqamahWindow(null));
    expect(result.current).not.toBeNull();

    act(() => {
      vi.setSystemTime(new Date(iqamah.getTime() + 1_000));
      vi.advanceTimersByTime(15_000);
    });

    expect(result.current).toBeNull();
  });

  it("returns null during SSR even when the clock is inside a window (hydration-mismatch regression)", () => {
    // The bug this guards: `usePrayerInIqamahWindow` previously returned the
    // real "in-window" value during SSR. If the client hydrated ~500ms later
    // and that delay straddled an athan/iqamah minute boundary, server and
    // client rendered different `heroPrayer` values → hydration mismatch.
    // Sentry issue AIC-WEBSITE-1 regressed because of this (2026-04-19).
    // The fix: hook returns null on SSR + first client render; real value
    // appears only after mount.
    const atAthan = parseTimeOnDay(schedule.asr.adhan, "2026-04-15");
    vi.setSystemTime(new Date(atAthan.getTime() + 60_000)); // deep in the window

    function ProbeSSR() {
      const value = usePrayerInIqamahWindow(null);
      return <span data-testid="probe">{value === null ? "null" : value.name}</span>;
    }

    const html = renderToString(<ProbeSSR />);
    expect(html).toContain(">null<");
    expect(html).not.toContain(">asr<");
  });
});
