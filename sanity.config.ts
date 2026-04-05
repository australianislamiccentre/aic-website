/**
 * Sanity Studio Configuration
 *
 * Page-centric sidebar: all site pages grouped under "Site Pages", each
 * with its page settings singleton at the top followed by the content
 * documents for that page. Forms grouped under "Forms". Global singletons
 * (Prayer Times, Donation Settings, Site Settings) at the root level.
 *
 * Plugins: structureTool (custom desk), media (asset library),
 * presentationTool (live preview), visionTool (GROQ playground),
 * scheduled publishing.
 *
 * @module sanity.config
 * @see src/sanity/schemas/index.ts — schema registry
 */
"use client";

import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder, type StructureResolverContext } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { media } from "sanity-plugin-media";
import { iconPicker } from "sanity-plugin-icon-picker";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "./src/sanity/schemas";

/** All singleton document IDs — delete/duplicate actions are blocked for these. */
const singletonIds = [
  "siteSettings",
  "homepageSettings",
  "headerSettings",
  "footerSettings",
  "prayerSettings",
  "donationSettings",
  "donatePageSettings",
  "formSettings",
  "mediaGallery",
  "offlineDonations",
  // Page singletons
  "aboutPageSettings",
  "architecturePageSettings",
  "visitPageSettings",
  "worshippersPageSettings",
  "contactPageSettings",
  "eventsPageSettings",
  "announcementsPageSettings",
  "servicesPageSettings",
  "imamsPageSettings",
  "resourcesPageSettings",
  "mediaPageSettings",
  "partnersPageSettings",
  "privacyPageSettings",
  "termsPageSettings",
  // Form singletons
  "contactFormSettings",
  "serviceInquiryFormSettings",
  "eventInquiryFormSettings",
  "newsletterSettings",
];

/** Helper: creates a singleton list item that pins to a single document. */
const singleton = (S: StructureBuilder, schemaType: string, title: string) =>
  S.listItem()
    .title(title)
    .child(S.document().schemaType(schemaType).documentId(schemaType));

/** Custom desk structure — page-centric sidebar. */
const structure = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title("Content")
    .items([
      // ── Site Pages ──
      S.listItem()
        .title("Site Pages")
        .child(
          S.list()
            .title("Site Pages")
            .items([
              singleton(S, "homepageSettings", "Homepage"),
              singleton(S, "aboutPageSettings", "About"),
              singleton(S, "architecturePageSettings", "Architecture"),
              singleton(S, "visitPageSettings", "Visit"),
              singleton(S, "worshippersPageSettings", "Worshippers"),
              singleton(S, "contactPageSettings", "Contact"),

              S.divider(),

              // Events folder
              S.listItem()
                .title("Events")
                .child(
                  S.list()
                    .title("Events")
                    .items([
                      singleton(S, "eventsPageSettings", "Page Settings"),
                      S.divider(),
                      S.listItem()
                        .title("Live on Website")
                        .child(
                          S.documentList()
                            .title("Live Events")
                            .filter(
                              `_type == "event" && active == true && (
                                (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= string::split(string(now()), "T")[0])) ||
                                date >= string::split(string(now()), "T")[0] ||
                                endDate >= string::split(string(now()), "T")[0]
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
                                (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= string::split(string(now()), "T")[0])) ||
                                date >= string::split(string(now()), "T")[0] ||
                                endDate >= string::split(string(now()), "T")[0]
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

              // Announcements folder
              S.listItem()
                .title("Announcements")
                .child(
                  S.list()
                    .title("Announcements")
                    .items([
                      singleton(S, "announcementsPageSettings", "Page Settings"),
                      S.divider(),
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

              // Services folder
              S.listItem()
                .title("Services")
                .child(
                  S.list()
                    .title("Services")
                    .items([
                      singleton(S, "servicesPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "service",
                        title: "Active Services",
                        filter: '_type == "service" && active == true',
                        S,
                        context,
                      }),
                      S.listItem()
                        .title("Inactive")
                        .child(
                          S.documentList()
                            .title("Inactive Services")
                            .filter('_type == "service" && active == false')
                        ),
                    ])
                ),

              // Donate folder
              S.listItem()
                .title("Donate")
                .child(
                  S.list()
                    .title("Donate")
                    .items([
                      singleton(S, "donatePageSettings", "Page Settings"),
                      S.divider(),
                      S.listItem()
                        .title("Active Campaigns")
                        .child(
                          S.documentList()
                            .title("Active Campaigns")
                            .filter('_type == "donationCampaign" && active == true')
                        ),
                      S.listItem()
                        .title("Inactive Campaigns")
                        .child(
                          S.documentList()
                            .title("Inactive Campaigns")
                            .filter('_type == "donationCampaign" && active == false')
                        ),
                      S.divider(),
                      singleton(S, "offlineDonations", "Offline Donations"),
                    ])
                ),

              // Imams / Team folder
              S.listItem()
                .title("Imams / Team")
                .child(
                  S.list()
                    .title("Imams / Team")
                    .items([
                      singleton(S, "imamsPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "teamMember",
                        title: "Team Members",
                        S,
                        context,
                      }),
                    ])
                ),

              // Resources folder
              S.listItem()
                .title("Resources")
                .child(
                  S.list()
                    .title("Resources")
                    .items([
                      singleton(S, "resourcesPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "resource",
                        title: "All Resources",
                        S,
                        context,
                      }),
                    ])
                ),

              // Media folder
              S.listItem()
                .title("Media")
                .child(
                  S.list()
                    .title("Media")
                    .items([
                      singleton(S, "mediaPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "galleryImage",
                        title: "Gallery Images",
                        S,
                        context,
                      }),
                      singleton(S, "mediaGallery", "Media Page Gallery"),
                    ])
                ),

              // Partners folder
              S.listItem()
                .title("Partners")
                .child(
                  S.list()
                    .title("Partners")
                    .items([
                      singleton(S, "partnersPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "partner",
                        title: "All Partners",
                        S,
                        context,
                      }),
                    ])
                ),

              S.divider(),
              singleton(S, "privacyPageSettings", "Privacy Policy"),
              singleton(S, "termsPageSettings", "Terms of Use"),
              S.divider(),

              // Custom CMS pages (dynamic pageContent documents)
              S.listItem()
                .title("Custom Pages")
                .child(
                  S.documentList()
                    .title("Custom Pages")
                    .filter('_type == "pageContent"')
                ),
            ])
        ),

      S.divider(),

      // ── Navigation Settings ──
      S.listItem()
        .title("Navigation Settings")
        .child(
          S.list()
            .title("Navigation Settings")
            .items([
              singleton(S, "headerSettings", "Header Settings"),
              singleton(S, "footerSettings", "Footer Settings"),
            ])
        ),

      // ── Prayer Times ──
      singleton(S, "prayerSettings", "Prayer Times"),

      // ── Forms ──
      S.listItem()
        .title("Forms")
        .child(
          S.list()
            .title("Forms")
            .items([
              singleton(S, "contactFormSettings", "Contact Form"),
              singleton(S, "serviceInquiryFormSettings", "Service Inquiry Form"),
              singleton(S, "eventInquiryFormSettings", "Event Inquiry Form"),
              singleton(S, "newsletterSettings", "Newsletter"),
            ])
        ),

      // ── Donation Settings ──
      singleton(S, "donationSettings", "Donation Settings"),

      // ── Site Settings ──
      singleton(S, "siteSettings", "Site Settings"),
    ]);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://aic-website.vercel.app";

/** Maps each Sanity document type to the Next.js preview path. */
const previewPaths: Record<string, (slug?: string) => string> = {
  event: (slug) => `/events${slug ? `/${slug}` : ""}`,
  announcement: (slug) => `/announcements${slug ? `/${slug}` : ""}`,
  service: () => "/services",
  donationSettings: () => "/donate",
  donatePageSettings: () => "/donate",
  offlineDonations: () => "/donate",
  donationCampaign: () => "/donate",
  galleryImage: () => "/media",
  mediaGallery: () => "/media",
  mediaPageSettings: () => "/media",
  faq: () => "/resources",
  etiquette: () => "/visit",
  homepageSettings: () => "/",
  headerSettings: () => "/",
  footerSettings: () => "/",
  siteSettings: () => "/",
  prayerSettings: () => "/worshippers",
  teamMember: (slug) => `/imams${slug ? `/${slug}` : ""}`,
  pageContent: (slug) => (slug ? `/${slug}` : "/"),
  resource: () => "/resources",
  partner: (slug) => `/partners${slug ? `/${slug}` : ""}`,
  aboutPageSettings: () => "/about",
  architecturePageSettings: () => "/architecture",
  visitPageSettings: () => "/visit",
  worshippersPageSettings: () => "/worshippers",
  contactPageSettings: () => "/contact",
  eventsPageSettings: () => "/events",
  announcementsPageSettings: () => "/announcements",
  servicesPageSettings: () => "/services",
  imamsPageSettings: () => "/imams",
  resourcesPageSettings: () => "/resources",
  partnersPageSettings: () => "/partners",
  privacyPageSettings: () => "/privacy",
  termsPageSettings: () => "/terms",
  contactFormSettings: () => "/contact",
  serviceInquiryFormSettings: () => "/services",
  eventInquiryFormSettings: () => "/events",
  newsletterSettings: () => "/",
};

function resolvePreviewUrl(docType: string, slug?: string): string | undefined {
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
    media(),
    iconPicker(),
    presentationTool({
      previewUrl: {
        initial: baseUrl,
        previewMode: { enable: "/api/draft-mode/enable" },
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

  scheduledPublishing: {
    enabled: true,
    inputDateTimeFormat: "dd/MM/yyyy h:mm a",
  },

  schema: { types: schemaTypes },

  document: {
    // Prevent deletion/duplication of all singleton documents
    actions: (prev, context) => {
      if (singletonIds.includes(context.schemaType)) {
        return prev.filter(
          (action) => action.action !== "delete" && action.action !== "duplicate"
        );
      }
      return prev;
    },
    // "Open preview" link in document header
    productionUrl: async (prev, context) => {
      const { document } = context;
      const docType = document._type;
      const slug = (document.slug as { current?: string })?.current;
      const url = resolvePreviewUrl(docType, slug);
      return url || prev;
    },
  },
});
