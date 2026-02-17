import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { DonateModal } from "./DonateModal";
import type { ModalCampaign, DonationGoalMeter } from "@/sanity/lib/fetch";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe("DonateModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  const mockFeaturedCampaign: ModalCampaign = {
    _id: "campaign-1",
    title: "Ramadan Appeal 2025",
    fundraiseUpElement: '<a href="#DONATE1" style="display:none"></a>',
  };

  const mockAdditionalCampaigns: ModalCampaign[] = [
    {
      _id: "campaign-2",
      title: "Building Fund",
      fundraiseUpElement: '<a href="#DONATE2" style="display:none"></a>',
    },
    {
      _id: "campaign-3",
      title: "Education Program",
      fundraiseUpElement: '<a href="#DONATE3" style="display:none"></a>',
    },
  ];

  const mockGoalMeter: DonationGoalMeter = {
    _id: "goal-1",
    enabled: true,
    fundraiseUpElement: '<a href="#XJAKPSNE" style="display: none"></a>',
  };

  describe("Modal Visibility", () => {
    it("renders nothing when isOpen is false", () => {
      const { container } = render(
        <DonateModal isOpen={false} onClose={mockOnClose} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("renders modal content when isOpen is true", () => {
      render(<DonateModal isOpen={true} onClose={mockOnClose} />);

      // Modal renders with title
      expect(screen.getByText("Support Our Centre")).toBeInTheDocument();
    });
  });

  describe("Modal Title", () => {
    it("displays default title when modalTitle is not provided", () => {
      render(<DonateModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Support Our Centre")).toBeInTheDocument();
    });

    it("displays custom title when modalTitle is provided", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          modalTitle="Donate to Our Cause"
        />
      );

      expect(screen.getByText("Donate to Our Cause")).toBeInTheDocument();
    });

    it("handles empty string modalTitle (renders empty)", () => {
      render(
        <DonateModal isOpen={true} onClose={mockOnClose} modalTitle="" />
      );

      // Empty string is passed, so the h2 will be empty
      // Default param only applies when undefined, not empty string
      // We should check that it renders (the modal still shows)
      const closeButton = screen.getByRole("button", { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("Close Button", () => {
    it("renders close button with accessible label", () => {
      render(<DonateModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", () => {
      render(<DonateModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Escape Key", () => {
    it("calls onClose when Escape key is pressed", () => {
      render(<DonateModal isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not respond to Escape when modal is closed", () => {
      render(<DonateModal isOpen={false} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Goal Meter (Fundraise Up Element)", () => {
    it("renders goal meter when enabled and has element", () => {
      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={mockGoalMeter}
          featuredCampaign={mockFeaturedCampaign}
        />
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
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={disabledGoalMeter}
          featuredCampaign={mockFeaturedCampaign}
        />
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
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={noElementGoalMeter}
          featuredCampaign={mockFeaturedCampaign}
        />
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
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={emptyElementGoalMeter}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("does not render goal meter when goalMeter is null", () => {
      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={null}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("does not render goal meter when goalMeter is undefined", () => {
      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={undefined}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });

    it("cleans unicode characters from goal meter element", () => {
      const goalMeterWithUnicode: DonationGoalMeter = {
        _id: "goal-1",
        enabled: true,
        fundraiseUpElement: '\u200B<a href="#TEST">\u200D</a>\uFEFF',
      };

      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={goalMeterWithUnicode}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      // The innerHTML should be cleaned (no zero-width characters)
      expect(goalMeterDiv?.innerHTML).toBe('<a href="#TEST"></a>');
    });
  });

  describe("Featured Campaign", () => {
    it("renders featured campaign title", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      expect(screen.getByText("Ramadan Appeal 2025")).toBeInTheDocument();
    });

    it("renders featured campaign Fundraise Up element", () => {
      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      const wrappers = container.querySelectorAll(".fundraise-up-wrapper");
      expect(wrappers.length).toBeGreaterThanOrEqual(1);
    });

    it("handles null featured campaign", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={null}
        />
      );

      expect(screen.queryByText("Ramadan Appeal 2025")).not.toBeInTheDocument();
    });
  });

  describe("Additional Campaigns", () => {
    it("renders additional campaigns", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
          additionalCampaigns={mockAdditionalCampaigns}
        />
      );

      expect(screen.getByText("Building Fund")).toBeInTheDocument();
      expect(screen.getByText("Education Program")).toBeInTheDocument();
    });

    it("shows 'More Campaigns' divider when both featured and additional exist", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
          additionalCampaigns={mockAdditionalCampaigns}
        />
      );

      expect(screen.getByText("More Campaigns")).toBeInTheDocument();
    });

    it("does not show divider when no featured campaign", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={null}
          additionalCampaigns={mockAdditionalCampaigns}
        />
      );

      expect(screen.queryByText("More Campaigns")).not.toBeInTheDocument();
    });

    it("handles empty additional campaigns array", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
          additionalCampaigns={[]}
        />
      );

      expect(screen.queryByText("More Campaigns")).not.toBeInTheDocument();
    });

    it("handles undefined additional campaigns", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
          additionalCampaigns={undefined}
        />
      );

      expect(screen.queryByText("More Campaigns")).not.toBeInTheDocument();
    });
  });

  describe("Fallback Content (No Campaigns)", () => {
    it("shows fallback when no campaigns configured", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={null}
          additionalCampaigns={[]}
        />
      );

      expect(screen.getByText("Support Our Community")).toBeInTheDocument();
      expect(
        screen.getByText(/Your generosity helps us maintain our mosque/)
      ).toBeInTheDocument();
    });

    it("shows 'View Donation Options' link in fallback", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={null}
          additionalCampaigns={[]}
        />
      );

      const link = screen.getByRole("link", { name: /View Donation Options/i });
      expect(link).toHaveAttribute("href", "/donate");
    });

    it("calls onClose when fallback link is clicked", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={null}
          additionalCampaigns={[]}
        />
      );

      const link = screen.getByRole("link", { name: /View Donation Options/i });
      fireEvent.click(link);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not show goal meter in fallback mode", () => {
      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          goalMeter={mockGoalMeter}
          featuredCampaign={null}
          additionalCampaigns={[]}
        />
      );

      // Goal meter should not render when there are no campaigns (fallback mode)
      // because hasCampaigns is false
      const goalMeterDiv = container.querySelector(".fundraise-up-goal-meter");
      expect(goalMeterDiv).not.toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("shows footer when campaigns exist", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      expect(screen.getByText(/View all donation options/)).toBeInTheDocument();
    });

    it("does not show footer in fallback mode", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={null}
          additionalCampaigns={[]}
        />
      );

      expect(
        screen.queryByText(/View all donation options/)
      ).not.toBeInTheDocument();
    });

    it("footer link points to /donate", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      const footerLink = screen.getByText(/View all donation options/);
      expect(footerLink.closest("a")).toHaveAttribute("href", "/donate");
    });

    it("closes modal when footer link is clicked", () => {
      render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={mockFeaturedCampaign}
        />
      );

      const footerLink = screen.getByText(/View all donation options/);
      fireEvent.click(footerLink);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Unicode Cleaning", () => {
    it("removes zero-width space (U+200B) from campaign elements", () => {
      const campaignWithUnicode: ModalCampaign = {
        _id: "test-1",
        title: "Test Campaign",
        fundraiseUpElement: '\u200B<a href="#TEST"></a>',
      };

      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={campaignWithUnicode}
        />
      );

      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).not.toContain("\u200B");
    });

    it("removes zero-width non-joiner (U+200C) from campaign elements", () => {
      const campaignWithUnicode: ModalCampaign = {
        _id: "test-1",
        title: "Test Campaign",
        fundraiseUpElement: '\u200C<a href="#TEST"></a>',
      };

      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={campaignWithUnicode}
        />
      );

      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).not.toContain("\u200C");
    });

    it("removes zero-width joiner (U+200D) from campaign elements", () => {
      const campaignWithUnicode: ModalCampaign = {
        _id: "test-1",
        title: "Test Campaign",
        fundraiseUpElement: '<a href="#TEST">\u200D</a>',
      };

      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={campaignWithUnicode}
        />
      );

      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).not.toContain("\u200D");
    });

    it("removes byte order mark (U+FEFF) from campaign elements", () => {
      const campaignWithUnicode: ModalCampaign = {
        _id: "test-1",
        title: "Test Campaign",
        fundraiseUpElement: '\uFEFF<a href="#TEST"></a>',
      };

      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={campaignWithUnicode}
        />
      );

      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).not.toContain("\uFEFF");
    });

    it("trims whitespace from campaign elements", () => {
      const campaignWithWhitespace: ModalCampaign = {
        _id: "test-1",
        title: "Test Campaign",
        fundraiseUpElement: '  <a href="#TEST"></a>  ',
      };

      const { container } = render(
        <DonateModal
          isOpen={true}
          onClose={mockOnClose}
          featuredCampaign={campaignWithWhitespace}
        />
      );

      const wrapper = container.querySelector(".fundraise-up-wrapper");
      expect(wrapper?.innerHTML).toBe('<a href="#TEST"></a>');
    });
  });

  describe("Body Scroll Lock", () => {
    it("adds overflow hidden to body when modal opens", () => {
      render(<DonateModal isOpen={true} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("removes overflow hidden from body when modal closes", () => {
      const { rerender } = render(
        <DonateModal isOpen={true} onClose={mockOnClose} />
      );

      rerender(<DonateModal isOpen={false} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe("");
    });

    it("restores body overflow on unmount", () => {
      const { unmount } = render(
        <DonateModal isOpen={true} onClose={mockOnClose} />
      );

      unmount();

      expect(document.body.style.overflow).toBe("");
    });
  });
});
