/**
 * Prayer Times Configuration
 *
 * This file contains all configurable settings for prayer times across the site.
 * When Sanity is integrated, these values will be fetched from Sanity CMS.
 *
 * Structure mirrors future Sanity schema:
 * - Daily Prayers Settings (singleton)
 * - Jumu'ah Settings (singleton)
 * - Taraweeh Settings (singleton)
 * - Eid Prayer Settings (singleton)
 *
 * @module lib/prayer-config
 * @see src/lib/prayer-times.ts — consumes this config for iqamah calculations
 */

import type { PrayerName } from "./prayer-times";

// ============================================================================
// TYPES
// ============================================================================

export type AthanMode = "calculated" | "fixed";
export type IqamahMode = "calculated" | "fixed";

export interface PrayerConfig {
  /** Whether to use calculated time or fixed override */
  athanMode: AthanMode;
  /** Fixed athan time (only used if athanMode is "fixed") */
  fixedAthanTime?: string;
  /** Whether to use calculated iqamah or fixed time */
  iqamahMode: IqamahMode;
  /** Minutes after athan for iqamah (only used if iqamahMode is "calculated") */
  iqamahDelayMinutes: number;
  /** Fixed iqamah time (only used if iqamahMode is "fixed") */
  fixedIqamahTime?: string;
}

export interface DailyPrayersConfig {
  fajr: PrayerConfig;
  sunrise: PrayerConfig;
  dhuhr: PrayerConfig;
  asr: PrayerConfig;
  maghrib: PrayerConfig;
  isha: PrayerConfig;
}

export interface JumuahSession {
  language: "Arabic" | "English";
  khutbahTime: string;
  prayerTime: string;
  enabled: boolean;
}

export interface JumuahConfig {
  sessions: JumuahSession[];
}

export interface TaraweehConfig {
  enabled: boolean;
  time: string;
  rakaat: 8 | 20;
  /** Optional date range for automatic enable/disable */
  startDate?: string;
  endDate?: string;
}

export interface EidPrayerTime {
  time: string;
  location: string;
  enabled: boolean;
}

export interface EidEventConfig {
  /** Master toggle to show/hide this Eid on the site */
  active: boolean;
  /** Date of Eid (YYYY-MM-DD format) */
  date?: string;
  /** Prayer times for this Eid */
  times: EidPrayerTime[];
}

export interface EidConfig {
  eidAlFitr: EidEventConfig;
  eidAlAdha: EidEventConfig;
}

// ============================================================================
// DEFAULT CONFIGURATION
// These values serve as defaults and will be overridden by Sanity when integrated
// ============================================================================

/**
 * Daily Prayer Configuration
 *
 * Current settings:
 * - Fajr iqamah: Fixed at 5:15 AM
 * - Sunrise (Shuruk): 15 minutes after sunrise
 * - Dhuhr, Asr, Isha: 10 minutes after athan
 * - Maghrib: 5 minutes after athan
 */
export const DAILY_PRAYERS_CONFIG: DailyPrayersConfig = {
  fajr: {
    athanMode: "calculated",
    iqamahMode: "fixed",
    iqamahDelayMinutes: 0,
    fixedIqamahTime: "5:15 AM",
  },
  sunrise: {
    athanMode: "calculated",
    iqamahMode: "calculated",
    iqamahDelayMinutes: 15, // Shuruk: 15 min after sunrise
  },
  dhuhr: {
    athanMode: "calculated",
    iqamahMode: "calculated",
    iqamahDelayMinutes: 10,
  },
  asr: {
    athanMode: "calculated",
    iqamahMode: "calculated",
    iqamahDelayMinutes: 10,
  },
  maghrib: {
    athanMode: "calculated",
    iqamahMode: "calculated",
    iqamahDelayMinutes: 5,
  },
  isha: {
    athanMode: "calculated",
    iqamahMode: "calculated",
    iqamahDelayMinutes: 10,
  },
};

/**
 * Jumu'ah (Friday) Prayer Configuration
 */
export const JUMUAH_CONFIG: JumuahConfig = {
  sessions: [
    {
      language: "Arabic",
      khutbahTime: "1:00 PM",
      prayerTime: "1:30 PM",
      enabled: true,
    },
    {
      language: "English",
      khutbahTime: "2:15 PM",
      prayerTime: "2:45 PM",
      enabled: true,
    },
  ],
};

/**
 * Taraweeh Prayer Configuration
 * Only active during Ramadan
 */
export const TARAWEEH_CONFIG: TaraweehConfig = {
  enabled: false,
  time: "8:30 PM",
  rakaat: 20,
  // These dates would be updated annually
  startDate: undefined,
  endDate: undefined,
};

/**
 * Eid Prayer Configuration
 *
 * Toggle `active` to show/hide Eid prayers on the site.
 * When Eid is announced, set `active: true` and fill in the `date`.
 */
export const EID_CONFIG: EidConfig = {
  eidAlFitr: {
    active: false, // Toggle to true when Eid al-Fitr is announced
    date: undefined, // Set when announced (YYYY-MM-DD format)
    times: [
      { time: "7:00 AM", location: "Main Prayer Hall & Courtyard", enabled: true },
      { time: "8:30 AM", location: "Main Prayer Hall & Courtyard", enabled: true },
    ],
  },
  eidAlAdha: {
    active: false, // Toggle to true when Eid al-Adha is announced
    date: undefined, // Set when announced (YYYY-MM-DD format)
    times: [
      { time: "7:00 AM", location: "Main Prayer Hall & Courtyard", enabled: true },
      { time: "8:30 AM", location: "Main Prayer Hall & Courtyard", enabled: true },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the iqamah configuration for a specific prayer
 */
export function getIqamahConfig(prayerName: PrayerName): {
  mode: IqamahMode;
  delayMinutes: number;
  fixedTime?: string;
} {
  const config = DAILY_PRAYERS_CONFIG[prayerName];
  return {
    mode: config.iqamahMode,
    delayMinutes: config.iqamahDelayMinutes,
    fixedTime: config.fixedIqamahTime,
  };
}

/**
 * Get the athan configuration for a specific prayer
 */
export function getAthanConfig(prayerName: PrayerName): {
  mode: AthanMode;
  fixedTime?: string;
} {
  const config = DAILY_PRAYERS_CONFIG[prayerName];
  return {
    mode: config.athanMode,
    fixedTime: config.fixedAthanTime,
  };
}

/**
 * Get Jumu'ah times in the format expected by existing components
 * This maintains backward compatibility with the current jumuahTimes export
 */
export function getJumuahTimes(): Array<{
  session: string;
  time: string;
  language: string;
}> {
  return JUMUAH_CONFIG.sessions
    .filter((s) => s.enabled)
    .map((session) => ({
      session: `${session.language} Session`,
      time: session.khutbahTime,
      language: session.language,
    }));
}

/**
 * Check if Taraweeh prayers are currently active
 */
export function isTaraweehActive(): boolean {
  if (!TARAWEEH_CONFIG.enabled) return false;

  // If dates are specified, check if current date is within range
  if (TARAWEEH_CONFIG.startDate && TARAWEEH_CONFIG.endDate) {
    const now = new Date();
    const start = new Date(TARAWEEH_CONFIG.startDate);
    const end = new Date(TARAWEEH_CONFIG.endDate);
    return now >= start && now <= end;
  }

  // If no dates, rely on enabled flag
  return TARAWEEH_CONFIG.enabled;
}

/**
 * Get Taraweeh configuration if active
 */
export function getTaraweehConfig(): TaraweehConfig | null {
  return isTaraweehActive() ? TARAWEEH_CONFIG : null;
}

/**
 * Check if Eid al-Fitr is currently active
 */
export function isEidAlFitrActive(): boolean {
  return EID_CONFIG.eidAlFitr.active;
}

/**
 * Check if Eid al-Adha is currently active
 */
export function isEidAlAdhaActive(): boolean {
  return EID_CONFIG.eidAlAdha.active;
}

/**
 * Get Eid al-Fitr configuration if active
 */
export function getEidAlFitrConfig(): EidEventConfig | null {
  return EID_CONFIG.eidAlFitr.active ? EID_CONFIG.eidAlFitr : null;
}

/**
 * Get Eid al-Adha configuration if active
 */
export function getEidAlAdhaConfig(): EidEventConfig | null {
  return EID_CONFIG.eidAlAdha.active ? EID_CONFIG.eidAlAdha : null;
}

/**
 * Get Eid prayer times for upcoming Eid (respects active toggle)
 * Returns the next active Eid, prioritizing Eid al-Fitr if both are active
 */
export function getUpcomingEidTimes(): {
  type: "eidAlFitr" | "eidAlAdha";
  date: string;
  times: EidPrayerTime[];
} | null {
  const now = new Date();

  // Check Eid al-Fitr (must be active AND have a date)
  if (EID_CONFIG.eidAlFitr.active && EID_CONFIG.eidAlFitr.date) {
    const fitrDate = new Date(EID_CONFIG.eidAlFitr.date);
    if (fitrDate >= now) {
      return {
        type: "eidAlFitr",
        date: EID_CONFIG.eidAlFitr.date,
        times: EID_CONFIG.eidAlFitr.times.filter((t) => t.enabled),
      };
    }
  }

  // Check Eid al-Adha (must be active AND have a date)
  if (EID_CONFIG.eidAlAdha.active && EID_CONFIG.eidAlAdha.date) {
    const adhaDate = new Date(EID_CONFIG.eidAlAdha.date);
    if (adhaDate >= now) {
      return {
        type: "eidAlAdha",
        date: EID_CONFIG.eidAlAdha.date,
        times: EID_CONFIG.eidAlAdha.times.filter((t) => t.enabled),
      };
    }
  }

  return null;
}

/**
 * Get all active Eid events (for displaying multiple Eids if needed)
 */
export function getActiveEidEvents(): Array<{
  type: "eidAlFitr" | "eidAlAdha";
  name: string;
  date?: string;
  times: EidPrayerTime[];
}> {
  const events: Array<{
    type: "eidAlFitr" | "eidAlAdha";
    name: string;
    date?: string;
    times: EidPrayerTime[];
  }> = [];

  if (EID_CONFIG.eidAlFitr.active) {
    events.push({
      type: "eidAlFitr",
      name: "Eid al-Fitr",
      date: EID_CONFIG.eidAlFitr.date,
      times: EID_CONFIG.eidAlFitr.times.filter((t) => t.enabled),
    });
  }

  if (EID_CONFIG.eidAlAdha.active) {
    events.push({
      type: "eidAlAdha",
      name: "Eid al-Adha",
      date: EID_CONFIG.eidAlAdha.date,
      times: EID_CONFIG.eidAlAdha.times.filter((t) => t.enabled),
    });
  }

  return events;
}
