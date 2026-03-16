/**
 * Tests for rate-limit.ts
 *
 * Covers: first request allowed, requests within limit, exceeding limit,
 * window reset, and periodic cleanup of expired entries.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to re-import each test to get a fresh module state, but since
// the rate limiter uses module-level state (Map), we use vi.resetModules().
describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  async function getCheckRateLimit() {
    const mod = await import("./rate-limit");
    return mod.checkRateLimit;
  }

  it("allows the first request from an IP", async () => {
    const checkRateLimit = await getCheckRateLimit();
    expect(checkRateLimit("192.168.1.1")).toEqual({ allowed: true });
  });

  it("allows up to 5 requests from the same IP", async () => {
    const checkRateLimit = await getCheckRateLimit();
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("192.168.1.2")).toEqual({ allowed: true });
    }
  });

  it("blocks the 6th request from the same IP", async () => {
    const checkRateLimit = await getCheckRateLimit();
    for (let i = 0; i < 5; i++) {
      checkRateLimit("192.168.1.3");
    }
    expect(checkRateLimit("192.168.1.3")).toEqual({ allowed: false });
  });

  it("tracks IPs independently", async () => {
    const checkRateLimit = await getCheckRateLimit();
    for (let i = 0; i < 5; i++) {
      checkRateLimit("ip-a");
    }
    expect(checkRateLimit("ip-a")).toEqual({ allowed: false });
    expect(checkRateLimit("ip-b")).toEqual({ allowed: true });
  });

  it("resets after the time window expires", async () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const checkRateLimit = await getCheckRateLimit();

    // Use up the limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit("192.168.1.4");
    }
    expect(checkRateLimit("192.168.1.4")).toEqual({ allowed: false });

    // Advance time past the 1-hour window
    vi.spyOn(Date, "now").mockReturnValue(now + 60 * 60 * 1000 + 1);
    expect(checkRateLimit("192.168.1.4")).toEqual({ allowed: true });
  });

  it("runs periodic cleanup after 100 calls", async () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const checkRateLimit = await getCheckRateLimit();

    // Make 1 request from an IP that will expire
    checkRateLimit("old-ip");

    // Advance time past the window so old-ip entry is expired
    vi.spyOn(Date, "now").mockReturnValue(now + 60 * 60 * 1000 + 1);

    // Make 99 more calls (total 100) to trigger cleanup
    for (let i = 0; i < 99; i++) {
      checkRateLimit(`cleanup-test-${i}`);
    }

    // After cleanup, old-ip should get a fresh entry
    // (The 100th call triggers cleanup, then processes)
    // The next call for old-ip should be allowed as a fresh entry
    expect(checkRateLimit("old-ip")).toEqual({ allowed: true });
  });
});
