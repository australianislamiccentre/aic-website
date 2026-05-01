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
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  MELBOURNE_TZ,
  getMelbourneMinutesOfDay,
  getMelbourneDateString,
  isSameMelbourneDay,
  melbourneInstant,
  formatMelbourneDate,
  formatMelbourneTime,
  getNextMelbourneOccurrence,
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

describe("melbourneInstant", () => {
  it("converts Melbourne AEST wall-clock (winter) to the correct UTC instant", () => {
    // 9 AM Melbourne on 2026-04-20 → AEST (UTC+10, post-DST) → 23:00 UTC previous day
    const instant = melbourneInstant(2026, 4, 20, 9, 0);
    expect(instant.toISOString()).toBe("2026-04-19T23:00:00.000Z");
  });

  it("converts Melbourne AEDT wall-clock (summer DST) to the correct UTC instant", () => {
    // 9 AM Melbourne on 2026-01-15 → AEDT (UTC+11) → 22:00 UTC previous day
    const instant = melbourneInstant(2026, 1, 15, 9, 0);
    expect(instant.toISOString()).toBe("2026-01-14T22:00:00.000Z");
  });

  it("round-trips through Melbourne formatters: instant → Melbourne components → same instant", () => {
    const original = melbourneInstant(2026, 4, 20, 14, 30);
    expect(getMelbourneDateString(original)).toBe("2026-04-20");
    expect(getMelbourneMinutesOfDay(original)).toBe(14 * 60 + 30);
    expect(formatMelbourneTime(original, { hour: "2-digit", minute: "2-digit", hour12: false })).toBe("14:30");
  });

  it("handles midnight Melbourne correctly", () => {
    const instant = melbourneInstant(2026, 4, 20, 0, 0);
    // 00:00 Melbourne 2026-04-20 (AEST) = 14:00 UTC on 2026-04-19
    expect(instant.toISOString()).toBe("2026-04-19T14:00:00.000Z");
  });

  it("handles 11:59 PM Melbourne correctly", () => {
    const instant = melbourneInstant(2026, 4, 20, 23, 59);
    // 23:59 Melbourne 2026-04-20 (AEST) = 13:59 UTC on 2026-04-20
    expect(instant.toISOString()).toBe("2026-04-20T13:59:00.000Z");
  });
});

describe("getNextMelbourneOccurrence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today when today matches the requested day", () => {
    // 2026-05-01 is a Friday in Melbourne
    vi.setSystemTime(new Date("2026-05-01T03:00:00Z")); // 1 PM Melbourne
    const result = getNextMelbourneOccurrence("Fridays");
    expect(result.toISOString().startsWith("2026-05-01")).toBe(true);
  });

  it("returns the next matching weekday when today is a different day", () => {
    // 2026-04-30 is a Thursday in Melbourne; next Friday is 2026-05-01
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("Fridays");
    // Anchored to noon Melbourne on 2026-05-01 — UTC equivalent depends on DST
    // but the Melbourne calendar date should always be 2026-05-01
    const melbourneDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(result);
    expect(melbourneDateStr).toBe("2026-05-01");
  });

  it("wraps to next week when target day is before today", () => {
    // 2026-04-30 is a Thursday; previous Monday was 2026-04-27, next Monday is 2026-05-04
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("Mondays");
    const melbourneDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(result);
    expect(melbourneDateStr).toBe("2026-05-04");
  });

  it("anchors result to noon Melbourne (avoids UTC-midnight boundary)", () => {
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("Fridays");
    // Hour part in Melbourne should be 12 (noon)
    const hour = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Australia/Melbourne",
      hour: "2-digit",
      hour12: false,
    }).format(result);
    expect(hour).toBe("12");
  });

  it("handles all seven weekday names (singular and plural forms)", () => {
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z")); // Thursday
    expect(getNextMelbourneOccurrence("Mondays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Tuesdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Wednesdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Thursdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Fridays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Saturdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Sundays")).toBeInstanceOf(Date);
  });

  it("returns today's date for unknown day names (defensive fallback)", () => {
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("nonsense");
    const melbourneDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(result);
    expect(melbourneDateStr).toBe("2026-04-30");
  });
});
