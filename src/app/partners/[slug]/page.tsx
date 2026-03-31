/**
 * Partner Detail Page
 *
 * Server component that fetches a single partner by slug from Sanity and renders
 * their full profile including description, contact info, and cover image.
 *
 * @route /partners/[slug]
 * @module app/partners/[slug]/page
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPartnerBySlug, getPartnersForStaticGeneration } from "@/sanity/lib/fetch";
import PartnerDetailContent from "./PartnerDetailContent";

export const revalidate = 120;

interface PartnerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const partners = await getPartnersForStaticGeneration();
  return partners.map((p) => ({ slug: p.slug || p._id }));
}

export async function generateMetadata({ params }: PartnerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  return {
    title: partner?.name ?? "Partner | Australian Islamic Centre",
    description: partner?.shortDescription ?? "Learn about our partner organisations.",
    alternates: { canonical: `/partners/${slug}` },
  };
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) notFound();
  return <PartnerDetailContent partner={partner} />;
}
