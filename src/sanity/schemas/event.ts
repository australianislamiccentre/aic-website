import { defineField, defineType } from "sanity";

// Time options in 30-minute intervals (full 24 hours)
const timeOptions = [
  { title: "12:00 AM", value: "12:00 AM" },
  { title: "12:30 AM", value: "12:30 AM" },
  { title: "1:00 AM", value: "1:00 AM" },
  { title: "1:30 AM", value: "1:30 AM" },
  { title: "2:00 AM", value: "2:00 AM" },
  { title: "2:30 AM", value: "2:30 AM" },
  { title: "3:00 AM", value: "3:00 AM" },
  { title: "3:30 AM", value: "3:30 AM" },
  { title: "4:00 AM", value: "4:00 AM" },
  { title: "4:30 AM", value: "4:30 AM" },
  { title: "5:00 AM", value: "5:00 AM" },
  { title: "5:30 AM", value: "5:30 AM" },
  { title: "6:00 AM", value: "6:00 AM" },
  { title: "6:30 AM", value: "6:30 AM" },
  { title: "7:00 AM", value: "7:00 AM" },
  { title: "7:30 AM", value: "7:30 AM" },
  { title: "8:00 AM", value: "8:00 AM" },
  { title: "8:30 AM", value: "8:30 AM" },
  { title: "9:00 AM", value: "9:00 AM" },
  { title: "9:30 AM", value: "9:30 AM" },
  { title: "10:00 AM", value: "10:00 AM" },
  { title: "10:30 AM", value: "10:30 AM" },
  { title: "11:00 AM", value: "11:00 AM" },
  { title: "11:30 AM", value: "11:30 AM" },
  { title: "12:00 PM", value: "12:00 PM" },
  { title: "12:30 PM", value: "12:30 PM" },
  { title: "1:00 PM", value: "1:00 PM" },
  { title: "1:30 PM", value: "1:30 PM" },
  { title: "2:00 PM", value: "2:00 PM" },
  { title: "2:30 PM", value: "2:30 PM" },
  { title: "3:00 PM", value: "3:00 PM" },
  { title: "3:30 PM", value: "3:30 PM" },
  { title: "4:00 PM", value: "4:00 PM" },
  { title: "4:30 PM", value: "4:30 PM" },
  { title: "5:00 PM", value: "5:00 PM" },
  { title: "5:30 PM", value: "5:30 PM" },
  { title: "6:00 PM", value: "6:00 PM" },
  { title: "6:30 PM", value: "6:30 PM" },
  { title: "7:00 PM", value: "7:00 PM" },
  { title: "7:30 PM", value: "7:30 PM" },
  { title: "8:00 PM", value: "8:00 PM" },
  { title: "8:30 PM", value: "8:30 PM" },
  { title: "9:00 PM", value: "9:00 PM" },
  { title: "9:30 PM", value: "9:30 PM" },
  { title: "10:00 PM", value: "10:00 PM" },
  { title: "10:30 PM", value: "10:30 PM" },
  { title: "11:00 PM", value: "11:00 PM" },
  { title: "11:30 PM", value: "11:30 PM" },
];

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info", default: true },
    { name: "schedule", title: "Schedule" },
    { name: "details", title: "Details" },
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
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "string",
      group: "basic",
      description: "Brief summary for event cards (max 150 characters). Required if no full description.",
      validation: (Rule) =>
        Rule.max(150).custom((shortDesc, context) => {
          const doc = context.document as { description?: string } | undefined;
          if (!shortDesc && !doc?.description) {
            return "Either short description or full description is required";
          }
          return true;
        }),
    }),
    defineField({
      name: "description",
      title: "Full Description",
      type: "text",
      group: "basic",
      rows: 6,
      description: "Detailed description shown on the event page. Required if no short description.",
      validation: (Rule) =>
        Rule.custom((desc, context) => {
          const doc = context.document as { shortDescription?: string } | undefined;
          if (!desc && !doc?.shortDescription) {
            return "Either short description or full description is required";
          }
          return true;
        }),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "basic",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Prayer", value: "Prayer" },
          { title: "Education", value: "Education" },
          { title: "Community", value: "Community" },
          { title: "Youth", value: "Youth" },
          { title: "Sports", value: "Sports" },
          { title: "Women", value: "Women" },
          { title: "Charity", value: "Charity" },
          { title: "Special Event", value: "Special Event" },
        ],
        layout: "grid",
      },
      validation: (Rule) => Rule.required().min(1).error("At least one category is required"),
    }),
    defineField({
      name: "features",
      title: "Key Features",
      type: "array",
      group: "basic",
      of: [{ type: "string" }],
      description: "Highlights or bullet points (e.g., 'Qualified instructors', 'All skill levels welcome')",
    }),

    // Schedule
    defineField({
      name: "recurring",
      title: "Is Recurring Event?",
      type: "boolean",
      group: "schedule",
      initialValue: false,
      description: "Toggle on for weekly/regular programs",
    }),
    defineField({
      name: "date",
      title: "Start Date",
      type: "date",
      group: "schedule",
      description: "Event start date (Melbourne/Australia time)",
      hidden: ({ document }) => document?.recurring === true,
      validation: (Rule) =>
        Rule.custom((date, context) => {
          const doc = context.document as { recurring?: boolean } | undefined;
          if (!doc?.recurring && !date) {
            return "Start date is required for non-recurring events";
          }
          return true;
        }),
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
      group: "schedule",
      description: "Optional - for multi-day events",
      hidden: ({ document }) => document?.recurring === true,
    }),
    defineField({
      name: "recurringDay",
      title: "Recurring Day",
      type: "string",
      group: "schedule",
      options: {
        list: [
          { title: "Every Monday", value: "Mondays" },
          { title: "Every Tuesday", value: "Tuesdays" },
          { title: "Every Wednesday", value: "Wednesdays" },
          { title: "Every Thursday", value: "Thursdays" },
          { title: "Every Friday", value: "Fridays" },
          { title: "Every Saturday", value: "Saturdays" },
          { title: "Every Sunday", value: "Sundays" },
          { title: "Weekends (Sat & Sun)", value: "Weekends" },
          { title: "Weekdays (Mon-Fri)", value: "Weekdays" },
          { title: "Daily", value: "Daily" },
        ],
      },
      hidden: ({ document }) => document?.recurring !== true,
      validation: (Rule) =>
        Rule.custom((recurringDay, context) => {
          const doc = context.document as { recurring?: boolean } | undefined;
          if (doc?.recurring && !recurringDay) {
            return "Recurring day is required for recurring events";
          }
          return true;
        }),
    }),
    defineField({
      name: "recurringEndDate",
      title: "Recurring Until",
      type: "date",
      group: "schedule",
      description: "Optional - when does this recurring event stop?",
      hidden: ({ document }) => document?.recurring !== true,
    }),
    defineField({
      name: "time",
      title: "Start Time",
      type: "string",
      group: "schedule",
      options: {
        list: timeOptions,
      },
      validation: (Rule) => Rule.required().error("Start time is required"),
    }),
    defineField({
      name: "endTime",
      title: "End Time",
      type: "string",
      group: "schedule",
      description: "Optional",
      options: {
        list: timeOptions,
      },
    }),

    // Details
    defineField({
      name: "location",
      title: "Street Address",
      type: "string",
      group: "details",
      description: "Full street address. Only change for off-site events held elsewhere.",
      initialValue: "Australian Islamic Centre - 23-27 Blenheim Rd, Newport VIC 3015",
      validation: (Rule) => Rule.required().error("Street address is required"),
    }),
    defineField({
      name: "locationDetails",
      title: "Venue / Room",
      type: "string",
      group: "details",
      description: "Specific area within the centre (e.g., Youth Centre, Main Prayer Hall, Education Centre)",
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration/RSVP Link",
      type: "url",
      group: "details",
      description: "External link for registration (if required)",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      group: "details",
      description: "Email for inquiries about this event",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
      group: "details",
      description: "Phone number for inquiries",
    }),
    defineField({
      name: "ageGroup",
      title: "Age Group",
      type: "string",
      group: "details",
      description: "Target age range (e.g., 'Ages 5-12', 'Adults', 'All ages')",
    }),
    defineField({
      name: "externalLink",
      title: "External Website",
      type: "url",
      group: "details",
      description: "Link to external website for more info (e.g., program website)",
    }),

    // Settings
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      group: "settings",
      initialValue: false,
      description: "Show this event prominently on the homepage",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      group: "settings",
      description: "Show this event on the website",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      recurringDay: "recurringDay",
      recurring: "recurring",
      active: "active",
      media: "image",
    },
    prepare({ title, date, recurringDay, recurring, active, media }) {
      const subtitle = recurring ? `📅 ${recurringDay}` : date;
      return {
        title: `${title}${active === false ? " (Inactive)" : ""}`,
        subtitle,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Date, Newest First",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Date, Oldest First",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
