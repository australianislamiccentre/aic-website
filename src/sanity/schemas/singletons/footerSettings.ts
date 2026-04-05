/**
 * Sanity Schema: Footer Settings (singleton)
 *
 * Controls the site footer: brand description, donate card, Qur'an verse,
 * bottom bar links, copyright text, newsletter visibility, and nav groups.
 *
 * @module sanity/schemas/footerSettings
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "footerSettings",
  title: "Footer Settings",
  type: "document",
  fields: [
    // ── 1. Newsletter Section ──
    defineField({
      name: "newsletter",
      title: "Newsletter Section",
      type: "object",
      description: "Newsletter content (heading, description, button text) is configured in Forms → Newsletter.",
      fields: [
        defineField({
          name: "visible",
          title: "Show Newsletter Section",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),

    // ── 2. Brand Description ──
    defineField({
      name: "brandDescription",
      title: "Brand Description",
      type: "text",
      rows: 3,
      description: "Paragraph below the logo in the footer.",
      initialValue: "Serving the community through prayer, education, and spiritual growth. A centre welcoming all who seek knowledge and connection.",
    }),

    // ── 3. Operating Hours Note ──
    defineField({
      name: "operatingHoursNote",
      title: "Operating Hours",
      type: "string",
      readOnly: true,
      description: "Operating hours are configured in Site Settings. The footer displays them automatically.",
      initialValue: "Configured in Site Settings",
    }),

    // ── 4. Donate Card ──
    defineField({
      name: "donateCard",
      title: "Donate Card",
      type: "object",
      description: "The donate call-to-action card in the footer.",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Support Us" }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 2,
          initialValue: "Support our community programs, services, and the maintenance of our centre.",
        }),
        defineField({ name: "buttonText", title: "Button Text", type: "string", initialValue: "Donate Now" }),
        defineField({
          name: "url",
          title: "URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          initialValue: "/donate",
        }),
        defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
      ],
    }),

    // ── 5. Qur'an Verse ──
    defineField({
      name: "quranVerse",
      title: "Qur'an Verse",
      type: "object",
      fields: [
        defineField({
          name: "arabicText",
          title: "Arabic Text",
          type: "text",
          rows: 3,
          description: "Arabic text displayed with Amiri font.",
        }),
        defineField({
          name: "translation",
          title: "English Translation",
          type: "text",
          rows: 3,
          description: "Optional English translation.",
        }),
        defineField({
          name: "reference",
          title: "Reference",
          type: "string",
          description: "e.g. 'Qur'an 2:261'",
          initialValue: "Qur'an 2:261",
        }),
        defineField({
          name: "visible",
          title: "Visible",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),

    // ── 6. Bottom Bar Links ──
    defineField({
      name: "bottomBarLinks",
      title: "Bottom Bar Links",
      type: "array",
      description: "Links shown in the footer bottom bar (e.g. Privacy, Terms). Drag to reorder.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({
              name: "url",
              title: "URL",
              type: "string",
              validation: (Rule) => Rule.required(),
              description: "Path like /privacy or full URL.",
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        },
      ],
    }),

    // ── 7. Copyright ──
    defineField({
      name: "copyrightText",
      title: "Copyright Text",
      type: "string",
      description: "Optional override. If empty, auto-generates '© {year} {org name}. All rights reserved.'",
    }),

    // ── 8. Nav Groups ──
    defineField({
      name: "navGroups",
      title: "Navigation Groups",
      type: "array",
      description: "Footer navigation columns. Drag to reorder groups.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Group Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
                    defineField({
                      name: "url",
                      title: "URL",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
                  ],
                  preview: {
                    select: { title: "label", subtitle: "url" },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "label", visible: "visible" },
            prepare({ title, visible }: { title?: string; visible?: boolean }) {
              return {
                title: title || "Untitled Group",
                subtitle: visible === false ? "Hidden" : "Visible",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Footer Settings" };
    },
  },
});
