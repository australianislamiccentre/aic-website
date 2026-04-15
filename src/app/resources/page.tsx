/**
 * Resources Listing Page
 *
 * Server component that fetches all resources from Sanity and passes them
 * to the ResourcesContent client component for display. Covers downloadable
 * PDFs, audio, video, eBooks, and external links.
 *
 * @route /resources
 * @module app/resources/page
 */
import type { Metadata } from "next";
import { getResources, getResourcesPageSettings } from "@/sanity/lib/fetch";
import { SanityResource } from "@/types/sanity";
import ResourcesContent from "./ResourcesContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getResourcesPageSettings();
  return {
    title: settings?.seo?.title ?? "Resources | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Browse and download community resources including Islamic literature, audio lectures, video content, and educational materials from the Australian Islamic Centre.",
    alternates: { canonical: "/resources" },
  };
}

export default async function ResourcesPage() {
  const [resources, settings] = await Promise.all([
    getResources() as Promise<SanityResource[]>,
    getResourcesPageSettings(),
  ]);

  return <ResourcesContent resources={resources} pageSettings={settings} />;
}
