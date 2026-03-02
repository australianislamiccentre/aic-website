import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { LatestUpdatesSection } from "./LatestUpdatesSection";
import { LatestUpdateItem } from "@/sanity/lib/fetch";
import { SanityAnnouncement } from "@/types/sanity";

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

// Mock formatDate to return a predictable string
vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return {
    ...actual,
    formatDate: () => "1 March 2026",
  };
});

// Mock Button to render as a simple anchor
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, href, ...props }: { children: React.ReactNode; href?: string; [key: string]: unknown }) =>
    href ? <a href={href} {...props}>{children}</a> : <button {...props}>{children}</button>,
}));

function makeAnnouncement(overrides: Partial<LatestUpdateItem> = {}): LatestUpdateItem {
  return {
    _id: "ann-1",
    _type: "announcement",
    title: "Test Announcement",
    slug: "test-announcement",
    description: "A test announcement description",
    date: "2026-03-01",
    ...overrides,
  };
}

function makeUrgent(overrides: Partial<SanityAnnouncement> = {}): SanityAnnouncement {
  return {
    _id: "urgent-1",
    title: "Urgent Notice",
    slug: "urgent-notice",
    excerpt: "This is an urgent announcement",
    date: "2026-03-01",
    category: "general",
    priority: "urgent",
    ...overrides,
  };
}

describe("LatestUpdatesSection", () => {
  it("renders nothing when no announcements and no urgent announcement", () => {
    const { container } = render(<LatestUpdatesSection />);
    expect(container.innerHTML).toBe("");
  });

  it("renders section when announcements provided", () => {
    const announcements = [makeAnnouncement()];

    render(<LatestUpdatesSection announcements={announcements} />);
    expect(screen.getByText("Latest")).toBeInTheDocument();
    // "Announcements" appears in both the badge and the heading
    expect(screen.getAllByText("Announcements").length).toBeGreaterThanOrEqual(1);
  });

  it("renders section when only urgentAnnouncement provided (no announcements)", () => {
    render(<LatestUpdatesSection urgentAnnouncement={makeUrgent()} />);
    expect(screen.getByText("Latest")).toBeInTheDocument();
  });

  it("renders urgent banner with title and excerpt", () => {
    const urgent = makeUrgent({
      title: "Mosque Closure",
      excerpt: "The mosque will be closed for maintenance",
    });

    render(<LatestUpdatesSection urgentAnnouncement={urgent} />);
    expect(screen.getByText("Mosque Closure")).toBeInTheDocument();
    expect(screen.getByText("The mosque will be closed for maintenance")).toBeInTheDocument();
  });

  it("renders announcement card titles", () => {
    const announcements = [
      makeAnnouncement({ _id: "ann-1", title: "Ramadan Schedule", slug: "ramadan" }),
      makeAnnouncement({ _id: "ann-2", title: "Eid Celebration", slug: "eid" }),
    ];

    render(<LatestUpdatesSection announcements={announcements} />);
    expect(screen.getByText("Ramadan Schedule")).toBeInTheDocument();
    expect(screen.getByText("Eid Celebration")).toBeInTheDocument();
  });

  it("shows max 6 announcements", () => {
    const announcements = Array.from({ length: 8 }, (_, i) =>
      makeAnnouncement({ _id: `ann-${i}`, title: `Announcement ${i + 1}`, slug: `ann-${i}` })
    );

    render(<LatestUpdatesSection announcements={announcements} />);
    expect(screen.getByText("Announcement 1")).toBeInTheDocument();
    expect(screen.getByText("Announcement 6")).toBeInTheDocument();
    expect(screen.queryByText("Announcement 7")).not.toBeInTheDocument();
    expect(screen.queryByText("Announcement 8")).not.toBeInTheDocument();
  });

  it("shows empty state message when only urgent announcement and no announcements", () => {
    render(<LatestUpdatesSection announcements={[]} urgentAnnouncement={makeUrgent()} />);
    expect(screen.getByText(/No announcements right now/)).toBeInTheDocument();
  });

  it("links to /announcements page", () => {
    const announcements = [makeAnnouncement()];

    render(<LatestUpdatesSection announcements={announcements} />);
    const viewAllLink = screen.getByText("View All");
    expect(viewAllLink.closest("a")).toHaveAttribute("href", "/announcements");
  });
});
