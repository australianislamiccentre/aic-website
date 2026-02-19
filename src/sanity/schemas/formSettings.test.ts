import { describe, it, expect } from "vitest";
import formSettings from "./formSettings";

describe("formSettings schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(formSettings.name).toBe("formSettings");
    });

    it("has correct schema title", () => {
      expect(formSettings.title).toBe("Form Settings");
    });

    it("has correct schema type", () => {
      expect(formSettings.type).toBe("document");
    });

    it("has 3 field groups", () => {
      expect(formSettings.groups).toHaveLength(3);
    });

    it("has correct group names", () => {
      const groupNames = formSettings.groups!.map((g) => g.name);
      expect(groupNames).toEqual(["contact", "serviceInquiry", "newsletter"]);
    });

    it("contact group is the default", () => {
      const contactGroup = formSettings.groups!.find(
        (g) => g.name === "contact"
      );
      expect(contactGroup?.default).toBe(true);
    });
  });

  describe("Contact Form fields", () => {
    const getField = (name: string) =>
      formSettings.fields.find((f) => f.name === name);

    it("contactRecipientEmail exists and is email type", () => {
      const field = getField("contactRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
    });

    it("contactEnabled exists and is boolean", () => {
      const field = getField("contactEnabled");
      expect(field).toBeDefined();
      expect(field?.type).toBe("boolean");
      expect(field?.initialValue).toBe(true);
    });

    it("contactHeading exists and is string", () => {
      const field = getField("contactHeading");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("contactHeadingAccent exists and is string", () => {
      const field = getField("contactHeadingAccent");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("contactDescription exists and is text", () => {
      const field = getField("contactDescription");
      expect(field).toBeDefined();
      expect(field?.type).toBe("text");
    });

    it("contactFormHeading exists and is string", () => {
      const field = getField("contactFormHeading");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("contactFormDescription exists and is text", () => {
      const field = getField("contactFormDescription");
      expect(field).toBeDefined();
      expect(field?.type).toBe("text");
    });

    it("contactInquiryTypes exists and is array of strings", () => {
      const field = getField("contactInquiryTypes");
      expect(field).toBeDefined();
      expect(field?.type).toBe("array");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((field as any).of).toEqual([{ type: "string" }]);
    });

    it("contactSuccessHeading exists and is string", () => {
      const field = getField("contactSuccessHeading");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("contactSuccessMessage exists and is text", () => {
      const field = getField("contactSuccessMessage");
      expect(field).toBeDefined();
      expect(field?.type).toBe("text");
    });

    it("all contact fields are in the contact group", () => {
      const contactFields = formSettings.fields.filter(
        (f) => f.name.startsWith("contact")
      );
      contactFields.forEach((field) => {
        expect(field.group).toBe("contact");
      });
    });
  });

  describe("Service Inquiry fields", () => {
    const getField = (name: string) =>
      formSettings.fields.find((f) => f.name === name);

    it("serviceInquiryRecipientEmail exists and is email type", () => {
      const field = getField("serviceInquiryRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
    });

    it("serviceInquiryEnabled exists and is boolean", () => {
      const field = getField("serviceInquiryEnabled");
      expect(field).toBeDefined();
      expect(field?.type).toBe("boolean");
      expect(field?.initialValue).toBe(true);
    });

    it("serviceInquiryFormHeading exists and is string", () => {
      const field = getField("serviceInquiryFormHeading");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("serviceInquiryFormDescription exists and is text", () => {
      const field = getField("serviceInquiryFormDescription");
      expect(field).toBeDefined();
      expect(field?.type).toBe("text");
    });

    it("serviceInquirySuccessHeading exists and is string", () => {
      const field = getField("serviceInquirySuccessHeading");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("serviceInquirySuccessMessage exists and is text", () => {
      const field = getField("serviceInquirySuccessMessage");
      expect(field).toBeDefined();
      expect(field?.type).toBe("text");
    });

    it("all service inquiry fields are in the serviceInquiry group", () => {
      const fields = formSettings.fields.filter((f) =>
        f.name.startsWith("serviceInquiry")
      );
      fields.forEach((field) => {
        expect(field.group).toBe("serviceInquiry");
      });
    });
  });

  describe("Newsletter fields", () => {
    const getField = (name: string) =>
      formSettings.fields.find((f) => f.name === name);

    it("newsletterRecipientEmail exists and is email type", () => {
      const field = getField("newsletterRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
    });

    it("newsletterEnabled exists and is boolean", () => {
      const field = getField("newsletterEnabled");
      expect(field).toBeDefined();
      expect(field?.type).toBe("boolean");
      expect(field?.initialValue).toBe(true);
    });

    it("newsletterHeading exists and is string", () => {
      const field = getField("newsletterHeading");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("newsletterDescription exists and is text", () => {
      const field = getField("newsletterDescription");
      expect(field).toBeDefined();
      expect(field?.type).toBe("text");
    });

    it("newsletterButtonText exists and is string", () => {
      const field = getField("newsletterButtonText");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("newsletterSuccessMessage exists and is string", () => {
      const field = getField("newsletterSuccessMessage");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("all newsletter fields are in the newsletter group", () => {
      const fields = formSettings.fields.filter((f) =>
        f.name.startsWith("newsletter")
      );
      fields.forEach((field) => {
        expect(field.group).toBe("newsletter");
      });
    });
  });

  describe("Preview Configuration", () => {
    it("has preview configuration", () => {
      expect(formSettings.preview).toBeDefined();
    });

    it("prepare returns correct title", () => {
      const result = formSettings.preview?.prepare?.({});
      expect(result?.title).toBe("Form Settings");
    });

    it("prepare returns correct subtitle", () => {
      const result = formSettings.preview?.prepare?.({});
      expect(result?.subtitle).toBe(
        "Form configuration, recipients, and content"
      );
    });
  });
});
