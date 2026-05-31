/**
 * Tests for safeEqual (constant-time secret comparison) — regression: issue #71
 */
import { describe, it, expect } from "vitest";
import { safeEqual } from "./timing-safe";

describe("safeEqual", () => {
  it("returns true for identical strings", () => {
    expect(safeEqual("s3cret-revalidate-token", "s3cret-revalidate-token")).toBe(
      true
    );
  });

  it("returns false for different strings of equal length", () => {
    expect(safeEqual("aaaaaa", "aaaaab")).toBe(false);
  });

  it("returns false for strings of different length", () => {
    expect(safeEqual("short", "much-longer-secret")).toBe(false);
  });

  it("returns false when either side is null or undefined", () => {
    expect(safeEqual(null, "x")).toBe(false);
    expect(safeEqual("x", undefined)).toBe(false);
    expect(safeEqual(undefined, undefined)).toBe(false);
    expect(safeEqual(null, null)).toBe(false);
  });

  it("returns true for two empty strings", () => {
    expect(safeEqual("", "")).toBe(true);
  });

  it("mirrors === semantics across assorted pairs", () => {
    const pairs: Array<[string, string]> = [
      ["a", "a"],
      ["a", "b"],
      ["", ""],
      ["abc", "abcd"],
      ["123456", "123456"],
      ["café", "café"],
    ];
    for (const [a, b] of pairs) {
      expect(safeEqual(a, b)).toBe(a === b);
    }
  });
});
