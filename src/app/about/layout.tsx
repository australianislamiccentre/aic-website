import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about the Australian Islamic Centre — our history, mission, values, and leadership team serving the Muslim community of Melbourne for over 40 years.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
