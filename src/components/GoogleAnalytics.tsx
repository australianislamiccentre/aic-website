/**
 * Google Analytics 4
 *
 * Renders the GA4 tracking script using `@next/third-parties` for optimised
 * script loading. Only renders when the measurement ID env var is set.
 *
 * @module components/GoogleAnalytics
 */
"use client";

import { GoogleAnalytics as GA4 } from "@next/third-parties/google";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return <GA4 gaId={GA_MEASUREMENT_ID} />;
}
