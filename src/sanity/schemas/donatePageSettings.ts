import { defineField, defineType } from "sanity";

export default defineType({
  name: "donatePageSettings",
  title: "Donate Page Settings",
  type: "document",
  groups: [
    { name: "goal", title: "Goal Meter" },
    { name: "form", title: "Donation Form" },
    { name: "campaigns", title: "Campaigns" },
    { name: "donors", title: "Donor List" },
    { name: "map", title: "Donation Map" },
  ],
  fields: [
    // ── Goal Meter ──
    defineField({
      name: "goalEnabled",
      title: "Enable Goal Meter",
      type: "boolean",
      initialValue: false,
      group: "goal",
      description: "Show the donation goal meter on the donate page",
    }),
    defineField({
      name: "goalElement",
      title: "Goal Meter Element Code",
      type: "text",
      rows: 3,
      group: "goal",
      hidden: ({ document }) => !document?.goalEnabled,
      description: "Paste the Fundraise Up goal meter HTML snippet",
    }),

    // ── Main Donation Form ──
    defineField({
      name: "formEnabled",
      title: "Enable Donation Form",
      type: "boolean",
      initialValue: false,
      group: "form",
      description: "Show the main donation form on the donate page",
    }),
    defineField({
      name: "formElement",
      title: "Donation Form Element Code",
      type: "text",
      rows: 3,
      group: "form",
      hidden: ({ document }) => !document?.formEnabled,
      description: "Paste the Fundraise Up donation form HTML snippet",
    }),

    // ── Campaigns ──
    defineField({
      name: "campaigns",
      title: "Campaigns",
      type: "array",
      group: "campaigns",
      description: "Add donation campaigns to display on the donate page",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Campaign Title",
              type: "string",
              description: "Optional title displayed above the campaign widget",
            }),
            defineField({
              name: "fundraiseUpElement",
              title: "Fundraise Up Element Code",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
              description: "Paste the Fundraise Up campaign HTML snippet",
            }),
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "title",
              enabled: "enabled",
            },
            prepare({ title, enabled }) {
              return {
                title: title || "Untitled Campaign",
                subtitle: enabled !== false ? "Enabled" : "Disabled",
              };
            },
          },
        },
      ],
    }),

    // ── Recent Donors List ──
    defineField({
      name: "donorListEnabled",
      title: "Enable Donor List",
      type: "boolean",
      initialValue: false,
      group: "donors",
      description: "Show the recent donations list on the donate page",
    }),
    defineField({
      name: "donorListElement",
      title: "Donor List Element Code",
      type: "text",
      rows: 3,
      group: "donors",
      hidden: ({ document }) => !document?.donorListEnabled,
      description: "Paste the Fundraise Up recent donations HTML snippet",
    }),

    // ── Donation Map ──
    defineField({
      name: "mapEnabled",
      title: "Enable Donation Map",
      type: "boolean",
      initialValue: false,
      group: "map",
      description: "Show the donation world map on the donate page",
    }),
    defineField({
      name: "mapTitle",
      title: "Map Section Title",
      type: "string",
      group: "map",
      hidden: ({ document }) => !document?.mapEnabled,
      description: "Optional heading above the map (e.g. 'Donations Around the World')",
    }),
    defineField({
      name: "mapElement",
      title: "Donation Map Element Code",
      type: "text",
      rows: 3,
      group: "map",
      hidden: ({ document }) => !document?.mapEnabled,
      description: "Paste the Fundraise Up world map HTML snippet",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Donate Page Settings",
        subtitle: "Manage donation page elements",
      };
    },
  },
});
