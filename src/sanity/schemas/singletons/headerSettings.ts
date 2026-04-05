/**
 * Sanity Schema: Header Settings (singleton)
 *
 * Controls the site header: announcement bar, welcome text, CTA button,
 * nav groups with drag-and-drop ordering, search visibility, and donate card.
 *
 * @module sanity/schemas/headerSettings
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "headerSettings",
  title: "Header Settings",
  type: "document",
  fields: [
    // ── 1. Announcement Bar ──
    defineField({
      name: "announcementBar",
      title: "Announcement Bar",
      type: "object",
      description: "A dismissable banner above the header for urgent messages.",
      fields: [
        defineField({
          name: "enabled",
          title: "Enabled",
          type: "boolean",
          initialValue: false,
          description: "Show the announcement bar across all pages.",
        }),
        defineField({
          name: "message",
          title: "Message",
          type: "string",
          description: "The banner text (keep it short — one line).",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "link",
          title: "Link URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          description: "Optional: makes the message clickable.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "linkText",
          title: "Link Text",
          type: "string",
          description: "Optional: e.g. 'Learn more'. If empty, the whole message is the link.",
          hidden: ({ parent }) => !parent?.enabled || !parent?.link,
        }),
        defineField({
          name: "backgroundColor",
          title: "Background Colour",
          type: "string",
          options: {
            list: [
              { title: "Teal", value: "teal" },
              { title: "Gold", value: "gold" },
              { title: "Lime", value: "lime" },
              { title: "Red (Urgent)", value: "red" },
            ],
            layout: "radio",
            direction: "horizontal",
          },
          initialValue: "teal",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "dismissable",
          title: "Dismissable",
          type: "boolean",
          initialValue: true,
          description: "Allow visitors to close the banner with an X button.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
      ],
    }),

    // ── 2. Top Bar ──
    defineField({
      name: "topBar",
      title: "Top Bar",
      type: "object",
      description: "The slim bar above the main header. Contact info (phone, address) is pulled from Site Settings.",
      fields: [
        defineField({
          name: "desktopWelcome",
          title: "Desktop Welcome Text",
          type: "string",
          initialValue: "Welcome to the Australian Islamic Centre",
        }),
        defineField({
          name: "mobileWelcome",
          title: "Mobile Welcome Text",
          type: "string",
          initialValue: "Welcome to AIC",
        }),
        defineField({
          name: "visible",
          title: "Visible",
          type: "boolean",
          initialValue: true,
          description: "Show/hide the top bar.",
        }),
      ],
    }),

    // ── 3. CTA Button ──
    defineField({
      name: "ctaButton",
      title: "CTA Button",
      type: "object",
      description: "The main call-to-action button in the header bar.",
      fields: [
        defineField({
          name: "label",
          title: "Button Label",
          type: "string",
          initialValue: "Donate",
        }),
        defineField({
          name: "url",
          title: "Button URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          initialValue: "/donate",
        }),
        defineField({
          name: "icon",
          title: "Button Icon",
          type: "iconPicker",
          options: {
            storeSvg: true,
          },
        }),
        defineField({
          name: "accentColor",
          title: "Accent Colour",
          type: "string",
          options: {
            list: [
              { title: "Lime", value: "lime" },
              { title: "Gold", value: "gold" },
              { title: "Teal", value: "teal" },
            ],
            layout: "radio",
            direction: "horizontal",
          },
          initialValue: "lime",
        }),
      ],
    }),

    // ── 4. Search ──
    defineField({
      name: "showSearch",
      title: "Show Search Button",
      type: "boolean",
      initialValue: true,
    }),

    // ── 5. Menu Donate Card ──
    defineField({
      name: "menuDonateCard",
      title: "Menu Donate Card",
      type: "object",
      description: "The donate feature card shown inside the navigation overlay.",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Support Our Community" }),
        defineField({ name: "description", title: "Description", type: "string", initialValue: "Your generosity helps us serve the community" }),
        defineField({ name: "buttonText", title: "Button Text", type: "string", initialValue: "Donate" }),
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

    // ── 6. Contact Link ──
    defineField({
      name: "contactLink",
      title: "Contact Link",
      type: "object",
      description: "The standalone Contact link in the mobile menu.",
      fields: [
        defineField({ name: "label", title: "Label", type: "string", initialValue: "Contact Us" }),
        defineField({
          name: "url",
          title: "URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          initialValue: "/contact",
        }),
        defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
      ],
    }),

    // ── 7. Nav Groups ──
    defineField({
      name: "navGroups",
      title: "Navigation Groups",
      type: "array",
      description: "Drag to reorder groups. Each group contains orderable links.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Group Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "description", title: "Description", type: "string", description: "Shown on desktop menu below the group heading." }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "iconPicker",
              options: { storeSvg: true },
              description: "Group icon shown on desktop menu.",
            }),
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
                      description: "Path like /about or full URL.",
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
      return { title: "Header Settings" };
    },
  },
});
