import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import DonateContent from "./DonateContent";
import type { DonatePageSettings, DonatePageImpactStat } from "@/sanity/lib/fetch";

describe("DonateContent", () => {
  const fullSettings: DonatePageSettings = {
    _id: "donatePageSettings",
    heroHeading: "Give Generously",
    heroDescription: "Help us build a better future.",
    formElement: '<a href="#FORM" style="display:none"></a>',
    impactStats: [
      { value: "500+", label: "Families Supported" },
      { value: "20+", label: "Years Serving" },
      { value: "5", label: "Daily Prayers" },
    ] as DonatePageImpactStat[],
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

    it("renders custom hero description", () => {
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

    it("renders Quran ayah in hero", () => {
      render(<DonateContent />);
      expect(screen.getByText(/loan Allah a goodly loan/)).toBeInTheDocument();
    });

    it("renders surah reference", () => {
      render(<DonateContent />);
      expect(screen.getByText("Surah Al-Baqarah 2:245")).toBeInTheDocument();
    });

    it("does not render a hero background image", () => {
      render(<DonateContent />);
      expect(
        screen.queryByAltText("Australian Islamic Centre")
      ).not.toBeInTheDocument();
    });
  });

  describe("Donation Form", () => {
    it("renders form widget when formElement has content", () => {
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

    it("does not render form when settings missing", () => {
      const { container } = render(<DonateContent />);
      expect(
        container.querySelectorAll(".fundraise-up-wrapper")
      ).toHaveLength(0);
    });
  });

  describe("Impact Stats", () => {
    it("renders impact stats from settings", () => {
      render(<DonateContent settings={fullSettings} />);
      expect(screen.getByText("500+")).toBeInTheDocument();
      expect(screen.getByText("Families Supported")).toBeInTheDocument();
      expect(screen.getByText("20+")).toBeInTheDocument();
      expect(screen.getByText("Years Serving")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Daily Prayers")).toBeInTheDocument();
    });

    it("renders fallback stats when impactStats not provided", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
        heroHeading: "Give Generously",
      };
      render(<DonateContent settings={settings} />);
      expect(
        screen.getByTestId("impact-stats-section")
      ).toBeInTheDocument();
    });

    it("renders fallback stats when no settings", () => {
      render(<DonateContent />);
      expect(
        screen.getByTestId("impact-stats-section")
      ).toBeInTheDocument();
    });

    it("impact stats section has data-testid", () => {
      render(<DonateContent settings={fullSettings} />);
      expect(
        document.querySelector('[data-testid="impact-stats-section"]')
      ).toBeTruthy();
    });
  });

  describe("Campaigns Section", () => {
    it("renders campaigns section when active campaigns exist", () => {
      render(<DonateContent settings={fullSettings} />);
      expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
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
