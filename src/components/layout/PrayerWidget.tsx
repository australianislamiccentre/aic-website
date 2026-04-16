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
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
import { getPrayerTimesForDate, type PrayerName, type TodaysPrayerTimes } from "@/lib/prayer-times";
import type { SanityPrayerSettings } from "@/types/sanity";

interface PrayerWidgetProps {
  prayerSettings: SanityPrayerSettings | null;
  /** Test-only: forces the widget to render in the expanded state on mount. */
  testOpenInitially?: boolean;
}

interface PrayerRowConfig {
  key: PrayerName;
  displayName: string;
}

const PRAYER_ORDER: PrayerRowConfig[] = [
  { key: "fajr",    displayName: "Fajr" },
  { key: "sunrise", displayName: "Sunrise" },
  { key: "dhuhr",   displayName: "Dhuhr" },
  { key: "asr",     displayName: "Asr" },
  { key: "maghrib", displayName: "Maghrib" },
  { key: "isha",    displayName: "Isha" },
];

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

function formatCountdownShort(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m`;
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
}

const MELBOURNE_TZ = "Australia/Melbourne";

function formatMelbourneDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: MELBOURNE_TZ,
  });
}

function formatDateInputValue(date: Date): string {
  // Format as YYYY-MM-DD in Melbourne's calendar day
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: MELBOURNE_TZ,
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

function formatShortMelbourneDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    timeZone: MELBOURNE_TZ,
  });
}

function isSameMelbourneDay(a: Date, b: Date): boolean {
  return (
    a.toLocaleDateString("en-AU", { timeZone: MELBOURNE_TZ }) ===
    b.toLocaleDateString("en-AU", { timeZone: MELBOURNE_TZ })
  );
}

export function PrayerWidget({ prayerSettings, testOpenInitially = false }: PrayerWidgetProps) {
  const pathname = usePathname();
  const todaysPrayers = usePrayerTimes(prayerSettings);
  const nextPrayer = useNextPrayer(prayerSettings);
  const [isOpen, setIsOpen] = useState(testOpenInitially);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const currentDate = new Date();
  const isViewingToday = isSameMelbourneDay(selectedDate, currentDate);
  const viewedPrayers: TodaysPrayerTimes = isViewingToday
    ? todaysPrayers
    : getPrayerTimesForDate(selectedDate, prayerSettings ?? undefined);

  const shiftDate = (days: number) => {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // YYYY-MM-DD
    if (!value) return;
    const next = new Date(value + "T12:00:00");
    if (!isNaN(next.getTime())) setSelectedDate(next);
  };

  const goToToday = () => setSelectedDate(new Date());

  // Tick countdown every 30s
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  void now;

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (pathname?.startsWith("/studio")) return null;

  const countdownTarget = parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay);
  const countdown = formatCountdown(countdownTarget);
  const countdownShort = formatCountdownShort(countdownTarget);

  const jumuahArabic = prayerSettings?.jumuahArabicTime;
  const jumuahEnglish = prayerSettings?.jumuahEnglishTime;
  const taraweehEnabled = prayerSettings?.taraweehEnabled ?? false;
  const taraweehTime = prayerSettings?.taraweehTime;
  const eidFitrActive = prayerSettings?.eidFitrActive ?? false;
  const eidFitrTime = prayerSettings?.eidFitrTime;
  const eidAdhaActive = prayerSettings?.eidAdhaActive ?? false;
  const eidAdhaTime = prayerSettings?.eidAdhaTime;

  return (
    <>
      {/* Backdrop — always rendered, opacity toggles */}
      <div
        data-testid="prayer-widget-backdrop"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className="fixed inset-0 z-[900]"
        style={{
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 400ms cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      />

      {/* Pill — always rendered, hidden via CSS when expanded */}
      <button
        type="button"
        aria-label="Open prayer times"
        aria-hidden={isOpen ? "true" : undefined}
        tabIndex={isOpen ? -1 : 0}
        onClick={() => setIsOpen(true)}
        className="fixed left-1/2 flex items-center gap-3 px-4 py-3
                   rounded-full text-white text-sm border border-white/10 z-[1000]
                   cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]
                   hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]
                   max-[440px]:rounded-2xl max-[440px]:justify-between"
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #01365c 100%)",
          width: "360px",
          bottom: "20px",
          transform: isOpen
            ? "translateX(-50%) translateY(120px) scale(0.9)"
            : "translateX(-50%)",
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? "none" : "auto",
          transition:
            "opacity 220ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "transform 400ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "box-shadow 300ms ease",
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

      {/* Expanded widget — always rendered, hidden via CSS when collapsed */}
      <div
        role="dialog"
        aria-label="Prayer Times"
        aria-hidden={isOpen ? undefined : "true"}
        aria-modal={isOpen ? "true" : undefined}
        tabIndex={isOpen ? undefined : -1}
        className="fixed left-1/2 bottom-0 bg-white z-[950]
                   rounded-t-3xl overflow-hidden flex flex-col
                   shadow-[0_-24px_64px_rgba(0,0,0,0.22),0_-4px_16px_rgba(0,0,0,0.08)]
                   max-[440px]:w-[calc(100vw-24px)]"
        style={{
          width: "min(720px, calc(100vw - 24px))",
          height: "min(540px, calc(100vh - 40px))",
          transform: isOpen
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(100%)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "opacity 320ms cubic-bezier(0.33, 1, 0.68, 1), " +
            "transform 520ms cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      >
          <div className="w-12 h-[5px] bg-gray-300 rounded-full mx-auto mt-2.5 flex-shrink-0" aria-hidden="true" />

          {/* Header — date picker nav will be filled in Task 5 */}
          <div className="px-6 pb-4 pt-2 border-b border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
            <div>
              <h2 className="text-xl font-serif text-gray-900">Prayer Times</h2>
              <div className="text-xs text-gray-500 font-medium" data-testid="widget-date-label">
                {formatMelbourneDate(selectedDate)}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => shiftDate(-1)}
                className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-label={isViewingToday ? "Open date picker" : `Selected date ${formatMelbourneDate(selectedDate)}, open date picker`}
                  className="h-8 px-3 border-none rounded-lg text-white text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
                  style={{ background: "#01476b" }}
                >
                  <Calendar size={14} aria-hidden="true" />
                  {isViewingToday ? "Today" : formatShortMelbourneDate(selectedDate)}
                </button>
                <input
                  type="date"
                  aria-label="Pick a date"
                  value={formatDateInputValue(selectedDate)}
                  onChange={handleDateInputChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <button
                type="button"
                aria-label="Next day"
                onClick={() => shiftDate(1)}
                className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              {!isViewingToday && (
                <button
                  type="button"
                  aria-label="Back to today"
                  onClick={goToToday}
                  className="w-8 h-8 border-none rounded-lg text-white flex items-center justify-center transition-colors"
                  style={{ background: "#1e293b" }}
                  title="Back to today"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                aria-label="Close prayer times"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 border-none bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 pb-6 overflow-y-auto flex-1">
            {/* Next prayer card */}
            <div
              className="relative overflow-hidden rounded-2xl border p-4 mb-5 flex items-center gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(0,173,76,0.10) 0%, rgba(132,204,22,0.08) 100%)",
                borderColor: "rgba(0,173,76,0.22)",
              }}
            >
              <div
                className="rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0"
                style={{
                  width: "52px",
                  height: "52px",
                  background: "linear-gradient(135deg, #00ad4c 0%, #84cc16 100%)",
                  boxShadow: "0 6px 16px rgba(0,173,76,0.3)",
                }}
                aria-hidden="true"
              >
                ☪
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-green-600 font-bold tracking-wider uppercase mb-0.5">
                  Next Prayer
                </div>
                <div className="text-lg font-bold text-gray-900 font-serif">{nextPrayer.displayName}</div>
                <div className="flex gap-4 text-[13px] mt-1 flex-wrap">
                  <span className="text-gray-500">
                    Athan <strong className="text-gray-900 font-mono font-bold">{nextPrayer.adhan}</strong>
                  </span>
                  <span className="text-gray-500">
                    Iqamah <strong className="text-green-600 font-mono font-bold">{nextPrayer.iqamah}</strong>
                  </span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-center flex-shrink-0 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">In</div>
                <div className="text-base font-bold text-green-600 font-mono mt-0.5">{countdownShort}</div>
              </div>
            </div>

            {/* Prayer grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
              {PRAYER_ORDER.map(({ key, displayName }) => {
                const row = viewedPrayers[key];
                const isNext = isViewingToday && nextPrayer.name === key;
                return (
                  <div
                    key={key}
                    data-prayer={key}
                    data-is-next={isNext ? "true" : undefined}
                    className={
                      "rounded-xl p-3 text-center border " +
                      (isNext
                        ? "bg-white border-green-500 shadow-[0_0_0_2px_rgba(0,173,76,0.15),0_4px_12px_rgba(0,173,76,0.1)]"
                        : "bg-gray-50 border-gray-200")
                    }
                  >
                    <div className={"text-xs font-semibold mb-1.5 uppercase tracking-wide " + (isNext ? "text-green-600" : "text-gray-600")}>
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{row.adhan}</div>
                    <div
                      className={
                        "text-sm font-bold font-mono mt-1 pt-1 border-t border-gray-200 " +
                        (isNext ? "text-green-600" : key === "sunrise" ? "text-amber-500" : "text-gray-900")
                      }
                    >
                      {row.iqamah}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special prayers row */}
            {(jumuahArabic || jumuahEnglish || (taraweehEnabled && taraweehTime) || (eidFitrActive && eidFitrTime) || (eidAdhaActive && eidAdhaTime)) && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {jumuahArabic && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(1,71,107,0.06)" }}>
                    <span className="text-gray-500 font-medium">Jumu&apos;ah Arabic</span>
                    <span className="font-bold font-mono" style={{ color: "#01476b" }}>{jumuahArabic}</span>
                  </div>
                )}
                {jumuahEnglish && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(1,71,107,0.06)" }}>
                    <span className="text-gray-500 font-medium">Jumu&apos;ah English</span>
                    <span className="font-bold font-mono" style={{ color: "#01476b" }}>{jumuahEnglish}</span>
                  </div>
                )}
                {taraweehEnabled && taraweehTime && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-purple-50">
                    <span className="text-purple-700 font-medium">Taraweeh</span>
                    <span className="text-purple-600 font-bold font-mono">{taraweehTime}</span>
                  </div>
                )}
                {eidFitrActive && eidFitrTime && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-amber-50">
                    <span className="text-amber-700 font-medium">Eid al-Fitr</span>
                    <span className="text-amber-600 font-bold font-mono">{eidFitrTime}</span>
                  </div>
                )}
                {eidAdhaActive && eidAdhaTime && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-amber-50">
                    <span className="text-amber-700 font-medium">Eid al-Adha</span>
                    <span className="text-amber-600 font-bold font-mono">{eidAdhaTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </>
  );
}
