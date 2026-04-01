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
import type { Metadata } from "next";
import { getPrayerSettings, getEtiquette, getWorshippersPageSettings } from "@/sanity/lib/fetch";
import { getYouTubeVideos } from "@/lib/youtube";
import type { SanityPrayerSettings, SanityEtiquette } from "@/types/sanity";
import WorshippersClient from "./WorshippersClient";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWorshippersPageSettings();
  return {
    title: settings?.seo?.title ?? "For Worshippers | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Prayer times, mosque etiquette, Jumu'ah services, and khutbah videos for worshippers at the Australian Islamic Centre.",
  };
}

export default async function WorshippersPage() {
  const [prayerSettings, etiquette, youtubeVideos, pageSettings] = await Promise.all([
    getPrayerSettings() as Promise<SanityPrayerSettings | null>,
    getEtiquette() as Promise<SanityEtiquette[]>,
    getYouTubeVideos(4),
    getWorshippersPageSettings(),
  ]);

  return (
    <WorshippersClient
      prayerSettings={prayerSettings}
      etiquette={etiquette}
      youtubeVideos={youtubeVideos}
      pageSettings={pageSettings}
    />
  );
}
