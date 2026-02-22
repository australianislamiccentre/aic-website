import { defineField, defineType } from "sanity";

export default defineType({
  name: "formSettings",
  title: "Form Settings",
  type: "document",
  fields: [
    // ── Contact Form ──
    defineField({
      name: "contactEnabled",
      title: "Contact Form Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "contactRecipientEmail",
      title: "Contact Recipient Email",
      type: "email",
      description: "Email that receives contact form submissions",
    }),
    defineField({
      name: "contactHeading",
      title: "Contact Page Heading",
      type: "string",
      description: "Main heading text (e.g. 'Get in')",
    }),
    defineField({
      name: "contactHeadingAccent",
      title: "Contact Heading Accent Word",
      type: "string",
      description: "Word shown in teal/green colour (e.g. 'Touch')",
    }),
    defineField({
      name: "contactDescription",
      title: "Contact Page Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "contactFormHeading",
      title: "Contact Form Heading",
      type: "string",
      description: "Heading above the form (e.g. 'Send Us a Message')",
    }),
    defineField({
      name: "contactFormDescription",
      title: "Contact Form Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "contactInquiryTypes",
      title: "Contact Enquiry Types",
      type: "array",
      description: "Dropdown options for the enquiry type selector",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "contactSuccessHeading",
      title: "Contact Success Heading",
      type: "string",
    }),
    defineField({
      name: "contactSuccessMessage",
      title: "Contact Success Message",
      type: "text",
      rows: 2,
    }),

    // ── Service Inquiry ──
    defineField({
      name: "serviceInquiryEnabled",
      title: "Service Inquiry Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "serviceInquiryRecipientEmail",
      title: "Service Inquiry Recipient Email",
      type: "email",
      description: "Email that receives service inquiry submissions",
    }),
    defineField({
      name: "serviceInquiryFormHeading",
      title: "Service Inquiry Form Heading",
      type: "string",
    }),
    defineField({
      name: "serviceInquiryFormDescription",
      title: "Service Inquiry Form Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "serviceInquirySuccessHeading",
      title: "Service Inquiry Success Heading",
      type: "string",
    }),
    defineField({
      name: "serviceInquirySuccessMessage",
      title: "Service Inquiry Success Message",
      type: "text",
      rows: 2,
    }),

    // ── Event Inquiry ──
    defineField({
      name: "eventInquiryEnabled",
      title: "Event Inquiry Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "eventInquiryRecipientEmail",
      title: "Event Inquiry Recipient Email",
      type: "email",
      description: "Email that receives event inquiry submissions (falls back to contact email)",
    }),

    // ── Newsletter ──
    defineField({
      name: "newsletterEnabled",
      title: "Newsletter Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "newsletterRecipientEmail",
      title: "Newsletter Recipient Email",
      type: "email",
      description: "Email that receives newsletter subscription notifications",
    }),
    defineField({
      name: "newsletterHeading",
      title: "Newsletter Section Heading",
      type: "string",
    }),
    defineField({
      name: "newsletterDescription",
      title: "Newsletter Section Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "newsletterButtonText",
      title: "Newsletter Button Text",
      type: "string",
      description: "Text on the subscribe button (e.g. 'Subscribe')",
    }),
    defineField({
      name: "newsletterSuccessMessage",
      title: "Newsletter Success Message",
      type: "string",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Form Settings",
        subtitle: "Form configuration, recipients, and content",
      };
    },
  },
});
