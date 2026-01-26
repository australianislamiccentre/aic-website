import { getEvents } from "@/sanity/lib/fetch";
import { SanityEvent } from "@/types/sanity";
import { upcomingEvents as fallbackEvents } from "@/data/content";
import EventsContent from "./EventsContent";

export const metadata = {
  title: "Events | Australian Islamic Centre",
  description: "Join us for spiritual gatherings, educational workshops, and community celebrations at the Australian Islamic Centre.",
};

// Convert static fallback data to SanityEvent format and filter past events
const convertToSanityFormat = (events: typeof fallbackEvents): SanityEvent[] => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  return events
    .filter((e) => {
      // Always include recurring events
      if (e.recurring) return true;
      // For non-recurring, only include if date is today or future
      if (!e.date) return true;
      return e.date >= today;
    })
    .map((e, index) => ({
      _id: e.id,
      title: e.title,
      slug: e.id,
      recurring: e.recurring,
      date: e.date || undefined,
      recurringDay: e.recurringDay || undefined,
      time: e.time,
      location: e.location,
      categories: [e.category],
      image: undefined,
      description: e.description,
      featured: false,
      order: index,
    }));
};

export default async function EventsPage() {
  const sanityEvents = (await getEvents()) as SanityEvent[];

  // Use Sanity data if available, otherwise fallback to static data
  const events =
    sanityEvents.length > 0
      ? sanityEvents
      : convertToSanityFormat(fallbackEvents);

  return <EventsContent events={events} />;
}
