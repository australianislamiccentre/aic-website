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

  describe("pageSettings wiring", () => {
    it("renders fallback hero heading when pageSettings is null", () => {
      render(<VisitContent etiquette={[]} faqs={[]} pageSettings={null} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Visit Us");
    });

    it("renders Sanity heroHeading and heroHeadingAccent", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ heroHeading: "Come", heroHeadingAccent: "Visit" }}
        />
      );
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Come");
      expect(h1).toHaveTextContent("Visit");
    });

    it("renders Sanity hero description", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ heroDescription: "We welcome all visitors." }}
        />
      );
      expect(screen.getByText("We welcome all visitors.")).toBeInTheDocument();
    });

    it("hides visiting info section when visitingInfoVisible is false", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ visitingInfoVisible: false }}
        />
      );
      expect(screen.queryByText("Visiting Information")).not.toBeInTheDocument();
    });

    it("renders Sanity visitingInfoHeading", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ visitingInfoHeading: "How to Find Us" }}
        />
      );
      expect(screen.getByText("How to Find Us")).toBeInTheDocument();
    });

    it("renders Sanity visitingHours", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ visitingHours: "5:00 AM – 11:00 PM" }}
        />
      );
      expect(screen.getByText("5:00 AM – 11:00 PM")).toBeInTheDocument();
    });

    it("hides facilities section when facilitiesVisible is false", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ facilitiesVisible: false }}
        />
      );
      expect(screen.queryByText("Our Facilities")).not.toBeInTheDocument();
    });

    it("renders Sanity facilitiesHeading", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ facilitiesHeading: "Centre Amenities" }}
        />
      );
      expect(screen.getByText("Centre Amenities")).toBeInTheDocument();
    });

    it("renders Sanity facilitiesCards instead of defaults", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{
            facilitiesCards: [
              { name: "Grand Hall", capacity: "2,000+" },
            ],
          }}
        />
      );
      expect(screen.getByText("Grand Hall")).toBeInTheDocument();
      expect(screen.getByText("Capacity: 2,000+")).toBeInTheDocument();
      // Default facilities should not appear
      expect(screen.queryByText("Main Prayer Hall")).not.toBeInTheDocument();
    });

    it("hides mosque manners section when mannersVisible is false", () => {
      render(
        <VisitContent
          etiquette={[makeEtiquette()]}
          faqs={[]}
          pageSettings={{ mannersVisible: false }}
        />
      );
      expect(screen.queryByText("Mosque Manners")).not.toBeInTheDocument();
    });

    it("renders Sanity mannersBadge and mannersHeading", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ mannersBadge: "Etiquette", mannersHeading: "House Rules" }}
        />
      );
      expect(screen.getByText("Etiquette")).toBeInTheDocument();
      expect(screen.getByText("House Rules")).toBeInTheDocument();
    });

    it("uses pageSettings.etiquetteItems over the etiquette prop", () => {
      render(
        <VisitContent
          etiquette={[makeEtiquette({ _id: "e-prop", title: "From Prop" })]}
          faqs={[]}
          pageSettings={{
            etiquetteItems: [{ title: "From Settings", description: "Settings etiquette" }],
          }}
        />
      );
      expect(screen.getByText("From Settings")).toBeInTheDocument();
      expect(screen.queryByText("From Prop")).not.toBeInTheDocument();
    });

    it("hides FAQ section when faqVisible is false", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[makeFaq()]}
          pageSettings={{ faqVisible: false }}
        />
      );
      expect(screen.queryByText("Frequently Asked Questions")).not.toBeInTheDocument();
    });

    it("renders Sanity faqBadge and faqHeading", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ faqBadge: "Questions", faqHeading: "Common Queries" }}
        />
      );
      expect(screen.getByText("Questions")).toBeInTheDocument();
      expect(screen.getByText("Common Queries")).toBeInTheDocument();
    });

    it("uses pageSettings.faqItems over the faqs prop", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[makeFaq({ _id: "f-prop", question: "From Prop Question?" })]}
          pageSettings={{
            faqItems: [{ question: "From Settings Question?", answer: [{ _type: "block", _key: "b1", children: [{ _type: "span", _key: "s1", text: "Answer from settings." }] }] }],
          }}
        />
      );
      expect(screen.getByText("From Settings Question?")).toBeInTheDocument();
      expect(screen.queryByText("From Prop Question?")).not.toBeInTheDocument();
    });

    it("hides CTA section when ctaVisible is false", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ ctaVisible: false }}
        />
      );
      expect(screen.queryByText("We Look Forward to Welcoming You")).not.toBeInTheDocument();
    });

    it("renders Sanity CTA heading", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{ ctaHeading: "Hope to See You Soon" }}
        />
      );
      expect(screen.getByText("Hope to See You Soon")).toBeInTheDocument();
    });

    it("renders Sanity CTA buttons when provided", () => {
      render(
        <VisitContent
          etiquette={[]}
          faqs={[]}
          pageSettings={{
            ctaButtons: [
              { label: "Plan a Visit", url: "/plan", variant: "primary" },
              { label: "Get Directions", url: "/directions", variant: "outline" },
            ],
          }}
        />
      );
      expect(screen.getByText("Plan a Visit")).toBeInTheDocument();
      expect(screen.getAllByText("Get Directions").length).toBeGreaterThanOrEqual(1);
    });
  });
});
