import { getDonateModalSettings, getDonationGoalMeter } from "@/sanity/lib/fetch";
import DonateContent from "./DonateContent";

export const metadata = {
  title: "Donate | Australian Islamic Centre",
  description: "Support our mission. Your generosity helps us maintain our centre, run educational programs, and support those in need.",
};

export default async function DonatePage() {
  const [donateModalSettings, goalMeter] = await Promise.all([
    getDonateModalSettings(),
    getDonationGoalMeter(),
  ]);

  // Combine featured and additional campaigns into a single list
  const campaigns = [
    ...(donateModalSettings?.featuredCampaign ? [{ ...donateModalSettings.featuredCampaign, featured: true }] : []),
    ...(donateModalSettings?.additionalCampaigns?.map(c => ({ ...c, featured: false })) || []),
  ];

  return (
    <DonateContent
      campaigns={campaigns}
      goalMeter={goalMeter}
    />
  );
}
