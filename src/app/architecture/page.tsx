/**
 * Architecture Page
 *
 * Server Component that fetches Sanity data and generates metadata for the
 * architecture page. Delegates all rendering to ArchitectureContent.
 *
 * @route /architecture
 * @module app/architecture/page
 */

import type { Metadata } from "next";
import { getArchitecturePageSettings } from "@/sanity/lib/fetch";
import ArchitectureContent from "./ArchitectureContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getArchitecturePageSettings();
  return {
    title: settings?.seo?.title ?? "Architecture | Australian Islamic Centre",
    description:
      settings?.seo?.description ??
      "Explore the award-winning architecture of the Australian Islamic Centre, designed by Pritzker Prize laureate Glenn Murcutt AO with Hakan Elevli.",
    alternates: { canonical: "/architecture" },
  };
}

export default async function ArchitecturePage() {
  const settings = await getArchitecturePageSettings();
  return <ArchitectureContent settings={settings} />;
}
