import type { Metadata } from "next";
import AccessibilityContent from "./AccessibilityContent";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Accessibility statement for the Australian Islamic Centre website, outlining our commitment to WCAG 2.1 AA compliance.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return <AccessibilityContent />;
}
