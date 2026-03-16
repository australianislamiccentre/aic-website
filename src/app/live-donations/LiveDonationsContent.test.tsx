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
    expect(screen.getByText("Laylatul Qadr Campaign")).toBeInTheDocument();
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
});
