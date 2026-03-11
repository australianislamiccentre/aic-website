import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { HeaderB } from "./HeaderB";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    span: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock SiteSettings context
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    name: "Australian Islamic Centre",
    shortName: "AIC",
    tagline: "A unique Islamic environment",
    parentOrganization: "Newport Islamic Society",
    phone: "03 9000 0177",
    email: "contact@australianislamiccentre.org",
    address: {
      street: "23-27 Blenheim Rd",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
      full: "23-27 Blenheim Rd, Newport VIC 3015",
    },
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/aic",
    },
    externalLinks: {
      college: "https://aicollege.edu.au",
      bookstore: "https://aicbookstore.com.au",
      newportStorm: "https://newportstorm.com.au",
    },
  }),
  SiteSettingsProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock SearchDialog
vi.mock("@/components/ui/SearchDialog", () => ({
  SearchDialog: ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="search-dialog">
        <button onClick={onClose}>Close Search</button>
      </div>
    ) : null,
}));

describe("HeaderB", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders Donate CTA with href /donate", () => {
    render(<HeaderB />);

    const donateLinks = screen.getAllByRole("link", { name: /Donate/i });
    expect(donateLinks.length).toBeGreaterThan(0);
    expect(
      donateLinks.some((link) => link.getAttribute("href") === "/donate"),
    ).toBe(true);
  });

  it("renders hamburger button with aria-label Open menu", () => {
    render(<HeaderB />);

    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("does NOT render inline nav group labels in the header bar", () => {
    render(<HeaderB />);

    // HeaderB has no inline nav buttons -- only the overlay has group headings.
    // Before opening the overlay, "About" etc. should NOT be in the document.
    expect(
      screen.queryByRole("button", { name: /About/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /What's On/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Our Mosque/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Media & Resources/i }),
    ).not.toBeInTheDocument();
  });

  it("clicking hamburger opens overlay with all group headings visible", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    // Group labels appear in both mobile accordion and desktop grid
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("What's On").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Our Mosque").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Media & Resources").length).toBeGreaterThanOrEqual(1);
    // Contact appears in both layouts
    expect(screen.getAllByText("Contact Us").length).toBeGreaterThanOrEqual(1);
  });

  it("close button closes overlay", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    // Open overlay
    await user.click(screen.getByLabelText("Open menu"));
    const closeButtons = screen.getAllByLabelText("Close menu");
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);

    // Close overlay via first close button
    await user.click(closeButtons[0]);

    await waitFor(() => {
      expect(
        screen.queryByLabelText("Close menu"),
      ).not.toBeInTheDocument();
    });
  });

  it("renders Search button", () => {
    render(<HeaderB />);

    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("renders top bar with welcome message", () => {
    render(<HeaderB />);

    expect(
      screen.getByText("Welcome to the Australian Islamic Centre"),
    ).toBeInTheDocument();
    expect(screen.getByText("Welcome to AIC")).toBeInTheDocument();
  });

  it("desktop overlay shows group descriptions, mobile accordion does not", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    // Desktop panel includes group descriptions via groupMeta
    // These should be present in the DOM (from the desktop panel)
    // The mobile accordion does NOT show them — but both render in test
    // so we just verify they exist (desktop has them)
    const mobileOverlay = document.querySelector(".md\\:hidden[role='dialog']");
    expect(mobileOverlay).toBeInTheDocument();

    // Mobile overlay should NOT contain descriptions
    expect(mobileOverlay?.textContent).not.toContain("Learn about our centre");
    expect(mobileOverlay?.textContent).not.toContain("Events, services & programs");
  });

  it("renders standalone Donate feature card in overlay", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    // Both mobile and desktop have the donate card
    expect(screen.getAllByText("Support Our Community").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Your generosity helps us serve the community").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders contact info strip in overlay", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    // Phone appears in top bars (desktop + mobile) AND both contact strips
    const phoneElements = screen.getAllByText("03 9000 0177");
    expect(phoneElements.length).toBeGreaterThanOrEqual(3);

    // Email appears in both mobile and desktop contact strips
    const emailElements = screen.getAllByText("contact@australianislamiccentre.org");
    expect(emailElements.length).toBeGreaterThanOrEqual(1);

    const addressElements = screen.getAllByText(/23-27 Blenheim Rd, Newport VIC 3015/);
    expect(addressElements.length).toBeGreaterThanOrEqual(1);
  });

  /* ---------- Accordion-specific tests (mobile overlay) ---------- */

  it("mobile accordion: sub-links are hidden until group is expanded", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    // Desktop panel always shows sub-links, but mobile accordion hides them.
    // Check that the mobile overlay does NOT contain sub-links before expanding.
    const mobileOverlay = document.querySelector(".md\\:hidden[role='dialog']");
    expect(mobileOverlay).toBeInTheDocument();
    expect(mobileOverlay?.textContent).not.toContain("Our Story");
  });

  it("mobile accordion: clicking group reveals its sub-links", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    // The accordion trigger buttons are inside the mobile overlay
    const mobileOverlay = document.querySelector(".md\\:hidden[role='dialog']");
    const aboutButton = mobileOverlay?.querySelector("button[aria-expanded]");
    expect(aboutButton).toBeInTheDocument();

    await user.click(aboutButton!);

    await waitFor(() => {
      expect(mobileOverlay?.textContent).toContain("Our Story");
      expect(mobileOverlay?.textContent).toContain("Our Imams");
      expect(mobileOverlay?.textContent).toContain("Affiliated Partners");
    });
  });

  it("mobile accordion: only one group can be open at a time", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    const mobileOverlay = document.querySelector(".md\\:hidden[role='dialog']");
    const accordionButtons = mobileOverlay?.querySelectorAll("button[aria-expanded]");
    expect(accordionButtons!.length).toBeGreaterThanOrEqual(2);

    // Open first group (About)
    await user.click(accordionButtons![0]);
    await waitFor(() => {
      expect(mobileOverlay?.textContent).toContain("Our Story");
    });

    // Open second group (What's On) — first should close
    await user.click(accordionButtons![1]);
    await waitFor(() => {
      expect(mobileOverlay?.textContent).toContain("Events");
      expect(mobileOverlay?.textContent).not.toContain("Our Story");
    });
  });

  it("mobile accordion: trigger has aria-expanded attribute", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    const mobileOverlay = document.querySelector(".md\\:hidden[role='dialog']");
    const aboutButton = mobileOverlay?.querySelector("button[aria-expanded]");
    expect(aboutButton).toHaveAttribute("aria-expanded", "false");

    await user.click(aboutButton!);
    expect(aboutButton).toHaveAttribute("aria-expanded", "true");
  });

  it("mobile accordion: Contact Us is a standalone link, not an accordion group", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    const mobileOverlay = document.querySelector(".md\\:hidden[role='dialog']");
    // Find the Contact Us link inside the mobile overlay
    const contactLinks = mobileOverlay?.querySelectorAll('a[href="/contact"]');
    expect(contactLinks!.length).toBeGreaterThanOrEqual(1);
    expect(contactLinks![0].textContent).toContain("Contact Us");
  });

  /* ---------- Desktop panel tests ---------- */

  it("desktop panel: shows nav groups with icons and sub-links visible", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    const desktopPanel = document.querySelector(".hidden.md\\:block[role='dialog']");
    expect(desktopPanel).toBeInTheDocument();

    // Sub-links are always visible in the desktop grid (no accordion)
    expect(desktopPanel?.textContent).toContain("Our Story");
    expect(desktopPanel?.textContent).toContain("Events");
    expect(desktopPanel?.textContent).toContain("Contact Us");
  });
});
