import { getTourTypes, getEtiquette, getFaqsByCategory } from "@/sanity/lib/fetch";
import { SanityTourType, SanityEtiquette, SanityFaq } from "@/types/sanity";
import VisitContent from "./VisitContent";

export const metadata = {
  title: "Visit Us | Australian Islamic Centre",
  description: "Plan your visit to the Australian Islamic Centre. Explore our award-winning architecture and learn about our community.",
};

export default async function VisitPage() {
  const [tourTypes, etiquette, faqs] = await Promise.all([
    getTourTypes() as Promise<SanityTourType[]>,
    getEtiquette() as Promise<SanityEtiquette[]>,
    getFaqsByCategory("visiting") as Promise<SanityFaq[]>,
  ]);

  return <VisitContent tourTypes={tourTypes} etiquette={etiquette} faqs={faqs} />;
}
