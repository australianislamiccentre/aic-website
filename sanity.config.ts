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
      // Events with Active/Draft/Inactive tabs
      S.listItem()
        .title("Events")
        .child(
          S.list()
            .title("Events")
            .items([
              S.listItem()
                .title("Active")
                .child(
                  S.documentList()
                    .title("Active Events")
                    .filter('_type == "event" && active == true')
                ),
              S.listItem()
                .title("Drafts")
                .child(
                  S.documentList()
                    .title("Draft Events")
                    .filter('_type == "event" && _id in path("drafts.**")')
                ),
              S.listItem()
                .title("Inactive")
                .child(
                  S.documentList()
                    .title("Inactive Events")
                    .filter('_type == "event" && !(_id in path("drafts.**")) && active == false')
                ),
              S.divider(),
              S.listItem()
                .title("All Events")
                .child(S.documentTypeList("event").title("All Events")),
            ])
        ),

      // Announcements with Active/Draft/Inactive tabs
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
                .title("Drafts")
                .child(
                  S.documentList()
                    .title("Draft Announcements")
                    .filter('_type == "announcement" && _id in path("drafts.**")')
                ),
              S.listItem()
                .title("Inactive")
                .child(
                  S.documentList()
                    .title("Inactive Announcements")
                    .filter('_type == "announcement" && !(_id in path("drafts.**")) && active == false')
                ),
              S.divider(),
              S.listItem()
                .title("All Announcements")
                .child(S.documentTypeList("announcement").title("All Announcements")),
            ])
        ),

      // Donation Campaigns with Active/Draft/Inactive tabs
      S.listItem()
        .title("Donation Campaigns")
        .child(
          S.list()
            .title("Donation Campaigns")
            .items([
              S.listItem()
                .title("Active")
                .child(
                  S.documentList()
                    .title("Active Campaigns")
                    .filter('_type == "donationCampaign" && active == true')
                ),
              S.listItem()
                .title("Drafts")
                .child(
                  S.documentList()
                    .title("Draft Campaigns")
                    .filter('_type == "donationCampaign" && _id in path("drafts.**")')
                ),
              S.listItem()
                .title("Inactive")
                .child(
                  S.documentList()
                    .title("Inactive Campaigns")
                    .filter('_type == "donationCampaign" && !(_id in path("drafts.**")) && active == false')
                ),
              S.divider(),
              S.listItem()
                .title("All Campaigns")
                .child(S.documentTypeList("donationCampaign").title("All Campaigns")),
            ])
        ),

      S.divider(),

      // Rest of the document types (exclude the ones we customized)
      ...S.documentTypeListItems().filter(
        (item) => !["event", "announcement", "donationCampaign"].includes(item.getId() || "")
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
  donationCause: () => "/donate",
  donationCampaign: (slug) => `/campaigns${slug ? `/${slug}` : ""}`,
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
