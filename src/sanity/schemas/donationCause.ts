import { defineField, defineType } from "sanity";

export default defineType({
  name: "donationCause",
  title: "Donation Cause",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info", default: true },
    { name: "campaign", title: "Campaign Details" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    // Basic Info
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: "URL-friendly identifier for dedicated donation page",
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
      group: "basic",
      validation: (Rule) => Rule.required(),
      description: "Brief description for cards (max 200 characters)",
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      group: "basic",
      of: [{ type: "block" }],
      description: "Detailed description for the donation page",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
      description: "Compelling image for this cause",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Heart (General)", value: "Heart" },
          { title: "Book Open (Education)", value: "BookOpen" },
          { title: "Users (Community)", value: "Users" },
          { title: "Home (Building/Facility)", value: "Home" },
          { title: "Hands Helping (Welfare)", value: "HandHeart" },
          { title: "Star (Special)", value: "Star" },
          { title: "Gift (Sadaqah)", value: "Gift" },
          { title: "Building (Construction)", value: "Building" },
          { title: "Utensils (Food/Iftar)", value: "Utensils" },
          { title: "Shirt (Clothing)", value: "Shirt" },
          { title: "Droplet (Water)", value: "Droplet" },
          { title: "Stethoscope (Medical)", value: "Stethoscope" },
        ],
      },
    }),

    // Campaign Details
    defineField({
      name: "campaignType",
      title: "Campaign Type",
      type: "string",
      group: "campaign",
      options: {
        list: [
          { title: "Ongoing (no end date)", value: "ongoing" },
          { title: "Time-Limited Campaign", value: "campaign" },
          { title: "Emergency Appeal", value: "emergency" },
        ],
        layout: "radio",
      },
      initialValue: "ongoing",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      group: "campaign",
      hidden: ({ document }) => document?.campaignType === "ongoing",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
      group: "campaign",
      hidden: ({ document }) => document?.campaignType === "ongoing",
      description: "Campaign will auto-hide after this date",
    }),
    defineField({
      name: "goal",
      title: "Fundraising Goal",
      type: "number",
      group: "campaign",
      description: "Target amount in dollars (leave empty for no goal)",
    }),
    defineField({
      name: "raised",
      title: "Amount Raised",
      type: "number",
      group: "campaign",
      description: "Current amount raised (update manually or via integration)",
      initialValue: 0,
    }),
    defineField({
      name: "showProgress",
      title: "Show Progress Bar",
      type: "boolean",
      group: "campaign",
      description: "Display progress towards goal",
      initialValue: true,
      hidden: ({ document }) => !document?.goal,
    }),

    // Payment
    defineField({
      name: "paymentOptions",
      title: "Payment Options",
      type: "object",
      group: "campaign",
      fields: [
        defineField({
          name: "useDefaultPayment",
          title: "Use Default Payment (Stripe)",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "externalPaymentUrl",
          title: "External Payment Link",
          type: "url",
          description: "Link to external payment page (PayPal, GoFundMe, etc.)",
          hidden: ({ parent }) => parent?.useDefaultPayment,
        }),
        defineField({
          name: "suggestedAmounts",
          title: "Suggested Donation Amounts",
          type: "array",
          of: [{ type: "number" }],
          description: "Quick-select amounts (e.g., 25, 50, 100, 250)",
        }),
        defineField({
          name: "allowCustomAmount",
          title: "Allow Custom Amount",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "allowRecurring",
          title: "Allow Recurring Donations",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),

    // Settings
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "settings",
      description: "Show prominently on homepage",
      initialValue: false,
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Normal", value: "normal" },
          { title: "High (highlighted)", value: "high" },
          { title: "Urgent (emergency appeal)", value: "urgent" },
        ],
        layout: "radio",
      },
      initialValue: "normal",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      group: "settings",
      description: "Show this cause on the donation page",
      initialValue: true,
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
      active: "active",
      featured: "featured",
      priority: "priority",
      goal: "goal",
      raised: "raised",
      media: "image",
    },
    prepare({ title, active, featured, priority, goal, raised, media }) {
      const badges = [];
      if (priority === "urgent") badges.push("🚨");
      if (priority === "high") badges.push("⚡");
      if (featured) badges.push("⭐");
      if (active === false) badges.push("(Inactive)");

      const progress = goal && raised !== undefined ? `$${raised.toLocaleString()}/$${goal.toLocaleString()}` : "";

      return {
        title: `${badges.join(" ")} ${title}`.trim(),
        subtitle: progress,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Priority",
      name: "priorityDesc",
      by: [
        { field: "priority", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
