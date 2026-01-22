import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { Header } from "./Header";

// Mock the aicInfo data
vi.mock("@/data/content", () => ({
  aicInfo: {
    name: "Australian Islamic Centre",
    phone: "(03) 9391 9303",
    address: {
      full: "15 Corporate Crescent, Newport VIC 3015",
      suburb: "Newport",
      state: "VIC",
    },
    externalLinks: {
      college: "https://aicollege.edu.au",
      bookstore: "https://aicbookstore.com.au",
      newportStorm: "https://newportstorm.com.au",
    },
  },
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

    // Navigation links may have icons, use getAllBy and check href
    const homeLinks = screen.getAllByRole("link", { name: /Home/i });
    const aboutLinks = screen.getAllByRole("link", { name: /About/i });
    const contactLinks = screen.getAllByRole("link", { name: /Contact/i });

    expect(homeLinks.length).toBeGreaterThan(0);
    expect(aboutLinks.length).toBeGreaterThan(0);
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it("renders donate button", () => {
    render(<Header />);
    const donateLinks = screen.getAllByRole("link", { name: /Donate/i });
    expect(donateLinks.length).toBeGreaterThan(0);
    expect(donateLinks[0]).toHaveAttribute("href", "/donate");
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

    // Check that navigation items are visible (multiple may exist due to desktop nav)
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("About").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Contact").length).toBeGreaterThan(0);
  });

  it("expands submenu in mobile menu when clicked", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open mobile menu
    await user.click(screen.getByLabelText("Open menu"));

    // Click on expandable menu item (Services has children)
    const servicesButton = screen.getByRole("button", { name: /Services/i });
    await user.click(servicesButton);

    // Check that child items are visible
    await waitFor(() => {
      expect(screen.getByText("Religious Services")).toBeInTheDocument();
    });
  });

  it("renders mobile donate button in menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByLabelText("Open menu"));

    expect(
      screen.getByRole("link", { name: /Make a Donation/i })
    ).toBeInTheDocument();
  });

  it("shows contact info in mobile menu footer", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByLabelText("Open menu"));

    // Phone and location are shown in mobile menu (may have multiple instances)
    expect(screen.getAllByText("(03) 9391 9303").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Newport").length).toBeGreaterThan(0);
  });

  it("has navigation links in mobile menu with correct hrefs", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open mobile menu
    await user.click(screen.getByLabelText("Open menu"));
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

    // Verify About link exists with correct href
    const aboutLinks = screen.getAllByText("About");
    const aboutLinkWithHref = aboutLinks.find(
      (link) => link.closest("a")?.getAttribute("href") === "/about"
    );
    expect(aboutLinkWithHref).toBeTruthy();

    // Verify Contact link exists with correct href
    const contactLinks = screen.getAllByText("Contact");
    const contactLinkWithHref = contactLinks.find(
      (link) => link.closest("a")?.getAttribute("href") === "/contact"
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

  it("has proper link to donate page", () => {
    render(<Header />);

    const donateLinks = screen.getAllByRole("link", { name: /Donate/i });
    const visibleDonateLink = donateLinks.find((link) =>
      link.getAttribute("href") === "/donate"
    );
    expect(visibleDonateLink).toBeTruthy();
  });
});
