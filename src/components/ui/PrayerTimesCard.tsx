"use client";

import { motion } from "framer-motion";
import { Sunrise, Sun, Cloud, Sunset, Moon, Clock } from "lucide-react";
import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
import { getPrayerTimesForDate, type PrayerName, type TodaysPrayerTimes } from "@/lib/prayer-times";

// Helper to check if two dates are the same day (Melbourne timezone)
function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = date1.toLocaleDateString("en-AU", { timeZone: "Australia/Melbourne" });
  const d2 = date2.toLocaleDateString("en-AU", { timeZone: "Australia/Melbourne" });
  return d1 === d2;
}

// Prayer icons and colors
const PRAYER_CONFIG: Record<PrayerName, {
  icon: typeof Moon;
  arabic: string;
  color: string;
  gradient: string;
}> = {
  fajr: { icon: Moon, arabic: "الفجر", color: "text-indigo-500", gradient: "from-indigo-500 to-purple-600" },
  sunrise: { icon: Sunrise, arabic: "الشروق", color: "text-orange-500", gradient: "from-orange-400 to-amber-500" },
  dhuhr: { icon: Sun, arabic: "الظهر", color: "text-yellow-500", gradient: "from-yellow-400 to-orange-500" },
  asr: { icon: Cloud, arabic: "العصر", color: "text-blue-500", gradient: "from-blue-400 to-cyan-500" },
  maghrib: { icon: Sunset, arabic: "المغرب", color: "text-rose-500", gradient: "from-rose-400 to-red-500" },
  isha: { icon: Moon, arabic: "العشاء", color: "text-purple-500", gradient: "from-purple-500 to-indigo-600" },
};

interface PrayerTimesCardProps {
  variant?: "compact" | "full" | "hero";
  showIqamah?: boolean;
  showArabic?: boolean;
  highlightNext?: boolean;
  className?: string;
  selectedDate?: Date;
}

/**
 * Reusable Prayer Times display component
 * - compact: Single line display for bars/headers
 * - full: Card-based display with icons
 * - hero: Hero section optimized display
 */
export function PrayerTimesCard({
  variant = "full",
  showIqamah = true,
  showArabic = true,
  highlightNext = true,
  className = "",
  selectedDate,
}: PrayerTimesCardProps) {
  const todayPrayerTimes = usePrayerTimes();
  const nextPrayer = useNextPrayer();

  // Use selected date times if provided, otherwise use today's times
  const prayerTimes: TodaysPrayerTimes = selectedDate
    ? getPrayerTimesForDate(selectedDate)
    : todayPrayerTimes;

  // Only highlight next prayer if viewing today
  const isToday = !selectedDate || isSameDay(selectedDate, new Date());
  const shouldHighlight = highlightNext && isToday;

  const prayers = [
    { key: "fajr" as const, data: prayerTimes.fajr },
    { key: "sunrise" as const, data: prayerTimes.sunrise },
    { key: "dhuhr" as const, data: prayerTimes.dhuhr },
    { key: "asr" as const, data: prayerTimes.asr },
    { key: "maghrib" as const, data: prayerTimes.maghrib },
    { key: "isha" as const, data: prayerTimes.isha },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {prayers.map(({ key, data }) => {
          const isNext = shouldHighlight && nextPrayer.name === key;

          return (
            <div
              key={key}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                isNext ? "bg-teal-500/20 border border-teal-500/30" : "hover:bg-white/5"
              }`}
            >
              <span className={`text-sm font-medium ${isNext ? "text-teal-400" : "text-white/70"}`}>
                {data.displayName}
              </span>
              <span className={`font-semibold text-sm ${isNext ? "text-teal-400" : "text-white"}`}>
                {data.adhan}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${className}`}>
        {prayers.map(({ key, data }) => {
          const config = PRAYER_CONFIG[key];
          const isNext = shouldHighlight && nextPrayer.name === key;
          const Icon = config.icon;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-xl p-4 backdrop-blur-md transition-all ${
                isNext
                  ? "bg-teal-500/20 border-2 border-teal-400/50 shadow-lg shadow-teal-500/20"
                  : "bg-white/10 border border-white/20 hover:bg-white/15"
              }`}
            >
              {isNext && (
                <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  NEXT
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isNext ? "text-teal-400" : "text-white/60"}`} />
                <span className={`font-medium text-sm ${isNext ? "text-teal-400" : "text-white/90"}`}>
                  {data.displayName}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-white/50 text-xs">Athan</span>
                  <span className={`font-bold ${isNext ? "text-teal-300" : "text-white"}`}>
                    {data.adhan}
                  </span>
                </div>
                {showIqamah && key !== "sunrise" && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/50 text-xs">Iqamah</span>
                    <span className={`font-semibold text-sm ${isNext ? "text-teal-200" : "text-white/80"}`}>
                      {data.iqamah}
                    </span>
                  </div>
                )}
                {key === "sunrise" && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/50 text-xs">Shuruk</span>
                    <span className={`font-semibold text-sm ${isNext ? "text-teal-200" : "text-white/80"}`}>
                      {data.iqamah}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 ${className}`}>
      {prayers.map(({ key, data }) => {
        const config = PRAYER_CONFIG[key];
        const isNext = shouldHighlight && nextPrayer.name === key;
        const Icon = config.icon;

        return (
          <motion.div
            key={key}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl -z-10`}
            />
            <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border text-center ${
              isNext ? "border-teal-400 ring-2 ring-teal-400/30" : "border-gray-100"
            }`}>
              {isNext && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Next Prayer
                </div>
              )}
              <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              {showArabic && (
                <p className="text-gold-600 text-lg font-arabic mb-1">{config.arabic}</p>
              )}
              <h3 className="text-gray-900 font-semibold text-lg mb-3">{data.displayName}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm text-gray-500">Athan</span>
                  <span className="font-bold text-gray-900">{data.adhan}</span>
                </div>
                {showIqamah && key !== "sunrise" && (
                  <div className="flex justify-between items-center px-2 pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Iqamah</span>
                    <span className="font-bold text-teal-600">{data.iqamah}</span>
                  </div>
                )}
                {key === "sunrise" && (
                  <div className="flex justify-between items-center px-2 pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Shuruk</span>
                    <span className="font-bold text-orange-500">{data.iqamah}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Next Prayer indicator component
 */
export function NextPrayerIndicator({ className = "" }: { className?: string }) {
  const nextPrayer = useNextPrayer();
  const config = PRAYER_CONFIG[nextPrayer.name];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">Next Prayer</p>
        <p className="font-bold text-gray-900">
          {nextPrayer.displayName} <span className="text-teal-600">{nextPrayer.adhan}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Prayer Times Header Bar - simplified version for headers
 */
export function PrayerTimesHeaderBar({ className = "" }: { className?: string }) {
  const prayerTimes = usePrayerTimes();
  const nextPrayer = useNextPrayer();

  const prayers = [
    { name: "Fajr", time: prayerTimes.fajr.iqamah },
    { name: "Dhuhr", time: prayerTimes.dhuhr.iqamah },
    { name: "Asr", time: prayerTimes.asr.iqamah },
    { name: "Maghrib", time: prayerTimes.maghrib.iqamah },
    { name: "Isha", time: prayerTimes.isha.iqamah },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2 pr-4 border-r border-white/20">
        <Clock className="w-4 h-4 text-white/60" />
        <span className="text-white/60 text-sm">Next:</span>
        <span className="text-teal-400 font-bold">{nextPrayer.displayName} {nextPrayer.adhan}</span>
      </div>
      {prayers.map((prayer) => (
        <div
          key={prayer.name}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            nextPrayer.displayName === prayer.name
              ? "bg-teal-500/20 border border-teal-500/30"
              : "hover:bg-white/5"
          }`}
        >
          <span className={`text-sm font-medium ${
            nextPrayer.displayName === prayer.name ? "text-teal-400" : "text-white/70"
          }`}>
            {prayer.name}
          </span>
          <span className={`font-semibold text-sm ${
            nextPrayer.displayName === prayer.name ? "text-teal-400" : "text-white"
          }`}>
            {prayer.time}
          </span>
        </div>
      ))}
    </div>
  );
}
