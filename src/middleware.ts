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

  // ── Security Headers ──
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // Trigger a background cache refresh if stale or empty
  if (!cachedDomains || Date.now() - lastFetchTs > CACHE_TTL) {
    refreshCacheInBackground();
  }

  // ── Content Security Policy ──
  // Content-driven embed domains from Sanity (JotForm, Typeform, etc.)
  const sanityDomains = cachedDomains ?? [];
  const dynamicFrameSrc = sanityDomains.flatMap((d) => [`https://${d}`, `https://*.${d}`]);

  const csp = [
    // Fallback for any directive not explicitly listed
    "default-src 'self'",

    // Scripts: self + inline (Next.js needs it) + eval (FundraiseUp widget) + trusted CDNs
    [
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      'https://cdn.fundraiseup.com',
      'https://js.stripe.com',
      'https://*.sanity.io',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ].join(' '),

    // Styles: self + inline (Tailwind / Next.js injects inline styles)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images
    [
      "img-src 'self' data: blob:",
      'https://cdn.sanity.io',
      'https://images.unsplash.com',
      'https://i.ytimg.com',
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://*.gstatic.com',
      'https://*.stripe.com',
      'https://*.facebook.com',
      'https://*.instagram.com',
    ].join(' '),

    // Fonts
    "font-src 'self' https://fonts.gstatic.com",

    // API / XHR / WebSocket connections
    [
      "connect-src 'self'",
      'https://*.sanity.io',
      'https://api.resend.com',
      'https://*.stripe.com',
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://cdn.fundraiseup.com',
      'https://*.fundraiseup.com',
      'https://www.google-analytics.com',
      'https://vitals.vercel-insights.com',
    ].join(' '),

    // Iframes: infrastructure + Sanity-managed content domains
    [
      "frame-src 'self'",
      'https://*.sanity.io',
      'https://js.stripe.com',
      'https://*.stripe.com',
      'https://*.stripe.network',
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://maps.app.goo.gl',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://www.facebook.com',
      'https://*.facebook.com',
      'https://www.instagram.com',
      'https://*.instagram.com',
      ...dynamicFrameSrc,
    ].join(' '),

    // Media (audio/video)
    "media-src 'self'",

    // Web workers
    "worker-src 'self' blob:",
  ].join('; ');

  // Using Report-Only initially — switch to Content-Security-Policy after verifying nothing breaks
  response.headers.set('Content-Security-Policy-Report-Only', csp);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
