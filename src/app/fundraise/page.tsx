import type { Metadata } from "next";
import LaylatulQadrContent from "./LaylatulQadrContent";

export const metadata: Metadata = {
  title: "Laylatul Qadr Fundraiser | Australian Islamic Centre",
  description:
    "Join our Laylatul Qadr fundraiser — the Night of Power, better than a thousand months. Start a fundraiser or support an existing team.",
  robots: { index: false, follow: false },
};

export default function LaylatulQadrFundraiserPage() {
  return <LaylatulQadrContent />;
}
