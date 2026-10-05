/**
 * Request Metadata — the Security Record for Form Submissions
 *
 * Captures who sent a request, as far as the platform can tell, so every form
 * submission leaves a durable trail (stored record, log line, Sentry context,
 * and the details email IT can request from the staff notification). Built after a threatening contact-form message arrived and
 * the site had recorded nothing about its sender.
 *
 * Sources, per Vercel's request-header docs:
 * - IP: `x-real-ip`, `x-forwarded-for`, `x-vercel-forwarded-for`. Vercel
 *   overwrites `x-forwarded-for` and doesn't forward external IPs, so on Vercel
 *   all three hold the connecting client. The trusted IP comes from
 *   `getClientIp()`; the raw headers are kept verbatim as evidence.
 * - Location: `x-vercel-ip-*`, derived by Vercel from the IP. The city is
 *   URL-encoded (RFC 3986) and decoded here.
 * - Vercel: `x-vercel-id` (request ID, matches Vercel's logs), the deployment,
 *   and the JA4/JA3 TLS fingerprints. A fingerprint identifies a client's TLS
 *   setup, not a person — it links submissions sent with the same tool.
 * - Client: user agent, language, referer, origin and client hints. The
 *   browser sends these, so they can be faked; they're recorded as sent.
 *
 * Cloudflare is DNS-only for this site and never proxies traffic, so `cf-*`
 * headers can only come from the client. They are never read.
 *
 * Never send any of this back to the submitter (API responses, confirmation
 * emails), and keep it out of routine staff emails: it is for IT and
 * authorities only.
 *
 * @module lib/request-meta
 * @see https://vercel.com/docs/headers/request-headers
 * @see https://vercel.com/docs/vercel-firewall/firewall-concepts#request-headers
 */
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/client-ip";

/** Header values are client-controlled; longer values are cut to this length. */
export const MAX_HEADER_LENGTH = 512;

/** Everything recorded about the request behind a form submission. */
export interface RequestMeta {
  /** When the request arrived, as a UTC ISO 8601 string. */
  receivedAt: string;
  /** Trusted client IP (`x-real-ip`, else the right-most `x-forwarded-for` hop), or `"unknown"`. */
  ip: string;
  /** The IP headers exactly as received. */
  ipHeaders: {
    xForwardedFor: string | null;
    xRealIp: string | null;
    xVercelForwardedFor: string | null;
  };
  /** Vercel's IP geolocation. Approximate: it locates the network, not the person. */
  location: {
    city: string | null;
    countryRegion: string | null;
    country: string | null;
    postalCode: string | null;
    continent: string | null;
    latitude: string | null;
    longitude: string | null;
    timezone: string | null;
  };
  vercel: {
    /** `x-vercel-id`: the request ID shown in Vercel's logs. */
    requestId: string | null;
    deploymentUrl: string | null;
    ja4Digest: string | null;
    ja3Digest: string | null;
  };
  /** Browser-supplied details, recorded as sent. */
  client: {
    userAgent: string | null;
    language: string | null;
    referer: string | null;
    origin: string | null;
    secChUa: string | null;
    secChUaMobile: string | null;
    secChUaPlatform: string | null;
  };
  host: string | null;
}

/** Reads one header: trimmed, capped, and `null` when missing or blank. */
function header(request: NextRequest, name: string): string | null {
  const value = request.headers.get(name)?.trim();
  return value ? value.slice(0, MAX_HEADER_LENGTH) : null;
}

/** Vercel URL-encodes the city; keep the raw value if it doesn't decode. */
function decodeCity(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Captures the security record for a request. Synchronous and side-effect
 * free: it only reads headers.
 *
 * @param now - When the request arrived. Defaults to the current time.
 */
export function captureRequestMeta(request: NextRequest, now: Date = new Date()): RequestMeta {
  return {
    receivedAt: now.toISOString(),
    ip: getClientIp(request),
    ipHeaders: {
      xForwardedFor: header(request, "x-forwarded-for"),
      xRealIp: header(request, "x-real-ip"),
      xVercelForwardedFor: header(request, "x-vercel-forwarded-for"),
    },
    location: {
      city: decodeCity(header(request, "x-vercel-ip-city")),
      countryRegion: header(request, "x-vercel-ip-country-region"),
      country: header(request, "x-vercel-ip-country"),
      postalCode: header(request, "x-vercel-ip-postal-code"),
      continent: header(request, "x-vercel-ip-continent"),
      latitude: header(request, "x-vercel-ip-latitude"),
      longitude: header(request, "x-vercel-ip-longitude"),
      timezone: header(request, "x-vercel-ip-timezone"),
    },
    vercel: {
      requestId: header(request, "x-vercel-id"),
      deploymentUrl: header(request, "x-vercel-deployment-url"),
      ja4Digest: header(request, "x-vercel-ja4-digest"),
      ja3Digest: header(request, "x-vercel-ja3-digest"),
    },
    client: {
      userAgent: header(request, "user-agent"),
      language: header(request, "accept-language"),
      referer: header(request, "referer"),
      origin: header(request, "origin"),
      secChUa: header(request, "sec-ch-ua"),
      secChUaMobile: header(request, "sec-ch-ua-mobile"),
      secChUaPlatform: header(request, "sec-ch-ua-platform"),
    },
    host: header(request, "host"),
  };
}
