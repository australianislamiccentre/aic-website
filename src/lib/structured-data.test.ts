import { describe, it, expect } from "vitest";
import { buildMosqueJsonLd } from "./structured-data";
import { aicInfo } from "@/data/content";
import type { SanitySiteSettings } from "@/types/sanity";

describe("buildMosqueJsonLd", () => {
  it("uses the phone number and address from Site Settings (regression: JSON-LD had an old hardcoded number)", () => {
    const jsonLd = buildMosqueJsonLd({
      organizationName: "Australian Islamic Centre",
      phone: "03 9000 0177",
      address: { street: " 23-27 Blenheim Rd", suburb: "Newport", state: "VIC", postcode: "3015" },
    } as SanitySiteSettings);

    expect(jsonLd.telephone).toBe("03 9000 0177");
    expect(jsonLd.address).toMatchObject({
      streetAddress: "23-27 Blenheim Rd",
      addressLocality: "Newport",
      addressRegion: "VIC",
      postalCode: "3015",
      addressCountry: "AU",
    });
  });

  it("falls back to the default contact details when Site Settings is missing", () => {
    const jsonLd = buildMosqueJsonLd(null);

    expect(jsonLd.name).toBe(aicInfo.name);
    expect(jsonLd.telephone).toBe(aicInfo.phone);
    expect(jsonLd.address.streetAddress).toBe(aicInfo.address.street);
  });

  it("describes the organisation as a Mosque", () => {
    const jsonLd = buildMosqueJsonLd(null);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Mosque");
  });
});
