/**
 * Imams Page
 *
 * Server component that fetches team members in the "imam" category from
 * Sanity and passes them to ImamsContent for display of biographies,
 * qualifications, and contact details.
 *
 * @route /imams
 * @module app/imams/page
 */
import { Metadata } from "next";
import { getTeamMembersByCategory } from "@/sanity/lib/fetch";
import ImamsContent from "./ImamsContent";

export const metadata: Metadata = {
  title: "Our Imams | Australian Islamic Centre",
  description:
    "Meet the Imams and religious leaders of the Australian Islamic Centre who guide our community in faith, education, and spiritual growth.",
  openGraph: {
    title: "Our Imams | Australian Islamic Centre",
    description:
      "Meet the Imams and religious leaders of the Australian Islamic Centre who guide our community in faith, education, and spiritual growth.",
    type: "website",
  },
};

export default async function ImamsPage() {
  const imams = await getTeamMembersByCategory("imam");

  return <ImamsContent imams={imams} />;
}
