import { describe, it, expect } from "vitest";
import donationGoalMeter from "./donationGoalMeter";

describe("donationGoalMeter schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(donationGoalMeter.name).toBe("donationGoalMeter");
    });

    it("has correct schema title", () => {
      expect(donationGoalMeter.title).toBe("Donation Goal Meter");
    });

    it("has correct schema type", () => {
      expect(donationGoalMeter.type).toBe("document");
    });

    it("has exactly 2 fields", () => {
      expect(donationGoalMeter.fields).toHaveLength(2);
    });
  });

  describe("enabled field", () => {
    const enabledField = donationGoalMeter.fields.find(
      (f) => f.name === "enabled"
    );

    it("exists", () => {
      expect(enabledField).toBeDefined();
    });

    it("has correct type", () => {
      expect(enabledField?.type).toBe("boolean");
    });

    it("has correct title", () => {
      expect(enabledField?.title).toBe("Enable Goal Meter");
    });

    it("has initial value of false", () => {
      expect(enabledField?.initialValue).toBe(false);
    });

    it("has description", () => {
      expect(enabledField?.description).toBeDefined();
      expect(enabledField?.description).toContain("show/hide");
    });
  });

  describe("fundraiseUpElement field", () => {
    const elementField = donationGoalMeter.fields.find(
      (f) => f.name === "fundraiseUpElement"
    );

    it("exists", () => {
      expect(elementField).toBeDefined();
    });

    it("has correct type", () => {
      expect(elementField?.type).toBe("text");
    });

    it("has correct title", () => {
      expect(elementField?.title).toBe("Fundraise Up Element Code");
    });

    it("has rows configuration", () => {
      expect(elementField?.rows).toBe(3);
    });

    it("has description with example", () => {
      expect(elementField?.description).toBeDefined();
      expect(elementField?.description).toContain("Fundraise Up");
      expect(elementField?.description).toContain("HTML snippet");
    });
  });

  describe("Preview Configuration", () => {
    it("has preview configuration", () => {
      expect(donationGoalMeter.preview).toBeDefined();
    });

    it("selects enabled field", () => {
      expect(donationGoalMeter.preview?.select).toEqual({
        enabled: "enabled",
      });
    });

    it("has prepare function", () => {
      expect(donationGoalMeter.preview?.prepare).toBeDefined();
      expect(typeof donationGoalMeter.preview?.prepare).toBe("function");
    });

    it("prepare returns correct title", () => {
      const result = donationGoalMeter.preview?.prepare?.({ enabled: true });
      expect(result?.title).toBe("Donation Goal Meter");
    });

    it("prepare returns 'Enabled' subtitle when enabled is true", () => {
      const result = donationGoalMeter.preview?.prepare?.({ enabled: true });
      expect(result?.subtitle).toBe("Enabled");
    });

    it("prepare returns 'Disabled' subtitle when enabled is false", () => {
      const result = donationGoalMeter.preview?.prepare?.({ enabled: false });
      expect(result?.subtitle).toBe("Disabled");
    });

    it("prepare returns 'Disabled' subtitle when enabled is undefined", () => {
      const result = donationGoalMeter.preview?.prepare?.({ enabled: undefined });
      expect(result?.subtitle).toBe("Disabled");
    });
  });
});
