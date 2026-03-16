import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { MeetImamsSection } from "./MeetImamsSection";
import { SanityTeamMember } from "@/types/sanity";

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

function makeImam(overrides: Partial<SanityTeamMember> = {}): SanityTeamMember {
  return {
    _id: "imam-1",
    name: "Sheikh Ahmad",
    slug: "sheikh-ahmad",
    role: "Head Imam",
    category: "imam",
    ...overrides,
  };
}

describe("MeetImamsSection", () => {
  it("returns null when imams array is empty", () => {
    const { container } = render(<MeetImamsSection imams={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the section heading", () => {
    render(<MeetImamsSection imams={[makeImam()]} />);
    expect(screen.getByText("Imams")).toBeInTheDocument();
    expect(screen.getByText("Spiritual Guidance")).toBeInTheDocument();
  });

  it("renders imam name and role", () => {
    render(<MeetImamsSection imams={[makeImam({ name: "Imam Ali", role: "Senior Imam" })]} />);
    // Both mobile and desktop cards render, so use getAllByText
    const names = screen.getAllByText("Imam Ali");
    expect(names.length).toBeGreaterThan(0);
    const roles = screen.getAllByText("Senior Imam");
    expect(roles.length).toBeGreaterThan(0);
  });

  it("renders imam image when available", () => {
    render(
      <MeetImamsSection
        imams={[
          makeImam({
            image: { _type: "image", asset: { _ref: "img-ref", _type: "reference" } },
          }),
        ]}
      />
    );
    const images = screen.getAllByAltText("Sheikh Ahmad");
    expect(images.length).toBeGreaterThan(0);
  });

  it("renders specializations when available", () => {
    render(
      <MeetImamsSection
        imams={[makeImam({ specializations: ["Quran Recitation", "Islamic Jurisprudence"] })]}
      />
    );
    const specs = screen.getAllByText("Quran Recitation");
    expect(specs.length).toBeGreaterThan(0);
  });

  it("renders shortBio when available (desktop card)", () => {
    render(
      <MeetImamsSection
        imams={[makeImam({ shortBio: "Experienced scholar and community leader." })]}
      />
    );
    expect(screen.getByText("Experienced scholar and community leader.")).toBeInTheDocument();
  });

  it("limits display to 3 imams", () => {
    const imams = Array.from({ length: 5 }, (_, i) =>
      makeImam({ _id: `imam-${i}`, name: `Imam ${i}`, slug: `imam-${i}` })
    );
    render(<MeetImamsSection imams={imams} />);
    // Desktop cards: 3 should render
    const desktopNames = screen.getAllByText(/^Imam \d$/);
    // There will be both mobile + desktop cards, but max 3 unique imams
    const uniqueNames = new Set(desktopNames.map((el) => el.textContent));
    expect(uniqueNames.size).toBe(3);
  });

  it("renders View All link to /imams", () => {
    render(<MeetImamsSection imams={[makeImam()]} />);
    const links = screen.getAllByRole("link");
    const viewAllLink = links.find((l) => l.getAttribute("href") === "/imams");
    expect(viewAllLink).toBeDefined();
  });

  it("handles imam without image gracefully", () => {
    render(<MeetImamsSection imams={[makeImam({ image: undefined })]} />);
    // Should still render the name without crashing
    const names = screen.getAllByText("Sheikh Ahmad");
    expect(names.length).toBeGreaterThan(0);
  });

  it("handles imam without specializations gracefully", () => {
    render(<MeetImamsSection imams={[makeImam({ specializations: undefined })]} />);
    const names = screen.getAllByText("Sheikh Ahmad");
    expect(names.length).toBeGreaterThan(0);
  });
});
