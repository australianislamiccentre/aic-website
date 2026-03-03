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

    // The overlay renders group labels as h2 headings
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("What's On")).toBeInTheDocument();
    expect(screen.getByText("Our Mosque")).toBeInTheDocument();
    expect(screen.getByText("Media & Resources")).toBeInTheDocument();
    expect(screen.getByText("Get In Touch")).toBeInTheDocument();
  });

  it("close button closes overlay", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    // Open overlay
    await user.click(screen.getByLabelText("Open menu"));
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

    // Close overlay
    await user.click(screen.getByLabelText("Close menu"));

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

  it("renders standalone Donate feature card in overlay", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    expect(screen.getByText("Support Our Community")).toBeInTheDocument();
    expect(
      screen.getByText("Your generosity helps us serve the community"),
    ).toBeInTheDocument();
  });

  it("renders contact info strip in overlay", async () => {
    const user = userEvent.setup();
    render(<HeaderB />);

    await user.click(screen.getByLabelText("Open menu"));

    // Phone appears in top bars (desktop + mobile) AND the contact strip
    const phoneElements = screen.getAllByText("03 9000 0177");
    expect(phoneElements.length).toBeGreaterThanOrEqual(3);

    expect(
      screen.getByText("contact@australianislamiccentre.org"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/23-27 Blenheim Rd, Newport VIC 3015/),
    ).toBeInTheDocument();
  });
});
