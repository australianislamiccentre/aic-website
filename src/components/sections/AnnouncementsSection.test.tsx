import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { AnnouncementsSection } from "./AnnouncementsSection";
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

function makeAnnouncement(overrides: Partial<SanityAnnouncement> = {}): SanityAnnouncement {
  return {
    _id: "ann-1",
    title: "Test Announcement",
    slug: "test-announcement",
    date: "2026-03-15",
    excerpt: "This is a test announcement excerpt.",
    category: "General",
    priority: "normal",
    ...overrides,
  };
}

describe("AnnouncementsSection", () => {
  it("returns null when no announcements and no urgent announcement", () => {
    const { container } = render(<AnnouncementsSection announcements={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when announcements prop is undefined and no urgent announcement", () => {
    const { container } = render(<AnnouncementsSection />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the section heading when announcements exist", () => {
    render(<AnnouncementsSection announcements={[makeAnnouncement()]} />);
    expect(screen.getByText("Announcements")).toBeInTheDocument();
    expect(screen.getByText("Latest Updates")).toBeInTheDocument();
  });

  it("renders announcement cards with title and excerpt", () => {
    const announcements = [
      makeAnnouncement({ _id: "a1", title: "Ramadan Timetable", excerpt: "Download the new timetable" }),
      makeAnnouncement({ _id: "a2", title: "Community BBQ", excerpt: "Join us this Saturday" }),
    ];
    render(<AnnouncementsSection announcements={announcements} />);
    expect(screen.getByText("Ramadan Timetable")).toBeInTheDocument();
    expect(screen.getByText("Download the new timetable")).toBeInTheDocument();
    expect(screen.getByText("Community BBQ")).toBeInTheDocument();
    expect(screen.getByText("Join us this Saturday")).toBeInTheDocument();
  });

  it("renders announcement card links to detail page", () => {
    render(
      <AnnouncementsSection
        announcements={[makeAnnouncement({ slug: "my-update" })]}
      />
    );
    const links = screen.getAllByRole("link");
    const detailLink = links.find((l) => l.getAttribute("href") === "/announcements/my-update");
    expect(detailLink).toBeDefined();
  });

  it("renders the category badge on announcement cards", () => {
    render(
      <AnnouncementsSection
        announcements={[makeAnnouncement({ category: "Education" })]}
      />
    );
    expect(screen.getByText("Education")).toBeInTheDocument();
  });

  it("limits display to 4 announcements", () => {
    const announcements = Array.from({ length: 6 }, (_, i) =>
      makeAnnouncement({ _id: `ann-${i}`, title: `Announcement ${i}`, slug: `ann-${i}` })
    );
    render(<AnnouncementsSection announcements={announcements} />);
    // Only 4 should render
    expect(screen.getByText("Announcement 0")).toBeInTheDocument();
    expect(screen.getByText("Announcement 3")).toBeInTheDocument();
    expect(screen.queryByText("Announcement 4")).not.toBeInTheDocument();
  });

  it("renders urgent banner when urgentAnnouncement is provided", () => {
    const urgent = makeAnnouncement({
      _id: "urgent-1",
      title: "Centre Closed Today",
      excerpt: "Due to maintenance",
      priority: "urgent",
      slug: "centre-closed",
    });
    render(<AnnouncementsSection announcements={[]} urgentAnnouncement={urgent} />);
    expect(screen.getByText("Centre Closed Today")).toBeInTheDocument();
    expect(screen.getByText("Due to maintenance")).toBeInTheDocument();
  });

  it("renders empty state message when only urgent banner is present", () => {
    const urgent = makeAnnouncement({
      _id: "urgent-1",
      title: "Urgent News",
      priority: "urgent",
    });
    render(<AnnouncementsSection announcements={[]} urgentAnnouncement={urgent} />);
    expect(
      screen.getByText("Check back soon for more announcements and updates.")
    ).toBeInTheDocument();
  });

  it("renders View All link to /announcements", () => {
    render(<AnnouncementsSection announcements={[makeAnnouncement()]} />);
    const viewAllLink = screen.getByText("View All").closest("a");
    expect(viewAllLink).toHaveAttribute("href", "/announcements");
  });

  it("renders announcement with image", () => {
    render(
      <AnnouncementsSection
        announcements={[
          makeAnnouncement({
            image: { _type: "image", asset: { _ref: "image-abc", _type: "reference" } },
          }),
        ]}
      />
    );
    expect(screen.getByAltText("Test Announcement")).toBeInTheDocument();
  });
});
