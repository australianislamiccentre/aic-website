import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import TermsContent from "./TermsContent";
import type { SanityLegalPageSettings, PortableTextBlock } from "@/types/sanity";

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="breadcrumb" />,
}));

describe("TermsContent", () => {
  it("renders without settings (null) without crashing and shows fallback heading", () => {
    render(<TermsContent settings={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Terms of Use",
    );
  });

  it("shows heading from Sanity settings when provided", () => {
    const settings: SanityLegalPageSettings = {
      heading: "Website Terms & Conditions",
    };
    render(<TermsContent settings={settings} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Website Terms & Conditions",
    );
  });

  it("shows lastUpdated date from settings when provided", () => {
    const settings: SanityLegalPageSettings = {
      lastUpdated: "2025-09-15",
    };
    render(<TermsContent settings={settings} />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText(/September 2025/)).toBeInTheDocument();
  });

  it("shows PortableText component when settings.content is provided", () => {
    const content: PortableTextBlock[] = [
      { _type: "block", _key: "xyz", children: [] },
    ];
    const settings: SanityLegalPageSettings = { content };
    render(<TermsContent settings={settings} />);
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();
  });

  it("shows hardcoded content when settings is null", () => {
    render(<TermsContent settings={null} />);
    expect(
      screen.getByRole("heading", { name: /1\. Acceptance of Terms/i }),
    ).toBeInTheDocument();
  });

  it("does not show PortableText when settings is null", () => {
    render(<TermsContent settings={null} />);
    expect(screen.queryByTestId("portable-text")).not.toBeInTheDocument();
  });

  it("shows fallback last updated when settings has no lastUpdated", () => {
    const settings: SanityLegalPageSettings = { heading: "Terms of Use" };
    render(<TermsContent settings={settings} />);
    expect(screen.getByText(/March 2026/)).toBeInTheDocument();
  });
});
