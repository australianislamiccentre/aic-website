import { describe, it, expect } from "vitest";
import { donatePageSettingsQuery, formSettingsQuery } from "./queries";

describe("GROQ Queries", () => {
  describe("formSettingsQuery", () => {
    it("is defined", () => {
      expect(formSettingsQuery).toBeDefined();
    });

    it("is a string", () => {
      expect(typeof formSettingsQuery).toBe("string");
    });

    it("queries formSettings singleton by ID", () => {
      expect(formSettingsQuery).toContain('_id == "formSettings"');
    });

    it("returns only the first document (singleton)", () => {
      expect(formSettingsQuery).toContain("[0]");
    });

    it("includes contact form fields", () => {
      expect(formSettingsQuery).toContain("contactRecipientEmail");
      expect(formSettingsQuery).toContain("contactEnabled");
      expect(formSettingsQuery).toContain("contactHeading");
      expect(formSettingsQuery).toContain("contactHeadingAccent");
      expect(formSettingsQuery).toContain("contactDescription");
      expect(formSettingsQuery).toContain("contactFormHeading");
      expect(formSettingsQuery).toContain("contactFormDescription");
      expect(formSettingsQuery).toContain("contactInquiryTypes");
      expect(formSettingsQuery).toContain("contactSuccessHeading");
      expect(formSettingsQuery).toContain("contactSuccessMessage");
    });

    it("includes service inquiry fields", () => {
      expect(formSettingsQuery).toContain("serviceInquiryRecipientEmail");
      expect(formSettingsQuery).toContain("serviceInquiryEnabled");
      expect(formSettingsQuery).toContain("serviceInquiryFormHeading");
      expect(formSettingsQuery).toContain("serviceInquiryFormDescription");
      expect(formSettingsQuery).toContain("serviceInquirySuccessHeading");
      expect(formSettingsQuery).toContain("serviceInquirySuccessMessage");
    });

    it("includes newsletter fields", () => {
      expect(formSettingsQuery).toContain("newsletterRecipientEmail");
      expect(formSettingsQuery).toContain("newsletterEnabled");
      expect(formSettingsQuery).toContain("newsletterHeading");
      expect(formSettingsQuery).toContain("newsletterDescription");
      expect(formSettingsQuery).toContain("newsletterButtonText");
      expect(formSettingsQuery).toContain("newsletterSuccessMessage");
    });

    it("does not include unnecessary fields", () => {
      expect(formSettingsQuery).not.toContain("_rev");
      expect(formSettingsQuery).not.toContain("_createdAt");
      expect(formSettingsQuery).not.toContain("_updatedAt");
    });
  });

  describe("donatePageSettingsQuery", () => {
    it("is defined", () => {
      expect(donatePageSettingsQuery).toBeDefined();
    });

    it("is a string", () => {
      expect(typeof donatePageSettingsQuery).toBe("string");
    });

    it("queries donatePageSettings singleton by ID", () => {
      expect(donatePageSettingsQuery).toContain('_id == "donatePageSettings"');
    });

    it("returns only the first document (singleton)", () => {
      expect(donatePageSettingsQuery).toContain("[0]");
    });

    it("includes _id field", () => {
      expect(donatePageSettingsQuery).toContain("_id");
    });

    it("includes goal fields", () => {
      expect(donatePageSettingsQuery).toContain("goalEnabled");
      expect(donatePageSettingsQuery).toContain("goalElement");
    });

    it("includes form fields", () => {
      expect(donatePageSettingsQuery).toContain("formEnabled");
      expect(donatePageSettingsQuery).toContain("formElement");
    });

    it("includes campaigns array", () => {
      expect(donatePageSettingsQuery).toContain("campaigns[]");
    });

    it("includes donor list fields", () => {
      expect(donatePageSettingsQuery).toContain("donorListEnabled");
      expect(donatePageSettingsQuery).toContain("donorListElement");
    });

    it("includes map fields", () => {
      expect(donatePageSettingsQuery).toContain("mapEnabled");
      expect(donatePageSettingsQuery).toContain("mapTitle");
      expect(donatePageSettingsQuery).toContain("mapElement");
    });

    it("does not include unnecessary fields", () => {
      expect(donatePageSettingsQuery).not.toContain("_rev");
      expect(donatePageSettingsQuery).not.toContain("_createdAt");
      expect(donatePageSettingsQuery).not.toContain("_updatedAt");
    });
  });
});
