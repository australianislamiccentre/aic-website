/**
 * Tests for `src/lib/time.ts`.
 *
 * Particular focus: the helpers must produce Melbourne-anchored results
 * regardless of the test process's local timezone. vitest.config.ts pins
 * `TZ=Australia/Melbourne` for the suite; these tests use specific UTC
 * instants that would produce *different* answers under naive local-tz
 * handling, so they catch regressions if someone accidentally swaps the
 * implementation for a local-tz version.
 */
import { describe, it, expect } from "vitest";
import {
  MELBOURNE_TZ,
  getMelbourneMinutesOfDay,
  getMelbourneDateString,
  isSameMelbourneDay,
  formatMelbourneDate,
  formatMelbourneTime,
} from "./time";

describe("MELBOURNE_TZ", () => {
  it("is the canonical IANA identifier", () => {
    expect(MELBOURNE_TZ).toBe("Australia/Melbourne");
  });
});

describe("getMelbourneMinutesOfDay", () => {
  it("returns Melbourne wall-clock minutes-of-day, not UTC", () => {
    // 04:00 UTC = 14:00 Melbourne during AEST (UTC+10) → 14*60 = 840
    // Note: 2026-04-16 is past DST end (first Sunday of April), so AEST.
    const instant = new Date("2026-04-16T04:00:00Z");
    expect(getMelbourneMinutesOfDay(instant)).toBe(14 * 60);
  });

  it("accounts for AEDT (DST) during Melbourne summer", () => {
    // 04:00 UTC on 2026-01-15 = 15:00 Melbourne during AEDT (UTC+11) → 15*60
    const instant = new Date("2026-01-15T04:00:00Z");
    expect(getMelbourneMinutesOfDay(instant)).toBe(15 * 60);
  });

  it("handles minutes correctly", () => {
    // 05:19 UTC on 2026-04-16 = 15:19 Melbourne → 15*60 + 19 = 919
    const instant = new Date("2026-04-16T05:19:00Z");
    expect(getMelbourneMinutesOfDay(instant)).toBe(15 * 60 + 19);
  });

  it("handles Melbourne midnight (0 minutes)", () => {
    // 14:00 UTC on 2026-04-16 = 00:00 Melbourne on 2026-04-17
    const instant = new Date("2026-04-16T14:00:00Z");
    expect(getMelbourneMinutesOfDay(instant)).toBe(0);
  });
});

describe("getMelbourneDateString", () => {
  it("returns the Melbourne calendar date in YYYY-MM-DD format", () => {
    // 04:00 UTC on 2026-04-16 is 14:00 Melbourne April 16
    expect(getMelbourneDateString(new Date("2026-04-16T04:00:00Z"))).toBe(
      "2026-04-16",
    );
  });

  it("rolls to the next Melbourne day before UTC midnight", () => {
    // 15:00 UTC on 2026-04-19 = 01:00 Melbourne on 2026-04-20 (AEST, UTC+10)
    expect(getMelbourneDateString(new Date("2026-04-19T15:00:00Z"))).toBe(
      "2026-04-20",
    );
  });

  it("uses the current Date when no argument is passed", () => {
    // We can't assert a specific value without stubbing the clock, but we can
    // assert the shape — proves the defaulting works without throwing.
    const result = getMelbourneDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("isSameMelbourneDay", () => {
  it("returns true for two instants in the same Melbourne day", () => {
    // Both render as 2026-04-16 in Melbourne
    const morning = new Date("2026-04-15T22:00:00Z"); // 08:00 Mel Apr 16
    const evening = new Date("2026-04-16T10:00:00Z"); // 20:00 Mel Apr 16
    expect(isSameMelbourneDay(morning, evening)).toBe(true);
  });

  it("returns false across the Melbourne midnight boundary", () => {
    // 13:59 UTC = 23:59 Mel Apr 16 vs 14:01 UTC = 00:01 Mel Apr 17
    const beforeMidnight = new Date("2026-04-16T13:59:00Z");
    const afterMidnight = new Date("2026-04-16T14:01:00Z");
    expect(isSameMelbourneDay(beforeMidnight, afterMidnight)).toBe(false);
  });
});

describe("formatMelbourneDate", () => {
  it("formats a date using Melbourne tz and en-AU locale by default", () => {
    // 2026-04-16 is Thursday in Melbourne
    const result = formatMelbourneDate(new Date("2026-04-16T04:00:00Z"));
    expect(result).toMatch(/Thursday/);
    expect(result).toMatch(/16 April 2026/);
  });

  it("accepts custom options and still injects Melbourne tz", () => {
    const result = formatMelbourneDate(new Date("2026-04-16T04:00:00Z"), {
      month: "short",
      day: "numeric",
    });
    expect(result).toBe("16 Apr");
  });

  it("handles the Melbourne-day boundary correctly", () => {
    // 15:00 UTC is 01:00 Melbourne next day — date must reflect that
    const result = formatMelbourneDate(new Date("2026-04-19T15:00:00Z"), {
      day: "numeric",
      month: "long",
    });
    expect(result).toBe("20 April");
  });
});

describe("formatMelbourneTime", () => {
  it("formats time-of-day using Melbourne tz", () => {
    // 05:19 UTC on 2026-04-16 = 15:19 Melbourne
    const result = formatMelbourneTime(new Date("2026-04-16T05:19:00Z"));
    // en-AU default 12-hour format; lowercase am/pm, no leading zero on hour
    expect(result.toLowerCase()).toContain("3:19");
    expect(result.toLowerCase()).toContain("pm");
  });

  it("supports 24-hour output", () => {
    const result = formatMelbourneTime(new Date("2026-04-16T05:19:00Z"), {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    expect(result).toBe("15:19");
  });
});
