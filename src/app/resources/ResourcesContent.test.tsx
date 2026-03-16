import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import ResourcesContent from "./ResourcesContent";
import { SanityResource } from "@/types/sanity";

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

function makeResource(overrides: Partial<SanityResource> = {}): SanityResource {
  return {
    _id: "res-1",
    title: "Test Resource",
    slug: "test-resource",
    resourceType: "pdf",
    category: "Islamic Studies",
    ...overrides,
  };
}

describe("ResourcesContent", () => {
  it("renders the page title", () => {
    render(<ResourcesContent resources={[]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Community Resources");
  });

  it("shows empty library state when no resources", () => {
    render(<ResourcesContent resources={[]} />);
    expect(screen.getByText("No Resources Available Yet")).toBeInTheDocument();
  });

  it("renders resource cards when data is provided", () => {
    const resources = [
      makeResource({ _id: "r1", title: "Quran Guide PDF", slug: "quran-guide" }),
      makeResource({ _id: "r2", title: "Friday Lecture", slug: "friday-lecture", resourceType: "audio" }),
    ];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("Quran Guide PDF")).toBeInTheDocument();
    expect(screen.getByText("Friday Lecture")).toBeInTheDocument();
  });

  it("renders resource description and author", () => {
    const resources = [
      makeResource({
        description: "A comprehensive guide to Quran recitation",
        author: "Sheikh Ahmad",
      }),
    ];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("A comprehensive guide to Quran recitation")).toBeInTheDocument();
    expect(screen.getByText("Sheikh Ahmad")).toBeInTheDocument();
  });

  it("displays Download button for file resources", () => {
    const resources = [
      makeResource({ fileUrl: "https://example.com/file.pdf" }),
    ];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("displays View Resource button for external link resources", () => {
    const resources = [
      makeResource({ externalUrl: "https://example.com/article", fileUrl: undefined }),
    ];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("View Resource")).toBeInTheDocument();
  });

  it("displays Not Available when no URL is present", () => {
    const resources = [makeResource({ fileUrl: undefined, externalUrl: undefined })];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("Not Available")).toBeInTheDocument();
  });

  it("filters resources by search query", async () => {
    const user = userEvent.setup();
    const resources = [
      makeResource({ _id: "r1", title: "Ramadan Guide", slug: "ramadan-guide" }),
      makeResource({ _id: "r2", title: "Arabic Lessons", slug: "arabic-lessons" }),
    ];
    render(<ResourcesContent resources={resources} />);

    await user.type(screen.getByRole("textbox", { name: "Search resources" }), "Ramadan");
    expect(screen.getByText("Ramadan Guide")).toBeInTheDocument();
    expect(screen.queryByText("Arabic Lessons")).not.toBeInTheDocument();
  });

  it("filters resources by category", async () => {
    const user = userEvent.setup();
    const resources = [
      makeResource({ _id: "r1", title: "Fiqh Notes", category: "Fiqh", slug: "fiqh-notes" }),
      makeResource({ _id: "r2", title: "Quran Audio", category: "Quran", slug: "quran-audio" }),
    ];
    render(<ResourcesContent resources={resources} />);

    await user.click(screen.getByRole("button", { name: "Fiqh" }));
    expect(screen.getByText("Fiqh Notes")).toBeInTheDocument();
    expect(screen.queryByText("Quran Audio")).not.toBeInTheDocument();
  });

  it("shows no results state when filters match nothing", async () => {
    const user = userEvent.setup();
    const resources = [makeResource()];
    render(<ResourcesContent resources={resources} />);

    await user.type(screen.getByRole("textbox", { name: "Search resources" }), "nonexistent");
    expect(screen.getByText("No Resources Found")).toBeInTheDocument();
  });

  it("clears filters when Clear All Filters is clicked", async () => {
    const user = userEvent.setup();
    const resources = [makeResource({ _id: "r1", title: "My Resource", slug: "my-resource" })];
    render(<ResourcesContent resources={resources} />);

    await user.type(screen.getByRole("textbox", { name: "Search resources" }), "nonexistent");
    expect(screen.getByText("No Resources Found")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear All Filters" }));
    expect(screen.getByText("My Resource")).toBeInTheDocument();
  });

  it("displays resource count", () => {
    const resources = [
      makeResource({ _id: "r1", slug: "r1" }),
      makeResource({ _id: "r2", slug: "r2" }),
      makeResource({ _id: "r3", slug: "r3" }),
    ];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("3 resources")).toBeInTheDocument();
  });

  it("shows type filter when multiple resource types exist", () => {
    const resources = [
      makeResource({ _id: "r1", resourceType: "pdf", slug: "r1" }),
      makeResource({ _id: "r2", resourceType: "audio", slug: "r2" }),
    ];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /PDF/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Audio/ })).toBeInTheDocument();
  });

  it("filters resources by type", async () => {
    const user = userEvent.setup();
    const resources = [
      makeResource({ _id: "r1", title: "PDF Doc", resourceType: "pdf", slug: "pdf-doc" }),
      makeResource({ _id: "r2", title: "Audio Lecture", resourceType: "audio", slug: "audio-lecture" }),
    ];
    render(<ResourcesContent resources={resources} />);

    await user.click(screen.getByRole("button", { name: /Audio/ }));
    expect(screen.getByText("Audio Lecture")).toBeInTheDocument();
    expect(screen.queryByText("PDF Doc")).not.toBeInTheDocument();
  });

  it("shows language badge for non-English resources", () => {
    const resources = [
      makeResource({ language: "ar" }),
    ];
    render(<ResourcesContent resources={resources} />);
    expect(screen.getByText("Arabic")).toBeInTheDocument();
  });
});
