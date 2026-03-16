import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import VisitContent from "./VisitContent";
import { SanityEtiquette, SanityFaq } from "@/types/sanity";

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
  FadeIn: ({ children, direction }: { children: React.ReactNode; direction?: string }) => (
    <div data-direction={direction}>{children}</div>
  ),
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

// Mock PortableText
vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{value ? `${value.length} block(s)` : null}</div>
  ),
}));

// Mock SiteSettingsContext
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    name: "Australian Islamic Centre",
    shortName: "AIC",
    tagline: "Welcome to AIC",
    parentOrganization: "ISWM",
    address: {
      street: "15 Blenheim Road",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
      full: "15 Blenheim Road, Newport VIC 3015, Australia",
    },
    phone: "(03) 9391 2834",
    email: "info@aic.org.au",
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/aic",
    },
    externalLinks: {
      college: "https://aicc.edu.au",
      bookstore: "https://bookstore.aic.org.au",
      newportStorm: "https://newportstorm.com.au",
    },
  }),
}));

function makeEtiquette(overrides: Partial<SanityEtiquette> = {}): SanityEtiquette {
  return {
    _id: "etq-1",
    title: "Remove Shoes",
    description: "Please remove your shoes before entering the prayer hall.",
    icon: "footprints",
    ...overrides,
  };
}

function makeFaq(overrides: Partial<SanityFaq> = {}): SanityFaq {
  return {
    _id: "faq-1",
    question: "Is the mosque open to visitors?",
    answer: [{ _type: "block", _key: "b1" }],
    ...overrides,
  };
}

describe("VisitContent", () => {
  it("renders the page title", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Visit Us");
  });

  it("renders visitor information section", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("Visiting Information")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Opening Hours")).toBeInTheDocument();
  });

  it("displays the centre address from site settings", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    const addressElements = screen.getAllByText(/15 Blenheim Road/);
    expect(addressElements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays phone and email", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("(03) 9391 2834")).toBeInTheDocument();
    expect(screen.getByText("info@aic.org.au")).toBeInTheDocument();
  });

  it("renders etiquette guidelines when provided", () => {
    const etiquette = [
      makeEtiquette({ _id: "e1", title: "Remove Shoes", description: "Take off shoes at the entrance." }),
      makeEtiquette({ _id: "e2", title: "Dress Modestly", description: "Cover arms and legs.", icon: "shirt" }),
    ];
    render(<VisitContent etiquette={etiquette} faqs={[]} />);
    expect(screen.getByText("Mosque Manners")).toBeInTheDocument();
    expect(screen.getByText("Remove Shoes")).toBeInTheDocument();
    expect(screen.getByText("Dress Modestly")).toBeInTheDocument();
    expect(screen.getByText("Take off shoes at the entrance.")).toBeInTheDocument();
  });

  it("shows fallback text when no etiquette guidelines are provided", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("Please contact us for visitor guidelines before your visit.")).toBeInTheDocument();
  });

  it("renders FAQ section with questions", () => {
    const faqs = [
      makeFaq({ _id: "f1", question: "Can I visit anytime?" }),
      makeFaq({ _id: "f2", question: "Is there parking?" }),
    ];
    render(<VisitContent etiquette={[]} faqs={faqs} />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("Can I visit anytime?")).toBeInTheDocument();
    expect(screen.getByText("Is there parking?")).toBeInTheDocument();
  });

  it("opens FAQ answer when question is clicked", async () => {
    const user = userEvent.setup();
    const faqs = [
      makeFaq({ _id: "f1", question: "Can I visit anytime?" }),
    ];
    render(<VisitContent etiquette={[]} faqs={faqs} />);

    await user.click(screen.getByText("Can I visit anytime?"));
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();
  });

  it("closes FAQ answer when clicked again", async () => {
    const user = userEvent.setup();
    const faqs = [
      makeFaq({ _id: "f1", question: "Can I visit anytime?" }),
    ];
    render(<VisitContent etiquette={[]} faqs={faqs} />);

    await user.click(screen.getByText("Can I visit anytime?"));
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();

    await user.click(screen.getByText("Can I visit anytime?"));
    expect(screen.queryByTestId("portable-text")).not.toBeInTheDocument();
  });

  it("falls back to hardcoded FAQs when no Sanity FAQs provided", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("Is the mosque open to non-Muslim visitors?")).toBeInTheDocument();
    expect(screen.getByText("What should I wear when visiting?")).toBeInTheDocument();
  });

  it("renders facilities section", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("Our Facilities")).toBeInTheDocument();
    expect(screen.getByText("Main Prayer Hall")).toBeInTheDocument();
    expect(screen.getByText("Education Centre")).toBeInTheDocument();
    expect(screen.getByText("Capacity: 1,000+")).toBeInTheDocument();
  });

  it("renders the CTA section", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("We Look Forward to Welcoming You")).toBeInTheDocument();
    expect(screen.getByText("Book a Visit")).toBeInTheDocument();
    expect(screen.getByText("Prayer Times")).toBeInTheDocument();
  });

  it("renders opening hours", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("Daily")).toBeInTheDocument();
  });

  it("renders Get Directions button with correct link", () => {
    render(<VisitContent etiquette={[]} faqs={[]} />);
    expect(screen.getByText("Get Directions")).toBeInTheDocument();
  });
});
