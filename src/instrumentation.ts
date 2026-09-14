/**
 * Next.js Instrumentation
 *
 * Registers Sentry for server-side and edge runtime error tracking.
 * Called once by Next.js at server startup.
 *
 * This file must live in `src/`, next to `app/`. In a project with a `src/`
 * directory, Next's build only registers the hook from `src/instrumentation.ts`.
 * A root-level copy still compiles, but it is left out of
 * `.next/required-server-files.json`, so it never ships with the server
 * functions and the server SDK never starts. That is why Sentry recorded zero
 * server-side events for months — including every /donate 500.
 *
 * (`instrumentation-client.ts` is resolved from both `src/` and the project
 * root, so the browser SDK was unaffected and can stay where it is.)
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
