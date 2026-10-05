/**
 * Tests for captureRequestMeta — the security record attached to every form submission.
 */
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { captureRequestMeta, MAX_HEADER_LENGTH } from "./request-meta";

function req(headers: Record<string, string>): NextRequest {
  return new NextRequest("https://australianislamiccentre.org/api/contact", {
    method: "POST",
    headers,
  });
}

/** Headers as Vercel sends them for a request from Newport, VIC. */
const vercelHeaders: Record<string, string> = {
  host: "australianislamiccentre.org",
  "x-real-ip": "203.0.113.7",
  "x-forwarded-for": "203.0.113.7",
  "x-vercel-forwarded-for": "203.0.113.7",
  "x-vercel-id": "syd1::iad1::abcde-1759622400000-0123456789ab",
  "x-vercel-deployment-url": "aic-website-abc123.vercel.app",
  "x-vercel-ip-country": "AU",
  "x-vercel-ip-country-region": "VIC",
  "x-vercel-ip-city": "Newport",
  "x-vercel-ip-postal-code": "3015",
  "x-vercel-ip-continent": "OC",
  "x-vercel-ip-latitude": "-37.8444",
  "x-vercel-ip-longitude": "144.8836",
  "x-vercel-ip-timezone": "Australia/Melbourne",
  "x-vercel-ja4-digest": "t13d1516h2_8daaf6152771_02713d6af862",
  "x-vercel-ja3-digest": "cd08e31494f9531f560d64c695473da9",
  "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
  "accept-language": "en-AU,en;q=0.9",
  referer: "https://australianislamiccentre.org/contact",
  origin: "https://australianislamiccentre.org",
  "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
};

const RECEIVED = new Date("2026-10-05T01:02:03.456Z");

describe("captureRequestMeta", () => {
  it("records every IP, location, Vercel and browser header Vercel provides", () => {
    expect(captureRequestMeta(req(vercelHeaders), RECEIVED)).toEqual({
      receivedAt: "2026-10-05T01:02:03.456Z",
      ip: "203.0.113.7",
      ipHeaders: {
        xForwardedFor: "203.0.113.7",
        xRealIp: "203.0.113.7",
        xVercelForwardedFor: "203.0.113.7",
      },
      location: {
        city: "Newport",
        countryRegion: "VIC",
        country: "AU",
        postalCode: "3015",
        continent: "OC",
        latitude: "-37.8444",
        longitude: "144.8836",
        timezone: "Australia/Melbourne",
      },
      vercel: {
        requestId: "syd1::iad1::abcde-1759622400000-0123456789ab",
        deploymentUrl: "aic-website-abc123.vercel.app",
        ja4Digest: "t13d1516h2_8daaf6152771_02713d6af862",
        ja3Digest: "cd08e31494f9531f560d64c695473da9",
      },
      client: {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
        language: "en-AU,en;q=0.9",
        referer: "https://australianislamiccentre.org/contact",
        origin: "https://australianislamiccentre.org",
        secChUa: '"Chromium";v="140", "Not=A?Brand";v="24"',
        secChUaMobile: "?1",
        secChUaPlatform: '"Android"',
      },
      host: "australianislamiccentre.org",
    });
  });

  it("records null for every header that isn't sent, as in local development", () => {
    const meta = captureRequestMeta(req({}), RECEIVED);

    expect(meta.ip).toBe("unknown");
    expect(meta.ipHeaders).toEqual({ xForwardedFor: null, xRealIp: null, xVercelForwardedFor: null });
    expect(Object.values(meta.location).every((v) => v === null)).toBe(true);
    expect(Object.values(meta.vercel).every((v) => v === null)).toBe(true);
    expect(Object.values(meta.client).every((v) => v === null)).toBe(true);
  });

  it("stamps the time it was given as a UTC ISO string", () => {
    expect(captureRequestMeta(req({}), RECEIVED).receivedAt).toBe("2026-10-05T01:02:03.456Z");
  });

  it("defaults the timestamp to now, in UTC", () => {
    const before = Date.now();
    const { receivedAt } = captureRequestMeta(req({}));

    expect(receivedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(Date.parse(receivedAt)).toBeGreaterThanOrEqual(before);
  });

  it("decodes the URL-encoded city name Vercel sends", () => {
    const meta = captureRequestMeta(req({ "x-vercel-ip-city": "S%C3%A3o%20Paulo" }), RECEIVED);
    expect(meta.location.city).toBe("São Paulo");
  });

  it("keeps a malformed city value as sent rather than throwing", () => {
    const meta = captureRequestMeta(req({ "x-vercel-ip-city": "Bad%E0%A4%A" }), RECEIVED);
    expect(meta.location.city).toBe("Bad%E0%A4%A");
  });

  it("keeps a spoofed x-forwarded-for verbatim while the IP comes from x-real-ip", () => {
    const meta = captureRequestMeta(
      req({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "1.1.1.1, 203.0.113.7" }),
      RECEIVED,
    );

    expect(meta.ip).toBe("203.0.113.7");
    expect(meta.ipHeaders.xForwardedFor).toBe("1.1.1.1, 203.0.113.7");
  });

  it("ignores Cloudflare cf-* headers, which are client-controlled here", () => {
    const meta = captureRequestMeta(
      req({
        "x-real-ip": "203.0.113.7",
        "cf-connecting-ip": "198.51.100.66",
        "cf-ipcountry": "XX",
        "cf-ray": "8c1a2b3c4d5e6f70-SYD",
      }),
      RECEIVED,
    );

    expect(meta.ip).toBe("203.0.113.7");
    const serialised = JSON.stringify(meta);
    expect(serialised).not.toContain("198.51.100.66");
    expect(serialised).not.toContain("8c1a2b3c4d5e6f70");
    expect(meta.location.country).toBeNull();
  });

  it("caps long header values so a sender can't bloat the record", () => {
    const meta = captureRequestMeta(req({ "user-agent": "A".repeat(5000) }), RECEIVED);
    expect(meta.client.userAgent).toHaveLength(MAX_HEADER_LENGTH);
  });

  it("treats a blank header as missing", () => {
    const meta = captureRequestMeta(req({ referer: "   " }), RECEIVED);
    expect(meta.client.referer).toBeNull();
  });
});
