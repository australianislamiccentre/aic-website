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

/**
 * Hook to get countdown to next prayer
 */
export function useNextPrayerCountdown(): {
  prayer: PrayerTime;
  isNextDay: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  function calculateCountdown() {
    const now = new Date();
    const nextPrayer = getNextPrayer(now);

    // Parse the prayer time
    const match = nextPrayer.adhan.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
      return {
        prayer: nextPrayer,
        isNextDay: nextPrayer.isNextDay,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
      };
    }

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Create target date
    const target = new Date(now);
    if (nextPrayer.isNextDay) {
      target.setDate(target.getDate() + 1);
    }
    target.setHours(hours, minutes, 0, 0);

    const diffMs = target.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

    return {
      prayer: nextPrayer,
      isNextDay: nextPrayer.isNextDay,
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      totalSeconds,
    };
  }

  const [countdown, setCountdown] = useState(() => calculateCountdown());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return countdown;
}
