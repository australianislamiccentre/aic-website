/**
 * Vercel Web Analytics + Speed Insights
 *
 * Renders Vercel's first-party tracking beacons. Both are cookieless and
 * collect no personal data, so they need no consent banner and complement GA4
 * rather than replace it:
 *
 * - Web Analytics: page views, referrers, countries, devices
 * - Speed Insights: real-user Core Web Vitals (LCP / CLS / INP) per route — the
 *   only way to measure the targets in CLAUDE.md against real traffic
 *
 * Only renders on the production Vercel deployment, mirroring `GoogleAnalytics`:
 * preview deploys and local dev stay out of the data. (Vercel sets
 * `NEXT_PUBLIC_VERCEL_ENV` to "production" on main-branch deploys only.)
 *
 * CSP: both scripts load from the site's own origin (`/_vercel/insights/…`,
 * `/_vercel/speed-insights/…`) and beacon back to it, so `'self'` in
 * `script-src` / `connect-src` already covers them — no middleware change and
 * no nonce needed.
 *
 * Sanity Studio (`/studio`) is dropped from both beacons: admin sessions would
 * inflate page views and drag down the Core Web Vitals scores with a heavy SPA
 * the public never sees.
 *
 * @module components/VercelAnalytics
 */
"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

/** Path prefixes that must never reach Vercel's dashboards. */
const EXCLUDED_PATH_PREFIXES = ["/studio"];

function isExcluded(url: string): boolean {
  try {
    // The base only matters if a beacon ever hands us a bare path.
    const { pathname } = new URL(url, "https://australianislamiccentre.org");
    return EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  } catch {
    return false;
  }
}

export function VercelAnalytics() {
  if (!IS_PRODUCTION) return null;

  return (
    <>
      <Analytics beforeSend={(event) => (isExcluded(event.url) ? null : event)} />
      <SpeedInsights beforeSend={(data) => (isExcluded(data.url) ? null : data)} />
    </>
  );
}
