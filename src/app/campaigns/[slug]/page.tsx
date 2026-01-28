import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDonationCampaignBySlug, getDonationCampaignsForStaticGeneration } from "@/sanity/lib/fetch";
import CampaignDetailContent from "./CampaignDetailContent";

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const campaigns = await getDonationCampaignsForStaticGeneration();
  return campaigns.map((campaign) => ({
    slug: campaign.slug,
  }));
}

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getDonationCampaignBySlug(slug);

  if (!campaign) {
    return {
      title: "Campaign Not Found",
    };
  }

  return {
    title: campaign.title,
    description: campaign.description,
    openGraph: {
      title: campaign.title,
      description: campaign.description,
      type: "website",
    },
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaign = await getDonationCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  return (
    <Suspense fallback={<CampaignLoadingFallback />}>
      <CampaignDetailContent campaign={campaign} />
    </Suspense>
  );
}

function CampaignLoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading campaign...</p>
      </div>
    </div>
  );
}
