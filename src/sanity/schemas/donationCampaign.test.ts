import { describe, it, expect } from "vitest";
import donationCampaign from "./donationCampaign";

describe("donationCampaign schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(donationCampaign.name).toBe("donationCampaign");
    });

    it("has correct schema title", () => {
      expect(donationCampaign.title).toBe("Donation Campaign");
    });

    it("has correct schema type", () => {
      expect(donationCampaign.type).toBe("document");
    });

    it("has 4 fields", () => {
      expect(donationCampaign.fields).toHaveLength(4);
    });
  });

  describe("Fields", () => {
    const title = donationCampaign.fields.find((f) => f.name === "title");
    const description = donationCampaign.fields.find(
      (f) => f.name === "description"
    );
    const fundraiseUpElement = donationCampaign.fields.find(
      (f) => f.name === "fundraiseUpElement"
    );
    const active = donationCampaign.fields.find((f) => f.name === "active");

    it("title exists and is string", () => {
      expect(title).toBeDefined();
      expect(title?.type).toBe("string");
    });

    it("description exists and is text", () => {
      expect(description).toBeDefined();
      expect(description?.type).toBe("text");
    });

    it("fundraiseUpElement exists and is text", () => {
      expect(fundraiseUpElement).toBeDefined();
      expect(fundraiseUpElement?.type).toBe("text");
    });

    it("active exists and is boolean", () => {
      expect(active).toBeDefined();
      expect(active?.type).toBe("boolean");
    });

    it("active defaults to true", () => {
      expect(active?.initialValue).toBe(true);
    });
  });

  describe("Removed fields", () => {
    it("does not have image field", () => {
      expect(
        donationCampaign.fields.find((f) => f.name === "image")
      ).toBeUndefined();
    });

    it("does not have order field", () => {
      expect(
        donationCampaign.fields.find((f) => f.name === "order")
      ).toBeUndefined();
    });
  });

  describe("Preview Configuration", () => {
    it("has preview configuration", () => {
      expect(donationCampaign.preview).toBeDefined();
    });

    it("shows title in preview", () => {
      const result = donationCampaign.preview?.prepare?.({
        title: "Test Campaign",
        active: true,
      });
      expect(result?.title).toBe("Test Campaign");
    });

    it("shows fallback title when title is empty", () => {
      const result = donationCampaign.preview?.prepare?.({
        title: "",
        active: true,
      });
      expect(result?.title).toBe("Untitled Campaign");
    });

    it("shows Active subtitle when active", () => {
      const result = donationCampaign.preview?.prepare?.({
        title: "Test",
        active: true,
      });
      expect(result?.subtitle).toBe("Active");
    });

    it("shows Inactive subtitle when inactive", () => {
      const result = donationCampaign.preview?.prepare?.({
        title: "Test",
        active: false,
      });
      expect(result?.subtitle).toBe("Inactive");
    });

    it("does not include media in preview", () => {
      const result = donationCampaign.preview?.prepare?.({
        title: "Test",
        active: true,
      });
      expect(result).not.toHaveProperty("media");
    });
  });
});
