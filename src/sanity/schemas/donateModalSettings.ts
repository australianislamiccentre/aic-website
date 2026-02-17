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
      name: "showOverallGoalMeter",
      title: "Show Overall Goal Meter",
      type: "boolean",
      initialValue: false,
      description: "Display a progress meter above all campaigns showing total fundraising progress",
    }),
    defineField({
      name: "goalLabel",
      title: "Goal Label",
      type: "string",
      description: "Title for the goal meter (e.g., '2025 Annual Appeal')",
      hidden: ({ document }) => !document?.showOverallGoalMeter,
    }),
    defineField({
      name: "overallGoal",
      title: "Overall Goal Amount ($)",
      type: "number",
      description: "The combined fundraising target across all campaigns",
      hidden: ({ document }) => !document?.showOverallGoalMeter,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "overallRaised",
      title: "Amount Raised ($)",
      type: "number",
      description: "Current total raised (update manually or via webhook)",
      hidden: ({ document }) => !document?.showOverallGoalMeter,
      validation: (Rule) => Rule.min(0),
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
