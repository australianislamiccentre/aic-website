import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "About Us — Australian Islamic Centre";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "About Us",
    subtitle: "Learn about our history, mission, and community impact",
  });
}
