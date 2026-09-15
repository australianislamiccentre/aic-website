import { describe, it, expect } from "vitest";
import schema from "./event";

// Sanity schema field with optional readOnly, validation, options, hidden, and initialValue
interface SchemaField {
  name: string;
  readOnly?: unknown;
  hidden?: unknown;
  initialValue?: unknown;
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

describe("event schema — prayer-relative time fields", () => {
  it("exposes startTimeMode with default 'fixed'", () => {
    const field = getField("startTimeMode");
    expect(field).toBeDefined();
    expect(field?.initialValue).toBe("fixed");
  });

  it("exposes startPrayerLabel with default 'After'", () => {
    expect(getField("startPrayerLabel")?.initialValue).toBe("After");
  });

  it("exposes endTimeMode with default 'fixed'", () => {
    expect(getField("endTimeMode")?.initialValue).toBe("fixed");
  });

  it("exposes endPrayerLabel with default 'Until'", () => {
    expect(getField("endPrayerLabel")?.initialValue).toBe("Until");
  });

  it("hides startPrayer when startTimeMode is not 'prayer'", () => {
    const field = getField("startPrayer");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "prayer" } })).toBe(false);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(true);
  });

  it("hides customStartTime when startTimeMode is not 'custom'", () => {
    const field = getField("customStartTime");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(false);
  });

  it("hides existing time field when startTimeMode is prayer or custom", () => {
    const field = getField("time");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(false);
    expect(hidden?.({ document: { startTimeMode: "prayer" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(true);
  });
});

type ValidationContext = {
  document: Record<string, unknown>;
  getClient?: (options: { apiVersion: string }) => { fetch: (query: string) => Promise<unknown> };
};
type CustomValidator = (value: unknown, context: ValidationContext) => string | true | Promise<string | true>;

/** Minimal stand-in for Sanity's Rule builder: records each custom() rule and its severity. */
function collectCustomRules(fieldName: string) {
  const rules: Array<{ validate: CustomValidator; level: "error" | "warning" }> = [];
  const rule = {
    custom(validate: CustomValidator) {
      const entry: { validate: CustomValidator; level: "error" | "warning" } = { validate, level: "error" };
      rules.push(entry);
      const chain = {
        warning: () => {
          entry.level = "warning";
          return chain;
        },
        error: () => chain,
      };
      return chain;
    },
  };
  (getField(fieldName)?.validation as unknown as (r: typeof rule) => unknown)(rule);
  return rules;
}

function siteSettingsClient(fetch: () => Promise<unknown>): ValidationContext["getClient"] {
  return () => ({ fetch });
}

describe("Event Schema — embedFormUrl validation", () => {
  const embedDoc = { formType: "embed" };

  it("still requires a URL when the external form embed is selected", async () => {
    const errorRule = collectCustomRules("embedFormUrl").find((r) => r.level === "error");
    expect(await errorRule?.validate(undefined, { document: embedDoc })).toContain("Form URL is required");
  });

  it("warns the editor when the form's domain isn't trusted, because the form won't show on the site", async () => {
    const warningRule = collectCustomRules("embedFormUrl").find((r) => r.level === "warning");
    expect(warningRule).toBeDefined();
    const result = await warningRule?.validate("https://forms.office.com/r/abc", {
      document: embedDoc,
      getClient: siteSettingsClient(async () => ["docs.google.com"]),
    });
    expect(result).toMatch(/Trusted Embed Domains/);
  });

  it("does not warn for JotForm payment forms, which are trusted by default", async () => {
    const warningRule = collectCustomRules("embedFormUrl").find((r) => r.level === "warning");
    const result = await warningRule?.validate("https://pci.jotform.com/form/262558336270864", {
      document: embedDoc,
      getClient: siteSettingsClient(async () => ["form.jotform.com"]),
    });
    expect(result).toBe(true);
  });

  it("does not warn for a domain listed in Site Settings", async () => {
    const warningRule = collectCustomRules("embedFormUrl").find((r) => r.level === "warning");
    const result = await warningRule?.validate("https://docs.google.com/forms/d/e/abc/viewform", {
      document: embedDoc,
      getClient: siteSettingsClient(async () => ["docs.google.com"]),
    });
    expect(result).toBe(true);
  });

  it("does not warn when Site Settings can't be read", async () => {
    const warningRule = collectCustomRules("embedFormUrl").find((r) => r.level === "warning");
    const result = await warningRule?.validate("https://forms.office.com/r/abc", {
      document: embedDoc,
      getClient: siteSettingsClient(async () => {
        throw new Error("network down");
      }),
    });
    expect(result).toBe(true);
  });

  it("does not warn about a leftover URL when the embed form isn't selected", async () => {
    const warningRule = collectCustomRules("embedFormUrl").find((r) => r.level === "warning");
    const result = await warningRule?.validate("https://forms.office.com/r/abc", {
      document: { formType: "none" },
      getClient: siteSettingsClient(async () => []),
    });
    expect(result).toBe(true);
  });
});
