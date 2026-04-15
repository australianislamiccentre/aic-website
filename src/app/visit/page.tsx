/**
 * Visit Page
 *
 * Server component that fetches mosque etiquette guidelines and visitor FAQs
 * from Sanity, then passes them to VisitContent for rendering directions,
 * opening hours, and visitor information.
 *
 * @route /visit
 * @module app/visit/page
 */
import type { Metadata } from "next";
import { getEtiquette, getFaqsByCategory, getVisitPageSettings } from "@/sanity/lib/fetch";
import { SanityEtiquette, SanityFaq } from "@/types/sanity";
import VisitContent from "./VisitContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getVisitPageSettings();
  return {
    title: settings?.seo?.title ?? "Visit Us | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Plan your visit to the Australian Islamic Centre. Explore our award-winning architecture and learn about our community.",
    alternates: { canonical: "/visit" },
  };
}

export default async function VisitPage() {
  const [etiquette, faqs, settings] = await Promise.all([
    getEtiquette() as Promise<SanityEtiquette[]>,
    getFaqsByCategory("visiting") as Promise<SanityFaq[]>,
    getVisitPageSettings(),
  ]);

  return <VisitContent etiquette={etiquette} faqs={faqs} pageSettings={settings} />;
}
