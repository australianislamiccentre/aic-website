/**
 * Time and date helpers, anchored to Melbourne (Australia/Melbourne) timezone.
 *
 * This module is the single source of truth for any date/time operation in the
 * codebase that could produce a different answer in different timezones. Vercel's
 * Node.js runtime runs in UTC; users' browsers run in the user's local tz; most
 * of our users are in Melbourne. Using `Date.prototype.getHours()` or
 * `Date.prototype.toLocaleDateString()` directly silently diverges between those
 * environments and produces React hydration errors (see Sentry AIC-WEBSITE-1).
 *
 * The helpers below use `Intl.DateTimeFormat` with an explicit
 * `timeZone: "Australia/Melbourne"` option, which produces identical results
 * regardless of where the code executes. This file contains **pure functions
 * only** — no React hooks — so it can safely be imported from server components
 * and API routes as well as client components. For the client-only
 * `useIsMounted` hook (gates `Date.now()`-dependent render output), see
 * `@/hooks/useIsMounted`.
 *
 * **Rules** (also in `CLAUDE.md`):
 * - Do not call `date.getHours()`, `date.getMinutes()`, `date.getDate()`,
 *   `date.setHours()` or any other timezone-local `Date` method in component
 *   code. Use the helpers here.
 * - Do not call `toLocaleDateString()` or `toLocaleTimeString()` without an
 *   explicit `timeZone` option. Use `formatMelbourneDate` / `formatMelbourneTime`.
 * - For any client-rendered value that depends on `Date.now()` (e.g. countdowns,
 *   "5 min ago" timestamps), gate the output behind the `useIsMounted()` hook
 *   from `@/hooks/useIsMounted`.
 *
 * @module lib/time
 */

/**
 * The canonical IANA timezone for the Australian Islamic Centre audience.
 * Use this as the `timeZone` option in every `Intl.DateTimeFormat` /
 * `toLocaleDateString` / `toLocaleTimeString` call in the codebase.
 */
export const MELBOURNE_TZ = "Australia/Melbourne";

/**
 * Returns the Melbourne-wall-clock minutes-of-day (0..1439) for the given instant.
 *
 * Used for "which prayer is next" style comparisons. Deterministic across
 * runtimes — Vercel (UTC) and a Melbourne browser compute the same value for
 * the same absolute instant.
 *
 * @example
 *   // 2026-04-16 04:00 UTC = 2026-04-16 14:00 Melbourne → 840
 *   getMelbourneMinutesOfDay(new Date("2026-04-16T04:00:00Z"));
 */
export function getMelbourneMinutesOfDay(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MELBOURNE_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hours = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minutes = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hours * 60 + minutes;
}

/**
 * Returns the Melbourne calendar date for the given instant as a "YYYY-MM-DD"
 * string. Useful for string-based date comparisons (matches the format Sanity
 * uses for `type: "date"` fields and GROQ's `string::split(string(now()), "T")[0]`
 * pattern).
 *
 * @example
 *   // 2026-04-19 15:00 UTC = 2026-04-20 01:00 Melbourne
 *   getMelbourneDateString(new Date("2026-04-19T15:00:00Z")); // "2026-04-20"
 */
export function getMelbourneDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MELBOURNE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

/**
 * Returns `true` if the two dates fall on the same calendar day in Melbourne.
 * Handles DST transitions correctly because it compares via the Melbourne
 * calendar day string, not via UTC arithmetic.
 */
export function isSameMelbourneDay(a: Date, b: Date): boolean {
  return getMelbourneDateString(a) === getMelbourneDateString(b);
}

/**
 * Returns the UTC `Date` that corresponds to the given **Melbourne wall-clock**
 * components (year, month 1-12, day, hours 0-23, minutes 0-59).
 *
 * Correctly accounts for Australian Eastern Standard Time (AEST, UTC+10) in
 * winter and Australian Eastern Daylight Time (AEDT, UTC+11) during DST. Use
 * this when you need to convert "this wall-clock moment in Melbourne" to an
 * absolute instant suitable for passing to calendar exports, ICS files,
 * Google Calendar URLs, or any system that expects UTC.
 *
 * @example
 *   // "9 AM Melbourne on 2026-04-20" (AEST, UTC+10)
 *   melbourneInstant(2026, 4, 20, 9, 0).toISOString();
 *   // → "2026-04-19T23:00:00.000Z"
 *
 *   // "9 AM Melbourne on 2026-01-15" (AEDT, UTC+11)
 *   melbourneInstant(2026, 1, 15, 9, 0).toISOString();
 *   // → "2026-01-14T22:00:00.000Z"
 */
export function melbourneInstant(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): Date {
  const naiveUtcMs = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const offsetMinutes = melbourneOffsetMinutes(new Date(naiveUtcMs));
  return new Date(naiveUtcMs - offsetMinutes * 60_000);
}

/**
 * Internal: returns the Melbourne-tz UTC offset in minutes for the given
 * absolute instant. Positive during DST (+660 = UTC+11), otherwise +600.
 */
function melbourneOffsetMinutes(instant: Date): number {
  const asMsInTz = (tz: string) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(instant);
    const get = (t: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === t)?.value ?? "0");
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  };
  return (asMsInTz("Australia/Melbourne") - asMsInTz("UTC")) / 60_000;
}

/**
 * Formats a Date for display using Melbourne timezone and `en-AU` locale.
 *
 * Accepts the same options object as `Intl.DateTimeFormat` / `toLocaleDateString`;
 * the `timeZone` option is injected automatically. Pass only date-oriented
 * options here (`year`, `month`, `day`, `weekday`). Use `formatMelbourneTime`
 * for time-of-day.
 *
 * @example
 *   formatMelbourneDate(new Date(), { weekday: "long", day: "numeric", month: "long" })
 *   // → "Thursday, 16 April"
 */
export function formatMelbourneDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  return date.toLocaleDateString("en-AU", {
    ...options,
    timeZone: MELBOURNE_TZ,
  });
}

/**
 * Formats a Date as a time-of-day string using Melbourne timezone and `en-AU`
 * locale.
 *
 * @example
 *   formatMelbourneTime(new Date(), { hour: "numeric", minute: "2-digit" })
 *   // → "3:42 pm"
 */
export function formatMelbourneTime(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
): string {
  return date.toLocaleTimeString("en-AU", {
    ...options,
    timeZone: MELBOURNE_TZ,
  });
}

