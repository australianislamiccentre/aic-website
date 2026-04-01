import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "servicesPageSettings",
  title: "Services Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge text (e.g. 'Community Support')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Main page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3 }),
    defineField({
      name: "heroCategoryTags",
      title: "Hero Category Tags",
      type: "array",
      description: "Category pills shown below description (e.g. 'Religious Services', 'Counselling')",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true }, description: "Hero image shown on desktop only. Recommended: 1200×600px." }),

    // ── CTA Section ──
    defineField({ name: "ctaVisible", title: "Show CTA Section", type: "boolean", initialValue: true }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({ name: "ctaButtonLabel", title: "CTA Button Label", type: "string" }),
    defineField({ name: "ctaButtonUrl", title: "CTA Button Link", type: "string" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Services Page" }) },
});
