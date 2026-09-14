/**
 * Sentry Client-Side Instrumentation
 *
 * Initialises the Sentry browser SDK for error tracking and performance
 * monitoring. Runs in the user's browser.
 *
 * Must be named `instrumentation-client.ts` (not `sentry.client.config.ts`)
 * for Next.js 15+ with Turbopack builds — the webpack plugin auto-injection
 * pattern doesn't work with Turbopack.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from "@sentry/nextjs";
import { IGNORED_ERRORS, filterBrowserEvent } from "@/lib/sentry-filters";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production to avoid noise during development
  enabled: process.env.NODE_ENV === "production",

  // Sample 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Sample 10% of sessions for replay (on error, 100% are captured)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Drop recurring, non-actionable noise (extensions, blocked third-party
  // scripts, flaky networks). See src/lib/sentry-filters.ts for why each exists.
  ignoreErrors: IGNORED_ERRORS,
  beforeSend: filterBrowserEvent,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Required for Sentry to track App Router navigations in Next.js 15+
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
