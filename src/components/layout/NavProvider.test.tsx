import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { NavProvider } from "./NavProvider";

// Control the search params mock
const mockGet = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => "/",
}));

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

describe("NavProvider", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    mockGet.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders HeaderA by default (no nav param)", () => {
    mockGet.mockReturnValue(null);
    render(<NavProvider />);

    // HeaderA renders inline "About" button (unique to HeaderA)
    expect(
      screen.getByRole("button", { name: /About/i }),
    ).toBeInTheDocument();
    // Also has all four inline group buttons
    expect(
      screen.getByRole("button", { name: /Media & Resources/i }),
    ).toBeInTheDocument();
  });

  it("renders HeaderB when ?nav=b", () => {
    mockGet.mockImplementation((key: string) =>
      key === "nav" ? "b" : null,
    );
    render(<NavProvider />);

    // HeaderB does NOT have inline nav buttons
    expect(
      screen.queryByRole("button", { name: /About/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /What's On/i }),
    ).not.toBeInTheDocument();

    // HeaderB has a hamburger button
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("renders HeaderC when ?nav=c", () => {
    mockGet.mockImplementation((key: string) =>
      key === "nav" ? "c" : null,
    );
    render(<NavProvider />);

    // HeaderC renders "What's On" inline but NOT "About" inline
    expect(
      screen.getByRole("button", { name: /What's On/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^About$/i }),
    ).not.toBeInTheDocument();
  });

  it("falls back to HeaderA for invalid nav param", () => {
    mockGet.mockImplementation((key: string) =>
      key === "nav" ? "z" : null,
    );
    render(<NavProvider />);

    // HeaderA has inline "About" button
    expect(
      screen.getByRole("button", { name: /About/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Media & Resources/i }),
    ).toBeInTheDocument();
  });
});
