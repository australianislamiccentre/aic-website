import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactFormSettings",
  title: "Contact Form",
  type: "document",
  fields: [
    defineField({ name: "contactEnabled", title: "Form Enabled", type: "boolean", initialValue: true, description: "Toggle to enable or disable the contact form" }),
    defineField({ name: "contactRecipientEmail", title: "Recipient Email", type: "email", description: "Email address that receives contact form submissions" }),
    defineField({ name: "contactHeading", title: "Page Heading", type: "string", description: "Main heading on the /contact page (e.g. 'Get in')" }),
    defineField({ name: "contactHeadingAccent", title: "Heading Accent Word", type: "string", description: "Word shown in teal colour in the heading" }),
    defineField({ name: "contactDescription", title: "Page Description", type: "text", rows: 3, description: "Paragraph shown below the heading on the contact page" }),
    defineField({ name: "contactFormHeading", title: "Form Section Heading", type: "string", description: "Heading above the form fields (e.g. 'Send Us a Message')" }),
    defineField({ name: "contactFormDescription", title: "Form Section Description", type: "text", rows: 2, description: "Text shown above the form fields" }),
    defineField({
      name: "contactInquiryTypes",
      title: "Enquiry Type Options",
      type: "array",
      description: "Options in the 'Enquiry Type' dropdown on the contact form",
      of: [{ type: "string" }],
    }),
    defineField({ name: "contactSuccessHeading", title: "Success Heading", type: "string", description: "Shown after the form is successfully submitted" }),
    defineField({ name: "contactSuccessMessage", title: "Success Message", type: "text", rows: 2, description: "Body text shown after successful submission" }),
  ],
  preview: { prepare: () => ({ title: "Contact Form" }) },
});
