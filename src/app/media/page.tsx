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
import { getMediaGallery } from "@/sanity/lib/fetch";
import { getYouTubeVideos, getYouTubeLiveStream, getYouTubePlaylists } from "@/lib/youtube";
import MediaContent from "./MediaContent";

export const metadata = {
  title: "Media Gallery | Australian Islamic Centre",
  description: "Photos and videos from the Australian Islamic Centre community.",
};

export default async function MediaPage() {
  const [mediaGalleryImages, youtubeVideos, liveStream, playlists] = await Promise.all([
    getMediaGallery(),
    getYouTubeVideos(12),
    getYouTubeLiveStream(),
    getYouTubePlaylists(),
  ]);

  return (
    <MediaContent
      mediaGalleryImages={mediaGalleryImages}
      youtubeVideos={youtubeVideos}
      liveStream={liveStream}
      playlists={playlists}
    />
  );
}
