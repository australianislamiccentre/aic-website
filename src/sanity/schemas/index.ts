import event from "./event";
import announcement from "./announcement";
import service from "./service";
import donationCause from "./donationCause";
import donationCampaign from "./donationCampaign";
import galleryImage from "./gallery";
import testimonial from "./testimonial";
import faq from "./faq";
import etiquette from "./etiquette";
import tourType from "./tourType";
import tourRequest from "./tourRequest";
import siteSettings from "./siteSettings";
import prayerSettings from "./prayerSettings";
import teamMember from "./teamMember";
import pageContent from "./pageContent";
import resource from "./resource";

export const schemaTypes = [
  // Singletons
  siteSettings,
  prayerSettings,
  // Content types
  event,
  announcement,
  service,
  donationCause,
  donationCampaign,
  teamMember,
  pageContent,
  resource,
  galleryImage,
  testimonial,
  faq,
  etiquette,
  tourType,
  // Form submissions
  tourRequest,
];
