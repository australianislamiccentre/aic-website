import { defineField, defineType } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    // ── Status ──
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "When disabled, this service is hidden from the website entirely (listing page, homepage, and direct URL)",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      description: "Only featured services appear on the homepage. Disabled when inactive.",
      initialValue: false,
      readOnly: ({ document }) => document?.active === false,
      validation: (Rule) =>
        Rule.custom((featured, context) => {
          const doc = context.document as { active?: boolean } | undefined;
          if (featured && doc?.active === false) {
            return "Cannot feature an inactive service. Enable 'Active' first.";
          }
          return true;
        }),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls display order on both the /services page and homepage. Lower numbers appear first.",
    }),

    // ── 1. Hero Image (banner at the top of the page) ──
    defineField({
      name: "image",
      title: "Hero Image",
      type: "image",
      description: "Banner image shown at the top of the service page and on service cards. Recommended: 1200×800px (3:2 ratio).",
      options: {
        hotspot: true,
      },
    }),

    // ── 2. Title & Icon (page header) ──
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
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Icon shown next to the title on the service page and on service cards.",
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
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 2,
      description: "Shown below the title on the service page and on service cards. Max 150 characters.",
      validation: (Rule) => Rule.required().max(150),
    }),

    // ── 3. Main Content (left column) ──
    defineField({
      name: "highlights",
      title: "Card Highlights",
      type: "array",
      of: [{ type: "string" }],
      description: "Short bullet points on the service card only (2-4 words each). E.g. 'Daily prayers', 'Spiritual guidance'.",
    }),
    defineField({
      name: "keyFeatures",
      title: "Key Features (Detail Page)",
      type: "array",
      of: [{ type: "string" }],
      description: "Detailed feature list shown on the service detail page. E.g. 'Daily five prayers led by qualified Imams'.",
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Rich text content shown under 'About This Service' on the detail page.",
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

    // ── 4. Sidebar Details ──
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      description: "Shown in the sidebar details card. E.g. 'By appointment', 'Fridays after Jumu'ah'.",
    }),
    defineField({
      name: "fee",
      title: "Fee / Suggested Donation",
      type: "object",
      description: "Shown in the sidebar details card.",
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

    // ── 5. Contact (sidebar) ──
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "email",
      description: "Shown in the sidebar contact section. Falls back to site default if empty.",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
      description: "Shown in the sidebar contact section. Falls back to site default if empty.",
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
