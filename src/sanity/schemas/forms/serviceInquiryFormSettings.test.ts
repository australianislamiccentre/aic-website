import { describe, it, expect } from "vitest";
import serviceInquiryFormSettings from "./serviceInquiryFormSettings";

describe("serviceInquiryFormSettings schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(serviceInquiryFormSettings.name).toBe("serviceInquiryFormSettings");
    });

    it("has correct schema type", () => {
      expect(serviceInquiryFormSettings.type).toBe("document");
    });
  });

  describe("Fields", () => {
    const getField = (name: string) =>
      serviceInquiryFormSettings.fields.find((f) => f.name === name);

    it("serviceInquiryEnabled exists, is boolean, and has initialValue true", () => {
      const field = getField("serviceInquiryEnabled");
      expect(field).toBeDefined();
      expect(field?.type).toBe("boolean");
      expect(field?.initialValue).toBe(true);
    });

    it("serviceInquiryRecipientEmail exists and is email type", () => {
      const field = getField("serviceInquiryRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
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
  });

  describe("Preview Configuration", () => {
    it("prepare returns correct title", () => {
      const result = serviceInquiryFormSettings.preview?.prepare?.({});
      expect(result?.title).toBe("Service Inquiry Form");
    });
  });
});
