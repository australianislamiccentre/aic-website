/**
 * Partners Hub Page
 *
 * Server component that fetches affiliated partner organisations from Sanity
 * and passes them to the PartnersContent client component for display.
 *
 * @route /partners
 * @module app/partners/page
 */
import { getPartners } from "@/sanity/lib/fetch";
import PartnersContent from "./PartnersContent";

export const metadata = {
  title: "Partners | Australian Islamic Centre",
  description:
    "Discover the Australian Islamic Centre's affiliated partner organisations working together in education, sports, and community development.",
};

export default async function PartnersPage() {
  const partners = await getPartners();

  return <PartnersContent partners={partners} />;
}
