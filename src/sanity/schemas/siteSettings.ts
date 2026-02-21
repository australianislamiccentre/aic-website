import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    // ── 1. Organization ──
    defineField({
      name: "organizationName",
      title: "Organization Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      initialValue: "Australian Islamic Centre",
    }),
    defineField({
      name: "shortName",
      title: "Short Name",
      type: "string",
      description: "Abbreviated name (e.g., AIC)",
      initialValue: "AIC",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "text",
      rows: 2,
      description: "Main tagline displayed on the homepage",
    }),
    defineField({
      name: "parentOrganization",
      title: "Parent Organization",
      type: "string",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      description: "Main organization logo",
    }),
    defineField({
      name: "logoAlt",
      title: "Logo (Light Version)",
      type: "image",
      options: { hotspot: true },
      description: "Light version for dark backgrounds",
    }),

    // ── 2. Contact & Location ──
    defineField({
      name: "address",
      title: "Address",
      type: "object",
      fields: [
        defineField({ name: "street", title: "Street Address", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "suburb", title: "Suburb", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "state", title: "State", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "postcode", title: "Postcode", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "country", title: "Country", type: "string", initialValue: "Australia" }),
      ],
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "email",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Google Maps URL",
      type: "url",
    }),
    defineField({
      name: "operatingHours",
      title: "Operating Hours",
      type: "object",
      fields: [
        defineField({ name: "weekdays", title: "Weekdays", type: "string", description: "e.g., '9:00 AM - 5:00 PM'" }),
        defineField({ name: "weekends", title: "Weekends", type: "string", description: "e.g., '10:00 AM - 2:00 PM'" }),
        defineField({ name: "notes", title: "Notes", type: "string", description: "e.g., 'Open for all prayer times'" }),
      ],
    }),

    // ── 3. Social Media ──
    defineField({
      name: "socialMedia",
      title: "Social Media",
      type: "object",
      fields: [
        defineField({ name: "facebook", title: "Facebook URL", type: "url" }),
        defineField({ name: "instagram", title: "Instagram URL", type: "url" }),
        defineField({ name: "youtube", title: "YouTube URL", type: "url" }),
        defineField({ name: "twitter", title: "Twitter/X URL", type: "url" }),
        defineField({ name: "tiktok", title: "TikTok URL", type: "url" }),
        defineField({ name: "whatsapp", title: "WhatsApp Number/Link", type: "string" }),
        defineField({ name: "telegram", title: "Telegram Channel/Group", type: "url" }),
      ],
    }),

    // ── 4. Homepage Content ──
    defineField({
      name: "heroSlides",
      title: "Hero Slides",
      type: "array",
      of: [
        {
          type: "object",
          name: "heroSlide",
          title: "Hero Slide",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "subtitle", title: "Subtitle", type: "text", rows: 2 }),
            defineField({ name: "image", title: "Background Image", type: "image", options: { hotspot: true }, validation: (Rule) => Rule.required() }),
            defineField({ name: "overlay", title: "Overlay Darkness", type: "number", description: "0 = no overlay, 100 = fully dark", initialValue: 50, validation: (Rule) => Rule.min(0).max(100) }),
            defineField({
              name: "primaryButton",
              title: "Primary Button",
              type: "object",
              fields: [
                { name: "label", type: "string", title: "Label" },
                { name: "url", type: "url", title: "URL", validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }) },
              ],
            }),
            defineField({
              name: "secondaryButton",
              title: "Secondary Button",
              type: "object",
              fields: [
                { name: "label", type: "string", title: "Label" },
                { name: "url", type: "url", title: "URL", validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }) },
              ],
            }),
            defineField({ name: "active", title: "Active", type: "boolean", initialValue: true }),
          ],
          preview: {
            select: { title: "title", active: "active", media: "image" },
            prepare({ title, active, media }) {
              return { title: `${active === false ? "(Inactive) " : ""}${title}`, media };
            },
          },
        },
      ],
      description: "Hero slides for the homepage carousel",
    }),
    defineField({
      name: "welcomeSection",
      title: "Welcome Section",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
        defineField({ name: "content", title: "Content", type: "array", of: [{ type: "block" }] }),
        defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
        defineField({
          name: "stats",
          title: "Statistics",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "value", type: "string", title: "Value" },
                { name: "label", type: "string", title: "Label" },
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            },
          ],
          description: "e.g., '5000+' 'Community Members'",
        }),
      ],
      description: "Welcome/About section on homepage",
    }),
    defineField({
      name: "ctaBanner",
      title: "Call-to-Action Banner",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
        defineField({ name: "buttonLabel", title: "Button Label", type: "string" }),
        defineField({ name: "buttonUrl", title: "Button URL", type: "url", validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }) }),
        defineField({ name: "backgroundImage", title: "Background Image", type: "image", options: { hotspot: true } }),
      ],
      description: "Promotional banner section on homepage",
    }),

    // ── 5. External Links ──
    defineField({
      name: "externalLinks",
      title: "External Links",
      type: "object",
      description: "Links to related websites and services",
      fields: [
        defineField({ name: "college", title: "College Website", type: "url" }),
        defineField({ name: "bookstore", title: "Bookstore Website", type: "url" }),
        defineField({ name: "sportsClub", title: "Sports Club Website", type: "url" }),
      ],
    }),
    defineField({
      name: "quickLinks",
      title: "Footer Quick Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "url", type: "url", title: "URL", validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }) },
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
      description: "Custom links for the footer",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
        subtitle: "Organization information and homepage content",
      };
    },
  },
});
