/**
 * Trusted client IP resolution for rate limiting.
 *
 * The previous approach read the LEFT-most value of `x-forwarded-for`, which is
 * fully client-controlled — an attacker could rotate it to get a fresh
 * rate-limit bucket on every request (issue #69). On Vercel the platform sets
 * `x-real-ip` to the actual connecting client and overwrites any client-supplied
 * value, so we trust that first. We only fall back to `x-forwarded-for`, and
 * then take the RIGHT-most hop (the one appended by the closest trusted proxy),
 * never the spoofable left-most entry.
 *
 * @module lib/client-ip
 */
import type { NextRequest } from "next/server";

/**
 * Returns the best-trusted client IP for rate limiting, or `"unknown"` if none
 * can be determined. Prefers the platform-set `x-real-ip`; otherwise uses the
 * right-most `x-forwarded-for` hop.
 */
export function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return "unknown";
}
