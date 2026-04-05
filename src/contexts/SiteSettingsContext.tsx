/**
 * Site Settings Context
 *
 * Provides organisation-wide data (name, address, phone, social links, etc.)
 * to every client component via React Context. Data comes from the Sanity
 * `siteSettings` singleton, with hardcoded fallbacks in `aicInfo` for every
 * field. This means the site always renders — even if Sanity is empty or down.
 *
 * Usage:
 * ```tsx
 * const { name, phone, socialMedia } = useSiteSettings();
 * ```
 *
 * @module contexts/SiteSettingsContext
 * @see src/data/content.ts — hardcoded fallback data (`aicInfo`)
 * @see src/types/sanity.ts  — SanitySiteSettings type from CMS
 */
"use client";

import { createContext, useContext } from "react";
import type { SanitySiteSettings, SanityHeaderSettings, SanityFooterSettings } from "@/types/sanity";
import { aicInfo } from "@/data/content";

/** Unified shape with guaranteed (non-optional) fields for all site info. */
/** A custom page with showInNav enabled, used to inject dynamic nav items. */
export interface CustomNavPage {
  title: string;
  slug: string;
  navLabel?: string;
}

export interface SiteInfo {
  name: string;
  shortName: string;
  tagline: string;
  parentOrganization: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    full: string;
  };
  phone: string;
  email: string;
  googleMapsUrl?: string;
  operatingHours: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  externalLinks: {
    college: string;
    bookstore: string;
    newportStorm: string;
  };
  /** Custom pages with showInNav enabled, sorted by navOrder. */
  customNavPages: CustomNavPage[];
  headerSettings: SanityHeaderSettings | null;
  footerSettings: SanityFooterSettings | null;
}

/**
 * Merges Sanity siteSettings with hardcoded aicInfo fallbacks.
 * Guarantees all fields are populated even if Sanity returns null/partial data.
 */
export function buildSiteInfo(
  settings: SanitySiteSettings | null,
  customNavPages: CustomNavPage[] = [],
  headerSettings: SanityHeaderSettings | null = null,
  footerSettings: SanityFooterSettings | null = null,
): SiteInfo {
  const addr = settings?.address;
  const street = addr?.street ?? aicInfo.address.street;
  const suburb = addr?.suburb ?? aicInfo.address.suburb;
  const state = addr?.state ?? aicInfo.address.state;
  const postcode = addr?.postcode ?? aicInfo.address.postcode;
  const country = addr?.country ?? aicInfo.address.country;

  return {
    name: settings?.organizationName ?? aicInfo.name,
    shortName: settings?.shortName ?? aicInfo.shortName,
    tagline: settings?.tagline ?? aicInfo.tagline,
    parentOrganization: settings?.parentOrganization ?? aicInfo.parentOrganization,
    address: {
      street,
      suburb,
      state,
      postcode,
      country,
      full: `${street}, ${suburb} ${state} ${postcode}, ${country}`,
    },
    phone: settings?.phone ?? aicInfo.phone,
    email: settings?.email ?? aicInfo.email,
    googleMapsUrl: settings?.googleMapsUrl,
    operatingHours: (typeof settings?.operatingHours === "string"
      ? settings.operatingHours
      : null) ?? "Open Daily from Fajr to Isha",
    socialMedia: {
      facebook: settings?.socialMedia?.facebook ?? aicInfo.socialMedia.facebook,
      instagram: settings?.socialMedia?.instagram ?? aicInfo.socialMedia.instagram,
      youtube: settings?.socialMedia?.youtube ?? aicInfo.socialMedia.youtube,
    },
    externalLinks: {
      college: settings?.externalLinks?.college ?? aicInfo.externalLinks.college,
      bookstore: settings?.externalLinks?.bookstore ?? aicInfo.externalLinks.bookstore,
      newportStorm: settings?.externalLinks?.sportsClub ?? aicInfo.externalLinks.newportStorm,
    },
    customNavPages,
    headerSettings,
    footerSettings,
  };
}

/** Default value uses hardcoded fallbacks only (no Sanity data). */
const SiteSettingsContext = createContext<SiteInfo>(buildSiteInfo(null));

/**
 * Wraps the app tree and provides merged site info to all descendants.
 * Typically rendered once in the root layout with fresh Sanity data.
 */
export function SiteSettingsProvider({
  siteSettings,
  customNavPages,
  headerSettings,
  footerSettings,
  children,
}: {
  siteSettings: SanitySiteSettings | null;
  customNavPages?: CustomNavPage[];
  headerSettings?: SanityHeaderSettings | null;
  footerSettings?: SanityFooterSettings | null;
  children: React.ReactNode;
}) {
  const info = buildSiteInfo(siteSettings, customNavPages, headerSettings ?? null, footerSettings ?? null);
  return (
    <SiteSettingsContext.Provider value={info}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

/** Returns the merged site settings. Must be called inside `SiteSettingsProvider`. */
export function useSiteSettings(): SiteInfo {
  return useContext(SiteSettingsContext);
}
