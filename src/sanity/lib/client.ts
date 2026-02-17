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
  useCdn: true,
  // Enable stega encoding for Presentation tool click-to-edit
  stega: {
    studioUrl,
    // Only enable in non-production or when explicitly in draft mode
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV !== "production",
  },
});

// Client that bypasses CDN — for singleton settings that must be fresh
// (prayer times, site settings, donation config)
export const noCdnClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
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
