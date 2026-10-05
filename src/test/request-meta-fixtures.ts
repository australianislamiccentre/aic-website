/**
 * Shared test data for form-submission security records.
 *
 * `VERCEL_REQUEST_HEADERS` mirrors what Vercel sends with a request from
 * Newport, VIC; `makeRequestMeta()` is the record captured from them.
 */
import type { RequestMeta } from "@/lib/request-meta";

export const VERCEL_REQUEST_HEADERS: Record<string, string> = {
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
};

/** A complete security record; pass overrides for the parts a test cares about. */
export function makeRequestMeta(overrides: Partial<RequestMeta> = {}): RequestMeta {
  return {
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
      secChUa: null,
      secChUaMobile: null,
      secChUaPlatform: null,
    },
    host: "australianislamiccentre.org",
    ...overrides,
  };
}

/** A record with no headers at all, as captured in local development. */
export function makeEmptyRequestMeta(): RequestMeta {
  const meta = makeRequestMeta();
  const nullAll = <T extends Record<string, string | null>>(group: T): T =>
    Object.fromEntries(Object.keys(group).map((key) => [key, null])) as T;

  return {
    receivedAt: meta.receivedAt,
    ip: "unknown",
    ipHeaders: nullAll(meta.ipHeaders),
    location: nullAll(meta.location),
    vercel: nullAll(meta.vercel),
    client: nullAll(meta.client),
    host: null,
  };
}
