import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { Card, ImageCard, StatCard } from "./Card";
import { Star } from "lucide-react";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <Card className="custom-class">Content</Card>
    );
    // motion.div wraps the content, check if custom class exists in hierarchy
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders with different padding sizes", () => {
    const { container, rerender } = render(<Card padding="sm">Content</Card>);
    expect(container.querySelector(".p-4")).toBeInTheDocument();

    rerender(<Card padding="lg">Content</Card>);
    expect(container.querySelector(".p-8")).toBeInTheDocument();
  });

  it("renders with glass effect when glass prop is true", () => {
    const { container } = render(<Card glass>Glass card</Card>);
    expect(container.querySelector(".glass")).toBeInTheDocument();
  });
});

describe("ImageCard", () => {
  const defaultProps = {
    image: "/test-image.jpg",
    alt: "Test image",
    title: "Card Title",
  };

  it("renders with title", () => {
    render(<ImageCard {...defaultProps} />);
    expect(screen.getByText("Card Title")).toBeInTheDocument();
  });

  it("renders with subtitle", () => {
    render(<ImageCard {...defaultProps} subtitle="Card Subtitle" />);
    expect(screen.getByText("Card Subtitle")).toBeInTheDocument();
  });

  it("renders with badge", () => {
    render(<ImageCard {...defaultProps} badge="New" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(<ImageCard {...defaultProps} href="/test-page" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/test-page");
  });

  it("renders image with correct alt text", () => {
    render(<ImageCard {...defaultProps} />);
    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });
});

describe("StatCard", () => {
  it("renders value and label", () => {
    render(<StatCard value="500+" label="Community Members" />);
    expect(screen.getByText("500+")).toBeInTheDocument();
    expect(screen.getByText("Community Members")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(
      <StatCard
        value="100"
        label="Events"
        icon={<Star data-testid="stat-icon" />}
      />
    );
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <StatCard value="50" label="Programs" className="custom-stat-class" />
    );
    expect(container.querySelector(".custom-stat-class")).toBeInTheDocument();
  });
});

