import { describe, it, expect } from "vitest";
import eventInquiryFormSettings from "./eventInquiryFormSettings";

describe("eventInquiryFormSettings schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(eventInquiryFormSettings.name).toBe("eventInquiryFormSettings");
    });

    it("has correct schema type", () => {
      expect(eventInquiryFormSettings.type).toBe("document");
    });
  });

  describe("Fields", () => {
    const getField = (name: string) =>
      eventInquiryFormSettings.fields.find((f) => f.name === name);

    it("eventInquiryEnabled exists, is boolean, and has initialValue true", () => {
      const field = getField("eventInquiryEnabled");
      expect(field).toBeDefined();
      expect(field?.type).toBe("boolean");
      expect(field?.initialValue).toBe(true);
    });

    it("eventInquiryRecipientEmail exists and is email type", () => {
      const field = getField("eventInquiryRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
    });
  });

  describe("Preview Configuration", () => {
    it("prepare returns correct title", () => {
      const result = eventInquiryFormSettings.preview?.prepare?.({});
      expect(result?.title).toBe("Event Inquiry Form");
    });
  });
});
