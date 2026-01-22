import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { Input, Textarea, Select, Checkbox, RadioGroup } from "./Input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Input label="Email Address" />);
    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("shows required indicator when required", () => {
    render(<Input label="Email" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Input error="Invalid email address" />);
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
  });

  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "test@example.com");

    expect(input).toHaveValue("test@example.com");
  });

  it("renders with icon", () => {
    const icon = <span data-testid="email-icon">@</span>;
    render(<Input icon={icon} />);
    expect(screen.getByTestId("email-icon")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input disabled placeholder="Disabled input" />);
    expect(screen.getByPlaceholderText("Disabled input")).toBeDisabled();
  });
});

describe("Textarea", () => {
  it("renders with placeholder", () => {
    render(<Textarea placeholder="Enter your message" />);
    expect(
      screen.getByPlaceholderText("Enter your message")
    ).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Textarea label="Message" />);
    expect(screen.getByText("Message")).toBeInTheDocument();
  });

  it("shows required indicator when required", () => {
    render(<Textarea label="Message" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Textarea error="Message is required" />);
    expect(screen.getByText("Message is required")).toBeInTheDocument();
  });

  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type here" />);

    const textarea = screen.getByPlaceholderText("Type here");
    await user.type(textarea, "Hello, this is a test message");

    expect(textarea).toHaveValue("Hello, this is a test message");
  });
});

describe("Select", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("renders all options", () => {
    render(<Select options={options} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Select label="Select an option" options={options} />);
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<Select options={options} placeholder="Choose..." />);
    expect(screen.getByText("Choose...")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Select options={options} error="Selection required" />);
    expect(screen.getByText("Selection required")).toBeInTheDocument();
  });

  it("handles selection change", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "option2");

    expect(select).toHaveValue("option2");
  });
});

describe("Checkbox", () => {
  it("renders with label", () => {
    render(<Checkbox label="I agree to terms" />);
    expect(screen.getByText("I agree to terms")).toBeInTheDocument();
  });

  it("renders with description", () => {
    render(
      <Checkbox
        label="Newsletter"
        description="Receive weekly updates"
      />
    );
    expect(screen.getByText("Receive weekly updates")).toBeInTheDocument();
  });

  it("handles check/uncheck", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox label="Accept" onChange={handleChange} />);
    await user.click(screen.getByRole("checkbox"));

    expect(handleChange).toHaveBeenCalled();
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  it("renders all radio options", () => {
    render(<RadioGroup name="size" options={options} />);

    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<RadioGroup name="size" label="Select Size" options={options} />);
    expect(screen.getByText("Select Size")).toBeInTheDocument();
  });

  it("renders options with descriptions", () => {
    const optionsWithDesc = [
      { value: "small", label: "Small", description: "Best for individuals" },
      { value: "large", label: "Large", description: "Best for families" },
    ];

    render(<RadioGroup name="size" options={optionsWithDesc} />);
    expect(screen.getByText("Best for individuals")).toBeInTheDocument();
    expect(screen.getByText("Best for families")).toBeInTheDocument();
  });

  it("selects the correct option based on value prop", () => {
    render(<RadioGroup name="size" options={options} value="medium" />);

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).not.toBeChecked(); // small
    expect(radios[1]).toBeChecked(); // medium
    expect(radios[2]).not.toBeChecked(); // large
  });

  it("calls onChange with selected value", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RadioGroup name="size" options={options} onChange={handleChange} />
    );

    await user.click(screen.getByText("Large"));
    expect(handleChange).toHaveBeenCalledWith("large");
  });
});
