/**
 * Google Analytics 4
 *
 * Renders the GA4 tracking script using `@next/third-parties` for optimised
 * script loading. Only renders on the production Vercel deployment — preview
 * deploys and local dev do not fire analytics to keep production data clean.
 *
 * Vercel automatically sets `NEXT_PUBLIC_VERCEL_ENV`:
 * - "production" → main branch deploys serving australianislamiccentre.org
 * - "preview"    → every other branch or PR deploy (including .vercel.app URLs)
 * - undefined    → local `npm run dev`
 *
 * @module components/GoogleAnalytics
 */
"use client";

import { GoogleAnalytics as GA4 } from "@next/third-parties/google";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

interface GoogleAnalyticsProps {
  /**
   * Per-request CSP nonce (from middleware via the root layout). GA4 applies
   * it to the scripts it injects so they run under the enforced `script-src`
   * policy, which no longer permits 'unsafe-inline'.
   */
  nonce?: string;
}

export function GoogleAnalytics({ nonce }: GoogleAnalyticsProps = {}) {
  if (!GA_MEASUREMENT_ID || !IS_PRODUCTION) return null;

  return <GA4 gaId={GA_MEASUREMENT_ID} nonce={nonce} />;
}
