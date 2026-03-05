/**
 * Sanity Schema: Media Page Gallery
 *
 * Singleton document containing all photos displayed on the /media page.
 * Supports bulk upload — drag-and-drop multiple images into the array.
 * First image in the array is the hero/main image.
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
        "Drag and drop multiple images here. The first image will be the main/hero image on the media page.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description: "Describe the image for accessibility",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Optional caption displayed in the lightbox",
            }),
          ],
          preview: {
            select: {
              alt: "alt",
              media: "image",
            },
            prepare({ alt, media }) {
              return { title: alt || "Untitled image", media };
            },
          },
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
