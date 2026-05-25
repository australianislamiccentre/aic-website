/**
 * EidBanner
 *
 * Sitewide top banner announcing the upcoming Eid prayer. Driven by the
 * `prayerSettings` Sanity singleton (`eidFitrActive` / `eidAdhaActive`).
 * Shows the nearest active Eid whose date is today or in the future
 * (Melbourne calendar) and auto-hides the day after Eid passes — admin
 * doesn't have to remember to switch it off.
 *
 * Pure server component: no client state, no interactivity. Date math
 * is Melbourne-tz-correct via the helpers in `@/lib/time`.
 *
 * @module components/layout/EidBanner
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  MELBOURNE_TZ,
  formatMelbourneDate,
  getMelbourneDateString,
  melbourneInstant,
} from "@/lib/time";
import type { SanityPrayerSettings } from "@/types/sanity";

interface EidBannerProps {
  prayerSettings: SanityPrayerSettings | null;
}

interface ResolvedEid {
  name: "Eid al-Fitr" | "Eid al-Adha";
  date: string;
  time: string;
  title: string;
  /** Long-form subtitle for desktop (e.g. "Wednesday 27 May · 8:30 AM"). */
  subtitleLong: string;
  /**
   * Short-form subtitle for mobile (e.g. "Wed 27 May · 8:30 AM"). Equal to
   * `subtitleLong` when the admin supplied a custom override — overrides
   * are passed through unchanged for both breakpoints.
   */
  subtitleShort: string;
  /**
   * `false` when the subtitle was auto-generated from the date and time —
   * we know it's short enough to render with `whitespace-nowrap` on one line.
   * `true` when the admin supplied a custom override, which may be long;
   * the render path allows wrapping so it never clips out of the banner.
   */
  subtitleIsOverride: boolean;
  href: string | null;
  linkLabel: string;
}

/**
 * Parse a "YYYY-MM-DD" Sanity date string into a Date anchored at noon
 * Melbourne. Noon-anchoring avoids the off-by-one-day trap when the UTC
 * instant lands on the previous day for Melbourne (and vice versa).
 */
function parseSanityDateToMelbourneNoon(dateString: string): Date | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return melbourneInstant(year, month, day, 12, 0);
}

/**
 * Format an Eid date for the banner subtitle. Includes year only if Eid
 * doesn't fall in the current Melbourne calendar year.
 *
 * `style: "long"` → "Wednesday 27 May" (full weekday/month, en-AU locale).
 * `style: "short"` → "Wed 27 May" (abbreviated — fits on a phone row).
 *   Uses `en-GB` because `en-AU` keeps the full month name even when
 *   `month: "short"` is requested ("June" instead of "Jun"), which defeats
 *   the purpose of asking for the short form.
 */
function formatEidDate(
  date: Date,
  todayString: string,
  style: "long" | "short"
): string {
  const todayYear = Number(todayString.slice(0, 4));
  const dateYear = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: MELBOURNE_TZ,
      year: "numeric",
    }).format(date)
  );
  const includeYear = dateYear !== todayYear;
  if (style === "long") {
    return formatMelbourneDate(date, {
      weekday: "long",
      day: "numeric",
      month: "long",
      ...(includeYear ? { year: "numeric" } : {}),
    });
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MELBOURNE_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

function resolveBanner(
  prayerSettings: SanityPrayerSettings | null,
  todayString: string
): ResolvedEid | null {
  if (!prayerSettings) return null;

  const candidates: ResolvedEid[] = [];

  function tryAdd(
    name: "Eid al-Fitr" | "Eid al-Adha",
    active: boolean | undefined,
    dateString: string | undefined,
    time: string | undefined,
    titleOverride: string | undefined,
    subtitleOverride: string | undefined,
    linkType: "none" | "page" | "custom" | undefined,
    internalPage: string | undefined,
    customUrl: string | undefined,
    linkLabelOverride: string | undefined
  ) {
    if (!active || !dateString || !time) return;
    if (dateString < todayString) return;
    const date = parseSanityDateToMelbourneNoon(dateString);
    if (!date) return;
    const subtitleDateLong = formatEidDate(date, todayString, "long");
    const subtitleDateShort = formatEidDate(date, todayString, "short");
    const trimmedOverride = subtitleOverride?.trim();
    const subtitleIsOverride = Boolean(trimmedOverride);
    const subtitleLong = trimmedOverride || `${subtitleDateLong} · ${time}`;
    const subtitleShort = trimmedOverride || `${subtitleDateShort} · ${time}`;
    const title = titleOverride?.trim() || `${name} Prayer`;
    let href: string | null = null;
    if (linkType === "page" && internalPage) href = internalPage;
    else if (linkType === "custom" && customUrl) href = customUrl;
    candidates.push({
      name,
      date: dateString,
      time,
      title,
      subtitleLong,
      subtitleShort,
      subtitleIsOverride,
      href,
      linkLabel: linkLabelOverride?.trim() || "View details",
    });
  }

  tryAdd(
    "Eid al-Fitr",
    prayerSettings.eidFitrActive,
    prayerSettings.eidFitrDate,
    prayerSettings.eidFitrTime,
    prayerSettings.eidFitrBannerTitle,
    prayerSettings.eidFitrBannerSubtitle,
    prayerSettings.eidFitrBannerLinkType,
    prayerSettings.eidFitrBannerInternalPage,
    prayerSettings.eidFitrBannerCustomUrl,
    prayerSettings.eidFitrBannerLinkLabel
  );
  tryAdd(
    "Eid al-Adha",
    prayerSettings.eidAdhaActive,
    prayerSettings.eidAdhaDate,
    prayerSettings.eidAdhaTime,
    prayerSettings.eidAdhaBannerTitle,
    prayerSettings.eidAdhaBannerSubtitle,
    prayerSettings.eidAdhaBannerLinkType,
    prayerSettings.eidAdhaBannerInternalPage,
    prayerSettings.eidAdhaBannerCustomUrl,
    prayerSettings.eidAdhaBannerLinkLabel
  );

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (a.date < b.date ? -1 : 1));
  return candidates[0];
}

export function EidBanner({ prayerSettings }: EidBannerProps) {
  const today = getMelbourneDateString();
  const resolved = resolveBanner(prayerSettings, today);
  if (!resolved) return null;

  // CTA: full gold pill (label + arrow) at sm+, bare gold arrow icon on
  // mobile (no background — keeps the banner feeling like a single tap
  // target rather than two competing elements). `aria-label` carries the
  // label text when the visible label is hidden so screen readers still
  // announce it.
  const cta = resolved.href ? (
    <Link
      href={resolved.href}
      data-testid="eid-banner-cta"
      aria-label={resolved.linkLabel}
      className="inline-flex items-center justify-center flex-shrink-0 transition-colors
                 text-gold-300 hover:text-gold-200
                 sm:text-neutral-900 sm:bg-gold-400 sm:hover:bg-gold-300
                 sm:px-3 sm:py-1 sm:gap-1.5 sm:rounded-full sm:text-xs sm:font-semibold sm:whitespace-nowrap"
    >
      <span className="hidden sm:inline">{resolved.linkLabel}</span>
      <ArrowRight className="w-5 h-5 sm:w-3 sm:h-3" aria-hidden="true" />
    </Link>
  ) : null;

  return (
    <div
      data-testid="eid-banner"
      data-eid-name={resolved.name}
      className="relative bg-teal-600 text-white"
      role="region"
      aria-label={`${resolved.name} announcement`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(252, 211, 77, 0.12), transparent 70%)",
        }}
      />
      {/* Single horizontal row at every breakpoint. On mobile the message
          and the bare arrow icon are pushed to opposite edges with
          `justify-between` — the banner spans the full viewport width
          edge-to-edge. On sm+ we return to a centered layout with the
          full gold CTA pill. Items can still wrap on very narrow
          viewports (~320px) so nothing ever clips out the sides. */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between sm:justify-center gap-2 sm:gap-4">
        <span className="flex items-center justify-start sm:justify-center gap-x-1.5 sm:gap-x-2 min-w-0 flex-wrap sm:flex-nowrap">
          <svg
            className="w-4 h-4 flex-shrink-0 text-gold-300"
            viewBox="-12 -12 24 24"
            aria-hidden="true"
          >
            <polygon
              points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle r="1.8" fill="currentColor" />
          </svg>
          <span className="text-sm font-bold text-gold-300 whitespace-nowrap">
            {resolved.title}
          </span>
          <span aria-hidden="true" className="text-gold-300/50">
            ·
          </span>
          {/* Two subtitle spans — exactly one is visible per breakpoint.
              Mobile shows the abbreviated form ("Wed 27 May · 8:30 AM");
              sm+ swaps in the long form ("Wednesday 27 May · 8:30 AM").
              When the admin sets a custom subtitle override both spans
              receive the same string, so the swap is a no-op.
              Auto-generated subtitles get `whitespace-nowrap` (they're
              short enough to always fit on a single line). Custom
              overrides drop `nowrap` so a long admin string wraps inside
              the banner instead of clipping out the sides. */}
          <span
            className={
              resolved.subtitleIsOverride
                ? "text-sm font-medium text-white/90 break-words sm:hidden"
                : "text-sm font-medium text-white/90 whitespace-nowrap sm:hidden"
            }
          >
            {resolved.subtitleShort}
          </span>
          <span
            className={
              resolved.subtitleIsOverride
                ? "hidden sm:inline text-sm font-medium text-white/90 break-words"
                : "hidden sm:inline text-sm font-medium text-white/90 whitespace-nowrap"
            }
          >
            {resolved.subtitleLong}
          </span>
        </span>
        {cta}
      </div>
    </div>
  );
}
