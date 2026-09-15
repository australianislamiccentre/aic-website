import { describe, it, expect } from "vitest";
import { DEFAULT_EMBED_DOMAINS, isAllowedEmbedUrl } from "./embed-domains";

describe("isAllowedEmbedUrl", () => {
  it("trusts JotForm payment forms on pci.jotform.com (regression: paid event registrations were hidden)", () => {
    // Live siteSettings only listed form.jotform.com, so every form with a payment field vanished.
    expect(
      isAllowedEmbedUrl("https://pci.jotform.com/form/262558336270864", ["form.jotform.com"]),
    ).toBe(true);
  });

  it("trusts every JotForm and Typeform host with no Site Settings domains at all", () => {
    expect(isAllowedEmbedUrl("https://form.jotform.com/AICFORM/2026-hajj-day", [])).toBe(true);
    expect(isAllowedEmbedUrl("https://www.jotform.com/form/262558336270864", [])).toBe(true);
    expect(isAllowedEmbedUrl("https://aic.typeform.com/to/AbC123", [])).toBe(true);
  });

  it("allows a domain added in Site Settings, including its subdomains", () => {
    expect(
      isAllowedEmbedUrl("https://docs.google.com/forms/d/e/abc/viewform", ["docs.google.com"]),
    ).toBe(true);
    expect(isAllowedEmbedUrl("https://forms.office.com/r/abc", ["office.com"])).toBe(true);
  });

  it("rejects a provider that is neither built in nor listed in Site Settings", () => {
    expect(isAllowedEmbedUrl("https://docs.google.com/forms/d/e/abc/viewform", [])).toBe(false);
  });

  it("matches Site Settings domains case-insensitively", () => {
    expect(
      isAllowedEmbedUrl("https://docs.google.com/forms/d/e/abc/viewform", ["Docs.Google.com"]),
    ).toBe(true);
  });

  it("ignores blank Site Settings entries instead of matching everything", () => {
    expect(isAllowedEmbedUrl("https://evil.example/form", [""])).toBe(false);
  });

  it("rejects non-HTTPS URLs even on a trusted domain", () => {
    expect(isAllowedEmbedUrl("http://form.jotform.com/123", [])).toBe(false);
  });

  it("rejects look-alike hosts that merely contain a trusted domain", () => {
    expect(isAllowedEmbedUrl("https://jotform.com.evil.example/form", [])).toBe(false);
    expect(isAllowedEmbedUrl("https://evil-jotform.com/form", [])).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isAllowedEmbedUrl("not a url", ["jotform.com"])).toBe(false);
  });
});

describe("DEFAULT_EMBED_DOMAINS", () => {
  it("includes the form providers the site trusts without configuration", () => {
    expect(DEFAULT_EMBED_DOMAINS).toEqual(expect.arrayContaining(["jotform.com", "typeform.com"]));
  });
});
