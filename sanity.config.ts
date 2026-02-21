"use client";

import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "./src/sanity/schemas";

// Custom structure for document organization
const structure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      // Top-level singletons for easy access
      S.listItem()
        .title("Prayer Times")
        .child(
          S.document()
            .schemaType("prayerSettings")
            .documentId("prayerSettings")
        ),
      S.listItem()
        .title("Donations")
        .child(
          S.list()
            .title("Donations")
            .items([
              S.listItem()
                .title("Settings")
                .child(
                  S.document()
                    .schemaType("donationSettings")
                    .documentId("donationSettings")
                ),
              S.listItem()
                .title("Donate Page")
                .child(
                  S.document()
                    .schemaType("donatePageSettings")
                    .documentId("donatePageSettings")
                ),
              S.divider(),
              S.listItem()
                .title("Campaigns")
                .child(S.documentTypeList("donationCampaign").title("Donation Campaigns")),
            ])
        ),
      S.listItem()
        .title("Site Settings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
        ),
      S.listItem()
        .title("Forms")
        .child(
          S.document()
            .schemaType("formSettings")
            .documentId("formSettings")
        ),

      S.divider(),

      // Events — Live / Expired / Inactive views
      S.listItem()
        .title("Events")
        .child(
          S.list()
            .title("Events")
            .items([
              S.listItem()
                .title("Live on Website")
                .child(
                  S.documentList()
                    .title("Live Events")
                    .filter(
                      `_type == "event" && active == true && (
                        (recurring == true && (recurringEndDate == null || recurringEndDate >= now())) ||
                        date >= now() ||
                        endDate >= now()
                      )`
                    )
                ),
              S.listItem()
                .title("Expired")
                .child(
                  S.documentList()
                    .title("Expired Events")
                    .filter(
                      `_type == "event" && active == true && !(
                        (recurring == true && (recurringEndDate == null || recurringEndDate >= now())) ||
                        date >= now() ||
                        endDate >= now()
                      )`
                    )
                ),
              S.listItem()
                .title("Inactive")
                .child(
                  S.documentList()
                    .title("Inactive Events")
                    .filter('_type == "event" && active == false')
                ),
            ])
        ),

      // Announcements — Active/Inactive views
      S.listItem()
        .title("Announcements")
        .child(
          S.list()
            .title("Announcements")
            .items([
              S.listItem()
                .title("Active")
                .child(
                  S.documentList()
                    .title("Active Announcements")
                    .filter('_type == "announcement" && active == true')
                ),
              S.listItem()
                .title("Inactive")
                .child(
                  S.documentList()
                    .title("Inactive Announcements")
                    .filter('_type == "announcement" && active == false')
                ),
            ])
        ),

      S.divider(),

      // Rest of the document types (exclude the ones we customized and singletons)
      ...S.documentTypeListItems().filter(
        (item) => !["event", "announcement", "siteSettings", "prayerSettings", "donationSettings", "donatePageSettings", "donationCampaign", "formSettings"].includes(item.getId() || "")
      ),
    ]);

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
  donationSettings: () => "/donate",
  galleryImage: () => "/media",
  faq: () => "/resources",
  etiquette: () => "/visit",
  tourType: () => "/visit",
  siteSettings: () => "/",
  prayerSettings: () => "/worshippers",
  teamMember: (slug) => `/imams${slug ? `/${slug}` : ""}`,
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
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        initial: baseUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
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
