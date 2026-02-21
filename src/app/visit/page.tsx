import { getEtiquette, getFaqsByCategory } from "@/sanity/lib/fetch";
import { SanityEtiquette, SanityFaq } from "@/types/sanity";
import VisitContent from "./VisitContent";

export const metadata = {
  title: "Visit Us | Australian Islamic Centre",
  description: "Plan your visit to the Australian Islamic Centre. Explore our award-winning architecture and learn about our community.",
};

export default async function VisitPage() {
  const [etiquette, faqs] = await Promise.all([
    getEtiquette() as Promise<SanityEtiquette[]>,
    getFaqsByCategory("visiting") as Promise<SanityFaq[]>,
  ]);

  return <VisitContent etiquette={etiquette} faqs={faqs} />;
}
