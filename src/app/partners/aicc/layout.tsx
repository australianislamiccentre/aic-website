import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIC College",
  description:
    "The Australian Islamic Centre College (AICC) is an educational institution affiliated with the Australian Islamic Centre, combining academic excellence with Islamic values.",
  alternates: { canonical: "/partners/aicc" },
};

export default function AICCLayout({ children }: { children: React.ReactNode }) {
  return children;
}
