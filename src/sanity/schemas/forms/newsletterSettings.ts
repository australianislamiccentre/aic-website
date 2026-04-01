import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsletterSettings",
  title: "Newsletter",
  type: "document",
  fields: [
    defineField({ name: "newsletterEnabled", title: "Newsletter Enabled", type: "boolean", initialValue: true, description: "Toggle to enable or disable newsletter subscriptions" }),
    defineField({ name: "newsletterRecipientEmail", title: "Recipient Email", type: "email", description: "Receives newsletter subscription notifications" }),
    defineField({ name: "newsletterHeading", title: "Footer Heading", type: "string", description: "Heading shown in the footer newsletter section" }),
    defineField({ name: "newsletterDescription", title: "Footer Description", type: "text", rows: 2, description: "Description shown in the footer newsletter section" }),
    defineField({ name: "newsletterButtonText", title: "Subscribe Button Text", type: "string", description: "Label on the subscribe button (e.g. 'Subscribe')" }),
    defineField({ name: "newsletterSuccessMessage", title: "Success Message", type: "string", description: "Shown after a visitor subscribes" }),
  ],
  preview: { prepare: () => ({ title: "Newsletter" }) },
});
