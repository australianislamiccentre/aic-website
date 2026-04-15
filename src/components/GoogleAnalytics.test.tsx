/**
 * Tests for GoogleAnalytics component
 *
 * Verifies GA4 renders when measurement ID is set and returns null when missing.
 */
import { render } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="ga4" data-ga-id={gaId} />
  ),
}));

describe("GoogleAnalytics", () => {
  const originalEnv = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    } else {
      process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = originalEnv;
    }
  });

  it("renders GA4 script when measurement ID is set", async () => {
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-TEST123";
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    const { getByTestId } = render(<GoogleAnalytics />);
    expect(getByTestId("ga4")).toHaveAttribute("data-ga-id", "G-TEST123");
  });

  it("returns null when measurement ID is missing", async () => {
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe("");
  });
});
