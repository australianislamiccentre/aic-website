/**
 * SEO helpers
 *
 * @module lib/seo
 */

const SITE_NAME = "Australian Islamic Centre";

/** Matches a trailing " | Australian Islamic Centre" (or "-", "–", "—" separators). */
const SITE_NAME_SUFFIX = new RegExp(`\\s*[|\\-–—]\\s*${SITE_NAME}\\s*$`, "i");

/**
 * Resolves a page's `<title>` segment from the Studio "Meta Title" field.
 *
 * The root layout's title template appends " | Australian Islamic Centre" to
 * every page title, so a site name typed into Studio (its old placeholder
 * suggested exactly that) would appear twice. Strip it here and fall back to
 * the page's default when nothing usable is left.
 */
export function pageTitle(sanityTitle: string | null | undefined, fallback: string): string {
  const cleaned = (sanityTitle ?? "").replace(SITE_NAME_SUFFIX, "").trim();
  if (!cleaned || cleaned.toLowerCase() === SITE_NAME.toLowerCase()) return fallback;
  return cleaned;
}
