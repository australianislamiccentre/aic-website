import { describe, it, expect } from "vitest";
import schema from "./announcement";

// Sanity schema field with optional readOnly and validation
interface SchemaField {
  name: string;
  readOnly?: unknown;
  validation?: (rule: {
    custom: (
      fn: (value: unknown, context: { document: Record<string, unknown> }) => string | true,
    ) => unknown;
  }) => unknown;
}

function getField(name: string): SchemaField | undefined {
  return schema.fields.find((f) => f.name === name) as SchemaField | undefined;
}

describe("Announcement Schema", () => {
  it("has correct name and type", () => {
    expect(schema.name).toBe("announcement");
    expect(schema.type).toBe("document");
  });

  it("does not use readOnly on the featured field", () => {
    const featured = getField("featured");
    expect(featured).toBeDefined();
    expect(featured?.readOnly).toBeUndefined();
  });

  it("validates featured cannot be true when inactive", () => {
    const featured = getField("featured");
    expect(featured?.validation).toBeDefined();
    featured?.validation?.({
      custom: (fn) => {
        const result = fn(true, { document: { active: false } });
        expect(result).toContain("Cannot feature an inactive announcement");
        return {};
      },
    });
  });

  it("allows featured when active", () => {
    const featured = getField("featured");
    featured?.validation?.({
      custom: (fn) => {
        const result = fn(true, { document: { active: true } });
        expect(result).toBe(true);
        return {};
      },
    });
  });
});
