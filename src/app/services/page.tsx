/**
 * Services Listing Page
 *
 * Server component that fetches all services from Sanity and passes them
 * to the ServicesContent client component for display. Covers religious
 * guidance, nikah ceremonies, funeral services, and counselling.
 *
 * @route /services
 * @module app/services/page
 */
import type { Metadata } from "next";
import { getServices, getServicesPageSettings } from "@/sanity/lib/fetch";
import { pageTitle } from "@/lib/seo";
import { SanityService } from "@/types/sanity";
import ServicesContent from "./ServicesContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServicesPageSettings();
  return {
    title: pageTitle(settings?.seo?.title, "Services"),
    description: settings?.seo?.description ?? "Comprehensive Islamic services including religious guidance, nikah ceremonies, funeral services, and counselling support for our community.",
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getServices() as Promise<SanityService[]>,
    getServicesPageSettings(),
  ]);

  return <ServicesContent services={services} pageSettings={settings} />;
}
