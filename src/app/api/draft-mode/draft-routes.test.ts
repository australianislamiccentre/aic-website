/**
 * Guards the draft-mode surface area.
 *
 * Draft mode renders unpublished Sanity content through the token-backed
 * preview client, so it must only be enabled by next-sanity's
 * `defineEnableDraftMode` route (which validates Sanity's own preview secret).
 * Two legacy routes used to bypass that: `POST /api/draft` trusted a
 * forgeable Origin header, and `POST /api/preview-url` returned the preview
 * secret to any caller.
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

const apiDir = path.resolve(__dirname, "..");

describe("draft mode routes", () => {
  it("enables draft mode only through the next-sanity route", () => {
    expect(existsSync(path.join(apiDir, "draft-mode/enable/route.ts"))).toBe(true);
  });

  it.each(["draft/route.ts", "preview-url/route.ts"])(
    "does not ship the legacy %s endpoint",
    (legacyRoute) => {
      expect(existsSync(path.join(apiDir, legacyRoute))).toBe(false);
    },
  );
});
