/**
 * Sanity Schema: Media Page Gallery
 *
 * Singleton document containing all photos displayed on the /media page.
 * Supports bulk upload — drag-and-drop multiple images into the array.
 * First image in the array is the hero/main image.
 *
 * Uses plain `image` type (not object wrapper) so Sanity supports
 * native multi-file drag-and-drop upload.
 *
 * @module sanity/schemas/mediaGallery
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "mediaGallery",
  title: "Media Page Gallery",
  type: "document",
  description:
    "Photos displayed on the /media page. Upload multiple images at once by dragging them into the images field.",
  fields: [
    defineField({
      name: "images",
      title: "Gallery Images",
      type: "array",
      description:
        "To bulk upload: drag and drop photos directly onto this field. To add one at a time: use the '+ Add Item' button below. The first image will be the main/hero image on the media page.",
      options: { layout: "grid" },
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description: "Describe the image for accessibility (recommended)",
              validation: (Rule) =>
                Rule.warning(
                  "Alt text improves accessibility for screen readers"
                ),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Optional caption displayed in the lightbox",
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      images: "images",
    },
    prepare({ images }) {
      const count = images?.length || 0;
      return {
        title: "Media Page Gallery",
        subtitle: `${count} photo${count !== 1 ? "s" : ""}`,
      };
    },
  },
});
