import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import PrivacyContent from "./PrivacyContent";
import type { SanityLegalPageSettings, PortableTextBlock } from "@/types/sanity";

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="breadcrumb" />,
}));

describe("PrivacyContent", () => {
  it("renders without settings (null) without crashing and shows fallback heading", () => {
    render(<PrivacyContent settings={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Privacy Policy",
    );
  });

  it("shows heading from Sanity settings when provided", () => {
    const settings: SanityLegalPageSettings = {
      heading: "Our Privacy Commitment",
    };
    render(<PrivacyContent settings={settings} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Our Privacy Commitment",
    );
  });

  it("shows lastUpdated date from settings when provided", () => {
    const settings: SanityLegalPageSettings = {
      lastUpdated: "2025-06-01",
    };
    render(<PrivacyContent settings={settings} />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText(/June 2025/)).toBeInTheDocument();
  });

  it("shows PortableText component when settings.content is provided", () => {
    const content: PortableTextBlock[] = [
      { _type: "block", _key: "abc", children: [] },
    ];
    const settings: SanityLegalPageSettings = { content };
    render(<PrivacyContent settings={settings} />);
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();
  });

  it("shows hardcoded content when settings is null", () => {
    render(<PrivacyContent settings={null} />);
    expect(
      screen.getByRole("heading", { name: /1\. Introduction/i }),
    ).toBeInTheDocument();
  });

  it("does not show PortableText when settings is null", () => {
    render(<PrivacyContent settings={null} />);
    expect(screen.queryByTestId("portable-text")).not.toBeInTheDocument();
  });

  it("shows fallback last updated when settings has no lastUpdated", () => {
    const settings: SanityLegalPageSettings = { heading: "Privacy Policy" };
    render(<PrivacyContent settings={settings} />);
    expect(screen.getByText(/March 2026/)).toBeInTheDocument();
  });
});
