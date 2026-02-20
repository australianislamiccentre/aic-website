import { getPrayerSettings, getEtiquette } from "@/sanity/lib/fetch";
import type { SanityPrayerSettings, SanityEtiquette } from "@/types/sanity";
import WorshippersClient from "./WorshippersClient";

export default async function WorshippersPage() {
  const [prayerSettings, etiquette] = await Promise.all([
    getPrayerSettings() as Promise<SanityPrayerSettings | null>,
    getEtiquette() as Promise<SanityEtiquette[]>,
  ]);

  return (
    <WorshippersClient
      prayerSettings={prayerSettings}
      etiquette={etiquette}
    />
  );
}
