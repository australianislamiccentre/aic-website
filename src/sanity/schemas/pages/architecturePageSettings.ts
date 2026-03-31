import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "architecturePageSettings",
  title: "Architecture Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge above heading (e.g. 'Award-Winning Design')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Main page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string", description: "Word(s) shown in teal colour" }),
    defineField({ name: "heroContent", title: "Hero Content", type: "array", of: [{ type: "block" }], description: "Description paragraphs in the hero section" }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true }, description: "Hero section image. Recommended: 1200×600px." }),
    defineField({ name: "heroImageBadge", title: "Hero Image Badge", type: "string", description: "Text on floating badge over hero image (e.g. 'World Architecture Festival Winner 2017')" }),

    // ── Design Philosophy Section ──
    defineField({ name: "philosophyVisible", title: "Show Design Philosophy Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the Design Philosophy section" }),
    defineField({ name: "philosophyBadge", title: "Philosophy Badge", type: "string", description: "Badge text above the philosophy section (e.g. 'Design Philosophy')" }),
    defineField({ name: "philosophyContent", title: "Philosophy Content", type: "array", of: [{ type: "block" }], description: "Body text for the Design Philosophy section" }),
    defineField({ name: "philosophyImages", title: "Philosophy Images", type: "array", of: [{ type: "image", options: { hotspot: true } }], description: "Architecture detail images. Max 2.", validation: (Rule) => Rule.max(2) }),

    // ── Architectural Features Section ──
    defineField({ name: "featuresVisible", title: "Show Architectural Features Section", type: "boolean", initialValue: true }),
    defineField({ name: "featuresHeading", title: "Features Heading", type: "string", description: "Section heading (e.g. 'Architectural Features')" }),
    defineField({
      name: "featuresCards",
      title: "Feature Cards",
      type: "array",
      description: "Feature cards (e.g. 'Natural Light Design'). Max 6.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Sun", "Compass", "Wind", "Droplet", "Sparkles", "Building"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "title" } },
      }],
      validation: (Rule) => Rule.max(6),
    }),

    // ── Gallery Section ──
    defineField({ name: "galleryVisible", title: "Show Gallery Section", type: "boolean", initialValue: true }),
    defineField({ name: "galleryHeading", title: "Gallery Heading", type: "string" }),
    defineField({ name: "galleryDescription", title: "Gallery Description", type: "text", rows: 2 }),
    defineField({
      name: "galleryImages",
      title: "Gallery Images",
      type: "array",
      description: "Images shown in the architecture gallery grid",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
          defineField({ name: "alt", title: "Alt Text", type: "string", description: "Describe the image for screen readers" }),
          defineField({ name: "caption", title: "Caption", type: "string" }),
        ],
        preview: { select: { title: "alt", media: "image" } },
      }],
    }),

    // ── Awards Section ──
    defineField({ name: "awardsVisible", title: "Show Awards Section", type: "boolean", initialValue: true }),
    defineField({ name: "awardsBadge", title: "Awards Badge", type: "string", description: "Badge text (e.g. 'Recognition')" }),
    defineField({ name: "awardsHeading", title: "Awards Heading", type: "string" }),
    defineField({
      name: "awardsCards",
      title: "Award Cards",
      type: "array",
      description: "Individual award entries. Max 4.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "year", title: "Year", type: "string" }),
          defineField({ name: "title", title: "Award Title", type: "string" }),
          defineField({ name: "organization", title: "Organisation", type: "string" }),
          defineField({ name: "category", title: "Category", type: "string" }),
        ],
        preview: { select: { title: "title", subtitle: "year" } },
      }],
      validation: (Rule) => Rule.max(4),
    }),

    // ── Architect Quote Section ──
    defineField({ name: "quoteVisible", title: "Show Architect Quote Section", type: "boolean", initialValue: true }),
    defineField({ name: "quoteText", title: "Quote Text", type: "text", rows: 4, description: "The blockquote from Glenn Murcutt" }),
    defineField({ name: "quoteAttribution", title: "Quote Attribution", type: "string", description: "Author name and title (e.g. 'Glenn Murcutt AO, Pritzker Prize Laureate')" }),

    // ── Visit CTA Section ──
    defineField({ name: "ctaVisible", title: "Show Visit CTA Section", type: "boolean", initialValue: true }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({ name: "ctaButtonLabel", title: "CTA Button Label", type: "string" }),
    defineField({ name: "ctaButtonUrl", title: "CTA Button Link", type: "string" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Architecture Page" }) },
});
