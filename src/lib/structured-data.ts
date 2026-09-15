/**
 * Structured data (JSON-LD) builders
 *
 * @module lib/structured-data
 */
import { aicInfo } from "@/data/content";
import type { SanitySiteSettings } from "@/types/sanity";

/** Uses the Studio value when it has content, otherwise the hardcoded default. */
function text(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

/**
 * Site-wide `Mosque` schema for the root layout, driven by Site Settings so
 * the structured data always matches the phone number and address shown in
 * the header and footer.
 */
export function buildMosqueJsonLd(settings: SanitySiteSettings | null | undefined) {
  const address = settings?.address;
  return {
    "@context": "https://schema.org",
    "@type": "Mosque",
    name: text(settings?.organizationName, aicInfo.name),
    url: "https://australianislamiccentre.org",
    address: {
      "@type": "PostalAddress",
      streetAddress: text(address?.street, aicInfo.address.street),
      addressLocality: text(address?.suburb, aicInfo.address.suburb),
      addressRegion: text(address?.state, aicInfo.address.state),
      postalCode: text(address?.postcode, aicInfo.address.postcode),
      addressCountry: "AU",
    },
    telephone: text(settings?.phone, aicInfo.phone),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "04:30",
      closes: "22:30",
    },
  };
}
