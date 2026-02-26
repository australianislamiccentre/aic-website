import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import DonateContent from "./DonateContent";
import type { DonatePageSettings } from "@/sanity/lib/fetch";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("DonateContent", () => {
  const fullSettings: DonatePageSettings = {
    _id: "donatePageSettings",
    heroHeading: "Give Generously",
    heroDescription: "Help us build a better future.",
    formElement: '<a href="#FORM" style="display:none"></a>',
    campaigns: [
      {
        _id: "c1",
        title: "Campaign One",
        fundraiseUpElement: '<a href="#C1" style="display:none"></a>',
        active: true,
      },
      {
        _id: "c2",
        title: "Campaign Two",
        fundraiseUpElement: '<a href="#C2" style="display:none"></a>',
        active: true,
      },
      {
        _id: "c3",
        title: "Disabled Campaign",
        fundraiseUpElement: '<a href="#C3" style="display:none"></a>',
        active: false,
      },
    ],
  };

  describe("Hero Section", () => {
    it("renders default hero heading when no settings", () => {
      render(<DonateContent />);
      expect(screen.getByText("Support Our Community")).toBeInTheDocument();
    });

    it("renders custom hero heading from settings", () => {
      render(<DonateContent settings={fullSettings} />);
      expect(screen.getByText("Give Generously")).toBeInTheDocument();
    });

    it("renders custom hero description from settings", () => {
      render(<DonateContent settings={fullSettings} />);
      expect(
        screen.getByText("Help us build a better future.")
      ).toBeInTheDocument();
    });

    it("renders default description when no settings", () => {
      render(<DonateContent />);
      expect(
        screen.getByText(/Your generosity helps us maintain our centre/)
      ).toBeInTheDocument();
    });

    it("renders hero badge", () => {
      render(<DonateContent />);
      expect(screen.getByText("Make a Difference")).toBeInTheDocument();
    });

    it("renders impact list items", () => {
      render(<DonateContent />);
      expect(
        screen.getByText("Educational programs for all ages")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Community services and support")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Maintaining our centre and facilities")
      ).toBeInTheDocument();
    });

    it("renders hero background image", () => {
      render(<DonateContent />);
      const img = screen.getByAltText("Australian Islamic Centre");
      expect(img).toBeInTheDocument();
    });
  });

  describe("Floating Donation Form", () => {
    it("renders the form widget when formElement has content", () => {
      const { container } = render(
        <DonateContent settings={fullSettings} />
      );
      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBeGreaterThanOrEqual(1);
    });

    it("does not render form when formElement is empty", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
      };
      const { container } = render(<DonateContent settings={settings} />);
      expect(
        container.querySelectorAll(".fundraise-up-wrapper")
      ).toHaveLength(0);
    });

    it("renders form for both mobile and desktop viewports", () => {
      const { container } = render(
        <DonateContent settings={fullSettings} />
      );
      // Desktop (hidden on mobile) + mobile (hidden on desktop) = 2 instances
      const formWrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(formWrappers.length).toBeGreaterThanOrEqual(2);
    });

    it("does not wrap form in a card", () => {
      const { container } = render(
        <DonateContent settings={fullSettings} />
      );
      expect(
        container.querySelector(".rounded-2xl.shadow-xl")
      ).not.toBeInTheDocument();
    });

    it("does not render 'Make a Donation' heading", () => {
      render(<DonateContent settings={fullSettings} />);
      expect(screen.queryByText("Make a Donation")).not.toBeInTheDocument();
    });
  });

  describe("Quran Ayah Section", () => {
    it("renders the ayah quote", () => {
      render(<DonateContent />);
      expect(screen.getByText(/loan Allah a goodly loan/)).toBeInTheDocument();
    });

    it("renders the surah reference", () => {
      render(<DonateContent />);
      expect(screen.getByText("Surah Al-Baqarah 2:245")).toBeInTheDocument();
    });
  });

  describe("Campaigns Section", () => {
    it("renders campaigns section when active campaigns exist", () => {
      render(<DonateContent settings={fullSettings} />);
      expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
      expect(
        screen.getByText("Support a specific cause below.")
      ).toBeInTheDocument();
    });

    it("left-aligns campaigns heading on desktop", () => {
      const { container } = render(
        <DonateContent settings={fullSettings} />
      );
      const section = container.querySelector(
        '[data-testid="campaigns-section"]'
      );
      const headingWrapper = section?.querySelector("div > div:first-child");
      // Centred on mobile, left-aligned on desktop
      expect(headingWrapper?.className).toContain("text-center");
      expect(headingWrapper?.className).toContain("lg:text-left");
    });

    it("renders correct number of campaign cards", () => {
      const { container } = render(
        <DonateContent settings={fullSettings} />
      );
      const grid = container.querySelector('[data-testid="campaigns-grid"]');
      expect(grid?.children).toHaveLength(2);
    });

    it("filters out inactive campaigns", () => {
      const { container } = render(
        <DonateContent settings={fullSettings} />
      );
      const wrappers = container.querySelectorAll(
        '[data-testid="campaigns-grid"] .fundraise-up-wrapper'
      );
      expect(wrappers).toHaveLength(2);
    });

    it("does not render campaigns section when no campaigns", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        campaigns: [],
      };
      render(<DonateContent settings={settings} />);
      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });

    it("does not render campaigns section when all inactive", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        campaigns: [
          {
            _id: "c1",
            title: "Inactive",
            fundraiseUpElement: '<a href="#C1"></a>',
            active: false,
          },
        ],
      };
      render(<DonateContent settings={settings} />);
      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });

    it("does not render campaigns without fundraiseUpElement", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        campaigns: [
          {
            _id: "c1",
            title: "No Widget",
            fundraiseUpElement: "",
            active: true,
          },
        ],
      };
      render(<DonateContent settings={settings} />);
      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });
  });

  describe("Responsive Campaign Grid", () => {
    it("uses responsive grid columns", () => {
      const { container } = render(
        <DonateContent settings={fullSettings} />
      );
      const grid = container.querySelector('[data-testid="campaigns-grid"]');
      // Mobile: 1 col, tablet: 2 col, desktop: 3 col, wide: 4 col
      expect(grid?.className).toContain("grid-cols-1");
      expect(grid?.className).toContain("sm:grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-3");
      expect(grid?.className).toContain("xl:grid-cols-4");
    });
  });

  describe("Edge Cases", () => {
    it("handles null settings", () => {
      render(<DonateContent settings={null} />);
      expect(screen.getByText("Support Our Community")).toBeInTheDocument();
      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });

    it("handles undefined settings", () => {
      render(<DonateContent settings={undefined} />);
      expect(screen.getByText("Support Our Community")).toBeInTheDocument();
    });

    it("handles no props", () => {
      render(<DonateContent />);
      expect(screen.getByText("Support Our Community")).toBeInTheDocument();
    });

    it("cleans unicode from campaign elements", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
        campaigns: [
          {
            _id: "c1",
            title: "Test",
            fundraiseUpElement:
              '\u200B\u200C\u200D\uFEFF<a href="#TEST"></a>  ',
            active: true,
          },
        ],
      };
      const { container } = render(<DonateContent settings={settings} />);
      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).toBe('<a href="#TEST"></a>');
    });

    it("sanitises script tags from elements", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
        formElement: '<a href="#FORM"></a><script>alert("xss")</script>',
      };
      const { container } = render(<DonateContent settings={settings} />);
      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).toBe('<a href="#FORM"></a>');
    });

    it("sanitises event handlers from elements", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
        formElement: '<a href="#FORM" onclick="alert(1)"></a>',
      };
      const { container } = render(<DonateContent settings={settings} />);
      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).not.toContain("onclick");
    });
  });
});
