import { describe, it, expect } from "vitest";
import donatePageSettings from "./donatePageSettings";

describe("donatePageSettings schema", () => {
  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(donatePageSettings.name).toBe("donatePageSettings");
    });

    it("has correct schema title", () => {
      expect(donatePageSettings.title).toBe("Donate Page Settings");
    });

    it("has correct schema type", () => {
      expect(donatePageSettings.type).toBe("document");
    });

    it("has 5 fields", () => {
      expect(donatePageSettings.fields).toHaveLength(5);
    });
  });

  describe("Hero fields", () => {
    const heroHeading = donatePageSettings.fields.find(
      (f) => f.name === "heroHeading"
    );
    const heroDescription = donatePageSettings.fields.find(
      (f) => f.name === "heroDescription"
    );

    it("heroHeading exists and is string", () => {
      expect(heroHeading).toBeDefined();
      expect(heroHeading?.type).toBe("string");
    });

    it("heroDescription exists and is text", () => {
      expect(heroDescription).toBeDefined();
      expect(heroDescription?.type).toBe("text");
    });
  });

  describe("Form field", () => {
    const formElement = donatePageSettings.fields.find(
      (f) => f.name === "formElement"
    );

    it("formElement exists and is text", () => {
      expect(formElement).toBeDefined();
      expect(formElement?.type).toBe("text");
    });
  });

  describe("Campaigns field", () => {
    const campaigns = donatePageSettings.fields.find(
      (f) => f.name === "campaigns"
    );

    it("exists and is array", () => {
      expect(campaigns).toBeDefined();
      expect(campaigns?.type).toBe("array");
    });

    it("references donationCampaign documents", () => {
      const refType = (campaigns as { of?: Array<{ type: string; to?: Array<{ type: string }> }> })?.of?.[0];
      expect(refType?.type).toBe("reference");
      expect(refType?.to).toEqual([{ type: "donationCampaign" }]);
    });

    it("filters to only show active campaigns in selector", () => {
      const refType = (campaigns as { of?: Array<{ type: string; options?: { filter: string } }> })?.of?.[0];
      expect(refType?.options?.filter).toBe("active == true");
    });
  });

  describe("Impact Stats field", () => {
    const impactStats = donatePageSettings.fields.find(
      (f) => f.name === "impactStats"
    );

    it("exists and is array", () => {
      expect(impactStats).toBeDefined();
      expect(impactStats?.type).toBe("array");
    });

    it("has object items with value and label fields", () => {
      const itemType = (impactStats as { of?: Array<{ type: string; fields?: Array<{ name: string; type: string }> }> })?.of?.[0];
      expect(itemType?.type).toBe("object");
      const fieldNames = itemType?.fields?.map((f) => f.name);
      expect(fieldNames).toContain("value");
      expect(fieldNames).toContain("label");
    });
  });

  describe("Removed fields", () => {
    it("does not have goalElement field", () => {
      expect(
        donatePageSettings.fields.find((f) => f.name === "goalElement")
      ).toBeUndefined();
    });

    it("does not have donorListElement field", () => {
      expect(
        donatePageSettings.fields.find((f) => f.name === "donorListElement")
      ).toBeUndefined();
    });

    it("does not have mapElement field", () => {
      expect(
        donatePageSettings.fields.find((f) => f.name === "mapElement")
      ).toBeUndefined();
    });

    it("does not have any boolean toggle fields", () => {
      const booleanFields = donatePageSettings.fields.filter(
        (f) => f.type === "boolean"
      );
      expect(booleanFields).toHaveLength(0);
    });
  });

  describe("Preview Configuration", () => {
    it("has preview configuration", () => {
      expect(donatePageSettings.preview).toBeDefined();
    });

    it("prepare returns correct title", () => {
      const result = donatePageSettings.preview?.prepare?.({});
      expect(result?.title).toBe("Donate Page Settings");
    });

    it("prepare returns correct subtitle", () => {
      const result = donatePageSettings.preview?.prepare?.({});
      expect(result?.subtitle).toBe("Manage donation page layout");
    });
  });
});
