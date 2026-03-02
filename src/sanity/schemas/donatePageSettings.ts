/**
 * Sanity Schema: Donate Page Settings (singleton)
 *
 * Page-level configuration for the /donate page. Controls the hero
 * heading/description, the main donation form snippet, and which
 * campaigns to display. Managed as a singleton in Studio.
 *
 * @module sanity/schemas/donatePageSettings
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "donatePageSettings",
  title: "Donate Page Settings",
  type: "document",
  fields: [
    // ── Hero ──
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
      description:
        'Custom heading for the donate page hero. Leave empty for default "Support Our Community".',
    }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 2,
      description:
        "Custom subtext below the heading. Leave empty for default.",
    }),

    // ── Donation Form ──
    defineField({
      name: "formElement",
      title: "Donation Form Element Code",
      type: "text",
      rows: 3,
      description:
        "Paste the Fundraise Up donation form HTML snippet. Leave empty to hide the form.",
    }),

    // ── Impact Stats ──
    defineField({
      name: "impactStats",
      title: "Impact Stats",
      type: "array",
      description:
        'Up to 4 impact statistics shown below the hero (e.g. "500+" / "Families Supported"). Leave empty to use defaults.',
      validation: (rule) => rule.max(4),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              description: 'The number or stat (e.g. "500+", "20+", "$1M")',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: 'Short description (e.g. "Families Supported")',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        },
      ],
    }),

    // ── Campaigns ──
    defineField({
      name: "campaigns",
      title: "Campaigns",
      type: "array",
      description:
        "Select donation campaigns to display. Create campaigns under Donations → Campaigns first. Drag to reorder.",
      of: [
        {
          type: "reference",
          to: [{ type: "donationCampaign" }],
          options: { filter: "active == true" },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Donate Page Settings",
        subtitle: "Manage donation page layout",
      };
    },
  },
});
