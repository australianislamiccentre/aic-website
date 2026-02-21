import { defineField, defineType } from "sanity";

export default defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  fields: [
    // ── 1. Status ──
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Show this announcement on the website",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show prominently on homepage. Disabled when inactive.",
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
      name: "expiresAt",
      title: "Expires At",
      type: "date",
      description: "Optional — announcement will auto-hide after this date",
    }),

    // ── 2. Content ──
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
      name: "date",
      title: "Publication Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown in lists (max 200 characters)",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "content",
      title: "Full Content",
      type: "array",
      of: [{ type: "block" }],
      description: "Detailed content for the announcement page",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
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
      description: "Optional tags for filtering and search",
    }),
    defineField({
      name: "callToAction",
      title: "Call to Action",
      type: "object",
      description: "Optional button link",
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
              { title: "Events", value: "/events" },
              { title: "Programs", value: "/programs" },
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
