/**
 * Tests for getClientIp (trusted client IP resolution) — regression: issue #69
 */
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { getClientIp } from "./client-ip";

function req(headers: Record<string, string>): NextRequest {
  return new NextRequest("http://localhost:3000/api/x", { headers });
}

describe("getClientIp", () => {
  it("prefers the platform-set x-real-ip", () => {
    expect(
      getClientIp(req({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.2.3.4" }))
    ).toBe("9.9.9.9");
  });

  it("uses the right-most x-forwarded-for hop when x-real-ip is absent", () => {
    expect(getClientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe(
      "5.6.7.8"
    );
  });

  it("does not trust a spoofed left-most x-forwarded-for value", () => {
    // Attacker controls the left-most entry; the trusted proxy appends the real
    // connecting hop on the right. Rotating the spoofed value must not change
    // the bucket.
    expect(
      getClientIp(req({ "x-forwarded-for": "1.1.1.1, 203.0.113.9" }))
    ).toBe("203.0.113.9");
    expect(
      getClientIp(req({ "x-forwarded-for": "2.2.2.2, 203.0.113.9" }))
    ).toBe("203.0.113.9");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });
});
