import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "worshippersPageSettings",
  title: "Worshippers Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge text above heading" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string", description: "Teal-coloured word(s)" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3, description: "Paragraph below heading" }),

    // ── Etiquette Section ──
    // Note: Prayer times and Jumu'ah sections are NOT configurable here — they pull from prayerSettings singleton automatically.
    defineField({ name: "etiquetteVisible", title: "Show Mosque Etiquette Section", type: "boolean", initialValue: true, description: "Toggle to show/hide Mosque Etiquette section" }),
    defineField({ name: "etiquetteHeading", title: "Etiquette Section Heading", type: "string", description: "Section heading for mosque etiquette on this page" }),
    defineField({ name: "etiquetteDescription", title: "Etiquette Section Description", type: "text", rows: 3, description: "Section intro text for mosque etiquette" }),
    defineField({
      name: "etiquetteItems",
      title: "Etiquette Items",
      type: "array",
      description: "Etiquette cards shown on this page",
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

    // ── Khutbah Videos Section ──
    defineField({ name: "khutbahVisible", title: "Show Khutbah Videos Section", type: "boolean", initialValue: true, description: "Toggle to show/hide Khutbah Videos section" }),
    defineField({ name: "khutbahHeading", title: "Khutbah Section Heading", type: "string", description: "Section heading (e.g. 'Friday Khutbah Videos')" }),

    // ── CTA Section ──
    defineField({ name: "ctaVisible", title: "Show CTA Section", type: "boolean", initialValue: true, description: "Toggle to show/hide CTA section" }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({ name: "ctaButtonLabel", title: "CTA Button Label", type: "string" }),
    defineField({ name: "ctaButtonUrl", title: "CTA Button Link", type: "string" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Worshippers Page" }) },
});
