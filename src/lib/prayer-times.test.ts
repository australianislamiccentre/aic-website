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
import { getNextPrayer } from "./prayer-times";

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
