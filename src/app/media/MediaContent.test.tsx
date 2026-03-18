import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import MediaContent from "./MediaContent";
import type { MediaGalleryImage } from "@/types/sanity";
import type { YouTubeVideo, YouTubePlaylist } from "@/lib/youtube";

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
    _key: `key-${Math.random().toString(36).slice(2, 8)}`,
    asset: { _ref: "image-abc-200x200-jpg", _type: "reference" },
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

function makePlaylist(
  overrides: Partial<YouTubePlaylist> = {},
): YouTubePlaylist {
  return {
    id: `PL_XW5f-8WbWHW0gshPzOp_QCv4EEZeF_D`,
    title: "Test Playlist",
    description: "A test playlist",
    thumbnail: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
    videoCount: 5,
    ...overrides,
  };
}

describe("MediaContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
    Element.prototype.scrollIntoView = vi.fn();
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
      expect(
        screen.queryByRole("tab", { name: "Latest" }),
      ).not.toBeInTheDocument();
    });

    it("renders featured video iframe for the first video", () => {
      const videos = [makeVideo({ id: "abc123", title: "Friday Khutbah" })];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByTitle("Friday Khutbah")).toBeInTheDocument();
    });

    it("renders Latest Videos as a tab button", () => {
      const videos = [
        makeVideo({ id: "v1", title: "Video One" }),
        makeVideo({ id: "v2", title: "Video Two" }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(
        screen.getByRole("tab", { name: "Latest" }),
      ).toBeInTheDocument();
    });

    it("displays video title and formatted date", () => {
      const videos = [
        makeVideo({
          title: "Eid Prayer",
          publishedAt: "2025-03-30T08:00:00Z",
        }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      const titles = screen.getAllByText("Eid Prayer");
      expect(titles.length).toBeGreaterThanOrEqual(1);
      const dates = screen.getAllByText("30 March 2025");
      expect(dates.length).toBeGreaterThanOrEqual(1);
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

    it("shows up to 12 videos in the grid", () => {
      const videos = Array.from({ length: 15 }, (_, i) =>
        makeVideo({ id: `v${i}`, title: `Video ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByLabelText("Play Video 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Play Video 12")).toBeInTheDocument();
      expect(
        screen.queryByLabelText("Play Video 13"),
      ).not.toBeInTheDocument();
    });

    it("clicking a video in the list loads it into the player", async () => {
      const user = userEvent.setup();
      const videos = [
        makeVideo({ id: "v1", title: "First Video" }),
        makeVideo({ id: "v2", title: "Second Video" }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByTitle("First Video")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Play Second Video"));

      expect(screen.getByTitle("Second Video")).toBeInTheDocument();
    });

    it("shows View all videos on YouTube link", () => {
      const videos = [makeVideo({ id: "v1", title: "Video 1" })];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      const channelLink = screen.getByText("View all videos on YouTube");
      expect(channelLink).toBeInTheDocument();
      expect(channelLink.closest("a")).toHaveAttribute(
        "href",
        "https://youtube.com/@aic/videos",
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

    it("shows LIVE badge when live stream is active", () => {
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

    it("live stream card appears but does not override the player", () => {
      const regularVideo = makeVideo({
        id: "regular1",
        title: "Regular Video",
      });
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[regularVideo]}
          liveStream={{
            isLive: true,
            videoId: "live1",
            title: "Live Khutbah",
            url: "https://youtube.com/watch?v=live1",
          }}
        />,
      );

      expect(screen.getByTitle("Regular Video")).toBeInTheDocument();
      expect(screen.getByLabelText("Play Live Khutbah")).toBeInTheDocument();
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

    it("single video still appears in the grid", () => {
      const videos = [makeVideo({ id: "solo", title: "Solo Video" })];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByLabelText("Play Solo Video")).toBeInTheDocument();
    });
  });

  // ── Tabs ──

  describe("tabs", () => {
    it("renders three tab buttons", () => {
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
        />,
      );
      expect(
        screen.getByRole("tab", { name: "Latest" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Playlists" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Streams" }),
      ).toBeInTheDocument();
    });

    it("Latest Videos tab is selected by default", () => {
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
        />,
      );
      expect(
        screen.getByRole("tab", { name: "Latest" }),
      ).toHaveAttribute("aria-selected", "true");
    });

    it("clicking Playlists tab switches content", async () => {
      const user = userEvent.setup();
      const playlists = [
        makePlaylist({ title: "My Playlist", videoCount: 3 }),
      ];
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
          playlists={playlists}
        />,
      );

      await user.click(screen.getByRole("tab", { name: "Playlists" }));
      expect(screen.getByText("My Playlist")).toBeInTheDocument();
      expect(screen.getByText("3 videos")).toBeInTheDocument();
    });

    it("clicking Friday Khutbas tab switches content", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
          playlists={[]}
        />,
      );

      await user.click(screen.getByRole("tab", { name: "Streams" }));
      expect(
        screen.getByText("No khutba streams available."),
      ).toBeInTheDocument();
    });
  });

  // ── Autoplay and Scroll ──

  describe("autoplay and scroll", () => {
    it("clicking a video adds autoplay to iframe src", async () => {
      const user = userEvent.setup();
      const videos = [
        makeVideo({ id: "v1", title: "First" }),
        makeVideo({ id: "v2", title: "Second" }),
      ];
      render(
        <MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />,
      );

      await user.click(screen.getByLabelText("Play Second"));
      const iframe = document.querySelector("iframe");
      expect(iframe?.src).toContain("rel=0");
      expect(iframe?.src).toContain("autoplay=1");
    });

    it("clicking a video scrolls player into view", async () => {
      const user = userEvent.setup();
      const videos = [
        makeVideo({ id: "v1", title: "First" }),
        makeVideo({ id: "v2", title: "Second" }),
      ];
      render(
        <MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />,
      );

      await user.click(screen.getByLabelText("Play Second"));
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });
  });

  // ── Live Stream ──

  describe("live stream", () => {
    it("user can click another video when live stream is active", async () => {
      const user = userEvent.setup();
      const videos = [makeVideo({ id: "v1", title: "Regular Video" })];
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={videos}
          liveStream={{
            isLive: true,
            videoId: "live1",
            title: "Live Khutbah",
            url: "https://youtube.com/watch?v=live1",
          }}
        />,
      );

      await user.click(screen.getByLabelText("Play Regular Video"));

      expect(screen.getByTitle("Regular Video")).toBeInTheDocument();
    });

    it("LIVE badge stays on live video card when another video is playing", async () => {
      const user = userEvent.setup();
      const videos = [makeVideo({ id: "v1", title: "Regular Video" })];
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={videos}
          liveStream={{
            isLive: true,
            videoId: "live1",
            title: "Live Khutbah",
            url: "https://youtube.com/watch?v=live1",
          }}
        />,
      );

      await user.click(screen.getByLabelText("Play Regular Video"));

      expect(screen.getByText("LIVE")).toBeInTheDocument();
    });

    it("live stream appears as first video in Latest Videos", () => {
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo({ id: "v1", title: "Regular Video" })]}
          liveStream={{
            isLive: true,
            videoId: "live1",
            title: "Live Khutbah",
            url: "https://youtube.com/watch?v=live1",
          }}
        />,
      );

      expect(
        screen.getByLabelText("Play Live Khutbah"),
      ).toBeInTheDocument();
      expect(screen.getByText("LIVE")).toBeInTheDocument();
    });
  });

  // ── Playlists Tab ──

  describe("playlists tab", () => {
    it("renders playlist accordion items with allowed IDs", async () => {
      const user = userEvent.setup();
      const playlists = [
        makePlaylist({
          id: "PL_XW5f-8WbWHW0gshPzOp_QCv4EEZeF_D",
          title: "Lectures",
          videoCount: 10,
        }),
        makePlaylist({
          id: "PL_XW5f-8WbWHgU5Piur86UHwb1dfDX10i",
          title: "Events",
          videoCount: 5,
        }),
      ];
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
          playlists={playlists}
        />,
      );

      await user.click(screen.getByRole("tab", { name: "Playlists" }));
      expect(screen.getByText("Lectures")).toBeInTheDocument();
      expect(screen.getByText("Events")).toBeInTheDocument();
      expect(screen.getByText("10 videos")).toBeInTheDocument();
    });

    it("filters out playlists with non-allowed IDs", async () => {
      const user = userEvent.setup();
      const playlists = [
        makePlaylist({
          id: "PL_XW5f-8WbWHW0gshPzOp_QCv4EEZeF_D",
          title: "Allowed Playlist",
          videoCount: 10,
        }),
        makePlaylist({
          id: "PL_NOT_ALLOWED",
          title: "Not Allowed Playlist",
          videoCount: 3,
        }),
      ];
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
          playlists={playlists}
        />,
      );

      await user.click(screen.getByRole("tab", { name: "Playlists" }));
      expect(screen.getByText("Allowed Playlist")).toBeInTheDocument();
      expect(
        screen.queryByText("Not Allowed Playlist"),
      ).not.toBeInTheDocument();
    });

    it("shows empty state when no playlists match allowed IDs", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[]}
          youtubeVideos={[makeVideo()]}
          playlists={[]}
        />,
      );

      await user.click(screen.getByRole("tab", { name: "Playlists" }));
      expect(
        screen.getByText("No playlists available."),
      ).toBeInTheDocument();
    });
  });

  // ── Video Card ──

  describe("video card", () => {
    it("renders title with fixed height for consistent cards", () => {
      const videos = [
        makeVideo({ id: "v1", title: "Short" }),
        makeVideo({
          id: "v2",
          title: "A Much Longer Video Title That Spans Multiple Lines",
        }),
      ];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      const titles = screen.getAllByRole("heading", { level: 4 });
      titles.forEach((title) => {
        expect(title.className).toContain("h-[2.5rem]");
      });
    });

    it("renders placeholder when thumbnail is missing", () => {
      const videos = [makeVideo({ id: "v1", title: "No Thumb", thumbnail: "" })];
      render(<MediaContent mediaGalleryImages={[]} youtubeVideos={videos} />);

      expect(screen.getByLabelText("Play No Thumb")).toBeInTheDocument();
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

    it("renders hero and thumbnail images", () => {
      const images = [
        makeImage({ alt: "Hero photo" }),
        makeImage({ alt: "Second photo" }),
        makeImage({ alt: "Third photo" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      expect(screen.getByAltText("Hero photo")).toBeInTheDocument();
      expect(screen.getByAltText("Second photo")).toBeInTheDocument();
      expect(screen.getByAltText("Third photo")).toBeInTheDocument();
    });

    it("shows mobile count overlay on hero when multiple images exist", () => {
      const images = Array.from({ length: 5 }, (_, i) =>
        makeImage({ alt: `Photo ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={images} />);

      // The mobile overlay shows +N where N = total - 1 (the hero)
      expect(screen.getByText("+4")).toBeInTheDocument();
    });

    it("does not show mobile count overlay when only one image", () => {
      render(
        <MediaContent mediaGalleryImages={[makeImage({ alt: "Solo" })]} />,
      );

      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it("thumbnails have hidden sm:block class for mobile hiding", () => {
      const images = [
        makeImage({ alt: "Hero" }),
        makeImage({ alt: "Thumb" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      // The thumbnail button (second image) should have hidden sm:block classes
      const thumbButton = screen.getByLabelText("View Thumb");
      expect(thumbButton.className).toContain("hidden");
      expect(thumbButton.className).toContain("sm:block");
    });

    it("shows +N tile when more than 6 images", () => {
      const images = Array.from({ length: 10 }, (_, i) =>
        makeImage({ alt: `Photo ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={images} />);
      expect(screen.getByText("+4")).toBeInTheDocument();
    });

    it("does not show +N tile on thumbnails when 6 or fewer images", () => {
      const images = Array.from({ length: 6 }, (_, i) =>
        makeImage({ alt: `Photo ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={images} />);
      // Last thumbnail (Photo 6) should have a regular label, not a +N overlay
      expect(screen.getByLabelText("View Photo 6")).toBeInTheDocument();
    });

    it("clicking +N tile opens lightbox", async () => {
      const user = userEvent.setup();
      const images = Array.from({ length: 10 }, (_, i) =>
        makeImage({ alt: `Photo ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={images} />);

      await user.click(screen.getByLabelText("+4 more photos"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("shows empty state when no images", () => {
      render(<MediaContent mediaGalleryImages={[]} />);

      expect(screen.getByText("No Photos Available")).toBeInTheDocument();
      expect(
        screen.getByText("Gallery photos will appear here once added."),
      ).toBeInTheDocument();
    });

    it("filters out images with missing asset data", () => {
      const images = [
        makeImage({ alt: "Good image" }),
        {
          _key: "bad-key",
          alt: "Bad image",
          asset: null as unknown as MediaGalleryImage["asset"],
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

      await user.click(screen.getByLabelText("View all 3 photos"));

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("navigates to next image", async () => {
      const user = userEvent.setup();
      const images = [
        makeImage({ alt: "Image A" }),
        makeImage({ alt: "Image B" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);

      await user.click(screen.getByLabelText("View all 2 photos"));
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

      await user.click(screen.getByLabelText("View all 2 photos"));
      await user.click(screen.getByLabelText("Previous image"));

      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });

    it("closes on close button click", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[makeImage({ alt: "Test image" })]}
        />,
      );

      await user.click(screen.getByLabelText("View Test image"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Close lightbox"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes on Escape key", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[makeImage({ alt: "Test image" })]}
        />,
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

      await user.click(screen.getByLabelText("View all 3 photos"));
      expect(screen.getByText("1 / 3")).toBeInTheDocument();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByText("2 / 3")).toBeInTheDocument();

      await user.keyboard("{ArrowLeft}");
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("locks body scroll when open", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[makeImage({ alt: "Test image" })]}
        />,
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

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveTextContent("Annual Eid celebration");
    });
  });
});
