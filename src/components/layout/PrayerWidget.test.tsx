import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the pill with the next prayer name and time", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toBeInTheDocument();
    expect(screen.getByText("Next prayer")).toBeInTheDocument();
    // "Asr" and "3:42 PM" appear in both the pill and the always-rendered (hidden) widget
    expect(screen.getAllByText("Asr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3:42 PM").length).toBeGreaterThan(0);
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

describe("PrayerWidget — expanded content (when forced open for layout testing)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all six prayer cards", () => {
    // Use testOpenInitially prop so we don't need to click yet
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    expect(screen.getByText("Fajr")).toBeInTheDocument();
    expect(screen.getByText("Sunrise")).toBeInTheDocument();
    expect(screen.getByText("Dhuhr")).toBeInTheDocument();
    // There may be multiple "Asr" (one in the pill, one in the grid, one in next-prayer card)
    expect(screen.getAllByText("Asr").length).toBeGreaterThan(0);
    expect(screen.getByText("Maghrib")).toBeInTheDocument();
    expect(screen.getByText("Isha")).toBeInTheDocument();
  });

  it("renders the next-prayer highlight card with athan and iqamah", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    expect(screen.getByText("Next Prayer")).toBeInTheDocument();
    expect(screen.getByText("Athan")).toBeInTheDocument();
    expect(screen.getByText("Iqamah")).toBeInTheDocument();
    // 3:42 PM = athan, 3:52 PM = iqamah — appear in both pill (hidden) and widget (visible)
    expect(screen.getAllByText("3:42 PM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3:52 PM").length).toBeGreaterThan(0);
  });

  it("renders Jumu'ah chips from Sanity when provided", () => {
    const settings = {
      jumuahArabicTime: "1:00 PM",
      jumuahEnglishTime: "2:15 PM",
    } as unknown as import("@/types/sanity").SanityPrayerSettings;

    render(<PrayerWidget prayerSettings={settings} testOpenInitially />);
    expect(screen.getByText(/Jumu'ah Arabic/i)).toBeInTheDocument();
    expect(screen.getByText("1:00 PM")).toBeInTheDocument();
    expect(screen.getByText(/Jumu'ah English/i)).toBeInTheDocument();
    expect(screen.getByText("2:15 PM")).toBeInTheDocument();
  });

  it("renders Taraweeh chip only when enabled in Sanity", () => {
    const { rerender } = render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    expect(screen.queryByText(/Taraweeh/i)).not.toBeInTheDocument();

    rerender(
      <PrayerWidget
        prayerSettings={{
          taraweehEnabled: true,
          taraweehTime: "8:30 PM",
        } as unknown as import("@/types/sanity").SanityPrayerSettings}
        testOpenInitially
      />
    );
    expect(screen.getByText(/Taraweeh/i)).toBeInTheDocument();
    expect(screen.getByText("8:30 PM")).toBeInTheDocument();
  });

  it("renders Eid al-Fitr chip only when eidFitrActive is true", () => {
    render(
      <PrayerWidget
        prayerSettings={{
          eidFitrActive: true,
          eidFitrTime: "7:00 AM",
        } as unknown as import("@/types/sanity").SanityPrayerSettings}
        testOpenInitially
      />
    );
    expect(screen.getByText(/Eid al-Fitr/i)).toBeInTheDocument();
    expect(screen.getByText("7:00 AM")).toBeInTheDocument();
  });

  it("highlights the next prayer card visually (has is-next class)", () => {
    const { container } = render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const asrCard = container.querySelector('[data-prayer="asr"]');
    expect(asrCard).toHaveAttribute("data-is-next", "true");
  });
});

describe("PrayerWidget — open/close interactions", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clicking the pill opens the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    await user.click(pill);
    expect(screen.getByRole("dialog", { name: /prayer times/i })).toBeInTheDocument();
  });

  it("clicking the close button closes the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open prayer times/i })).toBeInTheDocument();
  });

  it("clicking the backdrop closes the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const backdrop = screen.getByTestId("prayer-widget-backdrop");
    await user.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("pressing Escape closes the widget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("backdrop is hidden (opacity 0, non-interactive) when widget is closed", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const backdrop = screen.getByTestId("prayer-widget-backdrop");
    expect(backdrop).toHaveStyle({ opacity: "0" });
    expect(backdrop).toHaveStyle({ pointerEvents: "none" });
  });

  it("backdrop becomes interactive when widget is open", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const backdrop = screen.getByTestId("prayer-widget-backdrop");
    expect(backdrop).toHaveStyle({ opacity: "1" });
    expect(backdrop).toHaveStyle({ pointerEvents: "auto" });
  });
});

describe("PrayerWidget — date picker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows today's date in the header", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dateLabel = screen.getByTestId("widget-date-label");
    // Melbourne format: "Wednesday, 15 April 2026"
    expect(dateLabel.textContent).toContain("15 April 2026");
  });

  it("clicking the next-day button shifts to tomorrow", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const nextBtn = screen.getByRole("button", { name: /next day/i });
    await user.click(nextBtn);
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("16 April 2026");
  });

  it("clicking the previous-day button shifts to yesterday", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const prevBtn = screen.getByRole("button", { name: /previous day/i });
    await user.click(prevBtn);
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("14 April 2026");
  });

  it("shows 'Back to today' button when viewing a non-today date, hidden when today", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    expect(screen.queryByRole("button", { name: /back to today/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /next day/i }));
    expect(screen.getByRole("button", { name: /back to today/i })).toBeInTheDocument();
  });

  it("clicking 'Back to today' returns to today's prayer times", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    await user.click(screen.getByRole("button", { name: /next day/i }));
    await user.click(screen.getByRole("button", { name: /back to today/i }));
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("15 April 2026");
  });

  it("hides the next-prayer highlight when viewing a non-today date", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    // Today: Asr card should have data-is-next="true"
    expect(container.querySelector('[data-prayer="asr"]')).toHaveAttribute("data-is-next", "true");
    // Move to tomorrow
    await user.click(screen.getByRole("button", { name: /next day/i }));
    // No prayer should be marked as "next" on a non-today view
    expect(container.querySelectorAll('[data-is-next="true"]').length).toBe(0);
  });

  it("native date input updates the selected date", async () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const input = screen.getByLabelText(/pick a date/i) as HTMLInputElement;
    // Simulate a native date picker change using fireEvent (userEvent doesn't fully support <input type="date">)
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(input, { target: { value: "2026-04-20" } });
    const dateLabel = screen.getByTestId("widget-date-label");
    expect(dateLabel.textContent).toContain("20 April 2026");
  });
});

describe("PrayerWidget — scroll auto-hide", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hides the pill when usePrayerWidgetScroll returns true", async () => {
    const { usePrayerWidgetScroll } = await import("@/hooks/usePrayerWidgetScroll");
    vi.mocked(usePrayerWidgetScroll).mockReturnValueOnce(true);

    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("data-hidden-by-scroll", "true");
  });

  it("keeps the pill visible when scroll hook returns false", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("data-hidden-by-scroll", "false");
  });
});
