/**
 * Homepage
 *
 * Server component serving the landing page. Fetches featured events, urgent
 * announcements, services, prayer settings, programs, team members, and gallery
 * images from Sanity, then renders HeroSection and all homepage content sections.
 *
 * @route /
 * @module app/page
 */
import { HeroSection } from "@/components/sections/HeroSection";
import { QuickAccessSection } from "@/components/sections/QuickAccessSection";
import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { WhatsOnSection } from "@/components/sections/WhatsOnSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { MeetImamsSection } from "@/components/sections/MeetImamsSection";
import { GalleryStripSection } from "@/components/sections/GalleryStripSection";
import { CTABannerSection } from "@/components/sections/CTABannerSection";
import { MediaHighlightSection } from "@/components/sections/MediaHighlightSection";
import {
  getFeaturedEvents,
  getUrgentAnnouncements,
  getFeaturedServices,
  getLatestAnnouncements,
  getPrograms,
  getTeamMembersByCategory,
  getFeaturedGalleryImages,
  getHomepageSettings,
} from "@/sanity/lib/fetch";
import type { LatestUpdateItem } from "@/sanity/lib/fetch";
import {
  SanityEvent,
  SanityAnnouncement,
  SanityService,
  SanityProgram,
  SanityTeamMember,
  SanityGalleryImage,
  SanityHomepageSettings,
} from "@/types/sanity";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const results = await Promise.allSettled([
    getFeaturedEvents(),
    getUrgentAnnouncements(),
    getFeaturedServices(),
    getLatestAnnouncements(),
    getPrograms(),
    getTeamMembersByCategory("imam"),
    getFeaturedGalleryImages(),
    getHomepageSettings(),
  ]);

  const allEvents = results[0].status === "fulfilled" ? (results[0].value as SanityEvent[]) : [];
  const urgentAnnouncements = results[1].status === "fulfilled" ? (results[1].value as SanityAnnouncement[]) : [];
  const services = results[2].status === "fulfilled" ? (results[2].value as SanityService[]) : [];
  const announcements = results[3].status === "fulfilled" ? (results[3].value as LatestUpdateItem[]) : [];
  const programs = results[4].status === "fulfilled" ? (results[4].value as SanityProgram[]) : [];
  const imams = results[5].status === "fulfilled" ? (results[5].value as SanityTeamMember[]) : [];
  const galleryImages = results[6].status === "fulfilled" ? (results[6].value as SanityGalleryImage[]) : [];
  const homepageSettings = results[7].status === "fulfilled" ? (results[7].value as SanityHomepageSettings | null) : null;

  const urgentAnnouncement = urgentAnnouncements.length > 0 ? urgentAnnouncements[0] : null;

  return (
    <>
      <HeroSection
        heroMode={homepageSettings?.heroMode}
        heroVideoUrl={homepageSettings?.heroVideoUrl}
        heroSlides={homepageSettings?.heroSlides}
        heroVideoOverlays={homepageSettings?.heroVideoOverlays}
      />

      <QuickAccessSection
        quickLinksSection={homepageSettings?.quickLinksSection}
      />

      <LatestUpdatesSection
        announcements={announcements}
        urgentAnnouncement={urgentAnnouncement}
      />

      <WhatsOnSection
        events={allEvents}
        programs={programs}
        services={services}
      />

      <AboutPreviewSection welcomeSection={homepageSettings?.welcomeSection} />

      <MeetImamsSection imams={imams} />

      <GalleryStripSection images={galleryImages} />

      <CTABannerSection ctaBanner={homepageSettings?.ctaBanner} />

      <MediaHighlightSection
        featuredYoutubeUrl={homepageSettings?.featuredYoutubeUrl}
      />
    </>
  );
}
