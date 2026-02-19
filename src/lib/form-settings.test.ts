import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Sanity client before importing
vi.mock("@/sanity/lib/client", () => ({
  noCdnClient: {
    fetch: vi.fn(),
  },
}));

// Import after mocking
import { getFormRecipientEmail, isFormEnabled } from "./form-settings";
import { noCdnClient } from "@/sanity/lib/client";

const mockFetch = noCdnClient.fetch as ReturnType<typeof vi.fn>;

describe("form-settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module cache to clear the internal cached settings
    vi.resetModules();
  });

  describe("getFormRecipientEmail", () => {
    it("returns Sanity email when configured", async () => {
      mockFetch.mockResolvedValueOnce({
        contactRecipientEmail: "sanity@example.com",
      });

      // Re-import to reset cache
      const mod = await import("./form-settings");
      const email = await mod.getFormRecipientEmail("contact");
      expect(email).toBe("sanity@example.com");
    });

    it("falls back to FORM_TO_EMAIL env var when Sanity has no email", async () => {
      const originalEnv = process.env.FORM_TO_EMAIL;
      process.env.FORM_TO_EMAIL = "env@example.com";

      mockFetch.mockResolvedValueOnce({});

      const mod = await import("./form-settings");
      const email = await mod.getFormRecipientEmail("contact");
      expect(email).toBe("env@example.com");

      process.env.FORM_TO_EMAIL = originalEnv;
    });

    it("falls back to hardcoded email when no Sanity or env var", async () => {
      const originalEnv = process.env.FORM_TO_EMAIL;
      const originalContact = process.env.CONTACT_FORM_TO_EMAIL;
      delete process.env.FORM_TO_EMAIL;
      delete process.env.CONTACT_FORM_TO_EMAIL;

      mockFetch.mockResolvedValueOnce({});

      const mod = await import("./form-settings");
      const email = await mod.getFormRecipientEmail("contact");
      expect(email).toBe("contact@australianislamiccentre.org");

      process.env.FORM_TO_EMAIL = originalEnv;
      process.env.CONTACT_FORM_TO_EMAIL = originalContact;
    });

    it("returns serviceInquiry email from Sanity", async () => {
      mockFetch.mockResolvedValueOnce({
        serviceInquiryRecipientEmail: "services@example.com",
      });

      const mod = await import("./form-settings");
      const email = await mod.getFormRecipientEmail("serviceInquiry");
      expect(email).toBe("services@example.com");
    });

    it("returns newsletter email from Sanity", async () => {
      mockFetch.mockResolvedValueOnce({
        newsletterRecipientEmail: "newsletter@example.com",
      });

      const mod = await import("./form-settings");
      const email = await mod.getFormRecipientEmail("newsletter");
      expect(email).toBe("newsletter@example.com");
    });

    it("handles Sanity fetch failure gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const mod = await import("./form-settings");
      const email = await mod.getFormRecipientEmail("contact");
      // Should fall back to env var or hardcoded
      expect(email).toBeDefined();
      expect(typeof email).toBe("string");
    });
  });

  describe("isFormEnabled", () => {
    it("returns true when enabled is not set (defaults to true)", async () => {
      mockFetch.mockResolvedValueOnce({});

      const mod = await import("./form-settings");
      const enabled = await mod.isFormEnabled("contact");
      expect(enabled).toBe(true);
    });

    it("returns true when explicitly enabled", async () => {
      mockFetch.mockResolvedValueOnce({
        contactEnabled: true,
      });

      const mod = await import("./form-settings");
      const enabled = await mod.isFormEnabled("contact");
      expect(enabled).toBe(true);
    });

    it("returns false when explicitly disabled", async () => {
      mockFetch.mockResolvedValueOnce({
        contactEnabled: false,
      });

      const mod = await import("./form-settings");
      const enabled = await mod.isFormEnabled("contact");
      expect(enabled).toBe(false);
    });

    it("checks serviceInquiry enabled state", async () => {
      mockFetch.mockResolvedValueOnce({
        serviceInquiryEnabled: false,
      });

      const mod = await import("./form-settings");
      const enabled = await mod.isFormEnabled("serviceInquiry");
      expect(enabled).toBe(false);
    });

    it("checks newsletter enabled state", async () => {
      mockFetch.mockResolvedValueOnce({
        newsletterEnabled: false,
      });

      const mod = await import("./form-settings");
      const enabled = await mod.isFormEnabled("newsletter");
      expect(enabled).toBe(false);
    });

    it("handles null Sanity response", async () => {
      mockFetch.mockResolvedValueOnce(null);

      const mod = await import("./form-settings");
      const enabled = await mod.isFormEnabled("contact");
      expect(enabled).toBe(true);
    });
  });
});
