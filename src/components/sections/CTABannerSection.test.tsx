import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { CTABannerSection } from "./CTABannerSection";

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

// Mock Sanity image URL builder
vi.mock("@/sanity/lib/image", () => ({
  urlFor: () => ({
    width: () => ({
      height: () => ({
        url: () => "https://example.com/bg.jpg",
      }),
    }),
  }),
}));

// Mock Button
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, href, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) => {
    if (href) return <a href={href}>{children}</a>;
    return <button {...props}>{children}</button>;
  },
}));

describe("CTABannerSection", () => {
  it("returns null when ctaBanner is undefined", () => {
    const { container } = render(<CTABannerSection />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when ctaBanner.enabled is false", () => {
    const { container } = render(
      <CTABannerSection ctaBanner={{ enabled: false, title: "Should not render" }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when ctaBanner.enabled is not set", () => {
    const { container } = render(
      <CTABannerSection ctaBanner={{ title: "Should not render" }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title, subtitle, and button when enabled with all fields", () => {
    render(
      <CTABannerSection
        ctaBanner={{
          enabled: true,
          title: "Join Our Community",
          subtitle: "Become part of something greater",
          buttonLabel: "Get Involved",
          buttonUrl: "/community",
        }}
      />
    );

    expect(screen.getByText("Join Our Community")).toBeInTheDocument();
    expect(screen.getByText("Become part of something greater")).toBeInTheDocument();
    const link = screen.getByText("Get Involved");
    expect(link.closest("a")).toHaveAttribute("href", "/community");
  });

  it("renders without background image using gradient fallback", () => {
    const { container } = render(
      <CTABannerSection
        ctaBanner={{
          enabled: true,
          title: "Gradient Banner",
        }}
      />
    );

    // Should not render an img element when no backgroundImage provided
    expect(container.querySelector("img")).toBeNull();
    // Gradient div should be present
    expect(container.querySelector(".bg-gradient-to-br")).toBeInTheDocument();
  });

  it("renders with background image when backgroundImage is provided", () => {
    const { container } = render(
      <CTABannerSection
        ctaBanner={{
          enabled: true,
          title: "Image Banner",
          backgroundImage: { _type: "image", asset: { _ref: "image-abc-1920x600-jpg", _type: "reference" } },
        }}
      />
    );

    // The background image uses alt="" (decorative), so query directly via the DOM
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/bg.jpg");
    // Alt should be empty string for decorative background image
    expect(img).toHaveAttribute("alt", "");
    // Gradient fallback should not be present when image is used
    expect(container.querySelector(".bg-gradient-to-br")).toBeNull();
  });

  it("does not render button when buttonLabel is missing", () => {
    render(
      <CTABannerSection
        ctaBanner={{
          enabled: true,
          title: "No Button Banner",
          buttonUrl: "/somewhere",
        }}
      />
    );

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("does not render button when buttonUrl is missing", () => {
    render(
      <CTABannerSection
        ctaBanner={{
          enabled: true,
          title: "No Button Banner",
          buttonLabel: "Click Me",
        }}
      />
    );

    expect(screen.queryByRole("link")).toBeNull();
  });
});
