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
      title: "Card Gradient (listing page)",
      type: "string",
      description: "Gradient used on the partner card on the /partners listing page.",
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
      name: "heroTheme",
      title: "Detail Page Theme",
      type: "string",
      description: "Colour theme for the partner detail page (hero background, highlight cards, CTA band).",
      options: {
        list: [
          { title: "Teal", value: "teal" },
          { title: "Blue", value: "blue" },
          { title: "Green", value: "green" },
          { title: "Purple", value: "purple" },
          { title: "Orange", value: "orange" },
        ],
        layout: "dropdown",
      },
      initialValue: "teal",
    }),
    defineField({
      name: "highlights",
      title: "Highlights (What We Offer)",
      type: "array",
      description: "Four short cards shown on the partner detail page.",
      of: [
        {
          type: "object",
          name: "highlight",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Trophy", value: "trophy" },
                  { title: "Graduation Cap", value: "graduation-cap" },
                  { title: "Book Open", value: "book-open" },
                  { title: "Users", value: "users" },
                  { title: "Heart", value: "heart" },
                  { title: "Calendar", value: "calendar" },
                  { title: "Award", value: "award" },
                  { title: "Building", value: "building" },
                ],
                layout: "dropdown",
              },
              validation: (Rule) => Rule.required(),
            }),
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
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "aboutHeading",
      title: "About Section Heading",
      type: "string",
      description: "e.g. 'About AIC College'. Defaults to 'About {Name}' if empty.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Shown on the about card with a pin icon. e.g. 'Newport, Melbourne'.",
    }),
    defineField({
      name: "ctaHeading",
      title: "CTA Band Heading",
      type: "string",
      description: "Heading of the coloured call-to-action band at the bottom of the page.",
    }),
    defineField({
      name: "ctaDescription",
      title: "CTA Band Description",
      type: "text",
      rows: 2,
      description: "Supporting text inside the CTA band.",
    }),
    defineField({
      name: "ctaButtonLabel",
      title: "CTA Button Label",
      type: "string",
      description: "Label for the CTA button. Defaults to 'Visit Website'.",
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
      media: "coverImage",
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
