/**
 * Sanity Schema: Header Settings (singleton)
 *
 * Controls the site header: announcement bar, welcome text, CTA button,
 * nav groups with drag-and-drop ordering, search visibility, and donate card.
 *
 * @module sanity/schemas/headerSettings
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
  name: "headerSettings",
  title: "Header Settings",
  type: "document",
  fields: [
    // ── 1. Announcement Bar ──
    defineField({
      name: "announcementBar",
      title: "Announcement Bar",
      type: "object",
      description: "A dismissable coloured banner above the header. Use for urgent messages, event promotions, or Ramadan announcements. Visible on all pages.",
      fields: [
        defineField({
          name: "enabled",
          title: "Enabled",
          type: "boolean",
          initialValue: false,
          description: "Toggle ON to show the announcement bar across the entire website.",
        }),
        defineField({
          name: "message",
          title: "Message",
          type: "string",
          description: "Keep it short — ideally one sentence. e.g. 'Ramadan Timetable now available'",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "link",
          title: "Link URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          description: "Optional. Makes the announcement clickable. Can link to a page or external URL.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "linkText",
          title: "Link Text",
          type: "string",
          description: "e.g. 'View Timetable'. If left empty, the entire message becomes the link.",
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
          description: "Sets the banner colour. Use Red for urgent/critical announcements only.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "dismissable",
          title: "Dismissable",
          type: "boolean",
          initialValue: true,
          description: "When ON, visitors can close the banner with an X button. Turn OFF for critical announcements.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
      ],
    }),

    // ── 2. Top Bar ──
    defineField({
      name: "topBar",
      title: "Top Bar",
      type: "object",
      description: "The slim dark bar at the very top of the site. Shows welcome text + phone number + location. Contact details are pulled automatically from Site Settings.",
      fields: [
        defineField({
          name: "desktopWelcome",
          title: "Desktop Welcome Text",
          type: "string",
          initialValue: "Welcome to the Australian Islamic Centre",
          description: "Greeting shown on desktop screens. e.g. 'Welcome to the Australian Islamic Centre'",
        }),
        defineField({
          name: "mobileWelcome",
          title: "Mobile Welcome Text",
          type: "string",
          initialValue: "Welcome to AIC",
          description: "Shorter greeting for mobile screens. e.g. 'Welcome to AIC'",
        }),
        defineField({
          name: "visible",
          title: "Visible",
          type: "boolean",
          initialValue: true,
          description: "Toggle OFF to completely hide the top bar across the site.",
        }),
      ],
    }),

    // ── 3. CTA Button ──
    defineField({
      name: "ctaButton",
      title: "CTA Button",
      type: "object",
      description: "The prominent call-to-action button in the header bar (right side, next to the menu icon). This is the most visible button on every page.",
      fields: [
        defineField({
          name: "label",
          title: "Button Label",
          type: "string",
          initialValue: "Donate",
          description: "Text shown on the button. Keep it short — one or two words. e.g. 'Donate', 'Give Now'",
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
          name: "icon",
          title: "Button Icon",
          type: "string",
          options: {
            list: [
              { title: "Heart", value: "Heart" },
              { title: "Star", value: "Star" },
              { title: "Hand Heart", value: "HandHeart" },
              { title: "Arrow Right", value: "ArrowRight" },
              { title: "Plus", value: "Plus" },
              { title: "External Link", value: "ExternalLink" },
            ],
          },
          initialValue: "Heart",
          description: "Small icon displayed next to the button text.",
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
          description: "Background colour of the button. Lime is the default brand colour.",
        }),
      ],
    }),

    // ── 4. Search ──
    defineField({
      name: "showSearch",
      title: "Show Search Button",
      type: "boolean",
      initialValue: true,
      description: "Show or hide the search (magnifying glass) icon in the header bar.",
    }),

    // ── 5. Menu Donate Card ──
    defineField({
      name: "menuDonateCard",
      title: "Menu Donate Card",
      type: "object",
      description: "A feature card shown at the bottom of the navigation menu when visitors open it. Encourages donations with a heading, description, and button.",
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          initialValue: "Support Our Community",
          description: "Bold heading on the card. e.g. 'Support Our Community'",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "string",
          initialValue: "Your generosity helps us serve the community",
          description: "Short supporting text below the heading.",
        }),
        defineField({
          name: "buttonText",
          title: "Button Text",
          type: "string",
          initialValue: "Donate",
          description: "Text on the card's button. e.g. 'Donate', 'Give Now'",
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
          description: "Toggle OFF to hide the donate card from the navigation menu.",
        }),
      ],
    }),

    // ── 6. Contact Link ──
    defineField({
      name: "contactLink",
      title: "Contact Link",
      type: "object",
      description: "A standalone 'Contact Us' link shown in the mobile navigation menu, separate from the nav groups.",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          initialValue: "Contact Us",
          description: "Link text. e.g. 'Contact Us', 'Get in Touch'",
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
          initialValue: "/contact",
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
          description: "Toggle OFF to hide this link from the mobile menu.",
        }),
      ],
    }),

    // ── 7. Nav Groups ──
    defineField({
      name: "navGroups",
      title: "Navigation Groups",
      type: "array",
      description: "The main navigation menu groups. Each group has a heading and a list of links. Drag groups to reorder them. On desktop, groups appear as columns; on mobile, as accordion sections.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Group Label",
              type: "string",
              validation: (Rule) => Rule.required(),
              description: "Group heading shown in the menu. e.g. 'About', 'What's On', 'Our Mosque'",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
              description: "Optional short description shown below the heading on desktop. e.g. 'Events, services & programs'",
            }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Users", value: "Users" },
                  { title: "Calendar", value: "Calendar" },
                  { title: "Landmark", value: "Landmark" },
                  { title: "Play", value: "Play" },
                  { title: "Message Circle", value: "MessageCircle" },
                  { title: "Heart", value: "Heart" },
                  { title: "Book Open", value: "BookOpen" },
                  { title: "Graduation Cap", value: "GraduationCap" },
                  { title: "Home", value: "Home" },
                  { title: "Star", value: "Star" },
                  { title: "Globe", value: "Globe" },
                  { title: "Hand Heart", value: "HandHeart" },
                  { title: "Megaphone", value: "Megaphone" },
                  { title: "Camera", value: "Camera" },
                  { title: "Info", value: "Info" },
                  { title: "Arrow Right", value: "ArrowRight" },
                ],
              },
              description: "Optional icon shown next to the group heading on the desktop menu.",
            }),
            defineField({
              name: "visible",
              title: "Visible",
              type: "boolean",
              initialValue: true,
              description: "Toggle OFF to hide this entire group from the navigation.",
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              description: "The pages listed under this group. Drag to reorder.",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Label",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                      description: "Text shown in the menu. e.g. 'Our Story', 'Events', 'Plan Your Visit'",
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
      return { title: "Header Settings" };
    },
  },
});
