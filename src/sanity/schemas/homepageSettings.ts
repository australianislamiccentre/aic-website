/**
 * Sanity Schema: Homepage Settings (singleton)
 *
 * Controls all homepage sections that have CMS configuration: hero,
 * quick links, featured YouTube video, welcome/about section, and
 * call-to-action banner. Fields are ordered to match the visual page
 * layout. The hero supports two background modes:
 *
 * - **Carousel mode** (`heroSlides`): Each slide has text content AND
 *   a required background image. Slides rotate with crossfade transitions.
 * - **Video mode** (`heroVideoOverlays`): A looping video plays as the
 *   background while text-only overlays rotate. No image fields needed.
 *
 * These are two separate arrays conditionally shown in the Studio based
 * on the `heroMode` selection. The frontend resolves the correct array
 * based on mode, with a fallback chain:
 * - Carousel: heroSlides → fallbackSlides
 * - Video: heroVideoOverlays → heroSlides text → fallbackSlides
 *
 * @module sanity/schemas/homepageSettings
 */
import { defineField, defineType } from "sanity";
import { internalPageOptions } from "./shared/internalPages";

export default defineType({
  name: "homepageSettings",
  title: "Homepage Settings",
  type: "document",
  fields: [
    // ── 1. Hero Background Mode ──
    defineField({
      name: "heroMode",
      title: "Hero Background Mode",
      type: "string",
      options: {
        list: [
          { title: "Image Carousel", value: "carousel" },
          { title: "Video Background", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "carousel",
      description:
        "Choose the hero background style. In both modes, the slides below rotate their text content automatically.",
    }),

    // ── 2. Hero Video URL (video mode only) ──
    defineField({
      name: "heroVideoUrl",
      title: "Hero Video URL",
      type: "url",
      description:
        "URL to a video file (MP4 recommended) that will loop as the hero background. The text slides below will still rotate over the video.",
      hidden: ({ parent }) => parent?.heroMode !== "video",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { heroMode?: string };
          if (parent?.heroMode === "video" && !value) {
            return "A video URL is required when video mode is selected";
          }
          return true;
        }),
    }),

    // ── 3. Hero Slides (carousel mode only — with required images) ──
    defineField({
      name: "heroSlides",
      title: "Hero Slides",
      type: "array",
      description:
        "Rotating slides for the image carousel. Each slide has text content and a required background image.",
      hidden: ({ parent }) => parent?.heroMode === "video",
      of: [
        {
          type: "object",
          name: "heroSlide",
          title: "Slide",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description:
                'First line of the heading (e.g. "Welcome to the")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "highlight",
              title: "Highlight Text",
              type: "string",
              description:
                'Second line displayed in green gradient (e.g. "Australian Islamic Centre")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "subtitle",
              title: "Subtitle",
              type: "text",
              rows: 2,
              description: "Short description below the heading",
            }),
            defineField({
              name: "primaryButton",
              title: "Primary Button",
              type: "object",
              fields: [
                { name: "label", type: "string", title: "Label" },
                defineField({
                  name: "linkType",
                  title: "Link Type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Internal Page", value: "internal" },
                      { title: "Custom URL", value: "external" },
                    ],
                    layout: "radio",
                  },
                  initialValue: "internal",
                }),
                defineField({
                  name: "internalPage",
                  title: "Page",
                  type: "string",
                  options: { list: internalPageOptions },
                  hidden: ({ parent }) => parent?.linkType !== "internal",
                }),
                defineField({
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (Rule) =>
                    Rule.uri({
                      allowRelative: true,
                      scheme: ["http", "https", "mailto", "tel"],
                    }),
                  hidden: ({ parent }) => parent?.linkType !== "external",
                }),
              ],
            }),
            defineField({
              name: "secondaryButton",
              title: "Secondary Button",
              type: "object",
              fields: [
                { name: "label", type: "string", title: "Label" },
                defineField({
                  name: "linkType",
                  title: "Link Type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Internal Page", value: "internal" },
                      { title: "Custom URL", value: "external" },
                    ],
                    layout: "radio",
                  },
                  initialValue: "internal",
                }),
                defineField({
                  name: "internalPage",
                  title: "Page",
                  type: "string",
                  options: { list: internalPageOptions },
                  hidden: ({ parent }) => parent?.linkType !== "internal",
                }),
                defineField({
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (Rule) =>
                    Rule.uri({
                      allowRelative: true,
                      scheme: ["http", "https", "mailto", "tel"],
                    }),
                  hidden: ({ parent }) => parent?.linkType !== "external",
                }),
              ],
            }),
            defineField({
              name: "image",
              title: "Background Image",
              type: "image",
              options: { hotspot: true },
              description: "Background image for this slide",
              validation: (Rule) =>
                Rule.custom((value) => {
                  const img = value as { asset?: { _ref?: string } } | undefined;
                  if (!img?.asset?._ref) {
                    return "A background image is required for each carousel slide";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "active",
              title: "Active",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "title",
              highlight: "highlight",
              active: "active",
              media: "image",
            },
            prepare({ title, highlight, active, media }) {
              return {
                title: `${active === false ? "(Inactive) " : ""}${title || ""} ${highlight || ""}`.trim(),
                media,
              };
            },
          },
        },
      ],
    }),

    // ── 3b. Hero Video Overlays (video mode only — text only) ──
    defineField({
      name: "heroVideoOverlays",
      title: "Hero Text Overlays",
      type: "array",
      description:
        "Text content that rotates over the video background. Each overlay has a title, highlight text, subtitle, and call-to-action buttons. No images needed — the video provides the visual backdrop.",
      hidden: ({ parent }) => parent?.heroMode !== "video",
      of: [
        {
          type: "object",
          name: "heroVideoOverlay",
          title: "Text Overlay",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description:
                'First line of the heading (e.g. "Welcome to the")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "highlight",
              title: "Highlight Text",
              type: "string",
              description:
                'Second line displayed in green gradient (e.g. "Australian Islamic Centre")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "subtitle",
              title: "Subtitle",
              type: "text",
              rows: 2,
              description: "Short description below the heading",
            }),
            defineField({
              name: "primaryButton",
              title: "Primary Button",
              type: "object",
              fields: [
                { name: "label", type: "string", title: "Label" },
                defineField({
                  name: "linkType",
                  title: "Link Type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Internal Page", value: "internal" },
                      { title: "Custom URL", value: "external" },
                    ],
                    layout: "radio",
                  },
                  initialValue: "internal",
                }),
                defineField({
                  name: "internalPage",
                  title: "Page",
                  type: "string",
                  options: { list: internalPageOptions },
                  hidden: ({ parent }) => parent?.linkType !== "internal",
                }),
                defineField({
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (Rule) =>
                    Rule.uri({
                      allowRelative: true,
                      scheme: ["http", "https", "mailto", "tel"],
                    }),
                  hidden: ({ parent }) => parent?.linkType !== "external",
                }),
              ],
            }),
            defineField({
              name: "secondaryButton",
              title: "Secondary Button",
              type: "object",
              fields: [
                { name: "label", type: "string", title: "Label" },
                defineField({
                  name: "linkType",
                  title: "Link Type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Internal Page", value: "internal" },
                      { title: "Custom URL", value: "external" },
                    ],
                    layout: "radio",
                  },
                  initialValue: "internal",
                }),
                defineField({
                  name: "internalPage",
                  title: "Page",
                  type: "string",
                  options: { list: internalPageOptions },
                  hidden: ({ parent }) => parent?.linkType !== "internal",
                }),
                defineField({
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (Rule) =>
                    Rule.uri({
                      allowRelative: true,
                      scheme: ["http", "https", "mailto", "tel"],
                    }),
                  hidden: ({ parent }) => parent?.linkType !== "external",
                }),
              ],
            }),
            defineField({
              name: "active",
              title: "Active",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "title",
              highlight: "highlight",
              active: "active",
            },
            prepare({ title, highlight, active }) {
              return {
                title: `${active === false ? "(Inactive) " : ""}${title || ""} ${highlight || ""}`.trim(),
              };
            },
          },
        },
      ],
    }),

    // ── 4. Quick Links Section ──
    defineField({
      name: "quickLinksSection",
      title: "Quick Links Section",
      type: "object",
      description:
        "Quick-access cards shown below the prayer times strip. Each card has a title, subtitle, accent colour, and links to pages or external URLs.",
      fields: [
        defineField({
          name: "enabled",
          title: "Enabled",
          type: "boolean",
          initialValue: true,
          description:
            "When disabled, the entire quick links section is hidden from the homepage",
        }),
        defineField({
          name: "quickLinkCards",
          title: "Quick Link Cards",
          type: "array",
          of: [
            {
              type: "object",
              name: "quickLinkCard",
              title: "Card",
              fields: [
                defineField({
                  name: "title",
                  title: "Title",
                  type: "string",
                  description:
                    'Card heading (e.g. "For Worshippers", "For Visitors")',
                  validation: (Rule) => Rule.required().max(50),
                }),
                defineField({
                  name: "subtitle",
                  title: "Subtitle",
                  type: "string",
                  description:
                    'Secondary text below the title (e.g. "Prayer & Services")',
                  validation: (Rule) => Rule.max(80),
                }),
                defineField({
                  name: "accentColor",
                  title: "Accent Colour",
                  type: "string",
                  options: {
                    list: [
                      { title: "Green", value: "green" },
                      { title: "Sky Blue", value: "sky" },
                      { title: "Lime", value: "lime" },
                      { title: "Amber", value: "amber" },
                      { title: "Rose", value: "rose" },
                      { title: "Purple", value: "purple" },
                      { title: "Teal", value: "teal" },
                    ],
                    layout: "dropdown",
                  },
                  initialValue: "green",
                  description:
                    "Colour theme for this card's border, icon, and accents",
                }),
                defineField({
                  name: "links",
                  title: "Links",
                  type: "array",
                  validation: (Rule) => Rule.min(1).max(6),
                  of: [
                    {
                      type: "object",
                      name: "quickLink",
                      title: "Link",
                      fields: [
                        defineField({
                          name: "label",
                          title: "Label",
                          type: "string",
                          validation: (Rule) => Rule.required().max(40),
                        }),
                        defineField({
                          name: "linkType",
                          title: "Link Type",
                          type: "string",
                          options: {
                            list: [
                              { title: "Internal Page", value: "internal" },
                              { title: "Custom URL", value: "external" },
                            ],
                            layout: "radio",
                          },
                          initialValue: "internal",
                        }),
                        defineField({
                          name: "internalPage",
                          title: "Page",
                          type: "string",
                          options: { list: internalPageOptions },
                          hidden: ({ parent }) =>
                            parent?.linkType !== "internal",
                        }),
                        defineField({
                          name: "url",
                          title: "URL",
                          type: "url",
                          validation: (Rule) =>
                            Rule.uri({
                              allowRelative: true,
                              scheme: ["http", "https", "mailto", "tel"],
                            }),
                          hidden: ({ parent }) =>
                            parent?.linkType !== "external",
                        }),
                      ],
                      preview: {
                        select: { title: "label", subtitle: "linkType" },
                      },
                    },
                  ],
                }),
                defineField({
                  name: "active",
                  title: "Active",
                  type: "boolean",
                  initialValue: true,
                }),
              ],
              preview: {
                select: {
                  title: "title",
                  subtitle: "subtitle",
                  active: "active",
                },
                prepare({ title, subtitle, active }) {
                  return {
                    title: `${active === false ? "(Inactive) " : ""}${title || "Untitled"}`,
                    subtitle: subtitle || "",
                  };
                },
              },
            },
          ],
        }),
        defineField({
          name: "bottomCtaText",
          title: "Bottom CTA Text",
          type: "string",
          description:
            'Text for the link below the cards (links to /contact). Defaults to "Can\'t find what you\'re looking for?"',
        }),
      ],
    }),

    // ── 5. Featured YouTube Video ──
    defineField({
      name: "featuredYoutubeUrl",
      title: "Featured YouTube Video URL",
      type: "url",
      description:
        "Full YouTube URL for the featured video in the Media section (e.g. https://www.youtube.com/watch?v=BckNzo1ufDw). Leave empty to use the default video.",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ["http", "https"],
        }),
    }),

    // ── 6. Welcome Section ──
    defineField({
      name: "welcomeSection",
      title: "Welcome Section",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "string",
        }),
        defineField({
          name: "content",
          title: "Content",
          type: "array",
          of: [{ type: "block" }],
        }),
        defineField({
          name: "image",
          title: "Image",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "stats",
          title: "Statistics",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "value", type: "string", title: "Value" },
                { name: "label", type: "string", title: "Label" },
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            },
          ],
          description: "e.g., '5000+' 'Community Members'",
        }),
      ],
      description: "Welcome/About section on homepage",
    }),

    // ── 7. Call-to-Action Banner ──
    defineField({
      name: "ctaBanner",
      title: "Call-to-Action Banner",
      type: "object",
      fields: [
        defineField({
          name: "enabled",
          title: "Enabled",
          type: "boolean",
          initialValue: true,
        }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "string",
        }),
        defineField({
          name: "buttonLabel",
          title: "Button Label",
          type: "string",
        }),
        defineField({
          name: "buttonUrl",
          title: "Button URL",
          type: "url",
          validation: (Rule) =>
            Rule.uri({
              allowRelative: true,
              scheme: ["http", "https", "mailto", "tel"],
            }),
        }),
        defineField({
          name: "backgroundImage",
          title: "Background Image",
          type: "image",
          options: { hotspot: true },
        }),
      ],
      description: "Promotional banner section on homepage",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage Settings",
        subtitle: "Hero, quick links, video, welcome section, and CTA banner",
      };
    },
  },
});
