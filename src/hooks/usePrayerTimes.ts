/**
 * Prayer Times React Hooks
 *
 * Client-side hooks that wrap the prayer-times calculation engine.
 * Automatically re-compute at the right intervals:
 * - `usePrayerTimes` — re-computes at midnight (new day = new schedule).
 * - `useNextPrayer` — re-computes every 60 seconds (countdown display).
 *
 * Both accept optional `SanityPrayerSettings` to apply CMS overrides
 * (iqamah offsets, fixed times, Jumu'ah and Taraweeh config).
 *
 * @module hooks/usePrayerTimes
 * @see src/lib/prayer-times.ts  — the calculation engine
 * @see src/lib/prayer-config.ts — default iqamah configuration
 */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getPrayerTimesForDate,
  getNextPrayer,
  getPrayerInIqamahWindow,
  type TodaysPrayerTimes,
  type PrayerTime,
} from "@/lib/prayer-times";
import { useIsMounted } from "@/hooks/useIsMounted";
import type { SanityPrayerSettings } from "@/types/sanity";

/**
 * Returns today's full prayer schedule (all 6 prayers with athan + iqamah times).
 * Automatically refreshes at midnight so the displayed times always match the current day.
 *
 * @param prayerSettings - Optional Sanity overrides for iqamah offsets / fixed times.
 */
export function usePrayerTimes(
  prayerSettings?: SanityPrayerSettings | null
): TodaysPrayerTimes {
  // Tick counter triggers re-computation at midnight
  const [tick, setTick] = useState(0);
  const bumpTick = useCallback(() => setTick((t) => t + 1), []);

  // Recompute whenever prayerSettings or tick changes
  const prayerTimes = useMemo(
    () => getPrayerTimesForDate(new Date(), prayerSettings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prayerSettings, tick]
  );

  useEffect(() => {
    // Calculate time until midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    // Set timeout to update at midnight
    const midnightTimeout = setTimeout(() => {
      bumpTick();
      // Then set up daily interval
      const dailyInterval = setInterval(bumpTick, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [bumpTick]);

  return prayerTimes;
}

/**
 * Returns the next upcoming prayer (name, time, and whether it's tomorrow),
 * or `null` during SSR and the first client render.
 *
 * Re-computes every 60 seconds for countdown displays.
 *
 * **Hydration safety:** returns `null` until `useIsMounted` flips to true.
 * The underlying `getNextPrayer` is timezone-deterministic (routes through
 * `getMelbourneMinutesOfDay`), but the `new Date()` it's called with on the
 * server vs the client differs by the HTTP round-trip (~200–500ms). When
 * that delay straddles one of the 6 daily adhan minute boundaries, the hook
 * would otherwise return a different `name` / `adhan` / `displayName` on SSR
 * than on first client render, and any consumer that renders those strings
 * (the pill, prayer list, SR live region) would throw a hydration mismatch.
 *
 * Mirrors the pattern `usePrayerInIqamahWindow` uses (PR #58). Callers must
 * handle `null` gracefully — render a placeholder or skip dependent content.
 *
 * @param prayerSettings - Optional Sanity overrides for iqamah offsets / fixed times.
 */
export function useNextPrayer(
  prayerSettings?: SanityPrayerSettings | null
): (PrayerTime & { isNextDay: boolean }) | null {
  const isMounted = useIsMounted();
  // Tick counter triggers re-computation every minute
  const [tick, setTick] = useState(0);
  const bumpTick = useCallback(() => setTick((t) => t + 1), []);

  // Recompute whenever prayerSettings or tick changes
  const nextPrayer = useMemo(
    () => getNextPrayer(new Date(), prayerSettings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prayerSettings, tick]
  );

  useEffect(() => {
    // Update every minute
    const interval = setInterval(bumpTick, 60 * 1000);
    return () => clearInterval(interval);
  }, [bumpTick]);

  return isMounted ? nextPrayer : null;
}

/**
 * Returns the prayer currently inside its athan→iqamah congregational window,
 * or `null` if no prayer is in that window right now.
 *
 * Re-computes every 15 seconds so the window closes promptly (within 15s of
 * the iqamah minute) and the widget's pulse ends at the right moment.
 *
 * **Hydration safety:** returns `null` during SSR and the first client render,
 * then reports the real value after mount. The underlying library function is
 * already timezone-deterministic (uses `getMelbourneMinutesOfDay`), but the
 * `new Date()` it's called with differs between server and client by ~200-500ms
 * of render latency. That 500ms can straddle an athan/iqamah minute boundary,
 * flipping the return value and causing a hydration mismatch in the hero block
 * that consumes this hook's output. Gating on `useIsMounted` guarantees SSR
 * and first-client render see the same (null) value.
 */
export function usePrayerInIqamahWindow(
  prayerSettings?: SanityPrayerSettings | null,
): ReturnType<typeof getPrayerInIqamahWindow> {
  const isMounted = useIsMounted();
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

  return isMounted ? inWindow : null;
}
