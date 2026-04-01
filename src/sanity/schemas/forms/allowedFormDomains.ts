import { defineField, defineType } from "sanity";

export default defineType({
  name: "allowedFormDomains",
  title: "Allowed Form Domains",
  type: "document",
  fields: [
    defineField({
      name: "allowedDomains",
      title: "Trusted Domains",
      type: "array",
      description:
        "Domains allowed to embed forms on event pages (e.g. jotform.com, forms.google.com). These are security-checked before rendering iframes.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "domain", title: "Domain", type: "string", description: "e.g. 'jotform.com'", validation: (Rule) => Rule.required() }),
            defineField({ name: "label", title: "Label", type: "string", description: "Human-readable name (e.g. 'JotForm')" }),
          ],
          preview: { select: { title: "label", subtitle: "domain" } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Allowed Form Domains" }) },
});
