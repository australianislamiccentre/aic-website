import type { Metadata } from "next";
import { getTermsPageSettings } from "@/sanity/lib/fetch";
import { pageTitle } from "@/lib/seo";
import TermsContent from "./TermsContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTermsPageSettings();
  return {
    title: pageTitle(settings?.seo?.title, "Terms of Use"),
    description:
      settings?.seo?.description ??
      "Terms of use for the Australian Islamic Centre website.",
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const settings = await getTermsPageSettings();
  return <TermsContent settings={settings} />;
}
