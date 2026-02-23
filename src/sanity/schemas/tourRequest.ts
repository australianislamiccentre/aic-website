/**
 * Sanity Schema: Tour Request
 *
 * Content type for visitor tour booking submissions. Stores contact
 * name, email, phone, a reference to the selected tourType, preferred
 * date and time, group size, message, and a status field (pending /
 * confirmed / completed / cancelled). Created via the /visit page
 * tour request form and managed in the Sanity Studio.
 *
 * @module sanity/schemas/tourRequest
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "tourRequest",
  title: "Tour Request",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Contact Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "email",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "tourType",
      title: "Tour Type",
      type: "reference",
      to: [{ type: "tourType" }],
    }),
    defineField({
      name: "preferredDate",
      title: "Preferred Date",
      type: "date",
    }),
    defineField({
      name: "preferredTime",
      title: "Preferred Time",
      type: "string",
    }),
    defineField({
      name: "groupSize",
      title: "Group Size",
      type: "number",
    }),
    defineField({
      name: "organization",
      title: "Organization/School Name",
      type: "string",
    }),
    defineField({
      name: "message",
      title: "Additional Message",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "new",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
    }),
    defineField({
      name: "notes",
      title: "Internal Notes",
      type: "text",
      rows: 3,
      description: "Notes for staff (not visible to requester)",
    }),
  ],
  preview: {
    select: {
      name: "name",
      tourType: "tourType.title",
      date: "preferredDate",
      status: "status",
    },
    prepare({ name, tourType, date, status }) {
      return {
        title: name,
        subtitle: `${tourType || "General"} - ${date || "No date"} (${status})`,
      };
    },
  },
  orderings: [
    {
      title: "Submitted, New",
      name: "submittedDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
});
