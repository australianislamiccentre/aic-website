import { defineField, defineType } from "sanity";

export default defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    // ── 1. Status ──
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Currently part of the team",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show on homepage team section",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first within category",
    }),

    // ── 2. Identity ──
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., 'Head Imam', 'Quran Teacher', 'Board Member'",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Imam / Religious Leader", value: "imam" },
          { title: "Teacher / Educator", value: "teacher" },
          { title: "Board Member", value: "board" },
          { title: "Administration", value: "admin" },
          { title: "Volunteer Coordinator", value: "volunteer" },
          { title: "Youth Leader", value: "youth" },
          { title: "Sisters Coordinator", value: "sisters" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Professional headshot recommended",
    }),

    // ── 3. Bio & Expertise ──
    defineField({
      name: "shortBio",
      title: "Short Bio",
      type: "text",
      rows: 2,
      description: "Brief description for cards (max 150 characters)",
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: "bio",
      title: "Full Biography",
      type: "array",
      of: [{ type: "block" }],
      description: "Background, qualifications, experience",
    }),
    defineField({
      name: "qualifications",
      title: "Qualifications",
      type: "array",
      of: [{ type: "string" }],
      description: "Degrees, certifications, etc.",
    }),
    defineField({
      name: "specializations",
      title: "Specializations",
      type: "array",
      of: [{ type: "string" }],
      description: "Areas of expertise (e.g., 'Fiqh', 'Quran Tajweed', 'Youth Counselling')",
    }),

    // ── 4. Contact ──
    defineField({
      name: "showContactInfo",
      title: "Show Contact Information",
      type: "boolean",
      description: "Display email/phone publicly",
      initialValue: false,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "email",
      description: "Public contact email (optional)",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      description: "Public contact phone (optional)",
    }),
    defineField({
      name: "officeHours",
      title: "Office Hours",
      type: "string",
      description: "e.g., 'Mon-Fri 9am-5pm' or 'By appointment'",
    }),
    defineField({
      name: "socialMedia",
      title: "Social Media",
      type: "object",
      fields: [
        defineField({
          name: "linkedin",
          title: "LinkedIn",
          type: "url",
        }),
        defineField({
          name: "twitter",
          title: "Twitter/X",
          type: "url",
        }),
        defineField({
          name: "website",
          title: "Personal Website",
          type: "url",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      role: "role",
      category: "category",
      active: "active",
      media: "image",
    },
    prepare({ title, role, category, active, media }) {
      const categoryLabels: Record<string, string> = {
        imam: "Imam",
        teacher: "Teacher",
        board: "Board",
        admin: "Admin",
        volunteer: "Volunteer",
        youth: "Youth",
        sisters: "Sisters",
      };
      return {
        title: `${active === false ? "(Inactive) " : ""}${title}`,
        subtitle: `${role} - ${categoryLabels[category] || category}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Category then Order",
      name: "categoryOrder",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
