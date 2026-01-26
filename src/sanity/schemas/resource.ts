import { defineField, defineType } from "sanity";

export default defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info", default: true },
    { name: "file", title: "File / Link" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    // Basic Info
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "basic",
      description: "Brief description of this resource",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
      description: "Preview image for the resource",
    }),
    defineField({
      name: "resourceType",
      title: "Resource Type",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "PDF Document", value: "pdf" },
          { title: "Audio", value: "audio" },
          { title: "Video", value: "video" },
          { title: "External Link", value: "link" },
          { title: "Image/Infographic", value: "image" },
          { title: "eBook", value: "ebook" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Quran", value: "quran" },
          { title: "Hadith", value: "hadith" },
          { title: "Fiqh (Islamic Law)", value: "fiqh" },
          { title: "Seerah (Prophet's Life)", value: "seerah" },
          { title: "Islamic History", value: "history" },
          { title: "Friday Khutbah", value: "khutbah" },
          { title: "Ramadan", value: "ramadan" },
          { title: "New Muslims", value: "new-muslims" },
          { title: "Family & Parenting", value: "family" },
          { title: "Youth", value: "youth" },
          { title: "Sisters", value: "sisters" },
          { title: "General Islamic", value: "general" },
          { title: "Forms & Documents", value: "forms" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),

    // File / Link
    defineField({
      name: "file",
      title: "File Upload",
      type: "file",
      group: "file",
      options: {
        accept: ".pdf,.mp3,.mp4,.wav,.m4a,.doc,.docx,.epub",
      },
      hidden: ({ document }) => document?.resourceType === "link",
      description: "Upload the file directly",
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      group: "file",
      hidden: ({ document }) => document?.resourceType !== "link",
      description: "Link to external resource (YouTube, podcast, etc.)",
    }),
    defineField({
      name: "fileSize",
      title: "File Size",
      type: "string",
      group: "file",
      description: "Approximate file size (e.g., '2.5 MB', '45 minutes')",
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      group: "file",
      hidden: ({ document }) =>
        document?.resourceType !== "audio" && document?.resourceType !== "video",
      description: "Length of audio/video (e.g., '45:30', '1 hour 20 minutes')",
    }),

    // Metadata
    defineField({
      name: "author",
      title: "Author / Speaker",
      type: "string",
      group: "basic",
      description: "Who created this resource?",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      group: "basic",
      description: "When was this created/recorded?",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Arabic", value: "ar" },
          { title: "Urdu", value: "ur" },
          { title: "Turkish", value: "tr" },
          { title: "Indonesian", value: "id" },
          { title: "Multiple", value: "multi" },
        ],
        layout: "dropdown",
      },
      initialValue: "en",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "basic",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "Keywords for search and filtering",
    }),

    // Settings
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "settings",
      description: "Show in featured resources section",
      initialValue: false,
    }),
    defineField({
      name: "downloadCount",
      title: "Download Count",
      type: "number",
      group: "settings",
      description: "Number of downloads (for analytics)",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      group: "settings",
      description: "Show this resource on the website",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      group: "settings",
      description: "Lower numbers appear first",
    }),
  ],
  preview: {
    select: {
      title: "title",
      resourceType: "resourceType",
      category: "category",
      author: "author",
      media: "thumbnail",
    },
    prepare({ title, resourceType, category, author, media }) {
      const typeIcons: Record<string, string> = {
        pdf: "📄",
        audio: "🎧",
        video: "🎬",
        link: "🔗",
        image: "🖼️",
        ebook: "📚",
      };
      return {
        title: `${typeIcons[resourceType] || "📁"} ${title}`,
        subtitle: `${category}${author ? ` - ${author}` : ""}`,
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
      title: "Category",
      name: "categoryAsc",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
