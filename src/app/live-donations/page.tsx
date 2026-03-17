import type { Metadata } from "next";
import LiveDonationsContent from "./LiveDonationsContent";

export const metadata: Metadata = {
  title: "Live Donations — Ramadan Campaign | Australian Islamic Centre",
  description:
    "Watch live donations come in for our Ramadan campaign. See the progress, recent donors, and top supporters.",
  robots: { index: false, follow: false },
};

export default function LiveDonationsPage() {
  return <LiveDonationsContent />;
}
