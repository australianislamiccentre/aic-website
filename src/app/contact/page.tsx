/**
 * Contact Page
 *
 * Server Component that fetches Sanity contact page settings and delegates
 * rendering to the ContactContent client component.
 *
 * @route /contact
 * @module app/contact/page
 */
import type { Metadata } from "next";
import { getContactPageSettings } from "@/sanity/lib/fetch";
import { pageTitle } from "@/lib/seo";
import ContactContent from "./ContactContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContactPageSettings();
  return {
    title: pageTitle(settings?.seo?.title, "Contact Us"),
    description: settings?.seo?.description ?? "Get in touch with the Australian Islamic Centre. Send us a message, call, or visit us at 23-27 Blenheim Road, Newport VIC 3015.",
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const settings = await getContactPageSettings();
  return <ContactContent settings={settings} />;
}
