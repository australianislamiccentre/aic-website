import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import PartnersContent from "./PartnersContent";
import { SanityPartner } from "@/types/sanity";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>{children}</div>
    ),
    span: ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...props}>{children}</span>
    ),
    section: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <section className={className} {...props}>{children}</section>
    ),
    a: ({ children, className, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a className={className} href={href} {...props}>{children}</a>
    ),
    button: ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button className={className} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => 0 }),
  useMotionValueEvent: () => {},
}));

// Mock FadeIn
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock Sanity image URL builder
vi.mock("@/sanity/lib/image", () => ({
  urlFor: () => ({
    width: () => ({
      height: () => ({
        url: () => "https://example.com/image.jpg",
      }),
    }),
  }),
}));

// Mock Breadcrumb
vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
  Breadcrumb: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
}));

function makePartner(overrides: Partial<SanityPartner> = {}): SanityPartner {
  return {
    _id: "partner-1",
    name: "Test Partner",
    slug: "test-partner",
    shortDescription: "A test partner organisation",
    icon: "handshake",
    color: "from-teal-500 to-teal-600",
    ...overrides,
  };
}

describe("PartnersContent", () => {
  it("renders the page title", () => {
    render(<PartnersContent partners={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Affiliated Partners");
  });

  it("renders partner cards when data is provided", () => {
    const partners = [
      makePartner({ _id: "p1", name: "Newport Storm FC", slug: "newport-storm" }),
      makePartner({ _id: "p2", name: "AIC College", slug: "aic-college" }),
    ];
    render(<PartnersContent partners={partners} />);
    expect(screen.getAllByText("Newport Storm FC").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AIC College").length).toBeGreaterThan(0);
  });

  it("falls back to hardcoded partners when given empty array", () => {
    render(<PartnersContent partners={[]} />);
    expect(screen.getAllByText("Newport Storm FC").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AIC College (AICC)").length).toBeGreaterThan(0);
  });

  it("renders partner descriptions", () => {
    const partners = [
      makePartner({ shortDescription: "Promoting sportsmanship in the community" }),
    ];
    render(<PartnersContent partners={partners} />);
    expect(screen.getByText("Promoting sportsmanship in the community")).toBeInTheDocument();
  });

  it("renders Learn More links for each partner", () => {
    const partners = [
      makePartner({ _id: "p1", slug: "partner-one" }),
      makePartner({ _id: "p2", slug: "partner-two" }),
    ];
    render(<PartnersContent partners={partners} />);
    const learnMoreLinks = screen.getAllByText("Learn More");
    expect(learnMoreLinks).toHaveLength(2);
  });

  it("links partner cards to correct detail pages", () => {
    const partners = [makePartner({ slug: "newport-storm" })];
    render(<PartnersContent partners={partners} />);
    const link = screen.getByRole("link", { name: /Test Partner/ });
    expect(link).toHaveAttribute("href", "/partners/newport-storm");
  });

  it("renders the CTA section", () => {
    render(<PartnersContent partners={[]} />);
    expect(screen.getByText(/Partner With/)).toBeInTheDocument();
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });

  it("renders partner cover image when available", () => {
    const partners = [
      makePartner({
        coverImage: { _type: "image", asset: { _ref: "img-123", _type: "reference" } },
      }),
    ];
    render(<PartnersContent partners={partners} />);
    const img = screen.getByAltText("Test Partner");
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders fallback image for known slugs without coverImage", () => {
    const partners = [
      makePartner({ slug: "newport-storm", coverImage: undefined }),
    ];
    render(<PartnersContent partners={partners} />);
    const img = screen.getByAltText("Test Partner");
    expect(img).toHaveAttribute("src", "/images/aic 5.jpg");
  });

  describe("pageSettings wiring", () => {
    it("renders fallback hero content when pageSettings is null", () => {
      render(<PartnersContent partners={[]} pageSettings={null} />);
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Affiliated");
      expect(h1).toHaveTextContent("Partners");
    });

    it("renders Sanity hero badge when provided", () => {
      render(
        <PartnersContent
          partners={[]}
          pageSettings={{ heroBadge: "Our Partners" }}
        />
      );
      expect(screen.getByText("Our Partners")).toBeInTheDocument();
    });

    it("renders Sanity heroHeading and heroHeadingAccent", () => {
      render(
        <PartnersContent
          partners={[]}
          pageSettings={{ heroHeading: "Strategic", heroHeadingAccent: "Alliances" }}
        />
      );
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Strategic");
      expect(h1).toHaveTextContent("Alliances");
    });

    it("renders Sanity hero description", () => {
      render(
        <PartnersContent
          partners={[]}
          pageSettings={{ heroDescription: "We work with trusted organisations." }}
        />
      );
      expect(screen.getByText("We work with trusted organisations.")).toBeInTheDocument();
    });

    it("hides CTA section when ctaVisible is false", () => {
      render(
        <PartnersContent
          partners={[]}
          pageSettings={{ ctaVisible: false }}
        />
      );
      expect(screen.queryByText(/Partner With/)).not.toBeInTheDocument();
    });

    it("renders Sanity CTA heading and accent", () => {
      render(
        <PartnersContent
          partners={[]}
          pageSettings={{ ctaHeading: "Work With", ctaHeadingAccent: "AIC" }}
        />
      );
      expect(screen.getByText(/Work With/)).toBeInTheDocument();
      expect(screen.getByText("AIC")).toBeInTheDocument();
    });

    it("renders Sanity CTA description", () => {
      render(
        <PartnersContent
          partners={[]}
          pageSettings={{ ctaDescription: "Join our network of community organisations." }}
        />
      );
      expect(screen.getByText("Join our network of community organisations.")).toBeInTheDocument();
    });

    it("renders Sanity CTA button label and URL", () => {
      render(
        <PartnersContent
          partners={[]}
          pageSettings={{ ctaButtonLabel: "Apply Now", ctaButtonUrl: "/apply" }}
        />
      );
      const link = screen.getByText("Apply Now");
      expect(link.closest("a")).toHaveAttribute("href", "/apply");
    });
  });
});
