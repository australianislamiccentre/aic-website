/**
 * Tests for VercelAnalytics
 *
 * Verifies Vercel Web Analytics + Speed Insights render only on the production
 * deployment (mirroring GoogleAnalytics), and that Sanity Studio traffic is
 * filtered out of both beacons via `beforeSend`.
 */
import { render } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type PageviewEvent = { type: string; url: string };
type VitalEvent = { type: string; url: string };

// Captures the `beforeSend` callbacks the component hands to each SDK so the
// tests can drive them directly with representative events.
const captured = vi.hoisted(() => ({
  analytics: undefined as ((e: PageviewEvent) => PageviewEvent | null) | undefined,
  speed: undefined as ((e: VitalEvent) => VitalEvent | null) | undefined,
}));

vi.mock("@vercel/analytics/next", () => ({
  Analytics: ({ beforeSend }: { beforeSend?: (e: PageviewEvent) => PageviewEvent | null }) => {
    captured.analytics = beforeSend;
    return <div data-testid="vercel-analytics" />;
  },
}));

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: ({ beforeSend }: { beforeSend?: (e: VitalEvent) => VitalEvent | null }) => {
    captured.speed = beforeSend;
    return <div data-testid="vercel-speed-insights" />;
  },
}));

describe("VercelAnalytics", () => {
  const originalEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

  beforeEach(() => {
    vi.resetModules();
    captured.analytics = undefined;
    captured.speed = undefined;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    } else {
      process.env.NEXT_PUBLIC_VERCEL_ENV = originalEnv;
    }
  });

  it("renders Web Analytics and Speed Insights on the production deploy", async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = "production";
    const { VercelAnalytics } = await import("./VercelAnalytics");
    const { getByTestId } = render(<VercelAnalytics />);
    expect(getByTestId("vercel-analytics")).toBeInTheDocument();
    expect(getByTestId("vercel-speed-insights")).toBeInTheDocument();
  });

  it("returns null on preview deploys", async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = "preview";
    const { VercelAnalytics } = await import("./VercelAnalytics");
    const { container } = render(<VercelAnalytics />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null in local dev (env var undefined)", async () => {
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    const { VercelAnalytics } = await import("./VercelAnalytics");
    const { container } = render(<VercelAnalytics />);
    expect(container.innerHTML).toBe("");
  });

  describe("beforeSend filtering", () => {
    beforeEach(async () => {
      process.env.NEXT_PUBLIC_VERCEL_ENV = "production";
      const { VercelAnalytics } = await import("./VercelAnalytics");
      render(<VercelAnalytics />);
    });

    it("passes public page views through to Web Analytics untouched", () => {
      const event = { type: "pageview", url: "https://australianislamiccentre.org/donate" };
      expect(captured.analytics?.(event)).toEqual(event);
    });

    it("drops Sanity Studio page views from Web Analytics", () => {
      const event = {
        type: "pageview",
        url: "https://australianislamiccentre.org/studio/structure/siteSettings",
      };
      expect(captured.analytics?.(event)).toBeNull();
    });

    it("drops the bare /studio route too, not just nested Studio paths", () => {
      const event = { type: "pageview", url: "https://australianislamiccentre.org/studio" };
      expect(captured.analytics?.(event)).toBeNull();
    });

    it("passes public page vitals through to Speed Insights untouched", () => {
      const event = { type: "vital", url: "https://australianislamiccentre.org/events" };
      expect(captured.speed?.(event)).toEqual(event);
    });

    it("drops Sanity Studio vitals from Speed Insights", () => {
      const event = { type: "vital", url: "https://australianislamiccentre.org/studio/vision" };
      expect(captured.speed?.(event)).toBeNull();
    });

    it("does not treat a public page that merely mentions studio as excluded", () => {
      const event = { type: "pageview", url: "https://australianislamiccentre.org/events/studio-night" };
      expect(captured.analytics?.(event)).toEqual(event);
    });
  });
});
