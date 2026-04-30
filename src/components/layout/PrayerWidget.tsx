/**
 * Prayer Widget — V4 Geometric
 *
 * A persistent site-wide widget pinned to the bottom-center of every page.
 * Collapsed state: a sharp-cornered "geometric tile" pill showing the next
 * prayer name, time, and a small countdown chip.
 * Expanded state: a full panel with a hero block, today's prayer schedule,
 * Jumu'ah, conditional special-prayer bands (Taraweeh / Eid), and a date
 * picker for browsing other days.
 *
 * Visual language matches the "V4 Geometric" handoff: dark charcoal surfaces
 * (#0F1114 / #15181C), cream foreground (#E8DFCB), leaf-green accent
 * (#7FB539), Inter typography across the widget, star-pattern ornament
 * backdrops. Scoped to this widget via the `pw-v4` class — the rest of the
 * site keeps the existing brand tokens.
 *
 * All prayer times and date operations use the Australia/Melbourne timezone
 * via the existing `usePrayerTimes` / `useNextPrayer` hooks and the
 * `getPrayerTimesForDate` utility. Reads from the existing `prayerSettings`
 * Sanity singleton (read-only — no schema changes).
 *
 * @module components/layout/PrayerWidget
 */
"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { CalendarDays, ChevronUp, RotateCcw } from "lucide-react";
import { usePathname } from "next/navigation";
import { usePrayerTimes, useNextPrayer, usePrayerInIqamahWindow } from "@/hooks/usePrayerTimes";
import { usePrayerWidgetScroll } from "@/hooks/usePrayerWidgetScroll";
import { getPrayerTimesForDate, type PrayerName, type TodaysPrayerTimes } from "@/lib/prayer-times";
import {
  formatMelbourneDate,
  formatMelbourneHijri,
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

/** Live countdown `MM:SS` or `H:MM:SS`. Ticks every second. */
function formatCountdown(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/** Short countdown chip on the pill — "1h 27m" / "27m" / "47s". */
function formatPillChip(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${totalSec}s`;
}

/**
 * Hero countdown with seconds — "2h 57m 03s" / "27m 03s" / "03s".
 * Seconds are zero-padded so the ticker doesn't jiggle the layout each
 * time it ticks down past `:09` → `:10`. Hours are not padded (matches
 * the "in 2h" reading style); minutes are padded only when paired with
 * an hours segment so the line reads `2h 07m 03s` cleanly.
 */
function formatHeroChip(target: Date | null): string {
  if (!target) return "";
  const diffMs = target.getTime() - Date.now();
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${pad(s)}s`;
}

/** Minute-precision countdown for the screen-reader live region. */
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

/** V4 geometric 8-point star ornament. Drawn inline so its stroke inherits currentColor. */
function V4Ornament({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-20 -20 40 40"
      style={{ display: "inline-block", flexShrink: 0 }}
      aria-hidden="true"
    >
      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1="-14"
          y1="0"
          x2="14"
          y2="0"
          stroke={color}
          strokeWidth="1"
          transform={`rotate(${a})`}
          opacity="0.4"
        />
      ))}
      <polygon
        points="0,-11 3,-3 11,0 3,3 0,11 -3,3 -11,0 -3,-3"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
      />
      <circle r="2" fill={color} />
    </svg>
  );
}

/** Tiling star pattern for surface backdrops. Rendered as absolutely-positioned SVG. */
function V4StarPattern({
  opacity = 0.08,
  size = 40,
  color = "var(--v4-accent)",
}: {
  opacity?: number;
  size?: number;
  color?: string;
}) {
  const patternId = useId();
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <g transform={`translate(${size / 2} ${size / 2})`}>
            {[0, 45, 90, 135].map((a) => (
              <line
                key={a}
                x1={-size * 0.35}
                y1="0"
                x2={size * 0.35}
                y2="0"
                stroke={color}
                strokeWidth="0.8"
                transform={`rotate(${a})`}
              />
            ))}
            <circle r={size * 0.18} fill="none" stroke={color} strokeWidth="0.6" />
            <polygon
              points={`0,-${size * 0.28} ${size * 0.07},-${size * 0.07} ${size * 0.28},0 ${size * 0.07},${size * 0.07} 0,${size * 0.28} -${size * 0.07},${size * 0.07} -${size * 0.28},0 -${size * 0.07},-${size * 0.07}`}
              fill="none"
              stroke={color}
              strokeWidth="0.8"
            />
          </g>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
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

  // Body scroll lock while the modal is open.
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

  // Seconds-precision countdown for the hero iqamah "Iqamah in M:SS" phrase.
  const countdown = isMounted ? formatCountdown(countdownTarget) : "";
  // Shorter "1h 27m" chip on the pill (no seconds — pill stays calm).
  const pillChip = isMounted ? formatPillChip(countdownTarget) : "";
  // Hero "Next" eyebrow includes seconds so the user sees a live ticker.
  const heroChip = isMounted ? formatHeroChip(countdownTarget) : "";
  // Minute-precision string for the aria-live region.
  const countdownForSR = isMounted ? formatCountdownForSR(countdownTarget) : "";

  const hijriLabel = isMounted ? formatMelbourneHijri(selectedDate) : "";

  const jumuahArabic = prayerSettings?.jumuahArabicTime;
  const jumuahEnglish = prayerSettings?.jumuahEnglishTime;
  const taraweehEnabled = prayerSettings?.taraweehEnabled ?? false;
  const taraweehTime = prayerSettings?.taraweehTime;
  const eidFitrActive = prayerSettings?.eidFitrActive ?? false;
  const eidFitrTime = prayerSettings?.eidFitrTime;
  const eidAdhaActive = prayerSettings?.eidAdhaActive ?? false;
  const eidAdhaTime = prayerSettings?.eidAdhaTime;

  const hasSpecials = taraweehEnabled && taraweehTime
    || (eidFitrActive && eidFitrTime)
    || (eidAdhaActive && eidAdhaTime);

  return (
    <div
      className="pw-v4"
      style={
        {
          // V4 Geometric token set, scoped to this widget. Inline so the
          // vars are guaranteed to resolve even if a bundler cache stalls on
          // global stylesheet updates.
          "--v4-bg": "#0F1114",
          "--v4-surface": "#15181C",
          "--v4-fg": "#E8DFCB",
          "--v4-accent": "#7FB539",
          "--v4-mute": "rgba(232, 223, 203, 0.6)",
          "--v4-mute-strong": "rgba(232, 223, 203, 0.78)",
          "--v4-rule": "rgba(232, 223, 203, 0.12)",
          "--v4-tile": "rgba(127, 181, 57, 0.12)",
          "--v4-tile-strong": "rgba(127, 181, 57, 0.2)",
          "--v4-serif": 'var(--font-inter), "Inter", system-ui, sans-serif',
          "--v4-sans": 'var(--font-inter), "Inter", system-ui, sans-serif',
        } as React.CSSProperties
      }
    >
      {/* Backdrop — always rendered, opacity toggles */}
      <div
        data-testid="prayer-widget-backdrop"
        onClick={closeWidget}
        aria-hidden="true"
        className="fixed inset-0 z-[900]"
        style={{
          background: "rgba(6, 8, 12, 0.65)",
          backdropFilter: isOpen ? "blur(10px)" : "blur(0px)",
          WebkitBackdropFilter: isOpen ? "blur(10px)" : "blur(0px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 600ms cubic-bezier(0.22, 1, 0.36, 1), -webkit-backdrop-filter 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Pill — always rendered, hidden via transform/opacity when expanded */}
      <button
        ref={pillRef}
        type="button"
        aria-label="Open prayer times"
        aria-hidden={isOpen ? "true" : undefined}
        tabIndex={isOpen ? -1 : 0}
        onClick={() => setIsOpen(true)}
        data-hidden-by-scroll={isHiddenByScroll ? "true" : "false"}
        data-iqamah={isInIqamahWindow ? "true" : undefined}
        className={cn(
          "prayer-widget-pill", // adds hover-lift + first-mount nudge in globals.css
          "fixed left-1/2 flex items-center gap-3.5 z-[1000] cursor-pointer group",
          "px-4 py-2.5",
          "active:scale-[0.98]",
          "max-[480px]:gap-2.5 max-[480px]:px-3 max-[480px]:py-2",
          isInIqamahWindow && "prayer-widget-pill-pulse",
        )}
        style={{
          background: isInIqamahWindow ? "var(--v4-accent)" : "var(--v4-surface)",
          color: isInIqamahWindow ? "var(--v4-bg)" : "var(--v4-fg)",
          fontFamily: "var(--v4-sans)",
          border: isInIqamahWindow
            ? "1px solid var(--v4-accent)"
            : "1px solid rgba(127, 181, 57, 0.45)",
          borderRadius: 2,
          maxWidth: "calc(100vw - 24px)",
          bottom: "20px",
          boxShadow: isInIqamahWindow
            ? "0 12px 40px rgba(127, 181, 57, 0.45), 0 0 0 4px rgba(127, 181, 57, 0.15)"
            : "0 14px 38px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(127, 181, 57, 0.08)",
          transform: isOpen
            ? "translateX(-50%) translateY(140px) scale(0.92)"
            : isHiddenByScroll
            ? "translateX(-50%) translateY(140px)"
            : "translateX(-50%)",
          opacity: isOpen || isHiddenByScroll ? 0 : 1,
          pointerEvents: isOpen || isHiddenByScroll ? "none" : "auto",
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : "opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), " +
              "transform 480ms cubic-bezier(0.22, 1, 0.36, 1), " +
              "box-shadow 300ms ease",
          position: "fixed",
          overflow: "hidden",
        }}
      >
        {/* Backdrop pattern */}
        {!isInIqamahWindow && (
          <V4StarPattern opacity={0.045} size={40} color="var(--v4-accent)" />
        )}
        {/* Legacy dot + pulse ring preserved so tests that assert .prayer-widget-pulse-ring can still find it.
            Visually: the star ornament to the right replaces the "active" dot signal. */}
        <span
          className="relative inline-block w-2 h-2 rounded-full flex-shrink-0 prayer-widget-pulse-ring"
          aria-hidden="true"
          style={{
            background: isInIqamahWindow ? "var(--v4-bg)" : "var(--v4-accent)",
          }}
        />

        <V4Ornament
          size={18}
          color={isInIqamahWindow ? "var(--v4-bg)" : "var(--v4-accent)"}
        />

        {isInIqamahWindow ? (
          <span className="relative inline-flex items-baseline gap-2">
            <span
              className="text-[10px] uppercase font-bold whitespace-nowrap"
              style={{
                letterSpacing: "0.22em",
                opacity: 0.78,
              }}
            >
              {heroPrayer!.displayName} · Iqamah in
            </span>
            <time
              className="text-base font-semibold whitespace-nowrap tabular-nums"
              style={{ fontFamily: "var(--v4-sans)" }}
              dateTime={toISO24Hour(heroPrayer!.iqamah)}
            >
              {countdown || "—"}
            </time>
          </span>
        ) : (
          <>
            <span className="relative inline-flex items-baseline gap-2">
              <span
                className="text-[10px] uppercase font-bold whitespace-nowrap"
                style={{
                  letterSpacing: "0.22em",
                  color: "var(--v4-mute)",
                }}
              >
                Next
              </span>
              <span
                className="text-[15px] font-semibold whitespace-nowrap"
                style={{ fontFamily: "var(--v4-serif)" }}
              >
                {nextPrayer?.displayName ?? ""}
              </span>
              {nextPrayer && (
                <time
                  className="text-[17px] font-medium whitespace-nowrap tabular-nums"
                  dateTime={toISO24Hour(nextPrayer.adhan)}
                >
                  {nextPrayer.adhan}
                </time>
              )}
            </span>
            <span
              aria-hidden="true"
              className="relative inline-block self-center"
              style={{
                width: 1,
                height: 16,
                background: "var(--v4-rule)",
              }}
            />
            <time
              className="relative text-[10px] uppercase font-bold whitespace-nowrap tabular-nums max-[420px]:hidden"
              style={{
                letterSpacing: "0.2em",
                color: "var(--v4-accent)",
              }}
              dateTime={nextPrayer ? toISO24Hour(nextPrayer.adhan) : ""}
            >
              {pillChip ? `in ${pillChip}` : nextPrayer?.adhan ?? ""}
            </time>
          </>
        )}

        {/* Tap affordance — small chevron + (desktop) "View" hint to signal the
            pill is interactive. Hidden inside an inline-flex so width grows
            naturally; chevron has its own gentle bobbing animation. */}
        <span
          aria-hidden="true"
          className="relative inline-flex items-center gap-1 ml-1 prayer-widget-pill-hint"
          style={{
            color: isInIqamahWindow ? "var(--v4-bg)" : "var(--v4-mute-strong)",
            opacity: 0.85,
          }}
        >
          <span
            className="hidden min-[521px]:inline text-[9px] uppercase font-bold"
            style={{ letterSpacing: "0.18em" }}
          >
            View
          </span>
          <ChevronUp className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      </button>

      {/* Screen-reader live region */}
      {isMounted && nextPrayer && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Next prayer {nextPrayer.displayName} at {nextPrayer.adhan}
          {countdownForSR ? `, ${countdownForSR}` : ""}
        </span>
      )}

      {/* Full-screen takeover panel.
          Covers the entire viewport on open. Split layout on desktop
          (hero left / schedule right), stacked on mobile.
          Animation: scales up from 0.94 with a slight upward drift, fading
          in over ~520ms with an ease-out-quart curve so the entrance feels
          smooth rather than snappy. Close runs in reverse a touch faster. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Prayer Times"
        aria-hidden={isOpen ? undefined : "true"}
        aria-modal={isOpen ? "true" : undefined}
        tabIndex={isOpen ? undefined : -1}
        className="fixed inset-0 z-[950] flex flex-col
                   md:inset-y-[10vh] md:inset-x-[6vw] md:rounded-2xl md:overflow-hidden md:shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:border md:border-[var(--v4-rule)]
                   lg:inset-y-[12.5vh] lg:inset-x-[10vw] lg:shadow-[0_30px_80px_rgba(0,0,0,0.5)]
                   xl:inset-x-[12vw]
                   2xl:inset-x-[18vw] 2xl:max-w-[1400px] 2xl:left-1/2 2xl:-translate-x-1/2 2xl:right-auto 2xl:w-[calc(100vw-36vw)]"
        style={{
          background: "var(--v4-bg)",
          color: "var(--v4-fg)",
          fontFamily: "var(--v4-sans)",
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.94) translateY(16px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transformOrigin: "center bottom",
          // Open uses 520ms ease-out-quart; close is 380ms so dismiss feels
          // intentional but never abrupt. Reduced-motion users get a 150ms
          // cross-fade with no transform change.
          transition: prefersReducedMotion
            ? "opacity 150ms ease"
            : isOpen
            ? "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 580ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "opacity 380ms cubic-bezier(0.4, 0, 1, 1), transform 420ms cubic-bezier(0.4, 0, 1, 1)",
          // Prevent Safari's overscroll-bounce exposing bg behind this overlay
          overscrollBehavior: "contain",
        }}
      >
        {/* =============================================================
            Top bar — single unified row. Uses the SAME grid template
            as the body (`md:grid-cols-[1fr_1.3fr] lg:grid-cols-[1.1fr_1fr]`)
            with NO horizontal padding on the grid container, so the
            column boundary in the header lines up *exactly* with the
            hero/schedule split in the body. Children carry their own
            horizontal padding: the date stack mirrors a generic header
            pad on the left, the picker mirrors the schedule column's
            internal `md:px-3 lg:px-4` so the prev button sits at the
            same x as the "Fajr" / "Dhuhr" labels in the prayer list
            below.
            Mobile (<md) collapses to a single column with date
            centered on top, picker centered below.
            Close button stays absolute top-right at `right-4` /
            `md:right-6`; the picker's bounded width keeps it well
            clear of the close button on every breakpoint. */}
        <div
          className="relative grid grid-cols-1 justify-items-center
                     md:grid-cols-[1fr_1.3fr] lg:grid-cols-[1.1fr_1fr]
                     md:items-center md:justify-items-stretch
                     gap-y-2 md:gap-y-0 md:gap-x-0
                     py-3 lg:py-4
                     flex-shrink-0"
          style={{ borderBottom: "1px solid var(--v4-rule)" }}
        >
          {/* Close button — absolute top-right */}
          <button
            type="button"
            aria-label="Close prayer times"
            onClick={closeWidget}
            className="absolute top-3 right-4 md:top-4 md:right-6 h-9 w-9 md:h-10 md:w-10 flex items-center justify-center flex-shrink-0 transition-colors z-10"
            style={{
              border: "1px solid rgba(232, 223, 203, 0.28)",
              borderRadius: "999px",
              color: "var(--v4-fg)",
              background: "var(--v4-bg)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2 2 L10 10 M10 2 L2 10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Date stack: Gregorian on top, Hijri muted below.
              Carries its own horizontal padding (so the grid container
              can stay padding-free for column-alignment). Centered on
              mobile, left-aligned on md+. `min-w-0` + `overflow-hidden`
              on the wrapper, paired with `w-full` on the children, lets
              the grid track shrink at cramped widths so the long
              Gregorian date truncates with ellipsis. */}
          <div className="flex flex-col items-stretch md:justify-self-start min-w-0 w-full overflow-hidden
                          pl-5 pr-14 sm:pl-8 sm:pr-16 md:pl-10 md:pr-3 lg:pr-4">
            <div
              className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center md:text-left
                         text-base min-[400px]:text-lg sm:text-xl md:text-base lg:text-xl"
              data-testid="widget-date-label"
              style={{ color: "var(--v4-fg)", letterSpacing: "-0.01em" }}
            >
              Melbourne · {formatMelbourneDate(selectedDate)}
            </div>
            {hijriLabel && (
              <div
                className="uppercase font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center md:text-left mt-0.5
                           text-[11px] sm:text-xs lg:text-[11px]"
                style={{
                  letterSpacing: "0.2em",
                  color: "var(--v4-mute)",
                }}
              >
                {hijriLabel}
              </div>
            )}
          </div>

          {/* Picker buttons — prev / today / next + reset.
              md+: `justify-self-start` anchors the picker to the left
              edge of col 2, and `md:pl-3 lg:pl-4` mirrors the schedule
              column's own internal padding so the prev button's left
              edge lines up with the prayer-name column ("Fajr" /
              "Dhuhr" labels) in the list below. */}
          <div className="flex items-center gap-2 flex-shrink-0
                          md:justify-self-start md:pl-3 lg:pl-4">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => shiftDate(-1)}
              className="h-9 w-9 text-xl font-light transition-colors flex items-center justify-center"
              style={{
                color: "var(--v4-mute-strong)",
                border: "1px solid var(--v4-rule)",
                background: "transparent",
              }}
            >
              <span aria-hidden="true">‹</span>
            </button>
            {/* "Today" / selected-date pill — wraps the hidden native
                <input type="date"> so showPicker() opens the calendar
                next to this button. */}
            <div className="relative">
              <button
                type="button"
                aria-label={
                  isViewingToday
                    ? "Open date picker"
                    : `Selected date ${formatMelbourneDate(selectedDate)}, open date picker`
                }
                onClick={openNativeDatePicker}
                className="h-9 min-w-[88px] px-3 text-[11px] uppercase font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                style={{
                  letterSpacing: "0.14em",
                  color: "var(--v4-fg)",
                  background: "transparent",
                  border: "1px solid var(--v4-rule)",
                }}
              >
                <CalendarDays
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                  style={{ color: "var(--v4-accent)" }}
                />
                {isViewingToday
                  ? "Today"
                  : formatMelbourneDate(selectedDate, { month: "short", day: "numeric" })}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                aria-label="Pick a date"
                value={getMelbourneDateString(selectedDate)}
                onChange={handleDateInputChange}
                tabIndex={-1}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
              />
            </div>
            <button
              type="button"
              aria-label="Next day"
              onClick={() => shiftDate(1)}
              className="h-9 w-9 text-xl font-light transition-colors flex items-center justify-center"
              style={{
                color: "var(--v4-mute-strong)",
                border: "1px solid var(--v4-rule)",
                background: "transparent",
              }}
            >
              <span aria-hidden="true">›</span>
            </button>
            {/* Reset button — always rendered so its slot is reserved
                in the flex layout (using `invisible` when on today),
                preventing the prev/today/next buttons from shifting
                when the user navigates to a non-today date. */}
            <button
              type="button"
              aria-label="Back to today"
              onClick={goToToday}
              tabIndex={isViewingToday ? -1 : undefined}
              aria-hidden={isViewingToday ? true : undefined}
              className={cn(
                "h-9 w-9 flex items-center justify-center transition-colors",
                isViewingToday && "invisible",
              )}
              style={{
                color: "var(--v4-accent)",
                background: "transparent",
                border: "1px solid var(--v4-rule)",
              }}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* =============================================================
            Body — split on lg, stacked below.
            Left column: hero (big Next or Iqamah countdown).
            Right column: schedule + Jumu'ah + specials + footer (scrollable). */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] lg:grid-cols-[1.1fr_1fr] overflow-hidden">
          {/* ===== HERO COLUMN ===== */}
          <div
            className="relative flex flex-col justify-center items-stretch overflow-hidden py-[clamp(14px,3vh,28px)] sm:py-[clamp(20px,4vh,40px)] lg:py-[min(6vh,56px)] px-[clamp(20px,5vw,56px)]"
            style={{
              background: "var(--v4-surface)",
              borderBottom: "1px solid var(--v4-rule)",
              borderRight: "1px solid var(--v4-rule)",
            }}
          >
            <V4StarPattern opacity={0.08} size={80} color="var(--v4-accent)" />
            {/* Double-line accent frame */}
            <div
              aria-hidden="true"
              className="absolute pointer-events-none hidden sm:block"
              style={{
                inset: "clamp(16px, 2.5vw, 28px)",
                border: "1px solid rgba(127, 181, 57, 0.22)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute pointer-events-none hidden sm:block"
              style={{
                inset: "clamp(20px, 3vw, 32px)",
                border: "1px solid rgba(127, 181, 57, 0.12)",
              }}
            />

            {isInIqamahWindow ? (
              <div
                data-testid="prayer-widget-hero"
                data-iqamah="true"
                className="relative text-center"
              >
                <V4Ornament size={36} color="var(--v4-accent)" />
                {/* Eyebrow — just the prayer name. The "· Iqamah in"
                    suffix the original eyebrow carried has been folded
                    into the big timer line below so the eyebrow stays
                    tight at every breakpoint. */}
                <div
                  className="mt-3 text-[11px] lg:text-xs uppercase font-bold"
                  style={{
                    letterSpacing: "0.3em",
                    color: "var(--v4-accent)",
                  }}
                >
                  {heroPrayer!.displayName}
                </div>
                {/* Big "Iqamah in M:SS" line. `whitespace-nowrap`
                    guarantees the phrase + countdown stay on a single
                    line; the responsive font ladder shrinks the type
                    at md (where the hero column is narrowest in the
                    split layout) and grows it again at lg/xl as the
                    column widens. The Athan/Iqamah secondary line
                    that used to sit underneath was dropped per the
                    new mobile design — that information is already
                    repeated in the prayer list below. */}
                <time
                  className="block mt-3 whitespace-nowrap font-light tabular-nums prayer-widget-iqamah-pulse
                             text-[clamp(2rem,11vw,3.25rem)]
                             sm:text-6xl
                             md:text-4xl lg:text-5xl xl:text-6xl"
                  style={{
                    fontFamily: "var(--v4-sans)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                  dateTime={toISO24Hour(heroPrayer!.iqamah)}
                >
                  {`Iqamah in ${countdown || "—"}`}
                </time>
              </div>
            ) : (
              <div className="relative text-center">
                <div className="hidden lg:block">
                  <V4Ornament size={36} color="var(--v4-accent)" />
                </div>
                {/* Mobile: name + time inline on one baseline row to save
                    vertical space so all six daily prayers + Jumu'ah fit
                    in the 844px viewport without scrolling.
                    sm+: original V4 stacked layout (large prayer name
                    above big time). */}
                <div className="flex items-baseline justify-center gap-x-3 flex-wrap sm:block">
                  {/* Hero name: short prayer names ("Dhuhr") and long
                      date strings ("Wednesday 29 April 2026") share the
                      same slot. lg+ uses a fluid clamp() so the font
                      shrinks for longer text and never overflows the
                      hero column at narrower desktop widths. */}
                  <div
                    className="text-3xl sm:mt-5 sm:text-4xl lg:text-[clamp(2.5rem,5vw,7rem)]"
                    style={{
                      fontFamily: "var(--v4-serif)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {isViewingToday
                      ? nextPrayer?.displayName ?? "—"
                      : formatMelbourneDate(selectedDate, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                  </div>
                  {isViewingToday && nextPrayer && (
                    <time
                      className="text-2xl sm:block sm:mt-6 sm:text-3xl lg:text-[clamp(2rem,4vw,5.5rem)] font-light sm:font-light lg:font-medium tabular-nums"
                      style={{
                        fontFamily: "var(--v4-sans)",
                        letterSpacing: "-0.03em",
                        color: "var(--v4-accent)",
                        lineHeight: 1,
                      }}
                      dateTime={toISO24Hour(nextPrayer.adhan)}
                    >
                      {nextPrayer.adhan}
                    </time>
                  )}
                </div>
                {/* "Next · in 2h 57m 03s" countdown line under the time,
                    with a live seconds ticker (component re-renders every
                    second via the existing countdown interval). Sized up
                    on every breakpoint so the live counter reads as a
                    primary part of the hero, not an afterthought. */}
                <div
                  className="mt-3 pt-3 sm:mt-6 sm:pt-5 text-xs sm:text-sm lg:text-xl uppercase font-bold tabular-nums"
                  style={{
                    letterSpacing: "0.28em",
                    color: "var(--v4-accent)",
                    borderTop: "1px solid var(--v4-rule)",
                  }}
                >
                  {isViewingToday ? (
                    heroChip ? (
                      <>
                        <span style={{ color: "var(--v4-fg)" }}>In</span>
                        {` ${heroChip}`}
                      </>
                    ) : (
                      <span style={{ color: "var(--v4-fg)" }}>In</span>
                    )
                  ) : (
                    "Schedule"
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ===== SCHEDULE COLUMN =====
              Layout: scrollable area for prayer list + Jumu'ah +
              special bands (flex-1 min-h-0 so it shrinks correctly),
              then a reserved footer slot. The picker lives in the
              header (in col 2 of the header's grid, aligned with the
              start of THIS column) so the date label has the full
              left side of the header to itself. */}
          <div className="relative flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 md:px-3 lg:px-4 pt-3 pb-3 sm:pt-6 sm:pb-4">
              {/* Prayer list — column headers ("Prayer / Athan / Iqamah")
                  serve as the section heading; the explicit "Today's
                  schedule" eyebrow was removed earlier and the
                  date+picker cluster that briefly lived here at md+ has
                  been moved to the top bar.

                  Layout per breakpoint:
                  - Mobile + sm portrait: 1-column subgrid, full-width
                    rows (dot, name, athan, iqamah on one line).
                  - md (landscape phone, tablet): 2-column grid where
                    each prayer is a self-contained card with its own
                    [16px_1fr_auto_auto] internal grid. Header row is
                    hidden so each card stands alone.
                  - lg+ (desktop): back to the V4 1-column subgrid with
                    the visible header row. */}
              {/* Each prayer renders as a self-contained "cell" with the
                  prayer name on the left and a stacked time block on
                  the right (athan time as the primary big number, with
                  an "Iqama [time]" secondary line directly underneath).

                  Parent grid: 1 column on mobile portrait + sm-only
                  (each cell full width), 2 columns at md+ (landscape
                  phones, tablets, desktops) so cells pair up. The
                  shared "PRAYER ATHAN IQAMAH" column-header row was
                  removed because the inline "Iqama" label inside each
                  cell self-labels the secondary time. */}
              <div
                className="grid grid-cols-1 md:grid-cols-2
                           gap-x-3 sm:gap-x-6 md:gap-x-3 lg:gap-x-3
                           gap-y-0
                           mb-3 sm:mb-5"
              >
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
                  const highlight = isActive || isNext;
                  const isInformational = key === "sunrise";
                  return (
                    <div
                      key={key}
                      data-prayer={key}
                      data-is-next={isNext ? "true" : undefined}
                      data-is-active={isActive ? "true" : undefined}
                      data-is-passed={isPassed ? "true" : undefined}
                      className={cn(
                        "grid grid-cols-[1fr_auto] items-baseline gap-x-2 sm:gap-x-4 md:gap-x-2 lg:gap-x-3",
                        // Internal padding mirrors Jumu'ah at each
                        // breakpoint so the highlighted-row tile and
                        // the Jumu'ah bordered tile have the same
                        // breathing room. md (landscape phone) and lg
                        // (desktop 2-col grid) both keep tight padding
                        // so each card still fits with name + time
                        // stack inside the narrow column.
                        "px-4 py-3 sm:px-5 sm:py-4 md:px-3 md:py-2.5 lg:px-3 lg:py-3",
                        "transition-colors",
                        isPassed && "opacity-40",
                        isActive && "prayer-widget-row-active",
                        isInformational && !highlight && "opacity-60",
                      )}
                      style={{
                        background: isNext ? "var(--v4-tile)" : undefined,
                        borderBottom: "1px solid var(--v4-rule)",
                      }}
                    >
                      {/* Left: prayer name (with star ornament prefix
                          when active or next) */}
                      <span className="flex items-baseline gap-2 min-w-0">
                        {(isActive || isNext) && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "inline-flex flex-shrink-0",
                              isActive && "prayer-widget-row-dot",
                            )}
                          >
                            <V4Ornament size={14} color="var(--v4-accent)" />
                          </span>
                        )}
                        <span
                          className="text-base sm:text-lg md:text-sm lg:text-base"
                          style={{
                            fontFamily: "var(--v4-serif)",
                            fontWeight: highlight ? 600 : 500,
                            color: isActive ? "var(--v4-accent)" : "var(--v4-fg)",
                          }}
                        >
                          {displayName}
                        </span>
                      </span>

                      {/* Right: athan time (large, primary) above
                          "Iqama [time]" (smaller, secondary). */}
                      <div className="flex flex-col items-end">
                        <time
                          className="block text-lg sm:text-xl md:text-base lg:text-base tabular-nums whitespace-nowrap"
                          style={{
                            fontFamily: "var(--v4-sans)",
                            fontWeight: 600,
                            color: isActive ? "var(--v4-accent)" : "var(--v4-fg)",
                          }}
                          dateTime={toISO24Hour(row.adhan)}
                        >
                          {row.adhan}
                        </time>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span
                            className="text-[9px] sm:text-[10px] md:text-[9px] lg:text-xs uppercase font-bold"
                            style={{
                              letterSpacing: "0.14em",
                              color: "var(--v4-mute)",
                            }}
                          >
                            Iqama
                          </span>
                          <time
                            className="block text-xs sm:text-sm md:text-[10px] lg:text-xs tabular-nums whitespace-nowrap"
                            style={{
                              fontFamily: "var(--v4-sans)",
                              fontWeight: isActive ? 600 : 500,
                              opacity: isActive ? 1 : 0.75,
                              color: "var(--v4-mute-strong)",
                            }}
                            dateTime={toISO24Hour(row.iqamah)}
                          >
                            {row.iqamah}
                          </time>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Jumu'ah — V4 bordered tile.
                  Sits directly under the regular prayer list with a top
                  border that visually divides it from the Isha row above.

                  Uses <dl>/<dt>/<dd> so the <dt>Jumu'ah</dt> and <dd>
                  stay direct siblings (the existing Jumu'ah test walks
                  via nextElementSibling).

                  Always renders inline on a single row at every breakpoint.
                  Mobile uses smaller text so the row fits comfortably
                  down to ~320px viewports — the trailing "PM" used to
                  clip on narrow phones. */}
              {(jumuahArabic || jumuahEnglish) && (
                <dl
                  className="relative overflow-hidden grid items-center
                             grid-cols-[auto_1fr_auto]
                             gap-x-2 sm:gap-x-3
                             px-4 py-3 sm:px-5 sm:py-4 md:px-3 md:py-2.5 lg:px-3 lg:py-3 m-0
                             mt-3 sm:mt-4"
                  style={{
                    background: "var(--v4-surface)",
                    border: "1px solid rgba(127, 181, 57, 0.2)",
                  }}
                >
                  <V4StarPattern opacity={0.04} size={40} color="var(--v4-accent)" />
                  <V4Ornament size={18} color="var(--v4-accent)" />
                  <dt
                    className="relative text-sm sm:text-base lg:text-lg uppercase m-0 whitespace-nowrap"
                    style={{
                      fontFamily: "var(--v4-serif)",
                      fontWeight: 500,
                      color: "var(--v4-accent)",
                    }}
                  >
                    Jumu&apos;ah
                  </dt>
                  {/* Times on a single row at every breakpoint. The
                      compact AR/EN visible labels are used at every
                      breakpoint so the row never overflows the dl's
                      right padding on lg+ — the previous "full
                      Arabic/English on desktop" was making the trailing
                      "PM" clip against the border. An sr-only span
                      preserves the full "Arabic"/"English" word for
                      screen readers and the existing Jumu'ah tests. */}
                  <dd className="relative flex items-baseline gap-1.5 sm:gap-2 lg:gap-2.5 m-0 justify-self-end whitespace-nowrap">
                    {jumuahArabic && (
                      <span className="flex items-baseline gap-1 sm:gap-1.5">
                        <span
                          aria-hidden="true"
                          className="text-[9px] sm:text-[10px] uppercase font-bold"
                          style={{ letterSpacing: "0.16em", color: "var(--v4-mute)" }}
                        >
                          AR
                        </span>
                        <span className="sr-only">Arabic</span>
                        <span
                          className="text-sm sm:text-base lg:text-base font-semibold tabular-nums"
                          style={{ fontFamily: "var(--v4-sans)", color: "var(--v4-fg)" }}
                        >
                          {jumuahArabic}
                        </span>
                      </span>
                    )}
                    {jumuahArabic && jumuahEnglish && (
                      <span
                        aria-hidden="true"
                        className="self-center"
                        style={{ width: 1, height: 14, background: "var(--v4-rule)" }}
                      />
                    )}
                    {jumuahEnglish && (
                      <span className="flex items-baseline gap-1 sm:gap-1.5">
                        <span
                          aria-hidden="true"
                          className="text-[9px] sm:text-[10px] uppercase font-bold"
                          style={{ letterSpacing: "0.16em", color: "var(--v4-mute)" }}
                        >
                          EN
                        </span>
                        <span className="sr-only">English</span>
                        <span
                          className="text-sm sm:text-base lg:text-base font-semibold tabular-nums"
                          style={{ fontFamily: "var(--v4-sans)", color: "var(--v4-fg)" }}
                        >
                          {jumuahEnglish}
                        </span>
                      </span>
                    )}
                  </dd>
                </dl>
              )}

              {/* Special prayer bands — Taraweeh / Eid al-Fitr / Eid al-Adha */}
              {hasSpecials && (
                <div className="mt-4 flex flex-col gap-3">
                  {taraweehEnabled && taraweehTime && (
                    <SpecialBand
                      label="Taraweeh"
                      tagline="Nightly prayer during Ramadan"
                      time={taraweehTime}
                    />
                  )}
                  {eidFitrActive && eidFitrTime && (
                    <SpecialBand
                      label="Eid al-Fitr"
                      tagline="Celebration of breaking the fast"
                      time={eidFitrTime}
                    />
                  )}
                  {eidAdhaActive && eidAdhaTime && (
                    <SpecialBand
                      label="Eid al-Adha"
                      tagline="Festival of the sacrifice"
                      time={eidAdhaTime}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer strip — reserved slot for future action buttons
                (e.g. Monthly Timetable, Notify me, Get directions). Kept
                visually intact (border + min-height) on sm+ so the desktop
                layout doesn't jump when buttons are added later. Mobile
                collapses the slot to zero so the schedule column can use
                the recovered ~64px to fit Maghrib, Isha, and Jumu'ah on
                screen without scrolling. */}
            <div
              className="hidden sm:flex px-5 sm:px-8 lg:px-10 py-4 justify-between items-center flex-shrink-0 min-h-[64px]"
              style={{ borderTop: "1px solid var(--v4-rule)" }}
            >
              {/* Buttons go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecialBand({
  label,
  tagline,
  time,
}: {
  label: string;
  tagline: string;
  time: string;
}) {
  return (
    <div
      className="relative overflow-hidden px-4 py-4 sm:px-5"
      style={{
        background: "rgba(127, 181, 57, 0.12)",
        border: "1px solid rgba(127, 181, 57, 0.4)",
      }}
    >
      <V4StarPattern opacity={0.06} size={44} color="var(--v4-accent)" />
      <div className="relative flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <V4Ornament size={18} color="var(--v4-accent)" />
          <div>
            <div
              className="text-[10px] uppercase font-bold"
              style={{
                letterSpacing: "0.24em",
                color: "var(--v4-accent)",
              }}
            >
              {label}
            </div>
            <div
              className="text-[13px] mt-0.5"
              style={{
                fontFamily: "var(--v4-serif)",
                color: "var(--v4-fg)",
                fontWeight: 500,
              }}
            >
              {tagline}
            </div>
          </div>
        </div>
        <time
          className="text-lg font-semibold tabular-nums"
          style={{ fontFamily: "var(--v4-sans)", color: "var(--v4-fg)" }}
          dateTime={toISO24Hour(time)}
        >
          {time}
        </time>
      </div>
    </div>
  );
}
