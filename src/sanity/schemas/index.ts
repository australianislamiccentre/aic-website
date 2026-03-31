/**
 * Sanity Schema Registry
 *
 * Organised by folder:
 * - singletons/   — global config docs (one per site)
 * - pages/        — per-page config singletons
 * - forms/        — form config singletons
 * - documents/    — user-created content docs
 * - shared/       — reusable field definitions
 */

// ── Global singletons ──
import siteSettings from "./singletons/siteSettings";
import homepageSettings from "./singletons/homepageSettings";
import prayerSettings from "./singletons/prayerSettings";
import donationSettings from "./singletons/donationSettings";
import donatePageSettings from "./singletons/donatePageSettings";
import offlineDonations from "./singletons/offlineDonations";
import mediaGallery from "./singletons/mediaGallery";
import formSettings from "./singletons/formSettings"; // deprecated — hidden from desk

// ── Page singletons (to be created in Task 4) ──
// import aboutPageSettings from "./pages/aboutPageSettings";
// ... (commented out until Task 4 creates these files)

// ── Form singletons (to be created in Task 5) ──
// import contactFormSettings from "./forms/contactFormSettings";
// ... (commented out until Task 5 creates these files)

// ── Content documents ──
import event from "./documents/event";
import announcement from "./documents/announcement";
import service from "./documents/service";
import teamMember from "./documents/teamMember";
import galleryImage from "./documents/galleryImage";
import resource from "./documents/resource";
import partner from "./documents/partner";
import donationCampaign from "./documents/donationCampaign";
import pageContent from "./documents/pageContent";
import faq from "./documents/faq";
import etiquette from "./documents/etiquette"; // deprecated — hidden from desk

export const schemaTypes = [
  // Global singletons
  siteSettings,
  homepageSettings,
  prayerSettings,
  donationSettings,
  donatePageSettings,
  offlineDonations,
  mediaGallery,
  formSettings,
  // Content documents
  event,
  announcement,
  service,
  teamMember,
  galleryImage,
  resource,
  partner,
  donationCampaign,
  pageContent,
  faq,
  etiquette,
];
