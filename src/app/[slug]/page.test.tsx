import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { getPageContent, getPageContentBySlug } from "@/sanity/lib/fetch";
import { SanityPageContent } from "@/types/sanity";
import DynamicPage, { generateStaticParams, generateMetadata } from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/test-page",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock @portabletext/react
vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// Mock Sanity image helper
vi.mock("@/sanity/lib/image", () => ({
  urlFor: () => ({
    width: () => ({
      height: () => ({
        url: () => "https://cdn.sanity.io/images/test.jpg",
      }),
    }),
  }),
  urlForImage: () => ({
    width: () => ({
      height: () => ({
        url: () => "https://cdn.sanity.io/images/test.jpg",
      }),
    }),
  }),
}));

const mockPage: SanityPageContent = {
  _id: "page-1",
  title: "Test Page",
  slug: "test-page",
  subtitle: "A test subtitle",
  introduction: "This is a test introduction.",
  active: true,
  content: [
    {
      _type: "block",
      _key: "block-1",
      children: [{ _type: "span", _key: "span-1", text: "Main content text" }],
      markDefs: [],
      style: "normal" as const,
    },
  ],
  sections: [
    {
      title: "Section One",
      content: [
        {
          _type: "block",
          _key: "sec-block-1",
          children: [{ _type: "span", _key: "sec-span-1", text: "Section content" }],
          markDefs: [],
          style: "normal" as const,
        },
      ],
      imagePosition: "right" as const,
    },
  ],
  heroImage: { _type: "image", asset: { _ref: "image-abc-123", _type: "reference" } },
  gallery: [
    {
      _type: "image",
      asset: { _ref: "image-gallery-1", _type: "reference" },
      alt: "Gallery image one",
      caption: "A beautiful photo",
    },
  ],
  seo: {
    metaTitle: "Test SEO Title",
    metaDescription: "Test SEO description",
  },
};

describe("DynamicPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateStaticParams", () => {
    it("returns slug params for all active pages", async () => {
      vi.mocked(getPageContent).mockResolvedValueOnce([
        { ...mockPage, slug: "about-us" },
        { ...mockPage, slug: "history" },
      ]);
      const params = await generateStaticParams();
      expect(params).toEqual([{ slug: "about-us" }, { slug: "history" }]);
    });

    it("returns empty array when no pages exist", async () => {
      vi.mocked(getPageContent).mockResolvedValueOnce([]);
      const params = await generateStaticParams();
      expect(params).toEqual([]);
    });
  });

  describe("generateMetadata", () => {
    it("returns SEO metadata when page has seo fields", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(mockPage);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "test-page" }),
      });
      expect(metadata.title).toBe("Test SEO Title | Australian Islamic Centre");
      expect(metadata.description).toBe("Test SEO description");
    });

    it("falls back to page title when no SEO fields", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce({
        ...mockPage,
        seo: undefined,
      });
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "test-page" }),
      });
      expect(metadata.title).toBe("Test Page | Australian Islamic Centre");
      expect(metadata.description).toBe("This is a test introduction.");
    });

    it("returns not-found metadata when page is missing", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(null);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "nonexistent" }),
      });
      expect(metadata.title).toBe("Page Not Found");
    });
  });

  describe("rendering", () => {
    it("renders page title and subtitle", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(mockPage);
      const Page = await DynamicPage({
        params: Promise.resolve({ slug: "test-page" }),
      });
      render(Page);
      expect(screen.getByText("Test Page")).toBeInTheDocument();
      expect(screen.getByText("A test subtitle")).toBeInTheDocument();
    });

    it("renders introduction text", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(mockPage);
      const Page = await DynamicPage({
        params: Promise.resolve({ slug: "test-page" }),
      });
      render(Page);
      expect(
        screen.getByText("This is a test introduction.")
      ).toBeInTheDocument();
    });

    it("renders hero image when present", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(mockPage);
      const Page = await DynamicPage({
        params: Promise.resolve({ slug: "test-page" }),
      });
      render(Page);
      const heroImg = screen.getByAltText("Test Page");
      expect(heroImg).toBeInTheDocument();
    });

    it("renders content sections", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(mockPage);
      const Page = await DynamicPage({
        params: Promise.resolve({ slug: "test-page" }),
      });
      render(Page);
      expect(screen.getByText("Section One")).toBeInTheDocument();
    });

    it("renders gallery with captions", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(mockPage);
      const Page = await DynamicPage({
        params: Promise.resolve({ slug: "test-page" }),
      });
      render(Page);
      expect(screen.getByText("Gallery")).toBeInTheDocument();
      expect(screen.getByText("A beautiful photo")).toBeInTheDocument();
    });

    it("renders back to home button", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(mockPage);
      const Page = await DynamicPage({
        params: Promise.resolve({ slug: "test-page" }),
      });
      render(Page);
      expect(
        screen.getByRole("link", { name: /Back to Home/i })
      ).toHaveAttribute("href", "/");
    });

    it("calls notFound for inactive pages", async () => {
      const { notFound } = await import("next/navigation");
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce({
        ...mockPage,
        active: false,
      });
      try {
        const Page = await DynamicPage({
          params: Promise.resolve({ slug: "test-page" }),
        });
        render(Page);
      } catch {
        // notFound may throw
      }
      expect(notFound).toHaveBeenCalled();
    });

    it("calls notFound when page does not exist", async () => {
      const { notFound } = await import("next/navigation");
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce(null);
      try {
        const Page = await DynamicPage({
          params: Promise.resolve({ slug: "nonexistent" }),
        });
        render(Page);
      } catch {
        // notFound may throw
      }
      expect(notFound).toHaveBeenCalled();
    });

    it("handles page with no optional content", async () => {
      vi.mocked(getPageContentBySlug).mockResolvedValueOnce({
        _id: "page-2",
        title: "Minimal Page",
        slug: "minimal",
        active: true,
      });
      const Page = await DynamicPage({
        params: Promise.resolve({ slug: "minimal" }),
      });
      render(Page);
      expect(screen.getByText("Minimal Page")).toBeInTheDocument();
      expect(screen.queryByText("Gallery")).not.toBeInTheDocument();
    });
  });
});
