/**
 * GROQ Query Registry
 *
 * All Sanity GROQ queries used across the AIC website, organised by content type.
 * Each query is a tagged template literal that fetches documents with specific
 * projections (field selections) optimised for the consuming page/component.
 *
 * ## Date filtering
 *
 * Queries that filter by calendar date (event.date, event.endDate,
 * event.recurringEndDate) accept a `$today` parameter instead of reading
 * `now()` directly. `$today` is supplied by the fetch layer as a YYYY-MM-DD
 * string representing **today in Australia/Melbourne** (see
 * `getMelbourneDateString()` in `src/lib/time.ts`).
 *
 * This is necessary because GROQ's `now()` returns UTC. For the ~10-hour
 * window each day between Melbourne midnight (00:00 AEST/AEDT) and UTC
 * midnight, `$today` returns *yesterday's*
 * date in Melbourne terms, which means an admin-expired event keeps
 * showing until UTC catches up. Passing Melbourne-today as a parameter
 * closes that skew.
 *
 * Queries that compare absolute timestamps (e.g. `expiresAt > now()` on
 * announcements) continue to use `now()` directly — the `datetime` field
 * is already stored as UTC by Sanity Studio, so a tz-neutral comparison
 * is correct.
 *
 * @module sanity/lib/queries
 * @see src/sanity/lib/fetch.ts for the getter functions that execute these queries
 * @see src/lib/time.ts for `getMelbourneDateString()`
 */
import { groq } from "next-sanity";

// Single event by slug (includes full description for detail page)
export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug && active != false][0] {
    _id,
    title,
    "slug": slug.current,
    eventType,
    date,
    endDate,
    recurringDay,
    recurringEndDate,
    time,
    endTime,
    location,
    locationDetails,
    categories,
    image,
    shortDescription,
    description,
    keyFeatures,
    features,
    ageGroup,
    externalLink,
    featured,
    registrationUrl,
    contactEmail,
    contactPhone,
    formType,
    embedFormUrl,
    active
  }
`;

// Events - active events only, recurring always show, non-recurring only if not past
// Also filter recurring events by recurringEndDate if set.
// `$today` is the Melbourne-local YYYY-MM-DD supplied by the fetch layer — see
// the header comment for why this is a parameter rather than inline `now()`.
export const eventsQuery = groq`
  *[_type == "event" && active != false && (
    (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= $today)) ||
    date >= $today ||
    endDate >= $today
  )] | order(eventType asc, featured desc, date asc) {
    _id,
    title,
    "slug": slug.current,
    eventType,
    date,
    endDate,
    recurringDay,
    recurringEndDate,
    time,
    endTime,
    location,
    locationDetails,
    categories,
    image,
    shortDescription,
    description,
    keyFeatures,
    features,
    ageGroup,
    externalLink,
    featured,
    registrationUrl
  }
`;

// Featured events for homepage — only events with featured == true
export const featuredEventsQuery = groq`
  *[_type == "event" && active != false && featured == true && (
    (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= $today)) ||
    date >= $today ||
    endDate >= $today
  )] | order(eventType asc, date asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    eventType,
    date,
    endDate,
    recurringDay,
    recurringEndDate,
    time,
    endTime,
    location,
    locationDetails,
    categories,
    image,
    shortDescription,
    ageGroup,
    registrationUrl
  }
`;

// Announcements - active only, not expired
export const announcementsQuery = groq`
  *[_type == "announcement" && active != false && (expiresAt == null || expiresAt > now())] | order(priority desc, date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    excerpt,
    content,
    image,
    category,
    priority,
    featured,
    expiresAt,
    tags,
    callToAction
  }
`;

// Single announcement by slug
export const announcementBySlugQuery = groq`
  *[_type == "announcement" && slug.current == $slug && active != false][0] {
    _id,
    title,
    "slug": slug.current,
    date,
    excerpt,
    content,
    image,
    category,
    priority,
    featured,
    expiresAt,
    tags,
    callToAction
  }
`;

// Urgent announcements for alert banner
export const urgentAnnouncementsQuery = groq`
  *[_type == "announcement" && active != false && priority == "urgent" && (expiresAt == null || expiresAt > now())] | order(date desc) [0...1] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    category,
    callToAction
  }
`;

// Programs - recurring events in Education, Youth, Sports, Women categories
export const programsQuery = groq`
  *[_type == "event" && active != false && featured == true && eventType == "recurring" && (
    "Education" in categories ||
    "Youth" in categories ||
    "Sports" in categories ||
    "Women" in categories
  ) && (recurringEndDate == null || recurringEndDate >= $today)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    description,
    image,
    categories,
    keyFeatures,
    features,
    ageGroup,
    externalLink,
    recurringDay,
    time,
    endTime,
    location,
    locationDetails,
    featured
  }
`;

// Services - active only, ordered by display order
export const servicesQuery = groq`
  *[_type == "service" && active != false] | order(orderRank asc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    icon,
    image,
    availability,
    highlights,
    keyFeatures,
    requirements,
    processSteps,
    fee,
    contactEmail,
    contactPhone,
    formRecipientEmail,
    featured,
    active
  }
`;

// Single service by slug
export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug && active != false][0] {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    icon,
    image,
    availability,
    highlights,
    keyFeatures,
    requirements,
    processSteps,
    fee,
    contactEmail,
    contactPhone,
    formRecipientEmail,
    featured,
    active
  }
`;

// Featured services for homepage
export const featuredServicesQuery = groq`
  *[_type == "service" && active != false && featured == true] | order(orderRank asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    icon,
    image
  }
`;

// ============================================
// Donation Settings (Fundraise Up config)
// ============================================
export const donationSettingsQuery = groq`
  *[_id == "donationSettings"][0] {
    _id,
    installationScript,
    organizationKey
  }
`;

// ============================================
// Donate Page Settings (singleton)
// ============================================
export const donatePageSettingsQuery = groq`
  *[_id == "donatePageSettings"][0] {
    _id,
    heroHeading,
    heroDescription,
    formElement,
    impactStats[] {
      value,
      label
    },
    campaigns[]-> {
      _id,
      title,
      fundraiseUpElement,
      active
    }
  }
`;

// Gallery
export const galleryQuery = groq`
  *[_type == "galleryImage"] | order(orderRank asc) {
    _id,
    image,
    alt,
    caption,
    category,
    featured
  }
`;

export const featuredGalleryQuery = groq`
  *[_type == "galleryImage" && featured == true] | order(orderRank asc) {
    _id,
    image,
    alt,
    caption,
    category
  }
`;

// Media Page Gallery (singleton)
export const mediaGalleryQuery = groq`
  *[_id == "mediaGallery"][0] {
    images[] {
      _key,
      asset,
      alt,
      caption,
      hotspot,
      crop
    }
  }
`;

// FAQs - enhanced with rich text answer and related links
export const faqsQuery = groq`
  *[_type == "faq"] | order(order asc) {
    _id,
    question,
    answer,
    category,
    relatedLinks,
    featured
  }
`;

export const faqsByCategoryQuery = groq`
  *[_type == "faq" && category == $category] | order(order asc) {
    _id,
    question,
    answer,
    relatedLinks
  }
`;

export const featuredFaqsQuery = groq`
  *[_type == "faq" && featured == true] | order(order asc) [0...6] {
    _id,
    question,
    answer,
    category
  }
`;

// Etiquette
export const etiquetteQuery = groq`
  *[_type == "etiquette"] | order(order asc) {
    _id,
    title,
    description,
    icon
  }
`;

// ============================================
// Team Members
// ============================================
export const teamMembersQuery = groq`
  *[_type == "teamMember" && active != false] | order(orderRank asc) {
    _id,
    name,
    "slug": slug.current,
    role,
    category,
    image,
    shortBio,
    qualifications,
    specializations,
    email,
    phone,
    officeHours,
    socialMedia,
    featured,
    showContactInfo
  }
`;

export const teamMemberBySlugQuery = groq`
  *[_type == "teamMember" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    role,
    category,
    image,
    bio,
    shortBio,
    qualifications,
    specializations,
    email,
    phone,
    officeHours,
    socialMedia,
    featured,
    showContactInfo,
    active
  }
`;

export const teamMembersByCategoryQuery = groq`
  *[_type == "teamMember" && active != false && category == $category] | order(orderRank asc) {
    _id,
    name,
    "slug": slug.current,
    role,
    image,
    shortBio,
    featured
  }
`;

export const featuredTeamMembersQuery = groq`
  *[_type == "teamMember" && active != false && featured == true] | order(orderRank asc) [0...6] {
    _id,
    name,
    "slug": slug.current,
    role,
    category,
    image,
    shortBio
  }
`;

// ============================================
// NEW: Page Content
// ============================================
export const pageContentQuery = groq`
  *[_type == "pageContent" && active != false] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    introduction,
    heroImage,
    showInNav,
    navLabel
  }
`;

export const pageContentBySlugQuery = groq`
  *[_type == "pageContent" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    introduction,
    content,
    sections,
    heroImage,
    gallery,
    seo,
    active
  }
`;

export const navigationPagesQuery = groq`
  *[_type == "pageContent" && active != false && showInNav == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    navLabel
  }
`;

// ============================================
// NEW: Resources
// ============================================
export const resourcesQuery = groq`
  *[_type == "resource" && active != false] | order(orderRank asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    thumbnail,
    resourceType,
    category,
    "fileUrl": file.asset->url,
    externalUrl,
    fileSize,
    duration,
    author,
    date,
    language,
    tags,
    featured
  }
`;

export const resourceBySlugQuery = groq`
  *[_type == "resource" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    thumbnail,
    resourceType,
    category,
    "fileUrl": file.asset->url,
    externalUrl,
    fileSize,
    duration,
    author,
    date,
    language,
    tags,
    featured,
    downloadCount,
    active
  }
`;

export const featuredResourcesQuery = groq`
  *[_type == "resource" && active != false && featured == true] | order(date desc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    description,
    thumbnail,
    resourceType,
    category,
    author
  }
`;

// ============================================
// Site Settings (singleton) - enhanced
// ============================================
export const siteSettingsQuery = groq`
  *[_id == "siteSettings"][0] {
    _id,
    organizationName,
    shortName,
    tagline,
    parentOrganization,
    logo,
    logoAlt,
    address,
    phone,
    email,
    googleMapsUrl,
    operatingHours,
    socialMedia,
    externalLinks,
    quickLinks,
    "allowedEmbedDomains": allowedEmbedDomains[] {
      domain,
      label,
      category
    }
  }
`;

// ============================================
// Homepage Settings (singleton)
// ============================================
export const homepageSettingsQuery = groq`
  *[_id == "homepageSettings"][0] {
    _id,
    heroMode,
    heroVideoUrl,
    heroSlides,
    heroVideoOverlays,
    quickLinksSection {
      enabled,
      quickLinkCards[] {
        title,
        subtitle,
        accentColor,
        links[] {
          label,
          linkType,
          internalPage,
          url
        },
        active
      },
      bottomCtaText
    },
    featuredYoutubeUrl,
    welcomeSection,
    ctaBanner
  }
`;

// Prayer Settings (singleton) - flat structure
export const prayerSettingsQuery = groq`
  *[_id == "prayerSettings"][0] {
    _id,
    // Daily prayers
    fajrIqamahMode, fajrFixedTime, fajrDelay,
    dhuhrIqamahMode, dhuhrFixedTime, dhuhrDelay,
    asrIqamahMode, asrFixedTime, asrDelay,
    maghribIqamahMode, maghribFixedTime, maghribDelay,
    ishaIqamahMode, ishaFixedTime, ishaDelay,
    // Jumu'ah
    jumuahArabicTime, jumuahEnglishTime,
    // Taraweeh
    taraweehEnabled, taraweehTime,
    // Eid
    eidFitrActive, eidFitrTime,
    eidAdhaActive, eidAdhaTime
  }
`;

// ============================================
// Form Settings (singleton)
// ============================================
export const formSettingsQuery = groq`
  *[_id == "formSettings"][0] {
    _id,
    // Contact Form
    contactRecipientEmail,
    contactEnabled,
    contactHeading,
    contactHeadingAccent,
    contactDescription,
    contactFormHeading,
    contactFormDescription,
    contactInquiryTypes,
    contactSuccessHeading,
    contactSuccessMessage,
    // Service Inquiry
    serviceInquiryRecipientEmail,
    serviceInquiryEnabled,
    serviceInquiryFormHeading,
    serviceInquiryFormDescription,
    serviceInquirySuccessHeading,
    serviceInquirySuccessMessage,
    // Event Inquiry
    eventInquiryRecipientEmail,
    eventInquiryEnabled,
    // Newsletter
    newsletterRecipientEmail,
    newsletterEnabled,
    newsletterHeading,
    newsletterDescription,
    newsletterButtonText,
    newsletterSuccessMessage
  }
`;

// ============================================
// Featured Announcements for homepage
// ============================================
export const latestAnnouncementsQuery = groq`
  *[_type == "announcement" && active != false && featured == true && (expiresAt == null || expiresAt > now())] | order(date desc) [0...6] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "description": excerpt,
    "date": date,
    image,
    category,
    priority,
    callToAction
  }
`;

// ============================================
// Partners
// ============================================
export const partnersQuery = groq`
  *[_type == "partner" && active != false] | order(orderRank asc) {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    coverImage,
    icon,
    color,
    website,
    featured
  }
`;

export const partnerBySlugQuery = groq`
  *[_type == "partner" && slug.current == $slug && active != false][0] {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    coverImage,
    icon,
    color,
    heroTheme,
    highlights[]{ _key, icon, title, description },
    aboutHeading,
    location,
    ctaHeading,
    ctaDescription,
    ctaButtonLabel,
    website,
    email,
    phone,
    featured,
    active
  }
`;

// ── Page singleton queries ──

export const aboutPageSettingsQuery = groq`
  *[_id == "aboutPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription,
    heroStats, heroImage, heroImageCaption,
    missionVisible, missionImage, missionBadge, missionHeading, missionContent, missionButtonLabel, missionButtonUrl,
    timelineVisible, timelineHeading, timelineItems,
    architecturePreviewVisible, architectureHeading, architectureDescription, architectureImages, architectureFeatures, architectureButtonLabel, architectureButtonUrl,
    valuesVisible, valuesHeading, valuesDescription, valuesCards, valuesButtons,
    seo
  }
`;

export const architecturePageSettingsQuery = groq`
  *[_id == "architecturePageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroContent, heroImage, heroImageBadge,
    philosophyVisible, philosophyBadge, philosophyContent, philosophyImages,
    featuresVisible, featuresHeading, featuresCards,
    galleryVisible, galleryHeading, galleryDescription, galleryImages,
    awardsVisible, awardsBadge, awardsHeading, awardsCards,
    quoteVisible, quoteText, quoteAttribution,
    ctaVisible, ctaHeading, ctaDescription, ctaButtonLabel, ctaButtonUrl,
    seo
  }
`;

export const visitPageSettingsQuery = groq`
  *[_id == "visitPageSettings"][0] {
    heroHeading, heroHeadingAccent, heroDescription,
    visitingInfoVisible, visitingInfoImage, visitingInfoHeading, visitingHours,
    facilitiesVisible, facilitiesHeading, facilitiesDescription, facilitiesCards, facilitiesImage,
    mannersVisible, mannersBadge, mannersHeading, mannersDescription, etiquetteItems,
    faqVisible, faqBadge, faqHeading, faqItems,
    ctaVisible, ctaHeading, ctaDescription, ctaButtons,
    seo
  }
`;

export const worshippersPageSettingsQuery = groq`
  *[_id == "worshippersPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription,
    etiquetteVisible, etiquetteHeading, etiquetteDescription, etiquetteItems,
    khutbahVisible, khutbahHeading,
    ctaVisible, ctaHeading, ctaDescription, ctaButtonLabel, ctaButtonUrl,
    seo
  }
`;

export const contactPageSettingsQuery = groq`
  *[_id == "contactPageSettings"][0] {
    heroHeading, heroHeadingAccent, heroDescription,
    sidebarVisible, operatingHours,
    seo
  }
`;

export const eventsPageSettingsQuery = groq`
  *[_id == "eventsPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription, seo
  }
`;

export const announcementsPageSettingsQuery = groq`
  *[_id == "announcementsPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription, seo
  }
`;

export const servicesPageSettingsQuery = groq`
  *[_id == "servicesPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription, heroCategoryTags, heroImage,
    ctaVisible, ctaHeading, ctaDescription, ctaButtonLabel, ctaButtonUrl,
    seo
  }
`;

export const imamsPageSettingsQuery = groq`
  *[_id == "imamsPageSettings"][0] {
    heroHeading, heroHeadingAccent, heroDescription,
    imamsSectionHeading, imamsSectionDescription,
    servicesOfferedVisible, servicesOfferedHeading, servicesOfferedCards,
    ctaVisible, ctaHeading, ctaDescription, ctaButtons,
    seo
  }
`;

export const resourcesPageSettingsQuery = groq`
  *[_id == "resourcesPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription, seo
  }
`;

export const mediaPageSettingsQuery = groq`
  *[_id == "mediaPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription,
    youtubeVisible, galleryVisible, socialVisible,
    seo
  }
`;

export const partnersPageSettingsQuery = groq`
  *[_id == "partnersPageSettings"][0] {
    heroBadge, heroHeading, heroHeadingAccent, heroDescription,
    ctaVisible, ctaHeading, ctaHeadingAccent, ctaDescription, ctaButtonLabel, ctaButtonUrl,
    seo
  }
`;

export const privacyPageSettingsQuery = groq`
  *[_id == "privacyPageSettings"][0] {
    heading, lastUpdated, content, seo
  }
`;

export const termsPageSettingsQuery = groq`
  *[_id == "termsPageSettings"][0] {
    heading, lastUpdated, content, seo
  }
`;

// ── Form singleton queries ──

export const contactFormSettingsQuery = groq`
  *[_id == "contactFormSettings"][0] {
    contactEnabled, contactRecipientEmail,
    contactHeading, contactHeadingAccent, contactDescription,
    contactFormHeading, contactFormDescription,
    contactInquiryTypes,
    contactSuccessHeading, contactSuccessMessage
  }
`;

export const serviceInquiryFormSettingsQuery = groq`
  *[_id == "serviceInquiryFormSettings"][0] {
    serviceInquiryEnabled, serviceInquiryRecipientEmail,
    serviceInquiryFormHeading, serviceInquiryFormDescription,
    serviceInquirySuccessHeading, serviceInquirySuccessMessage
  }
`;

export const eventInquiryFormSettingsQuery = groq`
  *[_id == "eventInquiryFormSettings"][0] {
    eventInquiryEnabled, eventInquiryRecipientEmail
  }
`;

export const newsletterSettingsQuery = groq`
  *[_id == "newsletterSettings"][0] {
    newsletterEnabled, newsletterRecipientEmail,
    newsletterHeading, newsletterDescription,
    newsletterButtonText, newsletterSuccessMessage
  }
`;

// ── Navigation Settings queries ──

export const headerSettingsQuery = groq`
  *[_id == "headerSettings"][0]{
    announcementBar,
    topBar,
    ctaButton,
    menuDonateCard,
    showSearch,
    contactLink,
    navGroups[]{
      _key, label, description, icon, visible,
      links[]{ _key, label, linkType, page, customUrl, url, visible }
    }
  }
`;

export const footerSettingsQuery = groq`
  *[_id == "footerSettings"][0]{
    newsletter,
    brandDescription,
    donateCard,
    quranVerse,
    bottomBarLinks[]{ _key, label, linkType, page, customUrl, url },
    copyrightText,
    navGroups[]{
      _key, label, visible,
      links[]{ _key, label, linkType, page, customUrl, url, visible }
    }
  }
`;

