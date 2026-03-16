import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { UpcomingSection } from "./UpcomingSection";
import { SanityEvent, SanityProgram } from "@/types/sanity";

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

function makeDatedEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "evt-1",
    title: "Community Iftar",
    slug: "community-iftar",
    time: "6:30 PM",
    location: "Main Hall",
    categories: ["Community"],
    description: "Annual community iftar dinner.",
    eventType: "single",
    date: "2026-04-15",
    ...overrides,
  };
}

function makeRecurringEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "rec-1",
    title: "Sisters Circle",
    slug: "sisters-circle",
    time: "10:00 AM",
    location: "Community Room",
    categories: ["Women"],
    description: "Weekly gathering for sisters.",
    eventType: "recurring",
    recurringDay: "wednesday",
    ...overrides,
  };
}

function makeProgram(overrides: Partial<SanityProgram> = {}): SanityProgram {
  return {
    _id: "prog-1",
    title: "Arabic School",
    slug: "arabic-school",
    time: "9:00 AM",
    location: "Education Centre",
    categories: ["Education"],
    description: "Arabic language classes.",
    eventType: "recurring",
    recurringDay: "saturday",
    ...overrides,
  };
}

describe("UpcomingSection", () => {
  it("returns null when no events and no programs", () => {
    const { container } = render(<UpcomingSection events={[]} programs={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null with default undefined props", () => {
    const { container } = render(<UpcomingSection />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the section heading when events exist", () => {
    render(<UpcomingSection events={[makeDatedEvent()]} />);
    expect(screen.getByText("Events & Programs")).toBeInTheDocument();
    expect(screen.getByText(/What's Happening/)).toBeInTheDocument();
  });

  it("renders dated event cards", () => {
    const events = [
      makeDatedEvent({ _id: "e1", title: "Eid Celebration", slug: "eid" }),
    ];
    render(<UpcomingSection events={events} />);
    expect(screen.getByText("Eid Celebration")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
  });

  it("renders event time and date", () => {
    render(<UpcomingSection events={[makeDatedEvent({ time: "7:00 PM", date: "2026-05-01" })]} />);
    expect(screen.getByText("7:00 PM")).toBeInTheDocument();
  });

  it("renders weekly event cards", () => {
    const events = [
      makeRecurringEvent({ _id: "w1", title: "Quran Study", recurringDay: "monday" }),
    ];
    render(<UpcomingSection events={events} />);
    expect(screen.getByText("Quran Study")).toBeInTheDocument();
    expect(screen.getByText("Weekly Events")).toBeInTheDocument();
    expect(screen.getByText("Monday")).toBeInTheDocument();
  });

  it("renders program cards", () => {
    const programs = [
      makeProgram({ _id: "p1", title: "Youth Leadership", slug: "youth-leadership" }),
    ];
    render(<UpcomingSection programs={programs} />);
    expect(screen.getByText("Youth Leadership")).toBeInTheDocument();
    expect(screen.getByText("Weekly Programs")).toBeInTheDocument();
  });

  it("filters out prayer-related events", () => {
    const events = [
      makeDatedEvent({ _id: "e1", title: "Friday Prayer Gathering", slug: "friday-prayer" }),
      makeDatedEvent({ _id: "e2", title: "Community Dinner", slug: "dinner" }),
    ];
    render(<UpcomingSection events={events} />);
    expect(screen.queryByText("Friday Prayer Gathering")).not.toBeInTheDocument();
    expect(screen.getByText("Community Dinner")).toBeInTheDocument();
  });

  it("filters out prayer-related programs", () => {
    const programs = [
      makeProgram({ _id: "p1", title: "Taraweeh Night", slug: "taraweeh" }),
      makeProgram({ _id: "p2", title: "Arabic School", slug: "arabic" }),
    ];
    render(<UpcomingSection programs={programs} />);
    expect(screen.queryByText("Taraweeh Night")).not.toBeInTheDocument();
    expect(screen.getByText("Arabic School")).toBeInTheDocument();
  });

  it("limits dated events to 4", () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      makeDatedEvent({ _id: `e${i}`, title: `Event ${i}`, slug: `evt-${i}`, date: `2026-05-0${i + 1}` })
    );
    render(<UpcomingSection events={events} />);
    expect(screen.getByText("Event 0")).toBeInTheDocument();
    expect(screen.getByText("Event 3")).toBeInTheDocument();
    expect(screen.queryByText("Event 4")).not.toBeInTheDocument();
  });

  it("limits weekly events to 4", () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      makeRecurringEvent({ _id: `w${i}`, title: `Weekly ${i}`, slug: `wk-${i}`, recurringDay: "monday" })
    );
    render(<UpcomingSection events={events} />);
    expect(screen.getByText("Weekly 0")).toBeInTheDocument();
    expect(screen.getByText("Weekly 3")).toBeInTheDocument();
    expect(screen.queryByText("Weekly 4")).not.toBeInTheDocument();
  });

  it("limits programs to 6", () => {
    const programs = Array.from({ length: 8 }, (_, i) =>
      makeProgram({ _id: `p${i}`, title: `Program ${i}`, slug: `prog-${i}` })
    );
    render(<UpcomingSection programs={programs} />);
    expect(screen.getByText("Program 0")).toBeInTheDocument();
    expect(screen.getByText("Program 5")).toBeInTheDocument();
    expect(screen.queryByText("Program 6")).not.toBeInTheDocument();
  });

  it("renders event card links to detail page", () => {
    render(<UpcomingSection events={[makeDatedEvent({ slug: "my-event" })]} />);
    const links = screen.getAllByRole("link");
    const eventLink = links.find((l) => l.getAttribute("href") === "/events/my-event");
    expect(eventLink).toBeDefined();
  });

  it("renders event with image", () => {
    render(
      <UpcomingSection
        events={[
          makeDatedEvent({
            image: { _type: "image", asset: { _ref: "img-ref", _type: "reference" } },
          }),
        ]}
      />
    );
    expect(screen.getByAltText("Community Iftar")).toBeInTheDocument();
  });

  it("renders event short description when available", () => {
    render(
      <UpcomingSection
        events={[makeDatedEvent({ shortDescription: "A brief summary" })]}
      />
    );
    expect(screen.getByText("A brief summary")).toBeInTheDocument();
  });

  it("renders program with external link", () => {
    render(
      <UpcomingSection
        programs={[makeProgram({ externalLink: "https://external.com" })]}
      />
    );
    const links = screen.getAllByRole("link");
    const extLink = links.find((l) => l.getAttribute("href") === "https://external.com");
    expect(extLink).toBeDefined();
  });

  it("renders View all links", () => {
    render(
      <UpcomingSection
        events={[makeDatedEvent()]}
        programs={[makeProgram()]}
      />
    );
    const viewAllLinks = screen.getAllByText("View all");
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("handles event without image gracefully", () => {
    render(<UpcomingSection events={[makeDatedEvent({ image: undefined })]} />);
    expect(screen.getByText("Community Iftar")).toBeInTheDocument();
  });

  it("renders category badge on event cards", () => {
    render(
      <UpcomingSection events={[makeDatedEvent({ categories: ["Youth"] })]} />
    );
    expect(screen.getByText("Youth")).toBeInTheDocument();
  });
});
