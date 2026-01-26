import { defineField, defineType } from "sanity";

export default defineType({
  name: "pageContent",
  title: "Page Content",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // Content
    defineField({
      name: "title",
      title: "Page Title",
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
      description: "URL identifier (e.g., 'about-us', 'history', 'vision')",
    }),
    defineField({
      name: "pageType",
      title: "Page Type",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "About Us", value: "about" },
          { title: "Our History", value: "history" },
          { title: "Mission & Vision", value: "mission" },
          { title: "Facilities", value: "facilities" },
          { title: "Contact Us", value: "contact" },
          { title: "Privacy Policy", value: "privacy" },
          { title: "Terms of Service", value: "terms" },
          { title: "Custom Page", value: "custom" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      group: "content",
      description: "Optional subtitle displayed below the title",
    }),
    defineField({
      name: "introduction",
      title: "Introduction",
      type: "text",
      rows: 3,
      group: "content",
      description: "Brief introduction shown at the top of the page",
    }),
    defineField({
      name: "content",
      title: "Main Content",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                ],
              },
            ],
          },
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
            {
              name: "alt",
              type: "string",
              title: "Alt Text",
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "sections",
      title: "Content Sections",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          name: "contentSection",
          title: "Section",
          fields: [
            { name: "title", type: "string", title: "Section Title" },
            { name: "content", type: "array", title: "Content", of: [{ type: "block" }] },
            {
              name: "image",
              type: "image",
              title: "Section Image",
              options: { hotspot: true },
            },
            {
              name: "imagePosition",
              type: "string",
              title: "Image Position",
              options: {
                list: [
                  { title: "Left", value: "left" },
                  { title: "Right", value: "right" },
                  { title: "Above", value: "above" },
                  { title: "Below", value: "below" },
                ],
                layout: "radio",
              },
              initialValue: "right",
            },
          ],
          preview: {
            select: { title: "title" },
          },
        },
      ],
      description: "Add multiple content sections with optional images",
    }),

    // Media
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      group: "media",
      options: {
        hotspot: true,
      },
      description: "Large banner image at the top of the page",
    }),
    defineField({
      name: "gallery",
      title: "Image Gallery",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "caption", type: "string", title: "Caption" },
            { name: "alt", type: "string", title: "Alt Text" },
          ],
        },
      ],
      description: "Optional image gallery for the page",
    }),

    // SEO
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      group: "seo",
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description: "Override the default page title for search engines",
        }),
        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
          description: "Description shown in search results (max 160 characters)",
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: "ogImage",
          title: "Social Share Image",
          type: "image",
          description: "Image shown when page is shared on social media",
        }),
      ],
    }),

    // Settings
    defineField({
      name: "showInNav",
      title: "Show in Navigation",
      type: "boolean",
      description: "Include this page in the site navigation",
      initialValue: false,
    }),
    defineField({
      name: "navOrder",
      title: "Navigation Order",
      type: "number",
      description: "Order in navigation menu (lower = earlier)",
      hidden: ({ document }) => !document?.showInNav,
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Publish this page",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      pageType: "pageType",
      active: "active",
      media: "heroImage",
    },
    prepare({ title, pageType, active, media }) {
      const typeLabels: Record<string, string> = {
        about: "About Us",
        history: "History",
        mission: "Mission & Vision",
        facilities: "Facilities",
        contact: "Contact",
        privacy: "Privacy Policy",
        terms: "Terms",
        custom: "Custom",
      };
      return {
        title: `${active === false ? "(Draft) " : ""}${title}`,
        subtitle: typeLabels[pageType] || pageType,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
    {
      title: "Page Type",
      name: "pageTypeAsc",
      by: [{ field: "pageType", direction: "asc" }],
    },
  ],
});
