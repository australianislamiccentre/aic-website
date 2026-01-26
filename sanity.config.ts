"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

// Base URL for preview - temporarily using aic-website.vercel.app until production is live
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://aic-website.vercel.app";
// Note: Preview secret must use NEXT_PUBLIC_ prefix to be accessible in client-side code
const previewSecret = process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET || "";

// Map document types to their preview URLs
const previewUrlMap: Record<string, (slug?: string) => string> = {
  event: (slug) => `/events${slug ? `/${slug}` : ""}`,
  service: () => "/services",
  announcement: () => "/announcements",
  donationCause: () => "/donate",
  galleryImage: () => "/media",
  testimonial: () => "/",
  faq: () => "/visit",
  etiquette: () => "/visit",
  tourType: () => "/visit",
  siteSettings: () => "/",
  prayerSettings: () => "/worshippers",
  teamMember: () => "/about",
  pageContent: () => "/",
  resource: () => "/resources",
};

export default defineConfig({
  name: "australian-islamic-centre",
  title: "Australian Islamic Centre",

  projectId,
  dataset,

  basePath: "/studio",

  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Add a "Preview" action to document types
    productionUrl: async (prev, context) => {
      const { document } = context;
      const docType = document._type;

      // Get the URL mapper for this document type
      const urlMapper = previewUrlMap[docType];
      if (!urlMapper) return prev;

      // Get slug if available
      const slug = (document.slug as { current?: string })?.current;
      const path = urlMapper(slug);

      // Build the preview URL with draft mode
      const previewUrl = new URL("/api/draft", baseUrl);
      previewUrl.searchParams.set("secret", previewSecret);
      previewUrl.searchParams.set("slug", path);

      return previewUrl.toString();
    },
  },
});
