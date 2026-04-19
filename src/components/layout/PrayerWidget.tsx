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
import { ChevronUp, CalendarDays } from "lucide-react";
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
import { cn } from "@/lib/utils";
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

/**
 * Minute-precision countdown for the screen-reader live region.
 * Re-renders every second but the string only changes once per minute,
 * so the aria-live region stays quiet between announcements.
 */
function formatCountdownForSR(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin === 0) return "less than a minute";
  if (diffMin < 60) return `in ${diffMin} minute${diffMin === 1 ? "" : "s"}`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `in ${h} hour${h === 1 ? "" : "s"} ${m} minute${m === 1 ? "" : "s"}`;
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

  // Tick every second so the seconds-precision countdown updates live.
  // `isMounted` gates the `Date.now()`-dependent countdown text so server and
  // first-client render produce identical HTML. The tick is paused when
  // nothing is visible (pill hidden by scroll AND modal closed) to avoid
  // ~60 wasted re-renders per minute per page.
  const [now, setNow] = useState(() => Date.now());
  const isMounted = useIsMounted();
  useEffect(() => {
    if (isHiddenByScroll && !isOpen) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [isHiddenByScroll, isOpen]);
  void now;

  // Body scroll lock while the modal is open so the page doesn't move under
  // the user's finger when they scroll over the backdrop.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

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
    ? parsePrayerTimeToDate(heroPrayer!.iqamah, false)
    : nextPrayer
      ? parsePrayerTimeToDate(nextPrayer.adhan, nextPrayer.isNextDay)
      : null;
  // Empty string on SSR and first client render keeps the `{countdown && ...}` block
  // hidden identically on both sides; real text appears after mount effect flips isMounted.
  // Live seconds countdown, rendered in both the pill and the hero.
  // Marked aria-hidden wherever it appears — ticking every second would spam
  // screen readers. The prayer name and time in the same block carry the
  // semantic information.
  const countdown = isMounted ? formatCountdown(countdownTarget) : "";
  // Separate minute-precision string for the aria-live region so SR announces
  // only once per minute instead of every second.
  const countdownForSR = isMounted ? formatCountdownForSR(countdownTarget) : "";

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
        className={cn(
          "fixed left-1/2 flex items-center gap-3 px-5 py-3.5",
          "rounded-full text-white text-base border border-white/10 z-[1000]",
          "cursor-pointer shadow-[0_12px_32px_rgba(1,71,107,0.35),0_4px_12px_rgba(0,0,0,0.1)]",
          "hover:shadow-[0_18px_42px_rgba(1,71,107,0.45),0_6px_16px_rgba(0,0,0,0.12)]",
          "active:scale-[0.96]",
          "max-[480px]:gap-2 max-[480px]:px-4 max-[480px]:py-3",
          isInIqamahWindow && "prayer-widget-pill-pulse",
        )}
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #01365c 100%)",
          maxWidth: "calc(100vw - 24px)",
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
        <span className="relative w-2.5 h-2.5 rounded-full bg-lime-400 flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-lime-400 prayer-widget-pulse-ring" aria-hidden="true" />
        </span>
        <span className="font-semibold text-base uppercase tracking-wide whitespace-nowrap">
          {isInIqamahWindow ? heroPrayer!.displayName : (nextPrayer?.displayName ?? "")}
        </span>
        {isInIqamahWindow ? (
          <span className="text-lime-300 font-semibold text-base uppercase tracking-wide whitespace-nowrap tabular-nums">
            {`Iqamah ${countdown}`}
          </span>
        ) : (
          <time
            className="text-lime-300 font-bold font-mono text-base whitespace-nowrap"
            dateTime={nextPrayer ? toISO24Hour(nextPrayer.adhan) : ""}
          >
            {nextPrayer?.adhan ?? ""}
          </time>
        )}
        <span
          className="flex items-center gap-1 text-white/50 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap ml-1 max-[520px]:hidden"
          aria-hidden="true"
        >
          Tap
          <ChevronUp className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
        <ChevronUp
          className="w-4 h-4 text-white/50 ml-1 min-[521px]:hidden"
          aria-hidden="true"
          strokeWidth={2.5}
        />
      </button>

      {/* Screen-reader live region — announces next-prayer info once per
          minute. Rendered only after mount to avoid any SSR/CSR drift;
          nothing meaningful to announce before `isMounted` flips anyway. */}
      {isMounted && nextPrayer && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Next prayer {nextPrayer.displayName} at {nextPrayer.adhan}
          {countdownForSR ? `, ${countdownForSR}` : ""}
        </span>
      )}

      {/* Expanded widget — always rendered, hidden via CSS when collapsed */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Prayer Times"
        aria-hidden={isOpen ? undefined : "true"}
        aria-modal={isOpen ? "true" : undefined}
        tabIndex={isOpen ? undefined : -1}
        className="fixed left-1/2 bottom-0 text-white z-[950]
                   rounded-t-3xl overflow-hidden flex flex-col
                   shadow-[0_-24px_64px_rgba(0,0,0,0.45),0_-4px_16px_rgba(0,0,0,0.2)]
                   max-[440px]:w-[calc(100vw-24px)]"
        style={{
          background: "#171717",
          width: "min(720px, calc(100vw - 24px))",
          maxHeight: "calc(100vh - 40px)",
          transform: isOpen
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(100%)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : "opacity 320ms cubic-bezier(0.33, 1, 0.68, 1), " +
              "transform 520ms cubic-bezier(0.34, 1.12, 0.64, 1)",
        }}
      >
          {/* Grab handle — bottom-sheet convention, only shown on mobile */}
          <div
            className="w-8 h-1 bg-white/20 rounded-full mx-auto mt-2.5 flex-shrink-0 md:hidden"
            aria-hidden="true"
          />

          {/* Single-row header: [date + datepicker] on the left · close on the right.
              Compact format on mobile so the whole row fits on ~320px viewports. */}
          <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-white/10 flex-shrink-0 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className="text-sm sm:text-base font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                data-testid="widget-date-label"
              >
                <span className="hidden sm:inline">Melbourne · {formatMelbourneDate(selectedDate)}</span>
                <span className="sm:hidden">
                  {formatMelbourneDate(selectedDate, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => shiftDate(-1)}
                className="h-9 w-8 sm:w-9 text-white/60 hover:text-white hover:bg-white/10 active:scale-95 rounded-md text-xl font-light transition-all duration-150 flex items-center justify-center"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-label={
                    isViewingToday
                      ? "Open date picker"
                      : `Selected date ${formatMelbourneDate(selectedDate)}, open date picker`
                  }
                  onClick={openNativeDatePicker}
                  className="h-9 w-9 sm:w-auto sm:px-3 text-xs font-medium text-white/85 hover:text-white hover:bg-white/20 bg-white/10 border border-white/10 active:scale-95 rounded-full transition-all duration-150 flex items-center justify-center sm:gap-1.5 whitespace-nowrap"
                >
                  <CalendarDays className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {isViewingToday ? "Today" : formatMelbourneDate(selectedDate, { month: "short", day: "numeric" })}
                  </span>
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
                className="h-9 w-8 sm:w-9 text-white/60 hover:text-white hover:bg-white/10 active:scale-95 rounded-md text-xl font-light transition-all duration-150 flex items-center justify-center"
              >
                <span aria-hidden="true">›</span>
              </button>
              {!isViewingToday && (
                <button
                  type="button"
                  aria-label="Back to today"
                  onClick={goToToday}
                  className="h-9 px-2 sm:px-2.5 ml-0.5 sm:ml-1 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 active:scale-95 rounded-md transition-all duration-150"
                >
                  Reset
                </button>
              )}
              </div>
            </div>

            <button
              type="button"
              aria-label="Close prayer times"
              onClick={closeWidget}
              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 hover:rotate-90 active:scale-90 rounded-md text-2xl font-light leading-none transition-all duration-200 ease-out flex items-center justify-center flex-shrink-0"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="px-6 pt-4 pb-6 overflow-y-auto flex-1">
            {/* Hero block — only rendered during an iqamah window. In normal state
                the next prayer is already highlighted inline in the prayer list. */}
            {isInIqamahWindow && (
              <div
                data-testid="prayer-widget-hero"
                data-iqamah="true"
                className="relative mb-4 px-4 py-4 sm:px-5 rounded-2xl overflow-hidden border border-lime-400/30"
                style={{ background: "rgba(163, 230, 53, 0.1)" }}
              >
                <div className="flex items-baseline justify-between gap-3 flex-nowrap">
                  <span className="font-bold text-2xl sm:text-3xl md:text-4xl uppercase tracking-wide text-white whitespace-nowrap">
                    {heroPrayer!.displayName}
                  </span>
                  <time
                    className="font-mono font-bold text-2xl sm:text-3xl md:text-4xl uppercase tracking-wide whitespace-nowrap tabular-nums prayer-widget-iqamah-pulse"
                    dateTime={toISO24Hour(heroPrayer!.iqamah)}
                  >
                    {`Iqamah ${countdown}`}
                  </time>
                </div>
              </div>
            )}

            {/* Prayer list — single column, columns aligned via subgrid */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-6 sm:gap-x-8 pb-4 mb-4 border-b border-white/10">
              {/* Column headers */}
              <div className="grid grid-cols-subgrid col-span-3 items-baseline px-3 pb-2 mb-1 border-b border-white/10">
                <span aria-hidden="true" />
                <span className="text-xs uppercase tracking-wider text-white/40 font-medium justify-self-end">
                  Athan
                </span>
                <span className="text-xs uppercase tracking-wider text-white/40 font-medium justify-self-end">
                  Iqamah
                </span>
              </div>
              {PRAYER_ORDER.map(({ key, displayName }) => {
                const row = viewedPrayers[key];
                const isActive =
                  isViewingToday &&
                  isInIqamahWindow &&
                  inIqamahWindow !== null &&
                  inIqamahWindow.name === key;
                const isNext =
                  isViewingToday &&
                  !isInIqamahWindow &&
                  nextPrayer !== null &&
                  nextPrayer.name === key;
                const [iqH, iqM] = toISO24Hour(row.iqamah).split(":").map(Number);
                const iqamahMinutes = iqH * 60 + iqM;
                const isPassed =
                  isViewingToday &&
                  currentMelbMinutes !== null &&
                  currentMelbMinutes >= iqamahMinutes &&
                  !isNext &&
                  !isActive;
                return (
                  <div
                    key={key}
                    data-prayer={key}
                    data-is-next={isNext ? "true" : undefined}
                    data-is-active={isActive ? "true" : undefined}
                    data-is-passed={isPassed ? "true" : undefined}
                    className={cn(
                      "grid grid-cols-subgrid col-span-3 items-baseline px-3 py-2.5 sm:py-3.5 rounded-lg transition-colors",
                      isPassed && "opacity-40",
                      isActive && "prayer-widget-row-active",
                      isNext && "bg-white/[0.08]",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {isNext && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" aria-hidden="true" />}
                      {isActive && (
                        <span
                          className="w-2 h-2 rounded-full bg-lime-300 flex-shrink-0 prayer-widget-row-dot"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          "text-sm uppercase tracking-wider font-semibold",
                          isActive ? "text-lime-300" : isNext ? "text-white" : "text-white/60",
                        )}
                      >
                        {displayName}
                      </span>
                    </div>
                    <time
                      className="block text-xl font-mono tracking-tight text-white whitespace-nowrap justify-self-end"
                      dateTime={toISO24Hour(row.adhan)}
                    >
                      {row.adhan}
                    </time>
                    <time
                      className="block text-base font-mono text-white/50 whitespace-nowrap justify-self-end"
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
              <dl className="pt-5 divide-y divide-white/10">
                {(jumuahArabic || jumuahEnglish) && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-white/70">Jumu&apos;ah</dt>
                    <dd className="flex items-baseline gap-3 text-white font-medium">
                      {jumuahArabic && (
                        <span className="flex items-baseline gap-1.5">
                          <span className="text-xs text-white/50">Arabic</span>
                          <span className="font-mono">{jumuahArabic}</span>
                        </span>
                      )}
                      {jumuahArabic && jumuahEnglish && (
                        <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                      )}
                      {jumuahEnglish && (
                        <span className="flex items-baseline gap-1.5">
                          <span className="text-xs text-white/50">English</span>
                          <span className="font-mono">{jumuahEnglish}</span>
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {taraweehEnabled && taraweehTime && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-white/70">Taraweeh</dt>
                    <dd className="text-white font-mono font-medium">{taraweehTime}</dd>
                  </div>
                )}
                {eidFitrActive && eidFitrTime && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-white/70">Eid al-Fitr</dt>
                    <dd className="text-white font-mono font-medium">{eidFitrTime}</dd>
                  </div>
                )}
                {eidAdhaActive && eidAdhaTime && (
                  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-white/70">Eid al-Adha</dt>
                    <dd className="text-white font-mono font-medium">{eidAdhaTime}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
    </>
  );
}
