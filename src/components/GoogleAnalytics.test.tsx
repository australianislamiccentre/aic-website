/**
 * Tests for GoogleAnalytics component
 *
 * Verifies GA4 renders only when both the measurement ID is set AND the
 * deployment is production. Preview deploys and local dev should not fire.
 */
import { render } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="ga4" data-ga-id={gaId} />
  ),
}));

describe("GoogleAnalytics", () => {
  const originalId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const originalEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (originalId === undefined) {
      delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    } else {
      process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = originalId;
    }
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    } else {
      process.env.NEXT_PUBLIC_VERCEL_ENV = originalEnv;
    }
  });

  it("renders GA4 script on production deploy with measurement ID set", async () => {
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-TEST123";
    process.env.NEXT_PUBLIC_VERCEL_ENV = "production";
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    const { getByTestId } = render(<GoogleAnalytics />);
    expect(getByTestId("ga4")).toHaveAttribute("data-ga-id", "G-TEST123");
  });

  it("returns null when measurement ID is missing", async () => {
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    process.env.NEXT_PUBLIC_VERCEL_ENV = "production";
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null on preview deploys even when measurement ID is set", async () => {
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-TEST123";
    process.env.NEXT_PUBLIC_VERCEL_ENV = "preview";
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null in local dev (env var undefined) even when measurement ID is set", async () => {
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-TEST123";
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe("");
  });
});
