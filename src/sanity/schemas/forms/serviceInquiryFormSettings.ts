import { defineField, defineType } from "sanity";

export default defineType({
  name: "serviceInquiryFormSettings",
  title: "Service Inquiry Form",
  type: "document",
  fields: [
    defineField({ name: "serviceInquiryEnabled", title: "Form Enabled", type: "boolean", initialValue: true, description: "Toggle to enable or disable the service inquiry form" }),
    defineField({ name: "serviceInquiryRecipientEmail", title: "Recipient Email", type: "email", description: "Receives service inquiry submissions" }),
    defineField({ name: "serviceInquiryFormHeading", title: "Form Heading", type: "string", description: "Heading shown above the service inquiry form" }),
    defineField({ name: "serviceInquiryFormDescription", title: "Form Description", type: "text", rows: 2, description: "Text shown above the form fields" }),
    defineField({ name: "serviceInquirySuccessHeading", title: "Success Heading", type: "string", description: "Shown after successful submission" }),
    defineField({ name: "serviceInquirySuccessMessage", title: "Success Message", type: "text", rows: 2, description: "Body text shown after successful submission" }),
  ],
  preview: { prepare: () => ({ title: "Service Inquiry Form" }) },
});
