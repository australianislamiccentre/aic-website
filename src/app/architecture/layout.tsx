import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "Explore the award-winning architecture of the Australian Islamic Centre, designed by Pritzker Prize laureate Glenn Murcutt AO with Hakan Elevli.",
  alternates: { canonical: "/architecture" },
};

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
