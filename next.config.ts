/**
 * Next.js Configuration
 *
 * - **Image domains**: Whitelists Unsplash, Sanity CDN, and YouTube thumbnails.
 * - **Redirects**: Maps legacy routes (/programs → /events) and guards
 *   pages that shouldn't be accessed directly (/donate/success → /donate).
 * - **Sentry**: Wraps config with `withSentryConfig` for source map uploads
 *   and automatic instrumentation.
 *
 * @module next.config
 */
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/resources",
        destination: "/",
        permanent: false,
      },
      {
        source: "/donate/success",
        destination: "/donate",
        permanent: false,
      },
      {
        source: "/programs",
        destination: "/events",
        permanent: true,
      },
      {
        source: "/programs/:path*",
        destination: "/events",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppresses source map upload logs during build
  silent: true,

  // Upload source maps for better stack traces (requires SENTRY_AUTH_TOKEN)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Automatically tree-shake Sentry debug logging in production
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Hide source maps from the client bundle
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
