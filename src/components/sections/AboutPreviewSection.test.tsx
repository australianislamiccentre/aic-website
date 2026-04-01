import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { AboutPreviewSection } from "./AboutPreviewSection";
import type { SanityHomepageSettings } from "@/types/sanity";

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
    p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...props}>{children}</p>
    ),
    h2: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className={className} {...props}>{children}</h2>
    ),
    li: ({ children, className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
      <li className={className} {...props}>{children}</li>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => 0 }),
  useMotionValueEvent: () => {},
  useInView: () => true,
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

// Mock Sanity image URL builder — chainable stub
const mockUrlBuilder = {
  width: () => mockUrlBuilder,
  height: () => mockUrlBuilder,
  fit: () => mockUrlBuilder,
  auto: () => mockUrlBuilder,
  url: () => "https://example.com/image.jpg",
};
vi.mock("@/sanity/lib/image", () => ({
  urlFor: () => mockUrlBuilder,
}));

// Mock Button
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) => {
    if (props.href) return <a href={props.href}>{children}</a>;
    return <button {...props}>{children}</button>;
  },
}));

// Mock PortableText
vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{value ? `${value.length} block(s)` : null}</div>
  ),
}));

describe("AboutPreviewSection", () => {
  it("renders the badge text", () => {
    render(<AboutPreviewSection />);
    expect(screen.getByText("About Our Centre")).toBeInTheDocument();
  });

  it("renders the main heading with accent text", () => {
    render(<AboutPreviewSection />);
    expect(screen.getByText("Knowledge & Unity")).toBeInTheDocument();
  });

  it("renders the description paragraph", () => {
    render(<AboutPreviewSection />);
    expect(
      screen.getByText(/Australian Islamic Centre stands as one of Melbourne/)
    ).toBeInTheDocument();
  });

  it("renders all four stats", () => {
    render(<AboutPreviewSection />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Daily Prayers")).toBeInTheDocument();
    expect(screen.getByText("40+")).toBeInTheDocument();
    expect(screen.getByText("Years Serving")).toBeInTheDocument();
    expect(screen.getByText("Global")).toBeInTheDocument();
    expect(screen.getByText("Recognition")).toBeInTheDocument();
    expect(screen.getByText("20+")).toBeInTheDocument();
    expect(screen.getByText("Weekly Programs")).toBeInTheDocument();
  });

  it("renders all four features", () => {
    render(<AboutPreviewSection />);
    expect(screen.getByText("Award-winning Architecture")).toBeInTheDocument();
    expect(screen.getByText("5 Daily Prayers")).toBeInTheDocument();
    expect(screen.getByText("Educational Programs")).toBeInTheDocument();
    expect(screen.getByText("Community Services")).toBeInTheDocument();
  });

  it("renders the learn more link pointing to /about", () => {
    render(<AboutPreviewSection />);
    const link = screen.getByText("Learn More About Us");
    expect(link.closest("a")).toHaveAttribute("href", "/about");
  });

  it("renders the hero image with correct alt text", () => {
    render(<AboutPreviewSection />);
    expect(
      screen.getByAltText("Australian Islamic Centre aerial view with crescent moon")
    ).toBeInTheDocument();
  });

  describe("welcomeSection wiring", () => {
    it("renders fallback content when welcomeSection is undefined", () => {
      render(<AboutPreviewSection />);
      expect(screen.getByText(/Australian Islamic Centre stands as one of Melbourne/)).toBeInTheDocument();
    });

    it("renders Sanity badge when welcomeSection.badge is provided", () => {
      render(
        <AboutPreviewSection
          welcomeSection={{ badge: "Our Story" }}
        />
      );
      expect(screen.getByText("Our Story")).toBeInTheDocument();
    });

    it("falls back to subtitle for badge when badge is not set", () => {
      render(
        <AboutPreviewSection
          welcomeSection={{ subtitle: "Legacy Badge" }}
        />
      );
      expect(screen.getByText("Legacy Badge")).toBeInTheDocument();
    });

    it("renders Sanity title when welcomeSection.title is provided", () => {
      render(
        <AboutPreviewSection
          welcomeSection={{ title: "Serving the Community" }}
        />
      );
      expect(screen.getByText("Serving the Community")).toBeInTheDocument();
    });

    it("renders Sanity titleAccent when provided", () => {
      render(
        <AboutPreviewSection
          welcomeSection={{ titleAccent: "Faith & Unity" }}
        />
      );
      expect(screen.getByText("Faith & Unity")).toBeInTheDocument();
    });

    it("renders PortableText content when welcomeSection.content is provided", () => {
      render(
        <AboutPreviewSection
          welcomeSection={{
            content: [{ _type: "block", _key: "b1" }],
          }}
        />
      );
      expect(screen.getByTestId("portable-text")).toBeInTheDocument();
      // Fallback prose paragraphs should not appear
      expect(screen.queryByText(/Australian Islamic Centre stands as one of Melbourne/)).not.toBeInTheDocument();
    });

    it("renders Sanity stats when welcomeSection.stats is provided", () => {
      render(
        <AboutPreviewSection
          welcomeSection={{
            stats: [
              { value: "10+", label: "Scholars" },
              { value: "1,000+", label: "Members" },
            ],
          }}
        />
      );
      expect(screen.getByText("10+")).toBeInTheDocument();
      expect(screen.getByText("Scholars")).toBeInTheDocument();
      expect(screen.getByText("1,000+")).toBeInTheDocument();
      expect(screen.getByText("Members")).toBeInTheDocument();
    });

    it("renders default stats when welcomeSection has no stats", () => {
      render(<AboutPreviewSection welcomeSection={{ title: "Our Centre" }} />);
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Daily Prayers")).toBeInTheDocument();
      expect(screen.getByText("40+")).toBeInTheDocument();
    });

    it("uses Sanity image when welcomeSection.image is provided", () => {
      render(
        <AboutPreviewSection
          welcomeSection={{
            image: { _type: "image", asset: { _ref: "image-abc-600x800-jpg", _type: "reference" } },
          }}
        />
      );
      const img = screen.getByAltText("Australian Islamic Centre aerial view with crescent moon");
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    });
  });

  describe("welcomeSection typed usage", () => {
    it("accepts a full SanityHomepageSettings welcomeSection object", () => {
      const welcomeSection: SanityHomepageSettings["welcomeSection"] = {
        badge: "About Our Centre",
        title: "A Beacon of Faith",
        titleAccent: "Knowledge & Unity",
        subtitle: "About Our Centre",
        content: [{ _type: "block", _key: "b1" }],
        stats: [{ value: "5", label: "Daily Prayers" }],
      };
      render(<AboutPreviewSection welcomeSection={welcomeSection} />);
      expect(screen.getByText("A Beacon of Faith")).toBeInTheDocument();
      expect(screen.getByText("About Our Centre")).toBeInTheDocument();
      expect(screen.getByText("Knowledge & Unity")).toBeInTheDocument();
      expect(screen.getByTestId("portable-text")).toBeInTheDocument();
    });
  });
});
