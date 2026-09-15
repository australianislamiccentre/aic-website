/**
 * Trusted Embed Domains
 *
 * Single source of truth for which third-party pages the site may show in an
 * iframe. The CSP `frame-src` directive (middleware) and the event page's form
 * embed both build on this list, so the two can't disagree about whether a
 * form is allowed to load.
 *
 * A domain covers itself and all of its subdomains: `jotform.com` matches
 * form.jotform.com, www.jotform.com and pci.jotform.com (the host JotForm
 * gives out for forms with a payment field).
 *
 * Has no imports so it can be used from Edge middleware, client components
 * and Sanity Studio schemas alike.
 *
 * @module lib/embed-domains
 */

/**
 * Providers trusted without any configuration. Admins add other providers in
 * Studio under Site Settings → Trusted Embed Domains
 * (`siteSettings.allowedEmbedDomains`).
 */
export const DEFAULT_EMBED_DOMAINS = ["jotform.com", "typeform.com", "player.vimeo.com"] as const;

/**
 * Returns true when `url` is an HTTPS URL on a built-in trusted provider or on
 * one of `extraDomains` (the Site Settings list), including their subdomains.
 * Blank or missing entries in `extraDomains` are ignored.
 */
export function isAllowedEmbedUrl(
  url: string,
  extraDomains: readonly (string | null | undefined)[] = [],
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;

  // URL already lower-cases the hostname; admin-entered domains may not be.
  const host = parsed.hostname;
  return [...DEFAULT_EMBED_DOMAINS, ...extraDomains]
    .filter((domain): domain is string => typeof domain === "string")
    .map((domain) => domain.trim().toLowerCase())
    .some((domain) => domain !== "" && (host === domain || host.endsWith(`.${domain}`)));
}
