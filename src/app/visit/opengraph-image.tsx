import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Visit Us — Australian Islamic Centre";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Visit Us",
    subtitle: "Plan your visit to the Australian Islamic Centre in Newport",
  });
}
