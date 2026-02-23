/**
 * Sanity Schema: FAQ
 *
 * Content type for frequently asked questions. Each entry has a
 * required question string, a rich-text answer (supporting bold,
 * italic, and links), a category for grouping, and display order.
 * Consumed by the /visit page and the /resources page FAQ sections.
 *
 * @module sanity/schemas/faq
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                ],
              },
            ],
          },
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Visiting the Mosque", value: "visiting" },
          { title: "Prayer Times & Services", value: "prayer" },
          { title: "Religious Services", value: "services" },
          { title: "Programs & Education", value: "programs" },
          { title: "Donations & Support", value: "donations" },
          { title: "Facilities & Amenities", value: "facilities" },
          { title: "General", value: "general" },
        ],
        layout: "dropdown",
      },
      initialValue: "general",
    }),
    defineField({
      name: "relatedLinks",
      title: "Related Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            {
              name: "url",
              type: "url",
              title: "URL",
              validation: (Rule) =>
                Rule.uri({
                  allowRelative: true,
                  scheme: ["http", "https", "mailto", "tel"],
                }),
            },
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        },
      ],
      description: "Optional links to relevant pages",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show in homepage FAQ section",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
    }),
  ],
  preview: {
    select: {
      question: "question",
      category: "category",
      featured: "featured",
    },
    prepare({ question, category, featured }) {
      return {
        title: `${featured ? "⭐ " : ""}${question}`,
        subtitle: category,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Category",
      name: "categoryAsc",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
});
