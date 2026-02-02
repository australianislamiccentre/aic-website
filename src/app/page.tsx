import { HeroSection } from "@/components/sections/HeroSection";
import { QuickAccessSection } from "@/components/sections/QuickAccessSection";
import { QuickDonateSection } from "@/components/sections/QuickDonateSection";
import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { UpcomingSection } from "@/components/sections/UpcomingSection";
import { MediaHighlightSection } from "@/components/sections/MediaHighlightSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { getEvents, getUrgentAnnouncements, getServices, getPrayerSettings, getLatestUpdates, getPrograms } from "@/sanity/lib/fetch";
import { SanityEvent, SanityAnnouncement, SanityService, SanityPrayerSettings, SanityProgram } from "@/types/sanity";

export default async function HomePage() {
  // Fetch content from Sanity - single source of truth
  const [allEvents, urgentAnnouncements, services, prayerSettings, latestUpdates, programs] = await Promise.all([
    getEvents() as Promise<SanityEvent[]>,
    getUrgentAnnouncements() as Promise<SanityAnnouncement[]>,
    getServices() as Promise<SanityService[]>,
    getPrayerSettings() as Promise<SanityPrayerSettings | null>,
    getLatestUpdates(),
    getPrograms() as Promise<SanityProgram[]>,
  ]);

  // Get the first urgent announcement for the banner (if any)
  const urgentAnnouncement = urgentAnnouncements.length > 0 ? urgentAnnouncements[0] : null;

  return (
    <>
      <HeroSection prayerSettings={prayerSettings} />
      <QuickAccessSection />
      <LatestUpdatesSection
        announcements={latestUpdates.announcements}
        events={[]} // Events show in UpcomingSection now
        campaigns={latestUpdates.campaigns}
        urgentAnnouncement={urgentAnnouncement}
      />
      <QuickDonateSection />
      <UpcomingSection events={allEvents} programs={programs} />
      <MediaHighlightSection />
      <AboutPreviewSection />
      <ServicesSection services={services} />
    </>
  );
}
