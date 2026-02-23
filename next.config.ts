/**
 * Next.js Configuration
 *
 * - **Image domains**: Whitelists Unsplash, Sanity CDN, and YouTube thumbnails.
 * - **Redirects**: Maps legacy routes (/programs → /events) and guards
 *   pages that shouldn't be accessed directly (/donate/success → /donate).
 *
 * @module next.config
 */
import type { NextConfig } from "next";

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

export default nextConfig;
