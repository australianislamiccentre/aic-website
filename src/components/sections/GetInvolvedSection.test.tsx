import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { GetInvolvedSection } from "./GetInvolvedSection";

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

describe("GetInvolvedSection", () => {
  it("renders the section heading", () => {
    render(<GetInvolvedSection />);
    expect(screen.getByText("Involved")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<GetInvolvedSection />);
    expect(
      screen.getByText("There are many ways to be part of the AIC community")
    ).toBeInTheDocument();
  });

  it("renders all four action cards", () => {
    render(<GetInvolvedSection />);
    expect(screen.getByText("Visit Us")).toBeInTheDocument();
    expect(screen.getByText("Volunteer")).toBeInTheDocument();
    expect(screen.getByText("Donate")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders action card descriptions", () => {
    render(<GetInvolvedSection />);
    expect(
      screen.getByText("Explore our award-winning centre and join us for prayer")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Give your time and skills to help our community thrive")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Support our programs, services, and centre upkeep")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reach out with questions, feedback, or to learn more")
    ).toBeInTheDocument();
  });

  it("links Visit Us card to /visit", () => {
    render(<GetInvolvedSection />);
    const visitLink = screen.getByText("Visit Us").closest("a");
    expect(visitLink).toHaveAttribute("href", "/visit");
  });

  it("links Volunteer card to /contact?subject=volunteer", () => {
    render(<GetInvolvedSection />);
    const volunteerLink = screen.getByText("Volunteer").closest("a");
    expect(volunteerLink).toHaveAttribute("href", "/contact?subject=volunteer");
  });

  it("links Donate card to /donate", () => {
    render(<GetInvolvedSection />);
    const donateLink = screen.getByText("Donate").closest("a");
    expect(donateLink).toHaveAttribute("href", "/donate");
  });

  it("links Contact card to /contact", () => {
    render(<GetInvolvedSection />);
    const contactLink = screen.getByText("Contact").closest("a");
    expect(contactLink).toHaveAttribute("href", "/contact");
  });
});
