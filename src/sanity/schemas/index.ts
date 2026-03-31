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

// ── Page singletons ──
import aboutPageSettings from "./pages/aboutPageSettings";
import architecturePageSettings from "./pages/architecturePageSettings";
import visitPageSettings from "./pages/visitPageSettings";
import worshippersPageSettings from "./pages/worshippersPageSettings";
import contactPageSettings from "./pages/contactPageSettings";
import eventsPageSettings from "./pages/eventsPageSettings";
import announcementsPageSettings from "./pages/announcementsPageSettings";
import servicesPageSettings from "./pages/servicesPageSettings";
import imamsPageSettings from "./pages/imamsPageSettings";
import resourcesPageSettings from "./pages/resourcesPageSettings";
import mediaPageSettings from "./pages/mediaPageSettings";
import partnersPageSettings from "./pages/partnersPageSettings";
import privacyPageSettings from "./pages/privacyPageSettings";
import termsPageSettings from "./pages/termsPageSettings";

// ── Form singletons ──
import contactFormSettings from "./forms/contactFormSettings";
import serviceInquiryFormSettings from "./forms/serviceInquiryFormSettings";
import eventInquiryFormSettings from "./forms/eventInquiryFormSettings";
import newsletterSettings from "./forms/newsletterSettings";
import allowedFormDomains from "./forms/allowedFormDomains";

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
  // Page singletons
  aboutPageSettings,
  architecturePageSettings,
  visitPageSettings,
  worshippersPageSettings,
  contactPageSettings,
  eventsPageSettings,
  announcementsPageSettings,
  servicesPageSettings,
  imamsPageSettings,
  resourcesPageSettings,
  mediaPageSettings,
  partnersPageSettings,
  privacyPageSettings,
  termsPageSettings,
  // Form singletons
  contactFormSettings,
  serviceInquiryFormSettings,
  eventInquiryFormSettings,
  newsletterSettings,
  allowedFormDomains,
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
