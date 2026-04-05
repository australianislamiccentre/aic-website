import { describe, it, expect } from "vitest";
import { resolveLink } from "./resolve-link";

describe("resolveLink", () => {
  it("returns page when linkType is page", () => {
    expect(resolveLink({ linkType: "page", page: "/donate" })).toBe("/donate");
  });

  it("returns customUrl when linkType is custom", () => {
    expect(resolveLink({ linkType: "custom", customUrl: "https://example.com" })).toBe("https://example.com");
  });

  it("falls back to url field for legacy data", () => {
    expect(resolveLink({ url: "/about" })).toBe("/about");
  });

  it("falls back to page field when linkType is missing", () => {
    expect(resolveLink({ page: "/contact" })).toBe("/contact");
  });

  it("returns fallback when link is null", () => {
    expect(resolveLink(null, "/donate")).toBe("/donate");
  });

  it("returns fallback when link is undefined", () => {
    expect(resolveLink(undefined, "/donate")).toBe("/donate");
  });

  it("returns # as default fallback", () => {
    expect(resolveLink({})).toBe("#");
  });

  it("prefers customUrl over page when linkType is custom", () => {
    expect(resolveLink({ linkType: "custom", customUrl: "https://ext.com", page: "/donate" })).toBe("https://ext.com");
  });

  it("prefers page over customUrl when linkType is page", () => {
    expect(resolveLink({ linkType: "page", page: "/about", customUrl: "https://ext.com" })).toBe("/about");
  });
});
