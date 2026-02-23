/**
 * Donate Page
 *
 * Server component that fetches donation page settings (campaigns, element
 * codes) from Sanity and passes them to the DonateContent client component
 * for interactive rendering.
 *
 * @route /donate
 * @module app/donate/page
 */
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
