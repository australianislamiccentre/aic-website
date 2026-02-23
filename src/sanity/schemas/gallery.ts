/**
 * Sanity Schema: Gallery Image
 *
 * Content type for photo gallery entries. Each image has a required
 * hotspot-enabled image, alt text, optional caption, a category
 * (e.g. Prayer Hall, Architecture, Community, Events, Exterior),
 * and display order. Displayed on the /media page gallery section.
 *
 * @module sanity/schemas/gallery
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "galleryImage",
  title: "Gallery Image",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
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
      description: "Optional caption to display with the image",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Prayer Hall", value: "Prayer Hall" },
          { title: "Architecture", value: "Architecture" },
          { title: "Community", value: "Community" },
          { title: "Events", value: "Events" },
          { title: "Exterior", value: "Exterior" },
          { title: "Interior", value: "Interior" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show on homepage gallery",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
  preview: {
    select: {
      alt: "alt",
      category: "category",
      media: "image",
    },
    prepare({ alt, category, media }) {
      return {
        title: alt,
        subtitle: category,
        media,
      };
    },
  },
});
