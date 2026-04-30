import { describe, it, expect } from "vitest";
import { computeDisplayAs } from "./migrate-event-display-as";

describe("computeDisplayAs (migration rule B)", () => {
  it("returns 'program' for recurring + Education", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Education"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + Youth (case-sensitive)", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Youth"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + Sports", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Sports"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + Women", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Women"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + multiple categories including a program one", () => {
    expect(
      computeDisplayAs({
        eventType: "recurring",
        categories: ["Community", "Education"],
      }),
    ).toBe("program");
  });

  it("returns 'event' for recurring + Community only (no program-category)", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Community"] }),
    ).toBe("event");
  });

  it("returns 'event' for single-day even if a program-category is set", () => {
    expect(
      computeDisplayAs({ eventType: "single", categories: ["Education"] }),
    ).toBe("event");
  });

  it("returns 'event' for multi-day", () => {
    expect(
      computeDisplayAs({ eventType: "multi", categories: ["Education"] }),
    ).toBe("event");
  });

  it("returns 'event' for missing eventType", () => {
    expect(computeDisplayAs({ categories: ["Education"] })).toBe("event");
  });

  it("returns 'event' for missing categories", () => {
    expect(computeDisplayAs({ eventType: "recurring" })).toBe("event");
  });

  it("returns 'event' for empty categories", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: [] }),
    ).toBe("event");
  });
});
