import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { render, screen } from "@/test/test-utils";
import { PrayerWidget } from "./PrayerWidget";
import { getPrayerTimesForDate } from "@/lib/prayer-times";

// Override the default next/navigation mock so we can vary pathname per test
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  usePathname: vi.fn(() => "/"),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the prayer hooks
vi.mock("@/hooks/usePrayerTimes", async () => {
  const real = await vi.importActual<typeof import("@/lib/prayer-times")>(
    "@/lib/prayer-times"
  );
  return {
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
    usePrayerInIqamahWindow: () => real.getPrayerInIqamahWindow(new Date()),
  };
});

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
    // "Asr" and "3:42 PM" appear in both the pill and the always-rendered (hidden) widget
    expect(screen.getAllByText("Asr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3:42 PM").length).toBeGreaterThan(0);
  });

  it("widget content is not visible by default", () => {
    render(<PrayerWidget prayerSettings={null} />);
    // The expanded widget's title "Prayer Times" should be hidden (aria-hidden or display:none)
    const dialog = screen.queryByRole("dialog");
    expect(dialog).not.toBeInTheDocument();
  });
});

describe("PrayerWidget — hydration mismatch regression (Sentry AIC-WEBSITE-1)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("server-rendered HTML does not contain the Date.now()-dependent countdown text", () => {
    // Why: the countdown ("in 23 min") depends on `Date.now()`, which produces
    // different millisecond values on the Vercel server vs the user's browser
    // during hydration. If the SSR output contained that string, React would
    // detect a mismatch and fire the hydration error that Sentry recorded 70+
    // times in 18 hours. Gating the countdown on an `isMounted` flag that only
    // flips inside `useEffect` guarantees SSR and first client render emit the
    // same HTML (no countdown), and the real text appears only post-hydration.
    const html = renderToString(<PrayerWidget prayerSettings={null} />);
    expect(html).not.toMatch(/in \d+\s*min/i);
    expect(html).not.toMatch(/\bin \d+h \d+m\b/i);
  });

  it("server-rendered HTML does contain the deterministic next-prayer name and time", () => {
    // Sanity check — we only want to hide the Date.now()-dependent countdown,
    // NOT the prayer name/time which are deterministic after the getNextPrayer fix.
    const html = renderToString(<PrayerWidget prayerSettings={null} />);
    expect(html).toContain("Asr");
    expect(html).toContain("3:42 PM");
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

  it("renders the next-prayer highlight inline in the list (no hero in normal state)", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    // In normal state the hero is NOT rendered — the list row highlight does the job.
    const hero = document.querySelector('[data-testid="prayer-widget-hero"]');
    expect(hero).toBeNull();
    // "Athan" / "Iqamah" column headers still appear in the list
    expect(screen.getAllByText("Athan").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Iqamah/i).length).toBeGreaterThan(0);
    // 3:42 PM = athan, 3:52 PM = iqamah — appear in both pill (hidden) and widget (visible)
    expect(screen.getAllByText("3:42 PM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3:52 PM").length).toBeGreaterThan(0);
  });

  it("renders Jumu'ah Arabic and English on one row with a divider", () => {
    const settings = {
      jumuahArabicTime: "1:00 PM",
      jumuahEnglishTime: "2:15 PM",
    } as unknown as import("@/types/sanity").SanityPrayerSettings;

    const { container } = render(<PrayerWidget prayerSettings={settings} testOpenInitially />);

    // Single row labelled "Jumu'ah" with both times + language tags
    const jumuahRow = Array.from(container.querySelectorAll("dt")).find(
      (el) => el.textContent === "Jumu'ah"
    ) as HTMLElement | undefined;
    expect(jumuahRow).toBeDefined();

    const dd = jumuahRow!.nextElementSibling as HTMLElement;
    expect(dd.textContent).toContain("Arabic");
    expect(dd.textContent).toContain("1:00 PM");
    expect(dd.textContent).toContain("English");
    expect(dd.textContent).toContain("2:15 PM");
    // Vertical divider between the two times
    expect(dd.querySelector('[aria-hidden="true"]')).not.toBeNull();
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

  it("resets the selected date to today when the widget is closed", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    // Navigate to a different day
    await user.click(screen.getByRole("button", { name: /next day/i }));
    expect(screen.getByTestId("widget-date-label").textContent).toContain("16 April 2026");
    // Close via X button
    await user.click(screen.getByRole("button", { name: /close prayer times/i }));
    // Reopen
    await user.click(screen.getByRole("button", { name: /open prayer times/i }));
    // Should be back to today
    expect(screen.getByTestId("widget-date-label").textContent).toContain("15 April 2026");
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
    // mockReturnValue (not ReturnValueOnce): the component re-renders once after
    // mount when the `isMounted` effect fires (hydration-mismatch fix). We want
    // the scroll hook to consistently return true for every render in this test.
    vi.mocked(usePrayerWidgetScroll).mockReturnValue(true);

    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("data-hidden-by-scroll", "true");

    // Restore the module-level default so subsequent tests aren't affected
    vi.mocked(usePrayerWidgetScroll).mockReturnValue(false);
  });

  it("keeps the pill visible when scroll hook returns false", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("data-hidden-by-scroll", "false");
  });
});

describe("PrayerWidget — grid hierarchy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders athan as the primary (large) time and iqamah as the secondary (small) time", async () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const asrCell = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrCell).not.toBeNull();

    const timeElements = asrCell.querySelectorAll("time");
    expect(timeElements.length).toBe(2);

    const primary = timeElements[0];
    const secondary = timeElements[1];

    expect(primary.textContent).toContain("3:42 PM");
    expect(secondary.textContent).toContain("3:52 PM");

    expect(primary.className).toMatch(/text-xl/);
    expect(secondary.className).toMatch(/text-base/);
  });

  it("renders the secondary iqamah time on a single line (no label)", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const asrCell = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    const [, secondary] = asrCell.querySelectorAll("time");
    expect(secondary.className).toMatch(/whitespace-nowrap/);
    expect(asrCell.textContent).not.toMatch(/Iqamah/);
  });

  it("highlights the 'next' row with a background and a dot indicator", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const asrRow = document.querySelector('[data-prayer="asr"][data-is-next="true"]') as HTMLElement;
    expect(asrRow).not.toBeNull();
    // Whole row gets a subtle white background
    expect(asrRow.className).toMatch(/bg-white/);
    // Row contains a small dot before the prayer name
    expect(asrRow.querySelector(".rounded-full")).not.toBeNull();
  });
});

describe("PrayerWidget — accessibility & edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render on /studio routes", async () => {
    const nav = await import("next/navigation");
    (nav.usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/studio");

    const { container } = render(<PrayerWidget prayerSettings={null} />);
    expect(container).toBeEmptyDOMElement();

    (nav.usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/");
  });

  it("pill is keyboard-focusable and has aria-label", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill).toHaveAttribute("aria-label", "Open prayer times");
    expect(pill.tabIndex).not.toBe(-1);
  });

  it("dialog has role=dialog and aria-modal=true", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Prayer Times");
  });

  it("closing the widget returns focus to the pill", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    pill.focus();
    await user.click(pill);
    await user.click(screen.getByRole("button", { name: /close/i }));
    // After close, the pill should exist again and have focus
    const pillAfter = screen.getByRole("button", { name: /open prayer times/i });
    expect(document.activeElement).toBe(pillAfter);
  });

  it("pulse dot has aria-hidden=true", () => {
    const { container } = render(<PrayerWidget prayerSettings={null} />);
    const pulseRing = container.querySelector(".prayer-widget-pulse-ring");
    expect(pulseRing).toHaveAttribute("aria-hidden", "true");
  });
});

describe("PrayerWidget — Melbourne label", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("prefixes the date label with 'Melbourne · '", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const label = screen.getByTestId("widget-date-label");
    expect(label.textContent).toMatch(/^Melbourne · /);
  });
});

describe("PrayerWidget — iqamah pulse in hero block", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // The mock's `usePrayerInIqamahWindow` delegates to the REAL
  // `getPrayerInIqamahWindow`, so the hero during the window renders the
  // real-schedule Asr values (3:29 PM / 3:39 PM on 2026-04-15) rather than
  // the mocked 3:42/3:52. We derive the expected iqamah at runtime to stay
  // self-consistent with whatever the calculation engine returns.
  it("pulses the iqamah time in the hero when a prayer is inside its iqamah window", async () => {
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const pulsing = document.querySelector(".prayer-widget-iqamah-pulse");
    expect(pulsing).not.toBeNull();
    expect(pulsing!.tagName).toBe("TIME");
    // v2: the pulsing <time> contains "Iqamah in M:SS" (combined phrase), not just the bare iqamah time
    expect(pulsing!.textContent).toMatch(/Iqamah\s+in\s+\d/i);
  });

  it("shows an 'Iqamah' eyebrow label (not 'Next Prayer') during the window", () => {
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toMatch(/Iqamah/);
  });

  it("does not apply the pulse class outside any iqamah window", () => {
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    expect(document.querySelector(".prayer-widget-iqamah-pulse")).toBeNull();
  });
});

describe("PrayerWidget — passed prayers dimmed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks prayers whose iqamah has passed as passed (today)", () => {
    // 9:00 PM Melbourne — past Isha iqamah (real schedule ~7:12 PM), so all
    // prayers today have passed. Fajr/Dhuhr/Asr/Maghrib/Isha cells should
    // be flagged as passed; sunrise does too (its "iqamah" equals its adhan).
    vi.setSystemTime(new Date("2026-04-15T21:00:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const fajrCell = document.querySelector('[data-prayer="fajr"]') as HTMLElement;
    expect(fajrCell.dataset.isPassed).toBe("true");
    expect(fajrCell.className).toMatch(/opacity-40/);
  });

  it("does not mark the 'next' prayer as passed", () => {
    // 3:19 PM — Asr is next. Earlier prayers (Fajr, Sunrise, Dhuhr) should be
    // passed; Asr itself must NOT be passed even if its state flips later.
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const asrCell = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrCell.dataset.isPassed).toBeUndefined();
    const fajrCell = document.querySelector('[data-prayer="fajr"]') as HTMLElement;
    expect(fajrCell.dataset.isPassed).toBe("true");
  });
});

describe("PrayerWidget — hero countdown with seconds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders 'Iqamah in MM:SS' in the hero during the iqamah window", () => {
    // v2: the hero no longer shows a countdown in normal state — countdown only
    // appears inside the iqamah phrase "Iqamah in M:SS" during the iqamah window.
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00")); // inside Asr iqamah window
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    // "Iqamah in M:SS" appears in the hero during the iqamah window
    expect(dialog.textContent).toMatch(/Iqamah\s+in\s+\d{1,2}:\d{2}/i);
  });
});

describe("PrayerWidget — screen reader countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00")); // 23 min to Asr
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a polite live region announcing the next prayer at minute precision", () => {
    const { container } = render(<PrayerWidget prayerSettings={null} />);
    const status = container.querySelector('[role="status"][aria-live="polite"]');
    expect(status).not.toBeNull();
    // At 3:19 PM the next prayer Asr is in 23 minutes — minute precision, no seconds
    expect(status!.textContent).toMatch(/Next prayer Asr at 3:42 PM, in 23 minutes/);
    // No seconds-precision countdown string like "in 23:00" in the SR live region
    expect(status!.textContent).not.toMatch(/in \d+:\d{2}/);
  });
});

describe("PrayerWidget — body scroll lock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
    document.body.style.overflow = "";
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = "";
  });

  it("locks body scroll while the modal is open and restores it on close", () => {
    const { unmount } = render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("does not lock body scroll when the widget is collapsed", () => {
    render(<PrayerWidget prayerSettings={null} />);
    expect(document.body.style.overflow).toBe("");
  });
});

describe("PrayerWidget — pill v2", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00")); // 23 min before Asr
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does NOT render an Upcoming badge on the pill (dropped in v2.1)", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill.textContent).not.toMatch(/UPCOMING/i);
    expect(pill.textContent).not.toMatch(/Next prayer/i);
  });

  it("does not render a countdown on the pill in normal state", () => {
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill.textContent).not.toMatch(/\bin \d+:\d{2}\b/);
    expect(pill.textContent).not.toMatch(/\bin \d+ min\b/);
  });

  it("pulses during an iqamah window", () => {
    // 1 minute after Asr athan on 2026-04-15 — inside the iqamah window
    // (real schedule: Asr adhan 3:29 PM, iqamah 3:39 PM on 2026-04-15).
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} />);
    const pill = screen.getByRole("button", { name: /open prayer times/i });
    expect(pill.className).toMatch(/prayer-widget-pill-pulse/);
  });
});

describe("PrayerWidget — modal header v2", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render a 'Prayer Times' title", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    // No <h2>Prayer Times</h2> in the dialog. The dialog itself still has
    // aria-label="Prayer Times" for SR users — that's fine (accessible name,
    // not visible text). Scope the check to the visible title region.
    const dialog = screen.getByRole("dialog");
    const visibleTitle = dialog.querySelector("h2");
    expect(visibleTitle).toBeNull();
  });

  it("renders the Melbourne date subtitle with data-testid=widget-date-label", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const label = screen.getByTestId("widget-date-label");
    expect(label.textContent).toMatch(/^Melbourne · /);
  });

  it("renders the Today chip with a calendar icon", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const todayButton = screen.getByRole("button", { name: /open date picker/i });
    const svg = todayButton.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(todayButton.textContent).toMatch(/Today/);
  });
});

describe("PrayerWidget — hero v2 (normal state)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00")); // 23 min before Asr
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does NOT render the hero block in normal state", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    // The list row highlight (bg + dot on Asr) carries the next-prayer signal;
    // no separate hero card appears in normal state.
    const hero = document.querySelector('[data-testid="prayer-widget-hero"]');
    expect(hero).toBeNull();
  });

  it("does NOT render a countdown or 'Next Prayer' eyebrow in the hero", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).not.toMatch(/\bin \d+:\d{2}\b/);
    expect(dialog.textContent).not.toMatch(/\bin \d+ min\b/);
    expect(dialog.textContent).not.toMatch(/Next Prayer/);
  });
});

describe("PrayerWidget — hero v2 (iqamah state)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the hero with '<prayer> Iqamah in M:SS' during an iqamah window", () => {
    // 3:30 PM Melbourne — inside the real-schedule Asr iqamah window
    // (adhan 3:29, iqamah 3:39 on 2026-04-15)
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const hero = document.querySelector('[data-testid="prayer-widget-hero"]');
    expect(hero).not.toBeNull();
    // The hero contains the active prayer name (Asr in this scenario)
    expect(hero!.textContent).toMatch(/Asr/i);
    // And the iqamah phrase with countdown, e.g. "Iqamah in 6:23"
    expect(hero!.textContent).toMatch(/Iqamah\s+in\s+\d/i);
  });
});

describe("PrayerWidget — prayer list iqamah-mode transitions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("inside iqamah window: active prayer row has the pulse class, dot animates", () => {
    // 3:30 PM Melbourne — inside real Asr iqamah window on 2026-04-15
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    // Look up the row whose data-prayer attr matches the in-window prayer.
    // On the real schedule for 2026-04-15, the active prayer is Asr.
    const asrRow = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrRow).not.toBeNull();
    expect(asrRow.className).toMatch(/prayer-widget-row-active/);
    // The dot inside the row animates
    const dot = asrRow.querySelector(".prayer-widget-row-dot");
    expect(dot).not.toBeNull();
    // data attribute flips so CSS / tests can observe the state
    expect(asrRow.dataset.isActive).toBe("true");
  });

  it("inside iqamah window: 'next' highlight is suppressed (Maghrib is no longer highlighted)", () => {
    vi.setSystemTime(new Date("2026-04-15T15:30:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const maghribRow = document.querySelector('[data-prayer="maghrib"]') as HTMLElement;
    expect(maghribRow).not.toBeNull();
    // In v2, when another prayer is active, the "next" bg and dot are suppressed.
    expect(maghribRow.className).not.toMatch(/bg-white\/\[0\.08\]/);
    expect(maghribRow.dataset.isNext).toBeUndefined();
  });

  it("outside iqamah window: next prayer is highlighted normally", () => {
    // 3:19 PM — 10 min before real-schedule Asr adhan (3:29 PM)
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const asrRow = document.querySelector('[data-prayer="asr"]') as HTMLElement;
    expect(asrRow).not.toBeNull();
    // No active-row pulse
    expect(asrRow.className).not.toMatch(/prayer-widget-row-active/);
    // But the next-highlight is on (bg, data attr)
    expect(asrRow.dataset.isNext).toBe("true");
  });
});

describe("PrayerWidget — swipe-to-dismiss grab handle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // jsdom doesn't implement setPointerCapture; stub it so the handler doesn't throw
  function patchPointerCapture() {
    const proto = HTMLElement.prototype as unknown as {
      setPointerCapture?: (id: number) => void;
      releasePointerCapture?: (id: number) => void;
    };
    if (typeof proto.setPointerCapture !== "function") {
      proto.setPointerCapture = () => {};
    }
    if (typeof proto.releasePointerCapture !== "function") {
      proto.releasePointerCapture = () => {};
    }
  }

  async function dispatchPointer(target: HTMLElement, type: string, clientY: number) {
    const { act } = await import("react");
    // jsdom lacks PointerEvent constructor in older versions; fall back to Event with props
    const PointerEventCtor = (globalThis as unknown as { PointerEvent?: typeof Event }).PointerEvent;
    const evt = PointerEventCtor
      ? new PointerEventCtor(type, { bubbles: true, clientY, pointerId: 1 } as PointerEventInit)
      : Object.assign(new Event(type, { bubbles: true }), { clientY, pointerId: 1 });
    await act(async () => {
      target.dispatchEvent(evt);
    });
  }

  it("renders a grab handle with the documented testid", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    expect(screen.getByTestId("prayer-widget-grab-handle")).toBeInTheDocument();
  });

  it("dragging the grab handle past the dismiss threshold closes the widget", async () => {
    patchPointerCapture();
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const handle = screen.getByTestId("prayer-widget-grab-handle");
    await dispatchPointer(handle, "pointerdown", 100);
    await dispatchPointer(handle, "pointermove", 250); // 150px down — past 120px threshold
    await dispatchPointer(handle, "pointerup", 250);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("dragging below the threshold snaps back without closing", async () => {
    patchPointerCapture();
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const handle = screen.getByTestId("prayer-widget-grab-handle");
    await dispatchPointer(handle, "pointerdown", 100);
    await dispatchPointer(handle, "pointermove", 180); // 80px down — below 120px threshold
    await dispatchPointer(handle, "pointerup", 180);

    // Modal still open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("upward drag does not close the widget", async () => {
    patchPointerCapture();
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const handle = screen.getByTestId("prayer-widget-grab-handle");
    await dispatchPointer(handle, "pointerdown", 200);
    await dispatchPointer(handle, "pointermove", 50); // -150px (upward)
    await dispatchPointer(handle, "pointerup", 50);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
