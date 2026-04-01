import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "resourcesPageSettings",
  title: "Resources Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge text (e.g. 'Knowledge Hub')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3 }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Resources Page" }) },
});
