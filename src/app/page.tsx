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
  getLatestAnnouncements,
  getPrograms,
  getTeamMembersByCategory,
  getFeaturedGalleryImages,
} from "@/sanity/lib/fetch";
import type { LatestUpdateItem } from "@/sanity/lib/fetch";
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
  const results = await Promise.allSettled([
    getEvents(),
    getUrgentAnnouncements(),
    getServices(),
    getPrayerSettings(),
    getLatestAnnouncements(),
    getPrograms(),
    getTeamMembersByCategory("imam"),
    getFeaturedGalleryImages(),
  ]);

  const allEvents = results[0].status === "fulfilled" ? (results[0].value as SanityEvent[]) : [];
  const urgentAnnouncements = results[1].status === "fulfilled" ? (results[1].value as SanityAnnouncement[]) : [];
  const services = results[2].status === "fulfilled" ? (results[2].value as SanityService[]) : [];
  const prayerSettings = results[3].status === "fulfilled" ? (results[3].value as SanityPrayerSettings | null) : null;
  const announcements = results[4].status === "fulfilled" ? (results[4].value as LatestUpdateItem[]) : [];
  const programs = results[5].status === "fulfilled" ? (results[5].value as SanityProgram[]) : [];
  const imams = results[6].status === "fulfilled" ? (results[6].value as SanityTeamMember[]) : [];
  const galleryImages = results[7].status === "fulfilled" ? (results[7].value as SanityGalleryImage[]) : [];

  const urgentAnnouncement = urgentAnnouncements.length > 0 ? urgentAnnouncements[0] : null;

  return (
    <>
      <HeroSection prayerSettings={prayerSettings} />

      <QuickAccessSection />

      <LatestUpdatesSection
        announcements={announcements}
        urgentAnnouncement={urgentAnnouncement}
      />

      <WhatsOnSection
        events={allEvents}
        programs={programs}
        services={services}
      />

      <AboutPreviewSection />

      <MeetImamsSection imams={imams} />

      <GalleryStripSection images={galleryImages} />

      <MediaHighlightSection />
    </>
  );
}
