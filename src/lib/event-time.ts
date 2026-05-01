/**
 * Event time display resolution — turns the schema-level fields
 * (startTimeMode, startPrayer, etc.) into ready-to-render display strings.
 *
 * Three modes per side:
 *   - "fixed":  use the existing time/endTime dropdown value
 *   - "prayer": "{label} {Prayer} ({adhan time for relevant date})"
 *   - "custom": free text the admin typed
 *
 * Reference date for prayer-mode lookup:
 *   - recurring → next occurrence of recurringDay (today if today matches)
 *   - single/multi → event.date, parsed at noon Melbourne for tz safety
 *   - missing date → today (defensive)
 *
 * Pure function — runs server-side. Output is a string, so it can safely be
 * passed as a prop from a server component to a client component without
 * triggering hydration mismatches.
 *
 * @module lib/event-time
 */
import type { PrayerName } from "./prayer-times";
import { getPrayerTimesForDate } from "./prayer-times";
import { getNextMelbourneOccurrence, melbourneInstant } from "./time";
import type { SanityEvent, SanityPrayerSettings } from "@/types/sanity";

export interface ResolvedEventTime {
  start: string;
  end: string;
}

/**
 * Shape consumed by client components — original event/program plus the
 * server-resolved display strings. Defined here so consumers don't each
 * declare their own copy.
 */
export type EventForDisplay = SanityEvent & { resolvedTime: ResolvedEventTime };

const VALID_PRAYERS: ReadonlySet<PrayerName> = new Set([
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
]);

/**
 * Given an event and (optional) prayer settings, returns the display strings
 * for start and end. Empty string means "don't render".
 */
export function formatEventTime(
  event: SanityEvent,
  prayerSettings: SanityPrayerSettings | null,
): ResolvedEventTime {
  return {
    start: resolveSide(event, prayerSettings, "start"),
    end: resolveSide(event, prayerSettings, "end"),
  };
}

function resolveSide(
  event: SanityEvent,
  prayerSettings: SanityPrayerSettings | null,
  side: "start" | "end",
): string {
  const mode = side === "start" ? event.startTimeMode : event.endTimeMode;
  // Default mode is "fixed" for legacy documents
  if (!mode || mode === "fixed") {
    return (side === "start" ? event.time : event.endTime) ?? "";
  }
  if (mode === "custom") {
    const raw = side === "start" ? event.customStartTime : event.customEndTime;
    return (raw ?? "").trim();
  }
  // mode === "prayer"
  const prayer = side === "start" ? event.startPrayer : event.endPrayer;
  if (!prayer || !VALID_PRAYERS.has(prayer)) {
    return "";
  }
  const labelRaw = side === "start" ? event.startPrayerLabel : event.endPrayerLabel;
  const fallbackLabel = side === "start" ? "After" : "Until";
  const label = (labelRaw ?? "").trim() || fallbackLabel;
  const referenceDate = deriveReferenceDate(event);
  const times = getPrayerTimesForDate(referenceDate, prayerSettings);
  const adhan = times[prayer]?.adhan ?? "";
  const prayerLabel = capitalize(prayer);
  return adhan ? `${label} ${prayerLabel} (${adhan})` : `${label} ${prayerLabel}`;
}

function deriveReferenceDate(event: SanityEvent): Date {
  if (event.eventType === "recurring") {
    return event.recurringDay
      ? getNextMelbourneOccurrence(event.recurringDay)
      : new Date();
  }
  if (event.date) {
    return parseMelbourneDateString(event.date);
  }
  return new Date();
}

/**
 * Parses a "YYYY-MM-DD" string as **noon Melbourne** on that calendar day.
 * Noon-anchoring avoids the UTC-midnight tz boundary bug.
 */
function parseMelbourneDateString(yyyyMmDd: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!match) return new Date();
  const [, y, m, d] = match;
  return melbourneInstant(Number(y), Number(m), Number(d), 12, 0);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
