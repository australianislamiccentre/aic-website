import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "imamsPageSettings",
  title: "Imams Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroHeading", title: "Page Heading", type: "string", description: "Page heading (e.g. 'Our Imams')", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Heading Accent", type: "string" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3 }),

    // ── Imams List Section ──
    defineField({ name: "imamsSectionHeading", title: "Imams Section Heading", type: "string", description: "Heading for the imams list section (e.g. 'Meet Our Religious Leaders')" }),
    defineField({ name: "imamsSectionDescription", title: "Imams Section Description", type: "text", rows: 3, description: "Section intro text" }),

    // ── Services Offered Section ──
    defineField({ name: "servicesOfferedVisible", title: "Show Services Offered Section", type: "boolean", initialValue: true, description: "Toggle to show/hide Services Offered section" }),
    defineField({ name: "servicesOfferedHeading", title: "Services Offered Heading", type: "string", description: "Section heading (e.g. 'Services Offered by Our Imams')" }),
    defineField({
      name: "servicesOfferedCards",
      title: "Services Offered Cards",
      type: "array",
      description: "Service cards shown in this section",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["BookOpen", "Heart", "Users", "GraduationCap", "Star", "HandHeart"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "title" } },
      }],
      validation: (Rule) => Rule.max(6),
    }),

    // ── CTA Section ──
    defineField({ name: "ctaVisible", title: "Show CTA Section", type: "boolean", initialValue: true }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({
      name: "ctaButtons",
      title: "CTA Buttons",
      type: "array",
      description: "CTA buttons",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label", type: "string" }),
          defineField({ name: "url", title: "URL", type: "string" }),
          defineField({ name: "variant", title: "Variant", type: "string", options: { list: ["primary", "outline"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "label" } },
      }],
      validation: (Rule) => Rule.max(2),
    }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Imams Page" }) },
});
