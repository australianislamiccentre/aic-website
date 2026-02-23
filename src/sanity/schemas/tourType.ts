/**
 * Sanity Schema: Tour Type
 *
 * Content type for the different tour options offered by the mosque.
 * Each tour type has a title, slug, description, selectable Lucide
 * icon, and display order. Referenced by the tourRequest schema and
 * displayed on the /visit page tour booking section.
 *
 * @module sanity/schemas/tourType
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "tourType",
  title: "Tour Type",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "Building", value: "Building2" },
          { title: "Graduation Cap", value: "GraduationCap" },
          { title: "Users", value: "Users" },
          { title: "Info", value: "Info" },
          { title: "Camera", value: "Camera" },
          { title: "Map", value: "Map" },
        ],
      },
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: "e.g., 45 minutes, 1 hour",
    }),
    defineField({
      name: "groupSize",
      title: "Group Size",
      type: "string",
      description: "e.g., Up to 30 people",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
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
      media: "image",
    },
  },
});
