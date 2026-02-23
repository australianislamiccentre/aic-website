/**
 * Sanity Client Configuration
 *
 * Creates and exports four Sanity clients, each for a different use case:
 * - `client` — Default read client. Stega disabled to prevent zero-width chars
 *   from breaking client-side string comparisons (e.g. category filters).
 * - `noCdnClient` — Same as client but explicit no-CDN for singleton settings.
 * - `writeClient` — Authenticated write client (server-only, uses SANITY_API_WRITE_TOKEN).
 * - `previewClient` — Authenticated read client for draft mode with stega enabled
 *   for click-to-edit overlays in the Sanity Presentation tool.
 *
 * CDN is disabled on all clients — Next.js ISR is the sole caching layer.
 *
 * @module sanity/lib/client
 * @see src/sanity/lib/fetch.ts for the data-fetching functions that use these clients
 */
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Base URL for the studio (for stega overlays in Presentation tool)
const studioUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/studio`
  : "/studio";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Disable CDN — use API directly for fresh data on every ISR revalidation.
  // Next.js ISR (revalidate: 60) handles caching at the edge instead.
  useCdn: false,
  perspective: "published",
  stega: {
    studioUrl,
    // Only enable stega when explicitly in draft/preview mode.
    // Stega injects invisible zero-width characters into strings which breaks
    // client-side filtering (e.g. Array.includes() for category filters).
    enabled: false,
  },
});

// Client for singleton settings (prayer times, site settings, donation config)
export const noCdnClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

// Client with write permissions (for mutations)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Preview client for draft mode (sees unpublished content)
// Uses the read token (same as Presentation tool uses)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "previewDrafts",
  stega: {
    studioUrl,
    enabled: true, // Always enable stega in preview mode for click-to-edit
  },
});
