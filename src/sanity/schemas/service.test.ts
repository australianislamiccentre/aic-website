import { describe, it, expect } from "vitest";
import service from "./service";

describe("service schema", () => {
  const getField = (name: string) =>
    service.fields.find((f) => f.name === name);

  describe("Schema Structure", () => {
    it("has correct schema name", () => {
      expect(service.name).toBe("service");
    });

    it("has correct schema type", () => {
      expect(service.type).toBe("document");
    });

    it("has 4 field groups", () => {
      expect(service.groups).toHaveLength(4);
    });

    it("has correct group names", () => {
      const groupNames = service.groups!.map((g) => g.name);
      expect(groupNames).toEqual(["basic", "details", "contact", "settings"]);
    });

    it("basic group is the default", () => {
      const basicGroup = service.groups!.find((g) => g.name === "basic");
      expect(basicGroup?.default).toBe(true);
    });
  });

  describe("New fields: highlights", () => {
    it("exists and is array type", () => {
      const field = getField("highlights");
      expect(field).toBeDefined();
      expect(field?.type).toBe("array");
    });

    it("is in the basic group", () => {
      const field = getField("highlights");
      expect(field?.group).toBe("basic");
    });

    it("description mentions the /services listing page", () => {
      const field = getField("highlights");
      expect(field?.description).toContain("/services listing page");
    });
  });

  describe("New fields: keyFeatures", () => {
    it("exists and is array type", () => {
      const field = getField("keyFeatures");
      expect(field).toBeDefined();
      expect(field?.type).toBe("array");
    });

    it("is in the basic group", () => {
      const field = getField("keyFeatures");
      expect(field?.group).toBe("basic");
    });

    it("description mentions the SERVICE DETAIL PAGE", () => {
      const field = getField("keyFeatures");
      expect(field?.description).toContain("SERVICE DETAIL PAGE");
    });
  });

  describe("New fields: formRecipientEmail", () => {
    it("exists and is email type", () => {
      const field = getField("formRecipientEmail");
      expect(field).toBeDefined();
      expect(field?.type).toBe("email");
    });

    it("is in the contact group", () => {
      const field = getField("formRecipientEmail");
      expect(field?.group).toBe("contact");
    });

    it("description mentions fallback to global settings", () => {
      const field = getField("formRecipientEmail");
      expect(field?.description).toContain("Form Settings");
    });
  });

  describe("Icon field", () => {
    it("exists and is string type", () => {
      const field = getField("icon");
      expect(field).toBeDefined();
      expect(field?.type).toBe("string");
    });

    it("has all 14 icon options", () => {
      const field = getField("icon");
      const options = (field?.options as { list: { value: string }[] })?.list;
      expect(options).toHaveLength(14);
    });

    it("icon values use PascalCase matching Lucide component names", () => {
      const field = getField("icon");
      const options = (field?.options as { list: { value: string }[] })?.list;
      const values = options.map((o) => o.value);
      expect(values).toEqual(
        expect.arrayContaining([
          "Moon", "Heart", "BookOpen", "Users", "Calendar",
          "Star", "Home", "HandHeart", "GraduationCap", "Church",
          "Baby", "Scroll", "MessageCircle", "Scale",
        ])
      );
    });
  });

  describe("Field descriptions clarify where content appears", () => {
    it("shortDescription mentions /services page", () => {
      const field = getField("shortDescription");
      expect(field?.description).toContain("/services page");
    });

    it("fullDescription mentions service detail page", () => {
      const field = getField("fullDescription");
      expect(field?.description).toContain("service detail page");
    });

    it("requirements mentions service detail page", () => {
      const field = getField("requirements");
      expect(field?.description).toContain("service detail page");
    });

    it("featured mentions homepage", () => {
      const field = getField("featured");
      expect(field?.description).toContain("homepage");
    });

    it("active mentions /services listing page", () => {
      const field = getField("active");
      expect(field?.description).toContain("/services listing page");
    });

    it("image mentions recommended size", () => {
      const field = getField("image");
      expect(field?.description).toContain("1200");
    });
  });

  describe("Preview configuration", () => {
    it("prepare adds star badge for featured services", () => {
      const result = service.preview?.prepare?.({
        title: "Test Service",
        featured: true,
        active: true,
      });
      expect(result?.title).toContain("⭐");
      expect(result?.title).toContain("Test Service");
    });

    it("prepare adds inactive badge when active is false", () => {
      const result = service.preview?.prepare?.({
        title: "Test Service",
        featured: false,
        active: false,
      });
      expect(result?.title).toContain("(Inactive)");
    });

    it("prepare returns clean title when not featured and active", () => {
      const result = service.preview?.prepare?.({
        title: "Test Service",
        featured: false,
        active: true,
      });
      expect(result?.title).toBe("Test Service");
    });
  });
});
