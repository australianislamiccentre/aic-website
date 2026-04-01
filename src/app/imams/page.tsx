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
import type { Metadata } from "next";
import { getTeamMembersByCategory, getImamsPageSettings } from "@/sanity/lib/fetch";
import ImamsContent from "./ImamsContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getImamsPageSettings();
  return {
    title: settings?.seo?.title ?? "Our Imams | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Meet the dedicated imams and scholars of the Australian Islamic Centre.",
    openGraph: {
      title: settings?.seo?.title ?? "Our Imams | Australian Islamic Centre",
      description: settings?.seo?.description ?? "Meet the dedicated imams and scholars of the Australian Islamic Centre.",
      type: "website",
    },
  };
}

export default async function ImamsPage() {
  const [imams, settings] = await Promise.all([
    getTeamMembersByCategory("imam"),
    getImamsPageSettings(),
  ]);

  return <ImamsContent imams={imams} pageSettings={settings} />;
}
