import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import LiveDonationsContent from "./LiveDonationsContent";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: "div",
    span: "span",
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill: _fill, priority: _priority, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} />;
  },
}));

// Mock FadeIn
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockDonationData = {
  data: {
    recentDonations: [
      { id: "d1", name: "Ahmed H.", amount: 100, city: "Melbourne", time: "2026-03-17T12:00:00Z", anonymous: false },
      { id: "d2", name: "Anonymous", amount: 500, city: "Sydney", time: "2026-03-17T11:00:00Z", anonymous: true },
    ],
    topSupporters: [
      { name: "Ahmed H.", total: 500, city: "Melbourne", donationCount: 3 },
      { name: "Anonymous", total: 10000, city: "", donationCount: 1 },
    ],
    totalRaised: 12000,
    offlineAmount: 0,
    donorCount: 350,
  },
};

describe("LiveDonationsContent", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.classList.remove("kiosk-mode");
  });

  it("renders campaign header", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    render(<LiveDonationsContent />);
    expect(screen.getByText("Live Donations")).toBeInTheDocument();
    expect(screen.getByText("Ramadan Campaign")).toBeInTheDocument();
  });

  it("renders loading state before data arrives", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => new Promise(() => {}), // never resolves
    });
    render(<LiveDonationsContent />);
    expect(screen.getByText("Loading donations...")).toBeInTheDocument();
    expect(screen.getByText("Loading supporters...")).toBeInTheDocument();
  });

  it("renders recent donations after fetch", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    render(<LiveDonationsContent />);
    await waitFor(() => {
      expect(screen.getAllByText("Ahmed H.").length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText("Recent Donations")).toBeInTheDocument();
  });

  it("renders top supporters after fetch", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    render(<LiveDonationsContent />);
    expect(screen.getByText("Top Supporters")).toBeInTheDocument();
    // Wait for supporter data to load — check for supporter-specific text
    await waitFor(() => {
      expect(screen.getByText(/3 donations/)).toBeInTheDocument();
    });
  });

  it("renders goal amount", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    render(<LiveDonationsContent />);
    expect(screen.getByText("Goal: $360,000.00")).toBeInTheDocument();
  });

  it("renders QR code section", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    render(<LiveDonationsContent />);
    expect(screen.getByText("Donate Now")).toBeInTheDocument();
    expect(screen.getByText("Scan to donate")).toBeInTheDocument();
    expect(screen.getByAltText("QR code linking to australianislamiccentre.org/donate")).toBeInTheDocument();
  });

  it("renders donate link", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    render(<LiveDonationsContent />);
    const link = screen.getByRole("link", { name: "australianislamiccentre.org/donate" });
    expect(link).toHaveAttribute("href", "https://australianislamiccentre.org/donate");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("adds kiosk-mode class to body on mount", () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    const { unmount } = render(<LiveDonationsContent />);
    expect(document.body.classList.contains("kiosk-mode")).toBe(true);
    unmount();
    expect(document.body.classList.contains("kiosk-mode")).toBe(false);
  });

  it("handles fetch failure gracefully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    render(<LiveDonationsContent />);
    // Should still render loading state, not crash
    expect(screen.getByText("Loading donations...")).toBeInTheDocument();
  });

  it("handles non-ok response gracefully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    });
    render(<LiveDonationsContent />);
    expect(screen.getByText("Loading donations...")).toBeInTheDocument();
  });

  it("polls for data every 5 seconds", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });
    render(<LiveDonationsContent />);

    // Initial fetch via setTimeout(fn, 0)
    await vi.advanceTimersByTimeAsync(100);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // After 5s, another poll
    await vi.advanceTimersByTimeAsync(5000);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // After another 5s
    await vi.advanceTimersByTimeAsync(5000);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("shows milestone celebration when a threshold is crossed", async () => {
    // Milestones only trigger after the first 2 fetches (initialisation window)
    const stableData = {
      data: { ...mockDonationData.data, totalRaised: 4000 },
    };
    const crossedData = {
      data: { ...mockDonationData.data, totalRaised: 6000 },
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(stableData) })   // fetch 1
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(stableData) })   // fetch 2 (still init)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(crossedData) }); // fetch 3 — milestone!

    render(<LiveDonationsContent />);

    await vi.advanceTimersByTimeAsync(100);   // fetch 1
    await vi.advanceTimersByTimeAsync(5000);  // fetch 2
    await vi.advanceTimersByTimeAsync(5000);  // fetch 3 crosses $5k

    await waitFor(() => {
      expect(screen.getByText("Milestone")).toBeInTheDocument();
      expect(screen.getByText("$5k")).toBeInTheDocument();
      expect(screen.getByText("Alhamdulillah!")).toBeInTheDocument();
    });
  });

  it("shows highest milestone when multiple are crossed at once", async () => {
    // Jump from 4k to 26k — crosses $5k, $10k, $15k, $20k, $25k
    const stableData = {
      data: { ...mockDonationData.data, totalRaised: 4000 },
    };
    const crossedData = {
      data: { ...mockDonationData.data, totalRaised: 26000 },
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(stableData) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(stableData) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(crossedData) });

    render(<LiveDonationsContent />);

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(5000);
    await vi.advanceTimersByTimeAsync(5000);

    await waitFor(() => {
      expect(screen.getByText("$25k")).toBeInTheDocument();
    });
    // Should NOT show $5k — only the highest crossed
    expect(screen.queryByText("$5k")).not.toBeInTheDocument();
  });

  it("milestone overlay disappears after 4 seconds", async () => {
    const stableData = {
      data: { ...mockDonationData.data, totalRaised: 4000 },
    };
    const crossedData = {
      data: { ...mockDonationData.data, totalRaised: 6000 },
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(stableData) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(stableData) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(crossedData) })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(crossedData) });

    render(<LiveDonationsContent />);

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(5000);
    await vi.advanceTimersByTimeAsync(5000);

    await waitFor(() => {
      expect(screen.getByText("Milestone")).toBeInTheDocument();
    });

    // After 4s the milestone should disappear
    await vi.advanceTimersByTimeAsync(4000);

    await waitFor(() => {
      expect(screen.queryByText("Milestone")).not.toBeInTheDocument();
    });
  });

  it("does not show milestone on first fetch (no previous total)", async () => {
    // First fetch at 6000 — above $5k but no previous total to compare
    const data = {
      data: { ...mockDonationData.data, totalRaised: 6000 },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    });

    render(<LiveDonationsContent />);
    await vi.advanceTimersByTimeAsync(100);

    // Should not show milestone since prevTotal was 0
    expect(screen.queryByText("Milestone")).not.toBeInTheDocument();
  });

  it("does not trigger milestone during initialisation window (first 2 fetches)", async () => {
    // Even if total jumps between fetch 1 and 2, no milestone should fire
    const lowData = {
      data: { ...mockDonationData.data, totalRaised: 4000 },
    };
    const highData = {
      data: { ...mockDonationData.data, totalRaised: 6000 },
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(lowData) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(highData) })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(highData) });

    render(<LiveDonationsContent />);

    await vi.advanceTimersByTimeAsync(100);   // fetch 1: 4000
    await vi.advanceTimersByTimeAsync(5000);  // fetch 2: 6000 (crosses $5k but still in init)

    // Should NOT show milestone during init window
    expect(screen.queryByText("Milestone")).not.toBeInTheDocument();
  });

  it("shows offline amount text when offlineAmount > 0", async () => {
    const dataWithOffline = {
      data: { ...mockDonationData.data, totalRaised: 60000, offlineAmount: 48000 },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataWithOffline),
    });

    render(<LiveDonationsContent />);

    await waitFor(() => {
      expect(screen.getByText(/from offline donations\/pledges/)).toBeInTheDocument();
      expect(screen.getByText(/\$48,000\.00/)).toBeInTheDocument();
    });
  });

  it("hides offline amount text when offlineAmount is 0", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonationData),
    });

    render(<LiveDonationsContent />);

    await vi.advanceTimersByTimeAsync(100);

    expect(screen.queryByText(/from offline donations\/pledges/)).not.toBeInTheDocument();
  });
});
