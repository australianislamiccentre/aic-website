/**
 * Sanity Image URL Builder
 *
 * Provides helpers to generate optimised image URLs from Sanity image assets.
 * - `urlFor(source)` — Returns an image builder with auto-format (WebP/AVIF).
 *   Use this when you need to chain additional transforms (width, height, crop).
 * - `urlForImage(source)` — Same as urlFor but also adds `.fit("max")` to
 *   constrain the image within its intrinsic dimensions. Use for general display.
 *
 * @module sanity/lib/image
 */
import createImageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../env";

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const urlForImage = (source: any) => {
  if (!source) {
    return null;
  }
  return imageBuilder.image(source).auto("format").fit("max");
};

// Helper function to build image URLs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const urlFor = (source: any) => {
  return imageBuilder.image(source).auto("format");
};
