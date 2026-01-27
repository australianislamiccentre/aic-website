"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "./src/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

// Base URL for the site (safe to expose)
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://aic-website.vercel.app";

// Map document types to their preview paths
const previewPaths: Record<string, (slug?: string) => string> = {
  event: (slug) => `/events${slug ? `/${slug}` : ""}`,
  announcement: (slug) => `/announcements${slug ? `/${slug}` : ""}`,
  service: () => "/services",
  program: () => "/programs",
  donationCause: () => "/donate",
  galleryImage: () => "/media",
  testimonial: () => "/",
  faq: () => "/resources",
  etiquette: () => "/visit",
  tourType: () => "/visit",
  siteSettings: () => "/",
  prayerSettings: () => "/worshippers",
  teamMember: () => "/about",
  pageContent: () => "/",
  resource: () => "/resources",
};

// Helper to resolve preview URL for a document
function resolvePreviewUrl(
  docType: string,
  slug?: string
): string | undefined {
  const pathFn = previewPaths[docType];
  if (!pathFn) return undefined;
  return `${baseUrl}${pathFn(slug)}`;
}

export default defineConfig({
  name: "australian-islamic-centre",
  title: "Australian Islamic Centre",

  projectId,
  dataset,

  basePath: "/studio",

  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        // Preview URL resolver for Presentation tool
        previewMode: {
          enable: `${baseUrl}/api/draft`,
        },
        // Resolve URLs for different document types
        resolve: (doc: { _type?: string; slug?: { current?: string } } | null) => {
          const docType = doc?._type;
          const slug = doc?.slug?.current;
          if (!docType) return baseUrl;
          return resolvePreviewUrl(docType, slug) || baseUrl;
        },
      },
    }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // productionUrl adds "Open preview" link in document header
    productionUrl: async (prev, context) => {
      const { document } = context;
      const docType = document._type;
      const slug = (document.slug as { current?: string })?.current;

      // Return the preview URL directly (no API call needed)
      const url = resolvePreviewUrl(docType, slug);
      return url || prev;
    },
  },
});
