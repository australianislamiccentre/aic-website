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
      title: "Goal Meter Element Code",
      type: "text",
      description: "Paste the Fundraise Up goal meter HTML snippet here",
      rows: 3,
    }),
    defineField({
      name: "mainDonationFormElement",
      title: "Main Donation Form Element Code",
      type: "text",
      description: "Paste the Fundraise Up general donation form HTML snippet for the /donate page",
      rows: 3,
    }),
    defineField({
      name: "recentDonationsElement",
      title: "Recent Donations Element Code",
      type: "text",
      description: "Paste the Fundraise Up recent donations ticker/list HTML snippet",
      rows: 3,
    }),
    defineField({
      name: "donationMapElement",
      title: "Donation Map Element Code",
      type: "text",
      description: "Paste the Fundraise Up world map HTML snippet",
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
