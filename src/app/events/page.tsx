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
import { getEvents } from "@/sanity/lib/fetch";
import { SanityEvent } from "@/types/sanity";
import EventsContent from "./EventsContent";

export const metadata = {
  title: "Events | Australian Islamic Centre",
  description: "Join us for spiritual gatherings, educational workshops, and community celebrations at the Australian Islamic Centre.",
};

export default async function EventsPage() {
  const events = (await getEvents()) as SanityEvent[];

  return <EventsContent events={events} />;
}
