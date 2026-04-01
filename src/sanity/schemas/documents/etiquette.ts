/**
 * Sanity Schema: Mosque Etiquette
 *
 * Content type for mosque etiquette guidelines. Each guideline has a
 * title, description, a selectable Lucide icon (e.g. Footprints,
 * VolumeX, Shirt), and display order. Shown on the /visit page to
 * help visitors understand mosque conduct expectations.
 *
 * @module sanity/schemas/etiquette
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "etiquette",
  title: "Mosque Etiquette",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "Shoe", value: "Footprints" },
          { title: "Volume Off", value: "VolumeX" },
          { title: "Camera Off", value: "CameraOff" },
          { title: "Shirt", value: "Shirt" },
          { title: "Heart", value: "Heart" },
          { title: "Users", value: "Users" },
          { title: "Clock", value: "Clock" },
          { title: "Hand", value: "Hand" },
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
