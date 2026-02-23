/**
 * Sanity Schema: Announcement
 *
 * Content type for site-wide announcements with an active/inactive
 * toggle, hero image, title, slug, excerpt, rich-text body, and
 * optional call-to-action link. Displayed on the /announcements
 * listing page and the homepage announcements section.
 *
 * @module sanity/schemas/announcement
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  fields: [
    // ── 1. Hero Image ──
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Hero banner image shown at the top of the announcement page",
      options: {
        hotspot: true,
      },
    }),

    // ── 2. Header ──
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown below the title and in announcement cards (max 200 characters)",
      validation: (Rule) => Rule.required().max(200),
    }),

    // ── 3. Main Content ──
    defineField({
      name: "content",
      title: "Full Content",
      type: "array",
      of: [{ type: "block" }],
      description: "Rich text content shown in the main body of the announcement page",
    }),

    // ── 4. Sidebar Details ──
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      options: {
        list: [
          { title: "Normal", value: "normal" },
          { title: "Important — highlighted in lists", value: "important" },
          { title: "Urgent — shows alert banner on homepage", value: "urgent" },
        ],
        layout: "radio",
      },
      initialValue: "normal",
      description: "Urgent announcements display as an alert banner at the top of the homepage",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Shown as a badge on the page and used for filtering on the announcements listing",
      options: {
        list: [
          { title: "General", value: "General" },
          { title: "News", value: "News" },
          { title: "Prayer", value: "Prayer" },
          { title: "Ramadan", value: "Ramadan" },
          { title: "Eid", value: "Eid" },
          { title: "Community", value: "Community" },
          { title: "Education", value: "Education" },
          { title: "Youth", value: "Youth" },
          { title: "Sisters", value: "Sisters" },
          { title: "Volunteer", value: "Volunteer" },
          { title: "In Memoriam", value: "In Memoriam" },
          { title: "Marriage", value: "Marriage" },
          { title: "Lost & Found", value: "Lost & Found" },
          { title: "Maintenance", value: "Maintenance" },
        ],
        layout: "dropdown",
      },
      initialValue: "General",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "Shown as small pills next to the category badge",
    }),
    defineField({
      name: "date",
      title: "Publication Date",
      type: "date",
      description: "Shown in the sidebar details card",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "expiresAt",
      title: "Expires At",
      type: "date",
      description: "Optional — announcement will auto-hide after this date. Shown in sidebar as 'Valid until'",
    }),

    // ── 5. Call to Action ──
    defineField({
      name: "callToAction",
      title: "Call to Action",
      type: "object",
      description: "Optional button shown prominently in the sidebar",
      fields: [
        defineField({
          name: "label",
          title: "Button Label",
          type: "string",
          description: "e.g., 'Register Now', 'Learn More', 'Donate'",
        }),
        defineField({
          name: "linkType",
          title: "Link Type",
          type: "string",
          options: {
            list: [
              { title: "Internal Page", value: "internal" },
              { title: "External URL", value: "external" },
            ],
            layout: "radio",
          },
          initialValue: "internal",
        }),
        defineField({
          name: "internalPage",
          title: "Internal Page",
          type: "string",
          options: {
            list: [
              { title: "Contact", value: "/contact" },
              { title: "Donate", value: "/donate" },
              { title: "Events & Programs", value: "/events" },
              { title: "Services", value: "/services" },
              { title: "Worshippers", value: "/worshippers" },
              { title: "Visit", value: "/visit" },
              { title: "About", value: "/about" },
              { title: "Media", value: "/media" },
              { title: "Architecture", value: "/architecture" },
              { title: "Announcements", value: "/announcements" },
            ],
          },
          hidden: ({ parent }) => parent?.linkType !== "internal",
        }),
        defineField({
          name: "url",
          title: "External URL",
          type: "url",
          validation: (Rule) =>
            Rule.uri({
              allowRelative: false,
              scheme: ["http", "https", "mailto", "tel"],
            }),
          hidden: ({ parent }) => parent?.linkType !== "external",
        }),
      ],
    }),

    // ── 6. Admin Settings ──
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "When disabled, this announcement is hidden from the website entirely (listing page, homepage, and direct URL)",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      description: "Only featured announcements appear on the homepage. Disabled when inactive.",
      initialValue: false,
      readOnly: ({ document }) => document?.active === false,
      validation: (Rule) =>
        Rule.custom((featured, context) => {
          const doc = context.document as { active?: boolean } | undefined;
          if (featured && doc?.active === false) {
            return "Cannot feature an inactive announcement. Enable 'Active' first.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      category: "category",
      priority: "priority",
      active: "active",
      media: "image",
    },
    prepare({ title, date, category, priority, active, media }) {
      const priorityIcon = priority === "urgent" ? "🚨 " : priority === "important" ? "⚠️ " : "";
      const activeStatus = active === false ? " (Inactive)" : "";
      return {
        title: `${priorityIcon}${title}${activeStatus}`,
        subtitle: `${category || "General"} - ${date}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Date, Newest",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Priority",
      name: "priorityDesc",
      by: [
        { field: "priority", direction: "desc" },
        { field: "date", direction: "desc" },
      ],
    },
  ],
});
