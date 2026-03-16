import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { ServicesSection } from "./ServicesSection";
import { SanityService } from "@/types/sanity";

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

function makeService(overrides: Partial<SanityService> = {}): SanityService {
  return {
    _id: "svc-1",
    title: "Marriage Services",
    slug: "marriage-services",
    shortDescription: "Islamic marriage ceremony and registration.",
    icon: "Heart",
    ...overrides,
  };
}

describe("ServicesSection", () => {
  it("returns null when services array is empty", () => {
    const { container } = render(<ServicesSection services={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when all services are prayer-related", () => {
    const services = [
      makeService({ _id: "s1", title: "Friday Prayer Service" }),
      makeService({ _id: "s2", title: "Daily Prayer Times" }),
    ];
    const { container } = render(<ServicesSection services={services} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the section heading", () => {
    render(<ServicesSection services={[makeService()]} />);
    expect(screen.getByText("Our Services")).toBeInTheDocument();
    expect(screen.getByText("Excellence")).toBeInTheDocument();
  });

  it("renders service card with title and description", () => {
    render(
      <ServicesSection
        services={[
          makeService({
            title: "Funeral Services",
            shortDescription: "Complete janazah preparation and prayer services.",
          }),
        ]}
      />
    );
    expect(screen.getByText("Funeral Services")).toBeInTheDocument();
    expect(
      screen.getByText("Complete janazah preparation and prayer services.")
    ).toBeInTheDocument();
  });

  it("links service cards to detail pages", () => {
    render(
      <ServicesSection
        services={[makeService({ slug: "counselling" })]}
      />
    );
    const links = screen.getAllByRole("link");
    const serviceLink = links.find((l) =>
      l.getAttribute("href") === "/services/counselling"
    );
    expect(serviceLink).toBeDefined();
  });

  it("renders service image when available", () => {
    render(
      <ServicesSection
        services={[
          makeService({
            title: "Counselling",
            image: { _type: "image", asset: { _ref: "img-ref", _type: "reference" } },
          }),
        ]}
      />
    );
    expect(screen.getByAltText("Counselling")).toBeInTheDocument();
  });

  it("filters out prayer-related services", () => {
    const services = [
      makeService({ _id: "s1", title: "Friday Prayer Service" }),
      makeService({ _id: "s2", title: "Marriage Services" }),
      makeService({ _id: "s3", title: "Jumu'ah Preparation" }),
    ];
    render(<ServicesSection services={services} />);
    expect(screen.getByText("Marriage Services")).toBeInTheDocument();
    expect(screen.queryByText("Friday Prayer Service")).not.toBeInTheDocument();
    expect(screen.queryByText("Jumu'ah Preparation")).not.toBeInTheDocument();
  });

  it("limits display to 3 services", () => {
    const services = Array.from({ length: 5 }, (_, i) =>
      makeService({ _id: `svc-${i}`, title: `Service ${i}`, slug: `svc-${i}` })
    );
    render(<ServicesSection services={services} />);
    expect(screen.getByText("Service 0")).toBeInTheDocument();
    expect(screen.getByText("Service 2")).toBeInTheDocument();
    expect(screen.queryByText("Service 3")).not.toBeInTheDocument();
  });

  it("renders View All Services link", () => {
    render(<ServicesSection services={[makeService()]} />);
    const link = screen.getByText("View All Services").closest("a");
    expect(link).toHaveAttribute("href", "/services");
  });

  it("renders Learn more text on service cards", () => {
    render(<ServicesSection services={[makeService()]} />);
    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });

  it("handles service without image gracefully", () => {
    render(
      <ServicesSection
        services={[makeService({ image: undefined })]}
      />
    );
    expect(screen.getByText("Marriage Services")).toBeInTheDocument();
  });
});
