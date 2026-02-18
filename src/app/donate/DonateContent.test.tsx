import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import DonateContent from "./DonateContent";
import type { DonationGoalMeter } from "@/sanity/lib/fetch";

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

// Mock FadeIn components
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

interface Campaign {
  _id: string;
  title: string;
  fundraiseUpElement: string;
  featured: boolean;
}

describe("DonateContent", () => {
  const mockCampaigns: Campaign[] = [
    {
      _id: "campaign-1",
      title: "Featured Campaign",
      fundraiseUpElement: '<a href="#FEATURED" style="display:none"></a>',
      featured: true,
    },
    {
      _id: "campaign-2",
      title: "Additional Campaign 1",
      fundraiseUpElement: '<a href="#ADDITIONAL1" style="display:none"></a>',
      featured: false,
    },
    {
      _id: "campaign-3",
      title: "Additional Campaign 2",
      fundraiseUpElement: '<a href="#ADDITIONAL2" style="display:none"></a>',
      featured: false,
    },
  ];

  const mockGoalMeter: DonationGoalMeter = {
    _id: "goal-1",
    enabled: true,
    fundraiseUpElement: '<a href="#XJAKPSNE" style="display: none"></a>',
  };

  describe("Hero Section", () => {
    it("renders hero section with title", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.getByText("Make a")).toBeInTheDocument();
      expect(screen.getByText("Donation")).toBeInTheDocument();
    });

    it("renders hero section description", () => {
      render(<DonateContent campaigns={[]} />);

      expect(
        screen.getByText(/Your generosity helps us maintain our centre/)
      ).toBeInTheDocument();
    });

    it("displays support badge", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.getByText("Support Our Centre")).toBeInTheDocument();
    });
  });

  describe("Main Donation Form", () => {
    it("renders main donation form when element exists", () => {
      const goalMeterWithForm: DonationGoalMeter = {
        ...mockGoalMeter,
        mainDonationFormElement: '<a href="#MAIN_FORM" style="display:none"></a>',
      };

      const { container } = render(
        <DonateContent campaigns={[]} goalMeter={goalMeterWithForm} />
      );

      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBeGreaterThanOrEqual(1);
    });

    it("does not render main donation form when element is missing", () => {
      const { container } = render(
        <DonateContent campaigns={[]} goalMeter={mockGoalMeter} />
      );

      // Only campaign wrappers would appear, not main form
      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBe(0);
    });
  });

  describe("Goal Meter (Fundraise Up Element)", () => {
    it("renders goal meter when enabled and has element", () => {
      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={mockGoalMeter} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).toBeInTheDocument();
    });

    it("does not render goal meter when disabled", () => {
      const disabledGoalMeter: DonationGoalMeter = {
        _id: "goal-1",
        enabled: false,
        fundraiseUpElement: '<a href="#XJAKPSNE" style="display: none"></a>',
      };

      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={disabledGoalMeter} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("does not render goal meter when enabled but no element", () => {
      const noElementGoalMeter: DonationGoalMeter = {
        _id: "goal-1",
        enabled: true,
        fundraiseUpElement: undefined,
      };

      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={noElementGoalMeter} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("does not render goal meter when enabled but empty string element", () => {
      const emptyElementGoalMeter: DonationGoalMeter = {
        _id: "goal-1",
        enabled: true,
        fundraiseUpElement: "",
      };

      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={emptyElementGoalMeter} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("does not render goal meter when goalMeter is null", () => {
      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={null} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("does not render goal meter when goalMeter is undefined", () => {
      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={undefined} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("applies correct styling classes to goal meter", () => {
      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={mockGoalMeter} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).toHaveClass("max-w-lg");
      expect(goalMeterDiv).toHaveClass("mx-auto");
    });

    it("cleans unicode characters from goal meter element", () => {
      const goalMeterWithUnicode: DonationGoalMeter = {
        _id: "goal-1",
        enabled: true,
        fundraiseUpElement: '\u200B<a href="#TEST">\u200D</a>\uFEFF',
      };

      const { container } = render(
        <DonateContent campaigns={mockCampaigns} goalMeter={goalMeterWithUnicode} />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv?.innerHTML).toBe('<a href="#TEST"></a>');
    });
  });

  describe("Campaigns Section", () => {
    it("renders campaigns section when campaigns exist", () => {
      render(<DonateContent campaigns={mockCampaigns} />);

      expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    });

    it("does not render campaigns section when no campaigns and no goal meter", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });

    it("renders featured campaign title", () => {
      render(<DonateContent campaigns={mockCampaigns} />);

      expect(screen.getByText("Featured Campaign")).toBeInTheDocument();
    });

    it("renders featured campaign Fundraise Up element", () => {
      const { container } = render(<DonateContent campaigns={mockCampaigns} />);

      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBeGreaterThanOrEqual(1);
    });

    it("renders additional campaigns", () => {
      render(<DonateContent campaigns={mockCampaigns} />);

      expect(screen.getByText("Additional Campaign 1")).toBeInTheDocument();
      expect(screen.getByText("Additional Campaign 2")).toBeInTheDocument();
    });

    it("handles only featured campaign (no additional)", () => {
      const featuredOnly = [mockCampaigns[0]];
      render(<DonateContent campaigns={featuredOnly} />);

      expect(screen.getByText("Featured Campaign")).toBeInTheDocument();
      expect(screen.queryByText("Additional Campaign 1")).not.toBeInTheDocument();
    });

    it("handles only additional campaigns (no featured)", () => {
      const additionalOnly = mockCampaigns.filter((c) => !c.featured);
      render(<DonateContent campaigns={additionalOnly} />);

      expect(screen.queryByText("Featured Campaign")).not.toBeInTheDocument();
      expect(screen.getByText("Additional Campaign 1")).toBeInTheDocument();
      expect(screen.getByText("Additional Campaign 2")).toBeInTheDocument();
    });
  });

  describe("Recent Donations Section", () => {
    it("renders when recentDonationsElement exists", () => {
      const goalMeterWithRecent: DonationGoalMeter = {
        ...mockGoalMeter,
        recentDonationsElement: '<a href="#RECENT" style="display:none"></a>',
      };

      render(<DonateContent campaigns={[]} goalMeter={goalMeterWithRecent} />);

      expect(screen.getByText("Recent Donations")).toBeInTheDocument();
    });

    it("does not render when recentDonationsElement is missing", () => {
      render(<DonateContent campaigns={[]} goalMeter={mockGoalMeter} />);

      expect(screen.queryByText("Recent Donations")).not.toBeInTheDocument();
    });
  });

  describe("Donation Map Section", () => {
    it("renders when donationMapElement exists", () => {
      const goalMeterWithMap: DonationGoalMeter = {
        ...mockGoalMeter,
        donationMapElement: '<a href="#MAP" style="display:none"></a>',
      };

      render(<DonateContent campaigns={[]} goalMeter={goalMeterWithMap} />);

      expect(screen.getByText("Donations Around the World")).toBeInTheDocument();
    });

    it("does not render when donationMapElement is missing", () => {
      render(<DonateContent campaigns={[]} goalMeter={mockGoalMeter} />);

      expect(screen.queryByText("Donations Around the World")).not.toBeInTheDocument();
    });
  });

  describe("Unicode Cleaning", () => {
    it("cleans unicode from campaign elements", () => {
      const campaignsWithUnicode: Campaign[] = [
        {
          _id: "test-1",
          title: "Test Campaign",
          fundraiseUpElement: '\u200B\u200C\u200D\uFEFF<a href="#TEST"></a>  ',
          featured: true,
        },
      ];

      const { container } = render(
        <DonateContent campaigns={campaignsWithUnicode} />
      );

      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).toBe('<a href="#TEST"></a>');
    });
  });

  describe("Edge Cases", () => {
    it("handles empty campaigns array", () => {
      render(<DonateContent campaigns={[]} />);

      // Hero should still render
      expect(screen.getByText("Make a")).toBeInTheDocument();
      // Removed sections should not appear
      expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
    });

    it("handles campaigns with missing titles", () => {
      const campaignNoTitle: Campaign[] = [
        {
          _id: "test-1",
          title: "",
          fundraiseUpElement: '<a href="#TEST"></a>',
          featured: true,
        },
      ];

      // Should not throw
      expect(() =>
        render(<DonateContent campaigns={campaignNoTitle} />)
      ).not.toThrow();
    });

    it("handles campaigns with special characters in title", () => {
      const campaignSpecialChars: Campaign[] = [
        {
          _id: "test-1",
          title: "Campaign with <script> & special \"chars\"",
          fundraiseUpElement: '<a href="#TEST"></a>',
          featured: true,
        },
      ];

      render(<DonateContent campaigns={campaignSpecialChars} />);

      // React should escape the special characters
      expect(
        screen.getByText('Campaign with <script> & special "chars"')
      ).toBeInTheDocument();
    });

    it("handles multiple featured campaigns (takes first)", () => {
      const multipleFeatured: Campaign[] = [
        {
          _id: "test-1",
          title: "First Featured",
          fundraiseUpElement: '<a href="#TEST1"></a>',
          featured: true,
        },
        {
          _id: "test-2",
          title: "Second Featured",
          fundraiseUpElement: '<a href="#TEST2"></a>',
          featured: true,
        },
      ];

      render(<DonateContent campaigns={multipleFeatured} />);

      // find() returns the first match
      expect(screen.getByText("First Featured")).toBeInTheDocument();
      // Second one is excluded from additionalCampaigns because filter(c => !c.featured)
      expect(screen.queryByText("Second Featured")).not.toBeInTheDocument();
    });
  });
});
