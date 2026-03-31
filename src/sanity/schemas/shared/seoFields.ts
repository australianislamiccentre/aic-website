import { defineField } from "sanity";

/**
 * Reusable SEO field group for page singleton schemas.
 * Spread into any page schema's fields array.
 */
export const seoFields = [
  defineField({
    name: "seo",
    title: "SEO",
    type: "object",
    description: "Search engine optimisation settings for this page.",
    fields: [
      defineField({
        name: "title",
        title: "Meta Title",
        type: "string",
        description:
          "Browser tab title and Google result title. Leave blank to use the page heading.",
        validation: (Rule) => Rule.max(70).warning("Keep under 70 characters for best results."),
      }),
      defineField({
        name: "description",
        title: "Meta Description",
        type: "text",
        rows: 3,
        description:
          "Shown in Google search results. Recommended: 120–160 characters.",
        validation: (Rule) =>
          Rule.max(160)
            .warning("Over 160 characters may be truncated in search results.")
            .custom((val) => {
              if (!val) return "Recommended for search engine visibility — add a description.";
              return true;
            }),
      }),
      defineField({
        name: "image",
        title: "Social Share Image",
        type: "image",
        description: "Shown when this page is shared on Facebook, WhatsApp, etc. Recommended: 1200×630px.",
        options: { hotspot: true },
      }),
    ],
  }),
];
