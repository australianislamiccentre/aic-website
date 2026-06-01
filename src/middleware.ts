/**
 * Edge Middleware — Security Headers & CSP
 *
 * Runs on every request at the Edge. Attaches HTTP security headers
 * including an ENFORCED Content-Security-Policy that whitelists trusted
 * domains for scripts, styles, frames, and images.
 *
 * Script execution is gated by a per-request nonce (not 'unsafe-inline'),
 * so injected inline scripts are blocked while our own inline scripts —
 * the layout JSON-LD and the FundraiseUp bootstrap — carry the nonce and
 * run. The nonce is exposed to the app on the `x-nonce` request header
 * (read in the root layout) and embedded in the CSP request header so
 * Next.js auto-nonces its own framework/bootstrap scripts.
 *
 * 'unsafe-eval' is retained because the FundraiseUp widget SDK requires it.
 * 'unsafe-inline' is retained on style-src only (Tailwind / Next inline
 * styles cannot be practically nonced).
 *
 * FundraiseUp loads its checkout/elements bundles from static.fundraiseup.com
 * and its payment iframe from checkout.fundraiseup.com, so https://*.fundraiseup.com
 * is allow-listed on script/style/img/font/frame directives. (connect-src
 * already covers it.)
 *
 * If `CSP_REPORT_URI` is set (e.g. a Sentry security endpoint), violation
 * reports are sent there via report-uri/report-to + a Reporting-Endpoints header.
 *
 * Embed domains for `frame-src` are fetched from Sanity's
 * `siteSettings.allowedEmbedDomains` and cached for 5 minutes.
 * The fetch is fire-and-forget (async, never blocks the request path).
 *
 * @module middleware
 */
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

/**
 * Generate a per-request CSP nonce. Uses Web Crypto (available in the Edge
 * runtime) and base64-encodes it so it matches Next.js's nonce parser
 * (`/^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/`).
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function middleware(request: NextRequest) {
  // Per-request nonce: gates inline <script> execution instead of 'unsafe-inline'.
  const nonce = generateNonce();

  // Trigger a background cache refresh if stale or empty
  if (!cachedDomains || Date.now() - lastFetchTs > CACHE_TTL) {
    refreshCacheInBackground();
  }

  // ── Content Security Policy ──
  // Content-driven embed domains from Sanity (JotForm, Typeform, etc.)
  const sanityDomains = cachedDomains ?? [];
  const dynamicFrameSrc = sanityDomains.flatMap((d) => [`https://${d}`, `https://*.${d}`]);

  // Optional violation reporting (e.g. a Sentry security endpoint). Only emitted
  // when configured, so nothing is hardcoded and the policy stays clean without it.
  const reportUri = process.env.CSP_REPORT_URI;

  const csp = [
    // Fallback for any directive not explicitly listed
    "default-src 'self'",

    // Scripts: self + per-request nonce (no 'unsafe-inline') + eval (FundraiseUp
    // SDK) + trusted CDNs. *.fundraiseup.com covers cdn. and static. (checkout bundles).
    [
      // 'unsafe-eval' is required by FundraiseUp's widget SDK
      `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`,
      'https://cdn.fundraiseup.com',
      'https://*.fundraiseup.com',
      'https://*.sanity.io',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://browser.sentry-cdn.com',
    ].join(' '),

    // Styles: self + inline (Tailwind / Next.js injects inline styles) + FundraiseUp
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.fundraiseup.com",

    // Images
    [
      "img-src 'self' data: blob:",
      'https://cdn.sanity.io',
      'https://images.unsplash.com',
      'https://i.ytimg.com',
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://*.gstatic.com',
      'https://*.facebook.com',
      'https://*.instagram.com',
      'https://*.fundraiseup.com',
    ].join(' '),

    // Fonts
    "font-src 'self' https://fonts.gstatic.com https://*.fundraiseup.com",

    // API / XHR / WebSocket connections
    [
      "connect-src 'self'",
      'https://*.sanity.io',
      'https://api.resend.com',
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://cdn.fundraiseup.com',
      'https://*.fundraiseup.com',
      'https://www.google-analytics.com',
      'https://vitals.vercel-insights.com',
      'https://*.ingest.sentry.io',
    ].join(' '),

    // Iframes: infrastructure + Sanity-managed content domains + FundraiseUp checkout
    [
      "frame-src 'self'",
      'https://*.sanity.io',
      'https://*.google.com',
      'https://*.googleapis.com',
      'https://maps.app.goo.gl',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://www.facebook.com',
      'https://*.facebook.com',
      'https://www.instagram.com',
      'https://*.instagram.com',
      'https://*.fundraiseup.com',
      ...dynamicFrameSrc,
    ].join(' '),

    // Media (audio/video)
    "media-src 'self'",

    // Web workers
    "worker-src 'self' blob:",

    // Disallow <base> hijacking and plugins (object/embed)
    "base-uri 'self'",
    "object-src 'none'",

    // Violation reporting (only when CSP_REPORT_URI is configured)
    ...(reportUri ? [`report-uri ${reportUri}`, 'report-to csp-endpoint'] : []),
  ].join('; ');

  // Thread the nonce + CSP onto the request headers so the app (root layout,
  // next/script) can read the nonce and Next.js auto-nonces its framework scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

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

  // ── Enforced Content Security Policy ──
  response.headers.set('Content-Security-Policy', csp);
  if (reportUri) {
    response.headers.set('Reporting-Endpoints', `csp-endpoint="${reportUri}"`);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
