import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Events — Australian Islamic Centre";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Events",
    subtitle: "Upcoming events, programs, and community gatherings",
  });
}
