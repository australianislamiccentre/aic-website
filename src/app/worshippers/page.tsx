import { getPrayerSettings } from "@/sanity/lib/fetch";
import { SanityPrayerSettings } from "@/types/sanity";
import WorshippersClient from "./WorshippersClient";

export default async function WorshippersPage() {
  const prayerSettings = await getPrayerSettings() as SanityPrayerSettings | null;

  return <WorshippersClient prayerSettings={prayerSettings} />;
}
