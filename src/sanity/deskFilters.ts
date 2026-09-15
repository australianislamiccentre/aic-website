/**
 * Studio Desk Filters — Events and Announcements
 *
 * GROQ filters for the Events and Announcements folders in the Studio
 * sidebar, kept out of sanity.config.ts so they can be tested against real
 * GROQ semantics. Every filter expects a `$today` param: Melbourne's calendar
 * date (YYYY-MM-DD, from `getMelbourneDateString()`), matching the website.
 *
 * `isOnWebsite` mirrors the date logic of `eventsQuery`, but each comparison
 * is null-safe. In GROQ `null >= "2026-09-15"` is null, and `!null` is still
 * null — so negating the site's expression for the "Expired" list silently
 * dropped every event without an end date.
 *
 * @module sanity/deskFilters
 * @see src/sanity/lib/queries.ts — eventsQuery / announcementsQuery (the website's versions)
 */

const isOnWebsite = `(
  (eventType == "recurring" && coalesce(recurringEndDate >= $today, true)) ||
  coalesce(date >= $today, false) ||
  coalesce(endDate >= $today, false)
)`;

const activeEvent = `_type == "event" && active != false`;

/** Events (or items shown as both) currently listed on the website. */
export const liveEventsFilter = `${activeEvent} && displayAs in ["event", "both"] && ${isOnWebsite}`;

/** Programs (or items shown as both) currently listed on the website. */
export const liveProgramsFilter = `${activeEvent} && displayAs in ["program", "both"] && ${isOnWebsite}`;

/** Active items whose dates have all passed, so the website no longer lists them. */
export const expiredEventsFilter = `${activeEvent} && !${isOnWebsite}`;

/** Items switched off with the Active toggle. */
export const inactiveEventsFilter = `_type == "event" && active == false`;

const activeAnnouncement = `_type == "announcement" && active != false`;

/** Announcements the website currently shows (no expiry, or expiry date not yet passed). */
export const activeAnnouncementsFilter = `${activeAnnouncement} && coalesce(expiresAt >= $today, true)`;

/** Announcements past their expiry date. */
export const expiredAnnouncementsFilter = `${activeAnnouncement} && coalesce(expiresAt < $today, false)`;

/** Announcements switched off with the Active toggle. */
export const inactiveAnnouncementsFilter = `_type == "announcement" && active == false`;
