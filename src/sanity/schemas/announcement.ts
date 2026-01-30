import { defineField, defineType } from "sanity";

export default defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    // Content
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
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
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "Short summary shown in lists (max 200 characters)",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "content",
      title: "Full Content",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
      description: "Detailed content for the announcement page",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      group: "content",
      options: {
        hotspot: true,
      },
      description: "Optional image for the announcement",
    }),

    // Settings
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "settings",
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
      group: "settings",
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
      group: "content",
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
              { title: "Campaigns", value: "/campaigns" },
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
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Normal", value: "normal" },
          { title: "Important - Highlighted in lists", value: "important" },
          { title: "Urgent - Shows alert banner on homepage", value: "urgent" },
        ],
        layout: "radio",
      },
      initialValue: "normal",
      description: "Urgent announcements display as an alert banner at the top of the homepage",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      group: "settings",
      description: "Show this announcement on the website",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "settings",
      description: "Show prominently on homepage. Disabled when announcement is inactive.",
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
      name: "expiresAt",
      title: "Expires At",
      type: "date",
      group: "settings",
      description: "Optional - announcement will auto-hide after this date",
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
