import { defineField, defineType } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info", default: true },
    { name: "details", title: "Details" },
    { name: "contact", title: "Contact" },
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
      type: "text",
      rows: 2,
      group: "basic",
      description: "Shown on the service card (/services page) and homepage card. Max 150 characters.",
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      group: "basic",
      of: [{ type: "block" }],
      description: "Shown on the service detail page (/services/[slug]) under 'About This Service'.",
    }),
    defineField({
      name: "highlights",
      title: "Card Highlights",
      type: "array",
      group: "basic",
      of: [{ type: "string" }],
      description: "SHORT bullet points shown on the service CARD on the /services listing page. Keep these brief (2-4 words each). E.g. 'Daily prayers', 'Spiritual guidance'.",
    }),
    defineField({
      name: "keyFeatures",
      title: "Key Features (Detail Page)",
      type: "array",
      group: "basic",
      of: [{ type: "string" }],
      description: "Detailed feature list shown on the SERVICE DETAIL PAGE (/services/[slug]) above the full description. Can be longer than card highlights. E.g. 'Daily five prayers led by qualified Imams', 'One-on-one spiritual counselling'.",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      group: "basic",
      description: "Icon shown on service cards (/services page, homepage) and the detail page header.",
      options: {
        list: [
          { title: "Moon (Shahada)", value: "Moon" },
          { title: "Heart (Nikah)", value: "Heart" },
          { title: "Book Open (Education)", value: "BookOpen" },
          { title: "Users (Community)", value: "Users" },
          { title: "Calendar (Booking)", value: "Calendar" },
          { title: "Star (Special)", value: "Star" },
          { title: "Home (Facility)", value: "Home" },
          { title: "Hands Helping (Support)", value: "HandHeart" },
          { title: "Graduation Cap (Learning)", value: "GraduationCap" },
          { title: "Mosque", value: "Church" },
          { title: "Baby (New Born)", value: "Baby" },
          { title: "Scroll (Certificate)", value: "Scroll" },
          { title: "MessageCircle (Counselling)", value: "MessageCircle" },
          { title: "Scale (Legal)", value: "Scale" },
        ],
      },
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
      description: "Shown on the service card (/services page). Recommended size: 1200×800px (3:2 ratio). Use the hotspot to control cropping.",
    }),

    // Details
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      group: "details",
      description: "Shown on the service card and detail page. E.g. 'By appointment', 'Fridays after Jumu'ah'.",
    }),
    defineField({
      name: "requirements",
      title: "Requirements",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      description: "Shown on the service detail page (/services/[slug]) under 'Requirements'. E.g. 'Valid ID', 'Two witnesses'.",
    }),
    defineField({
      name: "processSteps",
      title: "Process Steps",
      type: "array",
      group: "details",
      of: [
        {
          type: "object",
          fields: [
            { name: "step", type: "string", title: "Step" },
            { name: "description", type: "text", title: "Description", rows: 2 },
          ],
          preview: {
            select: { title: "step", subtitle: "description" },
          },
        },
      ],
      description: "Shown on the service detail page (/services/[slug]) under 'Process'. Step-by-step guide.",
    }),
    defineField({
      name: "fee",
      title: "Fee / Suggested Donation",
      type: "object",
      group: "details",
      fields: [
        defineField({
          name: "type",
          title: "Fee Type",
          type: "string",
          options: {
            list: [
              { title: "Free", value: "free" },
              { title: "Fixed Fee", value: "fixed" },
              { title: "Suggested Donation", value: "donation" },
              { title: "Contact for Pricing", value: "contact" },
            ],
            layout: "radio",
          },
          initialValue: "free",
        }),
        defineField({
          name: "amount",
          title: "Amount",
          type: "number",
          description: "Amount in dollars (if applicable)",
          hidden: ({ parent }) => parent?.type === "free" || parent?.type === "contact",
        }),
        defineField({
          name: "note",
          title: "Fee Note",
          type: "string",
          description: "Additional info about the fee",
        }),
      ],
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      group: "details",
      description: "Shown on the service detail page. E.g. '30 minutes', '1-2 hours'.",
    }),

    // Contact
    defineField({
      name: "bookingRequired",
      title: "Booking Required",
      type: "boolean",
      group: "contact",
      initialValue: false,
      description: "Shown on the service detail page. Does this service require prior booking?",
    }),
    defineField({
      name: "bookingUrl",
      title: "Online Booking URL",
      type: "url",
      group: "contact",
      description: "Link to online booking form (if available)",
      hidden: ({ document }) => !document?.bookingRequired,
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "email",
      group: "contact",
      description: "Shown on the service detail page sidebar. Falls back to site default if empty.",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
      group: "contact",
      description: "Shown on the service detail page sidebar. Falls back to site default if empty.",
    }),
    defineField({
      name: "contactPerson",
      title: "Contact Person",
      type: "string",
      group: "contact",
      description: "Name of the person to contact. Shown on the service detail page.",
    }),
    defineField({
      name: "formRecipientEmail",
      title: "Form Recipient Email",
      type: "email",
      group: "contact",
      description: "Email that receives inquiry form submissions for this service. If empty, falls back to the global service inquiry email in Form Settings.",
    }),

    // Settings
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "settings",
      description: "When enabled, this service appears in the 'What's On' section on the homepage.",
      initialValue: false,
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      group: "settings",
      description: "When enabled, this service is shown on the /services listing page and detail page.",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      group: "settings",
      description: "Controls display order on the /services page. Lower numbers appear first.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      active: "active",
      featured: "featured",
      media: "image",
    },
    prepare({ title, active, featured, media }) {
      const badges = [];
      if (featured) badges.push("⭐");
      if (active === false) badges.push("(Inactive)");
      return {
        title: `${badges.join(" ")} ${title}`.trim(),
        media,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
