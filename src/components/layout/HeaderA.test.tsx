import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { HeaderA } from "./HeaderA";

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

describe("HeaderA", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 5 nav labels: About, What's On, Our Mosque, Media & Resources, Contact", () => {
    render(<HeaderA />);

    // Desktop nav group buttons
    expect(
      screen.getByRole("button", { name: /About/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /What's On/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Our Mosque/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Media & Resources/i }),
    ).toBeInTheDocument();

    // Contact is a flat link, not a button
    const contactLinks = screen.getAllByRole("link", { name: /^Contact$/i });
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it("renders Donate CTA with href /donate", () => {
    render(<HeaderA />);

    const donateLink = screen.getByRole("link", { name: /Donate/i });
    expect(donateLink).toBeInTheDocument();
    expect(donateLink).toHaveAttribute("href", "/donate");
  });

  it("renders Search button with aria-label", () => {
    render(<HeaderA />);

    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("renders mobile hamburger button with aria-label", () => {
    render(<HeaderA />);

    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("opening mobile menu shows all groups", async () => {
    const user = userEvent.setup();
    render(<HeaderA />);

    await user.click(screen.getByLabelText("Open menu"));

    // All four group labels should be visible as accordion triggers in the mobile drawer
    // plus the desktop buttons, so there should be at least 2 of each
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText("What's On").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText("Our Mosque").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText("Media & Resources").length,
    ).toBeGreaterThanOrEqual(2);

    // Close menu button should be present
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });

  it("Contact link has href /contact", () => {
    render(<HeaderA />);

    const contactLinks = screen.getAllByRole("link", { name: /^Contact$/i });
    const contactWithHref = contactLinks.find(
      (link: HTMLElement) => link.getAttribute("href") === "/contact",
    );
    expect(contactWithHref).toBeTruthy();
  });

  it("renders top bar with welcome message", () => {
    render(<HeaderA />);

    expect(
      screen.getByText("Welcome to the Australian Islamic Centre"),
    ).toBeInTheDocument();
    expect(screen.getByText("Welcome to AIC")).toBeInTheDocument();
  });

  it("renders phone number in top bar", () => {
    render(<HeaderA />);

    const phoneTexts = screen.getAllByText("(03) 9391 9303");
    expect(phoneTexts.length).toBeGreaterThan(0);
  });
});
