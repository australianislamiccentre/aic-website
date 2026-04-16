# Sanity Studio Restructure & Content Migration

**Date:** 2026-03-30
**Branch:** `update/sanity-content-structure`
**Scope:** Restructure Sanity Studio desk, create page-level singletons for all pages, add Sanity plugins, improve field validation and previews. All times/dates use Melbourne timezone (Australia/Melbourne).

---

## 1. Studio Sidebar Structure

The new desk structure organises everything by page. Admins think in pages, not abstract content types.

```
Content (root)
├── Site Pages
│   ├── Homepage              (singleton: homepageSettings) [EXISTING - restructure fields]
│   ├── About                 (singleton: aboutPageSettings) [NEW]
│   ├── Architecture          (singleton: architecturePageSettings) [NEW]
│   ├── Visit                 (singleton: visitPageSettings) [NEW]
│   │   └── etiquette + FAQ items managed inline
│   ├── Worshippers           (singleton: worshippersPageSettings) [NEW]
│   ├── Contact               (singleton: contactPageSettings) [NEW]
│   ├── Accessibility         (singleton: accessibilityPageSettings) [NEW]
│   ├── Events                (folder)
│   │   ├── Page Settings     (singleton: eventsPageSettings) [NEW]
│   │   ├── Live on Website   (filtered event documents)
│   │   ├── Expired           (filtered event documents)
│   │   └── Inactive          (filtered event documents)
│   ├── Announcements         (folder)
│   │   ├── Page Settings     (singleton: announcementsPageSettings) [NEW]
│   │   ├── Active            (filtered announcement documents)
│   │   └── Inactive          (filtered announcement documents)
│   ├── Services              (folder)
│   │   ├── Page Settings     (singleton: servicesPageSettings) [NEW]
│   │   ├── Active            (filtered service documents)
│   │   └── Inactive          (filtered service documents)
│   ├── Donate                (folder)
│   │   ├── Page Settings     (singleton: donatePageSettings) [EXISTING]
│   │   ├── Active Campaigns  (filtered donationCampaign documents)
│   │   ├── Inactive Campaigns
│   │   └── Offline Donations (singleton: offlineDonations)
│   ├── Imams / Team          (folder)
│   │   ├── Page Settings     (singleton: imamsPageSettings) [NEW]
│   │   └── Team Members      (orderable teamMember list)
│   ├── Resources             (folder)
│   │   ├── Page Settings     (singleton: resourcesPageSettings) [NEW]
│   │   └── All Resources     (resource documents)
│   ├── Media                 (folder)
│   │   ├── Page Settings     (singleton: mediaPageSettings) [NEW]
│   │   ├── Gallery Images    (orderable galleryImage list — homepage strip + media page)
│   │   └── Media Page Gallery (singleton: mediaGallery)
│   ├── Partners              (folder)
│   │   ├── Page Settings     (singleton: partnersPageSettings) [NEW]
│   │   └── All Partners      (orderable partner list)
│   ├── Privacy               (singleton: privacyPageSettings) [NEW]
│   ├── Terms                 (singleton: termsPageSettings) [NEW]
│   ├── ─── divider ───
│   └── Custom Pages          (pageContent documents — dynamic CMS pages)
│
├── Prayer Times              (singleton: prayerSettings) [EXISTING]
├── Forms                     (folder) [RESTRUCTURED — split into separate singletons]
│   ├── Contact Form          (singleton: contactFormSettings) [NEW]
│   ├── Service Inquiry Form  (singleton: serviceInquiryFormSettings) [NEW]
│   ├── Event Inquiry Form    (singleton: eventInquiryFormSettings) [NEW]
│   ├── Newsletter            (singleton: newsletterSettings) [NEW]
│   └── Allowed Form Domains  (singleton: allowedFormDomains) [NEW — moved from siteSettings]
├── Donation Settings         (singleton: donationSettings) [EXISTING]
│   └── Note: "To edit the donate page content, go to Site Pages > Donate"
└── Site Settings             (singleton: siteSettings) [EXISTING — minus allowedEmbedDomains]
    └── Note: allowedEmbedDomains moved to Forms > Allowed Form Domains
```

### Intentionally excluded pages

These pages are not included in the Studio sidebar because they are temporary/internal:

- `/live-donations` — temporary Ramadan campaign display page (`robots: noindex`). Hardcoded campaign config. If it becomes permanent, create a singleton.
- `/fundraise` — temporary Laylatul Qadr fundraiser page (`robots: noindex`). Same approach.
- `/partners/aicc` — hardcoded partner sub-page. Will be replaced by the new `/partners/[slug]` dynamic route (see section 4.7).

### Singleton protection

All singletons (existing and new) have delete and duplicate actions disabled. The `singletonTypes` array in `sanity.config.ts` must include every new singleton type.

### Cross-reference notes in Studio

Where config lives in a different location from the page, Sanity `description` annotations guide the admin:

- **Contact page schema:** "To edit the contact form settings (recipient email, success message, inquiry types), go to Forms > Contact Form in the sidebar."
- **Events Page Settings:** "To edit the event inquiry form recipient, go to Forms > Event Inquiry Form."
- **Services Page Settings:** "To edit the service inquiry form, go to Forms > Service Inquiry Form."
- **Donate Page Settings:** "To change the FundraiseUp SDK or organisation key, go to Donation Settings in the sidebar."
- **Donation Settings:** "To edit the donate page content (hero, campaigns, impact stats), go to Site Pages > Donate."
- **Prayer Times:** "Prayer times appear on the Homepage (hero) and Worshippers page. Changes here update both."
- **Newsletter Settings:** "The newsletter form appears in the footer on every page."

---

## 2. New Page Singleton Schemas

Each schema's fields are ordered top-to-bottom matching the page layout. Every field has a `description` explaining where it appears on the page.

### Field conventions

- **`visible` toggles:** Every section has a `boolean` field (default `true`) to show/hide it. Admin can't reorder or add sections, but can hide any section.
- **`icon` fields:** String type with a predefined list of lucide-react icon names (e.g. `"Heart"`, `"BookOpen"`, `"Users"`). The page component maps the string to the icon component.
- **SEO fields:** Every page singleton has `seoTitle` (string, optional — falls back to page heading), `seoDescription` (text, max 160, warning if empty), `seoImage` (image). Extracted into a reusable shared object type at `src/sanity/schemas/shared/seoFields.ts`.
- **Image fields:** Each page has its own image fields for images displayed on that page. Images are NOT shared across pages — each page manages its own. The `sanity-plugin-media` provides a global media library so admins can reuse previously uploaded assets when selecting images for any field.

### 2.1 About Page (`aboutPageSettings`)

Currently fully hardcoded in a single client component. Must be refactored to server/client split (`page.tsx` + `AboutContent.tsx`) as part of implementation.

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Hero Section** | | |
| `heroBadge` | string | Badge text above the heading (e.g. "Welcome to AIC") |
| `heroHeading` | string (required) | Main page heading |
| `heroHeadingAccent` | string | Word(s) displayed in teal colour |
| `heroDescription` | text | Paragraph below the heading |
| `heroStats` | array of {value, label} (max 3) | Stat cards beside the heading (e.g. "40+ Years Serving") |
| `heroImage` | image | Large image in the hero section |
| `heroImageCaption` | string | Floating badge text on the image (e.g. "Newport, Melbourne") |
| **Mission & Vision Section** | | |
| `missionVisible` | boolean (default true) | Show/hide this section |
| `missionImage` | image | Image on the left side |
| `missionBadge` | string | Small badge above heading (e.g. "Our Mission & Vision") |
| `missionHeading` | string | Section heading |
| `missionContent` | portable text | Section body text |
| `missionButtonLabel` | string | Button text (e.g. "Visit Our Centre") |
| `missionButtonUrl` | string | Button link |
| **Timeline Section** | | |
| `timelineVisible` | boolean (default true) | Show/hide this section |
| `timelineHeading` | string | Section heading (e.g. "A Legacy of Service") |
| `timelineItems` | array of {year, title, description, icon} | Timeline entries in chronological order. Icon: lucide-react icon name. |
| **Architecture Preview Section** | | |
| `architecturePreviewVisible` | boolean (default true) | Show/hide this section |
| `architectureHeading` | string | Section heading |
| `architectureDescription` | text | Description paragraph |
| `architectureImages` | array of image (max 3) | Gallery images for this section |
| `architectureFeatures` | array of {title, description, icon} (max 3) | Feature cards (e.g. "96 Lanterns"). Icon: lucide-react icon name. |
| `architectureButtonLabel` | string | Button text |
| `architectureButtonUrl` | string | Button link |
| **Values Section** | | |
| `valuesVisible` | boolean (default true) | Show/hide this section |
| `valuesHeading` | string | Section heading (e.g. "What We Stand For") |
| `valuesDescription` | text | Description text |
| `valuesCards` | array of {title, description, icon} (max 4) | Value cards. Icon: lucide-react icon name. |
| `valuesButtons` | array of {label, url, variant} (max 2) | CTA buttons |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.2 Architecture Page (`architecturePageSettings`)

Currently fully hardcoded. Must be refactored to server/client split.

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Hero Section** | | |
| `heroBadge` | string | Badge text (e.g. "Award-Winning Design") |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroContent` | portable text | Description paragraphs |
| `heroImage` | image | Hero image |
| `heroImageBadge` | string | Floating badge on image |
| **Design Philosophy Section** | | |
| `philosophyVisible` | boolean (default true) | Show/hide |
| `philosophyBadge` | string | Section badge text |
| `philosophyContent` | portable text | Body text |
| `philosophyImages` | array of image (max 2) | Detail images |
| **Features Section** | | |
| `featuresVisible` | boolean (default true) | Show/hide |
| `featuresHeading` | string | Section heading |
| `featuresCards` | array of {title, description, icon} (max 6) | Feature cards. Icon: lucide-react icon name. |
| **Gallery Section** | | |
| `galleryVisible` | boolean (default true) | Show/hide |
| `galleryHeading` | string | Section heading |
| `galleryDescription` | text | Description |
| `galleryImages` | array of image with alt + caption | Gallery grid images |
| **Awards Section** | | |
| `awardsVisible` | boolean (default true) | Show/hide |
| `awardsBadge` | string | Badge text (e.g. "Recognition") |
| `awardsHeading` | string | Section heading |
| `awardsCards` | array of {year, title, organization, category} (max 4) | Award entries |
| **Architect Quote Section** | | |
| `quoteVisible` | boolean (default true) | Show/hide |
| `quoteText` | text | The blockquote text |
| `quoteAttribution` | string | Author name and title |
| **Visit CTA Section** | | |
| `ctaVisible` | boolean (default true) | Show/hide |
| `ctaHeading` | string | CTA heading |
| `ctaDescription` | text | CTA description |
| `ctaButtonLabel` | string | Button text |
| `ctaButtonUrl` | string | Button link |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.3 Visit Page (`visitPageSettings`)

Currently hybrid — UI hardcoded, etiquette + FAQs from Sanity. Etiquette and visitor FAQs will be inlined into this singleton.

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Page Header** | | |
| `heroHeading` | string (required) | Page heading (e.g. "Visit Us") |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| **Visiting Information Section** | | |
| `visitingInfoVisible` | boolean (default true) | Show/hide |
| `visitingInfoImage` | image | Left column image |
| `visitingInfoHeading` | string | Section heading |
| `visitingHours` | string | Operating hours text (e.g. "4:30 AM - 10:30 PM Daily") |
| Note: | | "Address, phone, email pulled from Site Settings." |
| **Facilities Section** | | |
| `facilitiesVisible` | boolean (default true) | Show/hide |
| `facilitiesHeading` | string | Section heading |
| `facilitiesDescription` | text | Intro paragraph |
| `facilitiesCards` | array of {name, icon, capacity, description} (max 8) | Facility cards. Icon: lucide-react icon name. |
| `facilitiesImage` | image | Section image |
| **Mosque Manners Section** | | |
| `mannersVisible` | boolean (default true) | Show/hide |
| `mannersBadge` | string | Badge text (e.g. "Visitor Guidelines") |
| `mannersHeading` | string | Section heading |
| `mannersDescription` | text | Intro text |
| `etiquetteItems` | array of {title, description, icon, order} | Etiquette cards. Icon: lucide-react icon name. |
| **FAQ Section** | | |
| `faqVisible` | boolean (default true) | Show/hide |
| `faqBadge` | string | Badge text |
| `faqHeading` | string | Section heading |
| `faqItems` | array of {question, answer (portable text)} | Accordion FAQ items for visitors |
| **CTA Section** | | |
| `ctaVisible` | boolean (default true) | Show/hide |
| `ctaHeading` | string | CTA heading |
| `ctaDescription` | text | CTA text |
| `ctaButtons` | array of {label, url, variant} (max 2) | CTA buttons |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

**Migration note:** Existing `etiquette` documents and `faq` documents with `category == "visiting"` will be migrated into this singleton's inline arrays. The standalone `etiquette` schema will be deprecated (hidden from desk, kept registered for backward compatibility).

### 2.4 Worshippers Page (`worshippersPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Hero Section** | | |
| `heroBadge` | string | Badge text |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| **Prayer Times Section** | | |
| Note: | | "Prayer times are managed in Prayer Times (sidebar). This section displays them automatically." |
| **Jumu'ah Section** | | |
| Note: | | "Jumu'ah times are managed in Prayer Times (sidebar)." |
| **Mosque Etiquette Section** | | |
| `etiquetteVisible` | boolean (default true) | Show/hide |
| `etiquetteHeading` | string | Section heading |
| `etiquetteDescription` | text | Section intro text |
| `etiquetteItems` | array of {title, description, icon} | Etiquette cards shown on this page |
| **Khutbah Videos Section** | | |
| `khutbahVisible` | boolean (default true) | Show/hide |
| `khutbahHeading` | string | Section heading |
| Note: | | "Videos are pulled automatically from the AIC YouTube channel." |
| **CTA Section** | | |
| `ctaVisible` | boolean (default true) | Show/hide |
| `ctaHeading` | string | CTA heading |
| `ctaDescription` | text | CTA text |
| `ctaButtonLabel` | string | Button text |
| `ctaButtonUrl` | string | Button link |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

**Note on etiquette duplication:** Visit page and Worshippers page each have their own `etiquetteItems` array. These are intentionally independent — the Visit page may show visitor-focused etiquette while the Worshippers page may show worship-focused etiquette. If admins want the same items on both, they copy them manually.

### 2.5 Contact Page (`contactPageSettings`)

Currently hardcoded. Must be refactored to server/client split.

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Page Header** | | |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| **Contact Form** | | |
| Note: | | "To edit the contact form settings (recipient email, inquiry types, success message), go to Forms > Contact Form in the sidebar." |
| **Sidebar** | | |
| `sidebarVisible` | boolean (default true) | Show/hide sidebar |
| `operatingHours` | string | Hours shown in sidebar (e.g. "4:30 AM - 10:30 PM Daily") |
| Note: | | "Phone, email, address, and social links are pulled from Site Settings." |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.6 Accessibility Page (`accessibilityPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| `heading` | string (required) | Page heading |
| `lastUpdated` | date | "Last updated" date shown below heading. Melbourne time. |
| `content` | portable text (h2, h3, lists, links, bold, italic) | Full accessibility statement — rendered as-is on the page |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.7 Events Page Settings (`eventsPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Page Header** | | |
| `heroBadge` | string | Badge text (e.g. "Upcoming") |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| Note: | | "Events are managed below in Live on Website / Expired / Inactive. To edit the event inquiry form, go to Forms > Event Inquiry Form." |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.8 Announcements Page Settings (`announcementsPageSettings`)

Same pattern as Events Page Settings:
- `heroBadge`, `heroHeading` (required), `heroHeadingAccent`, `heroDescription`
- Note pointing to announcement list below
- SEO fields

### 2.9 Services Page Settings (`servicesPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Hero Section** | | |
| `heroBadge` | string | Badge text (e.g. "Community Support") |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| `heroCategoryTags` | array of string (max 5) | Category tags shown below description (e.g. "Religious Services", "Counselling") |
| `heroImage` | image | Hero image (desktop only) |
| Note: | | "Services are managed below in Active / Inactive. To edit the service inquiry form, go to Forms > Service Inquiry Form." |
| **CTA Section** | | |
| `ctaVisible` | boolean (default true) | Show/hide |
| `ctaHeading` | string | CTA heading |
| `ctaDescription` | text | CTA text |
| `ctaButtonLabel` | string | Button text |
| `ctaButtonUrl` | string | Button link |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.10 Imams Page Settings (`imamsPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Page Header** | | |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| **Imams Section** | | |
| `imamsSectionHeading` | string | Section heading (e.g. "Meet Our Religious Leaders") |
| `imamsSectionDescription` | text | Section intro text |
| Note: | | "Team members are managed below." |
| **Services Offered Section** | | |
| `servicesOfferedVisible` | boolean (default true) | Show/hide |
| `servicesOfferedHeading` | string | Section heading |
| `servicesOfferedCards` | array of {title, description, icon} (max 6) | Service cards. Icon: lucide-react icon name. |
| **CTA Section** | | |
| `ctaVisible` | boolean (default true) | Show/hide |
| `ctaHeading` | string | CTA heading |
| `ctaDescription` | text | CTA text |
| `ctaButtons` | array of {label, url, variant} (max 2) | CTA buttons |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.11 Resources Page Settings (`resourcesPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Page Header** | | |
| `heroBadge` | string | Badge text (e.g. "Knowledge Hub") |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| Note: | | "Resources are managed below." |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.12 Media Page Settings (`mediaPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Page Header** | | |
| `heroBadge` | string | Badge text (e.g. "Gallery & Videos") |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| **YouTube Section** | | |
| `youtubeVisible` | boolean (default true) | Show/hide YouTube section |
| Note: | | "Videos are pulled automatically from the AIC YouTube channel." |
| **Photo Gallery Section** | | |
| `galleryVisible` | boolean (default true) | Show/hide gallery section |
| Note: | | "Gallery images are managed below in Gallery Images and Media Page Gallery." |
| **Social Links Section** | | |
| `socialVisible` | boolean (default true) | Show/hide social links |
| Note: | | "Social media links are pulled from Site Settings." |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.13 Partners Page Settings (`partnersPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| **Page Header** | | |
| `heroBadge` | string | Badge text (e.g. "Our Network") |
| `heroHeading` | string (required) | Page heading |
| `heroHeadingAccent` | string | Teal-coloured word(s) |
| `heroDescription` | text | Paragraph below heading |
| Note: | | "Partners are managed below." |
| **Partnership CTA Section** | | |
| `ctaVisible` | boolean (default true) | Show/hide |
| `ctaHeading` | string | CTA heading |
| `ctaHeadingAccent` | string | Teal-coloured word(s) |
| `ctaDescription` | text | CTA text |
| `ctaButtonLabel` | string | Button text |
| `ctaButtonUrl` | string | Button link |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.14 Privacy Page (`privacyPageSettings`)

| Field | Type | Description shown to admin |
|-------|------|---------------------------|
| `heading` | string (required) | Page heading (e.g. "Privacy Policy") |
| `lastUpdated` | date | "Last updated" date shown below heading. Melbourne time. |
| `content` | portable text (h2, h3, lists, links, bold, italic) | Full policy content — rendered as-is on the page |
| **SEO** | | |
| `seo` | seoFields object | Meta title, description, OG image |

### 2.15 Terms Page (`termsPageSettings`)

Same structure as Privacy:
- `heading` (required), `lastUpdated`, `content` (portable text)
- SEO fields

---

## 3. Forms Restructure

The existing `formSettings` singleton is **split into 5 separate singletons** so each item in the Forms folder opens its own clean document. This matches the admin mental model — "I want to change the newsletter" → click Newsletter.

### New form singletons

**`contactFormSettings`** (singleton)
| Field | Type | Description |
|-------|------|-------------|
| `contactEnabled` | boolean (default true) | Enable/disable the contact form |
| `contactRecipientEmail` | email | Where contact form submissions are sent |
| `contactHeading` | string | Heading on the contact page |
| `contactHeadingAccent` | string | Teal-coloured accent word |
| `contactDescription` | text | Description below heading |
| `contactFormHeading` | string | Form section heading |
| `contactFormDescription` | text | Text above the form fields |
| `contactInquiryTypes` | array of string | Dropdown options for enquiry type |
| `contactSuccessHeading` | string | Shown after form submission |
| `contactSuccessMessage` | text | Success message body |

**`serviceInquiryFormSettings`** (singleton)
| Field | Type | Description |
|-------|------|-------------|
| `serviceInquiryEnabled` | boolean (default true) | Enable/disable |
| `serviceInquiryRecipientEmail` | email | Recipient email |
| `serviceInquiryFormHeading` | string | Form heading |
| `serviceInquiryFormDescription` | text | Form description |
| `serviceInquirySuccessHeading` | string | Success heading |
| `serviceInquirySuccessMessage` | text | Success message |

**`eventInquiryFormSettings`** (singleton)
| Field | Type | Description |
|-------|------|-------------|
| `eventInquiryEnabled` | boolean (default true) | Enable/disable |
| `eventInquiryRecipientEmail` | email | Recipient email (falls back to contact email) |

**`newsletterSettings`** (singleton)
| Field | Type | Description |
|-------|------|-------------|
| `newsletterEnabled` | boolean (default true) | Enable/disable |
| `newsletterRecipientEmail` | email | Recipient email |
| `newsletterHeading` | string | Heading in footer newsletter section |
| `newsletterDescription` | text | Description in footer |
| `newsletterButtonText` | string | Subscribe button text |
| `newsletterSuccessMessage` | string | Shown after subscribing |

**`allowedFormDomains`** (singleton — moved from `siteSettings.allowedEmbedDomains`)
| Field | Type | Description |
|-------|------|-------------|
| `allowedDomains` | array of {domain (required), label} | Trusted domains for embedded forms (e.g. jotform.com). Controls which external form URLs can be embedded on event pages. |

### Migration plan for formSettings split

1. Deploy new form singleton schemas (site keeps using old `formSettings`)
2. Run migration script: read existing `formSettings` document via `writeClient`, write fields to each new singleton
3. Update `FormSettingsContext` to merge from 5 singletons instead of 1
4. Update `src/lib/form-settings.ts` (server-side recipient lookup) to read from new singletons
5. Update `src/middleware.ts` to query `allowedFormDomains` instead of `siteSettings.allowedEmbedDomains`
6. Update `src/app/events/[slug]/page.tsx` to use new `getAllowedFormDomains()` fetch
7. Deprecate old `formSettings` singleton (hide from desk, keep registered)

---

## 4. Existing Schema Changes

### 4.1 `siteSettings` — Remove `allowedEmbedDomains`

Move `allowedEmbedDomains` to the new `allowedFormDomains` singleton under Forms. **All references that must be updated:**
- `src/sanity/lib/queries.ts` — GROQ query
- `src/sanity/lib/fetch.ts` — `getAllowedEmbedDomains()` fetch function
- `src/app/events/[slug]/page.tsx` — calls the fetch function
- `src/middleware.ts` — queries `siteSettings.allowedEmbedDomains` directly via Sanity API
- `src/types/sanity.ts` — `SiteSettings` interface

### 4.2 `homepageSettings` — Restructure fields

The existing schema already has the right fields. Add `description` annotations to every field explaining where it appears on the page. Add SEO fields (`seo` object). Ensure fields are ordered to match the page layout top-to-bottom.

### 4.3 Document type list items

All content types that previously appeared as auto-listed items at the bottom of the desk (service, teamMember, galleryImage, faq, etiquette, resource, partner, pageContent) are now nested under their respective page folders. The auto-list (`S.documentTypeListItems()`) at the bottom is removed entirely.

### 4.4 `etiquette` schema — Deprecation

Once etiquette items are migrated into `visitPageSettings.etiquetteItems` and `worshippersPageSettings.etiquetteItems`, the standalone `etiquette` document type is deprecated. Keep it registered in the schema (to avoid breaking any residual queries) but hide from the desk structure.

### 4.5 Partner detail pages — Dynamic route

Create `/partners/[slug]/page.tsx` (server component) + `PartnerDetail.tsx` (client component) as a dynamic route, replacing the hardcoded `/partners/aicc/` sub-page. The `partner` schema already has all needed fields: `name`, `slug`, `fullDescription` (portable text), `coverImage`, `logo`, `website`, `email`, `phone`, `shortDescription`.

**Changes:**
- Create `src/app/partners/[slug]/page.tsx` — fetches partner by slug, generates static params
- Create `src/app/partners/[slug]/PartnerDetailContent.tsx` — renders partner detail
- Delete `src/app/partners/aicc/` directory (hardcoded page)
- Add `getPartnerBySlug()` fetch function and GROQ query
- Add `getPartnersForStaticGeneration()` fetch function
- Add redirect from `/partners/aicc` to the new dynamic route (in `next.config.ts`) in case of existing links
- Admin edits partner content from **Site Pages > Partners > All Partners > [partner document]**

### 4.6 `faq` schema — Partial migration

The `faq` schema stays for non-visiting categories (prayer, services, programs, donations, facilities, general). Visiting FAQs move into `visitPageSettings.faqItems`. The `faq` documents with `category == "visiting"` can be migrated and eventually removed.

### 4.7 `gallery.ts` file rename

The file `gallery.ts` is renamed to `galleryImage.ts` to match its schema `name` value (`"galleryImage"`). This is a file-only change — the schema `name` does not change, so no data migration is needed.

---

## 5. Sanity Plugins

### 5.1 `@sanity/orderable-document-list` — Drag-and-drop ordering

**Install:** `npm install @sanity/orderable-document-list`

**Schemas to make orderable:**
- `service` — services page ordering
- `teamMember` — imams page ordering
- `galleryImage` — gallery ordering
- `partner` — partners page ordering
- `resource` — resources page ordering

**Changes per schema:**
1. Add `orderRankField({ type: 'schemaName' })` to fields
2. Add `orderRankOrdering` to orderings
3. Update GROQ queries to `| order(orderRank)` instead of `| order(order asc)`
4. Remove the manual `order` number field after initial rank generation

**Desk structure:** Use `orderableDocumentListDeskItem()` for orderable document lists inside page folders.

**Post-install:** Open each orderable list in Studio and click "Reset Order" to generate initial ranks for existing documents.

### 5.2 Scheduled Publishing (Built-in)

**No plugin install needed** — built into Sanity Studio v3.39.0+.

**Configuration in `sanity.config.ts`:**
```ts
scheduledPublishing: {
  enabled: true,
  inputDateTimeFormat: 'dd/MM/yyyy h:mm a',
}
```

**Prerequisite:** Requires Sanity Growth plan or above. Verify the project is on this plan before enabling. If not on Growth plan, skip this feature — it will not break anything, just won't be available.

**Timezone:** All scheduled times display in the user's browser timezone. Since admins are in Melbourne, this works by default. Add a `description` note on date/time fields: "All times are in Melbourne time (AEST/AEDT)."

### 5.3 `sanity-plugin-media` — Enhanced media library

**Install:** `npm install sanity-plugin-media`

**Configuration in `sanity.config.ts`:**
```ts
import { media } from 'sanity-plugin-media'

plugins: [
  media(),
  // ...existing plugins
]
```

**Desk structure:** Hide the auto-generated `media.tag` document type from the desk structure by adding it to the exclude filter.

---

## 6. Better Field Validation

### Character count with live preview
- All `text` fields with max length show remaining characters
- `seoDescription` fields: max 160, warning at 120 ("Optimal length is 120-160 characters")
- `shortDescription` / `excerpt` fields: enforce existing max lengths with visible counter

### Image guidance
- Hero images: description says "Recommended: 1200x600px minimum"
- OG/social images: description says "Recommended: 1200x630px"
- Team member photos: description says "Recommended: square aspect ratio"

### URL and email validation
- All URL fields: `Rule.uri({ scheme: ['http', 'https'] })`
- Email fields: `Rule.email()`

### Required field enforcement
- Page headings: required on all page singletons
- SEO title: optional (falls back to page heading)
- SEO description: optional but show warning if empty ("Recommended for search engine visibility")

### Date/time fields
- All date pickers: description includes "Melbourne time (AEST/AEDT)"

---

## 7. Custom Document Previews

Improve document list previews so admins can identify documents at a glance:

| Document type | Preview subtitle format |
|--------------|----------------------|
| `event` | "Fri 15 Mar 2026 · 7:00 PM · Recurring" |
| `announcement` | "15 Mar 2026 · Urgent · Community" |
| `service` | "By appointment · Active" |
| `teamMember` | "Head Imam · imam" (with photo thumbnail) |
| `donationCampaign` | "Active" or "Inactive" |
| `resource` | "PDF · Quran · 2.5 MB" |
| `partner` | Name + logo thumbnail + active status |

---

## 8. Schema File Organisation

```
src/sanity/schemas/
├── index.ts                    — Schema registry (updated with all new types)
├── pages/                      — Page singleton schemas [NEW folder]
│   ├── aboutPageSettings.ts
│   ├── accessibilityPageSettings.ts
│   ├── architecturePageSettings.ts
│   ├── visitPageSettings.ts
│   ├── worshippersPageSettings.ts
│   ├── contactPageSettings.ts
│   ├── eventsPageSettings.ts
│   ├── announcementsPageSettings.ts
│   ├── servicesPageSettings.ts
│   ├── imamsPageSettings.ts
│   ├── resourcesPageSettings.ts
│   ├── mediaPageSettings.ts
│   ├── partnersPageSettings.ts
│   ├── privacyPageSettings.ts
│   └── termsPageSettings.ts
├── forms/                      — Form settings schemas [NEW folder]
│   ├── contactFormSettings.ts
│   ├── serviceInquiryFormSettings.ts
│   ├── eventInquiryFormSettings.ts
│   ├── newsletterSettings.ts
│   └── allowedFormDomains.ts
├── documents/                  — Content document schemas [NEW folder]
│   ├── event.ts
│   ├── announcement.ts
│   ├── service.ts
│   ├── teamMember.ts
│   ├── galleryImage.ts         (renamed from gallery.ts)
│   ├── resource.ts
│   ├── partner.ts
│   ├── donationCampaign.ts
│   ├── pageContent.ts
│   ├── faq.ts
│   └── etiquette.ts            (deprecated — hidden from desk)
├── singletons/                 — Global singleton schemas [NEW folder]
│   ├── siteSettings.ts
│   ├── homepageSettings.ts
│   ├── prayerSettings.ts
│   ├── donationSettings.ts
│   ├── donatePageSettings.ts
│   ├── offlineDonations.ts
│   └── mediaGallery.ts
└── shared/                     — Shared field definitions
    ├── internalPages.ts        (existing)
    └── seoFields.ts            [NEW — reusable SEO field group]
```

All import paths in `index.ts` update accordingly. No schema `name` values change — only file locations.

---

## 9. Data Flow Changes

### New fetch functions (`src/sanity/lib/fetch.ts`)

One per new singleton, returning `null` on error (never throwing):
- `getAboutPageSettings()`
- `getAccessibilityPageSettings()`
- `getArchitecturePageSettings()`
- `getVisitPageSettings()`
- `getWorshippersPageSettings()`
- `getContactPageSettings()`
- `getEventsPageSettings()`
- `getAnnouncementsPageSettings()`
- `getServicesPageSettings()`
- `getImamsPageSettings()`
- `getResourcesPageSettings()`
- `getMediaPageSettings()`
- `getPartnersPageSettings()`
- `getPrivacyPageSettings()`
- `getTermsPageSettings()`
- `getContactFormSettings()`
- `getServiceInquiryFormSettings()`
- `getEventInquiryFormSettings()`
- `getNewsletterSettings()`
- `getAllowedFormDomains()` (replaces `getAllowedEmbedDomains()`)

### New GROQ queries (`src/sanity/lib/queries.ts`)

One query per new singleton:
```groq
*[_id == "aboutPageSettings"][0]{ ... }
```

### New types (`src/types/sanity.ts`)

TypeScript interfaces for every new singleton and form settings type.

### Page component updates

Pages that need refactoring from single client component to server/client split:
- `/about` — currently `page.tsx` is `"use client"`, needs `page.tsx` (server) + `AboutContent.tsx` (client)
- `/architecture` — same refactor needed
- `/contact` — same refactor needed
- `/privacy` — same refactor needed
- `/terms` — same refactor needed
- `/accessibility` — check current structure, refactor if needed

Each page's server component (`page.tsx`) fetches the new page settings. The client component reads Sanity data first, falls back to current hardcoded content if null:
```tsx
const heading = settings?.heroHeading || "Visit Us";
```

### Preview paths update

Add entries to `previewPaths` in `sanity.config.ts` for all new singletons:
```ts
aboutPageSettings: () => "/about",
architecturePageSettings: () => "/architecture",
visitPageSettings: () => "/visit",
// ... etc for all new page singletons
contactFormSettings: () => "/contact",
serviceInquiryFormSettings: () => "/services",
// ... etc for all new form singletons
```

---

## 10. Revalidation Updates

The webhook at `/api/revalidate` must handle all new singleton types. Add to the type-to-path mapping:

| Singleton type | Route(s) to revalidate |
|---------------|----------------------|
| `aboutPageSettings` | `/about` |
| `accessibilityPageSettings` | `/accessibility` |
| `architecturePageSettings` | `/architecture` |
| `visitPageSettings` | `/visit` |
| `worshippersPageSettings` | `/worshippers` |
| `contactPageSettings` | `/contact` |
| `eventsPageSettings` | `/events` |
| `announcementsPageSettings` | `/announcements` |
| `servicesPageSettings` | `/services` |
| `imamsPageSettings` | `/imams` |
| `resourcesPageSettings` | `/resources` |
| `mediaPageSettings` | `/media` |
| `partnersPageSettings` | `/partners` |
| `privacyPageSettings` | `/privacy` |
| `termsPageSettings` | `/terms` |
| `contactFormSettings` | `/contact` |
| `serviceInquiryFormSettings` | `/services` |
| `eventInquiryFormSettings` | `/events` |
| `newsletterSettings` | `/*` (revalidate all — footer is on every page) |
| `allowedFormDomains` | `/events` |

---

## 11. Testing Requirements

### New tests needed

- **Schema validation tests** for each new singleton (follow existing pattern in `announcement.test.ts`, `service.test.ts`)
- **Fetch function tests** — each new fetch function returns `null` on error, not throw
- **Revalidation route test updates** — add new document types to existing `route.test.ts`
- **Page component tests** — each refactored page needs tests for: Sanity data rendering, fallback to hardcoded content, section visibility toggles

### Existing test updates

- Update mocks in `src/test/setup.tsx` with new fetch functions
- Update `src/app/pages.test.tsx` if it references old structures

---

## 12. CLAUDE.md Updates

The following sections of CLAUDE.md must be updated after implementation:

- **Singleton Schemas** — update list from 5 to include all new singletons
- **Key Directories** — add `src/sanity/schemas/pages/`, `src/sanity/schemas/forms/`, `src/sanity/schemas/documents/`, `src/sanity/schemas/singletons/`
- **Architecture section** — update Sanity desk structure description
- **Sanity CMS Rules** — mention form settings split and page singletons pattern
- **Cascading Changes Rule** — update the data flow trace to include page settings

---

## 13. Migration Strategy

### Phase 1: Schema + Desk + Plugins (no breaking changes)
1. Install plugins (`@sanity/orderable-document-list`, `sanity-plugin-media`)
2. Create shared `seoFields.ts`
3. Create all new page singleton schema files
4. Create all new form singleton schema files
5. Reorganise schema files into subdirectories
6. Update `index.ts` schema registry
7. Update `sanity.config.ts` desk structure + singleton protection + preview paths + scheduled publishing
8. Add `orderRankField` to orderable schemas
9. **Site continues working** — no page changes yet

### Phase 2: Data layer (no breaking changes)
1. Add new GROQ queries
2. Add new fetch functions
3. Add new TypeScript types
4. Update revalidation route with new types
5. **Site continues working** — new functions exist but aren't called yet

### Phase 3: Form settings migration (careful sequencing)
1. Run migration script: read `formSettings`, write to 5 new singletons
2. Update `FormSettingsContext` to read from new singletons
3. Update `src/lib/form-settings.ts` to read from new singletons
4. Update `src/middleware.ts` to query `allowedFormDomains`
5. Update event page to use new allowed domains fetch
6. Deprecate old `formSettings` singleton
7. **Site continues working** — forms function identically

### Phase 4: Wire pages to Sanity (gradual, per page)
1. Refactor hardcoded pages to server/client split where needed
2. Update each page to fetch from new page settings
3. Use fallback pattern (Sanity first, hardcoded default)
4. **Site continues working** — identical output until Sanity documents are published

### Phase 5: Populate + Cleanup
1. Admin creates each page singleton in Studio and fills in content
2. Update CLAUDE.md
3. Add/update tests
4. Deprecate standalone `etiquette` schema
5. Run `npm run validate`

---

## 14. What Does NOT Change

- All existing schema `name` / `_type` values (no data migration for existing types)
- All frontend routes and URLs
- All existing GROQ queries (they continue to work alongside new ones)
- The page layouts and designs (same components, same styling)
- The Sanity-first-with-fallback pattern
- ISR revalidation timing (120s)
- The four Sanity clients (client, noCdnClient, writeClient, previewClient)
- Stega configuration (off on production clients)
- The `galleryImage` documents — they stay as-is, used for homepage strip and media page. Each page's own images are separate fields on the page singleton.
