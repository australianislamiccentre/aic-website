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
 * Hook to get current prayer times with automatic updates at midnight
 * Accepts optional Sanity prayerSettings to override iqamah config
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
 * Hook to get the next prayer with automatic updates every minute
 * Accepts optional Sanity prayerSettings to override iqamah config
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
