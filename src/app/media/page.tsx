/**
 * Media Page
 *
 * Server component that fetches gallery images from Sanity and YouTube
 * videos from the channel API, then passes both to the MediaContent
 * client component for tabbed photo/video display.
 *
 * @route /media
 * @module app/media/page
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { getMediaGallery, getMediaPageSettings } from "@/sanity/lib/fetch";
import { getYouTubeVideos, getYouTubeLiveStream, getYouTubePlaylists } from "@/lib/youtube";
import MediaContent from "./MediaContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getMediaPageSettings();
  return {
    title: settings?.seo?.title ?? "Media Gallery | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Photos and videos from the Australian Islamic Centre community.",
  };
}

export default async function MediaPage() {
  const [mediaGalleryImages, youtubeVideos, liveStream, playlists, settings] = await Promise.all([
    getMediaGallery(),
    getYouTubeVideos(12),
    getYouTubeLiveStream(),
    getYouTubePlaylists(),
    getMediaPageSettings(),
  ]);

  return (
    <Suspense>
      <MediaContent
        mediaGalleryImages={mediaGalleryImages}
        youtubeVideos={youtubeVideos}
        liveStream={liveStream}
        playlists={playlists}
        pageSettings={settings}
      />
    </Suspense>
  );
}
