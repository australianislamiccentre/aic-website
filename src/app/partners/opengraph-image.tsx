import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Partners — Australian Islamic Centre";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Partners",
    subtitle: "Our affiliated organisations and community partners",
  });
}
