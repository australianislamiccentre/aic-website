import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { Footer } from "./Footer";

// Mock the aicInfo data
vi.mock("@/data/content", () => ({
  aicInfo: {
    name: "Australian Islamic Centre",
    tagline: "A beacon of faith and knowledge",
    address: {
      street: "15 Corporate Crescent",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
    },
    phone: "(03) 9391 9303",
    email: "contact@australianislamiccentre.org",
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/aic",
    },
    externalLinks: {
      college: "https://aicollege.edu.au",
      bookstore: "https://aicbookstore.com.au",
      newportStorm: "https://newportstorm.com.au",
    },
  },
}));

describe("Footer", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays the AIC logo", () => {
    render(<Footer />);
    expect(
      screen.getByAltText("Australian Islamic Centre")
    ).toBeInTheDocument();
  });

  it("displays contact information", () => {
    render(<Footer />);
    expect(screen.getByText(/15 Corporate Crescent/)).toBeInTheDocument();
    expect(screen.getByText("(03) 9391 9303")).toBeInTheDocument();
    expect(
      screen.getByText("contact@australianislamiccentre.org")
    ).toBeInTheDocument();
  });

  it("renders navigation link sections", () => {
    render(<Footer />);

    // About section
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Our Story/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Our Imams/i })).toBeInTheDocument();

    // What's On section
    expect(screen.getByText("What's On")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Events/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Services/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Announcements/i })
    ).toBeInTheDocument();

    // Our Mosque section
    expect(screen.getByText("Our Mosque")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /For Worshippers/i })
    ).toBeInTheDocument();

    // Media & Resources section
    expect(screen.getByText("Media & Resources")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Media Gallery/i })
    ).toBeInTheDocument();

    // Get Involved section
    expect(screen.getByText("Get Involved")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Donate$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Contact Us/i })
    ).toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<Footer />);

    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Youtube")).toBeInTheDocument();
  });

  it("social links open in new tab", () => {
    render(<Footer />);

    const facebookLink = screen.getByLabelText("Facebook");
    expect(facebookLink).toHaveAttribute("target", "_blank");
    expect(facebookLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders affiliate links", () => {
    render(<Footer />);

    expect(screen.getByText("Affiliates")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AIC College/i })).toHaveAttribute(
      "href",
      "https://aicollege.edu.au"
    );
  });

  it("renders donate CTA section", () => {
    render(<Footer />);

    expect(screen.getByText("Support Us")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Donate Now/i })).toHaveAttribute(
      "href",
      "/donate"
    );
  });

  it("renders newsletter subscription form", () => {
    render(<Footer />);

    expect(
      screen.getByText("Stay Connected with Our Community")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Full name")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Phone number")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Email address")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Add me to the AIC WhatsApp group")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Subscribe/i })
    ).toBeInTheDocument();
  });

  it("newsletter form submits via fetch", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    render(<Footer />);

    const nameInput = screen.getByPlaceholderText("Full name");
    const phoneInput = screen.getByPlaceholderText("Phone number");
    const emailInput = screen.getByPlaceholderText("Email address");
    const submitButton = screen.getByRole("button", { name: /Subscribe/i });

    await user.type(nameInput, "John Doe");
    await user.type(phoneInput, "0412345678");
    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/subscribe",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );

    fetchSpy.mockRestore();
  });

  it("displays copyright notice with current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear}.*Australian Islamic Centre`))
    ).toBeInTheDocument();
  });

  it("renders legal links", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", { name: /Privacy Policy/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Terms of Use/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Accessibility/i })
    ).toBeInTheDocument();
  });

  it("renders Quranic verse", () => {
    render(<Footer />);

    expect(screen.getByText(/Qur'an 2:261/)).toBeInTheDocument();
  });
});
