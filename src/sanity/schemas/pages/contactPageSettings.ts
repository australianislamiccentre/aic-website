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
    defineField({ name: "operatingHours", title: "Operating Hours", type: "string", description: "Hours shown in sidebar (e.g. '4:30 AM – 10:30 PM Daily')" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
