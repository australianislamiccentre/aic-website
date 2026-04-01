/**
 * Partners Hub Page
 *
 * Server component that fetches affiliated partner organisations from Sanity
 * and passes them to the PartnersContent client component for display.
 *
 * @route /partners
 * @module app/partners/page
 */
import type { Metadata } from "next";
import { getPartners, getPartnersPageSettings } from "@/sanity/lib/fetch";
import PartnersContent from "./PartnersContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPartnersPageSettings();
  return {
    title: settings?.seo?.title ?? "Partners | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Discover the Australian Islamic Centre's affiliated partner organisations working together in education, sports, and community development.",
  };
}

export default async function PartnersPage() {
  const [partners, settings] = await Promise.all([
    getPartners(),
    getPartnersPageSettings(),
  ]);

  return <PartnersContent partners={partners} pageSettings={settings} />;
}
