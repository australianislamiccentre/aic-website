import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { EidBanner } from "./EidBanner";
import type { SanityPrayerSettings } from "@/types/sanity";

const TODAY = "2026-05-25";
const PAST_DATE = "2026-04-01";
const FUTURE_DATE_NEAR = "2026-06-06"; // 12 days away
const FUTURE_DATE_FAR = "2026-07-20";  // ~2 months away
const FUTURE_DATE_NEXT_YEAR = "2027-03-20";

function settings(overrides: Partial<SanityPrayerSettings>): SanityPrayerSettings {
  return { _id: "prayerSettings", ...overrides };
}

describe("EidBanner — visibility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Noon Melbourne on TODAY — well away from midnight boundaries.
    vi.setSystemTime(new Date(`${TODAY}T02:00:00.000Z`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when prayerSettings is null", () => {
    const { container } = render(<EidBanner prayerSettings={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when both Eids inactive", () => {
    const { container } = render(
      <EidBanner prayerSettings={settings({ eidFitrActive: false, eidAdhaActive: false })} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when active but date is missing", () => {
    const { container } = render(
      <EidBanner
        prayerSettings={settings({ eidAdhaActive: true, eidAdhaTime: "7:00 AM" })}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when active but date is in the past", () => {
    const { container } = render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: PAST_DATE,
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when active but time is missing", () => {
    const { container } = render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
        })}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when active and date is today", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: TODAY,
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    expect(screen.getByTestId("eid-banner")).toBeInTheDocument();
  });

  it("renders when active and date is in the future", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    expect(screen.getByTestId("eid-banner")).toBeInTheDocument();
  });
});

describe("EidBanner — nearest-Eid selection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${TODAY}T02:00:00.000Z`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the nearest Eid when both are active and upcoming", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidFitrActive: true,
          eidFitrDate: FUTURE_DATE_FAR,
          eidFitrTime: "7:00 AM",
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:30 AM",
        })}
      />
    );
    expect(screen.getByTestId("eid-banner")).toHaveAttribute("data-eid-name", "Eid al-Adha");
  });

  it("skips a past Eid and shows the upcoming one", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidFitrActive: true,
          eidFitrDate: PAST_DATE, // past — skipped
          eidFitrTime: "7:00 AM",
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR, // future — shown
          eidAdhaTime: "7:30 AM",
        })}
      />
    );
    expect(screen.getByTestId("eid-banner")).toHaveAttribute("data-eid-name", "Eid al-Adha");
  });
});

describe("EidBanner — title and subtitle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${TODAY}T02:00:00.000Z`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses 'Eid al-Adha Prayer' as default title", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    expect(screen.getByText("Eid al-Adha Prayer")).toBeInTheDocument();
  });

  it("uses 'Eid al-Fitr Prayer' as default title", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidFitrActive: true,
          eidFitrDate: FUTURE_DATE_NEAR,
          eidFitrTime: "7:00 AM",
        })}
      />
    );
    expect(screen.getByText("Eid al-Fitr Prayer")).toBeInTheDocument();
  });

  it("uses custom title override when provided", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerTitle: "Join us for Eid",
        })}
      />
    );
    expect(screen.getByText("Join us for Eid")).toBeInTheDocument();
    expect(screen.queryByText("Eid al-Adha Prayer")).not.toBeInTheDocument();
  });

  it("auto-formats subtitle with long-form date for desktop", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR, // 2026-06-06 — Saturday
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    // Long-form (desktop): "Saturday 6 June · 7:00 AM"
    expect(screen.getByText("Saturday 6 June · 7:00 AM")).toBeInTheDocument();
  });

  it("auto-formats subtitle with short-form date for mobile", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR, // 2026-06-06 — Saturday
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    // Short-form (mobile): "Sat 6 Jun · 7:00 AM"
    expect(screen.getByText("Sat 6 Jun · 7:00 AM")).toBeInTheDocument();
  });

  it("renders the time in both subtitle variants", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    // "7:00 AM" appears in both the short and long subtitle spans.
    expect(screen.getAllByText(/7:00 AM/)).toHaveLength(2);
  });

  it("includes year in subtitle when Eid is in a different calendar year", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidFitrActive: true,
          eidFitrDate: FUTURE_DATE_NEXT_YEAR, // 2027
          eidFitrTime: "7:30 AM",
        })}
      />
    );
    // Year appears in both subtitle variants.
    expect(screen.getAllByText(/2027/)).toHaveLength(2);
  });

  it("uses custom subtitle override when provided (same string in both variants)", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerSubtitle: "Custom subtitle here",
        })}
      />
    );
    // Override is passed through unchanged for both breakpoints.
    expect(screen.getAllByText("Custom subtitle here")).toHaveLength(2);
  });
});

describe("EidBanner — link / CTA", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${TODAY}T02:00:00.000Z`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hides CTA when linkType is 'none' (or unset)", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
        })}
      />
    );
    expect(screen.queryByTestId("eid-banner-cta")).not.toBeInTheDocument();
  });

  it("renders an internal page link when linkType is 'page'", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerLinkType: "page",
          eidAdhaBannerInternalPage: "/announcements",
        })}
      />
    );
    const cta = screen.getByTestId("eid-banner-cta");
    expect(cta).toHaveAttribute("href", "/announcements");
  });

  it("renders a custom URL link when linkType is 'custom'", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerLinkType: "custom",
          eidAdhaBannerCustomUrl: "https://example.com/eid",
        })}
      />
    );
    const cta = screen.getByTestId("eid-banner-cta");
    expect(cta).toHaveAttribute("href", "https://example.com/eid");
  });

  it("uses 'View details' as default link label", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerLinkType: "page",
          eidAdhaBannerInternalPage: "/announcements",
        })}
      />
    );
    expect(screen.getByTestId("eid-banner-cta")).toHaveTextContent("View details");
  });

  it("uses custom link label override when provided", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerLinkType: "page",
          eidAdhaBannerInternalPage: "/announcements",
          eidAdhaBannerLinkLabel: "Register now",
        })}
      />
    );
    expect(screen.getByTestId("eid-banner-cta")).toHaveTextContent("Register now");
  });

  it("hides CTA when linkType is 'page' but no internal page selected", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerLinkType: "page",
        })}
      />
    );
    expect(screen.queryByTestId("eid-banner-cta")).not.toBeInTheDocument();
  });

  it("hides CTA when linkType is 'custom' but no URL provided", () => {
    render(
      <EidBanner
        prayerSettings={settings({
          eidAdhaActive: true,
          eidAdhaDate: FUTURE_DATE_NEAR,
          eidAdhaTime: "7:00 AM",
          eidAdhaBannerLinkType: "custom",
        })}
      />
    );
    expect(screen.queryByTestId("eid-banner-cta")).not.toBeInTheDocument();
  });
});
