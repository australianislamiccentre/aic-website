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
  type TodaysPrayerTimes,
  type PrayerTime,
} from "@/lib/prayer-times";
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
 * Returns the next upcoming prayer (name, time, and whether it's tomorrow).
 * Re-computes every 60 seconds for countdown displays.
 *
 * @param prayerSettings - Optional Sanity overrides for iqamah offsets / fixed times.
 */
export function useNextPrayer(
  prayerSettings?: SanityPrayerSettings | null
): PrayerTime & { isNextDay: boolean } {
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

  return nextPrayer;
}
