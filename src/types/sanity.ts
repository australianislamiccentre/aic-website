/**
 * Sanity Document Type Definitions
 *
 * TypeScript interface registry for all Sanity CMS document types used across
 * the AIC website. Each interface maps 1:1 to a Sanity schema defined in
 * `src/sanity/schemas/`. Fields are optional where the Sanity schema marks
 * them as non-required or where a sensible fallback exists on the frontend.
 *
 * @module types/sanity
 * @see src/sanity/schemas/ for the corresponding Sanity schema definitions
 * @see src/sanity/lib/fetch.ts for the data-fetching functions that return these types
 */

/** A community event — single-day, multi-day, or recurring (e.g. weekly programs). */
export interface SanityEvent {
  _id: string;
  title: string;
  slug: string;
  /** Determines scheduling: "single" = one date, "multi" = date range, "recurring" = weekly. */
  eventType?: "single" | "multi" | "recurring";
  date?: string;
  endDate?: string;
  recurringDay?: string;
  recurringEndDate?: string;
  time: string;
  endTime?: string;
  location: string;
  locationDetails?: string;
  categories: string[];
  image?: SanityImage;
  shortDescription?: string;
  description: string;
  keyFeatures?: string[];
  features?: string[];
  ageGroup?: string;
  externalLink?: string;
  featured?: boolean;
  active?: boolean;
  registrationUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  /** Controls the inquiry form on the detail page: "none" = hidden, "contact" = built-in, "embed" = third-party iframe. */
  formType?: "none" | "contact" | "embed";
  embedFormUrl?: string;
}

/** A single block within a Portable Text rich-text field. */
export interface PortableTextBlock {
  _type: string;
  _key: string;
  [key: string]: unknown;
}

/** A site-wide or time-limited announcement (news item). */
export interface SanityAnnouncement {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content?: PortableTextBlock[];
  image?: SanityImage;
  category: string;
  /** Display urgency: "urgent" triggers the global alert banner. */
  priority: "normal" | "important" | "urgent";
  featured?: boolean;
  active?: boolean;
  expiresAt?: string;
  tags?: string[];
  callToAction?: {
    label?: string;
    linkType?: "internal" | "external";
    internalPage?: string;
    url?: string;
  };
}

/** Programs are recurring events in Education/Youth/Sports/Women categories. Alias for SanityEvent. */
export type SanityProgram = SanityEvent;

/** A mosque service (e.g. marriage, funeral, counselling). */
export interface SanityService {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: PortableTextBlock[];
  icon: string;
  image?: SanityImage;
  availability?: string;
  highlights?: string[];
  keyFeatures?: string[];
  requirements?: string[];
  processSteps?: Array<{
    step: string;
    description?: string;
  }>;
  fee?: {
    type: "free" | "fixed" | "donation" | "contact";
    amount?: number;
    note?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  formRecipientEmail?: string;
  featured?: boolean;
  active?: boolean;
  orderRank?: string;
}

/** A photo in the site gallery (/media page). */
export interface SanityGalleryImage {
  _id: string;
  image: SanityImage;
  alt: string;
  caption?: string;
  category?: string;
  featured?: boolean;
}

/** An image in the media page gallery (from the mediaGallery singleton). */
export interface MediaGalleryImage {
  _key: string;
  asset: SanityImage["asset"];
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/** A community testimonial / quote. */
export interface SanityTestimonial {
  _id: string;
  quote: string;
  author: string;
  role?: string;
  image?: SanityImage;
}
/** A frequently asked question with a rich-text answer. */
export interface SanityFaq {
  _id: string;
  question: string;
  answer: PortableTextBlock[];
  category?: string;
  relatedLinks?: Array<{
    label: string;
    url: string;
  }>;
  featured?: boolean;
  order?: number;
}

/** A visitor etiquette guideline (e.g. "Remove shoes", "Dress modestly"). */
export interface SanityEtiquette {
  _id: string;
  title: string;
  description: string;
  icon: string;
}

/** A Sanity image asset reference with optional alt text. */
export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
}

/** A staff or volunteer team member (imam, teacher, board member, etc.). */
export interface SanityTeamMember {
  _id: string;
  name: string;
  slug: string;
  role: string;
  category: "imam" | "teacher" | "board" | "admin" | "volunteer" | "youth" | "sisters";
  image?: SanityImage;
  bio?: PortableTextBlock[];
  shortBio?: string;
  qualifications?: string[];
  specializations?: string[];
  email?: string;
  phone?: string;
  officeHours?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  featured?: boolean;
  showContactInfo?: boolean;
  active?: boolean;
  orderRank?: string;
}

/** A CMS-managed content page created via the Custom Pages section in Sanity Studio. */
export interface SanityPageContent {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  introduction?: string;
  content?: PortableTextBlock[];
  sections?: Array<{
    title?: string;
    content?: PortableTextBlock[];
    image?: SanityImage;
    imagePosition?: "left" | "right" | "above" | "below";
  }>;
  heroImage?: SanityImage;
  gallery?: Array<SanityImage & { caption?: string; alt?: string }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  };
  showInNav?: boolean;
  navLabel?: string;
  active?: boolean;
}

/** A downloadable or linkable resource (PDF, audio, video, etc.). */
export interface SanityResource {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: SanityImage;
  resourceType: "pdf" | "audio" | "video" | "link" | "image" | "ebook";
  category: string;
  file?: {
    asset: {
      _ref: string;
      url?: string;
    };
  };
  externalUrl?: string;
  /** Resolved file URL from GROQ projection: `file.asset->url`. */
  fileUrl?: string;
  fileSize?: string;
  duration?: string;
  author?: string;
  date?: string;
  language?: "en" | "ar" | "ur" | "tr" | "id" | "multi";
  tags?: string[];
  featured?: boolean;
  downloadCount?: number;
  active?: boolean;
  orderRank?: string;
}

/** An affiliated partner organisation (e.g. Newport Storm FC, AIC College). */
export interface SanityPartner {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: PortableTextBlock[];
  logo?: SanityImage;
  coverImage?: SanityImage;
  icon?: string;
  color?: string;
  website?: string;
  email?: string;
  phone?: string;
  featured?: boolean;
  active?: boolean;
  orderRank?: string;
}

/** Global site settings singleton — organisation details, social links, etc. */
export interface SanitySiteSettings {
  _id: string;
  organizationName: string;
  shortName?: string;
  tagline?: string;
  parentOrganization?: string;
  logo?: SanityImage;
  logoAlt?: SanityImage;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country?: string;
  };
  phone: string;
  email: string;
  googleMapsUrl?: string;
  operatingHours?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
    telegram?: string;
  };
  externalLinks?: {
    college?: string;
    bookstore?: string;
    sportsClub?: string;
  };
  quickLinks?: Array<{
    label: string;
    url: string;
  }>;
  allowedEmbedDomains?: Array<{
    domain: string;
    label?: string;
    category?: "form" | "video" | "map" | "other";
  }>;
}

/** Homepage settings singleton — hero, quick links, video, welcome section, CTA banner. */
export interface SanityHomepageSettings {
  _id: string;
  heroMode?: "carousel" | "video";
  heroVideoUrl?: string;
  heroSlides?: Array<{
    title: string;
    highlight: string;
    subtitle?: string;
    primaryButton?: {
      label?: string;
      linkType?: "internal" | "external";
      internalPage?: string;
      url?: string;
    };
    secondaryButton?: {
      label?: string;
      linkType?: "internal" | "external";
      internalPage?: string;
      url?: string;
    };
    image?: SanityImage;
    active?: boolean;
  }>;
  heroVideoOverlays?: Array<{
    title: string;
    highlight: string;
    subtitle?: string;
    primaryButton?: {
      label?: string;
      linkType?: "internal" | "external";
      internalPage?: string;
      url?: string;
    };
    secondaryButton?: {
      label?: string;
      linkType?: "internal" | "external";
      internalPage?: string;
      url?: string;
    };
    active?: boolean;
  }>;
  quickLinksSection?: {
    enabled?: boolean;
    quickLinkCards?: Array<{
      title: string;
      subtitle?: string;
      accentColor?: string;
      links?: Array<{
        label: string;
        linkType?: "internal" | "external";
        internalPage?: string;
        url?: string;
      }>;
      active?: boolean;
    }>;
    bottomCtaText?: string;
  };
  featuredYoutubeUrl?: string;
  welcomeSection?: {
    badge?: string;
    title?: string;
    titleAccent?: string;
    subtitle?: string;
    content?: PortableTextBlock[];
    image?: SanityImage;
    stats?: Array<{
      value: string;
      label: string;
    }>;
  };
  ctaBanner?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    backgroundImage?: SanityImage;
  };
}

/** Reusable SEO fields shared across page singletons. */
export interface SanitySeoFields {
  title?: string;
  description?: string;
  image?: SanityImage;
}

/** A button reference used in page settings CTAs. */
export interface SanityPageButton {
  label: string;
  url: string;
  variant?: "primary" | "outline" | "ghost";
}

/** A stat card used in page heroes. */
export interface SanityStatCard {
  value: string;
  label: string;
}

/** An icon card used in features, values, services offered. */
export interface SanityIconCard {
  title: string;
  description?: string;
  icon?: string;
}

/** A timeline item used on the About page. */
export interface SanityTimelineItem {
  year: string;
  title: string;
  description?: string;
  icon?: string;
}

/** An award entry used on the Architecture page. */
export interface SanityAwardCard {
  year: string;
  title: string;
  organization?: string;
  category?: string;
}

/** A gallery image with alt text used on the Architecture page gallery. */
export interface SanityGalleryImageWithAlt {
  image: SanityImage;
  alt?: string;
  caption?: string;
}

/** An etiquette item inlined into visitPageSettings or worshippersPageSettings. */
export interface SanityEtiquetteItem {
  title: string;
  description?: string;
  icon?: string;
}

/** An FAQ item inlined into visitPageSettings. */
export interface SanityFaqItem {
  question: string;
  answer?: PortableTextBlock[];
}

/** About page singleton settings. */
export interface SanityAboutPageSettings {
  heroBadge?: string;
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroDescription?: string;
  heroStats?: SanityStatCard[];
  heroImage?: SanityImage;
  heroImageCaption?: string;
  missionVisible?: boolean;
  missionImage?: SanityImage;
  missionBadge?: string;
  missionHeading?: string;
  missionContent?: PortableTextBlock[];
  missionButtonLabel?: string;
  missionButtonUrl?: string;
  timelineVisible?: boolean;
  timelineHeading?: string;
  timelineItems?: SanityTimelineItem[];
  architecturePreviewVisible?: boolean;
  architectureHeading?: string;
  architectureDescription?: string;
  architectureImages?: SanityImage[];
  architectureFeatures?: SanityIconCard[];
  architectureButtonLabel?: string;
  architectureButtonUrl?: string;
  valuesVisible?: boolean;
  valuesHeading?: string;
  valuesDescription?: string;
  valuesCards?: SanityIconCard[];
  valuesButtons?: SanityPageButton[];
  seo?: SanitySeoFields;
}

/** Architecture page singleton settings. */
export interface SanityArchitecturePageSettings {
  heroBadge?: string;
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroContent?: PortableTextBlock[];
  heroImage?: SanityImage;
  heroImageBadge?: string;
  philosophyVisible?: boolean;
  philosophyBadge?: string;
  philosophyContent?: PortableTextBlock[];
  philosophyImages?: SanityImage[];
  featuresVisible?: boolean;
  featuresHeading?: string;
  featuresCards?: SanityIconCard[];
  galleryVisible?: boolean;
  galleryHeading?: string;
  galleryDescription?: string;
  galleryImages?: SanityGalleryImageWithAlt[];
  awardsVisible?: boolean;
  awardsBadge?: string;
  awardsHeading?: string;
  awardsCards?: SanityAwardCard[];
  quoteVisible?: boolean;
  quoteText?: string;
  quoteAttribution?: string;
  ctaVisible?: boolean;
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  seo?: SanitySeoFields;
}

/** Visit page singleton settings. */
export interface SanityVisitPageSettings {
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroDescription?: string;
  visitingInfoVisible?: boolean;
  visitingInfoImage?: SanityImage;
  visitingInfoHeading?: string;
  visitingHours?: string;
  facilitiesVisible?: boolean;
  facilitiesHeading?: string;
  facilitiesDescription?: string;
  facilitiesCards?: Array<{ name: string; capacity?: string; description?: string; icon?: string }>;
  facilitiesImage?: SanityImage;
  mannersVisible?: boolean;
  mannersBadge?: string;
  mannersHeading?: string;
  mannersDescription?: string;
  etiquetteItems?: SanityEtiquetteItem[];
  faqVisible?: boolean;
  faqBadge?: string;
  faqHeading?: string;
  faqItems?: SanityFaqItem[];
  ctaVisible?: boolean;
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtons?: SanityPageButton[];
  seo?: SanitySeoFields;
}

/** Worshippers page singleton settings. */
export interface SanityWorshippersPageSettings {
  heroBadge?: string;
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroDescription?: string;
  etiquetteVisible?: boolean;
  etiquetteHeading?: string;
  etiquetteDescription?: string;
  etiquetteItems?: SanityEtiquetteItem[];
  khutbahVisible?: boolean;
  khutbahHeading?: string;
  ctaVisible?: boolean;
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  seo?: SanitySeoFields;
}

/** Contact page singleton settings. */
export interface SanityContactPageSettings {
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroDescription?: string;
  sidebarVisible?: boolean;
  seo?: SanitySeoFields;
}

/** Simple page header settings shared by events, announcements, resources, media. */
export interface SanitySimplePageSettings {
  heroBadge?: string;
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroDescription?: string;
  seo?: SanitySeoFields;
}

/** Services page singleton settings. */
export interface SanityServicesPageSettings extends SanitySimplePageSettings {
  heroCategoryTags?: string[];
  heroImage?: SanityImage;
  ctaVisible?: boolean;
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
}

/** Imams page singleton settings. */
export interface SanityImamsPageSettings {
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroDescription?: string;
  imamsSectionHeading?: string;
  imamsSectionDescription?: string;
  servicesOfferedVisible?: boolean;
  servicesOfferedHeading?: string;
  servicesOfferedCards?: SanityIconCard[];
  ctaVisible?: boolean;
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtons?: SanityPageButton[];
  seo?: SanitySeoFields;
}

/** Media page singleton settings. */
export interface SanityMediaPageSettings extends SanitySimplePageSettings {
  youtubeVisible?: boolean;
  galleryVisible?: boolean;
  socialVisible?: boolean;
}

/** Partners page singleton settings. */
export interface SanityPartnersPageSettings {
  heroBadge?: string;
  heroHeading?: string;
  heroHeadingAccent?: string;
  heroDescription?: string;
  ctaVisible?: boolean;
  ctaHeading?: string;
  ctaHeadingAccent?: string;
  ctaDescription?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  seo?: SanitySeoFields;
}

/** Privacy/Terms page singleton settings. */
export interface SanityLegalPageSettings {
  heading?: string;
  lastUpdated?: string;
  content?: PortableTextBlock[];
  seo?: SanitySeoFields;
}

/** Contact form singleton settings. */
export interface SanityContactFormSettings {
  contactEnabled?: boolean;
  contactRecipientEmail?: string;
  contactHeading?: string;
  contactHeadingAccent?: string;
  contactDescription?: string;
  contactFormHeading?: string;
  contactFormDescription?: string;
  contactInquiryTypes?: string[];
  contactSuccessHeading?: string;
  contactSuccessMessage?: string;
}

/** Service inquiry form singleton settings. */
export interface SanityServiceInquiryFormSettings {
  serviceInquiryEnabled?: boolean;
  serviceInquiryRecipientEmail?: string;
  serviceInquiryFormHeading?: string;
  serviceInquiryFormDescription?: string;
  serviceInquirySuccessHeading?: string;
  serviceInquirySuccessMessage?: string;
}

/** Event inquiry form singleton settings. */
export interface SanityEventInquiryFormSettings {
  eventInquiryEnabled?: boolean;
  eventInquiryRecipientEmail?: string;
}

/** Newsletter singleton settings. */
export interface SanityNewsletterSettings {
  newsletterEnabled?: boolean;
  newsletterRecipientEmail?: string;
  newsletterHeading?: string;
  newsletterDescription?: string;
  newsletterButtonText?: string;
  newsletterSuccessMessage?: string;
}


/**
 * Prayer settings singleton — per-prayer iqamah configuration.
 *
 * Each prayer has three fields:
 * - `*IqamahMode`: "calculated" adds a delay to the adhan time, "fixed" uses a static time.
 * - `*FixedTime`: The static iqamah time (only used when mode is "fixed").
 * - `*Delay`: Minutes after adhan (only used when mode is "calculated").
 */
export interface SanityPrayerSettings {
  _id: string;
  // Daily Prayers - Fajr
  fajrIqamahMode?: "calculated" | "fixed";
  fajrFixedTime?: string;
  fajrDelay?: number;
  // Daily Prayers - Dhuhr
  dhuhrIqamahMode?: "calculated" | "fixed";
  dhuhrFixedTime?: string;
  dhuhrDelay?: number;
  // Daily Prayers - Asr
  asrIqamahMode?: "calculated" | "fixed";
  asrFixedTime?: string;
  asrDelay?: number;
  // Daily Prayers - Maghrib
  maghribIqamahMode?: "calculated" | "fixed";
  maghribFixedTime?: string;
  maghribDelay?: number;
  // Daily Prayers - Isha
  ishaIqamahMode?: "calculated" | "fixed";
  ishaFixedTime?: string;
  ishaDelay?: number;
  // Jumu'ah
  jumuahArabicTime?: string;
  jumuahEnglishTime?: string;
  // Taraweeh
  taraweehEnabled?: boolean;
  taraweehTime?: string;
  // Eid al-Fitr
  eidFitrActive?: boolean;
  eidFitrTime?: string;
  // Eid al-Adha
  eidAdhaActive?: boolean;
  eidAdhaTime?: string;
}

/** Icon picker value from sanity-plugin-icon-picker. */
export interface SanityIconPicker {
  _type?: string;
  provider?: string;
  name?: string;
  svg?: string;
}

/** Header settings singleton — announcement bar, CTA, nav groups, etc. */
export interface SanityHeaderSettings {
  announcementBar?: {
    enabled?: boolean;
    message?: string;
    link?: string;
    linkText?: string;
    backgroundColor?: "teal" | "gold" | "lime" | "red";
    dismissable?: boolean;
  };
  topBar?: {
    desktopWelcome?: string;
    mobileWelcome?: string;
    visible?: boolean;
  };
  ctaButton?: {
    label?: string;
    url?: string;
    icon?: SanityIconPicker;
    accentColor?: "lime" | "gold" | "teal";
  };
  menuDonateCard?: {
    heading?: string;
    description?: string;
    buttonText?: string;
    url?: string;
    visible?: boolean;
  };
  showSearch?: boolean;
  contactLink?: {
    label?: string;
    url?: string;
    visible?: boolean;
  };
  navGroups?: SanityNavGroup[];
}

/** A navigation group with orderable links. Shared between header and footer. */
export interface SanityNavGroup {
  _key: string;
  label?: string;
  description?: string;
  icon?: SanityIconPicker;
  visible?: boolean;
  links?: SanityNavLink[];
}

/** A single navigation link within a group. */
export interface SanityNavLink {
  _key: string;
  label?: string;
  url?: string;
  visible?: boolean;
}

/** Footer settings singleton — donate card, Qur'an verse, bottom links, etc. */
export interface SanityFooterSettings {
  newsletter?: {
    visible?: boolean;
  };
  brandDescription?: string;
  donateCard?: {
    heading?: string;
    description?: string;
    buttonText?: string;
    url?: string;
    visible?: boolean;
  };
  quranVerse?: {
    arabicText?: string;
    translation?: string;
    reference?: string;
    visible?: boolean;
  };
  bottomBarLinks?: Array<{
    _key: string;
    label?: string;
    url?: string;
  }>;
  copyrightText?: string;
  navGroups?: Array<{
    _key: string;
    label?: string;
    visible?: boolean;
    links?: SanityNavLink[];
  }>;
}
