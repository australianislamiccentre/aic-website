import { defineField, defineType } from "sanity";

export default defineType({
  name: "donationCampaign",
  title: "Donation Campaign",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Campaign Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Public title displayed on the donate page and modal",
    }),
    defineField({
      name: "fundraiseUpElement",
      title: "Fundraise Up Element Code",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
      description: "Paste the Fundraise Up element HTML snippet for this campaign",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "When inactive, this campaign is completely removed from the site (not just hidden)",
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
