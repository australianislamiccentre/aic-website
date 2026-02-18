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

    it("has 5 field groups", () => {
      expect(donatePageSettings.groups).toHaveLength(5);
    });

    it("has correct group names", () => {
      const groupNames = donatePageSettings.groups!.map((g) => g.name);
      expect(groupNames).toEqual(["goal", "form", "campaigns", "donors", "map"]);
    });

    it("has 10 fields", () => {
      expect(donatePageSettings.fields).toHaveLength(10);
    });
  });

  describe("Goal Meter fields", () => {
    const goalEnabled = donatePageSettings.fields.find(
      (f) => f.name === "goalEnabled"
    );
    const goalElement = donatePageSettings.fields.find(
      (f) => f.name === "goalElement"
    );

    it("goalEnabled exists and is boolean", () => {
      expect(goalEnabled).toBeDefined();
      expect(goalEnabled?.type).toBe("boolean");
    });

    it("goalEnabled defaults to false", () => {
      expect(goalEnabled?.initialValue).toBe(false);
    });

    it("goalElement exists and is text", () => {
      expect(goalElement).toBeDefined();
      expect(goalElement?.type).toBe("text");
    });
  });

  describe("Form fields", () => {
    const formEnabled = donatePageSettings.fields.find(
      (f) => f.name === "formEnabled"
    );
    const formElement = donatePageSettings.fields.find(
      (f) => f.name === "formElement"
    );

    it("formEnabled exists and is boolean", () => {
      expect(formEnabled).toBeDefined();
      expect(formEnabled?.type).toBe("boolean");
    });

    it("formEnabled defaults to false", () => {
      expect(formEnabled?.initialValue).toBe(false);
    });

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
  });

  describe("Donor List fields", () => {
    const donorListEnabled = donatePageSettings.fields.find(
      (f) => f.name === "donorListEnabled"
    );
    const donorListElement = donatePageSettings.fields.find(
      (f) => f.name === "donorListElement"
    );

    it("donorListEnabled exists and is boolean", () => {
      expect(donorListEnabled).toBeDefined();
      expect(donorListEnabled?.type).toBe("boolean");
    });

    it("donorListElement exists and is text", () => {
      expect(donorListElement).toBeDefined();
      expect(donorListElement?.type).toBe("text");
    });
  });

  describe("Map fields", () => {
    const mapEnabled = donatePageSettings.fields.find(
      (f) => f.name === "mapEnabled"
    );
    const mapTitle = donatePageSettings.fields.find(
      (f) => f.name === "mapTitle"
    );
    const mapElement = donatePageSettings.fields.find(
      (f) => f.name === "mapElement"
    );

    it("mapEnabled exists and is boolean", () => {
      expect(mapEnabled).toBeDefined();
      expect(mapEnabled?.type).toBe("boolean");
    });

    it("mapTitle exists and is string", () => {
      expect(mapTitle).toBeDefined();
      expect(mapTitle?.type).toBe("string");
    });

    it("mapElement exists and is text", () => {
      expect(mapElement).toBeDefined();
      expect(mapElement?.type).toBe("text");
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
      expect(result?.subtitle).toBe("Manage donation page elements");
    });
  });
});
