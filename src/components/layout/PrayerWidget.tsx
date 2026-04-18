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

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { usePrayerTimes, useNextPrayer, usePrayerInIqamahWindow } from "@/hooks/usePrayerTimes";
import { usePrayerWidgetScroll } from "@/hooks/usePrayerWidgetScroll";
import { getPrayerTimesForDate, type PrayerName, type TodaysPrayerTimes } from "@/lib/prayer-times";
import {
  formatMelbourneDate,
  getMelbourneDateString,
  getMelbourneMinutesOfDay,
  isSameMelbourneDay,
} from "@/lib/time";
import { useIsMounted } from "@/hooks/useIsMounted";
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

/** Live countdown `in MM:SS` or `in H:MM:SS`. Ticks every second. */
function formatCountdown(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `in ${h}:${pad(m)}:${pad(s)}`;
  return `in ${m}:${pad(s)}`;
}

/** Parse "3:42 PM" → "15:42" for a <time datetime="..."> attribute. */
function toISO24Hour(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  if (!match) return time;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

export function PrayerWidget({ prayerSettings, testOpenInitially = false }: PrayerWidgetProps) {
  const pathname = usePathname();
  const todaysPrayers = usePrayerTimes(prayerSettings);
  const nextPrayer = useNextPrayer(prayerSettings);
  const inIqamahWindow = usePrayerInIqamahWindow(prayerSettings);
  const heroPrayer = inIqamahWindow ?? nextPrayer;
  const isInIqamahWindow = inIqamahWindow !== null;
  const [isOpen, setIsOpen] = useState(testOpenInitially);
  const pillRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Hide pill on scroll down; paused while widget is open so the widget doesn't disappear mid-view
  const isHiddenByScroll = usePrayerWidgetScroll(isOpen);

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

  const openNativeDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    // Use showPicker() when available (Chrome 99+, Safari 16+, Firefox 101+)
    // Falls back to focus+click for older browsers
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // showPicker can throw if the input isn't interactable; fall through
      }
    }
    input.focus();
    input.click();
  };

  // Tick every second so the hero's seconds-precision countdown updates live.
  // `isMounted` gates the `Date.now()`-dependent countdown text so server and
  // first-client render produce identical HTML.
  const [now, setNow] = useState(() => Date.now());
  const isMounted = useIsMounted();
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);
  void now;

  // Current Melbourne minute-of-day, used to dim prayers that have already
  // passed today. Null on SSR/first render to avoid hydration mismatch.
  const currentMelbMinutes = isMounted ? getMelbourneMinutesOfDay(new Date()) : null;

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelectedDate(new Date());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Focus trap while dialog is open
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const getFocusable = (): HTMLElement[] => {
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    const initialFocus = getFocusable()[0];
    initialFocus?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // When transitioning from open→closed, return focus to the pill
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      // Re-focus after the pill is rendered/interactive again
      setTimeout(() => pillRef.current?.focus(), 0);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Close handler — resets selected date alongside closing so reopening is fresh
  const closeWidget = () => {
    setIsOpen(false);
    setSelectedDate(new Date());
  };

  if (pathname?.startsWith("/studio")) return null;

  const countdownTarget = isInIqamahWindow
    ? parsePrayerTimeToDate(heroPrayer.iqamah, false)
    : parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay);
  // Empty string on SSR and first client render keeps the `{countdown && ...}` block
  // hidden identically on both sides; real text appears after mount effect flips isMounted.
  // Live seconds countdown, rendered in both the pill and the hero.
  // Marked aria-hidden wherever it appears — ticking every second would spam
  // screen readers. The prayer name and time in the same block carry the
  // semantic information.
  const countdown = isMounted ? formatCountdown(countdownTarget) : "";

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
        onClick={closeWidget}
        aria-hidden="true"
        className="fixed inset-0 z-[900]"
        style={{
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : "opacity 400ms cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      />

      {/* Pill — always rendered, hidden via CSS when expanded */}
      <button
        ref={pillRef}
        type="button"
        aria-label="Open prayer times"
        aria-hidden={isOpen ? "true" : undefined}
        tabIndex={isOpen ? -1 : 0}
        onClick={() => setIsOpen(true)}
        data-hidden-by-scroll={isHiddenByScroll ? "true" : "false"}
        className="fixed left-1/2 flex items-center gap-3 px-4 py-3
                   rounded-full text-white text-sm border border-white/10 z-[1000]
                   cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]
                   hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]
                   max-[440px]:rounded-2xl max-[440px]:justify-between"
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #01365c 100%)",
          width: "400px",
          bottom: "20px",
          transform: isOpen
            ? "translateX(-50%) translateY(120px) scale(0.9)"
            : isHiddenByScroll
            ? "translateX(-50%) translateY(120px)"
            : "translateX(-50%)",
          opacity: isOpen || isHiddenByScroll ? 0 : 1,
          pointerEvents: isOpen || isHiddenByScroll ? "none" : "auto",
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : "opacity 220ms cubic-bezier(0.33, 1, 0.68, 1), " +
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
          {countdown && (
            <span className="text-white/55 text-xs tabular-nums" aria-hidden="true">
              {countdown}
            </span>
          )}
          <span className="text-white/40 text-[10px]" aria-hidden="true">▴</span>
        </span>
      </button>

      {/* Expanded widget — always rendered, hidden via CSS when collapsed */}
      <div
        ref={dialogRef}
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
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : "opacity 320ms cubic-bezier(0.33, 1, 0.68, 1), " +
              "transform 520ms cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      >
          <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mt-2.5 flex-shrink-0" aria-hidden="true" />

          <div className="px-6 pt-3 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 flex-shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Prayer Times</h2>
              <div className="text-xs text-gray-500 mt-0.5" data-testid="widget-date-label">
                Melbourne · {formatMelbourneDate(selectedDate)}
              </div>
            </div>
            <div className="flex items-center gap-0.5 -mr-2">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => shiftDate(-1)}
                className="h-11 w-11 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md text-xl font-light transition-colors flex items-center justify-center"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-label={isViewingToday ? "Open date picker" : `Selected date ${formatMelbourneDate(selectedDate)}, open date picker`}
                  onClick={openNativeDatePicker}
                  className="h-11 px-3 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {isViewingToday ? "Today" : formatMelbourneDate(selectedDate, { month: "short", day: "numeric" })}
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  aria-label="Pick a date"
                  value={getMelbourneDateString(selectedDate)}
                  onChange={handleDateInputChange}
                  tabIndex={-1}
                  className="sr-only"
                />
              </div>
              <button
                type="button"
                aria-label="Next day"
                onClick={() => shiftDate(1)}
                className="h-11 w-11 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md text-xl font-light transition-colors flex items-center justify-center"
              >
                <span aria-hidden="true">›</span>
              </button>
              {!isViewingToday && (
                <button
                  type="button"
                  aria-label="Back to today"
                  onClick={goToToday}
                  className="h-11 px-2.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                aria-label="Close prayer times"
                onClick={closeWidget}
                className="h-11 w-11 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md text-2xl font-light leading-none transition-colors flex items-center justify-center"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>

          <div className="px-6 pt-6 pb-6 overflow-y-auto flex-1">
            {/* Hero block — Next prayer OR current prayer in its iqamah window */}
            <div
              className="relative mb-8 p-5 pl-6 rounded-2xl overflow-hidden"
              style={{ background: "rgba(0, 173, 76, 0.12)" }}
            >
              <span
                className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"
                aria-hidden="true"
              />

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-[10px] font-semibold text-green-700 uppercase tracking-[0.18em]">
                  {isInIqamahWindow ? "Iqamah" : "Next Prayer"}
                </span>
                {countdown && (
                  <>
                    <span className="text-green-300" aria-hidden="true">·</span>
                    <span
                      className="text-xs font-semibold text-green-700 tabular-nums"
                      aria-hidden="true"
                    >
                      {countdown}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-4 flex-wrap mb-3">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-none">
                  {heroPrayer.displayName}
                </div>
                <time
                  className="text-4xl md:text-5xl font-mono font-semibold text-gray-900 tracking-tight leading-none"
                  dateTime={toISO24Hour(heroPrayer.adhan)}
                >
                  {heroPrayer.adhan}
                </time>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>
                  Athan{" "}
                  <time className="text-gray-700 font-mono" dateTime={toISO24Hour(heroPrayer.adhan)}>
                    {heroPrayer.adhan}
                  </time>
                </span>
                <span className="text-green-300" aria-hidden="true">·</span>
                <span>
                  Iqamah{" "}
                  <time
                    className={
                      "font-mono font-semibold " +
                      (isInIqamahWindow
                        ? "prayer-widget-iqamah-pulse"
                        : "text-green-700")
                    }
                    dateTime={toISO24Hour(heroPrayer.iqamah)}
                  >
                    {heroPrayer.iqamah}
                  </time>
                </span>
              </div>
            </div>

            {/* Prayer grid — flat, no borders */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 pb-6 border-b border-gray-100">
              {PRAYER_ORDER.map(({ key, displayName }) => {
                const row = viewedPrayers[key];
                const isNext = isViewingToday && nextPrayer.name === key;
                // A prayer is "passed" once the current Melbourne minute-of-day
                // is at or after its iqamah time, for today only. Muted visually
                // so upcoming prayers read more prominently.
                const [iqH, iqM] = toISO24Hour(row.iqamah).split(":").map(Number);
                const iqamahMinutes = iqH * 60 + iqM;
                const isPassed =
                  isViewingToday &&
                  currentMelbMinutes !== null &&
                  currentMelbMinutes >= iqamahMinutes &&
                  !isNext;
                return (
                  <div
                    key={key}
                    data-prayer={key}
                    data-is-next={isNext ? "true" : undefined}
                    data-is-passed={isPassed ? "true" : undefined}
                    className={
                      "rounded-xl px-3 py-2.5 border transition-shadow " +
                      (isPassed ? "opacity-40 " : "") +
                      (isNext
                        ? "bg-green-50 border-green-200 shadow-md"
                        : "bg-white border-gray-100 shadow-sm")
                    }
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {isNext && <span className="w-1 h-1 rounded-full bg-green-600" aria-hidden="true" />}
                      <div className={"text-[10px] font-semibold uppercase tracking-[0.12em] " + (isNext ? "text-green-600" : "text-gray-400")}>
                        {displayName}
                      </div>
                    </div>
                    <time
                      className={
                        "block text-xl font-mono tracking-tight text-gray-900 " +
                        (isNext ? "font-semibold" : "font-medium")
                      }
                      dateTime={toISO24Hour(row.adhan)}
                    >
                      {row.adhan}
                    </time>
                    <time
                      className="block text-xs text-gray-400 font-mono whitespace-nowrap mt-0.5"
                      dateTime={toISO24Hour(row.iqamah)}
                    >
                      {row.iqamah}
                    </time>
                  </div>
                );
              })}
            </div>

            {/* Special prayers — flat list, no chips */}
            {(jumuahArabic || jumuahEnglish || (taraweehEnabled && taraweehTime) || (eidFitrActive && eidFitrTime) || (eidAdhaActive && eidAdhaTime)) && (
              <dl className="pt-5 divide-y divide-gray-100">
                {(jumuahArabic || jumuahEnglish) && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-gray-600">Jumu&apos;ah</dt>
                    <dd className="flex items-baseline gap-3 text-gray-900 font-medium">
                      {jumuahArabic && (
                        <span className="flex items-baseline gap-1.5">
                          <span className="text-xs text-gray-500">Arabic</span>
                          <span className="font-mono">{jumuahArabic}</span>
                        </span>
                      )}
                      {jumuahArabic && jumuahEnglish && (
                        <span className="h-3 w-px bg-gray-300" aria-hidden="true" />
                      )}
                      {jumuahEnglish && (
                        <span className="flex items-baseline gap-1.5">
                          <span className="text-xs text-gray-500">English</span>
                          <span className="font-mono">{jumuahEnglish}</span>
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {taraweehEnabled && taraweehTime && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-gray-600">Taraweeh</dt>
                    <dd className="text-gray-900 font-mono font-medium">{taraweehTime}</dd>
                  </div>
                )}
                {eidFitrActive && eidFitrTime && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-gray-600">Eid al-Fitr</dt>
                    <dd className="text-gray-900 font-mono font-medium">{eidFitrTime}</dd>
                  </div>
                )}
                {eidAdhaActive && eidAdhaTime && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-gray-600">Eid al-Adha</dt>
                    <dd className="text-gray-900 font-mono font-medium">{eidAdhaTime}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
    </>
  );
}
