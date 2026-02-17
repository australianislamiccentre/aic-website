import { defineField, defineType } from "sanity";

export default defineType({
  name: "donationGoalMeter",
  title: "Donation Goal Meter",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Enable Goal Meter",
      type: "boolean",
      initialValue: false,
      description: "Toggle to show/hide the goal meter on the donate modal and page",
    }),
    defineField({
      name: "fundraiseUpElement",
      title: "Fundraise Up Element Code",
      type: "text",
      description: "Paste the Fundraise Up goal meter HTML snippet here (e.g., <a href=\"#XJAKPSNE\" style=\"display: none\"></a>)",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      enabled: "enabled",
    },
    prepare({ enabled }) {
      return {
        title: "Donation Goal Meter",
        subtitle: enabled ? "Enabled" : "Disabled",
      };
    },
  },
});
