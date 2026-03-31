/**
 * Sanity Schema: Resource
 *
 * Content type for downloadable resources and external links such as
 * PDFs, documents, and useful URLs. Includes active/featured toggles,
 * display order, title, slug, description, and file or link attachment.
 * Consumed by the /resources page and the featured resources section.
 *
 * @module sanity/schemas/resource
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  fields: [
    // ── 1. Status ──
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Show this resource on the website",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show in featured resources section",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
    }),

    // ── 2. Title & Description ──
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Brief description of this resource",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    // ── 3. Type & Category ──
    defineField({
      name: "resourceType",
      title: "Resource Type",
      type: "string",
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

    // ── 4. File / Link ──
    defineField({
      name: "file",
      title: "File Upload",
      type: "file",
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
      hidden: ({ document }) => document?.resourceType !== "link",
      description: "Link to external resource (YouTube, podcast, etc.)",
    }),
    defineField({
      name: "fileSize",
      title: "File Size",
      type: "string",
      description: "Approximate file size (e.g., '2.5 MB')",
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      hidden: ({ document }) =>
        document?.resourceType !== "audio" && document?.resourceType !== "video",
      description: "Length of audio/video (e.g., '45:30', '1 hour 20 minutes')",
    }),

    // ── 5. Metadata ──
    defineField({
      name: "author",
      title: "Author / Speaker",
      type: "string",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      description: "When was this created/recorded?",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
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
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "Keywords for search and filtering",
    }),
    defineField({
      name: "downloadCount",
      title: "Download Count",
      type: "number",
      description: "Auto-tracked",
      initialValue: 0,
      readOnly: true,
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
