/**
 * Worshippers Page
 *
 * Server component that fetches prayer settings, mosque etiquette, and
 * YouTube khutbah videos, then passes them to the WorshippersClient
 * component for display of prayer times, Jumuah info, and guidelines.
 *
 * @route /worshippers
 * @module app/worshippers/page
 */
import { getPrayerSettings, getEtiquette } from "@/sanity/lib/fetch";
import { getYouTubeVideos } from "@/lib/youtube";
import type { SanityPrayerSettings, SanityEtiquette } from "@/types/sanity";
import WorshippersClient from "./WorshippersClient";

export default async function WorshippersPage() {
  const [prayerSettings, etiquette, youtubeVideos] = await Promise.all([
    getPrayerSettings() as Promise<SanityPrayerSettings | null>,
    getEtiquette() as Promise<SanityEtiquette[]>,
    getYouTubeVideos(4),
  ]);

  return (
    <WorshippersClient
      prayerSettings={prayerSettings}
      etiquette={etiquette}
      youtubeVideos={youtubeVideos}
    />
  );
}
