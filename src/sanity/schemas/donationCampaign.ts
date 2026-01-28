import { defineField, defineType } from "sanity";

export default defineType({
  name: "donationCampaign",
  title: "Donation Campaign",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info", default: true },
    { name: "schedule", title: "Campaign Schedule" },
    { name: "payment", title: "Payment Options" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    // Basic Info Group
    defineField({
      name: "title",
      title: "Campaign Title",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required(),
      description: "e.g., 'Ramadan Daily Donations 2025'",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      description: "URL path: /campaigns/[slug]",
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
      group: "basic",
      validation: (Rule) => Rule.required().max(200),
      description: "Brief description shown in campaign cards (max 200 characters)",
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      of: [{ type: "block" }],
      group: "basic",
      description: "Detailed description shown on campaign page",
    }),
    defineField({
      name: "image",
      title: "Campaign Image",
      type: "image",
      group: "basic",
      options: { hotspot: true },
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Moon (Ramadan)", value: "Moon" },
          { title: "Heart (General)", value: "Heart" },
          { title: "Star (Special)", value: "Star" },
          { title: "Gift (Sadaqah)", value: "Gift" },
          { title: "Calendar (Scheduled)", value: "Calendar" },
          { title: "Sunrise (Daily)", value: "Sunrise" },
          { title: "Sun (Last 10 Days)", value: "Sun" },
          { title: "Sparkles (Special Occasion)", value: "Sparkles" },
        ],
      },
      initialValue: "Moon",
    }),

    // Schedule Group
    defineField({
      name: "startDate",
      title: "Campaign Start Date",
      type: "date",
      group: "schedule",
      validation: (Rule) => Rule.required(),
      description: "First day donations will be charged",
    }),
    defineField({
      name: "endDate",
      title: "Campaign End Date",
      type: "date",
      group: "schedule",
      validation: (Rule) =>
        Rule.custom((endDate, context) => {
          const startDate = (context.document as { startDate?: string })
            ?.startDate;
          if (startDate && endDate && endDate < startDate) {
            return "End date must be after start date";
          }
          return true;
        }),
      description: "Last day donations will be charged. Leave empty for ongoing campaigns.",
    }),
    defineField({
      name: "isOngoing",
      title: "Ongoing Campaign",
      type: "boolean",
      group: "schedule",
      initialValue: false,
      description: "Check this for campaigns that run indefinitely (no end date)",
    }),
    defineField({
      name: "signupStartDate",
      title: "Signup Opens Date",
      type: "date",
      group: "schedule",
      description:
        "When donors can start signing up (optional, defaults to immediately)",
    }),
    defineField({
      name: "signupEndDate",
      title: "Signup Closes Date",
      type: "date",
      group: "schedule",
      description:
        "Last day to sign up (optional, defaults to campaign end date)",
    }),

    // Payment Group
    defineField({
      name: "presetAmounts",
      title: "Preset Daily Amounts",
      type: "array",
      of: [{ type: "number" }],
      group: "payment",
      description: "Quick-select daily amounts (e.g., 1, 3, 5, 10)",
      initialValue: [1, 3, 5, 10],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "allowCustomAmount",
      title: "Allow Custom Amount",
      type: "boolean",
      group: "payment",
      initialValue: true,
      description: "Let donors enter their own daily amount",
    }),
    defineField({
      name: "minimumAmount",
      title: "Minimum Daily Amount ($)",
      type: "number",
      group: "payment",
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "maximumAmount",
      title: "Maximum Daily Amount ($)",
      type: "number",
      group: "payment",
      description: "Optional cap on daily donation",
    }),

    // Settings Group
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      group: "settings",
      initialValue: true,
      description: "Make this campaign visible on the website",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "settings",
      initialValue: false,
      description: "Show prominently on homepage",
    }),
    defineField({
      name: "goal",
      title: "Fundraising Goal ($)",
      type: "number",
      group: "settings",
      description: "Optional target amount for the entire campaign",
    }),
    defineField({
      name: "raised",
      title: "Amount Raised ($)",
      type: "number",
      group: "settings",
      initialValue: 0,
      description: "Updated via webhook or manually",
    }),
    defineField({
      name: "subscriberCount",
      title: "Number of Subscribers",
      type: "number",
      group: "settings",
      initialValue: 0,
      readOnly: true,
      description: "Auto-updated when donors sign up",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      group: "settings",
      description: "Lower numbers appear first",
    }),
  ],
  preview: {
    select: {
      title: "title",
      startDate: "startDate",
      endDate: "endDate",
      isOngoing: "isOngoing",
      active: "active",
      featured: "featured",
      media: "image",
    },
    prepare({ title, startDate, endDate, isOngoing, active, featured, media }) {
      const badges = [];
      if (!active) badges.push("Inactive");
      if (featured) badges.push("Featured");
      if (isOngoing) badges.push("Ongoing");

      const status = badges.length > 0 ? `[${badges.join(", ")}] ` : "";
      let dates = "Dates not set";
      if (startDate) {
        dates = isOngoing ? `From ${startDate} (ongoing)` :
                endDate ? `${startDate} to ${endDate}` : `From ${startDate}`;
      }

      return {
        title: `${status}${title}`,
        subtitle: dates,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Start Date, Newest",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
    {
      title: "Start Date, Oldest",
      name: "startDateAsc",
      by: [{ field: "startDate", direction: "asc" }],
    },
    {
      title: "Display Order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "startDate", direction: "asc" },
      ],
    },
  ],
});
