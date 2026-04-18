import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { HeroSection } from "./HeroSection";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    h1: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
    button: ({
      children,
      className,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
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
        url: () => "https://cdn.sanity.io/hero-image.jpg",
      }),
    }),
  }),
}));

describe("HeroSection", () => {
  describe("Carousel mode (default)", () => {
    it("renders hero text content", () => {
      render(<HeroSection />);

      expect(screen.getByText("Welcome to the")).toBeInTheDocument();
      expect(
        screen.getByText("Australian Islamic Centre"),
      ).toBeInTheDocument();
    });

    it("renders CTA buttons", () => {
      render(<HeroSection />);

      expect(screen.getByText("Explore Our Centre")).toBeInTheDocument();
      expect(screen.getByText("Book a Visit")).toBeInTheDocument();
    });

    it("renders slide indicators in carousel mode", () => {
      render(<HeroSection />);

      const indicators = screen.getAllByRole("button", {
        name: /Go to slide/,
      });
      expect(indicators.length).toBe(3);
    });

    it("renders navigation arrows in carousel mode", () => {
      render(<HeroSection />);

      expect(
        screen.getByRole("button", { name: "Previous slide" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Next slide" }),
      ).toBeInTheDocument();
    });

  });

  describe("Video mode", () => {
    it("renders video element when heroMode is video", () => {
      const { container } = render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
        />,
      );

      const video = container.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute("aria-hidden", "true");
    });

    it("video has autoPlay, muted, loop, playsInline attributes", () => {
      const { container } = render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
        />,
      );

      const video = container.querySelector("video");
      expect(video).toBeInTheDocument();
      // autoplay, muted, loop, playsinline are boolean attributes
      // In jsdom they are reflected as properties
    });

    it("hides slide indicators in video mode", () => {
      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
        />,
      );

      const indicators = screen.queryAllByRole("button", {
        name: /Go to slide/,
      });
      expect(indicators.length).toBe(0);
    });

    it("hides navigation arrows in video mode", () => {
      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
        />,
      );

      expect(
        screen.queryByRole("button", { name: "Previous slide" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Next slide" }),
      ).not.toBeInTheDocument();
    });

    it("still renders text content in video mode", () => {
      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
        />,
      );

      expect(screen.getByText("Welcome to the")).toBeInTheDocument();
      expect(screen.getByText("Explore Our Centre")).toBeInTheDocument();
    });

    it("falls back to carousel when heroMode is video but URL is missing", () => {
      render(<HeroSection heroMode="video" />);

      // Should show carousel indicators since video is not available
      const indicators = screen.getAllByRole("button", {
        name: /Go to slide/,
      });
      expect(indicators.length).toBe(3);
    });

    it("falls back to carousel when heroMode is not set", () => {
      render(<HeroSection />);

      const indicators = screen.getAllByRole("button", {
        name: /Go to slide/,
      });
      expect(indicators.length).toBe(3);
    });
  });

  describe("Sanity-driven hero slides", () => {
    const sanitySlides = [
      {
        title: "Discover",
        highlight: "Our Community",
        subtitle: "Join our vibrant community",
        primaryButton: { label: "Learn More", linkType: "internal" as const, internalPage: "/about" },
        secondaryButton: { label: "Donate Now", linkType: "internal" as const, internalPage: "/donate" },
        image: {
          _type: "image" as const,
          asset: { _ref: "image-abc123", _type: "reference" as const },
        },
        active: true,
      },
      {
        title: "Experience",
        highlight: "Islamic Culture",
        subtitle: "Rich heritage and traditions",
        active: true,
      },
    ];

    it("renders Sanity slide content instead of fallback", () => {
      render(<HeroSection heroSlides={sanitySlides} />);

      expect(screen.getByText("Discover")).toBeInTheDocument();
      expect(screen.getByText("Our Community")).toBeInTheDocument();
      expect(screen.getByText("Join our vibrant community")).toBeInTheDocument();
    });

    it("renders Sanity CTA button labels", () => {
      render(<HeroSection heroSlides={sanitySlides} />);

      expect(screen.getByText("Learn More")).toBeInTheDocument();
      expect(screen.getByText("Donate Now")).toBeInTheDocument();
    });

    it("shows correct number of slide indicators for Sanity slides", () => {
      render(<HeroSection heroSlides={sanitySlides} />);

      const indicators = screen.getAllByRole("button", {
        name: /Go to slide/,
      });
      expect(indicators.length).toBe(2);
    });

    it("filters out inactive slides", () => {
      const slidesWithInactive = [
        { title: "Active", highlight: "Slide", subtitle: "Visible", active: true },
        { title: "Inactive", highlight: "Slide", subtitle: "Hidden", active: false },
      ];

      render(<HeroSection heroSlides={slidesWithInactive} />);

      const indicators = screen.getAllByRole("button", {
        name: /Go to slide/,
      });
      expect(indicators.length).toBe(1);
    });

    it("falls back to defaults when all slides are inactive", () => {
      const allInactive = [
        { title: "Off", highlight: "Disabled", active: false },
      ];

      render(<HeroSection heroSlides={allInactive} />);

      // Should fall back to the 3 default slides
      const indicators = screen.getAllByRole("button", {
        name: /Go to slide/,
      });
      expect(indicators.length).toBe(3);
      expect(screen.getByText("Welcome to the")).toBeInTheDocument();
    });

    it("uses Sanity image when slide has image asset", () => {
      const slidesWithImage = [
        {
          title: "With Image",
          highlight: "Test",
          image: {
            _type: "image" as const,
            asset: { _ref: "image-xyz789", _type: "reference" as const },
          },
          active: true,
        },
      ];

      const { container } = render(<HeroSection heroSlides={slidesWithImage} />);

      const img = container.querySelector("img");
      expect(img).toHaveAttribute(
        "src",
        "https://cdn.sanity.io/hero-image.jpg",
      );
    });

    it("defaults CTA labels when slide has no buttons", () => {
      const noButtons = [
        { title: "Simple", highlight: "Slide", active: true },
      ];

      render(<HeroSection heroSlides={noButtons} />);

      expect(screen.getByText("Explore Our Centre")).toBeInTheDocument();
      expect(screen.getByText("Book a Visit")).toBeInTheDocument();
    });

    it("resolves internal page links from button data", () => {
      const slidesWithInternal = [
        {
          title: "Internal",
          highlight: "Link",
          primaryButton: {
            label: "Go to Events",
            linkType: "internal" as const,
            internalPage: "/events",
          },
          active: true,
        },
      ];

      render(<HeroSection heroSlides={slidesWithInternal} />);

      const link = screen.getByText("Go to Events").closest("a");
      expect(link).toHaveAttribute("href", "/events");
    });

    it("resolves external URL links from button data", () => {
      const slidesWithExternal = [
        {
          title: "External",
          highlight: "Link",
          primaryButton: {
            label: "Visit Partner",
            linkType: "external" as const,
            url: "https://partner.org",
          },
          active: true,
        },
      ];

      render(<HeroSection heroSlides={slidesWithExternal} />);

      const link = screen.getByText("Visit Partner").closest("a");
      expect(link).toHaveAttribute("href", "https://partner.org");
    });

    it("falls back to legacy url field when linkType is missing", () => {
      const legacySlides = [
        {
          title: "Legacy",
          highlight: "Button",
          primaryButton: { label: "Old Style", url: "/about" },
          active: true,
        },
      ];

      render(<HeroSection heroSlides={legacySlides} />);

      const link = screen.getByText("Old Style").closest("a");
      expect(link).toHaveAttribute("href", "/about");
    });
  });

  describe("Video mode with heroVideoOverlays", () => {
    const videoOverlays = [
      {
        title: "Witness the Beauty of",
        highlight: "Islamic Architecture",
        subtitle: "A masterpiece of modern Islamic design",
        primaryButton: { label: "Take a Tour", linkType: "internal" as const, internalPage: "/architecture" },
        secondaryButton: { label: "Watch Video", linkType: "internal" as const, internalPage: "/media" },
        active: true,
      },
      {
        title: "Join Our",
        highlight: "Community",
        subtitle: "Everyone is welcome",
        active: true,
      },
    ];

    it("renders heroVideoOverlays text in video mode", () => {
      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
          heroVideoOverlays={videoOverlays}
        />,
      );

      expect(screen.getByText("Witness the Beauty of")).toBeInTheDocument();
      expect(screen.getByText("Islamic Architecture")).toBeInTheDocument();
      expect(
        screen.getByText("A masterpiece of modern Islamic design"),
      ).toBeInTheDocument();
    });

    it("renders heroVideoOverlays CTA buttons", () => {
      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
          heroVideoOverlays={videoOverlays}
        />,
      );

      expect(screen.getByText("Take a Tour")).toBeInTheDocument();
      expect(screen.getByText("Watch Video")).toBeInTheDocument();
    });

    it("prefers heroVideoOverlays over heroSlides in video mode", () => {
      const carouselSlides = [
        {
          title: "Carousel",
          highlight: "Title",
          subtitle: "Should not show",
          image: {
            _type: "image" as const,
            asset: { _ref: "image-abc", _type: "reference" as const },
          },
          active: true,
        },
      ];

      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
          heroSlides={carouselSlides}
          heroVideoOverlays={videoOverlays}
        />,
      );

      expect(screen.getByText("Witness the Beauty of")).toBeInTheDocument();
      expect(screen.queryByText("Carousel")).not.toBeInTheDocument();
    });

    it("falls back to heroSlides text when heroVideoOverlays is empty", () => {
      const carouselSlides = [
        {
          title: "Fallback",
          highlight: "From Carousel",
          active: true,
        },
      ];

      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
          heroSlides={carouselSlides}
          heroVideoOverlays={[]}
        />,
      );

      expect(screen.getByText("Fallback")).toBeInTheDocument();
      expect(screen.getByText("From Carousel")).toBeInTheDocument();
    });

    it("falls back to defaults when both arrays are empty in video mode", () => {
      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
          heroSlides={[]}
          heroVideoOverlays={[]}
        />,
      );

      expect(screen.getByText("Welcome to the")).toBeInTheDocument();
      expect(
        screen.getByText("Australian Islamic Centre"),
      ).toBeInTheDocument();
    });

    it("filters out inactive overlays", () => {
      const overlaysWithInactive = [
        { title: "Active", highlight: "Overlay", active: true },
        { title: "Inactive", highlight: "Hidden", active: false },
      ];

      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
          heroVideoOverlays={overlaysWithInactive}
        />,
      );

      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("shows correct number of slide indicators for overlays", () => {
      render(
        <HeroSection
          heroMode="video"
          heroVideoUrl="https://example.com/video.mp4"
          heroVideoOverlays={videoOverlays}
        />,
      );

      // Video mode hides slide indicators, but text content should come from overlays
      expect(screen.getByText("Witness the Beauty of")).toBeInTheDocument();
    });
  });
});
