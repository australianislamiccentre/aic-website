import { getGalleryImages } from "@/sanity/lib/fetch";
import { SanityGalleryImage } from "@/types/sanity";
import MediaContent from "./MediaContent";

export const metadata = {
  title: "News & Media | Australian Islamic Centre",
  description: "Stay updated with the latest news, events, photos, videos, and podcasts from the Australian Islamic Centre community.",
};

export default async function MediaPage() {
  const galleryImages = await getGalleryImages() as SanityGalleryImage[];

  return <MediaContent galleryImages={galleryImages} />;
}
