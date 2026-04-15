/**
 * Events Listing Page
 *
 * Server component that fetches all events from Sanity and passes them
 * to the EventsContent client component for filtering, sorting, and
 * display in grid or list view.
 *
 * @route /events
 * @module app/events/page
 */
import type { Metadata } from "next";
import { getEvents, getEventsPageSettings } from "@/sanity/lib/fetch";
import { SanityEvent } from "@/types/sanity";
import EventsContent from "./EventsContent";

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
  const [events, settings] = await Promise.all([
    getEvents() as Promise<SanityEvent[]>,
    getEventsPageSettings(),
  ]);

  return <EventsContent events={events} pageSettings={settings} />;
}
