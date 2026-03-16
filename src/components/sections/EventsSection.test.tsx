import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { EventsSection } from "./EventsSection";
import { SanityEvent } from "@/types/sanity";

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

function makeEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "evt-1",
    title: "Test Event",
    slug: "test-event",
    time: "10:00 AM",
    location: "Main Hall",
    categories: ["Community"],
    description: "A test event description.",
    eventType: "single",
    date: "2026-04-15",
    ...overrides,
  };
}

function makeRecurringEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "rec-1",
    title: "Weekly Class",
    slug: "weekly-class",
    time: "9:00 AM",
    location: "Education Centre",
    categories: ["Education"],
    description: "A recurring weekly class.",
    eventType: "recurring",
    recurringDay: "Saturdays",
    ...overrides,
  };
}

describe("EventsSection", () => {
  it("renders the section heading", () => {
    render(<EventsSection />);
    expect(screen.getByText("Events & Programs")).toBeInTheDocument();
  });

  it("renders View All Events link", () => {
    render(<EventsSection />);
    const link = screen.getByText("View All Events").closest("a");
    expect(link).toHaveAttribute("href", "/events");
  });

  it("renders fallback recurring programs when no events provided", () => {
    render(<EventsSection events={[]} />);
    expect(screen.getByText("Weekly Programs")).toBeInTheDocument();
    expect(screen.getByText("Jumu'ah Prayer")).toBeInTheDocument();
    expect(screen.getByText("IQRA Academy")).toBeInTheDocument();
    expect(screen.getByText("Salam Arabic School")).toBeInTheDocument();
  });

  it("renders dated event cards", () => {
    const events = [
      makeEvent({ _id: "e1", title: "Eid Festival", slug: "eid-festival" }),
    ];
    render(<EventsSection events={events} />);
    expect(screen.getByText("Eid Festival")).toBeInTheDocument();
    expect(screen.getByText("Coming Up")).toBeInTheDocument();
  });

  it("renders recurring event cards from Sanity when provided", () => {
    const events = [
      makeRecurringEvent({ _id: "r1", title: "Quran Circle", recurringDay: "Mondays" }),
    ];
    render(<EventsSection events={events} />);
    expect(screen.getByText("Quran Circle")).toBeInTheDocument();
    expect(screen.getByText("Mondays")).toBeInTheDocument();
  });

  it("limits dated events to 2", () => {
    const events = [
      makeEvent({ _id: "e1", title: "Event One", slug: "event-one" }),
      makeEvent({ _id: "e2", title: "Event Two", slug: "event-two" }),
      makeEvent({ _id: "e3", title: "Event Three", slug: "event-three" }),
    ];
    render(<EventsSection events={events} />);
    expect(screen.getByText("Event One")).toBeInTheDocument();
    expect(screen.getByText("Event Two")).toBeInTheDocument();
    expect(screen.queryByText("Event Three")).not.toBeInTheDocument();
  });

  it("limits recurring events to 3", () => {
    const events = Array.from({ length: 5 }, (_, i) =>
      makeRecurringEvent({ _id: `r${i}`, title: `Recurring ${i}`, slug: `rec-${i}` })
    );
    render(<EventsSection events={events} />);
    expect(screen.getByText("Recurring 0")).toBeInTheDocument();
    expect(screen.getByText("Recurring 2")).toBeInTheDocument();
    expect(screen.queryByText("Recurring 3")).not.toBeInTheDocument();
  });

  it("shows empty state when no events and all data empty", () => {
    render(<EventsSection events={[]} />);
    // Still renders because fallback recurring programs are used
    expect(screen.getByText("Weekly Programs")).toBeInTheDocument();
  });

  it("renders event time and location", () => {
    render(<EventsSection events={[makeEvent({ time: "3:00 PM", location: "Hall B" })]} />);
    expect(screen.getByText("3:00 PM")).toBeInTheDocument();
    expect(screen.getByText("Hall B")).toBeInTheDocument();
  });

  it("uses shortDescription when available", () => {
    render(
      <EventsSection
        events={[makeEvent({ shortDescription: "Brief summary", description: "Full description" })]}
      />
    );
    expect(screen.getByText("Brief summary")).toBeInTheDocument();
  });

  it("links dated event cards to event detail page", () => {
    render(<EventsSection events={[makeEvent({ slug: "my-event" })]} />);
    const links = screen.getAllByRole("link");
    const eventLink = links.find((l) => l.getAttribute("href") === "/events/my-event");
    expect(eventLink).toBeDefined();
  });
});
