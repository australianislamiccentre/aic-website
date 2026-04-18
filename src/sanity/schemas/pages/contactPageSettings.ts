import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "contactPageSettings",
  title: "Contact Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroHeading", title: "Page Heading", type: "string", description: "Page heading (e.g. 'Get in Touch')", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Heading Accent", type: "string", description: "Teal-coloured word(s)" }),
    defineField({ name: "heroDescription", title: "Page Description", type: "text", rows: 3, description: "Paragraph below heading" }),

    // ── Sidebar ──
    defineField({ name: "sidebarVisible", title: "Show Contact Sidebar", type: "boolean", initialValue: true, description: "Toggle to show/hide the contact sidebar" }),
    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
