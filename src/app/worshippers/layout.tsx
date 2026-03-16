import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Worshippers",
  description:
    "Prayer times, Jumuah information, mosque etiquette, and resources for worshippers at the Australian Islamic Centre in Newport, Melbourne.",
  alternates: { canonical: "/worshippers" },
};

export default function WorshippersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
