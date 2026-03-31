import { describe, it, expect } from "vitest";
import offlineDonations from "./offlineDonations";

describe("offlineDonations schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(offlineDonations.name).toBe("offlineDonations");
    });

    it("has correct schema title", () => {
      expect(offlineDonations.title).toBe("Offline Donations");
    });

    it("has correct schema type", () => {
      expect(offlineDonations.type).toBe("document");
    });

    it("has 1 field (donations array)", () => {
      expect(offlineDonations.fields).toHaveLength(1);
    });
  });

  describe("Donations field", () => {
    const donationsField = offlineDonations.fields.find(
      (f) => f.name === "donations"
    );

    it("exists and is an array", () => {
      expect(donationsField).toBeDefined();
      expect(donationsField?.type).toBe("array");
    });

    it("has object items with label and amount fields", () => {
      const arrayOf = (donationsField as { of?: { type: string; fields?: { name: string; type: string }[] }[] }).of;
      expect(arrayOf).toBeDefined();
      expect(arrayOf).toHaveLength(1);

      const objectItem = arrayOf![0];
      expect(objectItem.type).toBe("object");
      expect(objectItem.fields).toBeDefined();

      const labelField = objectItem.fields!.find((f) => f.name === "label");
      expect(labelField).toBeDefined();
      expect(labelField!.type).toBe("string");

      const amountField = objectItem.fields!.find((f) => f.name === "amount");
      expect(amountField).toBeDefined();
      expect(amountField!.type).toBe("number");
    });
  });

  describe("Preview Configuration", () => {
    it("has document-level preview", () => {
      expect(offlineDonations.preview).toBeDefined();
    });

    it("shows static title in document preview", () => {
      const result = offlineDonations.preview?.prepare?.({});
      expect(result?.title).toBe("Offline Donations");
    });

    it("shows subtitle in document preview", () => {
      const result = offlineDonations.preview?.prepare?.({});
      expect(result?.subtitle).toBe(
        "Non-FundraiseUp donations for live progress bar"
      );
    });
  });
});
