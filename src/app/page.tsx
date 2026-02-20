import { HeroSection } from "@/components/sections/HeroSection";
import { QuickAccessSection } from "@/components/sections/QuickAccessSection";
import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { WhatsOnSection } from "@/components/sections/WhatsOnSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { MeetImamsSection } from "@/components/sections/MeetImamsSection";
import { GalleryStripSection } from "@/components/sections/GalleryStripSection";
import { MediaHighlightSection } from "@/components/sections/MediaHighlightSection";
import {
  getEvents,
  getUrgentAnnouncements,
  getServices,
  getPrayerSettings,
  getLatestUpdates,
  getPrograms,
  getTeamMembersByCategory,
  getFeaturedGalleryImages,
} from "@/sanity/lib/fetch";
import type { LatestUpdatesResult } from "@/sanity/lib/fetch";
import {
  SanityEvent,
  SanityAnnouncement,
  SanityService,
  SanityPrayerSettings,
  SanityProgram,
  SanityTeamMember,
  SanityGalleryImage,
} from "@/types/sanity";

export default async function HomePage() {
  // Fetch all content from Sanity in parallel using allSettled for resilience
  // Each individual fetch already has try/catch returning defaults,
  // but allSettled adds a safety net for unexpected network-level errors.
  const results = await Promise.allSettled([
    getEvents(),
    getUrgentAnnouncements(),
    getServices(),
    getPrayerSettings(),
    getLatestUpdates(),
    getPrograms(),
    getTeamMembersByCategory("imam"),
    getFeaturedGalleryImages(),
  ]);

  // Extract values with safe defaults
  const allEvents = results[0].status === "fulfilled" ? (results[0].value as SanityEvent[]) : [];
  const urgentAnnouncements = results[1].status === "fulfilled" ? (results[1].value as SanityAnnouncement[]) : [];
  const services = results[2].status === "fulfilled" ? (results[2].value as SanityService[]) : [];
  const prayerSettings = results[3].status === "fulfilled" ? (results[3].value as SanityPrayerSettings | null) : null;
  const latestUpdates = results[4].status === "fulfilled" ? (results[4].value as LatestUpdatesResult) : { announcements: [], events: [], campaigns: [] };
  const programs = results[5].status === "fulfilled" ? (results[5].value as SanityProgram[]) : [];
  const imams = results[6].status === "fulfilled" ? (results[6].value as SanityTeamMember[]) : [];
  const galleryImages = results[7].status === "fulfilled" ? (results[7].value as SanityGalleryImage[]) : [];

  // Get the first urgent announcement for the banner (if any)
  const urgentAnnouncement = urgentAnnouncements.length > 0 ? urgentAnnouncements[0] : null;

  return (
    <>
      {/* 1. Hero: Prayer times + carousel */}
      <HeroSection prayerSettings={prayerSettings} />

      {/* 2. Quick Access: Fast navigation for worshippers/visitors/community */}
      <QuickAccessSection />

      {/* 3. Latest Updates: Announcements + urgent banner */}
      <LatestUpdatesSection
        announcements={latestUpdates.announcements}
        events={[]}
        urgentAnnouncement={urgentAnnouncement}
      />

      {/* 4. What's On: Events, programs, and services at a glance */}
      <WhatsOnSection
        events={allEvents}
        programs={programs}
        services={services}
      />

      {/* 5. About Preview: Who we are + stats */}
      <AboutPreviewSection />

      {/* 6. Meet Our Imams: Spiritual leadership preview */}
      <MeetImamsSection imams={imams} />

      {/* 7. Gallery Strip: Visual life at AIC */}
      <GalleryStripSection images={galleryImages} />

      {/* 8. Media & Social: Featured video + social links */}
      <MediaHighlightSection />
    </>
  );
}
