import { NextRequest, NextResponse } from 'next/server';

// ── Cached embed domains for CSP header ──
// Fetched directly from Sanity CDN API (no client import needed for Edge runtime).
// The cache is refreshed in the background so the middleware stays synchronous —
// an async fetch on the hot path caused JSON-parse crashes in Next.js 16 Turbopack.
let cachedDomains: string[] | null = null;
let lastFetchTs = 0;
let fetchInFlight = false;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

/**
 * Fire-and-forget background refresh of the domain cache.
 * Never awaited on the request path — ensures zero latency impact.
 */
function refreshCacheInBackground(): void {
  if (fetchInFlight || !SANITY_PROJECT_ID) return;
  fetchInFlight = true;

  const query = encodeURIComponent('*[_id == "siteSettings"][0].allowedEmbedDomains[].domain');
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`;

  fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        console.error(`Sanity API error (CSP cache): ${res.status}`);
        return;
      }
      const json = await res.json();
      cachedDomains = json.result ?? [];
      lastFetchTs = Date.now();
    })
    .catch((err) => {
      console.error('Failed to refresh embed domains cache:', err);
    })
    .finally(() => {
      fetchInFlight = false;
    });
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // Trigger a background cache refresh if stale or empty
  if (!cachedDomains || Date.now() - lastFetchTs > CACHE_TTL) {
    refreshCacheInBackground();
  }

  // Build CSP frame-src from cached domains (synchronous — no await)
  const domains = cachedDomains ?? [];
  const frameSources = [
    "'self'",
    'https://*.sanity.io',
    ...domains.flatMap((d) => [`https://${d}`, `https://*.${d}`]),
  ].join(' ');

  response.headers.set(
    'Content-Security-Policy',
    `frame-src ${frameSources};`
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
