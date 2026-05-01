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

function getPrayerField(name: string) {
  // schema.fields is an array of defineField outputs; we look up by name
  const fields = (schema as { fields: Array<{ name: string; validation?: unknown; hidden?: unknown; initialValue?: unknown }> }).fields;
  return fields.find((f) => f.name === name);
}

describe("event schema — prayer-relative time fields", () => {
  it("exposes startTimeMode with default 'fixed'", () => {
    const field = getPrayerField("startTimeMode");
    expect(field).toBeDefined();
    expect(field?.initialValue).toBe("fixed");
  });

  it("exposes startPrayerLabel with default 'After'", () => {
    expect(getPrayerField("startPrayerLabel")?.initialValue).toBe("After");
  });

  it("exposes endTimeMode with default 'fixed'", () => {
    expect(getPrayerField("endTimeMode")?.initialValue).toBe("fixed");
  });

  it("exposes endPrayerLabel with default 'Until'", () => {
    expect(getPrayerField("endPrayerLabel")?.initialValue).toBe("Until");
  });

  it("hides startPrayer when startTimeMode is not 'prayer'", () => {
    const field = getPrayerField("startPrayer");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "prayer" } })).toBe(false);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(true);
  });

  it("hides customStartTime when startTimeMode is not 'custom'", () => {
    const field = getPrayerField("customStartTime");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(false);
  });

  it("hides existing time field when startTimeMode is prayer or custom", () => {
    const field = getPrayerField("time");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(false);
    expect(hidden?.({ document: { startTimeMode: "prayer" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(true);
  });
});
