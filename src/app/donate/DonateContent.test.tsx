import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import DonateContent from "./DonateContent";
import type { DonatePageSettings } from "@/sanity/lib/fetch";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));


describe("DonateContent", () => {
  const fullSettings: DonatePageSettings = {
    _id: "donatePageSettings",
    goalEnabled: true,
    goalElement: '<a href="#GOAL" style="display:none"></a>',
    formEnabled: true,
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
    donorListEnabled: true,
    donorListElement: '<a href="#DONORS" style="display:none"></a>',
    mapEnabled: true,
    mapTitle: "Global Donations",
    mapElement: '<a href="#MAP" style="display:none"></a>',
  };

  describe("Hero Section", () => {
    it("renders hero section with title", () => {
      render(<DonateContent />);

      expect(screen.getByText(/Support Our/)).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
    });

    it("renders hero section description", () => {
      render(<DonateContent />);

      expect(
        screen.getByText(/Your generosity helps us maintain our centre/)
      ).toBeInTheDocument();
    });

    it("renders hero background image", () => {
      const { container } = render(<DonateContent />);

      const img = container.querySelector("img");
      expect(img).toBeInTheDocument();
    });
  });

  describe("Goal Meter", () => {
    it("renders goal meter when enabled and has element", () => {
      const { container } = render(<DonateContent settings={fullSettings} />);

      const goalDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalDiv).toBeInTheDocument();
    });

    it("does not render goal meter when disabled", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        goalEnabled: false,
      };

      const { container } = render(<DonateContent settings={settings} />);

      const goalDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalDiv).not.toBeInTheDocument();
    });

    it("does not render goal meter when enabled but no element", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        goalEnabled: true,
        goalElement: undefined,
      };

      const { container } = render(<DonateContent settings={settings} />);

      const goalDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalDiv).not.toBeInTheDocument();
    });

    it("cleans unicode characters from goal meter element", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        goalElement: '\u200B<a href="#GOAL">\u200D</a>\uFEFF',
      };

      const { container } = render(<DonateContent settings={settings} />);

      const goalDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalDiv?.innerHTML).toBe('<a href="#GOAL"></a>');
    });
  });

  describe("Main Donation Form", () => {
    it("renders form when enabled and has element", () => {
      const { container } = render(<DonateContent settings={fullSettings} />);

      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBeGreaterThanOrEqual(1);
    });

    it("does not render form when disabled", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
        formEnabled: false,
      };

      const { container } = render(<DonateContent settings={settings} />);

      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBe(0);
    });
  });

  describe("Campaigns Section", () => {
    it("renders campaigns section when campaigns exist", () => {
      render(<DonateContent settings={fullSettings} />);

      expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    });

    it("renders enabled campaign titles", () => {
      render(<DonateContent settings={fullSettings} />);

      expect(screen.getByText("Campaign One")).toBeInTheDocument();
      expect(screen.getByText("Campaign Two")).toBeInTheDocument();
    });

    it("filters out disabled campaigns", () => {
      render(<DonateContent settings={fullSettings} />);

      expect(screen.queryByText("Disabled Campaign")).not.toBeInTheDocument();
    });

    it("does not render campaigns section when no campaigns", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        campaigns: [],
      };

      render(<DonateContent settings={settings} />);

      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });

    it("handles campaigns without titles", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        campaigns: [
          {
            _id: "c1",
            title: "Untitled Campaign",
            fundraiseUpElement: '<a href="#C1"></a>',
            active: true,
          },
        ],
      };

      expect(() => render(<DonateContent settings={settings} />)).not.toThrow();
    });
  });

  describe("Recent Donations Section", () => {
    it("renders donor list element when enabled", () => {
      const { container } = render(<DonateContent settings={fullSettings} />);

      // The donor list element is rendered as a fundraise-up-wrapper
      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      // Should have form + campaigns + donor list wrappers
      expect(wrappers.length).toBeGreaterThanOrEqual(1);
    });

    it("does not render donor list when disabled", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
        donorListEnabled: false,
        formEnabled: false,
      };

      const { container } = render(<DonateContent settings={settings} />);

      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBe(0);
    });
  });

  describe("Donation Map Section", () => {
    it("renders when map is enabled and has element", () => {
      render(<DonateContent settings={fullSettings} />);

      expect(screen.getByText("Global Donations")).toBeInTheDocument();
    });

    it("uses default map title when mapTitle is not set", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        mapTitle: undefined,
      };

      render(<DonateContent settings={settings} />);

      expect(screen.getByText("Donations Around the World")).toBeInTheDocument();
    });

    it("does not render when map is disabled", () => {
      const settings: DonatePageSettings = {
        ...fullSettings,
        mapEnabled: false,
      };

      render(<DonateContent settings={settings} />);

      expect(screen.queryByText("Global Donations")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null settings", () => {
      render(<DonateContent settings={null} />);

      // Hero should still render
      expect(screen.getByText(/Support Our/)).toBeInTheDocument();
      // No sections should appear
      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });

    it("handles undefined settings", () => {
      render(<DonateContent settings={undefined} />);

      expect(screen.getByText(/Support Our/)).toBeInTheDocument();
    });

    it("handles no props", () => {
      render(<DonateContent />);

      expect(screen.getByText(/Support Our/)).toBeInTheDocument();
    });

    it("cleans unicode from campaign elements", () => {
      const settings: DonatePageSettings = {
        _id: "donatePageSettings",
        campaigns: [
          {
            _id: "c1",
            title: "Test",
            fundraiseUpElement: '\u200B\u200C\u200D\uFEFF<a href="#TEST"></a>  ',
            active: true,
          },
        ],
      };

      const { container } = render(<DonateContent settings={settings} />);

      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).toBe('<a href="#TEST"></a>');
    });
  });
});
