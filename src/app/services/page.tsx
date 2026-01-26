import { getServices } from "@/sanity/lib/fetch";
import { SanityService } from "@/types/sanity";
import ServicesContent from "./ServicesContent";

export const metadata = {
  title: "Services | Australian Islamic Centre",
  description: "Comprehensive Islamic services including religious guidance, nikah ceremonies, funeral services, and counselling support for our community.",
};

export default async function ServicesPage() {
  const services = await getServices() as SanityService[];

  return <ServicesContent services={services} />;
}
