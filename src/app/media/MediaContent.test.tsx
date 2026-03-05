import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import MediaContent from "./MediaContent";
import type { MediaGalleryImage } from "@/types/sanity";
import type { YouTubeVideo } from "@/lib/youtube";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      onClick,
      role,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} onClick={onClick} role={role} {...rest}>
        {children}
      </div>
    ),
    nav: ({
      children,
      className,
      ...rest
    }: React.HTMLAttributes<HTMLElement>) => (
      <nav className={className} {...rest}>
        {children}
      </nav>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
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
    url: () => "https://example.com/image-600.jpg",
    height: () => ({
      url: () => "https://example.com/image-800x800.jpg",
    }),
  }),
}));

vi.mock("@/sanity/lib/image", () => ({
  urlFor: (source: unknown) => mockUrlFor(source),
}));

// Mock Breadcrumb
vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="Breadcrumb">Home / Media</nav>,
}));

// Mock SiteSettingsContext
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/@aic",
    },
  }),
}));

function makeImage(
  overrides: Partial<MediaGalleryImage> = {},
): MediaGalleryImage {
  return {
    image: {
      _type: "image",
      asset: { _ref: "image-abc-200x200-jpg", _type: "reference" },
    },
    alt: "Test image",
    ...overrides,
  };
}

function makeVideo(overrides: Partial<YouTubeVideo> = {}): YouTubeVideo {
  return {
    id: `vid-${Math.random().toString(36).slice(2, 8)}`,
    title: "Test Video",
    thumbnail: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
    publishedAt: "2025-06-15T10:00:00Z",
    url: "https://www.youtube.com/watch?v=abc",
    ...overrides,
  };
}

describe("MediaContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
  });

  // ── Page Header ──

  it("renders the page heading", () => {
    render(<MediaContent mediaGalleryImages={[]} />);
    expect(screen.getByText("Gallery")).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", () => {
    render(<MediaContent mediaGalleryImages={[]} />);
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  // ── Video Section ──

  describe("video section", () => {
    it("does not render when no videos are provided", () => {
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={[]} />);
      expect(screen.queryByText("Latest Videos")).not.toBeInTheDocument();
    });

    it("renders featured video iframe for the first video", () => {
      const videos = [makeVideo({ id: "abc123", title: "Friday Khutbah" })];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByTitle("Friday Khutbah")).toBeInTheDocument();
    });

    it("renders Latest Videos heading above the grid", () => {
      const videos = [
        makeVideo({ id: "v1", title: "Video One" }),
        makeVideo({ id: "v2", title: "Video Two" }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByText("Latest Videos")).toBeInTheDocument();
    });

    it("displays video title and formatted date", () => {
      const videos = [
        makeVideo({ title: "Eid Prayer", publishedAt: "2025-03-30T08:00:00Z" }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByText("Eid Prayer")).toBeInTheDocument();
      expect(screen.getByText("30 March 2025")).toBeInTheDocument();
    });

    it("shows View on YouTube link", () => {
      const videos = [
        makeVideo({ url: "https://www.youtube.com/watch?v=xyz" }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      const link = screen.getByText("View on YouTube");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute(
        "href",
        "https://www.youtube.com/watch?v=xyz",
      );
      expect(link.closest("a")).toHaveAttribute("target", "_blank");
    });

    it("shows first 4 videos in the list", () => {
      const videos = Array.from({ length: 8 }, (_, i) =>
        makeVideo({ id: `v${i}`, title: `Video ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      // First 4 visible
      expect(screen.getByLabelText("Play Video 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Play Video 4")).toBeInTheDocument();
      // 5th+ hidden
      expect(screen.queryByLabelText("Play Video 5")).not.toBeInTheDocument();
    });

    it("hides remaining videos behind Show More button", () => {
      const videos = Array.from({ length: 8 }, (_, i) =>
        makeVideo({ id: `v${i}`, title: `Video ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByText("Show More")).toBeInTheDocument();
    });

    it("Show More reveals all 8 videos", async () => {
      const user = userEvent.setup();
      const videos = Array.from({ length: 8 }, (_, i) =>
        makeVideo({ id: `v${i}`, title: `Video ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      await user.click(screen.getByText("Show More"));

      // All 8 now visible
      expect(screen.getByLabelText("Play Video 8")).toBeInTheDocument();
      // Show More gone
      expect(screen.queryByText("Show More")).not.toBeInTheDocument();
    });

    it("clicking a video in the list loads it into the player", async () => {
      const user = userEvent.setup();
      const videos = [
        makeVideo({ id: "v1", title: "First Video" }),
        makeVideo({ id: "v2", title: "Second Video" }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      // Initially shows first video
      expect(screen.getByTitle("First Video")).toBeInTheDocument();

      // Click second video in list
      await user.click(screen.getByLabelText("Play Second Video"));

      // Now shows second video
      expect(screen.getByTitle("Second Video")).toBeInTheDocument();
    });

    it("shows View all videos on YouTube link after expanding", async () => {
      const user = userEvent.setup();
      const videos = Array.from({ length: 8 }, (_, i) =>
        makeVideo({ id: `v${i}`, title: `Video ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      await user.click(screen.getByText("Show More"));

      const channelLink = screen.getByText("View all videos on YouTube");
      expect(channelLink).toBeInTheDocument();
      expect(channelLink.closest("a")).toHaveAttribute(
        "href",
        "https://youtube.com/@aic",
      );
    });

    it("active video shows Now Playing badge", () => {
      const videos = [
        makeVideo({ id: "v1", title: "Video One" }),
        makeVideo({ id: "v2", title: "Video Two" }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByText("Now Playing")).toBeInTheDocument();
    });

    it("shows LIVE NOW badge when live stream is active", () => {
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
          liveStream={{
            isLive: true,
            videoId: "live1",
            title: "Live Khutbah",
            url: "https://youtube.com/watch?v=live1",
          }}
        />,
      );

      expect(screen.getByText("LIVE")).toBeInTheDocument();
    });

    it("loads live stream into featured player when live", () => {
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo({ id: "regular1" })]}
          liveStream={{
            isLive: true,
            videoId: "live1",
            title: "Live Khutbah",
            url: "https://youtube.com/watch?v=live1",
          }}
        />,
      );

      expect(screen.getByTitle("Live Khutbah")).toBeInTheDocument();
    });

    it("does not show LIVE badge when not live", () => {
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
          liveStream={{ isLive: false }}
        />,
      );

      expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    });

    it("does not render video list for a single video", () => {
      const videos = [makeVideo({ id: "solo", title: "Solo Video" })];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      // No list items (the solo video is in the player, not in a list)
      expect(
        screen.queryByLabelText("Play Solo Video"),
      ).not.toBeInTheDocument();
    });
  });

  // ── Social Links ──

  describe("social links", () => {
    it("renders social media icons with correct links", () => {
      render(
        <MediaContent
          mediaGalleryImages={[makeImage()]}
          youtubeVideos={[makeVideo()]}
        />,
      );

      const fbLink = screen.getByLabelText("Follow us on Facebook");
      expect(fbLink).toHaveAttribute("href", "https://facebook.com/aic");
      expect(fbLink).toHaveAttribute("target", "_blank");

      const igLink = screen.getByLabelText("Follow us on Instagram");
      expect(igLink).toHaveAttribute("href", "https://instagram.com/aic");

      const ytLink = screen.getByLabelText("Follow us on YouTube");
      expect(ytLink).toHaveAttribute("href", "https://youtube.com/@aic");
    });

    it("renders Follow us heading", () => {
      render(
        <MediaContent
          mediaGalleryImages={[makeImage()]}
          youtubeVideos={[makeVideo()]}
        />,
      );

      expect(screen.getByText("Follow Us")).toBeInTheDocument();
    });
  });

  // ── Photo Gallery ──

  describe("photo gallery", () => {
    it("renders Photos heading", () => {
      render(<MediaContent mediaGalleryImages={[makeImage()]} />);
      expect(screen.getByText("Photos")).toBeInTheDocument();
    });

    it("renders all images without filtering", () => {
      const images = [
        makeImage({ alt: "Prayer hall" }),
        makeImage({ alt: "Event photo" }),
        makeImage({ alt: "Building" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      expect(screen.getByAltText("Prayer hall")).toBeInTheDocument();
      expect(screen.getByAltText("Event photo")).toBeInTheDocument();
      expect(screen.getByAltText("Building")).toBeInTheDocument();
    });

    it("shows caption in hover overlay", () => {
      render(
        <MediaContent
          mediaGalleryImages={[
            makeImage({ caption: "Eid celebration 2025", alt: "Eid photo" }),
          ]}
        />,
      );

      expect(screen.getByText("Eid celebration 2025")).toBeInTheDocument();
    });

    it("falls back to alt text when caption is empty", () => {
      render(
        <MediaContent
          mediaGalleryImages={[makeImage({ alt: "Community gathering" })]}
        />,
      );

      // alt appears in both img alt and overlay text
      const elements = screen.getAllByText("Community gathering");
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it("shows empty state when no images", () => {
      render(<MediaContent mediaGalleryImages={[]} />);

      expect(screen.getByText("No Photos Available")).toBeInTheDocument();
      expect(
        screen.getByText("Gallery photos will appear here once added."),
      ).toBeInTheDocument();
    });

    it("filters out images with missing image data", () => {
      const images = [
        makeImage({ alt: "Good image" }),
        {
          alt: "Bad image",
          image: null as unknown as MediaGalleryImage["image"],
        },
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      expect(screen.getByAltText("Good image")).toBeInTheDocument();
      expect(screen.queryByAltText("Bad image")).not.toBeInTheDocument();
    });
  });

  // ── Lightbox ──

  describe("lightbox", () => {
    it("opens when a gallery image is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[makeImage({ alt: "Mosque exterior" })]}
        />,
      );

      await user.click(screen.getByLabelText("View Mosque exterior"));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
    });

    it("shows image counter", async () => {
      const user = userEvent.setup();
      const images = [
        makeImage({ alt: "Image A" }),
        makeImage({ alt: "Image B" }),
        makeImage({ alt: "Image C" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      await user.click(screen.getByLabelText("View Image A"));

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("navigates to next image", async () => {
      const user = userEvent.setup();
      const images = [
        makeImage({ alt: "Image A" }),
        makeImage({ alt: "Image B" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      await user.click(screen.getByLabelText("View Image A"));
      expect(screen.getByText("1 / 2")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Next image"));
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });

    it("navigates to previous image", async () => {
      const user = userEvent.setup();
      const images = [
        makeImage({ alt: "Image A" }),
        makeImage({ alt: "Image B" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      await user.click(screen.getByLabelText("View Image A"));
      await user.click(screen.getByLabelText("Previous image"));

      // Wraps around to last image
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });

    it("closes on close button click", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent mediaGalleryImages={[makeImage({ alt: "Test image" })]} />,
      );

      await user.click(screen.getByLabelText("View Test image"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Close lightbox"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes on Escape key", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent mediaGalleryImages={[makeImage({ alt: "Test image" })]} />,
      );

      await user.click(screen.getByLabelText("View Test image"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("navigates with arrow keys", async () => {
      const user = userEvent.setup();
      const images = [
        makeImage({ alt: "Image A" }),
        makeImage({ alt: "Image B" }),
        makeImage({ alt: "Image C" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      await user.click(screen.getByLabelText("View Image A"));
      expect(screen.getByText("1 / 3")).toBeInTheDocument();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByText("2 / 3")).toBeInTheDocument();

      await user.keyboard("{ArrowLeft}");
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("locks body scroll when open", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent mediaGalleryImages={[makeImage({ alt: "Test image" })]} />,
      );

      await user.click(screen.getByLabelText("View Test image"));
      expect(document.body.style.overflow).toBe("hidden");

      await user.click(screen.getByLabelText("Close lightbox"));
      expect(document.body.style.overflow).toBe("");
    });

    it("shows caption in lightbox overlay", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[
            makeImage({
              alt: "Eid prayer",
              caption: "Annual Eid celebration",
            }),
          ]}
        />,
      );

      await user.click(screen.getByLabelText("View Eid prayer"));

      // Inside the lightbox dialog
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveTextContent("Annual Eid celebration");
    });
  });
});
