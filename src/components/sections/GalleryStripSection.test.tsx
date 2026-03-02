import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { GalleryStripSection } from "./GalleryStripSection";
import { SanityGalleryImage } from "@/types/sanity";

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockUrlFor = vi.fn((_source?: unknown) => ({
  width: () => ({
    height: () => ({
      url: () => "https://example.com/image.jpg",
    }),
  }),
}));

vi.mock("@/sanity/lib/image", () => ({
  urlFor: (source: unknown) => mockUrlFor(source),
}));

function makeImage(overrides: Partial<SanityGalleryImage> = {}): SanityGalleryImage {
  return {
    _id: `img-${Math.random().toString(36).slice(2, 8)}`,
    image: { _type: "image", asset: { _ref: "image-abc-200x200-jpg", _type: "reference" } },
    alt: "Test image",
    ...overrides,
  };
}

describe("GalleryStripSection", () => {
  it("renders nothing when images array is empty", () => {
    const { container } = render(<GalleryStripSection images={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the section heading when images provided", () => {
    render(<GalleryStripSection images={[makeImage()]} />);
    expect(screen.getByText("Life at AIC")).toBeInTheDocument();
  });

  it("renders up to 6 images", () => {
    const images = Array.from({ length: 8 }, (_, i) =>
      makeImage({ _id: `img-${i}`, alt: `Gallery image ${i}` })
    );

    render(<GalleryStripSection images={images} />);

    const rendered = screen.getAllByRole("img");
    expect(rendered).toHaveLength(6);
  });

  it("shows image alt text", () => {
    render(
      <GalleryStripSection images={[makeImage({ alt: "Community event photo" })]} />
    );
    expect(screen.getByAltText("Community event photo")).toBeInTheDocument();
  });

  it("shows caption when provided", () => {
    render(
      <GalleryStripSection
        images={[makeImage({ caption: "Eid celebration 2025" })]}
      />
    );
    expect(screen.getByText("Eid celebration 2025")).toBeInTheDocument();
  });

  it("links to /media gallery page", () => {
    render(<GalleryStripSection images={[makeImage()]} />);

    const links = screen.getAllByRole("link");
    const mediaLinks = links.filter(
      (link) => link.getAttribute("href") === "/media"
    );
    expect(mediaLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("handles images with missing image source gracefully", () => {
    mockUrlFor.mockImplementationOnce(() => {
      throw new Error("Invalid image source");
    });

    const images = [
      makeImage({ _id: "bad-img", alt: "Bad image" }),
      makeImage({ _id: "good-img", alt: "Good image" }),
    ];

    render(<GalleryStripSection images={images} />);

    // The bad image should be skipped, but the section still renders
    expect(screen.getByText("Life at AIC")).toBeInTheDocument();
    expect(screen.queryByAltText("Bad image")).not.toBeInTheDocument();
    expect(screen.getByAltText("Good image")).toBeInTheDocument();
  });
});
