import { getFaqsByCategory, getResources } from "@/sanity/lib/fetch";
import { SanityFaq, SanityResource } from "@/types/sanity";
import ResourcesContent from "./ResourcesContent";

export const metadata = {
  title: "Resources | Australian Islamic Centre",
  description: "Access prayer times, Islamic calendar, educational materials, and helpful resources for your spiritual journey.",
};

export default async function ResourcesPage() {
  const [faqs, resources] = await Promise.all([
    getFaqsByCategory("general") as Promise<SanityFaq[]>,
    getResources() as Promise<SanityResource[]>,
  ]);

  return <ResourcesContent faqs={faqs} resources={resources} />;
}
