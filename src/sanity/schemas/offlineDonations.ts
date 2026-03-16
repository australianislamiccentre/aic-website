/**
 * Sanity Schema: Offline Donations (singleton)
 *
 * Tracks offline/non-FundraiseUp donations that add to the live donations
 * progress bar total. These do not appear in recent donors or top supporters.
 * Each entry has a label (for reference) and an amount.
 *
 * @module sanity/schemas/offlineDonations
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "offlineDonations",
  title: "Offline Donations",
  type: "document",
  fields: [
    defineField({
      name: "donations",
      title: "Offline Donations",
      type: "array",
      description:
        "Offline/non-FundraiseUp donations that add to the live donations progress bar. These do not appear in the recent donors or top supporters lists.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description:
                "Description for your reference (e.g. 'Cash donations March 17')",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "amount",
              title: "Amount ($AUD)",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
          preview: {
            select: { title: "label", amount: "amount" },
            prepare({
              title,
              amount,
            }: {
              title?: string;
              amount?: number;
            }) {
              return {
                title: title ?? "Offline Donation",
                subtitle: amount ? `$${amount.toLocaleString()}` : "$0",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Offline Donations",
        subtitle: "Non-FundraiseUp donations for live progress bar",
      };
    },
  },
});
