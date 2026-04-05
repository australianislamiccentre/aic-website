/**
 * Sanity Schema: Site Settings (singleton)
 *
 * Global configuration document for the organisation. Stores the
 * organisation name, short name, tagline, parent organisation, logo,
 * physical address, phone number, email, and social media / external
 * links. Consumed site-wide in the header, footer, and meta tags.
 *
 * @module sanity/schemas/siteSettings
 */
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
      type: "string",
      description: "Displayed site-wide in the footer and contact page. e.g. 'Open Daily from Fajr to Isha'",
      initialValue: "Open Daily from Fajr to Isha",
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

    // ── 4. Trusted Embed Domains ──
    defineField({
      name: "allowedEmbedDomains",
      title: "Trusted Embed Domains",
      type: "array",
      description:
        "For security, the site only allows iframes/embeds from domains listed here. " +
        "If an embedded form or video isn't loading, add its domain to this list. " +
        "Example: if a JotForm registration form isn't showing on an event page, add 'form.jotform.com' here.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "domain",
              title: "Domain",
              type: "string",
              placeholder: "e.g. form.jotform.com",
              description:
                "Enter just the domain (e.g. 'form.jotform.com'), not a full URL.",
              validation: (Rule) =>
                Rule.required()
                  .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
                    name: "domain",
                    invert: false,
                  })
                  .error("Enter just the domain (e.g. form.jotform.com), not a full URL"),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              placeholder: "e.g. JotForm",
              description: "A friendly name so you remember what this domain is for.",
            }),
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              options: {
                list: [
                  { title: "Form Provider", value: "form" },
                  { title: "Video / Media", value: "video" },
                  { title: "Map / Location", value: "map" },
                  { title: "Other", value: "other" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "form",
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "domain", category: "category" },
            prepare({ title, subtitle, category }: { title?: string; subtitle?: string; category?: string }) {
              const categoryLabels: Record<string, string> = {
                form: "Form",
                video: "Video",
                map: "Map",
                other: "Other",
              };
              return {
                title: title || subtitle,
                subtitle: `${subtitle}${category ? ` · ${categoryLabels[category] || category}` : ""}`,
              };
            },
          },
        },
      ],
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
