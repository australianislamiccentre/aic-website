import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { GoalMeter } from "./GoalMeter";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { style?: React.CSSProperties }) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
}));

describe("GoalMeter", () => {
  describe("Rendering", () => {
    it("renders with required props", () => {
      render(<GoalMeter goal={100000} raised={50000} />);

      expect(screen.getByText("Fundraising Goal")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("renders custom label when provided", () => {
      render(<GoalMeter goal={100000} raised={50000} label="2025 Annual Appeal" />);

      expect(screen.getByText("2025 Annual Appeal")).toBeInTheDocument();
      expect(screen.queryByText("Fundraising Goal")).not.toBeInTheDocument();
    });

    it("renders default label when label is undefined", () => {
      render(<GoalMeter goal={100000} raised={50000} />);

      expect(screen.getByText("Fundraising Goal")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <GoalMeter goal={100000} raised={50000} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders Target and TrendingUp icons", () => {
      const { container } = render(<GoalMeter goal={100000} raised={50000} />);

      // Check for the icon containers
      const iconContainers = container.querySelectorAll("svg");
      expect(iconContainers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Currency Formatting", () => {
    it("formats currency in AUD without decimals", () => {
      render(<GoalMeter goal={100000} raised={50000} />);

      expect(screen.getByText("$50,000")).toBeInTheDocument();
      expect(screen.getByText("$100,000")).toBeInTheDocument();
    });

    it("formats large amounts correctly", () => {
      render(<GoalMeter goal={1000000} raised={750000} />);

      expect(screen.getByText("$750,000")).toBeInTheDocument();
      expect(screen.getByText("$1,000,000")).toBeInTheDocument();
    });

    it("formats small amounts correctly", () => {
      render(<GoalMeter goal={1000} raised={500} />);

      expect(screen.getByText("$500")).toBeInTheDocument();
      expect(screen.getByText("$1,000")).toBeInTheDocument();
    });

    it("formats zero correctly", () => {
      render(<GoalMeter goal={100000} raised={0} />);

      expect(screen.getByText("$0")).toBeInTheDocument();
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  describe("Percentage Calculations", () => {
    it("calculates 0% when raised is 0", () => {
      render(<GoalMeter goal={100000} raised={0} />);

      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("calculates 50% correctly", () => {
      render(<GoalMeter goal={100000} raised={50000} />);

      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("calculates 100% when goal is met", () => {
      render(<GoalMeter goal={100000} raised={100000} />);

      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("caps at 100% when raised exceeds goal", () => {
      render(<GoalMeter goal={100000} raised={150000} />);

      // Should show 100%, not 150%
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("handles very small percentages", () => {
      render(<GoalMeter goal={100000} raised={100} />);

      // 0.1% should round to 0%
      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("rounds percentages correctly", () => {
      render(<GoalMeter goal={100000} raised={33333} />);

      // 33.333% should round to 33%
      expect(screen.getByText("33%")).toBeInTheDocument();
    });

    it("rounds up at .5 or higher", () => {
      render(<GoalMeter goal={1000} raised={335} />);

      // 33.5% should show as 34% (toFixed rounds .5 up in JS)
      expect(screen.getByText("34%")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles decimal raised amounts", () => {
      render(<GoalMeter goal={100000} raised={50000.75} />);

      // Should format without decimals
      expect(screen.getByText("$50,001")).toBeInTheDocument();
    });

    it("handles decimal goal amounts", () => {
      render(<GoalMeter goal={100000.50} raised={50000} />);

      expect(screen.getByText("$100,001")).toBeInTheDocument();
    });

    it("handles very large numbers", () => {
      render(<GoalMeter goal={10000000} raised={5000000} />);

      expect(screen.getByText("$5,000,000")).toBeInTheDocument();
      expect(screen.getByText("$10,000,000")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("handles goal of 1", () => {
      render(<GoalMeter goal={1} raised={1} />);

      // Both raised and goal show $1, use getAllByText
      const dollarOneElements = screen.getAllByText("$1");
      expect(dollarOneElements).toHaveLength(2);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("handles raised greater than goal", () => {
      render(<GoalMeter goal={50000} raised={75000} />);

      // Amount should still display correctly
      expect(screen.getByText("$75,000")).toBeInTheDocument();
      expect(screen.getByText("$50,000")).toBeInTheDocument();
      // Percentage should cap at 100%
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("Labels and Text", () => {
    it("displays 'Raised:' label", () => {
      render(<GoalMeter goal={100000} raised={50000} />);

      expect(screen.getByText("Raised:")).toBeInTheDocument();
    });

    it("displays 'Goal:' label", () => {
      render(<GoalMeter goal={100000} raised={50000} />);

      expect(screen.getByText("Goal:")).toBeInTheDocument();
    });

    it("handles empty string label (should show default)", () => {
      render(<GoalMeter goal={100000} raised={50000} label="" />);

      // Empty string is falsy, so it should show "Fundraising Goal"
      expect(screen.getByText("Fundraising Goal")).toBeInTheDocument();
    });

    it("handles long labels", () => {
      const longLabel = "2025 Annual Community Development and Infrastructure Improvement Campaign";
      render(<GoalMeter goal={100000} raised={50000} label={longLabel} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has base styling classes", () => {
      const { container } = render(<GoalMeter goal={100000} raised={50000} />);

      expect(container.firstChild).toHaveClass("bg-gradient-to-r");
      expect(container.firstChild).toHaveClass("rounded-xl");
      expect(container.firstChild).toHaveClass("p-5");
      expect(container.firstChild).toHaveClass("border");
    });

    it("combines default and custom classNames", () => {
      const { container } = render(
        <GoalMeter goal={100000} raised={50000} className="my-custom-class" />
      );

      expect(container.firstChild).toHaveClass("bg-gradient-to-r");
      expect(container.firstChild).toHaveClass("my-custom-class");
    });
  });
});
