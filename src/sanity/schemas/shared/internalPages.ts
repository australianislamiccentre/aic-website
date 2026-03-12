/**
 * Shared list of internal site pages for Sanity link dropdowns.
 *
 * Used by any schema that offers an "Internal Page" selector
 * (e.g. announcement callToAction, hero slide buttons).
 *
 * Keep this in sync with the routes in `src/app/`.
 *
 * @module sanity/schemas/shared/internalPages
 */
export const internalPageOptions = [
  { title: "Home", value: "/" },
  { title: "About", value: "/about" },
  { title: "Our Imams", value: "/imams" },
  { title: "Partners", value: "/partners" },
  { title: "Events & Programs", value: "/events" },
  { title: "Services", value: "/services" },
  { title: "Announcements", value: "/announcements" },
  { title: "For Worshippers", value: "/worshippers" },
  { title: "Plan Your Visit", value: "/visit" },
  { title: "Architecture", value: "/architecture" },
  { title: "Media Gallery", value: "/media" },
  { title: "Resources", value: "/resources" },
  { title: "Donate", value: "/donate" },
  { title: "Contact", value: "/contact" },
  { title: "Prayer Times", value: "#prayer-times" },
];
