import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import AboutContent from "./AboutContent";
import type { SanityAboutPageSettings } from "@/types/sanity";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
  },
}));
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
vi.mock("@/sanity/lib/image", () => ({
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => "https://cdn.sanity.io/test.jpg" }) }) }),
}));

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
}));

vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    name: "Australian Islamic Centre",
    shortName: "AIC",
    tagline: "Serving the community with faith and excellence",
    address: {
      street: "15 Blenheim Road",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
    },
    phone: "(03) 9391 2834",
    email: "info@aic.org.au",
  }),
}));

const defaultSettings: SanityAboutPageSettings = {
  heroHeading: "About the Australian Islamic Centre",
  heroHeadingAccent: "Australian Islamic Centre",
  heroDescription: "A vibrant community hub",
  heroStats: [{ value: "40+", label: "Years Serving" }],
};

describe("AboutContent", () => {
  it("renders hero heading from Sanity settings", () => {
    render(<AboutContent settings={defaultSettings} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("About the Australian Islamic Centre");
  });

  it("renders hardcoded fallback heading when settings is null", () => {
    render(<AboutContent settings={null} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("About the Australian Islamic Centre");
  });

  it("renders hero stats when provided", () => {
    render(<AboutContent settings={defaultSettings} />);
    expect(screen.getByText("40+")).toBeInTheDocument();
    expect(screen.getByText("Years Serving")).toBeInTheDocument();
  });

  it("hides mission section when missionVisible is false", () => {
    render(<AboutContent settings={{ ...defaultSettings, missionVisible: false }} />);
    expect(screen.queryByText(/Our Mission/i)).not.toBeInTheDocument();
  });

  it("hides timeline section when timelineVisible is false", () => {
    render(<AboutContent settings={{ ...defaultSettings, timelineVisible: false }} />);
    expect(screen.queryByText(/Legacy of Service/i)).not.toBeInTheDocument();
  });

  it("shows sections by default when settings is null (no visibility toggles set)", () => {
    render(<AboutContent settings={null} />);
    expect(screen.getByText(/Legacy of Service/i)).toBeInTheDocument();
  });
});
