import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newport Storm FC",
  description:
    "Newport Storm Football Club is a community-based sports club affiliated with the Australian Islamic Centre, fostering youth development and community spirit.",
  alternates: { canonical: "/partners/newport-storm" },
};

export default function NewportStormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
