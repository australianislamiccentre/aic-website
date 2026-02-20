import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { WhatsOnSection } from "./WhatsOnSection";
import { SanityService, SanityEvent } from "@/types/sanity";

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

function makeEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "evt-1",
    title: "Test Event",
    slug: "test-event",
    shortDescription: "A test event",
    date: "2026-03-01",
    time: "10:00 AM",
    location: "AIC",
    ...overrides,
  };
}

// Note: WhatsOnSection renders items in both mobile and desktop views,
// so each item title appears twice in the DOM. We use getAllByText where needed.

describe("WhatsOnSection", () => {
  describe("Prayer keyword filtering", () => {
    it("does NOT filter out services titled 'Religious Services'", () => {
      const services = [
        makeService({ _id: "svc-1", title: "Religious Services", slug: "religious-services" }),
      ];

      render(<WhatsOnSection services={services} />);
      // Appears in both mobile + desktop views
      const matches = screen.getAllByText("Religious Services");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("filters out services with prayer-specific titles", () => {
      const services = [
        makeService({ _id: "svc-1", title: "Friday Prayer Service", slug: "friday-prayer" }),
        makeService({ _id: "svc-2", title: "Counselling & Support", slug: "counselling" }),
      ];

      render(<WhatsOnSection services={services} />);
      expect(screen.queryByText("Friday Prayer Service")).not.toBeInTheDocument();
      const matches = screen.getAllByText("Counselling & Support");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("filters out events with Jumu'ah in the title", () => {
      const events = [
        makeEvent({ _id: "evt-1", title: "Jumu'ah Prayers", slug: "jumuah" }),
        makeEvent({ _id: "evt-2", title: "Community Dinner", slug: "dinner", date: "2026-04-01" }),
      ];

      render(<WhatsOnSection events={events} />);
      expect(screen.queryByText("Jumu'ah Prayers")).not.toBeInTheDocument();
      const matches = screen.getAllByText("Community Dinner");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Rendering", () => {
    it("renders nothing when no content is provided", () => {
      const { container } = render(<WhatsOnSection />);
      expect(container.querySelector("section")).toBeNull();
    });

    it("renders the section when services are provided", () => {
      const services = [makeService()];

      render(<WhatsOnSection services={services} />);
      expect(screen.getByText("Discover What's")).toBeInTheDocument();
    });

    it("renders service titles", () => {
      const services = [
        makeService({ _id: "svc-1", title: "Nikah Services", slug: "nikah" }),
        makeService({ _id: "svc-2", title: "Funeral Services", slug: "funeral" }),
      ];

      render(<WhatsOnSection services={services} />);
      // Each title appears in both mobile and desktop views
      expect(screen.getAllByText("Nikah Services").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Funeral Services").length).toBeGreaterThanOrEqual(1);
    });

    it("shows max 3 services", () => {
      const services = [
        makeService({ _id: "svc-1", title: "Service 1", slug: "s1" }),
        makeService({ _id: "svc-2", title: "Service 2", slug: "s2" }),
        makeService({ _id: "svc-3", title: "Service 3", slug: "s3" }),
        makeService({ _id: "svc-4", title: "Service 4", slug: "s4" }),
      ];

      render(<WhatsOnSection services={services} />);
      expect(screen.getAllByText("Service 1").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Service 2").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Service 3").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Service 4")).not.toBeInTheDocument();
    });
  });
});
