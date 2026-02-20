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
