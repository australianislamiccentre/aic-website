/**
 * Tests for the Sentry browser noise filters.
 *
 * The filters must drop exactly the recurring, non-actionable shapes seen in
 * production and let every real error through.
 */
import { describe, it, expect } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import { IGNORED_ERRORS, filterBrowserEvent, isScriptLoadFailure } from "./sentry-filters";

/** Mirrors how Sentry applies `ignoreErrors`: substring for strings, test() for RegExps. */
function isIgnored(message: string): boolean {
  return IGNORED_ERRORS.some((pattern) =>
    typeof pattern === "string" ? message.includes(pattern) : pattern.test(message),
  );
}

/** Dispatches an `error` Event on an element so `event.target` is set like a real load failure. */
function loadErrorFrom(element: Element): Event {
  const event = new Event("error");
  element.dispatchEvent(event);
  return event;
}

const sentryEvent = { type: undefined, message: "test" } as ErrorEvent;

describe("isScriptLoadFailure", () => {
  it("matches a promise rejected with a <script> load error (AIC-WEBSITE-3)", () => {
    const reason = loadErrorFrom(document.createElement("script"));
    expect(isScriptLoadFailure({ originalException: reason })).toBe(true);
  });

  it("does not match an <img> load error", () => {
    const reason = loadErrorFrom(document.createElement("img"));
    expect(isScriptLoadFailure({ originalException: reason })).toBe(false);
  });

  it("does not match a non-error Event from a script", () => {
    const script = document.createElement("script");
    const reason = new Event("load");
    script.dispatchEvent(reason);
    expect(isScriptLoadFailure({ originalException: reason })).toBe(false);
  });

  it("does not match a real Error", () => {
    expect(isScriptLoadFailure({ originalException: new Error("boom") })).toBe(false);
  });

  it("does not match when there is no original exception", () => {
    expect(isScriptLoadFailure({})).toBe(false);
  });
});

describe("filterBrowserEvent", () => {
  it("drops script load failures", () => {
    const reason = loadErrorFrom(document.createElement("script"));
    expect(filterBrowserEvent(sentryEvent, { originalException: reason })).toBeNull();
  });

  it("passes real errors through untouched", () => {
    expect(filterBrowserEvent(sentryEvent, { originalException: new TypeError("x is undefined") })).toBe(
      sentryEvent,
    );
  });
});

describe("IGNORED_ERRORS", () => {
  it("ignores an extension's messaging failure (AIC-WEBSITE-4G)", () => {
    expect(isIgnored("Invalid call to runtime.sendMessage(). Tab not found.")).toBe(true);
  });

  it("ignores Safari's non-actionable fetch failure", () => {
    expect(isIgnored("TypeError: Load failed")).toBe(true);
  });

  it("does not ignore ordinary application errors", () => {
    expect(isIgnored("TypeError: Cannot read properties of undefined (reading 'map')")).toBe(false);
  });

  it("does not ignore hydration errors", () => {
    expect(isIgnored("Hydration failed because the server rendered HTML didn't match the client.")).toBe(
      false,
    );
  });
});
