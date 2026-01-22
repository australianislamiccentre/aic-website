import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import DonatePage from "./page";

// Mock the data content
vi.mock("@/data/content", () => ({
  donationCauses: [
    {
      id: "general",
      title: "General Fund",
      description: "Support all mosque operations",
      icon: "building",
    },
    {
      id: "education",
      title: "Education Programs",
      description: "Support Islamic education",
      icon: "book",
    },
  ],
  donationFrequencies: [
    { value: "once", label: "One-Time" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "fortnightly", label: "Fortnightly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ],
  donationAmounts: [25, 50, 100, 250, 500, 1000],
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/donate",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Donate Page", () => {
  it("renders the donate page hero section", () => {
    render(<DonatePage />);

    expect(screen.getByText(/Support Our/)).toBeInTheDocument();
    expect(screen.getByText(/Mission/)).toBeInTheDocument();
  });

  it("displays secure payment and tax deductible badges", () => {
    render(<DonatePage />);

    expect(screen.getByText("Secure Payment")).toBeInTheDocument();
    expect(screen.getByText("Tax Deductible")).toBeInTheDocument();
    // Multiple instances of "100% Goes to Cause" exist (hero and sidebar)
    expect(screen.getAllByText("100% Goes to Cause").length).toBeGreaterThan(0);
  });

  it("renders donation causes", () => {
    render(<DonatePage />);

    expect(screen.getByText("Choose a Cause")).toBeInTheDocument();
    // Multiple instances of cause titles may exist in summary
    expect(screen.getAllByText("General Fund").length).toBeGreaterThan(0);
    expect(screen.getByText("Education Programs")).toBeInTheDocument();
  });

  it("allows selecting a donation cause", async () => {
    const user = userEvent.setup();
    render(<DonatePage />);

    const educationButton = screen.getByText("Education Programs").closest("button");
    if (educationButton) {
      await user.click(educationButton);
    }

    // The selected cause should be highlighted (has teal styling)
    await waitFor(() => {
      expect(educationButton).toHaveClass("border-teal-500");
    });
  });

  it("renders donation frequency options", () => {
    render(<DonatePage />);

    expect(screen.getByText("Donation Frequency")).toBeInTheDocument();
    expect(screen.getByText("One-Time")).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  it("allows selecting donation frequency", async () => {
    const user = userEvent.setup();
    render(<DonatePage />);

    const monthlyButton = screen.getByRole("button", { name: /Monthly/i });
    await user.click(monthlyButton);

    // Should show monthly description
    expect(screen.getByText("Monthly recurring donation")).toBeInTheDocument();
  });

  it("renders preset donation amounts", () => {
    render(<DonatePage />);

    expect(screen.getByText("Select Amount")).toBeInTheDocument();
    // Some amounts may appear multiple times (in impact section)
    expect(screen.getAllByText("$25").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$50").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$100").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$250").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$500").length).toBeGreaterThan(0);
    expect(screen.getByText("$1000")).toBeInTheDocument();
  });

  it("allows selecting preset amount", async () => {
    const user = userEvent.setup();
    render(<DonatePage />);

    const amount250Button = screen.getByRole("button", { name: "$250" });
    await user.click(amount250Button);

    // The button should be selected (has different styling)
    expect(amount250Button).toHaveClass("border-teal-500");
  });

  it("allows entering custom amount", async () => {
    const user = userEvent.setup();
    render(<DonatePage />);

    const customAmountInput = screen.getByPlaceholderText("Enter custom amount");
    await user.type(customAmountInput, "75");

    expect(customAmountInput).toHaveValue(75);
  });

  it("renders donor details form", () => {
    render(<DonatePage />);

    expect(screen.getByText("Your Details")).toBeInTheDocument();
    // Use placeholders instead of labels which may not be properly associated
    expect(screen.getByPlaceholderText("Enter your first name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("+61 400 000 000")).toBeInTheDocument();
  });

  it("allows entering donor information", async () => {
    const user = userEvent.setup();
    render(<DonatePage />);

    const firstNameInput = screen.getByPlaceholderText("Enter your first name");
    const lastNameInput = screen.getByPlaceholderText("Enter your last name");
    const emailInput = screen.getByPlaceholderText("your@email.com");

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "john@example.com");

    expect(firstNameInput).toHaveValue("John");
    expect(lastNameInput).toHaveValue("Doe");
    expect(emailInput).toHaveValue("john@example.com");
  });

  it("has anonymous donation checkbox", () => {
    render(<DonatePage />);

    expect(
      screen.getByLabelText(/Make my donation anonymous/i)
    ).toBeInTheDocument();
  });

  it("allows toggling anonymous donation", async () => {
    const user = userEvent.setup();
    render(<DonatePage />);

    const anonymousCheckbox = screen.getByLabelText(
      /Make my donation anonymous/i
    );
    expect(anonymousCheckbox).not.toBeChecked();

    await user.click(anonymousCheckbox);
    expect(anonymousCheckbox).toBeChecked();
  });

  it("displays payment section with donation summary", () => {
    render(<DonatePage />);

    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Donation Amount")).toBeInTheDocument();
    expect(screen.getByText("Frequency")).toBeInTheDocument();
    expect(screen.getByText("Cause")).toBeInTheDocument();
  });

  it("shows coming soon notice for online payments", () => {
    render(<DonatePage />);

    expect(screen.getByText("Online Donations Coming Soon")).toBeInTheDocument();
  });

  it("displays impact information in sidebar", () => {
    render(<DonatePage />);

    expect(screen.getByText("Your Impact")).toBeInTheDocument();
    expect(
      screen.getByText("Provides meals for a family for a week")
    ).toBeInTheDocument();
  });

  it("displays trust badges", () => {
    render(<DonatePage />);

    expect(screen.getByText("Why Donate With Us?")).toBeInTheDocument();
    expect(screen.getByText("100% Secure Payments")).toBeInTheDocument();
    expect(screen.getByText("Tax Deductible Receipts")).toBeInTheDocument();
  });

  it("renders other ways to give section", () => {
    render(<DonatePage />);

    expect(screen.getByText("Other Ways to Give")).toBeInTheDocument();
    expect(screen.getByText("Bank Transfer")).toBeInTheDocument();
    expect(screen.getByText("In-Person")).toBeInTheDocument();
    expect(screen.getByText("Legacy Giving")).toBeInTheDocument();
  });

  it("has contact us link in sidebar", () => {
    render(<DonatePage />);

    expect(screen.getByText("Need Help?")).toBeInTheDocument();
    const contactLinks = screen.getAllByRole("link", { name: /Contact Us/i });
    expect(contactLinks.length).toBeGreaterThan(0);
  });
});
