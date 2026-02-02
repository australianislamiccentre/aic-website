import { HeroSection } from "@/components/sections/HeroSection";
import { QuickAccessSection } from "@/components/sections/QuickAccessSection";
import { DonationCTASection } from "@/components/sections/DonationCTASection";
import { LatestUpdatesSection } from "@/components/sections/LatestUpdatesSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { getEvents, getFeaturedEvents, getUrgentAnnouncements, getServices, getPrayerSettings, getLatestUpdates } from "@/sanity/lib/fetch";
import { SanityEvent, SanityAnnouncement, SanityService, SanityPrayerSettings } from "@/types/sanity";

export default async function HomePage() {
  // Fetch content from Sanity - single source of truth
  const [featuredEvents, allEvents, urgentAnnouncements, services, prayerSettings, latestUpdates] = await Promise.all([
    getFeaturedEvents() as Promise<SanityEvent[]>,
    getEvents() as Promise<SanityEvent[]>,
    getUrgentAnnouncements() as Promise<SanityAnnouncement[]>,
    getServices() as Promise<SanityService[]>,
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
      <QuickAccessSection />
      <DonationCTASection />
      <LatestUpdatesSection
        announcements={latestUpdates.announcements}
        events={latestUpdates.events}
        campaigns={latestUpdates.campaigns}
        urgentAnnouncement={urgentAnnouncement}
      />
      <EventsSection events={eventsForHomepage} />
      <AboutPreviewSection />
      <ServicesSection services={services} />
    </>
  );
}
