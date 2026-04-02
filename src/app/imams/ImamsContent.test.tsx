import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import ImamsContent from "./ImamsContent";
import { SanityTeamMember } from "@/types/sanity";

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

// Mock FadeIn and Stagger components
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

function makeImam(overrides: Partial<SanityTeamMember> = {}): SanityTeamMember {
  return {
    _id: "imam-1",
    name: "Sheikh Ahmad",
    slug: "sheikh-ahmad",
    role: "Head Imam",
    category: "imam",
    ...overrides,
  };
}

describe("ImamsContent", () => {
  it("renders the page title", () => {
    render(<ImamsContent imams={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Our Imams");
  });

  it("renders the section heading", () => {
    render(<ImamsContent imams={[]} />);
    expect(screen.getByText("Meet Our Religious Leaders")).toBeInTheDocument();
  });

  it("renders imam cards with name and role", () => {
    const imams = [
      makeImam({ _id: "i1", name: "Sheikh Ahmad", role: "Head Imam" }),
      makeImam({ _id: "i2", name: "Imam Mohamed", role: "Assistant Imam", slug: "imam-mohamed" }),
    ];
    render(<ImamsContent imams={imams} />);
    expect(screen.getByText("Sheikh Ahmad")).toBeInTheDocument();
    expect(screen.getByText("Head Imam")).toBeInTheDocument();
    expect(screen.getByText("Imam Mohamed")).toBeInTheDocument();
    expect(screen.getByText("Assistant Imam")).toBeInTheDocument();
  });

  it("shows empty state when no imams are provided", () => {
    render(<ImamsContent imams={[]} />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByText(/Information about our Imams will be available soon/)).toBeInTheDocument();
  });

  it("renders imam image when available", () => {
    const imams = [
      makeImam({
        image: { _type: "image", asset: { _ref: "image-123", _type: "reference" } },
      }),
    ];
    render(<ImamsContent imams={imams} />);
    const img = screen.getByAltText("Sheikh Ahmad");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders a placeholder when imam has no image", () => {
    render(<ImamsContent imams={[makeImam()]} />);
    // No img tag with imam name as alt, but the placeholder div should exist
    expect(screen.queryByAltText("Sheikh Ahmad")).not.toBeInTheDocument();
  });

  it("renders qualifications when provided", () => {
    const imams = [
      makeImam({
        qualifications: ["Bachelor of Islamic Studies", "Masters in Fiqh"],
      }),
    ];
    render(<ImamsContent imams={imams} />);
    expect(screen.getByText("Qualifications")).toBeInTheDocument();
    expect(screen.getByText("Bachelor of Islamic Studies")).toBeInTheDocument();
    expect(screen.getByText("Masters in Fiqh")).toBeInTheDocument();
  });

  it("renders specializations when provided", () => {
    const imams = [
      makeImam({
        specializations: ["Quran Recitation", "Islamic Jurisprudence"],
      }),
    ];
    render(<ImamsContent imams={imams} />);
    expect(screen.getByText("Areas of Expertise")).toBeInTheDocument();
    expect(screen.getByText("Quran Recitation")).toBeInTheDocument();
    expect(screen.getByText("Islamic Jurisprudence")).toBeInTheDocument();
  });

  it("renders contact information when showContactInfo is true", () => {
    const imams = [
      makeImam({
        showContactInfo: true,
        email: "sheikh@aic.org.au",
        phone: "03 1234 5678",
        officeHours: "Mon-Fri 9am-5pm",
      }),
    ];
    render(<ImamsContent imams={imams} />);
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByText("sheikh@aic.org.au")).toBeInTheDocument();
    expect(screen.getByText("03 1234 5678")).toBeInTheDocument();
    expect(screen.getByText("Mon-Fri 9am-5pm")).toBeInTheDocument();
  });

  it("hides contact information when showContactInfo is false", () => {
    const imams = [
      makeImam({
        showContactInfo: false,
        email: "sheikh@aic.org.au",
      }),
    ];
    render(<ImamsContent imams={imams} />);
    expect(screen.queryByText("Contact Information")).not.toBeInTheDocument();
    expect(screen.queryByText("sheikh@aic.org.au")).not.toBeInTheDocument();
  });

  it("renders the services section", () => {
    render(<ImamsContent imams={[]} />);
    expect(screen.getByText("Services Offered by Our Imams")).toBeInTheDocument();
    expect(screen.getByText("Religious Counselling")).toBeInTheDocument();
    expect(screen.getByText("Marriage Services")).toBeInTheDocument();
  });

  it("renders short bio when no portable text bio is available", () => {
    const imams = [
      makeImam({
        shortBio: "A respected scholar with 20 years of experience.",
      }),
    ];
    render(<ImamsContent imams={imams} />);
    expect(screen.getByText("A respected scholar with 20 years of experience.")).toBeInTheDocument();
  });

  it("renders PortableText bio when available", () => {
    const imams = [
      makeImam({
        bio: [{ _type: "block", _key: "b1" }],
      }),
    ];
    render(<ImamsContent imams={imams} />);
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();
  });

  describe("pageSettings wiring", () => {
    it("renders fallback hero heading when pageSettings is null", () => {
      render(<ImamsContent imams={[]} pageSettings={null} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Our Imams");
    });

    it("renders Sanity hero heading when pageSettings provides heroHeading", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{ heroHeading: "Meet Our", heroHeadingAccent: "Scholars" }}
        />
      );
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Meet Our");
      expect(h1).toHaveTextContent("Scholars");
    });

    it("renders Sanity hero description when provided", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{ heroDescription: "Our dedicated scholars serve the community." }}
        />
      );
      expect(screen.getByText("Our dedicated scholars serve the community.")).toBeInTheDocument();
    });

    it("renders Sanity imams section heading and description", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{
            imamsSectionHeading: "Our Distinguished Imams",
            imamsSectionDescription: "Dedicated to the community.",
          }}
        />
      );
      expect(screen.getByText("Our Distinguished Imams")).toBeInTheDocument();
      expect(screen.getByText("Dedicated to the community.")).toBeInTheDocument();
    });

    it("renders Sanity servicesOfferedCards instead of fallback", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{
            servicesOfferedCards: [
              { title: "Custom Service", description: "A custom service description" },
            ],
          }}
        />
      );
      expect(screen.getByText("Custom Service")).toBeInTheDocument();
      expect(screen.getByText("A custom service description")).toBeInTheDocument();
      // Fallback services should not appear
      expect(screen.queryByText("Religious Counselling")).not.toBeInTheDocument();
    });

    it("hides services section when servicesOfferedVisible is false", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{ servicesOfferedVisible: false }}
        />
      );
      expect(screen.queryByText("Services Offered by Our Imams")).not.toBeInTheDocument();
    });

    it("hides CTA section when ctaVisible is false", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{ ctaVisible: false }}
        />
      );
      expect(screen.queryByText("Need Spiritual Guidance?")).not.toBeInTheDocument();
    });

    it("renders Sanity CTA heading and description", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{
            ctaHeading: "Connect With Us",
            ctaDescription: "Reach out for guidance.",
          }}
        />
      );
      expect(screen.getByText("Connect With Us")).toBeInTheDocument();
      expect(screen.getByText("Reach out for guidance.")).toBeInTheDocument();
    });

    it("renders Sanity CTA buttons when provided", () => {
      render(
        <ImamsContent
          imams={[]}
          pageSettings={{
            ctaButtons: [
              { label: "Book Appointment", url: "/book", variant: "primary" },
              { label: "View Services", url: "/services", variant: "outline" },
            ],
          }}
        />
      );
      expect(screen.getByText("Book Appointment")).toBeInTheDocument();
      expect(screen.getByText("View Services")).toBeInTheDocument();
    });
  });
});
