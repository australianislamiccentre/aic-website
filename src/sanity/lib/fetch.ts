/**
 * Sanity Data-Fetching Layer
 *
 * All page-level data fetching flows through this module. Provides a generic
 * `sanityFetch` function and ~35 public getter functions (one per query).
 *
 * **Caching strategy:**
 * - Next.js ISR with 120s revalidate is the primary cache layer.
 * - Sanity CDN is disabled (`useCdn: false`) so ISR always gets fresh data.
 * - On-demand revalidation via `/api/revalidate` webhook handles instant updates.
 * - Singleton settings use `skipCdn` for extra freshness.
 *
 * **Error resilience:** Every public getter returns `[]` or `null` on failure —
 * never throws. This ensures pages degrade gracefully if Sanity is unreachable.
 *
 * **Draft mode:** When active, switches to `previewClient` to show unpublished content.
 *
 * @module sanity/lib/fetch
 * @see src/sanity/lib/client.ts for client configuration
 * @see src/sanity/lib/queries.ts for GROQ query definitions
 */
import "server-only";

import { draftMode } from "next/headers";
import { getMelbourneDateString } from "@/lib/time";
import { client, noCdnClient, previewClient } from "./client";
import {
  eventBySlugQuery,
  eventsQuery,
  featuredEventsQuery,
  announcementsQuery,
  announcementBySlugQuery,
  urgentAnnouncementsQuery,
  programsQuery,
  servicesQuery,
  serviceBySlugQuery,
  featuredServicesQuery,
  // Donation Settings
  donationSettingsQuery,
  donatePageSettingsQuery,
  galleryQuery,
  featuredGalleryQuery,
  mediaGalleryQuery,
  faqsQuery,
  faqsByCategoryQuery,
  featuredFaqsQuery,
  etiquetteQuery,
  siteSettingsQuery,
  homepageSettingsQuery,
  prayerSettingsQuery,
  // Team Members
  teamMembersQuery,
  teamMemberBySlugQuery,
  teamMembersByCategoryQuery,
  featuredTeamMembersQuery,
  // Page Content
  pageContentQuery,
  pageContentBySlugQuery,
  navigationPagesQuery,
  // Resources
  resourcesQuery,
  resourceBySlugQuery,
  featuredResourcesQuery,
  latestAnnouncementsQuery,
  // Form Settings
  formSettingsQuery,
  // Partners
  partnersQuery,
  partnerBySlugQuery,
  // Page singleton queries
  aboutPageSettingsQuery,
  architecturePageSettingsQuery,
  visitPageSettingsQuery,
  worshippersPageSettingsQuery,
  contactPageSettingsQuery,
  eventsPageSettingsQuery,
  announcementsPageSettingsQuery,
  servicesPageSettingsQuery,
  imamsPageSettingsQuery,
  resourcesPageSettingsQuery,
  mediaPageSettingsQuery,
  partnersPageSettingsQuery,
  privacyPageSettingsQuery,
  termsPageSettingsQuery,
  // Form singleton queries
  contactFormSettingsQuery,
  serviceInquiryFormSettingsQuery,
  eventInquiryFormSettingsQuery,
  newsletterSettingsQuery,
} from "./queries";
import {
  SanityEvent,
  SanityAnnouncement,
  SanityProgram,
  SanityService,
  SanityGalleryImage,
  MediaGalleryImage,
  SanityFaq,
  SanityEtiquette,
  SanitySiteSettings,
  SanityHomepageSettings,
  SanityPrayerSettings,
  SanityTeamMember,
  SanityPageContent,
  SanityResource,
  SanityPartner,
  SanityAboutPageSettings,
  SanityArchitecturePageSettings,
  SanityVisitPageSettings,
  SanityWorshippersPageSettings,
  SanityContactPageSettings,
  SanitySimplePageSettings,
  SanityServicesPageSettings,
  SanityImamsPageSettings,
  SanityMediaPageSettings,
  SanityPartnersPageSettings,
  SanityLegalPageSettings,
  SanityContactFormSettings,
  SanityServiceInquiryFormSettings,
  SanityEventInquiryFormSettings,
  SanityNewsletterSettings,
} from "@/types/sanity";

// Donation Settings type (Fundraise Up config)
export interface DonationSettings {
  _id: string;
  installationScript?: string;
  organizationKey?: string;
}

// Revalidation time in seconds
// On-demand revalidation via webhook handles instant updates on publish.
// This ISR fallback catches anything the webhook misses.
// 120s is sufficient since the webhook provides real-time updates.
const REVALIDATE_TIME = 120;

// Generic fetch function with caching and draft mode support
async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
  options: { skipCdn?: boolean } = {}
): Promise<T> {
  const { isEnabled: isDraftMode } = await draftMode();

  // Only use preview client when explicitly in draft mode (not all of dev)
  // This ensures dev behaves like production — only published content shows
  if (isDraftMode) {
    return previewClient.fetch<T>(query, params);
  }

  // Use noCdnClient for singleton settings that must always be fresh
  const fetchClient = options.skipCdn ? noCdnClient : client;

  // Fetch with ISR caching (Next.js handles the caching layer)
  return fetchClient.fetch<T>(query, params, {
    next: {
      revalidate: REVALIDATE_TIME,
      tags: ["sanity", ...tags],
    },
  });
}

// Events
export async function getEvents(): Promise<SanityEvent[]> {
  try {
    // `today` anchored to Melbourne so that an event expires from the query
    // the moment the Melbourne calendar rolls over, not when UTC does.
    const result = await sanityFetch<SanityEvent[]>(
      eventsQuery,
      { today: getMelbourneDateString() },
      ["events"],
    );
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch events from Sanity:", error);
    return [];
  }
}

// For static generation (no draft mode check - used in generateStaticParams)
export async function getEventsForStaticGeneration(): Promise<SanityEvent[]> {
  try {
    const result = await client.fetch<SanityEvent[]>(
      eventsQuery,
      { today: getMelbourneDateString() },
      {
        next: {
          revalidate: REVALIDATE_TIME,
          tags: ["sanity", "events"],
        },
      },
    );
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch events for static generation:", error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<SanityEvent | null> {
  try {
    return await sanityFetch<SanityEvent | null>(eventBySlugQuery, { slug }, ["events"]);
  } catch (error) {
    console.error(`Failed to fetch event "${slug}" from Sanity:`, error);
    return null;
  }
}

// Featured events for homepage
export async function getFeaturedEvents(): Promise<SanityEvent[]> {
  try {
    const result = await sanityFetch<SanityEvent[]>(
      featuredEventsQuery,
      { today: getMelbourneDateString() },
      ["events"],
    );
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured events from Sanity:", error);
    return [];
  }
}

// Announcements
export async function getAnnouncements(): Promise<SanityAnnouncement[]> {
  try {
    const result = await sanityFetch<SanityAnnouncement[]>(announcementsQuery, {}, ["announcements"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch announcements from Sanity:", error);
    return [];
  }
}

export async function getAnnouncementBySlug(slug: string): Promise<SanityAnnouncement | null> {
  try {
    return await sanityFetch<SanityAnnouncement | null>(announcementBySlugQuery, { slug }, ["announcements"]);
  } catch (error) {
    console.error(`Failed to fetch announcement "${slug}" from Sanity:`, error);
    return null;
  }
}

// For static generation (no draft mode check - used in generateStaticParams)
export async function getAnnouncementsForStaticGeneration(): Promise<SanityAnnouncement[]> {
  try {
    const result = await client.fetch<SanityAnnouncement[]>(announcementsQuery, {}, {
      next: {
        revalidate: REVALIDATE_TIME,
        tags: ["sanity", "announcements"],
      },
    });
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch announcements for static generation:", error);
    return [];
  }
}

export async function getUrgentAnnouncements(): Promise<SanityAnnouncement[]> {
  try {
    const result = await sanityFetch<SanityAnnouncement[]>(urgentAnnouncementsQuery, {}, ["announcements"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch urgent announcements from Sanity:", error);
    return [];
  }
}

// Programs
export async function getPrograms(): Promise<SanityProgram[]> {
  try {
    const result = await sanityFetch<SanityProgram[]>(
      programsQuery,
      { today: getMelbourneDateString() },
      ["programs"],
    );
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch programs from Sanity:", error);
    return [];
  }
}

// Services
export async function getServices(): Promise<SanityService[]> {
  try {
    const result = await sanityFetch<SanityService[]>(servicesQuery, {}, ["services"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch services from Sanity:", error);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<SanityService | null> {
  try {
    return await sanityFetch<SanityService | null>(serviceBySlugQuery, { slug }, ["services"]);
  } catch (error) {
    console.error(`Failed to fetch service "${slug}" from Sanity:`, error);
    return null;
  }
}

export async function getFeaturedServices(): Promise<SanityService[]> {
  try {
    const result = await sanityFetch<SanityService[]>(featuredServicesQuery, {}, ["services"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured services from Sanity:", error);
    return [];
  }
}

// For static generation (no draft mode check - used in generateStaticParams)
export async function getServicesForStaticGeneration(): Promise<SanityService[]> {
  try {
    const result = await client.fetch<SanityService[]>(servicesQuery, {}, {
      next: {
        revalidate: REVALIDATE_TIME,
        tags: ["sanity", "services"],
      },
    });
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch services for static generation:", error);
    return [];
  }
}

// ============================================
// Donation Settings (Fundraise Up config)
// ============================================
export async function getDonationSettings(): Promise<DonationSettings | null> {
  try {
    return await sanityFetch<DonationSettings | null>(
      donationSettingsQuery,
      {},
      ["donationSettings"],
      { skipCdn: true }
    );
  } catch (error) {
    console.error("Failed to fetch donation settings from Sanity:", error);
    return null;
  }
}

// ============================================
// Donate Page Settings (singleton for /donate page)
// ============================================
export interface DonatePageCampaign {
  _id: string;
  title: string;
  fundraiseUpElement: string;
  active?: boolean;
}

export interface DonatePageImpactStat {
  value: string;
  label: string;
}

export interface DonatePageSettings {
  _id: string;
  heroHeading?: string;
  heroDescription?: string;
  formElement?: string;
  impactStats?: DonatePageImpactStat[];
  campaigns?: DonatePageCampaign[];
}

export async function getDonatePageSettings(): Promise<DonatePageSettings | null> {
  try {
    return await sanityFetch<DonatePageSettings | null>(
      donatePageSettingsQuery,
      {},
      ["donatePageSettings"],
      { skipCdn: true }
    );
  } catch (error) {
    console.error("Failed to fetch donate page settings from Sanity:", error);
    return null;
  }
}

// Gallery
export async function getGalleryImages(): Promise<SanityGalleryImage[]> {
  try {
    const result = await sanityFetch<SanityGalleryImage[]>(galleryQuery, {}, ["gallery"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch gallery images from Sanity:", error);
    return [];
  }
}

export async function getFeaturedGalleryImages(): Promise<SanityGalleryImage[]> {
  try {
    const result = await sanityFetch<SanityGalleryImage[]>(featuredGalleryQuery, {}, ["gallery"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured gallery images from Sanity:", error);
    return [];
  }
}

// Media Page Gallery (singleton)
export async function getMediaGallery(): Promise<MediaGalleryImage[]> {
  try {
    const result = await sanityFetch<{ images: MediaGalleryImage[] } | null>(
      mediaGalleryQuery,
      {},
      ["mediaGallery"]
    );
    return result?.images ?? [];
  } catch (error) {
    console.error("Failed to fetch media gallery from Sanity:", error);
    return [];
  }
}

// FAQs
export async function getFaqs(): Promise<SanityFaq[]> {
  try {
    const result = await sanityFetch<SanityFaq[]>(faqsQuery, {}, ["faqs"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch FAQs from Sanity:", error);
    return [];
  }
}

export async function getFaqsByCategory(category: string): Promise<SanityFaq[]> {
  try {
    const result = await sanityFetch<SanityFaq[]>(faqsByCategoryQuery, { category }, ["faqs"]);
    return result ?? [];
  } catch (error) {
    console.error(`Failed to fetch FAQs for category "${category}" from Sanity:`, error);
    return [];
  }
}

export async function getFeaturedFaqs(): Promise<SanityFaq[]> {
  try {
    const result = await sanityFetch<SanityFaq[]>(featuredFaqsQuery, {}, ["faqs"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured FAQs from Sanity:", error);
    return [];
  }
}

// Etiquette
export async function getEtiquette(): Promise<SanityEtiquette[]> {
  try {
    const result = await sanityFetch<SanityEtiquette[]>(etiquetteQuery, {}, ["etiquette"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch etiquette from Sanity:", error);
    return [];
  }
}

// ============================================
// Team Members
// ============================================
export async function getTeamMembers(): Promise<SanityTeamMember[]> {
  try {
    const result = await sanityFetch<SanityTeamMember[]>(teamMembersQuery, {}, ["teamMembers"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch team members from Sanity:", error);
    return [];
  }
}

export async function getTeamMemberBySlug(slug: string): Promise<SanityTeamMember | null> {
  try {
    return await sanityFetch<SanityTeamMember | null>(teamMemberBySlugQuery, { slug }, ["teamMembers"]);
  } catch (error) {
    console.error(`Failed to fetch team member "${slug}" from Sanity:`, error);
    return null;
  }
}

export async function getTeamMembersByCategory(category: string): Promise<SanityTeamMember[]> {
  try {
    const result = await sanityFetch<SanityTeamMember[]>(teamMembersByCategoryQuery, { category }, ["teamMembers"]);
    return result ?? [];
  } catch (error) {
    console.error(`Failed to fetch team members for category "${category}" from Sanity:`, error);
    return [];
  }
}

export async function getFeaturedTeamMembers(): Promise<SanityTeamMember[]> {
  try {
    const result = await sanityFetch<SanityTeamMember[]>(featuredTeamMembersQuery, {}, ["teamMembers"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured team members from Sanity:", error);
    return [];
  }
}

// ============================================
// NEW: Page Content
// ============================================
export async function getPageContent(): Promise<SanityPageContent[]> {
  try {
    const result = await sanityFetch<SanityPageContent[]>(pageContentQuery, {}, ["pageContent"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch page content from Sanity:", error);
    return [];
  }
}

export async function getPageContentBySlug(slug: string): Promise<SanityPageContent | null> {
  try {
    return await sanityFetch<SanityPageContent | null>(pageContentBySlugQuery, { slug }, ["pageContent"]);
  } catch (error) {
    console.error(`Failed to fetch page content "${slug}" from Sanity:`, error);
    return null;
  }
}

export async function getNavigationPages(): Promise<SanityPageContent[]> {
  try {
    const result = await sanityFetch<SanityPageContent[]>(navigationPagesQuery, {}, ["pageContent"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch navigation pages from Sanity:", error);
    return [];
  }
}

// ============================================
// NEW: Resources
// ============================================
export async function getResources(): Promise<SanityResource[]> {
  try {
    const result = await sanityFetch<SanityResource[]>(resourcesQuery, {}, ["resources"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch resources from Sanity:", error);
    return [];
  }
}

export async function getResourceBySlug(slug: string): Promise<SanityResource | null> {
  try {
    return await sanityFetch<SanityResource | null>(resourceBySlugQuery, { slug }, ["resources"]);
  } catch (error) {
    console.error(`Failed to fetch resource "${slug}" from Sanity:`, error);
    return null;
  }
}

export async function getFeaturedResources(): Promise<SanityResource[]> {
  try {
    const result = await sanityFetch<SanityResource[]>(featuredResourcesQuery, {}, ["resources"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured resources from Sanity:", error);
    return [];
  }
}

// ============================================
// Site Settings (singleton)
// ============================================
export async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  try {
    return await sanityFetch<SanitySiteSettings | null>(siteSettingsQuery, {}, ["siteSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch site settings from Sanity:", error);
    return null;
  }
}

// Homepage Settings (singleton)
export async function getHomepageSettings(): Promise<SanityHomepageSettings | null> {
  try {
    return await sanityFetch<SanityHomepageSettings | null>(homepageSettingsQuery, {}, ["homepageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch homepage settings from Sanity:", error);
    return null;
  }
}

// Form Settings (singleton)
export async function getFormSettings(): Promise<Record<string, unknown> | null> {
  try {
    return await sanityFetch<Record<string, unknown> | null>(
      formSettingsQuery,
      {},
      ["formSettings"],
      { skipCdn: true }
    );
  } catch (error) {
    console.error("Failed to fetch form settings from Sanity:", error);
    return null;
  }
}

// Prayer Settings (singleton)
export async function getPrayerSettings(): Promise<SanityPrayerSettings | null> {
  try {
    return await sanityFetch<SanityPrayerSettings | null>(prayerSettingsQuery, {}, ["prayerSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch prayer settings from Sanity:", error);
    return null;
  }
}

// ============================================
// Latest Updates - Combined feed
// ============================================
export interface LatestUpdateItem {
  _id: string;
  _type: "announcement" | "event";
  title: string;
  slug: string;
  description: string;
  date: string;
  image?: { asset: { _ref: string } };
  category?: string;
  priority?: string;
  callToAction?: { label?: string; linkType?: string; internalPage?: string; url?: string };
  time?: string;
  location?: string;
  featured?: boolean;
}

export async function getLatestAnnouncements(): Promise<LatestUpdateItem[]> {
  try {
    const result = await sanityFetch<LatestUpdateItem[]>(latestAnnouncementsQuery, {}, ["announcements"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch latest announcements from Sanity:", error);
    return [];
  }
}

// ============================================
// Partners
// ============================================
export async function getPartners(): Promise<SanityPartner[]> {
  try {
    const result = await sanityFetch<SanityPartner[]>(partnersQuery, {}, ["partners"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch partners from Sanity:", error);
    return [];
  }
}

export async function getPartnerBySlug(slug: string): Promise<SanityPartner | null> {
  try {
    return await sanityFetch<SanityPartner | null>(partnerBySlugQuery, { slug }, ["partners"]);
  } catch (error) {
    console.error(`Failed to fetch partner "${slug}" from Sanity:`, error);
    return null;
  }
}

// For static generation (no draft mode check - used in generateStaticParams)
export async function getPartnersForStaticGeneration(): Promise<{ _id: string; slug: string }[]> {
  try {
    const result = await client.fetch<{ _id: string; slug: string }[]>(
      `*[_type == "partner" && active != false && defined(slug.current)] { _id, "slug": slug.current }`,
      {},
      {
        next: {
          revalidate: REVALIDATE_TIME,
          tags: ["sanity", "partners"],
        },
      }
    );
    return result ?? [];
  } catch {
    return [];
  }
}

// ── Page settings fetch functions ──

export async function getAboutPageSettings(): Promise<SanityAboutPageSettings | null> {
  try {
    return await sanityFetch<SanityAboutPageSettings>(aboutPageSettingsQuery, {}, ["aboutPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getArchitecturePageSettings(): Promise<SanityArchitecturePageSettings | null> {
  try {
    return await sanityFetch<SanityArchitecturePageSettings>(architecturePageSettingsQuery, {}, ["architecturePageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getVisitPageSettings(): Promise<SanityVisitPageSettings | null> {
  try {
    return await sanityFetch<SanityVisitPageSettings>(visitPageSettingsQuery, {}, ["visitPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getWorshippersPageSettings(): Promise<SanityWorshippersPageSettings | null> {
  try {
    return await sanityFetch<SanityWorshippersPageSettings>(worshippersPageSettingsQuery, {}, ["worshippersPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getContactPageSettings(): Promise<SanityContactPageSettings | null> {
  try {
    return await sanityFetch<SanityContactPageSettings>(contactPageSettingsQuery, {}, ["contactPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getEventsPageSettings(): Promise<SanitySimplePageSettings | null> {
  try {
    return await sanityFetch<SanitySimplePageSettings>(eventsPageSettingsQuery, {}, ["eventsPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getAnnouncementsPageSettings(): Promise<SanitySimplePageSettings | null> {
  try {
    return await sanityFetch<SanitySimplePageSettings>(announcementsPageSettingsQuery, {}, ["announcementsPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getServicesPageSettings(): Promise<SanityServicesPageSettings | null> {
  try {
    return await sanityFetch<SanityServicesPageSettings>(servicesPageSettingsQuery, {}, ["servicesPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getImamsPageSettings(): Promise<SanityImamsPageSettings | null> {
  try {
    return await sanityFetch<SanityImamsPageSettings>(imamsPageSettingsQuery, {}, ["imamsPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getResourcesPageSettings(): Promise<SanitySimplePageSettings | null> {
  try {
    return await sanityFetch<SanitySimplePageSettings>(resourcesPageSettingsQuery, {}, ["resourcesPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getMediaPageSettings(): Promise<SanityMediaPageSettings | null> {
  try {
    return await sanityFetch<SanityMediaPageSettings>(mediaPageSettingsQuery, {}, ["mediaPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getPartnersPageSettings(): Promise<SanityPartnersPageSettings | null> {
  try {
    return await sanityFetch<SanityPartnersPageSettings>(partnersPageSettingsQuery, {}, ["partnersPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getPrivacyPageSettings(): Promise<SanityLegalPageSettings | null> {
  try {
    return await sanityFetch<SanityLegalPageSettings>(privacyPageSettingsQuery, {}, ["privacyPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getTermsPageSettings(): Promise<SanityLegalPageSettings | null> {
  try {
    return await sanityFetch<SanityLegalPageSettings>(termsPageSettingsQuery, {}, ["termsPageSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

// ── Form settings fetch functions ──

export async function getContactFormSettings(): Promise<SanityContactFormSettings | null> {
  try {
    return await sanityFetch<SanityContactFormSettings>(contactFormSettingsQuery, {}, ["contactFormSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getServiceInquiryFormSettings(): Promise<SanityServiceInquiryFormSettings | null> {
  try {
    return await sanityFetch<SanityServiceInquiryFormSettings>(serviceInquiryFormSettingsQuery, {}, ["serviceInquiryFormSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getEventInquiryFormSettings(): Promise<SanityEventInquiryFormSettings | null> {
  try {
    return await sanityFetch<SanityEventInquiryFormSettings>(eventInquiryFormSettingsQuery, {}, ["eventInquiryFormSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getNewsletterSettings(): Promise<SanityNewsletterSettings | null> {
  try {
    return await sanityFetch<SanityNewsletterSettings>(newsletterSettingsQuery, {}, ["newsletterSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

