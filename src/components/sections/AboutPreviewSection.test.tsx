import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { AboutPreviewSection } from "./AboutPreviewSection";

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

// Mock Button
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) => {
    if (props.href) return <a href={props.href}>{children}</a>;
    return <button {...props}>{children}</button>;
  },
}));

describe("AboutPreviewSection", () => {
  it("renders the section heading", () => {
    render(<AboutPreviewSection />);
    expect(screen.getByText("About Our Centre")).toBeInTheDocument();
  });

  it("renders the main heading with highlight text", () => {
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
});
