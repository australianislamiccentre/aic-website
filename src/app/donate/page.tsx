import { getDonatePageSettings } from "@/sanity/lib/fetch";
import DonateContent from "./DonateContent";

export const metadata = {
  title: "Donate | Australian Islamic Centre",
  description: "Support our mission. Your generosity helps us maintain our centre, run educational programs, and support those in need.",
};

export default async function DonatePage() {
  const settings = await getDonatePageSettings();

  return <DonateContent settings={settings} />;
}
