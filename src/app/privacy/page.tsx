import type { Metadata } from "next";
import { getPrivacyPageSettings } from "@/sanity/lib/fetch";
import { pageTitle } from "@/lib/seo";
import PrivacyContent from "./PrivacyContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPrivacyPageSettings();
  return {
    title: pageTitle(settings?.seo?.title, "Privacy Policy"),
    description:
      settings?.seo?.description ??
      "Privacy policy for the Australian Islamic Centre website.",
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const settings = await getPrivacyPageSettings();
  return <PrivacyContent settings={settings} />;
}
