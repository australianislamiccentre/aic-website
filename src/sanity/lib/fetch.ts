import "server-only";

import { draftMode } from "next/headers";
import { client, noCdnClient, previewClient } from "./client";
import {
  eventBySlugQuery,
  eventsQuery,
  featuredEventsQuery,
  announcementsQuery,
  announcementBySlugQuery,
  featuredAnnouncementsQuery,
  urgentAnnouncementsQuery,
  programsQuery,
  servicesQuery,
  serviceBySlugQuery,
  featuredServicesQuery,
  // Donation Settings
  donationSettingsQuery,
  donateModalSettingsQuery,
  donationGoalMeterQuery,
  galleryQuery,
  featuredGalleryQuery,
  faqsQuery,
  faqsByCategoryQuery,
  featuredFaqsQuery,
  etiquetteQuery,
  tourTypesQuery,
  siteSettingsQuery,
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
  latestUpdatesQuery,
} from "./queries";
import {
  SanityEvent,
  SanityAnnouncement,
  SanityProgram,
  SanityService,
  SanityGalleryImage,
  SanityFaq,
  SanityEtiquette,
  SanityTourType,
  SanitySiteSettings,
  SanityPrayerSettings,
  SanityTeamMember,
  SanityPageContent,
  SanityResource,
} from "@/types/sanity";

// Donation Settings type (Fundraise Up config)
export interface DonationSettings {
  _id: string;
  installationScript?: string;
  organizationKey?: string;
}

// Campaign type (referenced from modal settings)
export interface ModalCampaign {
  _id: string;
  title: string;
  fundraiseUpElement: string;
}

// Donate Modal Settings type
export interface DonateModalSettings {
  _id: string;
  modalTitle?: string;
  showGoalMeter?: boolean;
  featuredCampaign?: ModalCampaign | null;
  additionalCampaigns?: ModalCampaign[];
}

// Revalidation time in seconds (1 minute for faster updates)
const REVALIDATE_TIME = 60;

// Generic fetch function with caching and draft mode support
// skipCdn: bypass Sanity CDN for singleton settings that must be fresh
async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
  options: { skipCdn?: boolean } = {}
): Promise<T> {
  const { isEnabled: isDraftMode } = await draftMode();
  const isDevelopment = process.env.NODE_ENV === "development";

  // In draft mode OR development, use preview client to see draft documents
  if (isDraftMode || isDevelopment) {
    return previewClient.fetch<T>(query, params);
  }

  // Use noCdnClient for singleton settings that must always be fresh
  const fetchClient = options.skipCdn ? noCdnClient : client;

  // In production mode, use client with caching
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
    const result = await sanityFetch<SanityEvent[]>(eventsQuery, {}, ["events"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch events from Sanity:", error);
    return [];
  }
}

// For static generation (no draft mode check - used in generateStaticParams)
export async function getEventsForStaticGeneration(): Promise<SanityEvent[]> {
  try {
    const result = await client.fetch<SanityEvent[]>(eventsQuery, {}, {
      next: {
        revalidate: REVALIDATE_TIME,
        tags: ["sanity", "events"],
      },
    });
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch events for static generation:", error);
    return [];
  }
}

export async function getFeaturedEvents(): Promise<SanityEvent[]> {
  try {
    const result = await sanityFetch<SanityEvent[]>(featuredEventsQuery, {}, ["events"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured events from Sanity:", error);
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

export async function getFeaturedAnnouncements(): Promise<SanityAnnouncement[]> {
  try {
    const result = await sanityFetch<SanityAnnouncement[]>(featuredAnnouncementsQuery, {}, ["announcements"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch featured announcements from Sanity:", error);
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
    const result = await sanityFetch<SanityProgram[]>(programsQuery, {}, ["programs"]);
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
// Donate Modal Settings
// ============================================

// Internal type that includes active field for filtering
interface ModalCampaignWithActive extends ModalCampaign {
  active?: boolean;
}

interface DonateModalSettingsRaw {
  _id: string;
  modalTitle?: string;
  showGoalMeter?: boolean;
  featuredCampaign?: ModalCampaignWithActive | null;
  additionalCampaigns?: ModalCampaignWithActive[];
}

export async function getDonateModalSettings(): Promise<DonateModalSettings | null> {
  try {
    const result = await sanityFetch<DonateModalSettingsRaw | null>(
      donateModalSettingsQuery,
      {},
      ["donateModalSettings"],
      { skipCdn: true }
    );

    if (!result) return null;

    // Filter out inactive campaigns
    return {
      _id: result._id,
      modalTitle: result.modalTitle,
      showGoalMeter: result.showGoalMeter,
      featuredCampaign: result.featuredCampaign && result.featuredCampaign.active !== false
        ? {
            _id: result.featuredCampaign._id,
            title: result.featuredCampaign.title,
            fundraiseUpElement: result.featuredCampaign.fundraiseUpElement,
          }
        : null,
      additionalCampaigns: (result.additionalCampaigns || [])
        .filter((c) => c.active !== false)
        .map((c) => ({
          _id: c._id,
          title: c.title,
          fundraiseUpElement: c.fundraiseUpElement,
        })),
    };
  } catch (error) {
    console.error("Failed to fetch donate modal settings from Sanity:", error);
    return null;
  }
}

// ============================================
// Donation Goal Meter
// ============================================

export interface DonationGoalMeter {
  _id: string;
  enabled: boolean;
  fundraiseUpElement?: string;
}

export async function getDonationGoalMeter(): Promise<DonationGoalMeter | null> {
  try {
    const result = await sanityFetch<DonationGoalMeter | null>(
      donationGoalMeterQuery,
      {},
      ["donationGoalMeter"],
      { skipCdn: true }
    );
    return result;
  } catch (error) {
    console.error("Failed to fetch donation goal meter from Sanity:", error);
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

// Tour Types
export async function getTourTypes(): Promise<SanityTourType[]> {
  try {
    const result = await sanityFetch<SanityTourType[]>(tourTypesQuery, {}, ["tourTypes"]);
    return result ?? [];
  } catch (error) {
    console.error("Failed to fetch tour types from Sanity:", error);
    return [];
  }
}

// ============================================
// NEW: Team Members
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

export interface LatestUpdatesResult {
  announcements: LatestUpdateItem[];
  events: LatestUpdateItem[];
  campaigns: LatestUpdateItem[];
}

export async function getLatestUpdates(): Promise<LatestUpdatesResult> {
  try {
    const result = await sanityFetch<LatestUpdatesResult>(latestUpdatesQuery, {}, ["announcements", "events"]);
    return result ?? { announcements: [], events: [], campaigns: [] };
  } catch (error) {
    console.error("Failed to fetch latest updates from Sanity:", error);
    return { announcements: [], events: [], campaigns: [] };
  }
}

