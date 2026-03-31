/**
 * Sanity Schema: Partner
 *
 * Affiliated partner organisations such as Newport Storm FC and AIC College.
 * Displayed on the /partners page and optionally on the homepage.
 *
 * @module sanity/schemas/partner
 */
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    orderRankField({ type: "partner" }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Show this partner on the website",
      initialValue: true,
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 3,
      description: "Brief description for the partner card",
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Detailed description for the partner detail page",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description: "Hero/card image for the partner",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "Trophy", value: "trophy" },
          { title: "Graduation Cap", value: "graduation-cap" },
          { title: "Heart", value: "heart" },
          { title: "Users", value: "users" },
          { title: "Building", value: "building" },
          { title: "Handshake", value: "handshake" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "color",
      title: "Accent Color",
      type: "string",
      options: {
        list: [
          { title: "Blue", value: "from-blue-500 to-blue-600" },
          { title: "Teal", value: "from-teal-500 to-teal-600" },
          { title: "Green", value: "from-green-500 to-green-600" },
          { title: "Purple", value: "from-purple-500 to-purple-600" },
          { title: "Orange", value: "from-orange-500 to-orange-600" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show on the homepage",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "shortDescription",
      media: "logo",
    },
  },
  orderings: [
    orderRankOrdering,
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
