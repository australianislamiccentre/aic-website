import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { PrayerWidget } from "./PrayerWidget";

// Override the default next/navigation mock so we can vary pathname per test
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  usePathname: vi.fn(() => "/"),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the prayer hooks
vi.mock("@/hooks/usePrayerTimes", () => ({
  usePrayerTimes: () => ({
    fajr:    { name: "fajr",    displayName: "Fajr",    adhan: "4:58 AM", iqamah: "5:15 AM" },
    sunrise: { name: "sunrise", displayName: "Sunrise", adhan: "6:31 AM", iqamah: "6:46 AM" },
    dhuhr:   { name: "dhuhr",   displayName: "Dhuhr",   adhan: "1:15 PM", iqamah: "1:25 PM" },
    asr:     { name: "asr",     displayName: "Asr",     adhan: "3:42 PM", iqamah: "3:52 PM" },
    maghrib: { name: "maghrib", displayName: "Maghrib", adhan: "5:51 PM", iqamah: "5:56 PM" },
    isha:    { name: "isha",    displayName: "Isha",    adhan: "7:14 PM", iqamah: "7:24 PM" },
  }),
  useNextPrayer: () => ({
    name: "asr", displayName: "Asr", adhan: "3:42 PM", iqamah: "3:52 PM", isNextDay: false,
  }),
}));

// Mock the scroll hook so we don't deal with scroll events in component tests.
// Using vi.fn() lets Task 6's tests override the return value per-test with mockReturnValue.
vi.mock("@/hooks/usePrayerWidgetScroll", () => ({
  usePrayerWidgetScroll: vi.fn(() => false),
}));

describe("PrayerWidget — pill skeleton", () => {
  beforeEach(() => {
    // Freeze time so countdown is stable
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00")); // Melbourne AEST = 3:19 PM, 23 min before Asr
  });

  it("renders the pill with the next prayer name and time", () => {
    render(<PrayerWidget prayerSettings={null} />);
    expect(screen.getByRole("button", { name: /open prayer times/i })).toBeInTheDocument();
    expect(screen.getByText("Next prayer")).toBeInTheDocument();
    expect(screen.getByText("Asr")).toBeInTheDocument();
    expect(screen.getByText("3:42 PM")).toBeInTheDocument();
  });

  it("shows a countdown to the next prayer", () => {
    render(<PrayerWidget prayerSettings={null} />);
    // Asr is at 3:42 PM, current time is 3:19 PM → 23 minutes
    expect(screen.getByText(/in 23 min/i)).toBeInTheDocument();
  });

  it("widget content is not visible by default", () => {
    render(<PrayerWidget prayerSettings={null} />);
    // The expanded widget's title "Prayer Times" should be hidden (aria-hidden or display:none)
    const dialog = screen.queryByRole("dialog");
    expect(dialog).not.toBeInTheDocument();
  });
});
