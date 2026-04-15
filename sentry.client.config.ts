/**
 * Sentry Client-Side Configuration
 *
 * Initialises the Sentry browser SDK for error tracking and performance
 * monitoring. Runs in the user's browser.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production to avoid noise during development
  enabled: process.env.NODE_ENV === "production",

  // Sample 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Sample 10% of sessions for replay (on error, 100% are captured)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Filter out noisy browser extension errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome-extension:\/\//,
    // Network errors that aren't actionable
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // ResizeObserver noise
    "ResizeObserver loop",
  ],

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
