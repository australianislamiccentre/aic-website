import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "announcementsPageSettings",
  title: "Announcements Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge text (e.g. 'Latest News')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Main page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string", description: "Teal-coloured word(s)" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3, description: "Paragraph below heading" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Announcements Page" }) },
});
