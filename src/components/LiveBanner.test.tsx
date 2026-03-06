import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { LiveBanner } from "./LiveBanner";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...rest}>{children}</div>
    ),
    span: ({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...rest}>{children}</span>
    ),
  },
}));

describe("LiveBanner", () => {
  it("renders nothing when not live", () => {
    const { container } = render(
      <LiveBanner liveStream={{ isLive: false }} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders banner when live", () => {
    render(
      <LiveBanner
        liveStream={{
          isLive: true,
          videoId: "abc123",
          title: "Friday Khutbah",
          url: "https://www.youtube.com/watch?v=abc123",
        }}
      />
    );

    expect(screen.getByText(/live/i)).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=abc123");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows the stream title", () => {
    render(
      <LiveBanner
        liveStream={{
          isLive: true,
          videoId: "abc123",
          title: "Friday Khutbah",
          url: "https://www.youtube.com/watch?v=abc123",
        }}
      />
    );

    expect(screen.getByText(/Friday Khutbah/)).toBeInTheDocument();
  });

  it("polls /api/youtube/live and updates when stream starts", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          isLive: true,
          videoId: "live123",
          title: "Friday Khutbah",
          url: "https://www.youtube.com/watch?v=live123",
        })
      )
    );

    render(<LiveBanner liveStream={{ isLive: false }} />);

    // Initially hidden
    expect(screen.queryByText(/live/i)).not.toBeInTheDocument();

    // Advance past the 60s interval
    await vi.advanceTimersByTimeAsync(61_000);

    // Should have polled
    expect(fetchSpy).toHaveBeenCalledWith("/api/youtube/live");

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });
});
