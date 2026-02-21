import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import ServicesContent from "./ServicesContent";
import { SanityService } from "@/types/sanity";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
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

// Mock useSiteSettings
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    email: "test@aic.org",
    phone: "03 9000 0177",
    name: "Australian Islamic Centre",
    shortName: "AIC",
    tagline: "Test tagline",
    parentOrganization: "ICV",
    address: { street: "", suburb: "", state: "", postcode: "", country: "", full: "" },
    socialMedia: { facebook: "", instagram: "", youtube: "" },
    externalLinks: { college: "", bookstore: "", newportStorm: "" },
  }),
}));

// Mock Breadcrumb
vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="breadcrumb">Breadcrumb</nav>,
}));

function makeService(overrides: Partial<SanityService> = {}): SanityService {
  return {
    _id: "svc-1",
    title: "Test Service",
    slug: "test-service",
    shortDescription: "A test service",
    icon: "Heart",
    ...overrides,
  };
}

describe("ServicesContent", () => {
  describe("Empty state", () => {
    it("renders empty state when no services provided", () => {
      render(<ServicesContent services={[]} />);
      expect(screen.getByText("Our Services Are Being Updated")).toBeInTheDocument();
    });

    it("shows email and phone contact links in empty state", () => {
      render(<ServicesContent services={[]} />);
      expect(screen.getByText("Email Us")).toBeInTheDocument();
      expect(screen.getByText("03 9000 0177")).toBeInTheDocument();
    });
  });

  describe("Service cards", () => {
    it("renders service titles", () => {
      const services = [
        makeService({ _id: "svc-1", title: "Nikah Services", slug: "nikah" }),
        makeService({ _id: "svc-2", title: "Funeral Services", slug: "funeral" }),
      ];

      render(<ServicesContent services={services} />);
      expect(screen.getByText("Nikah Services")).toBeInTheDocument();
      expect(screen.getByText("Funeral Services")).toBeInTheDocument();
    });

    it("renders short descriptions", () => {
      const services = [
        makeService({ shortDescription: "We help with nikah ceremonies" }),
      ];

      render(<ServicesContent services={services} />);
      expect(screen.getByText("We help with nikah ceremonies")).toBeInTheDocument();
    });

    it("renders highlights as card features (not requirements)", () => {
      const services = [
        makeService({
          highlights: ["Fast turnaround", "Experienced staff"],
          requirements: ["Must be 18+", "Need photo ID"],
        }),
      ];

      render(<ServicesContent services={services} />);
      // highlights should appear
      expect(screen.getByText("Fast turnaround")).toBeInTheDocument();
      expect(screen.getByText("Experienced staff")).toBeInTheDocument();
      // requirements should NOT appear on cards
      expect(screen.queryByText("Must be 18+")).not.toBeInTheDocument();
      expect(screen.queryByText("Need photo ID")).not.toBeInTheDocument();
    });

    it("limits highlights to 3", () => {
      const services = [
        makeService({
          highlights: ["One", "Two", "Three", "Four"],
        }),
      ];

      render(<ServicesContent services={services} />);
      expect(screen.getByText("One")).toBeInTheDocument();
      expect(screen.getByText("Two")).toBeInTheDocument();
      expect(screen.getByText("Three")).toBeInTheDocument();
      expect(screen.queryByText("Four")).not.toBeInTheDocument();
    });
  });

  describe("Links", () => {
    it("Learn More links to /services/[slug]", () => {
      const services = [
        makeService({ slug: "nikah" }),
      ];

      render(<ServicesContent services={services} />);
      const learnMore = screen.getByText("Learn More");
      const link = learnMore.closest("a");
      expect(link).toHaveAttribute("href", "/services/nikah");
    });

    it("entire card links to /services/[slug]", () => {
      const services = [makeService({ slug: "nikah" })];

      render(<ServicesContent services={services} />);
      const link = screen.getByText("Learn More").closest("a");
      expect(link).toHaveAttribute("href", "/services/nikah");
    });
  });

  describe("Schedule display", () => {
    it("shows availability when provided", () => {
      const services = [
        makeService({ availability: "Mon-Fri 9am-5pm" }),
      ];

      render(<ServicesContent services={services} />);
      expect(screen.getByText("Mon-Fri 9am-5pm")).toBeInTheDocument();
    });

    it("shows 'By appointment' as default schedule", () => {
      const services = [makeService()];

      render(<ServicesContent services={services} />);
      expect(screen.getByText("By appointment")).toBeInTheDocument();
    });
  });

  describe("Page heading", () => {
    it("renders page title", () => {
      const services = [makeService()];

      render(<ServicesContent services={services} />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Our Services");
    });
  });
});
