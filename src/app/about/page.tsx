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
import AboutContent from "./AboutContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAboutPageSettings();
  return {
    title: settings?.seo?.title ?? "About Us | Australian Islamic Centre",
    description:
      settings?.seo?.description ??
      "Learn about the Australian Islamic Centre — a vibrant community hub in Newport, Melbourne.",
  };
}

export default async function AboutPage() {
  const settings = await getAboutPageSettings();
  return <AboutContent settings={settings} />;
}
