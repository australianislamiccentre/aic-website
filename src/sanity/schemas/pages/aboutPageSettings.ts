import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "aboutPageSettings",
  title: "About Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Small badge above the main heading (e.g. 'Welcome to AIC')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Main page heading (e.g. 'About the Australian Islamic Centre')", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string", description: "Word(s) within the heading shown in teal colour (e.g. 'Australian Islamic Centre')" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3, description: "Paragraph below the heading" }),
    defineField({
      name: "heroStats",
      title: "Hero Stats",
      type: "array",
      description: "Stat cards shown beside the heading (e.g. '40+ Years Serving'). Max 3.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "value", title: "Value", type: "string", description: "e.g. '40+'" }),
          defineField({ name: "label", title: "Label", type: "string", description: "e.g. 'Years Serving'" }),
        ],
        preview: { select: { title: "value", subtitle: "label" } },
      }],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", description: "Large image shown in the hero section. Recommended: 1200×600px minimum.", options: { hotspot: true } }),
    defineField({ name: "heroImageCaption", title: "Hero Image Floating Badge", type: "string", description: "Text on the floating badge over the hero image (e.g. 'Newport, Melbourne')" }),

    // ── Mission & Vision Section ──
    defineField({ name: "missionVisible", title: "Show Mission & Vision Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the Mission & Vision section on the page" }),
    defineField({ name: "missionImage", title: "Mission Image", type: "image", description: "Image shown on the left side of the Mission & Vision section. Recommended: 600×500px.", options: { hotspot: true } }),
    defineField({ name: "missionBadge", title: "Mission Section Badge", type: "string", description: "Small badge above the mission heading (e.g. 'Our Mission & Vision')" }),
    defineField({ name: "missionHeading", title: "Mission Heading", type: "string", description: "Section heading for Mission & Vision" }),
    defineField({ name: "missionContent", title: "Mission Content", type: "array", of: [{ type: "block" }], description: "Body text for the Mission & Vision section" }),
    defineField({ name: "missionButtonLabel", title: "Mission Button Label", type: "string", description: "Button text (e.g. 'Visit Our Centre')" }),
    defineField({ name: "missionButtonUrl", title: "Mission Button Link", type: "string", description: "Where the mission button links to (e.g. '/visit')" }),

    // ── Timeline Section ──
    defineField({ name: "timelineVisible", title: "Show Timeline Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the 'A Legacy of Service' timeline section" }),
    defineField({ name: "timelineHeading", title: "Timeline Heading", type: "string", description: "Section heading (e.g. 'A Legacy of Service')" }),
    defineField({
      name: "timelineItems",
      title: "Timeline Items",
      type: "array",
      description: "Timeline entries in chronological order",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "year", title: "Year / Era", type: "string", description: "e.g. '1970s' or '2016'" }),
          defineField({ name: "title", title: "Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", description: "Lucide icon name (e.g. 'Users', 'Heart', 'Building', 'Globe')", options: { list: ["Users", "Heart", "Lightbulb", "BookOpen", "Building", "Globe", "Star", "Award"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "year", subtitle: "title" } },
      }],
    }),

    // ── Architecture Preview Section ──
    defineField({ name: "architecturePreviewVisible", title: "Show Architecture Preview Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the architecture preview section" }),
    defineField({ name: "architectureHeading", title: "Architecture Section Heading", type: "string", description: "Heading for the architecture preview (e.g. 'An Architectural Masterpiece')" }),
    defineField({ name: "architectureDescription", title: "Architecture Description", type: "text", rows: 3, description: "Description paragraph in the architecture preview section" }),
    defineField({ name: "architectureImages", title: "Architecture Images", type: "array", of: [{ type: "image", options: { hotspot: true } }], description: "Images shown in the architecture preview. Max 3.", validation: (Rule) => Rule.max(3) }),
    defineField({
      name: "architectureFeatures",
      title: "Architecture Feature Cards",
      type: "array",
      description: "Feature cards (e.g. '96 Lanterns'). Max 3.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "string" }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Sun", "Compass", "Droplets", "Wind", "Star"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "title" } },
      }],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({ name: "architectureButtonLabel", title: "Architecture Button Label", type: "string", description: "Button text (e.g. 'Explore Full Architecture Story')" }),
    defineField({ name: "architectureButtonUrl", title: "Architecture Button Link", type: "string", description: "Where the button links to (e.g. '/architecture')" }),

    // ── Values Section ──
    defineField({ name: "valuesVisible", title: "Show Values Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the 'What We Stand For' values section" }),
    defineField({ name: "valuesHeading", title: "Values Section Heading", type: "string", description: "Section heading (e.g. 'What We Stand For')" }),
    defineField({ name: "valuesDescription", title: "Values Description", type: "text", rows: 2, description: "Text below the values heading" }),
    defineField({
      name: "valuesCards",
      title: "Value Cards",
      type: "array",
      description: "Value cards (e.g. Compassion, Knowledge). Max 4.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Heart", "BookOpen", "Users", "Award", "Star", "Globe"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "title" } },
      }],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "valuesButtons",
      title: "Values Section Buttons",
      type: "array",
      description: "CTA buttons at the bottom of the values section. Max 2.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label", type: "string" }),
          defineField({ name: "url", title: "URL", type: "string" }),
          defineField({ name: "variant", title: "Variant", type: "string", options: { list: ["primary", "outline", "ghost"].map(v => ({ title: v, value: v })), layout: "radio" } }),
        ],
        preview: { select: { title: "label" } },
      }],
      validation: (Rule) => Rule.max(2),
    }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
