import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "termsPageSettings",
  title: "Terms of Use Page",
  type: "document",
  fields: [
    // ── Page Header ──
    defineField({ name: "heading", title: "Page Heading", type: "string", description: "Page heading (e.g. 'Terms of Use')", validation: (Rule) => Rule.required() }),
    defineField({ name: "lastUpdated", title: "Last Updated", type: "date", description: "Date shown as 'Last updated' below the heading. Use Melbourne time (AEST/AEDT)." }),

    // ── Page Content ──
    defineField({
      name: "content",
      title: "Page Content",
      type: "array",
      description: "Full terms of use content. Use Heading 2 for section headings.",
      of: [{
        type: "block",
        styles: [
          { title: "Normal", value: "normal" },
          { title: "Heading 2", value: "h2" },
          { title: "Heading 3", value: "h3" },
        ],
        marks: {
          decorators: [
            { title: "Bold", value: "strong" },
            { title: "Italic", value: "em" },
          ],
          annotations: [{
            name: "link",
            type: "object",
            title: "Link",
            fields: [{ name: "href", type: "url", title: "URL" }],
          }],
        },
      }],
    }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Terms of Use Page" }) },
});
