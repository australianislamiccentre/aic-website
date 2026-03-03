import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { HeaderC } from "./HeaderC";

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
    phone: "(03) 9391 9303",
    email: "contact@aic.org.au",
    address: {
      street: "15 Corporate Crescent",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
      full: "15 Corporate Crescent, Newport VIC 3015",
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

describe("HeaderC", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders What's On and Our Mosque inline in header bar", () => {
    render(<HeaderC />);

    // These two groups are rendered as inline dropdown buttons
    expect(
      screen.getByRole("button", { name: /What's On/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Our Mosque/i }),
    ).toBeInTheDocument();
  });

  it("does NOT render About or Media & Resources as inline buttons", () => {
    render(<HeaderC />);

    // About and Media & Resources are NOT inline nav buttons --
    // they only appear in the side panel or mobile drawer
    expect(
      screen.queryByRole("button", { name: /^About$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Media & Resources$/i }),
    ).not.toBeInTheDocument();
  });

  it("renders hamburger button", () => {
    render(<HeaderC />);

    // Mobile hamburger with aria-label "Open menu"
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    // Desktop side panel hamburger with aria-label "Open navigation panel"
    expect(
      screen.getByLabelText("Open navigation panel"),
    ).toBeInTheDocument();
  });

  it("renders Donate CTA with href /donate", () => {
    render(<HeaderC />);

    const donateLinks = screen.getAllByRole("link", { name: /Donate/i });
    expect(donateLinks.length).toBeGreaterThan(0);
    expect(
      donateLinks.some((link) => link.getAttribute("href") === "/donate"),
    ).toBe(true);
  });

  it("renders Search button", () => {
    render(<HeaderC />);

    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("renders top bar with welcome message", () => {
    render(<HeaderC />);

    expect(
      screen.getByText("Welcome to the Australian Islamic Centre"),
    ).toBeInTheDocument();
    expect(screen.getByText("Welcome to AIC")).toBeInTheDocument();
  });
});
