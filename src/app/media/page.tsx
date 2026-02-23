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
import { getGalleryImages } from "@/sanity/lib/fetch";
import { SanityGalleryImage } from "@/types/sanity";
import { getYouTubeVideos } from "@/lib/youtube";
import MediaContent from "./MediaContent";

export const metadata = {
  title: "Media Gallery | Australian Islamic Centre",
  description: "Photos and videos from the Australian Islamic Centre community.",
};

export default async function MediaPage() {
  const [galleryImages, youtubeVideos] = await Promise.all([
    getGalleryImages() as Promise<SanityGalleryImage[]>,
    getYouTubeVideos(),
  ]);

  return <MediaContent galleryImages={galleryImages} youtubeVideos={youtubeVideos} />;
}
