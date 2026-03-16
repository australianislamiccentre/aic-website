/**
 * Tests for utils.ts
 *
 * Covers: cn(), formatDate(), formatTime(), formatCurrency(),
 * truncateText(), slugify(), getInitials().
 */
import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatTime,
  formatCurrency,
  truncateText,
  slugify,
  getInitials,
} from "./utils";

// ---------------------------------------------------------------------------
// cn — class name merging
// ---------------------------------------------------------------------------
describe("cn", () => {
  it("merges simple class names", () => {
    expect(cn("p-4", "text-red-500")).toBe("p-4 text-red-500");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("merges arrays of class names", () => {
    expect(cn(["p-4", "text-sm"])).toBe("p-4 text-sm");
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe("formatDate", () => {
  it("formats a Date object with weekday, day, month, year", () => {
    // 22 Feb 2026 is a Sunday in Melbourne
    const result = formatDate(new Date("2026-02-22T00:00:00+11:00"));
    expect(result).toContain("2026");
    expect(result).toContain("February");
    expect(result).toContain("22");
  });

  it("formats an ISO date string", () => {
    const result = formatDate("2026-01-01T00:00:00+11:00");
    expect(result).toContain("January");
    expect(result).toContain("2026");
  });

  it("handles string date input", () => {
    const result = formatDate("2025-12-25");
    expect(result).toContain("December");
    expect(result).toContain("2025");
  });
});

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------
describe("formatTime", () => {
  it("formats time in 12-hour format", () => {
    // 14:30 AEDT
    const result = formatTime("2026-02-22T14:30:00+11:00");
    expect(result).toMatch(/2:30\s*pm/i);
  });

  it("formats midnight correctly", () => {
    const result = formatTime("2026-02-22T00:00:00+11:00");
    expect(result).toMatch(/12:00\s*am/i);
  });
});

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
describe("formatCurrency", () => {
  it("formats whole dollars", () => {
    const result = formatCurrency(1234);
    expect(result).toContain("1,234");
    expect(result).toContain("$");
  });

  it("formats cents", () => {
    const result = formatCurrency(99.5);
    expect(result).toContain("99.50");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0.00");
  });
});

// ---------------------------------------------------------------------------
// truncateText
// ---------------------------------------------------------------------------
describe("truncateText", () => {
  it("returns full text if within limit", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  it("truncates and appends ellipsis", () => {
    expect(truncateText("Hello World", 5)).toBe("Hello...");
  });

  it("handles exact length", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------
describe("slugify", () => {
  it("converts to lowercase with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens and spaces", () => {
    expect(slugify("hello   world---test")).toBe("hello-world-test");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify(" --hello-- ")).toBe("hello");
  });

  it("handles underscores", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });
});

// ---------------------------------------------------------------------------
// getInitials
// ---------------------------------------------------------------------------
describe("getInitials", () => {
  it("extracts two initials from a full name", () => {
    expect(getInitials("John Smith")).toBe("JS");
  });

  it("returns one initial for a single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("limits to two initials for three-word names", () => {
    expect(getInitials("John Paul Smith")).toBe("JP");
  });

  it("uppercases initials", () => {
    expect(getInitials("john smith")).toBe("JS");
  });
});
