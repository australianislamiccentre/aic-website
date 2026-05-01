/**
 * Events Listing Page
 *
 * Server component that fetches events + prayer settings, resolves time
 * display strings, and passes augmented data to the client component.
 *
 * @route /events
 * @module app/events/page
 */
import type { Metadata } from "next";
import { getEvents, getEventsPageSettings, getPrayerSettings } from "@/sanity/lib/fetch";
import { formatEventTime } from "@/lib/event-time";
import type { SanityEvent } from "@/types/sanity";
import EventsContent, { type EventForDisplay } from "./EventsContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getEventsPageSettings();
  return {
    title: settings?.seo?.title ?? "Events | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Join us for spiritual gatherings, educational workshops, and community celebrations at the Australian Islamic Centre.",
    alternates: { canonical: "/events" },
  };
}

export default async function EventsPage() {
  const [events, settings, prayerSettings] = await Promise.all([
    getEvents() as Promise<SanityEvent[]>,
    getEventsPageSettings(),
    getPrayerSettings(),
  ]);

  const eventsForDisplay: EventForDisplay[] = events.map((event) => ({
    ...event,
    resolvedTime: formatEventTime(event, prayerSettings),
  }));

  return <EventsContent events={eventsForDisplay} pageSettings={settings} />;
}
