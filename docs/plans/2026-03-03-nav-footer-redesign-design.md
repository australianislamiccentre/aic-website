# Nav & Footer Redesign

**Date:** 2026-03-03
**Branch:** `feature/nav-footer-redesign`
**Status:** Approved

## Problem

The current navigation is disorganised:
- Only 4 top-level items (About, Services, Events, Contact) with inconsistent mega-menu dropdowns
- Key pages missing from nav: Resources, Announcements (buried), Media (buried), Architecture (buried)
- Footer link groups don't align with header structure
- "Programs" and "Events" link to the same URL in the footer
- Media Gallery categorised under Events dropdown

## Agreed Navigation Structure

All three trial variants share this link structure. Data is hardcoded (not Sanity-managed) since nav changes are rare and a broken CMS fetch would break navigation site-wide. External links (College, Bookstore, Newport Storm) remain sourced from `SiteSettingsContext`.

### Groups & Links

| Group              | Links                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| **About**          | Our Story `/about`, Our Imams `/imams`, Affiliated Partners `/partners`                            |
| **What's On**      | Events `/events`, Services `/services`, Announcements `/announcements`, Programs `/events#programs` |
| **Our Mosque**     | Prayer Times `/#prayer-times`, For Worshippers `/worshippers`, Plan Your Visit `/visit`, Architecture `/architecture` |
| **Media & Resources** | Media Gallery `/media`, Resources `/resources`                                                  |
| **Contact**        | Flat link (no dropdown) `/contact`                                                                 |
| **Donate**         | CTA button `/donate`                                                                               |

## Trial Variants

Three header interaction patterns will be built for side-by-side comparison. A dev-only toggle (URL param `?nav=a|b|c`) allows switching between them in the browser.

### Trial A: Inline Links + Dropdown Panels

- All 5 groups visible in the header bar as text links
- Hover (desktop) or click opens a single-column dropdown panel below the label
- No promo images or category sub-groups — clean list of links
- Dropdown width auto-fits to content, not full-span
- Mobile: hamburger icon opens slide-out drawer with accordion-expandable groups

### Trial B: Hamburger + Full-Page Overlay

- Header shows only: Logo, Donate CTA, hamburger icon
- Clicking hamburger opens a full-viewport overlay
- Desktop: groups laid out in a responsive grid (3 columns)
- Mobile: single column, same overlay
- Group headings as bold labels, links listed below each
- Close button top-right
- Identical experience on desktop and mobile

### Trial C: Hybrid Inline + Hamburger

- Header shows: Logo, What's On (dropdown), Our Mosque (dropdown), hamburger icon, Donate CTA
- The two most-used groups get inline hover/click dropdowns
- Hamburger opens a side panel with remaining groups: About, Media & Resources, Contact
- Mobile: all groups move into the hamburger side panel

## Footer

Same structure for all three trials:

### Link Groups (4 columns)

| Column             | Links                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| **About**          | Our Story, Our Imams, Affiliated Partners                                                          |
| **What's On**      | Events, Services, Announcements, Programs                                                          |
| **Our Mosque**     | Prayer Times, For Worshippers, Plan Your Visit, Architecture                                       |
| **Media & Resources** | Media Gallery, Resources                                                                        |

### Additional Columns

| Column             | Links                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| **Get Involved**   | Donate `/donate`, Contact Us `/contact`, Volunteer `/contact`            |
| **Affiliates**     | AIC College (external), AIC Bookstore (external), Newport Storm (external) |

### Unchanged

- Newsletter subscription section stays as-is
- Bottom bar: Copyright, Privacy Policy, Terms of Use, Accessibility
- Brand column with logo, tagline, address, phone, email, hours, social icons

## Responsive Breakpoints

All variants must be fully responsive:

| Breakpoint | Behaviour                                          |
| ---------- | -------------------------------------------------- |
| < 768px    | Mobile layout — hamburger/drawer for all variants  |
| 768-1023px | Tablet — may show partial inline items or hamburger |
| >= 1024px  | Full desktop layout per variant                    |

## Implementation Notes

- Shared nav link data in a constant (e.g. `src/data/navigation.ts` or added to `src/data/content.ts`)
- Each trial variant is a separate Header component (e.g. `HeaderA.tsx`, `HeaderB.tsx`, `HeaderC.tsx`)
- Trial selector via URL param `?nav=a|b|c` with default of `a`
- Footer is a single updated component used by all trials
- Existing Header.tsx preserved until a variant is chosen
- All animations must respect `prefers-reduced-motion`
- Keyboard navigation and focus management for all dropdown/overlay/drawer patterns
- ARIA attributes: `aria-expanded`, `aria-haspopup`, `role="menu"` where appropriate
