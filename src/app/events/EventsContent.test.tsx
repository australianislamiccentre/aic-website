import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import EventsContent from "./EventsContent";
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
    h3: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className={className} {...props}>{children}</h3>
    ),
    p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => 0 }),
  useMotionValueEvent: () => {},
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

// Mock Breadcrumb
vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
  Breadcrumb: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
}));

function makeEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "evt-1",
    title: "Test Event",
    slug: "test-event",
    description: "A test event description",
    shortDescription: "Short desc",
    categories: ["Community"],
    date: "2026-04-01",
    time: "10:00 AM",
    location: "Main Hall",
    eventType: "single",
    displayAs: "event",
    ...overrides,
  };
}

describe("EventsContent", () => {
  it("renders the page title", () => {
    render(<EventsContent events={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Events & Programs");
  });

  it("renders event cards when data is provided", () => {
    const events = [
      makeEvent({ _id: "e1", title: "Quran Class", slug: "quran-class" }),
      makeEvent({ _id: "e2", title: "Sports Day", slug: "sports-day" }),
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByText("Quran Class")).toBeInTheDocument();
    expect(screen.getByText("Sports Day")).toBeInTheDocument();
  });

  it("shows empty state when no events", () => {
    render(<EventsContent events={[]} />);
    expect(screen.getByText("No Events Found")).toBeInTheDocument();
  });

  it("shows Upcoming Events heading for single/multi events", () => {
    const events = [makeEvent({ eventType: "single" })];
    render(<EventsContent events={events} />);
    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
  });

  it("shows Weekly Programs heading for items flagged displayAs program", () => {
    const events = [
      makeEvent({ _id: "r1", title: "Weekly Halaqa", eventType: "recurring", displayAs: "program", recurringDay: "Wednesdays", slug: "weekly-halaqa" }),
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByRole("heading", { name: "Weekly Programs" })).toBeInTheDocument();
    expect(screen.getByText("Weekly Halaqa")).toBeInTheDocument();
  });

  it("separates items by displayAs flag into Upcoming Events and Weekly Programs", () => {
    const events = [
      makeEvent({ _id: "e1", title: "One-off Event", eventType: "single", displayAs: "event", slug: "one-off" }),
      makeEvent({ _id: "r1", title: "Recurring Class", eventType: "recurring", displayAs: "program", recurringDay: "Tuesdays", slug: "recurring-class" }),
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Weekly Programs" })).toBeInTheDocument();
    expect(screen.getByText("One-off Event")).toBeInTheDocument();
    expect(screen.getByText("Recurring Class")).toBeInTheDocument();
  });

  it("routes a recurring event flagged displayAs:event into Upcoming Events", () => {
    // Section split is by displayAs, not eventType. A recurring item
    // explicitly flagged "event" lands in Upcoming Events even though
    // it has a recurringDay.
    const events = [
      makeEvent({
        _id: "anchored",
        title: "Anchored - Brothers Nights",
        slug: "anchored",
        eventType: "recurring",
        displayAs: "event",
        recurringDay: "Fridays",
        date: undefined,
      }),
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByRole("heading", { name: "Upcoming Events" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Weekly Programs" })).not.toBeInTheDocument();
    expect(screen.getByText("Anchored - Brothers Nights")).toBeInTheDocument();
  });

  it("filters events by category", async () => {
    const user = userEvent.setup();
    const events = [
      makeEvent({ _id: "e1", title: "Youth Camp", categories: ["Youth"], slug: "youth-camp" }),
      makeEvent({ _id: "e2", title: "Sisters Circle", categories: ["Women"], slug: "sisters-circle" }),
    ];
    render(<EventsContent events={events} />);

    await user.click(screen.getByRole("button", { name: "Youth" }));
    expect(screen.getByText("Youth Camp")).toBeInTheDocument();
    expect(screen.queryByText("Sisters Circle")).not.toBeInTheDocument();
  });

  it("filters events by search query", async () => {
    const user = userEvent.setup();
    const events = [
      makeEvent({ _id: "e1", title: "Quran Memorisation", slug: "quran-memorisation" }),
      makeEvent({ _id: "e2", title: "Basketball Night", slug: "basketball-night" }),
    ];
    render(<EventsContent events={events} />);

    await user.type(screen.getByPlaceholderText("Search by name, description..."), "Quran");
    expect(screen.getByText("Quran Memorisation")).toBeInTheDocument();
    expect(screen.queryByText("Basketball Night")).not.toBeInTheDocument();
  });

  it("shows empty state when filters match nothing", async () => {
    const user = userEvent.setup();
    const events = [makeEvent({ categories: ["Community"] })];
    render(<EventsContent events={events} />);

    await user.click(screen.getByRole("button", { name: "Sports" }));
    expect(screen.getByText("No Events Found")).toBeInTheDocument();
  });

  it("clears all filters when Clear Filters button is clicked", async () => {
    const user = userEvent.setup();
    const events = [
      makeEvent({ _id: "e1", title: "Event A", categories: ["Community"], slug: "event-a" }),
    ];
    render(<EventsContent events={events} />);

    await user.click(screen.getByRole("button", { name: "Sports" }));
    expect(screen.getByText("No Events Found")).toBeInTheDocument();

    await user.click(screen.getByText("Clear Filters"));
    expect(screen.getByText("Event A")).toBeInTheDocument();
  });

  it("displays event count in the hero stats", () => {
    const events = [
      makeEvent({ _id: "e1", slug: "e1" }),
      makeEvent({ _id: "e2", slug: "e2" }),
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows registration badge for events with registrationUrl", () => {
    const events = [
      makeEvent({ registrationUrl: "https://example.com/register" }),
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByText("Registration Required")).toBeInTheDocument();
  });

  it("displays event location", () => {
    const events = [makeEvent({ location: "Community Hall", locationDetails: "Building B, Room 3" })];
    render(<EventsContent events={events} />);
    expect(screen.getByText("Building B, Room 3")).toBeInTheDocument();
  });

  it("renders 'program'-flagged recurring items in the Weekly Programs section", () => {
    // Once eventsQuery dropped the displayAs gate, a doc flagged
    // displayAs: "program" reaches EventsContent and should land in
    // Weekly Programs alongside other recurring items.
    const events = [
      makeEvent({
        _id: "evt-program-only",
        title: "Tuesday Tafsir Series",
        slug: "tafsir-series",
        eventType: "recurring",
        displayAs: "program",
        recurringDay: "Tuesdays",
        date: undefined,
      }),
    ];

    render(<EventsContent events={events} />);

    expect(screen.getByRole("heading", { name: "Weekly Programs" })).toBeInTheDocument();
    expect(screen.getByText("Tuesday Tafsir Series")).toBeInTheDocument();
  });

  it("renders a 'both'-flagged item in BOTH Upcoming Events and Weekly Programs", () => {
    // displayAs: "both" means show as a Program AND an Event across the
    // site, so it appears in both sections on the events page.
    const events = [
      makeEvent({
        _id: "evt-single",
        title: "Eid Dinner",
        slug: "eid-dinner",
        eventType: "single",
        displayAs: "event",
        date: "2026-05-20",
      }),
      makeEvent({
        _id: "evt-both-recurring",
        title: "Weekly Open House",
        slug: "open-house",
        eventType: "recurring",
        displayAs: "both",
        recurringDay: "Saturdays",
        date: undefined,
      }),
    ];

    render(<EventsContent events={events} />);

    expect(screen.getByText("Eid Dinner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upcoming Events" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Weekly Programs" })).toBeInTheDocument();

    // "both" item appears once per section — twice in total
    expect(screen.getAllByText("Weekly Open House")).toHaveLength(2);
  });

  it("falls back to eventType routing when displayAs is missing (legacy data)", () => {
    const events = [
      makeEvent({
        _id: "legacy-single",
        title: "Legacy One-off",
        slug: "legacy-single",
        eventType: "single",
        displayAs: undefined,
      }),
      makeEvent({
        _id: "legacy-recurring",
        title: "Legacy Class",
        slug: "legacy-recurring",
        eventType: "recurring",
        recurringDay: "Tuesdays",
        displayAs: undefined,
        date: undefined,
      }),
    ];

    render(<EventsContent events={events} />);

    expect(screen.getByRole("heading", { name: "Upcoming Events" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Weekly Programs" })).toBeInTheDocument();
    expect(screen.getByText("Legacy One-off")).toBeInTheDocument();
    expect(screen.getByText("Legacy Class")).toBeInTheDocument();
  });

  it("hides Weekly Programs section when no recurring items present", () => {
    const events = [
      makeEvent({
        _id: "evt-single",
        title: "Eid Dinner",
        slug: "eid-dinner",
        eventType: "single",
        displayAs: "event",
      }),
    ];

    render(<EventsContent events={events} />);

    // Section heading should not appear when there are no recurring items
    expect(screen.queryByRole("heading", { name: "Weekly Programs" })).not.toBeInTheDocument();
  });
});
