import event from "./event";
import announcement from "./announcement";
import service from "./service";
import donationSettings from "./donationSettings";
import donationCampaign from "./donationCampaign";
import donatePageSettings from "./donatePageSettings";
import galleryImage from "./gallery";
import faq from "./faq";
import etiquette from "./etiquette";
import tourType from "./tourType";
import tourRequest from "./tourRequest";
import formSettings from "./formSettings";
import siteSettings from "./siteSettings";
import prayerSettings from "./prayerSettings";
import teamMember from "./teamMember";
import pageContent from "./pageContent";
import resource from "./resource";

export const schemaTypes = [
  // Singletons
  siteSettings,
  prayerSettings,
  donationSettings,
  donatePageSettings,
  formSettings,
  // Content types
  event,
  announcement,
  service,
  teamMember,
  pageContent,
  resource,
  galleryImage,
  faq,
  etiquette,
  tourType,
  donationCampaign,
  // Form submissions
  tourRequest,
];
