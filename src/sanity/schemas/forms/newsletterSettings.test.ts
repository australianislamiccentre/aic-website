import { describe, it, expect } from "vitest";
import newsletterSettings from "./newsletterSettings";

describe("newsletterSettings schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(newsletterSettings.name).toBe("newsletterSettings");
    });

    it("has correct schema type", () => {
      expect(newsletterSettings.type).toBe("document");
    });
  });

  describe("Fields", () => {
    const getField = (name: string) =>
      newsletterSettings.fields.find((f) => f.name === name);

    it("newsletterEnabled exists, is boolean, and has initialValue true", () => {
      const field = getField("newsletterEnabled");
      expect(field).toBeDefined();
      expect(field?.type).toBe("boolean");
      expect(field?.initialValue).toBe(true);
    });

    it("newsletterRecipientEmail exists and is email type", () => {
      const field = getField("newsletterRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
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
  });

  describe("Preview Configuration", () => {
    it("prepare returns correct title", () => {
      const result = newsletterSettings.preview?.prepare?.({});
      expect(result?.title).toBe("Newsletter");
    });
  });
});
