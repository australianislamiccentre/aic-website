import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { Button, IconButton } from "./Button";

describe("Button", () => {
  it("renders with children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("from-green-500");
  });

  it("applies secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("from-primary-600");
  });

  it("applies size classes correctly", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-8", "py-3");
  });

  it("renders as a link when href is provided", () => {
    render(<Button href="/donate">Donate</Button>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/donate");
  });

  it("renders external links with target blank", () => {
    render(
      <Button href="https://example.com" target="_blank">
        External
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("calls onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick handler on link buttons", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button href="/test" onClick={handleClick}>
        Link Button
      </Button>
    );
    await user.click(screen.getByRole("link"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading spinner when loading", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders icon on the right by default", () => {
    const icon = <span data-testid="icon">→</span>;
    render(<Button icon={icon}>With Icon</Button>);

    const iconElement = screen.getByTestId("icon");
    const textElement = screen.getByText("With Icon");

    // Icon should come after text in the DOM
    expect(textElement.compareDocumentPosition(iconElement)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("renders icon on the left when specified", () => {
    const icon = <span data-testid="icon">←</span>;
    render(
      <Button icon={icon} iconPosition="left">
        With Icon
      </Button>
    );

    const iconElement = screen.getByTestId("icon");
    const textElement = screen.getByText("With Icon");

    // Icon should come before text in the DOM
    expect(textElement.compareDocumentPosition(iconElement)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    );
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("sets correct button type", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});

describe("IconButton", () => {
  it("renders with icon", () => {
    const icon = <span data-testid="icon">★</span>;
    render(<IconButton icon={icon} label="Star" />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    const icon = <span>★</span>;
    render(<IconButton icon={icon} label="Star button" />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Star button"
    );
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const icon = <span>★</span>;

    render(<IconButton icon={icon} label="Star" onClick={handleClick} />);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const icon = <span>★</span>;
    render(<IconButton icon={icon} label="Star" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
