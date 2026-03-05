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
import { getResources } from "@/sanity/lib/fetch";
import { SanityResource } from "@/types/sanity";
import ResourcesContent from "./ResourcesContent";

export const metadata = {
  title: "Resources | Australian Islamic Centre",
  description: "Browse and download community resources including Islamic literature, audio lectures, video content, and educational materials from the Australian Islamic Centre.",
};

export default async function ResourcesPage() {
  const resources = await getResources() as SanityResource[];

  return <ResourcesContent resources={resources} />;
}
