import { describe, it, expect } from "vitest";
import schema from "./event";

// Sanity schema field with optional readOnly, validation, and options
interface SchemaField {
  name: string;
  readOnly?: unknown;
  options?: {
    list?: Array<{ title: string; value: string }>;
  };
  validation?: (rule: {
    custom: (
      fn: (value: unknown, context: { document: Record<string, unknown> }) => string | true,
    ) => unknown;
  }) => unknown;
}

function getField(name: string): SchemaField | undefined {
  return schema.fields.find((f) => f.name === name) as SchemaField | undefined;
}

describe("Event Schema", () => {
  it("has correct name and type", () => {
    expect(schema.name).toBe("event");
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
        expect(result).toContain("Cannot feature an inactive event");
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

  it("has eventType field with single, multi, recurring options", () => {
    const eventType = getField("eventType");
    expect(eventType).toBeDefined();
    const values = eventType?.options?.list?.map((o) => o.value);
    expect(values).toContain("single");
    expect(values).toContain("multi");
    expect(values).toContain("recurring");
  });

  it("has displayAs field with program, event, and both options", () => {
    const displayAs = getField("displayAs");
    expect(displayAs).toBeDefined();
    const values = displayAs?.options?.list?.map((o) => o.value);
    expect(values).toEqual(["program", "event", "both"]);
  });

  it("does NOT mark displayAs as required in phase 1 (migration sequencing)", () => {
    const displayAs = getField("displayAs");
    // Phase 1 ships without Rule.required() so unmigrated docs don't fail
    // validation in Studio. Phase 3 (separate follow-up commit) tightens it.
    expect(displayAs?.validation).toBeUndefined();
  });

  // The preview prepare() function lives inside the schema export, not in fields.
  // We access it via the default-exported schema object.
  it("preview prepare() prefixes subtitle with display badge", () => {
    const prepare = (schema as unknown as {
      preview: {
        prepare: (selection: Record<string, unknown>) => { title: string; subtitle: string };
      };
    }).preview.prepare;

    const program = prepare({
      title: "Quran Class",
      eventType: "recurring",
      recurringDay: "Mondays",
      displayAs: "program",
      active: true,
    });
    expect(program.subtitle).toContain("📋 Program");

    const event = prepare({
      title: "Eid Dinner",
      eventType: "single",
      date: "2026-05-20",
      displayAs: "event",
      active: true,
    });
    expect(event.subtitle).toContain("📅 Event");

    const both = prepare({
      title: "Open Day",
      eventType: "single",
      date: "2026-06-01",
      displayAs: "both",
      active: true,
    });
    expect(both.subtitle).toContain("⚡ Program & Event");
  });
});
