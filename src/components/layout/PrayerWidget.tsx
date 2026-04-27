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
 * (#7FB539), Spectral serif + Figtree sans typography, star-pattern ornament
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
import { CalendarDays, ChevronUp } from "lucide-react";
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
          "--v4-serif": 'var(--font-spectral), "Playfair Display", Georgia, serif',
          "--v4-sans": 'var(--font-figtree), "Inter", system-ui, sans-serif',
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
        className="fixed inset-0 z-[950] flex flex-col"
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
            Top bar — uses the SAME 1.1fr/1fr grid as the body so the
            divider between cells lines up exactly with the divider between
            the hero column and the schedule column underneath. The close
            button is positioned absolutely at the top-right of the modal
            on every breakpoint, sitting on top of whichever cell happens
            to be at the right edge. Each cell reserves right-padding to
            keep its content clear of the close button. */}
        <div
          className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] flex-shrink-0"
          style={{ borderBottom: "1px solid var(--v4-rule)" }}
        >
          {/* Close button — absolute top-right, single instance for all breakpoints */}
          <button
            type="button"
            aria-label="Close prayer times"
            onClick={closeWidget}
            className="absolute top-3 right-4 lg:top-4 lg:right-6 h-9 w-9 lg:h-10 lg:w-10 flex items-center justify-center flex-shrink-0 transition-colors z-10"
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

          {/* Brand cell (col 1) — aligns with hero column underneath */}
          <div className="flex items-center gap-3 min-w-0 px-5 sm:px-8 lg:px-10 py-3 lg:py-4 pr-14 lg:pr-10">
            <V4Ornament size={18} color="var(--v4-accent)" />
            <span
              className="text-[11px] uppercase font-bold whitespace-nowrap"
              style={{
                letterSpacing: "0.24em",
                color: "var(--v4-fg)",
              }}
            >
              <span className="hidden sm:inline">Australian Islamic Centre</span>
              <span className="sm:hidden">AIC</span>
              <span
                className="mx-2.5"
                aria-hidden="true"
                style={{ color: "var(--v4-mute)", opacity: 0.6 }}
              >
                ·
              </span>
              <span style={{ color: "var(--v4-mute)" }}>Prayer Times</span>
            </span>
          </div>

          {/* Date + picker cell (col 2) — aligns with schedule column.
              On mobile: stacked + centered (date label, hijri, picker buttons).
              On desktop: inline row with date label on left and picker
              sitting right next to it (no flex-1 between them). */}
          <div
            className="px-5 sm:px-8 lg:px-10 py-3 lg:py-4 lg:pr-20
                       flex flex-col items-center gap-y-2
                       lg:flex-row lg:items-center lg:gap-x-5
                       min-w-0"
          >
            {/* Date stack: Gregorian on top, Hijri muted below */}
            <div className="flex flex-col items-center lg:items-start min-w-0">
              <div
                className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                data-testid="widget-date-label"
                style={{ color: "var(--v4-fg)" }}
              >
                Melbourne · {formatMelbourneDate(selectedDate)}
              </div>
              {hijriLabel && (
                <div
                  className="text-[10px] uppercase font-bold whitespace-nowrap mt-0.5"
                  style={{
                    letterSpacing: "0.18em",
                    color: "var(--v4-mute)",
                  }}
                >
                  {hijriLabel}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end">
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
              <div className="relative">
                <button
                  type="button"
                  aria-label={
                    isViewingToday
                      ? "Open date picker"
                      : `Selected date ${formatMelbourneDate(selectedDate)}, open date picker`
                  }
                  onClick={openNativeDatePicker}
                  className="h-9 px-3 text-[11px] uppercase font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
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
                  className="sr-only"
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
              {!isViewingToday && (
                <button
                  type="button"
                  aria-label="Back to today"
                  onClick={goToToday}
                  className="h-9 px-2.5 text-[11px] uppercase font-semibold transition-colors"
                  style={{
                    letterSpacing: "0.14em",
                    color: "var(--v4-accent)",
                    background: "transparent",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =============================================================
            Body — split on lg, stacked below.
            Left column: hero (big Next or Iqamah countdown).
            Right column: schedule + Jumu'ah + specials + footer (scrollable). */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] overflow-hidden">
          {/* ===== HERO COLUMN ===== */}
          <div
            className="relative flex flex-col justify-center items-stretch overflow-hidden"
            style={{
              background: "var(--v4-surface)",
              borderBottom: "1px solid var(--v4-rule)",
              borderRight: "1px solid var(--v4-rule)",
              padding: "min(6vh, 56px) clamp(20px, 5vw, 56px)",
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
                <div
                  className="mt-3 text-[11px] lg:text-xs uppercase font-bold"
                  style={{
                    letterSpacing: "0.3em",
                    color: "var(--v4-accent)",
                  }}
                >
                  {heroPrayer!.displayName} · Iqamah in
                </div>
                <time
                  className="block mt-3 text-6xl sm:text-7xl lg:text-8xl font-light tabular-nums prayer-widget-iqamah-pulse"
                  style={{
                    fontFamily: "var(--v4-sans)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                  dateTime={toISO24Hour(heroPrayer!.iqamah)}
                >
                  {`Iqamah in ${countdown || "—"}`}
                </time>
                <div className="mt-4 text-xs sm:text-sm" style={{ color: "var(--v4-mute)" }}>
                  Athan{" "}
                  <span style={{ color: "var(--v4-fg)" }}>{heroPrayer!.adhan}</span>
                  <span className="mx-2.5" style={{ opacity: 0.4 }}>·</span>
                  Iqamah{" "}
                  <span style={{ color: "var(--v4-fg)" }}>{heroPrayer!.iqamah}</span>
                </div>
              </div>
            ) : (
              <div className="relative text-center">
                <V4Ornament size={36} color="var(--v4-accent)" />
                <div
                  className="mt-5 text-5xl sm:text-6xl lg:text-[88px]"
                  style={{
                    fontFamily: "var(--v4-serif)",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
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
                    className="block mt-4 text-4xl sm:text-5xl lg:text-7xl font-light tabular-nums"
                    style={{
                      fontFamily: "var(--v4-sans)",
                      letterSpacing: "-0.02em",
                      color: "var(--v4-accent)",
                      lineHeight: 1,
                    }}
                    dateTime={toISO24Hour(nextPrayer.adhan)}
                  >
                    {nextPrayer.adhan}
                  </time>
                )}
                {/* "Next · in 2h 57m 03s" eyebrow under the time, with a
                    live seconds ticker (component re-renders every second
                    via the existing countdown interval). The Gregorian +
                    Hijri date that used to live here has moved to the top
                    bar, beside the date picker. */}
                <div
                  className="mt-6 pt-5 text-[11px] uppercase font-bold tabular-nums"
                  style={{
                    letterSpacing: "0.3em",
                    color: "var(--v4-accent)",
                    borderTop: "1px solid var(--v4-rule)",
                  }}
                >
                  {isViewingToday
                    ? heroChip
                      ? `Next · in ${heroChip}`
                      : "Next"
                    : "Schedule"}
                </div>
              </div>
            )}
          </div>

          {/* ===== SCHEDULE COLUMN ===== */}
          <div className="relative flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 pt-6 pb-4">
              <div
                className="text-[11px] uppercase font-bold mb-4"
                style={{
                  letterSpacing: "0.24em",
                  color: "var(--v4-mute)",
                }}
              >
                Today&apos;s schedule
              </div>

              {/* Prayer list */}
              <div className="grid grid-cols-[24px_1fr_auto_auto] gap-x-4 sm:gap-x-6 mb-5">
                {/* Column headers */}
                <div
                  className="grid grid-cols-subgrid col-span-4 items-baseline px-1 pb-2 text-[10px] uppercase font-bold"
                  style={{
                    letterSpacing: "0.22em",
                    color: "var(--v4-mute)",
                    borderBottom: "1px solid var(--v4-rule)",
                  }}
                >
                  <span aria-hidden="true" />
                  <span>Prayer</span>
                  <span className="justify-self-end">Athan</span>
                  <span className="justify-self-end">Iqamah</span>
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
                        "grid grid-cols-subgrid col-span-4 items-baseline px-1 py-3 sm:py-3.5 transition-colors",
                        isPassed && "opacity-40",
                        isActive && "prayer-widget-row-active",
                        isInformational && !highlight && "opacity-60",
                      )}
                      style={{
                        background: isNext ? "var(--v4-tile)" : undefined,
                        borderBottom: "1px solid var(--v4-rule)",
                      }}
                    >
                      <span className="inline-flex justify-center items-center">
                        {isActive ? (
                          <span className="prayer-widget-row-dot inline-flex">
                            <V4Ornament size={14} color="var(--v4-accent)" />
                          </span>
                        ) : isNext ? (
                          <V4Ornament size={14} color="var(--v4-accent)" />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="inline-block w-1 h-1 rounded-full"
                            style={{ background: "var(--v4-mute)" }}
                          />
                        )}
                      </span>
                      <span
                        className="text-lg sm:text-[22px]"
                        style={{
                          fontFamily: "var(--v4-serif)",
                          fontWeight: highlight ? 600 : 500,
                          color: isActive ? "var(--v4-accent)" : "var(--v4-fg)",
                        }}
                      >
                        {displayName}
                      </span>
                      <time
                        className="block text-xl sm:text-[22px] tabular-nums whitespace-nowrap justify-self-end"
                        style={{
                          fontFamily: "var(--v4-sans)",
                          fontWeight: 500,
                          color: "var(--v4-fg)",
                        }}
                        dateTime={toISO24Hour(row.adhan)}
                      >
                        {row.adhan}
                      </time>
                      <time
                        className="block text-base sm:text-lg tabular-nums whitespace-nowrap justify-self-end"
                        style={{
                          fontFamily: "var(--v4-sans)",
                          fontWeight: isActive ? 700 : 400,
                          opacity: isActive ? 1 : 0.7,
                          color: isActive ? "var(--v4-accent)" : "var(--v4-fg)",
                        }}
                        dateTime={toISO24Hour(row.iqamah)}
                      >
                        {row.iqamah}
                      </time>
                    </div>
                  );
                })}
              </div>

              {/* Jumu'ah — V4 bordered tile.
                  Uses <dl>/<dt>/<dd> so the <dt>Jumu'ah</dt> and <dd> stay direct
                  siblings (the existing Jumu'ah test walks via nextElementSibling). */}
              {(jumuahArabic || jumuahEnglish) && (
                <dl
                  className="relative overflow-hidden grid items-center gap-x-3 gap-y-2 px-4 py-4 sm:px-5 sm:py-4 m-0"
                  style={{
                    background: "var(--v4-surface)",
                    border: "1px solid rgba(127, 181, 57, 0.2)",
                    gridTemplateColumns: "auto 1fr auto",
                  }}
                >
                  <V4StarPattern opacity={0.04} size={40} color="var(--v4-accent)" />
                  <V4Ornament size={18} color="var(--v4-accent)" />
                  <dt
                    className="relative text-[11px] uppercase font-bold m-0"
                    style={{
                      letterSpacing: "0.22em",
                      color: "var(--v4-accent)",
                    }}
                  >
                    Jumu&apos;ah
                  </dt>
                  {/* Times on a single line. AR/EN visible (compact),
                      full "Arabic"/"English" remain in the DOM for screen
                      readers and existing tests via sr-only spans. */}
                  <dd className="relative flex items-baseline gap-2 sm:gap-3 m-0 justify-self-end whitespace-nowrap">
                    {jumuahArabic && (
                      <span className="flex items-baseline gap-1.5">
                        <span
                          aria-hidden="true"
                          className="text-[9px] uppercase font-bold"
                          style={{ letterSpacing: "0.16em", color: "var(--v4-mute)" }}
                        >
                          AR
                        </span>
                        <span className="sr-only">Arabic</span>
                        <span
                          className="text-base font-semibold tabular-nums"
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
                      <span className="flex items-baseline gap-1.5">
                        <span
                          aria-hidden="true"
                          className="text-[9px] uppercase font-bold"
                          style={{ letterSpacing: "0.16em", color: "var(--v4-mute)" }}
                        >
                          EN
                        </span>
                        <span className="sr-only">English</span>
                        <span
                          className="text-base font-semibold tabular-nums"
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
                visually intact (border + min-height) so the layout doesn't
                jump when buttons are added later. */}
            <div
              className="px-5 sm:px-8 lg:px-10 py-4 flex justify-between items-center flex-shrink-0 min-h-[64px]"
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
