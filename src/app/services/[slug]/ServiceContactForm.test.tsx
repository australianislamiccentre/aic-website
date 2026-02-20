import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { ServiceContactForm } from "./ServiceContactForm";

// Mock useFormSettings
vi.mock("@/contexts/FormSettingsContext", () => ({
  useFormSettings: () => ({
    serviceInquiryEnabled: true,
    serviceInquiryFormHeading: "Get in Touch",
    serviceInquiryFormDescription: "Have questions? Fill out the form below.",
    serviceInquirySuccessHeading: "Inquiry Sent!",
    serviceInquirySuccessMessage: "Thank you for your inquiry.",
    contactEnabled: true,
    contactHeading: "Get in",
    contactHeadingAccent: "Touch",
    contactDescription: "",
    contactFormHeading: "",
    contactFormDescription: "",
    contactInquiryTypes: [],
    contactSuccessHeading: "",
    contactSuccessMessage: "",
    newsletterEnabled: true,
    newsletterHeading: "",
    newsletterDescription: "",
    newsletterButtonText: "",
    newsletterSuccessMessage: "",
  }),
}));

describe("ServiceContactForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders form heading from context", () => {
      render(<ServiceContactForm serviceName="Nikah" />);
      expect(screen.getByText("Get in Touch")).toBeInTheDocument();
    });

    it("renders form description from context", () => {
      render(<ServiceContactForm serviceName="Nikah" />);
      expect(screen.getByText("Have questions? Fill out the form below.")).toBeInTheDocument();
    });

    it("renders required form fields", () => {
      render(<ServiceContactForm serviceName="Nikah" />);
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it("renders optional phone field", () => {
      render(<ServiceContactForm serviceName="Nikah" />);
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it("renders submit button", () => {
      render(<ServiceContactForm serviceName="Nikah" />);
      expect(screen.getByRole("button", { name: /send inquiry/i })).toBeInTheDocument();
    });

    it("includes service name in message placeholder", () => {
      render(<ServiceContactForm serviceName="Nikah" />);
      const textarea = screen.getByLabelText(/message/i);
      expect(textarea).toHaveAttribute("placeholder", expect.stringContaining("Nikah"));
    });

    it("renders honeypot field (hidden)", () => {
      render(<ServiceContactForm serviceName="Nikah" />);
      const honeypot = document.getElementById("_gotcha");
      expect(honeypot).toBeInTheDocument();
      expect(honeypot).toHaveAttribute("aria-hidden", "true");
      expect(honeypot).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("Submission", () => {
    it("sends form data with serviceSlug to API", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const user = userEvent.setup();
      render(<ServiceContactForm serviceName="Nikah" serviceSlug="nikah-services" />);

      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/message/i), "I need help");

      await user.click(screen.getByRole("button", { name: /send inquiry/i }));

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith("/api/service-inquiry", expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }));
      });

      // Verify the body includes serviceSlug
      const callBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(callBody.serviceSlug).toBe("nikah-services");
      expect(callBody.firstName).toBe("John");
      expect(callBody.lastName).toBe("Doe");
      expect(callBody.email).toBe("john@example.com");
      expect(callBody.serviceName).toBe("Nikah");
    });

    it("shows success state after successful submission", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const user = userEvent.setup();
      render(<ServiceContactForm serviceName="Nikah" />);

      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/message/i), "Hello");

      await user.click(screen.getByRole("button", { name: /send inquiry/i }));

      await waitFor(() => {
        expect(screen.getByText("Inquiry Sent!")).toBeInTheDocument();
      });
      expect(screen.getByText("Thank you for your inquiry.")).toBeInTheDocument();
      expect(screen.getByText("Send Another Inquiry")).toBeInTheDocument();
    });

    it("shows error message on API failure", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
      );

      const user = userEvent.setup();
      render(<ServiceContactForm serviceName="Nikah" />);

      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/message/i), "Hello");

      await user.click(screen.getByRole("button", { name: /send inquiry/i }));

      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("defaults serviceSlug to empty string when not provided", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const user = userEvent.setup();
      render(<ServiceContactForm serviceName="Nikah" />);

      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/message/i), "Hello");

      await user.click(screen.getByRole("button", { name: /send inquiry/i }));

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });

      const callBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(callBody.serviceSlug).toBe("");
    });
  });
});
