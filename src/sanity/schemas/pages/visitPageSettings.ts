import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "visitPageSettings",
  title: "Visit Page",
  type: "document",
  fields: [
    // ── Page Header ──
    defineField({ name: "heroHeading", title: "Page Heading", type: "string", description: "Main page heading (e.g. 'Visit Us')", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Heading Accent", type: "string", description: "Word(s) shown in teal colour" }),
    defineField({ name: "heroDescription", title: "Page Description", type: "text", rows: 3 }),

    // ── Visiting Information Section ──
    defineField({ name: "visitingInfoVisible", title: "Show Visiting Information Section", type: "boolean", initialValue: true }),
    defineField({ name: "visitingInfoImage", title: "Visiting Info Image", type: "image", options: { hotspot: true }, description: "Left column image in the visiting information section. Recommended: 600×500px." }),
    defineField({ name: "visitingInfoHeading", title: "Visiting Info Heading", type: "string", description: "Section heading (e.g. 'Visiting Information')" }),
    defineField({ name: "visitingHours", title: "Operating Hours", type: "string", description: "Hours shown in the visiting information section (e.g. '4:30 AM – 10:30 PM Daily')" }),

    // ── Facilities Section ──
    defineField({ name: "facilitiesVisible", title: "Show Facilities Section", type: "boolean", initialValue: true }),
    defineField({ name: "facilitiesHeading", title: "Facilities Heading", type: "string" }),
    defineField({ name: "facilitiesDescription", title: "Facilities Description", type: "text", rows: 2 }),
    defineField({
      name: "facilitiesCards",
      title: "Facility Cards",
      type: "array",
      description: "Facility cards (e.g. 'Main Prayer Hall – Capacity: 1,000+'). Max 8.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "name", title: "Facility Name", type: "string" }),
          defineField({ name: "capacity", title: "Capacity", type: "string", description: "e.g. '1,000+'" }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Users", "GraduationCap", "Building", "BookOpen", "Heart"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "name", subtitle: "capacity" } },
      }],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({ name: "facilitiesImage", title: "Facilities Section Image", type: "image", options: { hotspot: true } }),

    // ── Mosque Manners Section ──
    defineField({ name: "mannersVisible", title: "Show Mosque Manners Section", type: "boolean", initialValue: true }),
    defineField({ name: "mannersBadge", title: "Manners Section Badge", type: "string", description: "Badge text (e.g. 'Visitor Guidelines')" }),
    defineField({ name: "mannersHeading", title: "Manners Heading", type: "string" }),
    defineField({ name: "mannersDescription", title: "Manners Description", type: "text", rows: 2 }),
    defineField({
      name: "etiquetteItems",
      title: "Etiquette Items",
      type: "array",
      description: "Visitor etiquette guidelines shown on this page",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Footprints", "VolumeX", "Shirt", "Heart", "Hand", "Droplets", "CameraOff", "Clock"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "title" } },
      }],
    }),

    // ── FAQ Section ──
    defineField({ name: "faqVisible", title: "Show FAQ Section", type: "boolean", initialValue: true }),
    defineField({ name: "faqBadge", title: "FAQ Badge", type: "string" }),
    defineField({ name: "faqHeading", title: "FAQ Heading", type: "string" }),
    defineField({
      name: "faqItems",
      title: "FAQ Items",
      type: "array",
      description: "Frequently asked questions for visitors",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "question", title: "Question", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "answer", title: "Answer", type: "array", of: [{ type: "block" }] }),
        ],
        preview: { select: { title: "question" } },
      }],
    }),

    // ── CTA Section ──
    defineField({ name: "ctaVisible", title: "Show CTA Section", type: "boolean", initialValue: true }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({
      name: "ctaButtons",
      title: "CTA Buttons",
      type: "array",
      description: "Buttons shown in the CTA section. Max 2.",
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
  preview: { prepare: () => ({ title: "Visit Page" }) },
});
