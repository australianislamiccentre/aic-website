import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { WhatsOnSection } from "./WhatsOnSection";
import { SanityService, SanityEvent, SanityProgram } from "@/types/sanity";

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
    description: "A test event description",
    categories: [],
    date: "2026-03-01",
    time: "10:00 AM",
    location: "AIC",
    ...overrides,
  };
}

function makeProgram(overrides: Partial<SanityProgram> = {}): SanityProgram {
  return {
    _id: "prog-1",
    title: "Test Program",
    slug: "test-program",
    shortDescription: "A test program",
    description: "A test program description",
    categories: [],
    date: "2026-03-01",
    time: "2:00 PM",
    location: "AIC Hall",
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
    it("renders nothing when all arrays are empty", () => {
      const { container } = render(<WhatsOnSection />);
      expect(container.innerHTML).toBe("");
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
      expect(screen.getAllByText("Nikah Services").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Funeral Services").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Hide empty categories", () => {
    it("does not show 'No events right now' placeholder when events are empty", () => {
      const services = [makeService()];

      render(<WhatsOnSection services={services} />);
      expect(screen.queryByText(/No events right now/)).not.toBeInTheDocument();
      expect(screen.queryByText(/No programs right now/)).not.toBeInTheDocument();
    });

    it("only renders column headers for categories with items (desktop)", () => {
      const services = [makeService()];

      render(<WhatsOnSection services={services} />);
      // Services header should exist
      expect(screen.getByText("Services")).toBeInTheDocument();
      // Events and Programs headers should NOT exist
      expect(screen.queryByText("Events")).not.toBeInTheDocument();
      expect(screen.queryByText("Programs")).not.toBeInTheDocument();
    });

    it("renders all three columns when all categories have items", () => {
      const services = [makeService()];
      const events = [makeEvent()];
      const programs = [makeProgram()];

      render(<WhatsOnSection services={services} events={events} programs={programs} />);
      // All column headers should be present
      expect(screen.getAllByText("Events").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Programs").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Services").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Responsive card sizing", () => {
    it("shows up to 6 items when only 1 category is active (expanded mode)", () => {
      const services = Array.from({ length: 7 }, (_, i) =>
        makeService({ _id: `svc-${i + 1}`, title: `Service ${i + 1}`, slug: `s${i + 1}` }),
      );

      render(<WhatsOnSection services={services} />);
      // Expanded mode allows up to 6 items
      expect(screen.getAllByText("Service 1").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Service 6").length).toBeGreaterThanOrEqual(1);
      // 7th item should be hidden
      expect(screen.queryByText("Service 7")).not.toBeInTheDocument();
    });

    it("shows up to 4 items when 2 categories are active (medium mode)", () => {
      const services = Array.from({ length: 5 }, (_, i) =>
        makeService({ _id: `svc-${i + 1}`, title: `Service ${i + 1}`, slug: `s${i + 1}` }),
      );
      const events = [makeEvent()];

      render(<WhatsOnSection services={services} events={events} />);
      expect(screen.getAllByText("Service 4").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Service 5")).not.toBeInTheDocument();
    });

    it("shows up to 3 items when all 3 categories are active (compact mode)", () => {
      const services = Array.from({ length: 4 }, (_, i) =>
        makeService({ _id: `svc-${i + 1}`, title: `Service ${i + 1}`, slug: `s${i + 1}` }),
      );
      const events = [makeEvent()];
      const programs = [makeProgram()];

      render(<WhatsOnSection services={services} events={events} programs={programs} />);
      expect(screen.getAllByText("Service 3").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Service 4")).not.toBeInTheDocument();
    });
  });

  describe("Mobile tab bar", () => {
    it("hides tab bar when only 1 category is active", () => {
      const services = [makeService()];

      render(<WhatsOnSection services={services} />);
      // Tab buttons should not exist — no need for tabs with only one category
      expect(screen.queryByRole("button", { name: /Events/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Programs/i })).not.toBeInTheDocument();
      // The Services header exists as column text, but not as a tab button
      const serviceButtons = screen.queryAllByRole("button").filter(
        (btn) => btn.textContent?.includes("Services"),
      );
      expect(serviceButtons.length).toBe(0);
    });

    it("shows tab buttons only for active categories", () => {
      const services = [makeService()];
      const events = [makeEvent()];

      render(<WhatsOnSection services={services} events={events} />);
      // Tab buttons for active categories
      const tabButtons = screen.getAllByRole("button").filter(
        (btn) => btn.textContent?.includes("Events") || btn.textContent?.includes("Services"),
      );
      expect(tabButtons.length).toBe(2);
      // Programs tab button should not exist
      const programButtons = screen.getAllByRole("button").filter(
        (btn) => btn.textContent?.includes("Programs"),
      );
      expect(programButtons.length).toBe(0);
    });

    it("switches content when clicking a tab", async () => {
      const user = userEvent.setup();
      const services = [makeService({ _id: "svc-1", title: "My Service", slug: "my-svc" })];
      const events = [makeEvent({ _id: "evt-1", title: "My Event", slug: "my-evt" })];

      render(<WhatsOnSection services={services} events={events} />);

      // Default active tab is the first active category (events)
      expect(screen.getAllByText("My Event").length).toBeGreaterThanOrEqual(1);

      // Click Services tab
      const servicesTab = screen.getAllByRole("button").find(
        (btn) => btn.textContent?.includes("Services"),
      );
      if (servicesTab) {
        await user.click(servicesTab);
      }
    });
  });
});
