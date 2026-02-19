import { describe, it, expect } from "vitest";
import { buildFormSettings } from "./FormSettingsContext";
import type { SanityFormSettings } from "./FormSettingsContext";

describe("FormSettingsContext", () => {
  describe("buildFormSettings", () => {
    describe("with null input (no Sanity data)", () => {
      const settings = buildFormSettings(null);

      it("returns default contact heading", () => {
        expect(settings.contactHeading).toBe("Get in");
      });

      it("returns default contact heading accent", () => {
        expect(settings.contactHeadingAccent).toBe("Touch");
      });

      it("returns default contact description", () => {
        expect(settings.contactDescription).toBe(
          "Have a question or need assistance? We're here to help."
        );
      });

      it("returns default contact form heading", () => {
        expect(settings.contactFormHeading).toBe("Send Us a Message");
      });

      it("returns default contact form description", () => {
        expect(settings.contactFormDescription).toBe(
          "Fill out the form below and we'll get back to you shortly."
        );
      });

      it("returns default inquiry types", () => {
        expect(settings.contactInquiryTypes).toHaveLength(11);
        expect(settings.contactInquiryTypes[0]).toEqual({
          value: "General Enquiry",
          label: "General Enquiry",
        });
        expect(settings.contactInquiryTypes[10]).toEqual({
          value: "Other",
          label: "Other",
        });
      });

      it("returns default contact success heading", () => {
        expect(settings.contactSuccessHeading).toBe("Message Sent!");
      });

      it("returns default contact success message", () => {
        expect(settings.contactSuccessMessage).toBe(
          "Thank you for contacting us. We'll get back to you as soon as possible."
        );
      });

      it("defaults contactEnabled to true", () => {
        expect(settings.contactEnabled).toBe(true);
      });

      it("defaults serviceInquiryEnabled to true", () => {
        expect(settings.serviceInquiryEnabled).toBe(true);
      });

      it("defaults newsletterEnabled to true", () => {
        expect(settings.newsletterEnabled).toBe(true);
      });

      it("returns default service inquiry form heading", () => {
        expect(settings.serviceInquiryFormHeading).toBe("Get in Touch");
      });

      it("returns default newsletter heading", () => {
        expect(settings.newsletterHeading).toBe(
          "Stay Connected with Our Community"
        );
      });

      it("returns default newsletter button text", () => {
        expect(settings.newsletterButtonText).toBe("Subscribe");
      });
    });

    describe("with full Sanity data", () => {
      const raw: SanityFormSettings = {
        contactEnabled: false,
        contactHeading: "Reach",
        contactHeadingAccent: "Out",
        contactDescription: "Custom description",
        contactFormHeading: "Custom Form Heading",
        contactFormDescription: "Custom form desc",
        contactInquiryTypes: ["Type A", "Type B"],
        contactSuccessHeading: "Done!",
        contactSuccessMessage: "Custom success message",
        serviceInquiryEnabled: false,
        serviceInquiryFormHeading: "Custom Service Heading",
        serviceInquiryFormDescription: "Custom service desc",
        serviceInquirySuccessHeading: "Service Sent!",
        serviceInquirySuccessMessage: "Custom service success",
        newsletterEnabled: false,
        newsletterHeading: "Custom Newsletter",
        newsletterDescription: "Custom newsletter desc",
        newsletterButtonText: "Join",
        newsletterSuccessMessage: "Custom subscribe success",
      };

      const settings = buildFormSettings(raw);

      it("uses Sanity contact heading", () => {
        expect(settings.contactHeading).toBe("Reach");
      });

      it("uses Sanity contact heading accent", () => {
        expect(settings.contactHeadingAccent).toBe("Out");
      });

      it("uses Sanity contact description", () => {
        expect(settings.contactDescription).toBe("Custom description");
      });

      it("uses Sanity inquiry types", () => {
        expect(settings.contactInquiryTypes).toEqual([
          { value: "Type A", label: "Type A" },
          { value: "Type B", label: "Type B" },
        ]);
      });

      it("uses Sanity contactEnabled value", () => {
        expect(settings.contactEnabled).toBe(false);
      });

      it("uses Sanity serviceInquiryEnabled value", () => {
        expect(settings.serviceInquiryEnabled).toBe(false);
      });

      it("uses Sanity newsletterEnabled value", () => {
        expect(settings.newsletterEnabled).toBe(false);
      });

      it("uses Sanity newsletter button text", () => {
        expect(settings.newsletterButtonText).toBe("Join");
      });

      it("uses Sanity service inquiry form heading", () => {
        expect(settings.serviceInquiryFormHeading).toBe(
          "Custom Service Heading"
        );
      });
    });

    describe("with partial Sanity data", () => {
      it("merges partial data with defaults", () => {
        const raw: SanityFormSettings = {
          contactHeading: "Custom Heading",
          newsletterButtonText: "Sign Up",
        };
        const settings = buildFormSettings(raw);

        expect(settings.contactHeading).toBe("Custom Heading");
        expect(settings.contactHeadingAccent).toBe("Touch"); // default
        expect(settings.newsletterButtonText).toBe("Sign Up");
        expect(settings.newsletterHeading).toBe(
          "Stay Connected with Our Community"
        ); // default
      });

      it("falls back to default inquiry types when empty array", () => {
        const raw: SanityFormSettings = {
          contactInquiryTypes: [],
        };
        const settings = buildFormSettings(raw);

        expect(settings.contactInquiryTypes).toHaveLength(11);
      });

      it("uses Sanity inquiry types when non-empty", () => {
        const raw: SanityFormSettings = {
          contactInquiryTypes: ["Custom Type"],
        };
        const settings = buildFormSettings(raw);

        expect(settings.contactInquiryTypes).toEqual([
          { value: "Custom Type", label: "Custom Type" },
        ]);
      });
    });

    describe("enabled fields default behavior", () => {
      it("treats undefined contactEnabled as true", () => {
        const settings = buildFormSettings({});
        expect(settings.contactEnabled).toBe(true);
      });

      it("treats explicit false contactEnabled as false", () => {
        const settings = buildFormSettings({ contactEnabled: false });
        expect(settings.contactEnabled).toBe(false);
      });

      it("treats explicit true contactEnabled as true", () => {
        const settings = buildFormSettings({ contactEnabled: true });
        expect(settings.contactEnabled).toBe(true);
      });
    });
  });
});
