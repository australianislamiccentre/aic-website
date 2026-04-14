/**
 * Next.js Instrumentation
 *
 * Registers Sentry for server-side and edge runtime error tracking.
 * Called once by Next.js at server startup.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
