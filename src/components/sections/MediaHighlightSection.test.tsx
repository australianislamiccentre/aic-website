import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { MediaHighlightSection } from "./MediaHighlightSection";

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
  },
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

// Mock SiteSettings context
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    socialMedia: {
      youtube: "https://youtube.com/aic",
      instagram: "https://instagram.com/aic",
      facebook: "https://facebook.com/aic",
    },
  }),
}));

describe("MediaHighlightSection", () => {
  it("renders section heading", () => {
    render(<MediaHighlightSection />);

    expect(screen.getByText("Media & Videos")).toBeInTheDocument();
    expect(screen.getByText("Centre")).toBeInTheDocument();
  });

  it("renders thumbnail facade with play button before clicking", () => {
    render(<MediaHighlightSection />);

    const playButton = screen.getByRole("button", {
      name: /Play video/i,
    });
    expect(playButton).toBeInTheDocument();
    expect(
      screen.getByText("Experience the Australian Islamic Centre"),
    ).toBeInTheDocument();
    expect(screen.getByText("3:42")).toBeInTheDocument();
    expect(screen.getByText("Watch on YouTube")).toBeInTheDocument();
  });

  it("does not render iframe before play is clicked", () => {
    render(<MediaHighlightSection />);

    expect(
      screen.queryByTitle("Experience the Australian Islamic Centre"),
    ).not.toBeInTheDocument();
  });

  it("renders YouTube iframe after clicking play", async () => {
    const user = userEvent.setup();
    render(<MediaHighlightSection />);

    const playButton = screen.getByRole("button", {
      name: /Play video/i,
    });
    await user.click(playButton);

    const iframe = screen.getByTitle(
      "Experience the Australian Islamic Centre",
    );
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("youtube.com/embed/BckNzo1ufDw"),
    );
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("autoplay=1"),
    );
    expect(iframe).toHaveAttribute("allowFullScreen");
  });

  it("hides thumbnail facade after clicking play", async () => {
    const user = userEvent.setup();
    render(<MediaHighlightSection />);

    await user.click(screen.getByRole("button", { name: /Play video/i }));

    expect(
      screen.queryByRole("button", { name: /Play video/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("3:42")).not.toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<MediaHighlightSection />);

    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
  });

  describe("Custom YouTube URL", () => {
    it("uses custom YouTube URL when provided", async () => {
      const user = userEvent.setup();
      render(
        <MediaHighlightSection featuredYoutubeUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />,
      );

      await user.click(screen.getByRole("button", { name: /Play video/i }));

      const iframe = screen.getByTitle(
        "Experience the Australian Islamic Centre",
      );
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("youtube.com/embed/dQw4w9WgXcQ"),
      );
    });

    it("falls back to default video when URL is empty", async () => {
      const user = userEvent.setup();
      render(<MediaHighlightSection featuredYoutubeUrl="" />);

      await user.click(screen.getByRole("button", { name: /Play video/i }));

      const iframe = screen.getByTitle(
        "Experience the Australian Islamic Centre",
      );
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("youtube.com/embed/BckNzo1ufDw"),
      );
    });

    it("falls back to default video when no URL provided", async () => {
      const user = userEvent.setup();
      render(<MediaHighlightSection />);

      await user.click(screen.getByRole("button", { name: /Play video/i }));

      const iframe = screen.getByTitle(
        "Experience the Australian Islamic Centre",
      );
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("youtube.com/embed/BckNzo1ufDw"),
      );
    });
  });

  it("social links point to correct URLs", () => {
    render(<MediaHighlightSection />);

    const youtubeLink = screen.getByText("YouTube").closest("a");
    expect(youtubeLink).toHaveAttribute("href", "https://youtube.com/aic");
    expect(youtubeLink).toHaveAttribute("target", "_blank");

    const instagramLink = screen.getByText("Instagram").closest("a");
    expect(instagramLink).toHaveAttribute("href", "https://instagram.com/aic");

    const facebookLink = screen.getByText("Facebook").closest("a");
    expect(facebookLink).toHaveAttribute("href", "https://facebook.com/aic");
  });
});
