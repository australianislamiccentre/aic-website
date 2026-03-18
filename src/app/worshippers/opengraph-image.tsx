import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Worshippers — Australian Islamic Centre";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Worshippers",
    subtitle: "Prayer times, Friday sermons, and worship services",
  });
}
