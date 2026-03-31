import { describe, it, expect } from "vitest";
import allowedFormDomains from "./allowedFormDomains";

describe("allowedFormDomains schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(allowedFormDomains.name).toBe("allowedFormDomains");
    });

    it("has correct schema type", () => {
      expect(allowedFormDomains.type).toBe("document");
    });
  });

  describe("Fields", () => {
    const getField = (name: string) =>
      allowedFormDomains.fields.find((f) => f.name === name);

    it("allowedDomains exists and is array type", () => {
      const field = getField("allowedDomains");
      expect(field).toBeDefined();
      expect(field?.type).toBe("array");
    });
  });

  describe("Preview Configuration", () => {
    it("prepare returns correct title", () => {
      const result = allowedFormDomains.preview?.prepare?.({});
      expect(result?.title).toBe("Allowed Form Domains");
    });
  });
});
