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

  it("polls every 5 minutes on non-Friday", async () => {
    // Wednesday 10am Melbourne = Tuesday ~11pm UTC (AEDT is UTC+11)
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-03-04T10:00:00+11:00")); // Wednesday

    Object.defineProperty(document, "hidden", { value: false, writable: true });

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

    // Should NOT have polled after 61 seconds (not Friday)
    await vi.advanceTimersByTimeAsync(61_000);
    expect(fetchSpy).not.toHaveBeenCalled();

    // Should have polled after 5 minutes
    await vi.advanceTimersByTimeAsync(240_000); // total 301s
    expect(fetchSpy).toHaveBeenCalledWith("/api/youtube/live");

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it("polls every 60 seconds during Friday Khutbah window (12pm–3pm Melbourne)", async () => {
    // Friday 1pm Melbourne = Friday 2am UTC (AEDT is UTC+11)
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-03-06T13:00:00+11:00")); // Friday 1pm AEDT

    Object.defineProperty(document, "hidden", { value: false, writable: true });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ isLive: false }))
    );

    render(<LiveBanner liveStream={{ isLive: false }} />);

    // Should have polled after just 61 seconds (Friday prayer window)
    await vi.advanceTimersByTimeAsync(61_000);
    expect(fetchSpy).toHaveBeenCalledWith("/api/youtube/live");

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it("skips polling when tab is hidden", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-03-04T10:00:00+11:00")); // Wednesday

    Object.defineProperty(document, "hidden", { value: true, writable: true });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ isLive: false }))
    );

    render(<LiveBanner liveStream={{ isLive: false }} />);

    // Advance past the 5-minute interval
    await vi.advanceTimersByTimeAsync(301_000);

    // Should NOT have polled because tab is hidden
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });
});
