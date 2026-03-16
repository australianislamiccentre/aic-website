import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { DonationCTASection } from "./DonationCTASection";

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

describe("DonationCTASection", () => {
  it("renders the section heading", () => {
    render(<DonationCTASection />);
    expect(screen.getByText("Transforms Lives")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<DonationCTASection />);
    expect(
      screen.getByText(/Every contribution helps us maintain our centre/)
    ).toBeInTheDocument();
  });

  it("renders all four donation amount buttons", () => {
    render(<DonationCTASection />);
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("$250")).toBeInTheDocument();
  });

  it("renders donation option labels", () => {
    render(<DonationCTASection />);
    expect(screen.getByText("Feed a Family")).toBeInTheDocument();
    expect(screen.getByText("Education Fund")).toBeInTheDocument();
    expect(screen.getByText("Zakat")).toBeInTheDocument();
    expect(screen.getByText("Building Fund")).toBeInTheDocument();
  });

  it("renders impact stats", () => {
    render(<DonationCTASection />);
    expect(screen.getByText("5,000+")).toBeInTheDocument();
    expect(screen.getByText("Meals Served Annually")).toBeInTheDocument();
    expect(screen.getByText("200+")).toBeInTheDocument();
    expect(screen.getByText("Students Supported")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Goes to Charity")).toBeInTheDocument();
  });

  it("renders trust badges", () => {
    render(<DonationCTASection />);
    expect(screen.getByText("Secure Payment")).toBeInTheDocument();
    expect(screen.getByText("Tax Deductible")).toBeInTheDocument();
    expect(screen.getByText("Registered Charity")).toBeInTheDocument();
  });

  it("defaults to $100 selected and shows its description", () => {
    render(<DonationCTASection />);
    expect(screen.getByText("Fulfill your zakat obligation")).toBeInTheDocument();
  });

  it("shows the donate now button with default amount", () => {
    render(<DonationCTASection />);
    const donateLink = screen.getByText("Donate $100 Now").closest("a");
    expect(donateLink).toHaveAttribute("href", "/donate?amount=100");
  });

  it("updates selected amount and description when clicking a different option", async () => {
    const user = userEvent.setup();
    render(<DonationCTASection />);

    await user.click(screen.getByText("$25"));
    expect(screen.getByText("Provide meals for a family in need")).toBeInTheDocument();
    expect(screen.getByText("Donate $25 Now")).toBeInTheDocument();
  });

  it("renders monthly giving link", () => {
    render(<DonationCTASection />);
    const monthlyLink = screen.getByText("Set Up Monthly Giving").closest("a");
    expect(monthlyLink).toHaveAttribute("href", "/donate#recurring");
  });

  it("renders custom amount link", () => {
    render(<DonationCTASection />);
    const customLink = screen.getByText("Enter custom amount");
    expect(customLink).toHaveAttribute("href", "/donate");
  });

  it("renders Choose Your Impact heading", () => {
    render(<DonationCTASection />);
    expect(screen.getByText("Choose Your Impact")).toBeInTheDocument();
  });
});
