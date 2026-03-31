import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "mediaPageSettings",
  title: "Media Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge text (e.g. 'Gallery & Videos')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string" }),
    defineField({ name: "heroDescription", title: "Hero Description", type: "text", rows: 3 }),

    // ── Section Toggles ──
    defineField({ name: "youtubeVisible", title: "Show YouTube Videos Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the YouTube videos section" }),
    defineField({ name: "galleryVisible", title: "Show Photo Gallery Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the photo gallery section" }),
    defineField({ name: "socialVisible", title: "Show Social Media Links Section", type: "boolean", initialValue: true, description: "Toggle to show/hide social media links section" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Media Page" }) },
});
