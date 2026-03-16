import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { ProgramsSection } from "./ProgramsSection";
import { SanityProgram } from "@/types/sanity";

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

function makeProgram(overrides: Partial<SanityProgram> = {}): SanityProgram {
  return {
    _id: "prog-1",
    title: "IQRA Academy",
    slug: "iqra-academy",
    time: "9:00 AM",
    location: "Education Centre",
    categories: ["Education"],
    description: "Quran and Islamic studies for children.",
    eventType: "recurring",
    recurringDay: "Saturdays",
    ...overrides,
  };
}

describe("ProgramsSection", () => {
  it("renders empty state placeholder when no programs", () => {
    render(<ProgramsSection programs={[]} />);
    expect(screen.getByText("Get Notified")).toBeInTheDocument();
    expect(
      screen.getByText(/preparing exciting new programs/)
    ).toBeInTheDocument();
  });

  it("renders the section heading with programs", () => {
    render(<ProgramsSection programs={[makeProgram()]} />);
    expect(screen.getByText("Programs")).toBeInTheDocument();
    expect(screen.getByText("Education & Youth")).toBeInTheDocument();
  });

  it("renders program titles in the list", () => {
    const programs = [
      makeProgram({ _id: "p1", title: "Arabic School" }),
      makeProgram({ _id: "p2", title: "Youth Club" }),
    ];
    render(<ProgramsSection programs={programs} />);
    // First program appears in both list and detail, so use getAllByText
    expect(screen.getAllByText("Arabic School").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Youth Club").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the first program detail card by default", () => {
    render(
      <ProgramsSection
        programs={[
          makeProgram({
            title: "Quran Memorization",
            description: "Hifz program for all ages",
          }),
        ]}
      />
    );
    // Title appears in both list and detail card
    const titles = screen.getAllByText("Quran Memorization");
    expect(titles.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Hifz program for all ages")).toBeInTheDocument();
  });

  it("shows schedule information", () => {
    render(
      <ProgramsSection
        programs={[makeProgram({ recurringDay: "Sundays", time: "10:00 AM" })]}
      />
    );
    const schedules = screen.getAllByText(/Sundays 10:00 AM/);
    expect(schedules.length).toBeGreaterThan(0);
  });

  it("switches active program when clicking a different item", async () => {
    const user = userEvent.setup();
    const programs = [
      makeProgram({ _id: "p1", title: "Program A", description: "Description A" }),
      makeProgram({ _id: "p2", title: "Program B", description: "Description B" }),
    ];
    render(<ProgramsSection programs={programs} />);

    // Initially Program A detail is shown
    expect(screen.getByText("Description A")).toBeInTheDocument();

    // Click on Program B in the list
    const buttons = screen.getAllByRole("button");
    const programBButton = buttons.find((btn) => btn.textContent?.includes("Program B"));
    if (programBButton) {
      await user.click(programBButton);
    }

    expect(screen.getByText("Description B")).toBeInTheDocument();
  });

  it("limits display to 5 programs", () => {
    const programs = Array.from({ length: 7 }, (_, i) =>
      makeProgram({ _id: `p${i}`, title: `Program ${i}`, slug: `prog-${i}` })
    );
    render(<ProgramsSection programs={programs} />);
    // Program 0 appears in both list and detail card
    expect(screen.getAllByText("Program 0").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Program 4").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Program 5")).not.toBeInTheDocument();
  });

  it("renders features when available on active program", () => {
    render(
      <ProgramsSection
        programs={[
          makeProgram({
            features: ["Small class sizes", "Qualified teachers", "Free materials"],
          }),
        ]}
      />
    );
    expect(screen.getByText("Small class sizes")).toBeInTheDocument();
    expect(screen.getByText("Qualified teachers")).toBeInTheDocument();
    expect(screen.getByText("Free materials")).toBeInTheDocument();
  });

  it("renders View all programs link", () => {
    render(<ProgramsSection programs={[makeProgram()]} />);
    const link = screen.getByText("View all programs").closest("a");
    expect(link).toHaveAttribute("href", "/events");
  });

  it("renders Learn More link for program without external link", () => {
    render(
      <ProgramsSection
        programs={[makeProgram({ externalLink: undefined, slug: "iqra" })]}
      />
    );
    const link = screen.getByText("Learn More").closest("a");
    expect(link).toHaveAttribute("href", "/events/iqra");
  });

  it("renders Visit link for program with external link", () => {
    render(
      <ProgramsSection
        programs={[makeProgram({ externalLink: "https://external.com" })]}
      />
    );
    const link = screen.getByText("Visit").closest("a");
    expect(link).toHaveAttribute("href", "https://external.com");
  });

  it("uses shortDescription over full description when available", () => {
    render(
      <ProgramsSection
        programs={[
          makeProgram({
            shortDescription: "Short desc",
            description: "Full long description",
          }),
        ]}
      />
    );
    expect(screen.getByText("Short desc")).toBeInTheDocument();
  });

  it("shows 'Contact for schedule' when no recurringDay", () => {
    render(
      <ProgramsSection
        programs={[makeProgram({ recurringDay: undefined })]}
      />
    );
    const schedules = screen.getAllByText("Contact for schedule");
    expect(schedules.length).toBeGreaterThan(0);
  });
});
