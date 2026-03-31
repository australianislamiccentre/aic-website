import { describe, it, expect } from "vitest";
import contactFormSettings from "./contactFormSettings";

describe("contactFormSettings schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(contactFormSettings.name).toBe("contactFormSettings");
    });

    it("has correct schema type", () => {
      expect(contactFormSettings.type).toBe("document");
    });
  });

  describe("Fields", () => {
    const getField = (name: string) =>
      contactFormSettings.fields.find((f) => f.name === name);

    it("contactEnabled exists, is boolean, and has initialValue true", () => {
      const field = getField("contactEnabled");
      expect(field).toBeDefined();
      expect(field?.type).toBe("boolean");
      expect(field?.initialValue).toBe(true);
    });

    it("contactRecipientEmail exists and is email type", () => {
      const field = getField("contactRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
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

    it("contactInquiryTypes exists and is array", () => {
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
  });

  describe("Preview Configuration", () => {
    it("prepare returns correct title", () => {
      const result = contactFormSettings.preview?.prepare?.({});
      expect(result?.title).toBe("Contact Form");
    });
  });
});
