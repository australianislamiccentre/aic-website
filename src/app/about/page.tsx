/**
 * About Page
 *
 * Server Component: fetches aboutPageSettings from Sanity and passes to client.
 * Falls back to hardcoded content if Sanity data is unavailable.
 *
 * @route /about
 * @module app/about/page
 */
import type { Metadata } from "next";
import { getAboutPageSettings } from "@/sanity/lib/fetch";
import { pageTitle } from "@/lib/seo";
import AboutContent from "./AboutContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAboutPageSettings();
  return {
    title: pageTitle(settings?.seo?.title, "About Us"),
    description:
      settings?.seo?.description ??
      "Learn about the Australian Islamic Centre — a vibrant community hub in Newport, Melbourne.",
  };
}

export default async function AboutPage() {
  const settings = await getAboutPageSettings();
  return <AboutContent settings={settings} />;
}
