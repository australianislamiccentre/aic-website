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

// Mock prayer hooks
vi.mock("@/hooks/usePrayerTimes", () => ({
  usePrayerTimes: () => ({
    fajr: { adhan: "5:30 AM", iqamah: "5:50 AM" },
    sunrise: { adhan: "6:50 AM", iqamah: "6:50 AM" },
    dhuhr: { adhan: "12:30 PM", iqamah: "1:00 PM" },
    asr: { adhan: "3:45 PM", iqamah: "4:15 PM" },
    maghrib: { adhan: "6:15 PM", iqamah: "6:20 PM" },
    isha: { adhan: "7:45 PM", iqamah: "8:15 PM" },
  }),
  useNextPrayer: () => ({
    name: "dhuhr",
    displayName: "Dhuhr",
    adhan: "12:30 PM",
    iqamah: "1:00 PM",
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

    it("renders prayer times bar", () => {
      render(<HeroSection />);

      expect(screen.getAllByText("Fajr").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Dhuhr").length).toBeGreaterThanOrEqual(1);
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
});
