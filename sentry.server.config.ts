/**
 * Sentry Server-Side Configuration
 *
 * Initialises the Sentry Node SDK for server-side error tracking.
 * Runs in Next.js server components and API routes.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Sample 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,
});
