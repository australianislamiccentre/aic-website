/**
 * Regression tests for the Melbourne-timezone fix that resolved Sentry issue
 * AIC-WEBSITE-1 (React hydration mismatch).
 *
 * The bug: `getNextPrayer(new Date())` previously read `date.getHours()`, which
 * returns minutes-of-day in the *process local* timezone. Vercel's Node server
 * runs in UTC; the user's browser runs in their local tz. Different current-minute
 * values → different "next prayer" → different SSR/client markup → hydration error.
 *
 * The fix: `getMelbourneMinutesOfDay(date)` uses `Intl.DateTimeFormat` with
 * `timeZone: "Australia/Melbourne"` so the same absolute instant always produces
 * the same minute-of-day count, regardless of the executing environment's tz.
 */
import { describe, it, expect } from "vitest";
import { getNextPrayer, addMinutesToTime, getPrayerTimesForDate, getPrayerInIqamahWindow } from "./prayer-times";

describe("getNextPrayer — timezone determinism (hydration-mismatch regression)", () => {
  it("returns the same prayer for a UTC-midday instant regardless of caller's tz intent", () => {
    // 2026-04-16 04:00 UTC = 2026-04-16 14:00 Melbourne (AEST, UTC+10 — past DST end)
    // At 2pm Melbourne, next prayer should be Asr (~3-4pm) or similar afternoon prayer,
    // NOT Fajr the next day (which would be the answer if the function used UTC 04:00).
    const instant = new Date("2026-04-16T04:00:00Z");
    const result = getNextPrayer(instant);

    expect(result.isNextDay).toBe(false);
    // Prayer must be one that comes after 2pm Melbourne wall-clock
    expect(["dhuhr", "asr", "maghrib", "isha"]).toContain(result.name);
  });

  it("treats two references to the same absolute instant as identical", () => {
    // Two Date objects representing the same moment in time, constructed differently
    const fromIso = new Date("2026-04-16T04:00:00Z");
    const fromTimestamp = new Date(fromIso.getTime());

    const a = getNextPrayer(fromIso);
    const b = getNextPrayer(fromTimestamp);

    expect(a.name).toBe(b.name);
    expect(a.adhan).toBe(b.adhan);
    expect(a.isNextDay).toBe(b.isNextDay);
  });

  it("picks tomorrow's Fajr when Melbourne wall-clock is past Isha", () => {
    // 2026-04-16 13:00 UTC = 2026-04-16 23:00 Melbourne (past Isha ~7-9pm)
    const instant = new Date("2026-04-16T13:00:00Z");
    const result = getNextPrayer(instant);

    expect(result.isNextDay).toBe(true);
    expect(result.name).toBe("fajr");
  });
});

describe("addMinutesToTime — pure string math (no Date involved)", () => {
  it("adds a positive delay within the same hour", () => {
    expect(addMinutesToTime("5:30 AM", 15)).toBe("5:45 AM");
    expect(addMinutesToTime("1:15 PM", 10)).toBe("1:25 PM");
  });

  it("carries over to the next hour", () => {
    expect(addMinutesToTime("5:55 AM", 10)).toBe("6:05 AM");
    expect(addMinutesToTime("8:45 PM", 20)).toBe("9:05 PM");
  });

  it("handles AM→PM boundary at noon", () => {
    expect(addMinutesToTime("11:50 AM", 15)).toBe("12:05 PM");
    expect(addMinutesToTime("12:00 PM", 0)).toBe("12:00 PM");
  });

  it("handles PM→AM boundary at midnight (wraps to next day)", () => {
    expect(addMinutesToTime("11:50 PM", 20)).toBe("12:10 AM");
    expect(addMinutesToTime("11:59 PM", 1)).toBe("12:00 AM");
  });

  it("handles negative offsets (subtraction)", () => {
    expect(addMinutesToTime("5:30 AM", -15)).toBe("5:15 AM");
    expect(addMinutesToTime("12:05 AM", -10)).toBe("11:55 PM");
  });

  it("handles zero delta", () => {
    expect(addMinutesToTime("9:00 AM", 0)).toBe("9:00 AM");
    expect(addMinutesToTime("12:00 AM", 0)).toBe("12:00 AM");
  });

  it("pads single-digit minutes to two digits", () => {
    expect(addMinutesToTime("5:00 AM", 5)).toBe("5:05 AM");
    expect(addMinutesToTime("5:55 AM", 5)).toBe("6:00 AM");
  });

  it("returns the same output regardless of runtime timezone", () => {
    // Pure string math — this is a compile-time guarantee, but assert it anyway
    // as a regression guard in case someone reintroduces a Date dependency.
    const cases: Array<[string, number, string]> = [
      ["5:30 AM", 15, "5:45 AM"],
      ["1:30 PM", 10, "1:40 PM"],
      ["11:50 PM", 20, "12:10 AM"],
    ];
    for (const [input, delta, expected] of cases) {
      expect(addMinutesToTime(input, delta)).toBe(expected);
    }
  });
});

describe("getPrayerInIqamahWindow", () => {
  const baseDate = new Date("2026-04-15T12:00:00+10:00");
  const schedule = getPrayerTimesForDate(baseDate);
  const asrAthan = schedule.asr.adhan;
  const asrIqamah = schedule.asr.iqamah;

  function timeOnDate(time: string, dayISO: string): Date {
    const match = time.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i)!;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
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
    const sunriseAthan = schedule.sunrise.adhan;
    const atSunrise = timeOnDate(sunriseAthan, "2026-04-15");
    expect(getPrayerInIqamahWindow(atSunrise)).toBeNull();
  });
});
