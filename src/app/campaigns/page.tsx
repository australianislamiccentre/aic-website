import { getDonationCampaigns } from "@/sanity/lib/fetch";
import { SanityDonationCampaign } from "@/types/sanity";
import CampaignsContent from "./CampaignsContent";

export const metadata = {
  title: "Donation Campaigns | Australian Islamic Centre",
  description:
    "Join our scheduled donation campaigns and make a daily impact during Ramadan and other special occasions.",
};

export default async function CampaignsPage() {
  const campaigns = (await getDonationCampaigns()) as SanityDonationCampaign[];
  return <CampaignsContent campaigns={campaigns} />;
}
