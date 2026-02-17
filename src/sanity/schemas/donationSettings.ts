import { defineField, defineType } from "sanity";

export default defineType({
  name: "donationSettings",
  title: "Fundraise Up Settings",
  type: "document",
  fields: [
    defineField({
      name: "installationScript",
      title: "Fundraise Up Installation Script",
      type: "text",
      rows: 6,
      description:
        "The Fundraise Up installation script from your dashboard. This loads the Fundraise Up widget on all pages.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "organizationKey",
      title: "Organization Key",
      type: "string",
      description:
        "Your Fundraise Up organization key (e.g., AGUWBDNC). Found in the installation script.",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Fundraise Up Settings",
        subtitle: "Installation script and organization key",
      };
    },
  },
});
