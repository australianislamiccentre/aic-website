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

      expect(screen.getByText("Support Our")).toBeInTheDocument();
      expect(screen.getByText("Mission")).toBeInTheDocument();
    });

    it("renders hero section description", () => {
      render(<DonateContent campaigns={[]} />);

      expect(
        screen.getByText(/Your generosity helps us maintain our centre/)
      ).toBeInTheDocument();
    });

    it("displays badge indicators", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.getByText("Make a Difference")).toBeInTheDocument();
      expect(screen.getByText("Secure Payment")).toBeInTheDocument();
      // "Tax Deductible" appears twice (hero badge and benefits section)
      const taxDeductibleElements = screen.getAllByText("Tax Deductible");
      expect(taxDeductibleElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("100% Goes to Cause")).toBeInTheDocument();
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
      expect(goalMeterDiv).toHaveClass("mb-4");
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
      expect(
        screen.getByText("Choose a campaign to support and make an impact today.")
      ).toBeInTheDocument();
    });

    it("does not render campaigns section when no campaigns", () => {
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

  describe("Why Donate Section", () => {
    it("renders why donate section", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.getByText("Why Donate With Us?")).toBeInTheDocument();
    });

    it("renders all benefit items", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.getByText("100% Secure")).toBeInTheDocument();
      // Note: "Tax Deductible" appears twice (hero and section)
      expect(screen.getAllByText("Tax Deductible").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Direct Impact")).toBeInTheDocument();
      expect(screen.getByText("Flexible Options")).toBeInTheDocument();
    });

    it("renders benefit descriptions", () => {
      render(<DonateContent campaigns={[]} />);

      expect(
        screen.getByText("All payments are processed securely")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Receive a tax receipt for your donation")
      ).toBeInTheDocument();
      expect(
        screen.getByText("100% of your donation goes to the cause")
      ).toBeInTheDocument();
      expect(
        screen.getByText("One-time or recurring donations available")
      ).toBeInTheDocument();
    });
  });

  describe("Other Ways to Give Section", () => {
    it("renders other ways to give section", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.getByText("Other Ways to Give")).toBeInTheDocument();
    });

    it("renders all giving methods", () => {
      render(<DonateContent campaigns={[]} />);

      expect(screen.getByText("Bank Transfer")).toBeInTheDocument();
      expect(screen.getByText("In-Person")).toBeInTheDocument();
      expect(screen.getByText("Legacy Giving")).toBeInTheDocument();
    });

    it("renders method descriptions", () => {
      render(<DonateContent campaigns={[]} />);

      expect(
        screen.getByText("Make a direct bank transfer to our account.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Visit our centre and make a donation in person.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Include the centre in your will for lasting impact.")
      ).toBeInTheDocument();
    });

    it("renders method details", () => {
      render(<DonateContent campaigns={[]} />);

      expect(
        screen.getByText("BSB: 000-000 | Account: 12345678")
      ).toBeInTheDocument();
      expect(
        screen.getByText("23-27 Blenheim Rd, Newport VIC 3015")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Contact us for more information")
      ).toBeInTheDocument();
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

      // Page should still render other sections
      expect(screen.getByText("Support Our")).toBeInTheDocument();
      expect(screen.getByText("Why Donate With Us?")).toBeInTheDocument();
      expect(screen.getByText("Other Ways to Give")).toBeInTheDocument();
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
      // So "Second Featured" won't be rendered at all
      expect(screen.queryByText("Second Featured")).not.toBeInTheDocument();
    });
  });
});
