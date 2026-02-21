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
