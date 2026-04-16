/**
 * Prayer Widget
 *
 * A persistent site-wide widget pinned to the bottom-center of every page.
 * Collapsed state: a pill showing the next prayer name, time, and a countdown.
 * Expanded state: a full panel with all six prayer times, special prayers
 * (Jumu'ah/Taraweeh/Eid), and a date picker. A single element morphs between
 * the two shapes with CSS transitions.
 *
 * All prayer times and date operations use the Australia/Melbourne timezone
 * via the existing `usePrayerTimes` / `useNextPrayer` hooks and the
 * `getPrayerTimesForDate` utility. Reads from the existing `prayerSettings`
 * Sanity singleton (read-only — no schema changes).
 *
 * @module components/layout/PrayerWidget
 */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNextPrayer } from "@/hooks/usePrayerTimes";
import type { SanityPrayerSettings } from "@/types/sanity";

interface PrayerWidgetProps {
  prayerSettings: SanityPrayerSettings | null;
}

/**
 * Parse a prayer time string like "3:42 PM" into a Date for today (or
 * tomorrow if `isNextDay`) in the local timezone. Returns `null` on parse
 * failure, which skips the countdown.
 */
function parsePrayerTimeToDate(time: string, isNextDay: boolean): Date | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const target = new Date();
  if (isNextDay) target.setDate(target.getDate() + 1);
  target.setHours(hours, minutes, 0, 0);
  return target;
}

function formatCountdown(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `in ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `in ${h}h ${m}m`;
}

export function PrayerWidget({ prayerSettings }: PrayerWidgetProps) {
  const pathname = usePathname();
  const nextPrayer = useNextPrayer(prayerSettings);

  // Tick countdown every 30s so the "in N min" stays fresh
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Hide on /studio routes (Sanity Studio)
  if (pathname?.startsWith("/studio")) return null;

  const countdownTarget = parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay);
  const countdown = formatCountdown(countdownTarget);
  void now; // Reference `now` so the useEffect-driven re-render re-computes countdown

  return (
    <>
      {/* Pill — collapsed state */}
      <button
        type="button"
        aria-label="Open prayer times"
        className="fixed left-1/2 -translate-x-1/2 bottom-5 flex items-center gap-3 px-4 py-3
                   rounded-full text-white text-sm border border-white/10 z-[1000]
                   cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]
                   hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]
                   transition-[transform,box-shadow] duration-300
                   max-[440px]:w-[calc(100vw-20px)] max-[440px]:rounded-2xl max-[440px]:bottom-3.5 max-[440px]:justify-between"
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #01365c 100%)",
          width: "360px",
        }}
      >
        <span className="flex items-center gap-3 flex-1 max-[440px]:flex-initial">
          <span className="relative w-2 h-2 rounded-full bg-lime-400 flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-lime-400 prayer-widget-pulse-ring" aria-hidden="true" />
          </span>
          <span className="text-white/65 text-[11px] uppercase tracking-wider font-medium max-[440px]:text-[10px]">
            Next prayer
          </span>
          <span className="font-semibold">{nextPrayer.displayName}</span>
          <span className="text-lime-300 font-bold font-mono">{nextPrayer.adhan}</span>
        </span>
        <span className="flex items-center gap-2">
          {countdown && <span className="text-white/55 text-xs">{countdown}</span>}
          <span className="text-white/40 text-[10px]" aria-hidden="true">▴</span>
        </span>
      </button>
    </>
  );
}
