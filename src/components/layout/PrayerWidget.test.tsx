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
    expect(screen.getByText("Next prayer")).toBeInTheDocument();
    // "Asr" and "3:42 PM" appear in both the pill and the always-rendered (hidden) widget
    expect(screen.getAllByText("Asr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3:42 PM").length).toBeGreaterThan(0);
  });

  it("shows a countdown to the next prayer", () => {
    render(<PrayerWidget prayerSettings={null} />);
    // Countdown is now "in MM:SS" — 23 min before Asr renders as "in 23:00"
    expect(screen.getAllByText(/in 23:00/).length).toBeGreaterThan(0);
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

  it("renders the next-prayer highlight card with athan and iqamah", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    expect(screen.getByText("Next Prayer")).toBeInTheDocument();
    // "Athan" appears in both the hero block and the list column header
    expect(screen.getAllByText("Athan").length).toBeGreaterThan(0);
    // "Iqamah" now appears in both the hero block and each grid cell — use getAllByText
    expect(screen.getAllByText("Iqamah").length).toBeGreaterThan(0);
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

    expect(primary.className).toMatch(/text-base/);
    expect(secondary.className).toMatch(/text-sm/);
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
    const expectedIqamah = getPrayerTimesForDate(new Date("2026-04-15T15:30:00+10:00")).asr.iqamah;
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);

    const pulsing = document.querySelector(".prayer-widget-iqamah-pulse");
    expect(pulsing).not.toBeNull();
    expect(pulsing!.tagName).toBe("TIME");
    expect(pulsing!.textContent).toContain(expectedIqamah);
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
    vi.setSystemTime(new Date("2026-04-15T15:19:00+10:00")); // 23 min before Asr
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the hero countdown in MM:SS format when under an hour", () => {
    render(<PrayerWidget prayerSettings={null} testOpenInitially />);
    const dialog = screen.getByRole("dialog");
    // The hero countdown appears as "in M:SS" or "in MM:SS"; at 23 min to Asr
    // (3:42 PM), the initial render is "in 23:00".
    expect(dialog.textContent).toMatch(/in \d{1,2}:\d{2}/);
  });
});
