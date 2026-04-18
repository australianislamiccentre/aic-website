/**
 * Resolve Link URL
 *
 * Resolves a Sanity link object to a URL string. Handles the
 * "Site Page" / "Custom URL" pattern used in header and footer settings.
 *
 * @module lib/resolve-link
 */

interface SanityLink {
  linkType?: "page" | "custom";
  page?: string;
  customUrl?: string;
  url?: string; // legacy fallback
}

/**
 * Resolves a link object to a URL string.
 * Priority: linkType=page -> page field, linkType=custom -> customUrl, fallback -> url field -> default
 */
export function resolveLink(link: SanityLink | undefined | null, fallback: string = "#"): string {
  if (!link) return fallback;
  if (link.linkType === "custom" && link.customUrl) return link.customUrl;
  if (link.linkType === "page" && link.page) return link.page;
  // Legacy fallback for old data that just has url
  if (link.url) return link.url;
  if (link.page) return link.page;
  return fallback;
}
