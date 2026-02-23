/**
 * Sanity Schema: Event
 *
 * Content type for mosque events with three event modes via the
 * `eventType` radio field: "single" (one date), "multi" (date range),
 * or "recurring" (weekly day with optional end date). Includes time
 * selection, location, category, registration link, and rich-text body.
 * Consumed by the /events listing page and homepage event sections.
 *
 * @module sanity/schemas/event
 */
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
  fields: [
    // ── Status (not on page, but admin needs first) ──
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "When disabled, this event is hidden from the website entirely (listing page, homepage, and direct URL)",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
      description: "Only featured events appear on the homepage. Disabled when event is inactive.",
      readOnly: ({ document }) => document?.active === false,
      validation: (Rule) =>
        Rule.custom((featured, context) => {
          const doc = context.document as { active?: boolean } | undefined;
          if (featured && doc?.active === false) {
            return "Cannot feature an inactive event. Enable 'Active' first.";
          }
          return true;
        }),
    }),

    // ── 1. Hero Image (banner at the top of the page) ──
    defineField({
      name: "image",
      title: "Hero Image",
      type: "image",
      description: "Banner image shown at the top of the event page. Recommended: 1200x500px.",
      options: {
        hotspot: true,
      },
    }),

    // ── 2. Title, Categories, Age Group (page header area) ──
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly name (auto-generated from title)",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      description: 'Shown as coloured badges on the event page. IMPORTANT: Recurring events with Education, Youth, Sports, or Women categories are automatically treated as Programs and displayed in the "Weekly Programs" section on the Events page and homepage.',
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
      name: "ageGroup",
      title: "Age Group",
      type: "string",
      description: "Shown as a blue badge next to categories (e.g., 'Ages 5-12', 'Adults', 'All ages')",
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "string",
      description: "Shown below the title on the event page, and on event cards (max 150 chars)",
      validation: (Rule) =>
        Rule.max(150).custom((shortDesc, context) => {
          const doc = context.document as { description?: string } | undefined;
          if (!shortDesc && !doc?.description) {
            return "Either short description or full description is required";
          }
          return true;
        }),
    }),

    // ── 3. Date, Time, Location (info card) ──
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      initialValue: "single",
      description: 'How is this event scheduled? To create a PROGRAM (e.g. weekly Quran class), select "Recurring" and choose Education, Youth, Sports, or Women as the category — it will automatically appear in the Programs section on the Events page.',
      options: {
        list: [
          {
            title: "Single Day — one date only (e.g. fundraiser dinner, workshop)",
            value: "single",
          },
          {
            title: "Multi-Day — spans several days with a start and end date (e.g. camp, conference)",
            value: "multi",
          },
          {
            title: "Recurring — repeats on a set day each week (e.g. weekly class, program, Friday prayers)",
            value: "recurring",
          },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required().error("Please select an event type"),
    }),
    defineField({
      name: "date",
      title: "Event Date",
      type: "date",
      description: "The date this event takes place (Melbourne/Australia time)",
      hidden: ({ document }) => document?.eventType === "recurring",
      validation: (Rule) =>
        Rule.custom((date, context) => {
          const doc = context.document as { eventType?: string } | undefined;
          if (doc?.eventType !== "recurring" && !date) {
            return "Event date is required";
          }
          return true;
        }),
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
      description: "The last day of this event. It will be hidden from the website after this date passes.",
      hidden: ({ document }) => document?.eventType !== "multi",
      validation: (Rule) =>
        Rule.custom((endDate, context) => {
          const doc = context.document as { date?: string; eventType?: string } | undefined;
          if (doc?.eventType === "multi" && !endDate) {
            return "End date is required for multi-day events";
          }
          if (doc?.date && endDate && endDate < doc.date) {
            return "End date must be on or after the start date";
          }
          return true;
        }),
    }),
    defineField({
      name: "recurringDay",
      title: "Repeats On",
      type: "string",
      description: "Which day(s) does this event repeat?",
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
      hidden: ({ document }) => document?.eventType !== "recurring",
      validation: (Rule) =>
        Rule.custom((recurringDay, context) => {
          const doc = context.document as { eventType?: string } | undefined;
          if (doc?.eventType === "recurring" && !recurringDay) {
            return "Please select which day(s) this event repeats on";
          }
          return true;
        }),
    }),
    defineField({
      name: "recurringEndDate",
      title: "Recurring Until",
      type: "date",
      description: "Optional — leave blank if this event repeats indefinitely",
      hidden: ({ document }) => document?.eventType !== "recurring",
    }),
    defineField({
      name: "time",
      title: "Start Time",
      type: "string",
      description: "Optional — leave blank if time is flexible or TBA",
      options: {
        list: timeOptions,
      },
    }),
    defineField({
      name: "endTime",
      title: "End Time",
      type: "string",
      description: "Optional — must be after start time",
      options: {
        list: timeOptions,
      },
      validation: (Rule) =>
        Rule.custom((endTime, context) => {
          const doc = context.document as { time?: string } | undefined;
          if (!endTime || !doc?.time) return true;
          const timeToIndex = (t: string) => timeOptions.findIndex((o) => o.value === t);
          const startIdx = timeToIndex(doc.time);
          const endIdx = timeToIndex(endTime);
          if (startIdx >= 0 && endIdx >= 0 && endIdx <= startIdx) {
            return "End time must be after start time";
          }
          return true;
        }),
    }),
    defineField({
      name: "location",
      title: "Street Address",
      type: "string",
      description: "Full street address. Only change for off-site events held elsewhere.",
      initialValue: "Australian Islamic Centre - 23-27 Blenheim Rd, Newport VIC 3015",
      validation: (Rule) => Rule.required().error("Street address is required"),
    }),
    defineField({
      name: "locationDetails",
      title: "Venue / Room",
      type: "string",
      description: "Specific area within the centre (e.g., Youth Centre, Main Prayer Hall, Education Centre)",
    }),

    // ── 4. Key Features (teal pill badges above description) ──
    defineField({
      name: "keyFeatures",
      title: "Key Features",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Shown as teal badges ABOVE "About This Event". Use short phrases like "Free entry", "Halal catering", "Childcare available".',
    }),

    // ── 5. About This Event (full description) ──
    defineField({
      name: "description",
      title: "Full Description",
      type: "text",
      rows: 6,
      description: 'Shown under "About This Event" on the event detail page',
      validation: (Rule) =>
        Rule.custom((desc, context) => {
          const doc = context.document as { shortDescription?: string } | undefined;
          if (!desc && !doc?.shortDescription) {
            return "Either short description or full description is required";
          }
          return true;
        }),
    }),

    // ── 6. What to Expect (checkmark list below description) ──
    defineField({
      name: "features",
      title: "What to Expect",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Shown as a checklist BELOW the description. Describe what happens, e.g. "Guest speaker", "Q&A session", "Networking dinner".',
    }),

    // ── 7. Contact Information ──
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      description: "Shown in the Contact Information section on the event page",
      initialValue: "contact@australianislamiccentre.org",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
      description: "Shown in the Contact Information section on the event page",
      initialValue: "03 9000 0177",
    }),

    // ── 8. Action Buttons (Register, External Link) ──
    defineField({
      name: "registrationUrl",
      title: "Registration / RSVP Link",
      type: "url",
      description: 'Shows a "Register / RSVP" button on the event page',
    }),
    defineField({
      name: "externalLink",
      title: "External Website",
      type: "url",
      description: 'Shows a "Visit Website" button on the event page',
    }),

    // ── 9. Embedded Form (sidebar on event page) ──
    defineField({
      name: "formType",
      title: "Embedded Form",
      type: "string",
      description: "Choose which form to show in the sidebar of the event page",
      initialValue: "none",
      options: {
        list: [
          { title: "No form", value: "none" },
          {
            title: "Contact / Enquiry form — built-in form that sends an email to the contact email above",
            value: "contact",
          },
          {
            title: "External form embed — paste a URL from any trusted provider (JotForm, Google Forms, Typeform, etc.)",
            value: "embed",
          },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "embedFormUrl",
      title: "External Form URL",
      type: "url",
      description:
        'Paste the form URL from your provider (e.g. https://form.jotform.com/12345). The domain must be added to the Allowed Embed Domains list in Site Settings.',
      hidden: ({ document }) => document?.formType !== "embed",
      validation: (Rule) =>
        Rule.custom((url, context) => {
          const doc = context.document as { formType?: string } | undefined;
          if (doc?.formType === "embed" && !url) {
            return "Form URL is required when external form embed is selected";
          }
          if (url && typeof url === "string") {
            try {
              const parsed = new URL(url);
              if (parsed.protocol !== "https:") {
                return "Only HTTPS URLs are allowed for security";
              }
            } catch {
              return "Please enter a valid URL";
            }
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      endDate: "endDate",
      recurringDay: "recurringDay",
      eventType: "eventType",
      active: "active",
      media: "image",
    },
    prepare({ title, date, endDate, recurringDay, eventType, active, media }) {
      let subtitle = date || "";
      if (eventType === "recurring") {
        subtitle = `📋 Program — ${recurringDay || "Recurring"}`;
      } else if (eventType === "multi" && date && endDate) {
        subtitle = `${date} → ${endDate}`;
      }
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
