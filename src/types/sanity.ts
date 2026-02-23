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
  order?: number;
}

/** A fundraising cause / donation campaign managed via Sanity. */
export interface SanityDonationCause {
  _id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: PortableTextBlock[];
  image?: SanityImage;
  icon: string;
  campaignType?: "ongoing" | "campaign" | "emergency";
  startDate?: string;
  endDate?: string;
  goal?: number;
  raised?: number;
  showProgress?: boolean;
  paymentOptions?: {
    useDefaultPayment?: boolean;
    externalPaymentUrl?: string;
    suggestedAmounts?: number[];
    allowCustomAmount?: boolean;
    allowRecurring?: boolean;
  };
  featured?: boolean;
  priority?: "normal" | "high" | "urgent";
  active?: boolean;
  order?: number;
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

/** A guided tour option offered to visitors (/visit page). */
export interface SanityTourType {
  _id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  image?: SanityImage;
  duration?: string;
  groupSize?: string;
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
  order?: number;
}

/** A CMS-managed content page (about, history, privacy policy, etc.). */
export interface SanityPageContent {
  _id: string;
  title: string;
  slug: string;
  pageType: "about" | "history" | "mission" | "facilities" | "contact" | "privacy" | "terms" | "custom";
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
  navOrder?: number;
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
  fileSize?: string;
  duration?: string;
  author?: string;
  date?: string;
  language?: "en" | "ar" | "ur" | "tr" | "id" | "multi";
  tags?: string[];
  featured?: boolean;
  downloadCount?: number;
  active?: boolean;
  order?: number;
}

/** Global site settings singleton — organisation details, hero slides, social links, etc. */
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
  operatingHours?: {
    weekdays?: string;
    weekends?: string;
    notes?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
    telegram?: string;
  };
  heroSlides?: Array<{
    title: string;
    subtitle?: string;
    image: SanityImage;
    overlay?: number;
    primaryButton?: {
      label?: string;
      url?: string;
    };
    secondaryButton?: {
      label?: string;
      url?: string;
    };
    active?: boolean;
  }>;
  welcomeSection?: {
    title?: string;
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
  externalLinks?: {
    college?: string;
    bookstore?: string;
    sportsClub?: string;
  };
  quickLinks?: Array<{
    label: string;
    url: string;
  }>;
  allowedEmbedDomains?: string[];
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
