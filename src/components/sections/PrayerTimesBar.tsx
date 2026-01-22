"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sunrise, Sun, Cloud, Sunset, Moon } from "lucide-react";
import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
import { jumuahTimes } from "@/data/content";
import type { PrayerName } from "@/lib/prayer-times";

// Prayer icons config
const PRAYER_ICONS: Record<PrayerName, typeof Moon> = {
  fajr: Moon,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: Cloud,
  maghrib: Sunset,
  isha: Moon,
};

export function PrayerTimesBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const prayerTimes = usePrayerTimes();
  const nextPrayer = useNextPrayer();

  const prayers = [
    { key: "fajr" as const, name: "Fajr", adhan: prayerTimes.fajr.adhan, iqamah: prayerTimes.fajr.iqamah },
    { key: "sunrise" as const, name: "Sunrise", adhan: prayerTimes.sunrise.adhan, iqamah: prayerTimes.sunrise.iqamah },
    { key: "dhuhr" as const, name: "Dhuhr", adhan: prayerTimes.dhuhr.adhan, iqamah: prayerTimes.dhuhr.iqamah },
    { key: "asr" as const, name: "Asr", adhan: prayerTimes.asr.adhan, iqamah: prayerTimes.asr.iqamah },
    { key: "maghrib" as const, name: "Maghrib", adhan: prayerTimes.maghrib.adhan, iqamah: prayerTimes.maghrib.iqamah },
    { key: "isha" as const, name: "Isha", adhan: prayerTimes.isha.adhan, iqamah: prayerTimes.isha.iqamah },
  ];

  return (
    <div className="bg-neutral-900 text-white">
      {/* Desktop View - Always visible full bar */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* First line: Prayer Times label, Next prayer, and daily prayers */}
          <div className="flex items-center gap-4 lg:gap-6 mb-2">
            {/* Prayer Times label and Next Prayer */}
            <div className="flex items-center gap-3 pr-4 border-r border-white/20 flex-shrink-0">
              <span className="text-white font-semibold text-sm">Prayer Times</span>
              <span className="text-white/40">|</span>
              <span className="text-white/60 text-sm">Next:</span>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30">
                <span className="text-teal-400 font-bold">{nextPrayer.displayName}</span>
                <span className="text-white font-semibold">{nextPrayer.adhan}</span>
              </div>
            </div>

            {/* All Prayer Times with Athan/Iqamah */}
            <div className="flex items-center gap-3 overflow-x-auto">
              {prayers.map((prayer) => {
                const isNext = nextPrayer.name === prayer.key;
                const Icon = PRAYER_ICONS[prayer.key];

                return (
                  <div
                    key={prayer.key}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      isNext
                        ? "bg-teal-500/20 border border-teal-500/30"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isNext ? "text-teal-400" : "text-white/40"}`} />
                    <div>
                      <span className={`text-sm font-medium ${isNext ? "text-teal-400" : "text-white/70"}`}>
                        {prayer.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={isNext ? "text-white" : "text-white/60"}>{prayer.adhan}</span>
                        <span className="text-white/30">|</span>
                        <span className={isNext ? "text-teal-400 font-bold" : "text-lime-400"}>{prayer.iqamah}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Second line: Jumu'ah times */}
          <div className="flex items-center gap-4 lg:gap-6 pt-2 border-t border-white/10">
            <span className="text-white/70 text-sm font-semibold flex-shrink-0">Jumu&apos;ah (Friday)</span>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5">
                <span className="text-white/60 text-sm">Arabic Khutbah</span>
                <span className="text-white font-semibold text-sm">{jumuahTimes[0].time}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5">
                <span className="text-white/60 text-sm">English Khutbah</span>
                <span className="text-white font-semibold text-sm">{jumuahTimes[1].time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Collapsed with dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3"
        >
          <div className="flex items-center justify-between">
            {/* Left: Prayer Times label and Next Prayer */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-white font-semibold text-sm">Prayer Times</span>
              <span className="text-white/40">|</span>
              <span className="text-white/60 text-xs">Next:</span>
              <span className="text-teal-400 font-bold text-sm">{nextPrayer.displayName}</span>
              <span className="text-white font-semibold text-sm">{nextPrayer.adhan}</span>
            </div>

            {/* Right: Expand button */}
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Prayer Times */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Prayer times grid */}
                <div className="grid grid-cols-3 gap-2">
                  {prayers.map((prayer) => {
                    const isNext = nextPrayer.name === prayer.key;
                    return (
                      <div
                        key={prayer.key}
                        className={`rounded-lg p-2 ${
                          isNext
                            ? "bg-teal-500/20 border border-teal-500/30"
                            : "bg-white/5"
                        }`}
                      >
                        <p className={`text-xs font-medium mb-0.5 ${isNext ? "text-teal-400" : "text-white/60"}`}>
                          {prayer.name}
                        </p>
                        <p className={`text-sm font-semibold ${isNext ? "text-white" : "text-white/80"}`}>
                          {prayer.adhan}
                        </p>
                        <p className={`text-xs font-bold ${isNext ? "text-teal-400" : "text-lime-400/80"}`}>
                          {prayer.iqamah}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Jumu'ah times */}
                <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/10">
                  <span className="text-white/70 text-xs font-semibold">Jumu&apos;ah</span>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
                    <span className="text-white/60 text-xs">Arabic</span>
                    <span className="text-white font-semibold text-xs">{jumuahTimes[0].time}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
                    <span className="text-white/60 text-xs">English</span>
                    <span className="text-white font-semibold text-xs">{jumuahTimes[1].time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
