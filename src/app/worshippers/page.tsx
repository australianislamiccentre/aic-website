import { getPrayerSettings, getEtiquette, getServices, getEvents } from "@/sanity/lib/fetch";
import type { SanityPrayerSettings, SanityEtiquette, SanityService, SanityEvent } from "@/types/sanity";
import WorshippersClient from "./WorshippersClient";

export default async function WorshippersPage() {
  const [prayerSettings, etiquette, services, events] = await Promise.all([
    getPrayerSettings() as Promise<SanityPrayerSettings | null>,
    getEtiquette() as Promise<SanityEtiquette[]>,
    getServices() as Promise<SanityService[]>,
    getEvents() as Promise<SanityEvent[]>,
  ]);

  return (
    <WorshippersClient
      prayerSettings={prayerSettings}
      etiquette={etiquette}
      services={services}
      events={events}
    />
  );
}
