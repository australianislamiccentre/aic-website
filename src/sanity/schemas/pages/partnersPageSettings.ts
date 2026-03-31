import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "partnersPageSettings",
  title: "Partners Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge text (e.g. 'Our Network')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3 }),

    // ── CTA Section ──
    defineField({ name: "ctaVisible", title: "Show CTA Section", type: "boolean", initialValue: true }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaHeadingAccent", title: "CTA Heading Accent", type: "string", description: "Teal-coloured word(s) in the CTA heading" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({ name: "ctaButtonLabel", title: "CTA Button Label", type: "string" }),
    defineField({ name: "ctaButtonUrl", title: "CTA Button Link", type: "string" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Partners Page" }) },
});
