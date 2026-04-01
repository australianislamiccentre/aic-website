import { defineField, defineType } from "sanity";

export default defineType({
  name: "eventInquiryFormSettings",
  title: "Event Inquiry Form",
  type: "document",
  fields: [
    defineField({ name: "eventInquiryEnabled", title: "Form Enabled", type: "boolean", initialValue: true, description: "Toggle to enable or disable the event inquiry form" }),
    defineField({ name: "eventInquiryRecipientEmail", title: "Recipient Email", type: "email", description: "Receives event inquiry submissions. Falls back to Contact Form recipient if empty." }),
  ],
  preview: { prepare: () => ({ title: "Event Inquiry Form" }) },
});
