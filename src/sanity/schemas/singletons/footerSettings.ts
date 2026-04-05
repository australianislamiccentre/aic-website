/**
 * Sanity Schema: Footer Settings (singleton)
 *
 * Controls the site footer: brand description, donate card, Qur'an verse,
 * bottom bar links, copyright text, newsletter visibility, and nav groups.
 *
 * @module sanity/schemas/footerSettings
 */
import { defineField, defineType } from "sanity";

const sitePages = [
  { title: "Home", value: "/" },
  { title: "About", value: "/about" },
  { title: "Our Imams", value: "/imams" },
  { title: "Partners", value: "/partners" },
  { title: "Events", value: "/events" },
  { title: "Services", value: "/services" },
  { title: "Announcements", value: "/announcements" },
  { title: "For Worshippers", value: "/worshippers" },
  { title: "Plan Your Visit", value: "/visit" },
  { title: "Architecture", value: "/architecture" },
  { title: "Media Gallery", value: "/media" },
  { title: "Resources", value: "/resources" },
  { title: "Contact", value: "/contact" },
  { title: "Donate", value: "/donate" },
  { title: "Privacy Policy", value: "/privacy" },
  { title: "Terms of Use", value: "/terms" },
];

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
      description: "Controls whether the newsletter signup form appears at the top of the footer. Newsletter content (heading, button text, etc.) is configured under Forms -> Newsletter.",
      fields: [
        defineField({
          name: "visible",
          title: "Show Newsletter Section",
          type: "boolean",
          initialValue: true,
          description: "Toggle OFF to hide the newsletter section from the footer.",
        }),
      ],
    }),

    // ── 2. Brand Description ──
    defineField({
      name: "brandDescription",
      title: "Brand Description",
      type: "text",
      rows: 3,
      description: "The paragraph shown below the AIC logo in the footer. Describes the organisation's mission. 2-3 sentences recommended.",
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
      description: "A boxed call-to-action in the footer encouraging donations. Shows a heading, description, and button.",
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          initialValue: "Support Us",
          description: "Bold heading above the card. e.g. 'Support Us'",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 2,
          initialValue: "Support our community programs, services, and the maintenance of our centre.",
          description: "Supporting text inside the card. Briefly explain what donations support.",
        }),
        defineField({
          name: "buttonText",
          title: "Button Text",
          type: "string",
          initialValue: "Donate Now",
          description: "Text on the donate button. e.g. 'Donate Now'",
        }),
        defineField({
          name: "linkType",
          title: "Link To",
          type: "string",
          options: {
            list: [
              { title: "Site Page", value: "page" },
              { title: "Custom URL", value: "custom" },
            ],
            layout: "radio",
            direction: "horizontal",
          },
          initialValue: "page",
        }),
        defineField({
          name: "page",
          title: "Page",
          type: "string",
          options: { list: sitePages },
          hidden: ({ parent }) => parent?.linkType !== "page",
          initialValue: "/donate",
        }),
        defineField({
          name: "customUrl",
          title: "Custom URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
          description: "Full URL for external links (e.g. https://example.com) or custom paths.",
          hidden: ({ parent }) => parent?.linkType !== "custom",
        }),
        defineField({
          name: "visible",
          title: "Visible",
          type: "boolean",
          initialValue: true,
          description: "Toggle OFF to hide the donate card from the footer.",
        }),
      ],
    }),

    // ── 5. Qur'an Verse ──
    defineField({
      name: "quranVerse",
      title: "Qur'an Verse",
      type: "object",
      description: "An inspirational Qur'an verse displayed below the donate card in the footer. Shown with Arabic calligraphy styling.",
      fields: [
        defineField({
          name: "arabicText",
          title: "Arabic Text",
          type: "text",
          rows: 3,
          description: "The verse in Arabic script. Displayed in decorative Amiri calligraphy font.",
        }),
        defineField({
          name: "translation",
          title: "English Translation",
          type: "text",
          rows: 3,
          description: "Optional English translation shown below the Arabic text in italics.",
        }),
        defineField({
          name: "reference",
          title: "Reference",
          type: "string",
          description: "Citation reference. e.g. 'Qur'an 2:261'",
          initialValue: "Qur'an 2:261",
        }),
        defineField({
          name: "visible",
          title: "Visible",
          type: "boolean",
          initialValue: true,
          description: "Toggle OFF to hide the Qur'an verse section.",
        }),
      ],
    }),

    // ── 6. Bottom Bar Links ──
    defineField({
      name: "bottomBarLinks",
      title: "Bottom Bar Links",
      type: "array",
      description: "Links shown in the very bottom bar of the footer (e.g. Privacy Policy, Terms of Use). Drag to reorder.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
              description: "Display text. e.g. 'Privacy Policy', 'Terms of Use'",
            }),
            defineField({
              name: "linkType",
              title: "Link To",
              type: "string",
              options: {
                list: [
                  { title: "Site Page", value: "page" },
                  { title: "Custom URL", value: "custom" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "page",
            }),
            defineField({
              name: "page",
              title: "Page",
              type: "string",
              options: { list: sitePages },
              hidden: ({ parent }) => parent?.linkType !== "page",
            }),
            defineField({
              name: "customUrl",
              title: "Custom URL",
              type: "string",
              description: "Page path (e.g. /events#programs) or full URL.",
              hidden: ({ parent }) => parent?.linkType !== "custom",
            }),
          ],
          preview: {
            select: { title: "label", page: "page", customUrl: "customUrl", linkType: "linkType" },
            prepare({ title, page, customUrl, linkType }: { title?: string; page?: string; customUrl?: string; linkType?: string }) {
              const url = linkType === "custom" ? customUrl : page;
              return {
                title: title || "Untitled Link",
                subtitle: url || "",
              };
            },
          },
        },
      ],
    }),

    // ── 7. Copyright ──
    defineField({
      name: "copyrightText",
      title: "Copyright Text",
      type: "string",
      description: "Optional override for the copyright line. If left empty, it auto-generates '\u00A9 2026 Australian Islamic Centre. All rights reserved.' -- you only need to fill this in if you want different wording.",
    }),

    // ── 8. Nav Groups ──
    defineField({
      name: "navGroups",
      title: "Navigation Groups",
      type: "array",
      description: "Navigation columns in the footer. Each group becomes a column with a heading and links beneath it. Drag groups to reorder columns.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Group Label",
              type: "string",
              validation: (Rule) => Rule.required(),
              description: "Column heading. e.g. 'About', 'What's On', 'Get Involved'",
            }),
            defineField({
              name: "visible",
              title: "Visible",
              type: "boolean",
              initialValue: true,
              description: "Toggle OFF to hide this entire column from the footer.",
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              description: "The pages listed under this column. Drag to reorder.",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Label",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                      description: "Display text for the link.",
                    }),
                    defineField({
                      name: "linkType",
                      title: "Link To",
                      type: "string",
                      options: {
                        list: [
                          { title: "Site Page", value: "page" },
                          { title: "Custom URL", value: "custom" },
                        ],
                        layout: "radio",
                        direction: "horizontal",
                      },
                      initialValue: "page",
                    }),
                    defineField({
                      name: "page",
                      title: "Page",
                      type: "string",
                      options: { list: sitePages },
                      hidden: ({ parent }) => parent?.linkType !== "page",
                    }),
                    defineField({
                      name: "customUrl",
                      title: "Custom URL",
                      type: "string",
                      description: "Page path (e.g. /events#programs) or full URL.",
                      hidden: ({ parent }) => parent?.linkType !== "custom",
                    }),
                    defineField({
                      name: "visible",
                      title: "Visible",
                      type: "boolean",
                      initialValue: true,
                      description: "Toggle OFF to hide this link without deleting it.",
                    }),
                  ],
                  preview: {
                    select: { title: "label", page: "page", customUrl: "customUrl", linkType: "linkType" },
                    prepare({ title, page, customUrl, linkType }: { title?: string; page?: string; customUrl?: string; linkType?: string }) {
                      const url = linkType === "custom" ? customUrl : page;
                      return {
                        title: title || "Untitled Link",
                        subtitle: url || "",
                      };
                    },
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
