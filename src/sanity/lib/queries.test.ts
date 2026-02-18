import { describe, it, expect } from "vitest";
import { donatePageSettingsQuery } from "./queries";

describe("GROQ Queries", () => {
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
