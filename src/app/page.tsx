import { HeroSection } from "@/components/sections/HeroSection";
import { QuickAccessSection } from "@/components/sections/QuickAccessSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { AnnouncementsSection } from "@/components/sections/AnnouncementsSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { SocialMediaSection } from "@/components/sections/SocialMediaSection";
import { DonationCTASection } from "@/components/sections/DonationCTASection";
import { getEvents, getFeaturedEvents, getFeaturedAnnouncements, getUrgentAnnouncements, getTestimonials, getServices, getPrograms, getPrayerSettings } from "@/sanity/lib/fetch";
import { SanityEvent, SanityAnnouncement, SanityTestimonial, SanityService, SanityProgram, SanityPrayerSettings } from "@/types/sanity";

export default async function HomePage() {
  // Fetch content from Sanity - single source of truth
  const [featuredEvents, allEvents, featuredAnnouncements, urgentAnnouncements, testimonials, services, programs, prayerSettings] = await Promise.all([
    getFeaturedEvents() as Promise<SanityEvent[]>,
    getEvents() as Promise<SanityEvent[]>,
    getFeaturedAnnouncements() as Promise<SanityAnnouncement[]>,
    getUrgentAnnouncements() as Promise<SanityAnnouncement[]>,
    getTestimonials() as Promise<SanityTestimonial[]>,
    getServices() as Promise<SanityService[]>,
    getPrograms() as Promise<SanityProgram[]>,
    getPrayerSettings() as Promise<SanityPrayerSettings | null>,
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
      <AboutPreviewSection />
      <AnnouncementsSection
        announcements={featuredAnnouncements}
        urgentAnnouncement={urgentAnnouncement}
      />
      <ServicesSection services={services} />
      <EventsSection events={eventsForHomepage} />
      <ProgramsSection programs={programs} />
      <TestimonialsSection testimonials={testimonials} />
      <SocialMediaSection />
      <DonationCTASection />
    </>
  );
}
