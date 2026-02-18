import { describe, it, expect } from "vitest";
import { donationGoalMeterQuery } from "./queries";

describe("GROQ Queries", () => {
  describe("donationGoalMeterQuery", () => {
    it("is defined", () => {
      expect(donationGoalMeterQuery).toBeDefined();
    });

    it("is a string", () => {
      expect(typeof donationGoalMeterQuery).toBe("string");
    });

    it("queries donationGoalMeter singleton by ID", () => {
      expect(donationGoalMeterQuery).toContain('_id == "donationGoalMeter"');
    });

    it("returns only the first document (singleton)", () => {
      expect(donationGoalMeterQuery).toContain("[0]");
    });

    it("includes _id field", () => {
      expect(donationGoalMeterQuery).toContain("_id");
    });

    it("includes enabled field", () => {
      expect(donationGoalMeterQuery).toContain("enabled");
    });

    it("includes fundraiseUpElement field", () => {
      expect(donationGoalMeterQuery).toContain("fundraiseUpElement");
    });

    it("does not include unnecessary fields", () => {
      // Should not include revision, createdAt, updatedAt by default
      expect(donationGoalMeterQuery).not.toContain("_rev");
      expect(donationGoalMeterQuery).not.toContain("_createdAt");
      expect(donationGoalMeterQuery).not.toContain("_updatedAt");
    });
  });
});
