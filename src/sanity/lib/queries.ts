import { groq } from "next-sanity";

// Single event by slug (includes full description for detail page)
export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    recurring,
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
    features,
    ageGroup,
    externalLink,
    featured,
    registrationUrl,
    contactEmail,
    contactPhone,
    active
  }
`;

// Events - active events only, recurring always show, non-recurring only if not past
// Also filter recurring events by recurringEndDate if set
// Uses shortDescription for cards (falls back to truncated description)
export const eventsQuery = groq`
  *[_type == "event" && active != false && (
    (recurring == true && (recurringEndDate == null || recurringEndDate >= now())) ||
    date >= now() ||
    endDate >= now()
  )] | order(recurring asc, date asc) {
    _id,
    title,
    "slug": slug.current,
    recurring,
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
    features,
    ageGroup,
    externalLink,
    featured,
    registrationUrl
  }
`;

export const featuredEventsQuery = groq`
  *[_type == "event" && active != false && featured == true && (
    (recurring == true && (recurringEndDate == null || recurringEndDate >= now())) ||
    date >= now() ||
    endDate >= now()
  )] | order(recurring asc, date asc) [0...5] {
    _id,
    title,
    "slug": slug.current,
    recurring,
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
    features,
    ageGroup,
    externalLink,
    registrationUrl
  }
`;

// Past events archive - non-recurring events that have passed
export const pastEventsQuery = groq`
  *[_type == "event" && active != false && recurring != true && date < now() && (endDate == null || endDate < now())] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    endDate,
    time,
    location,
    categories,
    image,
    description
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
  *[_type == "announcement" && slug.current == $slug][0] {
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

// Featured announcements for homepage section
export const featuredAnnouncementsQuery = groq`
  *[_type == "announcement" && active != false && featured == true && (expiresAt == null || expiresAt > now())] | order(priority desc, date desc) [0...4] {
    _id,
    title,
    "slug": slug.current,
    date,
    excerpt,
    image,
    category,
    priority,
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
  *[_type == "event" && active != false && recurring == true && (
    "Education" in categories ||
    "Youth" in categories ||
    "Sports" in categories ||
    "Women" in categories
  ) && (recurringEndDate == null || recurringEndDate >= now())] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    description,
    image,
    categories,
    features,
    ageGroup,
    externalLink,
    recurringDay,
    time,
    endTime,
    location,
    locationDetails
  }
`;

// Services - enhanced with new fields
export const servicesQuery = groq`
  *[_type == "service" && active != false] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    icon,
    image,
    availability,
    requirements,
    processSteps,
    fee,
    duration,
    bookingRequired,
    bookingUrl,
    contactEmail,
    contactPhone,
    contactPerson,
    featured,
    active
  }
`;

// Single service by slug
export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    icon,
    image,
    availability,
    requirements,
    processSteps,
    fee,
    duration,
    bookingRequired,
    bookingUrl,
    contactEmail,
    contactPhone,
    contactPerson,
    featured,
    active
  }
`;

// Featured services for homepage
export const featuredServicesQuery = groq`
  *[_type == "service" && active != false && featured == true] | order(order asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    icon,
    image
  }
`;

// Donation Causes - enhanced with new fields
export const donationCausesQuery = groq`
  *[_type == "donationCause" && active != false && (
    campaignType == "ongoing" ||
    endDate == null ||
    endDate >= now()
  )] | order(priority desc, order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    fullDescription,
    image,
    icon,
    campaignType,
    startDate,
    endDate,
    goal,
    raised,
    showProgress,
    paymentOptions,
    featured,
    priority
  }
`;

// Single donation cause by slug
export const donationCauseBySlugQuery = groq`
  *[_type == "donationCause" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    fullDescription,
    image,
    icon,
    campaignType,
    startDate,
    endDate,
    goal,
    raised,
    showProgress,
    paymentOptions,
    featured,
    priority,
    active
  }
`;

// Featured donation causes for homepage
export const featuredDonationCausesQuery = groq`
  *[_type == "donationCause" && active != false && featured == true] | order(priority desc, order asc) [0...4] {
    _id,
    title,
    "slug": slug.current,
    description,
    image,
    icon,
    goal,
    raised,
    showProgress,
    priority
  }
`;

// ============================================
// Donation Campaigns - Scheduled Daily Billing
// ============================================

// Active campaigns where signup is currently open
export const donationCampaignsQuery = groq`
  *[_type == "donationCampaign" && active != false && (
    signupStartDate == null || signupStartDate <= now()
  ) && (
    signupEndDate == null || signupEndDate >= now()
  ) && endDate >= now()] | order(startDate asc, order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    fullDescription,
    image,
    icon,
    startDate,
    endDate,
    signupStartDate,
    signupEndDate,
    presetAmounts,
    allowCustomAmount,
    minimumAmount,
    maximumAmount,
    featured,
    goal,
    raised,
    subscriberCount
  }
`;

// Single campaign by slug (includes all fields for detail page)
export const donationCampaignBySlugQuery = groq`
  *[_type == "donationCampaign" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    fullDescription,
    image,
    icon,
    startDate,
    endDate,
    signupStartDate,
    signupEndDate,
    presetAmounts,
    allowCustomAmount,
    minimumAmount,
    maximumAmount,
    active,
    featured,
    goal,
    raised,
    subscriberCount
  }
`;

// Featured campaigns for homepage display
export const featuredDonationCampaignsQuery = groq`
  *[_type == "donationCampaign" && active != false && featured == true && (
    signupStartDate == null || signupStartDate <= now()
  ) && (
    signupEndDate == null || signupEndDate >= now()
  ) && endDate >= now()] | order(startDate asc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    description,
    image,
    icon,
    startDate,
    endDate,
    presetAmounts,
    goal,
    raised
  }
`;

// Gallery
export const galleryQuery = groq`
  *[_type == "galleryImage"] | order(order asc) {
    _id,
    image,
    alt,
    caption,
    category,
    featured
  }
`;

export const featuredGalleryQuery = groq`
  *[_type == "galleryImage" && featured == true] | order(order asc) {
    _id,
    image,
    alt,
    caption,
    category
  }
`;

// Testimonials
export const testimonialsQuery = groq`
  *[_type == "testimonial" && featured == true] | order(order asc) {
    _id,
    quote,
    author,
    role,
    image
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

// Tour Types
export const tourTypesQuery = groq`
  *[_type == "tourType" && active != false] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    icon,
    image,
    duration,
    groupSize
  }
`;

// Tour Requests (for admin)
export const tourRequestsQuery = groq`
  *[_type == "tourRequest"] | order(submittedAt desc) {
    _id,
    name,
    email,
    phone,
    tourType->{title},
    preferredDate,
    preferredTime,
    groupSize,
    organization,
    message,
    status,
    submittedAt,
    notes
  }
`;

// ============================================
// NEW: Team Members
// ============================================
export const teamMembersQuery = groq`
  *[_type == "teamMember" && active != false] | order(category asc, order asc) {
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
  *[_type == "teamMember" && active != false && category == $category] | order(order asc) {
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
  *[_type == "teamMember" && active != false && featured == true] | order(category asc, order asc) [0...6] {
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
  *[_type == "pageContent" && active != false] | order(navOrder asc) {
    _id,
    title,
    "slug": slug.current,
    pageType,
    subtitle,
    introduction,
    heroImage,
    showInNav,
    navOrder
  }
`;

export const pageContentBySlugQuery = groq`
  *[_type == "pageContent" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    pageType,
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

export const pageContentByTypeQuery = groq`
  *[_type == "pageContent" && pageType == $pageType && active != false][0] {
    _id,
    title,
    "slug": slug.current,
    pageType,
    subtitle,
    introduction,
    content,
    sections,
    heroImage,
    gallery,
    seo
  }
`;

export const navigationPagesQuery = groq`
  *[_type == "pageContent" && active != false && showInNav == true] | order(navOrder asc) {
    _id,
    title,
    "slug": slug.current,
    navOrder
  }
`;

// ============================================
// NEW: Resources
// ============================================
export const resourcesQuery = groq`
  *[_type == "resource" && active != false] | order(date desc, order asc) {
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

export const resourcesByCategoryQuery = groq`
  *[_type == "resource" && active != false && category == $category] | order(date desc, order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    thumbnail,
    resourceType,
    "fileUrl": file.asset->url,
    externalUrl,
    fileSize,
    duration,
    author,
    date,
    language
  }
`;

export const resourcesByTypeQuery = groq`
  *[_type == "resource" && active != false && resourceType == $resourceType] | order(date desc, order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    thumbnail,
    category,
    "fileUrl": file.asset->url,
    externalUrl,
    fileSize,
    duration,
    author,
    date
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
  *[_type == "siteSettings"][0] {
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
    heroSlides,
    welcomeSection,
    ctaBanner,
    externalLinks,
    quickLinks
  }
`;

// Prayer Settings (singleton) - flat structure
export const prayerSettingsQuery = groq`
  *[_type == "prayerSettings"][0] {
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
