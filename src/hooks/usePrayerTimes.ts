"use client";

import { useState, useEffect } from "react";
import {
  getPrayerTimesForDate,
  getNextPrayer,
  type TodaysPrayerTimes,
  type PrayerTime,
} from "@/lib/prayer-times";

/**
 * Hook to get current prayer times with automatic updates at midnight
 */
export function usePrayerTimes(): TodaysPrayerTimes {
  const [prayerTimes, setPrayerTimes] = useState<TodaysPrayerTimes>(() =>
    getPrayerTimesForDate(new Date())
  );

  useEffect(() => {
    // Update prayer times
    const updateTimes = () => {
      setPrayerTimes(getPrayerTimesForDate(new Date()));
    };

    // Calculate time until midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    // Set timeout to update at midnight
    const midnightTimeout = setTimeout(() => {
      updateTimes();
      // Then set up daily interval
      const dailyInterval = setInterval(updateTimes, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  return prayerTimes;
}

/**
 * Hook to get the next prayer with automatic updates every minute
 */
export function useNextPrayer(): PrayerTime & { isNextDay: boolean } {
  const [nextPrayer, setNextPrayer] = useState<PrayerTime & { isNextDay: boolean }>(() =>
    getNextPrayer(new Date())
  );

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setNextPrayer(getNextPrayer(new Date()));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return nextPrayer;
}
