import { defineField, defineType } from "sanity";

export default defineType({
  name: "formSettings",
  title: "Form Settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact Form", default: true },
    { name: "serviceInquiry", title: "Service Inquiry" },
    { name: "newsletter", title: "Newsletter" },
  ],
  fields: [
    // ============================================
    // Contact Form
    // ============================================
    defineField({
      name: "contactRecipientEmail",
      title: "Recipient Email",
      type: "email",
      group: "contact",
      description: "Email address that receives contact form submissions",
    }),
    defineField({
      name: "contactEnabled",
      title: "Form Enabled",
      type: "boolean",
      group: "contact",
      initialValue: true,
      description: "Enable or disable the contact form",
    }),
    defineField({
      name: "contactHeading",
      title: "Page Heading",
      type: "string",
      group: "contact",
      description: "Main heading text (e.g. 'Get in')",
    }),
    defineField({
      name: "contactHeadingAccent",
      title: "Heading Accent Word",
      type: "string",
      group: "contact",
      description: "Word shown in teal/green colour (e.g. 'Touch')",
    }),
    defineField({
      name: "contactDescription",
      title: "Page Description",
      type: "text",
      rows: 2,
      group: "contact",
      description: "Subtitle text below the heading",
    }),
    defineField({
      name: "contactFormHeading",
      title: "Form Heading",
      type: "string",
      group: "contact",
      description: "Heading above the form (e.g. 'Send Us a Message')",
    }),
    defineField({
      name: "contactFormDescription",
      title: "Form Description",
      type: "text",
      rows: 2,
      group: "contact",
      description: "Description text below the form heading",
    }),
    defineField({
      name: "contactInquiryTypes",
      title: "Enquiry Types",
      type: "array",
      group: "contact",
      description: "Dropdown options for the enquiry type selector",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "contactSuccessHeading",
      title: "Success Heading",
      type: "string",
      group: "contact",
      description: "Heading shown after successful submission",
    }),
    defineField({
      name: "contactSuccessMessage",
      title: "Success Message",
      type: "text",
      rows: 2,
      group: "contact",
      description: "Message shown after successful submission",
    }),

    // ============================================
    // Service Inquiry
    // ============================================
    defineField({
      name: "serviceInquiryRecipientEmail",
      title: "Recipient Email",
      type: "email",
      group: "serviceInquiry",
      description: "Email address that receives service inquiry submissions",
    }),
    defineField({
      name: "serviceInquiryEnabled",
      title: "Form Enabled",
      type: "boolean",
      group: "serviceInquiry",
      initialValue: true,
      description: "Enable or disable the service inquiry form",
    }),
    defineField({
      name: "serviceInquiryFormHeading",
      title: "Form Heading",
      type: "string",
      group: "serviceInquiry",
      description: "Heading above the form (e.g. 'Get in Touch')",
    }),
    defineField({
      name: "serviceInquiryFormDescription",
      title: "Form Description",
      type: "text",
      rows: 2,
      group: "serviceInquiry",
      description: "Description text below the form heading",
    }),
    defineField({
      name: "serviceInquirySuccessHeading",
      title: "Success Heading",
      type: "string",
      group: "serviceInquiry",
      description: "Heading shown after successful submission",
    }),
    defineField({
      name: "serviceInquirySuccessMessage",
      title: "Success Message",
      type: "text",
      rows: 2,
      group: "serviceInquiry",
      description: "Message shown after successful submission",
    }),

    // ============================================
    // Newsletter
    // ============================================
    defineField({
      name: "newsletterRecipientEmail",
      title: "Recipient Email",
      type: "email",
      group: "newsletter",
      description: "Email address that receives newsletter subscription notifications",
    }),
    defineField({
      name: "newsletterEnabled",
      title: "Form Enabled",
      type: "boolean",
      group: "newsletter",
      initialValue: true,
      description: "Enable or disable the newsletter subscription form",
    }),
    defineField({
      name: "newsletterHeading",
      title: "Section Heading",
      type: "string",
      group: "newsletter",
      description: "Heading for the newsletter section in the footer",
    }),
    defineField({
      name: "newsletterDescription",
      title: "Section Description",
      type: "text",
      rows: 2,
      group: "newsletter",
      description: "Description text for the newsletter section",
    }),
    defineField({
      name: "newsletterButtonText",
      title: "Button Text",
      type: "string",
      group: "newsletter",
      description: "Text on the subscribe button (e.g. 'Subscribe')",
    }),
    defineField({
      name: "newsletterSuccessMessage",
      title: "Success Message",
      type: "string",
      group: "newsletter",
      description: "Message shown after successful subscription",
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
