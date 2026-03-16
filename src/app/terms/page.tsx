import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the Australian Islamic Centre website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsContent />;
}
