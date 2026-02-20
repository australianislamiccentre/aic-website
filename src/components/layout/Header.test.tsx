import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { Header } from "./Header";

// Mock the SiteSettings context
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
  SiteSettingsProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock SearchDialog
vi.mock("@/components/ui/SearchDialog", () => ({
  SearchDialog: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="search-dialog">
        <button onClick={onClose}>Close Search</button>
      </div>
    ) : null,
}));

describe("Header", () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header element", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the AIC logo", () => {
    render(<Header />);
    const logos = screen.getAllByAltText("Australian Islamic Centre");
    expect(logos.length).toBeGreaterThan(0);
  });

  it("renders main navigation links", () => {
    render(<Header />);

    // Navigation structure: About, Services, Programs, Contact
    const aboutLinks = screen.getAllByText(/About/i);
    const servicesLinks = screen.getAllByText(/Services/i);
    const contactLinks = screen.getAllByText(/Contact/i);

    expect(aboutLinks.length).toBeGreaterThan(0);
    expect(servicesLinks.length).toBeGreaterThan(0);
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it("renders donate link", () => {
    render(<Header />);
    const donateLink = screen.getByRole("link", { name: /Donate/i });
    expect(donateLink).toBeInTheDocument();
    expect(donateLink).toHaveAttribute("href", "/donate");
  });

  it("renders search button", () => {
    render(<Header />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("opens search dialog when search button is clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const searchButton = screen.getByLabelText("Search");
    await user.click(searchButton);

    expect(screen.getByTestId("search-dialog")).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    render(<Header />);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("opens mobile menu when hamburger button is clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByLabelText("Open menu");
    await user.click(menuButton);

    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });

  it("closes mobile menu when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open menu
    await user.click(screen.getByLabelText("Open menu"));
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

    // Close menu
    await user.click(screen.getByLabelText("Close menu"));

    await waitFor(() => {
      expect(screen.queryByLabelText("Close menu")).not.toBeInTheDocument();
    });
  });

  it("shows navigation items in mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByLabelText("Open menu"));

    // Check that navigation items are visible
    expect(screen.getAllByText(/About/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Services/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Contact/i).length).toBeGreaterThan(0);
  });

  it("expands submenu in mobile menu when clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open mobile menu
    await user.click(screen.getByLabelText("Open menu"));

    // Click on expandable menu item (Services has categories)
    const servicesButton = screen.getByRole("button", { name: /Services/i });
    await user.click(servicesButton);

    // Check that category items are visible
    await waitFor(() => {
      expect(screen.getByText("Prayer Times")).toBeInTheDocument();
    });
  });

  it("renders mobile donate button in menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByLabelText("Open menu"));

    const donateLinks = screen.getAllByRole("link", { name: /Donate/i });
    expect(donateLinks.length).toBeGreaterThanOrEqual(1);
    expect(donateLinks.some((link) => link.getAttribute("href") === "/donate")).toBe(true);
  });

  it("shows contact info in mobile menu footer", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByLabelText("Open menu"));

    // Phone and location are shown in mobile menu (may have multiple instances)
    expect(screen.getAllByText("(03) 9391 9303").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Newport").length).toBeGreaterThan(0);
  });

  it("has navigation links with correct hrefs", async () => {
    render(<Header />);

    // Verify Contact link exists with correct href
    const contactLinks = screen.getAllByRole("link", { name: /Contact/i });
    const contactLinkWithHref = contactLinks.find(
      (link: HTMLElement) => link.getAttribute("href") === "/contact"
    );
    expect(contactLinkWithHref).toBeTruthy();
  });

  it("renders top bar with welcome message and location on desktop", () => {
    render(<Header />);

    // Top bar content (visible on lg screens)
    expect(screen.getByText(/Welcome to the Australian Islamic Centre/)).toBeInTheDocument();
    expect(screen.getByText(/Newport, VIC/)).toBeInTheDocument();
  });

  it("renders phone number in top bar", () => {
    render(<Header />);

    const phoneLinks = screen.getAllByText("(03) 9391 9303");
    expect(phoneLinks.length).toBeGreaterThan(0);
  });

  it("donate button links to /donate page", () => {
    render(<Header />);

    const donateLink = screen.getByRole("link", { name: /Donate/i });
    expect(donateLink).toHaveAttribute("href", "/donate");
  });
});
