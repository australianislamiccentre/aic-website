// Sanity document types

export interface SanityEvent {
  _id: string;
  title: string;
  slug: string;
  recurring: boolean;
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
  features?: string[];
  ageGroup?: string;
  externalLink?: string;
  featured?: boolean;
  active?: boolean;
  registrationUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Portable Text block type
export interface PortableTextBlock {
  _type: string;
  _key: string;
  [key: string]: unknown;
}

export interface SanityAnnouncement {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content?: PortableTextBlock[];
  image?: SanityImage;
  category: string;
  priority: "normal" | "important" | "urgent";
  featured?: boolean;
  active?: boolean;
  expiresAt?: string;
  tags?: string[];
  callToAction?: {
    label?: string;
    url?: string;
  };
}

// SanityProgram is now an alias for SanityEvent (programs are recurring events)
export type SanityProgram = SanityEvent;

export interface SanityService {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: PortableTextBlock[];
  icon: string;
  image?: SanityImage;
  availability?: string;
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
  duration?: string;
  bookingRequired?: boolean;
  bookingUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  featured?: boolean;
  active?: boolean;
  order?: number;
}

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

// Donation Campaign - for scheduled daily donation campaigns (e.g., Ramadan)
export interface SanityDonationCampaign {
  _id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: PortableTextBlock[];
  image?: SanityImage;
  icon?: string;
  // Schedule
  startDate: string; // ISO date string YYYY-MM-DD
  endDate?: string; // Optional - leave empty for ongoing campaigns
  isOngoing?: boolean; // True for campaigns that run indefinitely
  signupStartDate?: string;
  signupEndDate?: string;
  // Payment
  presetAmounts: number[];
  allowCustomAmount?: boolean;
  minimumAmount: number;
  maximumAmount?: number;
  // Settings
  active?: boolean;
  featured?: boolean;
  goal?: number;
  raised?: number;
  subscriberCount?: number;
  order?: number;
}

// Campaign subscription request (client to server)
export interface CampaignSubscriptionRequest {
  campaignSlug: string;
  dailyAmount: number;
  donorInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    anonymous?: boolean;
    message?: string;
  };
}

// Campaign subscription response (server to client)
export interface CampaignSubscriptionResponse {
  sessionId: string;
  url: string;
  billingInfo: {
    startDate: string;
    endDate?: string; // Optional for ongoing campaigns
    remainingDays?: number; // Optional for ongoing campaigns
    dailyAmount: number;
    totalAmount?: number; // Optional for ongoing campaigns
    isLateJoin: boolean;
    isOngoing?: boolean; // True for ongoing campaigns
  };
}

export interface SanityGalleryImage {
  _id: string;
  image: SanityImage;
  alt: string;
  caption?: string;
  category?: string;
  featured?: boolean;
}

export interface SanityTestimonial {
  _id: string;
  quote: string;
  author: string;
  role?: string;
  image?: SanityImage;
}

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

export interface SanityEtiquette {
  _id: string;
  title: string;
  description: string;
  icon: string;
}

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

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
}

// New: Team Member
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

// New: Page Content
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

// New: Resource
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

// Enhanced Site Settings
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
}

// Prayer Settings - Flat structure for easy Sanity editing
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
