/**
 * Tests for the root layout metadata — regression: issue #75 (Sentry AIC-WEBSITE-1)
 *
 * The homepage threw hydration errors on iOS because WebKit's data detectors
 * auto-wrapped phone numbers / dates / times in <a> tags before React hydrated.
 * The fix is a `formatDetection` metadata block (renders
 * `<meta name="format-detection" content="telephone=no, date=no, ...">`).
 *
 * `layout.tsx` loads fonts and global CSS at module scope, so we stub those to
 * import the static `metadata` export in isolation.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
  Playfair_Display: () => ({ variable: "--font-playfair" }),
  Amiri: () => ({ variable: "--font-amiri" }),
}));
vi.mock("./globals.css", () => ({}));

import { metadata, dynamic } from "./layout";

describe("root layout metadata", () => {
  it("disables iOS format detection to prevent mobile hydration errors (#75)", () => {
    expect(metadata.formatDetection).toEqual({
      telephone: false,
      date: false,
      address: false,
      email: false,
    });
  });

  it("forces dynamic rendering so unknown routes return 404, not 500", () => {
    // The layout reads headers() for the CSP nonce; without force-dynamic, Next
    // tries to statically prerender the not-found route, headers() throws
    // DYNAMIC_SERVER_USAGE, and every unknown URL 500s in production.
    expect(dynamic).toBe("force-dynamic");
  });

  it("turns telephone auto-linking off specifically (the prayer-time/Eid-banner trigger)", () => {
    expect(metadata.formatDetection).toMatchObject({ telephone: false });
  });
});
