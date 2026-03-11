// src/data/navigation.ts

/**
 * Shared Navigation Data
 *
 * Hardcoded navigation structure consumed by all Header variants and the Footer.
 * External links (College, Bookstore, Newport Storm) are injected at runtime
 * from SiteSettingsContext, not stored here.
 *
 * @module data/navigation
 */

export interface NavLink {
  name: string;
  href: string;
  external?: boolean;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export const headerNavGroups: NavGroup[] = [
  {
    label: "About",
    links: [
      { name: "Our Story", href: "/about" },
      { name: "Our Imams", href: "/imams" },
      { name: "Affiliated Partners", href: "/partners" },
    ],
  },
  {
    label: "What's On",
    links: [
      { name: "Events", href: "/events" },
      { name: "Services", href: "/services" },
      { name: "Announcements", href: "/announcements" },
      { name: "Programs", href: "/events#programs" },
    ],
  },
  {
    label: "Our Mosque",
    links: [
      { name: "For Worshippers", href: "/worshippers" },
      { name: "Plan Your Visit", href: "/visit" },
      { name: "Architecture", href: "/architecture" },
    ],
  },
  {
    label: "Media & Resources",
    links: [
      { name: "Media Gallery", href: "/media" },
      { name: "Resources", href: "/resources" },
    ],
  },
];

export const footerNavGroups: NavGroup[] = [
  ...headerNavGroups,
  {
    label: "Get Involved",
    links: [
      { name: "Donate", href: "/donate" },
      { name: "Contact Us", href: "/contact" },
      { name: "Volunteer", href: "/contact" },
    ],
  },
];

export function buildAffiliateLinks(externalLinks: {
  college: string;
  bookstore: string;
  newportStorm: string;
}): NavLink[] {
  return [
    { name: "AIC College", href: externalLinks.college, external: true },
    { name: "AIC Bookstore", href: externalLinks.bookstore, external: true },
    { name: "Newport Storm FC", href: externalLinks.newportStorm, external: true },
  ];
}
