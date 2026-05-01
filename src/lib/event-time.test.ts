import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatEventTime } from "./event-time";
import type { SanityEvent } from "@/types/sanity";

function makeEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "evt-1",
    title: "Test",
    slug: "test",
    eventType: "single",
    date: "2026-05-01",
    time: "",
    location: "",
    categories: [],
    description: "",
    ...overrides,
  };
}

describe("formatEventTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z")); // Thursday
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("fixed mode (backward compatibility)", () => {
    it("returns the time field when mode is undefined (legacy doc)", () => {
      const event = makeEvent({ time: "7:30 PM" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("7:30 PM");
      expect(result.end).toBe("");
    });

    it("returns time and endTime when both set", () => {
      const event = makeEvent({ time: "7:30 PM", endTime: "9:00 PM" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("7:30 PM");
      expect(result.end).toBe("9:00 PM");
    });

    it("explicit startTimeMode='fixed' behaves the same as undefined", () => {
      const event = makeEvent({ time: "7:30 PM", startTimeMode: "fixed" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("7:30 PM");
    });

    it("returns empty string when time is blank", () => {
      const event = makeEvent({ time: "", startTimeMode: "fixed" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("");
    });
  });

  describe("custom mode", () => {
    it("renders trimmed customStartTime", () => {
      const event = makeEvent({ startTimeMode: "custom", customStartTime: "  TBD  " });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("TBD");
    });

    it("renders trimmed customEndTime", () => {
      const event = makeEvent({ endTimeMode: "custom", customEndTime: "Late night" });
      const result = formatEventTime(event, null);
      expect(result.end).toBe("Late night");
    });

    it("returns empty string when customStartTime is blank/missing", () => {
      const event = makeEvent({ startTimeMode: "custom" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("");
    });
  });

  describe("prayer mode — single event", () => {
    it("renders 'After Isha (time)' for a single event on a known date", () => {
      // 2026-05-01 — May = day 121 of year. Look up actual table value.
      // The test asserts the format and that *some* HH:MM AM/PM appears.
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
        startPrayerLabel: "After",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha \(\d{1,2}:\d{2} (AM|PM)\)$/);
    });

    it("uses 'After' as default label when startPrayerLabel is blank", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "maghrib",
        startPrayerLabel: "",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Maghrib /);
    });

    it("uses 'Until' as default label for end side when endPrayerLabel is blank", () => {
      const event = makeEvent({
        date: "2026-05-01",
        endTimeMode: "prayer",
        endPrayer: "fajr",
        endPrayerLabel: "",
      });
      const result = formatEventTime(event, null);
      expect(result.end).toMatch(/^Until Fajr /);
    });

    it("uses admin-supplied label when provided", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "maghrib",
        startPrayerLabel: "Before",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^Before Maghrib /);
    });
  });

  describe("prayer mode — recurring event", () => {
    it("uses next occurrence of recurringDay as the reference date", () => {
      // Today is Thursday 2026-04-30. Next Friday is 2026-05-01.
      const event = makeEvent({
        eventType: "recurring",
        date: undefined,
        recurringDay: "Fridays",
        startTimeMode: "prayer",
        startPrayer: "isha",
        startPrayerLabel: "After",
      });
      const result = formatEventTime(event, null);
      // Next Friday is 2026-05-01; May 1 Isha adhan = 6:47 PM (table index 120)
      expect(result.start).toBe("After Isha (6:47 PM)");
    });
  });

  describe("combined start + end", () => {
    it("renders both sides when both are set", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
        endTimeMode: "prayer",
        endPrayer: "fajr",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha /);
      expect(result.end).toMatch(/^Until Fajr /);
    });

    it("supports mixed modes — prayer start, fixed end", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
        endTimeMode: "fixed",
        endTime: "11:00 PM",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha /);
      expect(result.end).toBe("11:00 PM");
    });
  });

  describe("defensive fallbacks", () => {
    it("returns empty string when prayer mode but no startPrayer set", () => {
      const event = makeEvent({ date: "2026-05-01", startTimeMode: "prayer" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("");
    });

    it("does not crash when prayerSettings is null (uses hardcoded table)", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
      });
      expect(() => formatEventTime(event, null)).not.toThrow();
    });

    it("falls back to today when single event has no date", () => {
      const event = makeEvent({
        date: undefined,
        startTimeMode: "prayer",
        startPrayer: "isha",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha /);
    });

    it("returns empty string when startPrayer is an invalid value (e.g. 'sunrise')", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        // Cast through unknown to bypass TS — defensive runtime guard for stale data
        startPrayer: "sunrise" as unknown as "isha",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("");
    });
  });

  it("ignores stale fields when mode switches (e.g. mode=custom but time still set)", () => {
    const event = makeEvent({
      time: "7:30 PM",
      startTimeMode: "custom",
      customStartTime: "TBD",
    });
    const result = formatEventTime(event, null);
    expect(result.start).toBe("TBD");
    expect(result.start).not.toContain("7:30 PM");
  });
});
