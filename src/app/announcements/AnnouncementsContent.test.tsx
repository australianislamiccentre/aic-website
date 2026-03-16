import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import AnnouncementsContent from "./AnnouncementsContent";
import { SanityAnnouncement } from "@/types/sanity";

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

function makeAnnouncement(overrides: Partial<SanityAnnouncement> = {}): SanityAnnouncement {
  return {
    _id: "ann-1",
    title: "Test Announcement",
    slug: "test-announcement",
    date: "2026-03-15",
    excerpt: "This is a test announcement excerpt",
    category: "General",
    priority: "normal",
    ...overrides,
  };
}

describe("AnnouncementsContent", () => {
  it("renders the page title", () => {
    render(<AnnouncementsContent announcements={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("News & Announcements");
  });

  it("renders announcement cards when data is provided", () => {
    const announcements = [
      makeAnnouncement({ _id: "a1", title: "First Update", slug: "first-update" }),
      makeAnnouncement({ _id: "a2", title: "Second Update", slug: "second-update" }),
    ];
    render(<AnnouncementsContent announcements={announcements} />);
    expect(screen.getByText("First Update")).toBeInTheDocument();
    expect(screen.getByText("Second Update")).toBeInTheDocument();
  });

  it("shows empty state when no announcements", () => {
    render(<AnnouncementsContent announcements={[]} />);
    expect(screen.getByText("No Announcements Found")).toBeInTheDocument();
    expect(screen.getByText("Check back soon for updates and community news.")).toBeInTheDocument();
  });

  it("shows empty state with filter hint when filters are active but no results", async () => {
    const user = userEvent.setup();
    const announcements = [makeAnnouncement({ category: "Prayer" })];
    render(<AnnouncementsContent announcements={announcements} />);

    // Filter by Education category (no results)
    await user.click(screen.getByRole("button", { name: "Education" }));
    expect(screen.getByText("No Announcements Found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search or filter to find what you're looking for.")).toBeInTheDocument();
  });

  it("filters announcements by category", async () => {
    const user = userEvent.setup();
    const announcements = [
      makeAnnouncement({ _id: "a1", title: "Prayer News", category: "Prayer", slug: "prayer-news" }),
      makeAnnouncement({ _id: "a2", title: "General News", category: "General", slug: "general-news" }),
    ];
    render(<AnnouncementsContent announcements={announcements} />);

    await user.click(screen.getByRole("button", { name: "Prayer" }));
    expect(screen.getByText("Prayer News")).toBeInTheDocument();
    expect(screen.queryByText("General News")).not.toBeInTheDocument();
  });

  it("filters announcements by search query", async () => {
    const user = userEvent.setup();
    const announcements = [
      makeAnnouncement({ _id: "a1", title: "Ramadan Timetable", slug: "ramadan-timetable" }),
      makeAnnouncement({ _id: "a2", title: "Community BBQ", slug: "community-bbq" }),
    ];
    render(<AnnouncementsContent announcements={announcements} />);

    await user.type(screen.getByPlaceholderText("Search announcements..."), "Ramadan");
    expect(screen.getByText("Ramadan Timetable")).toBeInTheDocument();
    expect(screen.queryByText("Community BBQ")).not.toBeInTheDocument();
  });

  it("renders urgent announcements in the urgent banner", () => {
    const announcements = [
      makeAnnouncement({
        _id: "urgent-1",
        title: "Urgent Alert",
        slug: "urgent-alert",
        priority: "urgent",
        excerpt: "This is urgent",
      }),
    ];
    render(<AnnouncementsContent announcements={announcements} />);
    // Urgent announcements appear in the banner section
    expect(screen.getByText("Urgent Alert")).toBeInTheDocument();
  });

  it("displays the announcement count in the hero", () => {
    const announcements = [
      makeAnnouncement({ _id: "a1", slug: "a1" }),
      makeAnnouncement({ _id: "a2", slug: "a2" }),
      makeAnnouncement({ _id: "a3", slug: "a3" }),
    ];
    render(<AnnouncementsContent announcements={announcements} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows results summary when a filter is active", async () => {
    const user = userEvent.setup();
    const announcements = [
      makeAnnouncement({ _id: "a1", title: "News One", category: "General", slug: "news-one" }),
    ];
    render(<AnnouncementsContent announcements={announcements} />);

    await user.click(screen.getByRole("button", { name: "General" }));
    expect(screen.getByText("result")).toBeInTheDocument();
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("clears all filters when Clear all is clicked", async () => {
    const user = userEvent.setup();
    const announcements = [
      makeAnnouncement({ _id: "a1", title: "Prayer News", category: "Prayer", slug: "prayer" }),
      makeAnnouncement({ _id: "a2", title: "General News", category: "General", slug: "general" }),
    ];
    render(<AnnouncementsContent announcements={announcements} />);

    await user.click(screen.getByRole("button", { name: "Prayer" }));
    expect(screen.queryByText("General News")).not.toBeInTheDocument();

    await user.click(screen.getByText("Clear all"));
    expect(screen.getByText("Prayer News")).toBeInTheDocument();
    expect(screen.getByText("General News")).toBeInTheDocument();
  });
});
