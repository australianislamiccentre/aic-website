/**
 * Worshippers Page
 *
 * Server component that fetches mosque etiquette and YouTube khutbah videos,
 * then passes them to the WorshippersClient component. Prayer times are
 * surfaced globally via the PrayerWidget mounted in the root layout.
 *
 * @route /worshippers
 * @module app/worshippers/page
 */
import type { Metadata } from "next";
import { getEtiquette, getWorshippersPageSettings } from "@/sanity/lib/fetch";
import { getYouTubeVideos } from "@/lib/youtube";
import type { SanityEtiquette } from "@/types/sanity";
import WorshippersClient from "./WorshippersClient";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWorshippersPageSettings();
  return {
    title: settings?.seo?.title ?? "For Worshippers | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Mosque etiquette, khutbah videos, and guidance for worshippers at the Australian Islamic Centre.",
  };
}

export default async function WorshippersPage() {
  const [etiquette, youtubeVideos, pageSettings] = await Promise.all([
    getEtiquette() as Promise<SanityEtiquette[]>,
    getYouTubeVideos(4),
    getWorshippersPageSettings(),
  ]);

  return (
    <WorshippersClient
      etiquette={etiquette}
      youtubeVideos={youtubeVideos}
      pageSettings={pageSettings}
    />
  );
}
