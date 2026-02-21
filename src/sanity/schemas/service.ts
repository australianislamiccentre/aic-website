import { defineField, defineType } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    // ── 1. Status ──
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Show this service on the website",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show this service in the 'What's On' section on the homepage",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls display order on the /services page. Lower numbers appear first.",
    }),

    // ── 2. Title & Description ──
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
      description: "Shown on the service card and homepage. Max 150 characters.",
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Detailed content shown on the service detail page.",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Shown on the service card. Recommended: 1200×800px (3:2 ratio).",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Icon shown on service cards and the detail page header.",
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

    // ── 3. Card & Detail Page Content ──
    defineField({
      name: "highlights",
      title: "Card Highlights",
      type: "array",
      of: [{ type: "string" }],
      description: "Short bullet points on the service card (2-4 words each). E.g. 'Daily prayers', 'Spiritual guidance'.",
    }),
    defineField({
      name: "keyFeatures",
      title: "Key Features (Detail Page)",
      type: "array",
      of: [{ type: "string" }],
      description: "Detailed feature list on the service detail page. E.g. 'Daily five prayers led by qualified Imams'.",
    }),

    // ── 4. Service Details ──
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      description: "E.g. 'By appointment', 'Fridays after Jumu'ah'.",
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: "E.g. '30 minutes', '1-2 hours'.",
    }),
    defineField({
      name: "fee",
      title: "Fee / Suggested Donation",
      type: "object",
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
      name: "requirements",
      title: "Requirements",
      type: "array",
      of: [{ type: "string" }],
      description: "E.g. 'Valid ID', 'Two witnesses'.",
    }),
    defineField({
      name: "processSteps",
      title: "Process Steps",
      type: "array",
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
      description: "Step-by-step guide shown on the detail page.",
    }),

    // ── 5. Booking & Contact ──
    defineField({
      name: "bookingRequired",
      title: "Booking Required",
      type: "boolean",
      initialValue: false,
      description: "Does this service require prior booking?",
    }),
    defineField({
      name: "bookingUrl",
      title: "Online Booking URL",
      type: "url",
      description: "Link to online booking form (if available)",
      hidden: ({ document }) => !document?.bookingRequired,
    }),
    defineField({
      name: "contactPerson",
      title: "Contact Person",
      type: "string",
      description: "Name of the person to contact",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "email",
      description: "Falls back to site default if empty",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
      description: "Falls back to site default if empty",
    }),
    defineField({
      name: "formRecipientEmail",
      title: "Form Recipient Email",
      type: "email",
      description: "Email that receives inquiry form submissions. Falls back to global service inquiry email if empty.",
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
