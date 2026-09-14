/**
 * Browser-SDK noise filters for Sentry, used by `instrumentation-client.ts`.
 *
 * Every entry is here because it recurred in production and nothing in this
 * codebase can fix it. Keep them narrow: a filter that is too broad hides
 * real bugs.
 */
import type { ErrorEvent, EventHint } from "@sentry/nextjs";

export const IGNORED_ERRORS: Array<string | RegExp> = [
  // Browser extensions
  /extensions\//i,
  /^chrome-extension:\/\//,
  // An extension's messaging call failing after its tab closed (AIC-WEBSITE-4G)
  /runtime\.sendMessage\(\)/,
  // Network errors that aren't actionable
  "Network request failed",
  "Failed to fetch",
  "Load failed",
  // ResizeObserver noise
  "ResizeObserver loop",
];

/**
 * True when a promise rejected with the DOM `error` Event of a `<script>` that
 * failed to load.
 *
 * Content blockers and flaky mobile connections stop third-party scripts from
 * loading. Loaders that wrap script loading in a promise then reject with the
 * raw Event, which Sentry reports as the stack-less "Event `Event` (type=error)
 * captured as promise rejection" (AIC-WEBSITE-3: ~30 events a month, mostly
 * iOS Safari). A script the visitor's device blocked can't be fixed from here.
 */
export function isScriptLoadFailure(hint: EventHint): boolean {
  const reason = hint.originalException;
  return (
    typeof Event !== "undefined" &&
    reason instanceof Event &&
    reason.type === "error" &&
    typeof HTMLScriptElement !== "undefined" &&
    reason.target instanceof HTMLScriptElement
  );
}

/** `beforeSend` hook: drops script-load failures, passes everything else through. */
export function filterBrowserEvent(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
  return isScriptLoadFailure(hint) ? null : event;
}
