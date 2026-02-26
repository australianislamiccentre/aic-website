/**
 * Sanity Schema: Donation Campaign
 *
 * Content type for individual fundraising campaigns. Each campaign
 * has a name and optional description (for admin reference only),
 * a Fundraise Up element HTML snippet that renders on the website,
 * and an active toggle. Displayed on the /donate page when selected
 * in the Donate Page Settings.
 *
 * @module sanity/schemas/donationCampaign
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "donationCampaign",
  title: "Donation Campaign",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Campaign Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "For admin reference only — not shown on the website.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description:
        "For admin reference only — not shown on the website. Use this to note what the campaign is for.",
    }),
    defineField({
      name: "fundraiseUpElement",
      title: "Fundraise Up Element Code",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
      description:
        "Paste the Fundraise Up element HTML snippet for this campaign. This is what appears on the website.",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description:
        "When inactive, this campaign is completely removed from the site.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      active: "active",
    },
    prepare({ title, active }) {
      return {
        title: title || "Untitled Campaign",
        subtitle: active ? "Active" : "Inactive",
      };
    },
  },
});
