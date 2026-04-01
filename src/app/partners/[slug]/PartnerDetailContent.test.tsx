import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import PartnerDetailContent from "./PartnerDetailContent";
import { SanityPartner, PortableTextBlock } from "@/types/sanity";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

vi.mock("@/sanity/lib/image", () => ({
  urlFor: () => ({
    width: () => ({
      height: () => ({
        url: () => "https://cdn.sanity.io/test.jpg",
      }),
    }),
  }),
}));

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="breadcrumb" />,
}));

function makePartner(overrides: Partial<SanityPartner> = {}): SanityPartner {
  return {
    _id: "partner-1",
    name: "Newport Storm FC",
    slug: "newport-storm",
    shortDescription: "A community football club affiliated with AIC.",
    ...overrides,
  };
}

describe("PartnerDetailContent", () => {
  it("renders the partner name in an h1", () => {
    render(<PartnerDetailContent partner={makePartner()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Newport Storm FC");
  });

  it("renders shortDescription", () => {
    render(<PartnerDetailContent partner={makePartner()} />);
    const matches = screen.getAllByText("A community football club affiliated with AIC.");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("renders PortableText when fullDescription is provided", () => {
    const fullDescription: PortableTextBlock[] = [
      { _type: "block", _key: "key1", children: [{ _type: "span", text: "Full details here" }] },
    ];
    render(<PartnerDetailContent partner={makePartner({ fullDescription })} />);
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();
  });

  it("shows the Back to Partners link", () => {
    render(<PartnerDetailContent partner={makePartner()} />);
    const backLinks = screen.getAllByRole("link", { name: /Back to Partners/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks[0]).toHaveAttribute("href", "/partners");
  });

  it("shows the website link when website is provided", () => {
    render(
      <PartnerDetailContent
        partner={makePartner({ website: "https://newportstorm.com.au" })}
      />
    );
    const websiteLinks = screen.getAllByRole("link", { name: /Visit Website/i });
    expect(websiteLinks.length).toBeGreaterThan(0);
    expect(websiteLinks[0]).toHaveAttribute("href", "https://newportstorm.com.au");
  });

  it("does not show website link when website is not provided", () => {
    render(<PartnerDetailContent partner={makePartner({ website: undefined })} />);
    expect(screen.queryByRole("link", { name: /Visit Website/i })).not.toBeInTheDocument();
  });
});
