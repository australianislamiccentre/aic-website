import { HeroSection } from "@/components/sections/HeroSection";
import { QuickAccessSection } from "@/components/sections/QuickAccessSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { SocialMediaSection } from "@/components/sections/SocialMediaSection";
import { DonationCTASection } from "@/components/sections/DonationCTASection";
import { getEvents, getFeaturedEvents, getUrgentAnnouncements, getServices, getPrograms, getPrayerSettings, getLatestUpdates } from "@/sanity/lib/fetch";
import { SanityEvent, SanityAnnouncement, SanityService, SanityProgram, SanityPrayerSettings } from "@/types/sanity";

export default async function HomePage() {
  // Fetch content from Sanity - single source of truth
  const [featuredEvents, allEvents, urgentAnnouncements, services, programs, prayerSettings, latestUpdates] = await Promise.all([
    getFeaturedEvents() as Promise<SanityEvent[]>,
    getEvents() as Promise<SanityEvent[]>,
    getUrgentAnnouncements() as Promise<SanityAnnouncement[]>,
    getServices() as Promise<SanityService[]>,
    getPrograms() as Promise<SanityProgram[]>,
    getPrayerSettings() as Promise<SanityPrayerSettings | null>,
    getLatestUpdates(),
  ]);

  // Use featured events if available, otherwise use first few from all events
  const eventsForHomepage = featuredEvents.length > 0
    ? featuredEvents
    : allEvents.slice(0, 5);

  // Get the first urgent announcement for the banner (if any)
  const urgentAnnouncement = urgentAnnouncements.length > 0 ? urgentAnnouncements[0] : null;

  return (
    <>
      <HeroSection prayerSettings={prayerSettings} />
      <LatestUpdatesSection
        announcements={latestUpdates.announcements}
        events={latestUpdates.events}
        campaigns={latestUpdates.campaigns}
        urgentAnnouncement={urgentAnnouncement}
      />
      <QuickAccessSection />
      <AboutPreviewSection />
      <ServicesSection services={services} />
      <EventsSection events={eventsForHomepage} />
      <ProgramsSection programs={programs} />
      <SocialMediaSection />
      <DonationCTASection />
    </>
  );
}
