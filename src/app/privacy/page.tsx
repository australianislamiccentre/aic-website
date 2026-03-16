import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Australian Islamic Centre website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
