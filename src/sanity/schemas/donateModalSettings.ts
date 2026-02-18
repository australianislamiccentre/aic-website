import { defineField, defineType } from "sanity";

export default defineType({
  name: "donateModalSettings",
  title: "Donate Button Modal",
  type: "document",
  fields: [
    defineField({
      name: "modalTitle",
      title: "Modal Title",
      type: "string",
      initialValue: "Support Our Centre",
      description: "The heading displayed at the top of the donate modal",
    }),
    defineField({
      name: "showGoalMeter",
      title: "Show Goal Meter in Modal",
      type: "boolean",
      initialValue: false,
      description: "Display the donation goal meter inside the popup modal",
    }),
    defineField({
      name: "featuredCampaign",
      title: "Featured Campaign",
      type: "reference",
      to: [{ type: "donationCampaign" }],
      options: {
        filter: "active == true",
      },
      description: "Select the main campaign to highlight in the donate modal (only active campaigns shown)",
    }),
    defineField({
      name: "additionalCampaigns",
      title: "Additional Campaigns",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "donationCampaign" }],
          options: {
            filter: "active == true",
          },
        },
      ],
      description: "Select additional campaigns to show below the featured campaign (only active campaigns shown)",
    }),
  ],
  preview: {
    select: {
      featuredTitle: "featuredCampaign.title",
      additionalCount: "additionalCampaigns",
    },
    prepare({ featuredTitle, additionalCount }) {
      const count = additionalCount?.length || 0;
      return {
        title: "Donate Button Modal",
        subtitle: featuredTitle
          ? `Featured: ${featuredTitle}${count > 0 ? ` + ${count} more` : ""}`
          : "Configure modal campaigns",
      };
    },
  },
});
