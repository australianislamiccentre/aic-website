# Sanity Studio Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure Sanity Studio into a page-centric sidebar, make all hardcoded page content editable from CMS, add orderable document lists, media library plugin, and split formSettings into 5 focused singletons.

**Architecture:** New page singleton schemas (one per page) live in `src/sanity/schemas/pages/`. Existing schemas move to `documents/` and `singletons/` subfolders. A shared `seoFields.ts` object is reused across all page schemas. Pages currently hardcoded (about, architecture, contact, privacy, terms) are refactored to server+client split and wired to Sanity with hardcoded fallbacks.

**Tech Stack:** Next.js 16 App Router, Sanity v3, `@sanity/orderable-document-list`, `sanity-plugin-media`, TypeScript, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-03-30-sanity-restructure-design.md`

---

## File Map

### New files
- `src/sanity/schemas/shared/seoFields.ts` — reusable SEO field group
- `src/sanity/schemas/pages/aboutPageSettings.ts`
- `src/sanity/schemas/pages/architecturePageSettings.ts`
- `src/sanity/schemas/pages/visitPageSettings.ts`
- `src/sanity/schemas/pages/worshippersPageSettings.ts`
- `src/sanity/schemas/pages/contactPageSettings.ts`
- `src/sanity/schemas/pages/eventsPageSettings.ts`
- `src/sanity/schemas/pages/announcementsPageSettings.ts`
- `src/sanity/schemas/pages/servicesPageSettings.ts`
- `src/sanity/schemas/pages/imamsPageSettings.ts`
- `src/sanity/schemas/pages/resourcesPageSettings.ts`
- `src/sanity/schemas/pages/mediaPageSettings.ts`
- `src/sanity/schemas/pages/partnersPageSettings.ts`
- `src/sanity/schemas/pages/privacyPageSettings.ts`
- `src/sanity/schemas/pages/termsPageSettings.ts`
- `src/sanity/schemas/forms/contactFormSettings.ts`
- `src/sanity/schemas/forms/serviceInquiryFormSettings.ts`
- `src/sanity/schemas/forms/eventInquiryFormSettings.ts`
- `src/sanity/schemas/forms/newsletterSettings.ts`
- `src/sanity/schemas/forms/allowedFormDomains.ts`
- `src/app/about/AboutContent.tsx` — new client component
- `src/app/architecture/ArchitectureContent.tsx` — new client component
- `src/app/contact/ContactContent.tsx` — renamed from page.tsx logic
- `src/app/partners/[slug]/page.tsx` — dynamic partner detail route
- `src/app/partners/[slug]/PartnerDetailContent.tsx`
- `scripts/migrate-form-settings.ts` — one-time migration script

### Moved files (schema `name` values unchanged — no data migration needed)
- `src/sanity/schemas/event.ts` → `src/sanity/schemas/documents/event.ts`
- `src/sanity/schemas/announcement.ts` → `src/sanity/schemas/documents/announcement.ts`
- `src/sanity/schemas/service.ts` → `src/sanity/schemas/documents/service.ts`
- `src/sanity/schemas/teamMember.ts` → `src/sanity/schemas/documents/teamMember.ts`
- `src/sanity/schemas/gallery.ts` → `src/sanity/schemas/documents/galleryImage.ts` (file rename only)
- `src/sanity/schemas/resource.ts` → `src/sanity/schemas/documents/resource.ts`
- `src/sanity/schemas/partner.ts` → `src/sanity/schemas/documents/partner.ts`
- `src/sanity/schemas/donationCampaign.ts` → `src/sanity/schemas/documents/donationCampaign.ts`
- `src/sanity/schemas/pageContent.ts` → `src/sanity/schemas/documents/pageContent.ts`
- `src/sanity/schemas/faq.ts` → `src/sanity/schemas/documents/faq.ts`
- `src/sanity/schemas/etiquette.ts` → `src/sanity/schemas/documents/etiquette.ts`
- `src/sanity/schemas/siteSettings.ts` → `src/sanity/schemas/singletons/siteSettings.ts`
- `src/sanity/schemas/homepageSettings.ts` → `src/sanity/schemas/singletons/homepageSettings.ts`
- `src/sanity/schemas/prayerSettings.ts` → `src/sanity/schemas/singletons/prayerSettings.ts`
- `src/sanity/schemas/donationSettings.ts` → `src/sanity/schemas/singletons/donationSettings.ts`
- `src/sanity/schemas/donatePageSettings.ts` → `src/sanity/schemas/singletons/donatePageSettings.ts`
- `src/sanity/schemas/offlineDonations.ts` → `src/sanity/schemas/singletons/offlineDonations.ts`
- `src/sanity/schemas/mediaGallery.ts` → `src/sanity/schemas/singletons/mediaGallery.ts`
- `src/sanity/schemas/formSettings.ts` → `src/sanity/schemas/singletons/formSettings.ts` (deprecated, hidden from desk)

### Modified files
- `src/sanity/schemas/index.ts` — updated imports for all moved/new schemas
- `sanity.config.ts` — new desk structure + plugins
- `src/sanity/lib/queries.ts` — new singleton queries + updated order queries
- `src/sanity/lib/fetch.ts` — 20 new fetch functions
- `src/types/sanity.ts` — new interfaces for all new singletons
- `src/app/api/revalidate/route.ts` — add new document types
- `src/app/api/preview-url/route.ts` — add new document types
- `src/app/about/page.tsx` — refactor to server component
- `src/app/architecture/page.tsx` — refactor to server component
- `src/app/contact/page.tsx` — refactor to server component
- `src/app/privacy/page.tsx` — wire to Sanity
- `src/app/privacy/PrivacyContent.tsx` — accept Sanity props
- `src/app/terms/page.tsx` — wire to Sanity
- `src/app/terms/TermsContent.tsx` — accept Sanity props
- `src/app/visit/page.tsx` — wire visitPageSettings
- `src/app/visit/VisitContent.tsx` — accept page settings props
- `src/app/worshippers/page.tsx` — wire worshippersPageSettings
- `src/app/events/page.tsx` — wire eventsPageSettings
- `src/app/announcements/page.tsx` — wire announcementsPageSettings
- `src/app/services/page.tsx` — wire servicesPageSettings
- `src/app/imams/page.tsx` — wire imamsPageSettings
- `src/app/resources/page.tsx` — wire resourcesPageSettings
- `src/app/media/page.tsx` — wire mediaPageSettings
- `src/app/partners/page.tsx` — wire partnersPageSettings
- `src/app/donate/page.tsx` — wire to donatePageSettings (already done, just verify)
- `src/contexts/FormSettingsContext.tsx` — merge from 5 singletons
- `src/lib/form-settings.ts` — read from new singletons
- `src/middleware.ts` — use allowedFormDomains instead of siteSettings
- `next.config.ts` — redirect /partners/aicc to /partners/aicc (slug-based)

### Deleted files
- `src/app/partners/aicc/page.tsx` — replaced by dynamic route

---

## Task 1: Install plugins

**Files:**
- Modify: `package.json`
- Modify: `sanity.config.ts` (partial — plugins array only)

- [ ] **Step 1: Install orderable document list and media plugins**

```bash
npm install @sanity/orderable-document-list sanity-plugin-media
```

Expected: both packages appear in `package.json` dependencies.

- [ ] **Step 2: Verify install**

```bash
npm run type-check
```

Expected: passes (no new type errors from packages).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install orderable-document-list and sanity-plugin-media"
```

---

## Task 2: Create shared SEO fields object

**Files:**
- Create: `src/sanity/schemas/shared/seoFields.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/sanity/schemas/shared/seoFields.ts
import { defineField } from "sanity";

/**
 * Reusable SEO field group for page singleton schemas.
 * Spread into any page schema's fields array.
 */
export const seoFields = [
  defineField({
    name: "seo",
    title: "SEO",
    type: "object",
    description: "Search engine optimisation settings for this page.",
    fields: [
      defineField({
        name: "title",
        title: "Meta Title",
        type: "string",
        description:
          "Browser tab title and Google result title. Leave blank to use the page heading.",
        validation: (Rule) => Rule.max(70).warning("Keep under 70 characters for best results."),
      }),
      defineField({
        name: "description",
        title: "Meta Description",
        type: "text",
        rows: 3,
        description:
          "Shown in Google search results. Recommended: 120–160 characters.",
        validation: (Rule) =>
          Rule.max(160)
            .warning("Over 160 characters may be truncated in search results.")
            .custom((val) => {
              if (!val) return "Recommended for search engine visibility — add a description.";
              return true;
            }),
      }),
      defineField({
        name: "image",
        title: "Social Share Image",
        type: "image",
        description: "Shown when this page is shared on Facebook, WhatsApp, etc. Recommended: 1200×630px.",
        options: { hotspot: true },
      }),
    ],
  }),
];
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/sanity/schemas/shared/seoFields.ts
git commit -m "feat(sanity): add shared seoFields object for page schemas"
```

---

## Task 3: Move existing schema files into subfolders

This is a file-move only. Schema `name` values do not change so no Sanity data migration is needed. All imports in `index.ts` update in the next task.

- [ ] **Step 1: Create subdirectories**

```bash
mkdir -p src/sanity/schemas/documents
mkdir -p src/sanity/schemas/singletons
```

- [ ] **Step 2: Move document schemas**

```bash
mv src/sanity/schemas/event.ts src/sanity/schemas/documents/event.ts
mv src/sanity/schemas/announcement.ts src/sanity/schemas/documents/announcement.ts
mv src/sanity/schemas/service.ts src/sanity/schemas/documents/service.ts
mv src/sanity/schemas/teamMember.ts src/sanity/schemas/documents/teamMember.ts
mv src/sanity/schemas/gallery.ts src/sanity/schemas/documents/galleryImage.ts
mv src/sanity/schemas/resource.ts src/sanity/schemas/documents/resource.ts
mv src/sanity/schemas/partner.ts src/sanity/schemas/documents/partner.ts
mv src/sanity/schemas/donationCampaign.ts src/sanity/schemas/documents/donationCampaign.ts
mv src/sanity/schemas/pageContent.ts src/sanity/schemas/documents/pageContent.ts
mv src/sanity/schemas/faq.ts src/sanity/schemas/documents/faq.ts
mv src/sanity/schemas/etiquette.ts src/sanity/schemas/documents/etiquette.ts
```

- [ ] **Step 3: Move singleton schemas**

```bash
mv src/sanity/schemas/siteSettings.ts src/sanity/schemas/singletons/siteSettings.ts
mv src/sanity/schemas/homepageSettings.ts src/sanity/schemas/singletons/homepageSettings.ts
mv src/sanity/schemas/prayerSettings.ts src/sanity/schemas/singletons/prayerSettings.ts
mv src/sanity/schemas/donationSettings.ts src/sanity/schemas/singletons/donationSettings.ts
mv src/sanity/schemas/donatePageSettings.ts src/sanity/schemas/singletons/donatePageSettings.ts
mv src/sanity/schemas/offlineDonations.ts src/sanity/schemas/singletons/offlineDonations.ts
mv src/sanity/schemas/mediaGallery.ts src/sanity/schemas/singletons/mediaGallery.ts
mv src/sanity/schemas/formSettings.ts src/sanity/schemas/singletons/formSettings.ts
```

- [ ] **Step 4: Create subdirectory for new schemas**

```bash
mkdir -p src/sanity/schemas/pages
mkdir -p src/sanity/schemas/forms
```

- [ ] **Step 5: Update schema index.ts with new import paths**

Replace the entire contents of `src/sanity/schemas/index.ts`:

```typescript
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
```

- [ ] **Step 6: Check existing tests that import from old schema paths and update if any**

```bash
grep -r "from.*sanity/schemas/event\|from.*sanity/schemas/announcement\|from.*sanity/schemas/gallery\|from.*sanity/schemas/formSettings" src --include="*.ts" --include="*.tsx" -l
```

Update any found imports to new paths.

- [ ] **Step 7: Run type-check**

```bash
npm run type-check
```

Expected: passes (index.ts will have errors until page/form schemas are created in Task 4+5, so create placeholder empty exports first if needed — or do Tasks 4 and 5 before running this check).

---

## Task 4: Create page singleton schemas

Create all 14 page singleton schemas. Each follows the same pattern: `defineType` with `name`, `title`, `type: "document"`, ordered fields matching page layout top-to-bottom, each field with a `description` telling admin where it appears.

### 4a: `aboutPageSettings`

- [ ] **Step 1: Create `src/sanity/schemas/pages/aboutPageSettings.ts`**

```typescript
import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "aboutPageSettings",
  title: "About Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({
      name: "heroBadge",
      title: "Hero Badge Text",
      type: "string",
      description: "Small badge above the main heading (e.g. 'Welcome to AIC')",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
      description: "Main page heading (e.g. 'About the Australian Islamic Centre')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroHeadingAccent",
      title: "Hero Heading Accent",
      type: "string",
      description: "Word(s) within the heading shown in teal colour (e.g. 'Australian Islamic Centre')",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 3,
      description: "Paragraph below the heading",
    }),
    defineField({
      name: "heroStats",
      title: "Hero Stats",
      type: "array",
      description: "Stat cards shown beside the heading (e.g. '40+ Years Serving'). Max 3.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string", description: "e.g. '40+'" }),
            defineField({ name: "label", title: "Label", type: "string", description: "e.g. 'Years Serving'" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      description: "Large image shown in the hero section. Recommended: 1200×600px minimum.",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroImageCaption",
      title: "Hero Image Floating Badge",
      type: "string",
      description: "Text on the floating badge over the hero image (e.g. 'Newport, Melbourne')",
    }),

    // ── Mission & Vision Section ──
    defineField({
      name: "missionVisible",
      title: "Show Mission & Vision Section",
      type: "boolean",
      initialValue: true,
      description: "Toggle to show/hide the Mission & Vision section on the page",
    }),
    defineField({
      name: "missionImage",
      title: "Mission Image",
      type: "image",
      description: "Image shown on the left side of the Mission & Vision section. Recommended: 600×500px.",
      options: { hotspot: true },
    }),
    defineField({
      name: "missionBadge",
      title: "Mission Section Badge",
      type: "string",
      description: "Small badge above the mission heading (e.g. 'Our Mission & Vision')",
    }),
    defineField({
      name: "missionHeading",
      title: "Mission Heading",
      type: "string",
      description: "Section heading for Mission & Vision",
    }),
    defineField({
      name: "missionContent",
      title: "Mission Content",
      type: "array",
      description: "Body text for the Mission & Vision section",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "missionButtonLabel",
      title: "Mission Button Label",
      type: "string",
      description: "Button text (e.g. 'Visit Our Centre')",
    }),
    defineField({
      name: "missionButtonUrl",
      title: "Mission Button Link",
      type: "string",
      description: "Where the mission button links to (e.g. '/visit')",
    }),

    // ── Timeline Section ──
    defineField({
      name: "timelineVisible",
      title: "Show Timeline Section",
      type: "boolean",
      initialValue: true,
      description: "Toggle to show/hide the 'A Legacy of Service' timeline section",
    }),
    defineField({
      name: "timelineHeading",
      title: "Timeline Heading",
      type: "string",
      description: "Section heading (e.g. 'A Legacy of Service')",
    }),
    defineField({
      name: "timelineItems",
      title: "Timeline Items",
      type: "array",
      description: "Timeline entries in chronological order",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "year", title: "Year / Era", type: "string", description: "e.g. '1970s' or '2016'" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              description: "Lucide icon name (e.g. 'Users', 'Heart', 'Building', 'Globe')",
              options: {
                list: [
                  { title: "Users", value: "Users" },
                  { title: "Heart", value: "Heart" },
                  { title: "Lightbulb", value: "Lightbulb" },
                  { title: "BookOpen", value: "BookOpen" },
                  { title: "Building", value: "Building" },
                  { title: "Globe", value: "Globe" },
                  { title: "Star", value: "Star" },
                  { title: "Award", value: "Award" },
                ],
              },
            }),
          ],
          preview: { select: { title: "year", subtitle: "title" } },
        },
      ],
    }),

    // ── Architecture Preview Section ──
    defineField({
      name: "architecturePreviewVisible",
      title: "Show Architecture Preview Section",
      type: "boolean",
      initialValue: true,
      description: "Toggle to show/hide the architecture preview section",
    }),
    defineField({
      name: "architectureHeading",
      title: "Architecture Section Heading",
      type: "string",
      description: "Heading for the architecture preview (e.g. 'An Architectural Masterpiece')",
    }),
    defineField({
      name: "architectureDescription",
      title: "Architecture Description",
      type: "text",
      rows: 3,
      description: "Description paragraph in the architecture preview section",
    }),
    defineField({
      name: "architectureImages",
      title: "Architecture Images",
      type: "array",
      description: "Images shown in the architecture preview. Max 3.",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "architectureFeatures",
      title: "Architecture Feature Cards",
      type: "array",
      description: "Feature cards (e.g. '96 Lanterns'). Max 3.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "string" }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Sun", value: "Sun" },
                  { title: "Compass", value: "Compass" },
                  { title: "Droplets", value: "Droplets" },
                  { title: "Wind", value: "Wind" },
                  { title: "Star", value: "Star" },
                ],
              },
            }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "architectureButtonLabel",
      title: "Architecture Button Label",
      type: "string",
      description: "Button text (e.g. 'Explore Full Architecture Story')",
    }),
    defineField({
      name: "architectureButtonUrl",
      title: "Architecture Button Link",
      type: "string",
      description: "Where the button links to (e.g. '/architecture')",
    }),

    // ── Values Section ──
    defineField({
      name: "valuesVisible",
      title: "Show Values Section",
      type: "boolean",
      initialValue: true,
      description: "Toggle to show/hide the 'What We Stand For' values section",
    }),
    defineField({
      name: "valuesHeading",
      title: "Values Section Heading",
      type: "string",
      description: "Section heading (e.g. 'What We Stand For')",
    }),
    defineField({
      name: "valuesDescription",
      title: "Values Description",
      type: "text",
      rows: 2,
      description: "Text below the values heading",
    }),
    defineField({
      name: "valuesCards",
      title: "Value Cards",
      type: "array",
      description: "Value cards (e.g. Compassion, Knowledge). Max 4.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Heart", value: "Heart" },
                  { title: "BookOpen", value: "BookOpen" },
                  { title: "Users", value: "Users" },
                  { title: "Award", value: "Award" },
                  { title: "Star", value: "Star" },
                  { title: "Globe", value: "Globe" },
                ],
              },
            }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "valuesButtons",
      title: "Values Section Buttons",
      type: "array",
      description: "CTA buttons at the bottom of the values section. Max 2.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "url", title: "URL", type: "string" }),
            defineField({
              name: "variant",
              title: "Variant",
              type: "string",
              options: { list: ["primary", "outline", "ghost"], layout: "radio" },
            }),
          ],
          preview: { select: { title: "label" } },
        },
      ],
      validation: (Rule) => Rule.max(2),
    }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: {
    prepare: () => ({ title: "About Page" }),
  },
});
```

### 4b: `architecturePageSettings`

- [ ] **Step 1: Create `src/sanity/schemas/pages/architecturePageSettings.ts`**

```typescript
import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "architecturePageSettings",
  title: "Architecture Page",
  type: "document",
  fields: [
    // ── Hero Section ──
    defineField({ name: "heroBadge", title: "Hero Badge Text", type: "string", description: "Badge above heading (e.g. 'Award-Winning Design')" }),
    defineField({ name: "heroHeading", title: "Hero Heading", type: "string", description: "Main page heading", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Hero Heading Accent", type: "string", description: "Word(s) shown in teal colour" }),
    defineField({ name: "heroContent", title: "Hero Content", type: "array", of: [{ type: "block" }], description: "Description paragraphs in the hero section" }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true }, description: "Hero section image. Recommended: 1200×600px." }),
    defineField({ name: "heroImageBadge", title: "Hero Image Badge", type: "string", description: "Text on floating badge over hero image (e.g. 'World Architecture Festival Winner 2017')" }),

    // ── Design Philosophy Section ──
    defineField({ name: "philosophyVisible", title: "Show Design Philosophy Section", type: "boolean", initialValue: true, description: "Toggle to show/hide the Design Philosophy section" }),
    defineField({ name: "philosophyBadge", title: "Philosophy Badge", type: "string", description: "Badge text above the philosophy section (e.g. 'Design Philosophy')" }),
    defineField({ name: "philosophyContent", title: "Philosophy Content", type: "array", of: [{ type: "block" }], description: "Body text for the Design Philosophy section" }),
    defineField({ name: "philosophyImages", title: "Philosophy Images", type: "array", of: [{ type: "image", options: { hotspot: true } }], description: "Architecture detail images. Max 2.", validation: (Rule) => Rule.max(2) }),

    // ── Architectural Features Section ──
    defineField({ name: "featuresVisible", title: "Show Architectural Features Section", type: "boolean", initialValue: true }),
    defineField({ name: "featuresHeading", title: "Features Heading", type: "string", description: "Section heading (e.g. 'Architectural Features')" }),
    defineField({
      name: "featuresCards",
      title: "Feature Cards",
      type: "array",
      description: "Feature cards (e.g. 'Natural Light Design'). Max 6.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Sun", "Compass", "Wind", "Droplet", "Sparkles", "Building"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "title" } },
      }],
      validation: (Rule) => Rule.max(6),
    }),

    // ── Gallery Section ──
    defineField({ name: "galleryVisible", title: "Show Gallery Section", type: "boolean", initialValue: true }),
    defineField({ name: "galleryHeading", title: "Gallery Heading", type: "string" }),
    defineField({ name: "galleryDescription", title: "Gallery Description", type: "text", rows: 2 }),
    defineField({
      name: "galleryImages",
      title: "Gallery Images",
      type: "array",
      description: "Images shown in the architecture gallery grid",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
          defineField({ name: "alt", title: "Alt Text", type: "string", description: "Describe the image for screen readers" }),
          defineField({ name: "caption", title: "Caption", type: "string" }),
        ],
        preview: { select: { title: "alt", media: "image" } },
      }],
    }),

    // ── Awards Section ──
    defineField({ name: "awardsVisible", title: "Show Awards Section", type: "boolean", initialValue: true }),
    defineField({ name: "awardsBadge", title: "Awards Badge", type: "string", description: "Badge text (e.g. 'Recognition')" }),
    defineField({ name: "awardsHeading", title: "Awards Heading", type: "string" }),
    defineField({
      name: "awardsCards",
      title: "Award Cards",
      type: "array",
      description: "Individual award entries. Max 4.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "year", title: "Year", type: "string" }),
          defineField({ name: "title", title: "Award Title", type: "string" }),
          defineField({ name: "organization", title: "Organisation", type: "string" }),
          defineField({ name: "category", title: "Category", type: "string" }),
        ],
        preview: { select: { title: "title", subtitle: "year" } },
      }],
      validation: (Rule) => Rule.max(4),
    }),

    // ── Architect Quote Section ──
    defineField({ name: "quoteVisible", title: "Show Architect Quote Section", type: "boolean", initialValue: true }),
    defineField({ name: "quoteText", title: "Quote Text", type: "text", rows: 4, description: "The blockquote from Glenn Murcutt" }),
    defineField({ name: "quoteAttribution", title: "Quote Attribution", type: "string", description: "Author name and title (e.g. 'Glenn Murcutt AO, Pritzker Prize Laureate')" }),

    // ── Visit CTA Section ──
    defineField({ name: "ctaVisible", title: "Show Visit CTA Section", type: "boolean", initialValue: true }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({ name: "ctaButtonLabel", title: "CTA Button Label", type: "string" }),
    defineField({ name: "ctaButtonUrl", title: "CTA Button Link", type: "string" }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Architecture Page" }) },
});
```

### 4c: `visitPageSettings`

- [ ] **Step 1: Create `src/sanity/schemas/pages/visitPageSettings.ts`**

```typescript
import { defineField, defineType } from "sanity";
import { seoFields } from "../shared/seoFields";

export default defineType({
  name: "visitPageSettings",
  title: "Visit Page",
  type: "document",
  fields: [
    // ── Page Header ──
    defineField({ name: "heroHeading", title: "Page Heading", type: "string", description: "Main page heading (e.g. 'Visit Us')", validation: (Rule) => Rule.required() }),
    defineField({ name: "heroHeadingAccent", title: "Heading Accent", type: "string", description: "Word(s) shown in teal colour" }),
    defineField({ name: "heroDescription", title: "Page Description", type: "text", rows: 3 }),

    // ── Visiting Information Section ──
    defineField({ name: "visitingInfoVisible", title: "Show Visiting Information Section", type: "boolean", initialValue: true }),
    defineField({ name: "visitingInfoImage", title: "Visiting Info Image", type: "image", options: { hotspot: true }, description: "Left column image in the visiting information section. Recommended: 600×500px." }),
    defineField({ name: "visitingInfoHeading", title: "Visiting Info Heading", type: "string", description: "Section heading (e.g. 'Visiting Information')" }),
    defineField({ name: "visitingHours", title: "Operating Hours", type: "string", description: "Hours shown in the visiting information section (e.g. '4:30 AM – 10:30 PM Daily')" }),
    {
      name: "_visitingInfoNote",
      title: "Note",
      type: "string",
      readOnly: true,
      initialValue: "Address, phone, and email are pulled from Site Settings.",
    } as ReturnType<typeof defineField>,

    // ── Facilities Section ──
    defineField({ name: "facilitiesVisible", title: "Show Facilities Section", type: "boolean", initialValue: true }),
    defineField({ name: "facilitiesHeading", title: "Facilities Heading", type: "string" }),
    defineField({ name: "facilitiesDescription", title: "Facilities Description", type: "text", rows: 2 }),
    defineField({
      name: "facilitiesCards",
      title: "Facility Cards",
      type: "array",
      description: "Facility cards (e.g. 'Main Prayer Hall – Capacity: 1,000+'). Max 8.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "name", title: "Facility Name", type: "string" }),
          defineField({ name: "capacity", title: "Capacity", type: "string", description: "e.g. '1,000+'" }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Users", "GraduationCap", "Building", "BookOpen", "Heart"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "name", subtitle: "capacity" } },
      }],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({ name: "facilitiesImage", title: "Facilities Section Image", type: "image", options: { hotspot: true } }),

    // ── Mosque Manners Section ──
    defineField({ name: "mannersVisible", title: "Show Mosque Manners Section", type: "boolean", initialValue: true }),
    defineField({ name: "mannersBadge", title: "Manners Section Badge", type: "string", description: "Badge text (e.g. 'Visitor Guidelines')" }),
    defineField({ name: "mannersHeading", title: "Manners Heading", type: "string" }),
    defineField({ name: "mannersDescription", title: "Manners Description", type: "text", rows: 2 }),
    defineField({
      name: "etiquetteItems",
      title: "Etiquette Items",
      type: "array",
      description: "Visitor etiquette guidelines shown on this page",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          defineField({ name: "icon", title: "Icon", type: "string", options: { list: ["Footprints", "VolumeX", "Shirt", "Heart", "Hand", "Droplets", "CameraOff", "Clock"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "title" } },
      }],
    }),

    // ── FAQ Section ──
    defineField({ name: "faqVisible", title: "Show FAQ Section", type: "boolean", initialValue: true }),
    defineField({ name: "faqBadge", title: "FAQ Badge", type: "string" }),
    defineField({ name: "faqHeading", title: "FAQ Heading", type: "string" }),
    defineField({
      name: "faqItems",
      title: "FAQ Items",
      type: "array",
      description: "Frequently asked questions for visitors",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "question", title: "Question", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "answer", title: "Answer", type: "array", of: [{ type: "block" }] }),
        ],
        preview: { select: { title: "question" } },
      }],
    }),

    // ── CTA Section ──
    defineField({ name: "ctaVisible", title: "Show CTA Section", type: "boolean", initialValue: true }),
    defineField({ name: "ctaHeading", title: "CTA Heading", type: "string" }),
    defineField({ name: "ctaDescription", title: "CTA Description", type: "text", rows: 2 }),
    defineField({
      name: "ctaButtons",
      title: "CTA Buttons",
      type: "array",
      description: "Buttons shown in the CTA section. Max 2.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label", type: "string" }),
          defineField({ name: "url", title: "URL", type: "string" }),
          defineField({ name: "variant", title: "Variant", type: "string", options: { list: ["primary", "outline"].map(v => ({ title: v, value: v })) } }),
        ],
        preview: { select: { title: "label" } },
      }],
      validation: (Rule) => Rule.max(2),
    }),

    // ── SEO ──
    ...seoFields,
  ],
  preview: { prepare: () => ({ title: "Visit Page" }) },
});
```

### 4d–4n: Remaining page schemas

Create one file each following the same pattern. Fields for each are listed below.

- [ ] **Step 1: Create `src/sanity/schemas/pages/worshippersPageSettings.ts`**

Fields (in order):
- `heroBadge` (string) — Badge text above heading
- `heroHeading` (string, required) — Page heading
- `heroHeadingAccent` (string) — Teal-coloured word(s)
- `heroDescription` (text) — Paragraph below heading
- Read-only note: "Prayer times and Jumu'ah times are managed in Prayer Times (sidebar)."
- `etiquetteVisible` (boolean, default true) — Show/hide Mosque Etiquette section
- `etiquetteHeading` (string) — Section heading
- `etiquetteDescription` (text) — Section intro text
- `etiquetteItems` (array of {title, description, icon}) — Etiquette cards on this page (same inline array as visitPageSettings)
- `khutbahVisible` (boolean, default true) — Show/hide Khutbah Videos section
- `khutbahHeading` (string) — Section heading. Read-only note: "Videos are pulled from the AIC YouTube channel."
- `ctaVisible` (boolean, default true) — Show/hide CTA section
- `ctaHeading` (string), `ctaDescription` (text), `ctaButtonLabel` (string), `ctaButtonUrl` (string)
- `...seoFields`
- `preview: { prepare: () => ({ title: "Worshippers Page" }) }`

- [ ] **Step 2: Create `src/sanity/schemas/pages/contactPageSettings.ts`**

Fields:
- `heroHeading` (string, required) — Page heading
- `heroHeadingAccent` (string) — Teal word(s)
- `heroDescription` (text) — Paragraph below heading
- Read-only note: "To edit contact form settings (recipient email, inquiry types, success message) go to Forms > Contact Form."
- `sidebarVisible` (boolean, default true) — Show/hide sidebar
- `operatingHours` (string) — Hours shown in sidebar (e.g. "4:30 AM – 10:30 PM Daily")
- Read-only note: "Phone, email, address, and social links are pulled from Site Settings."
- `...seoFields`
- `preview: { prepare: () => ({ title: "Contact Page" }) }`

- [ ] **Step 3: Create `src/sanity/schemas/pages/eventsPageSettings.ts`**

Fields:
- `heroBadge` (string), `heroHeading` (string, required), `heroHeadingAccent` (string), `heroDescription` (text)
- Read-only note: "Events are managed in the Live on Website / Expired / Inactive lists below. To edit the event inquiry form, go to Forms > Event Inquiry Form."
- `...seoFields`
- `preview: { prepare: () => ({ title: "Events Page" }) }`

- [ ] **Step 4: Create `src/sanity/schemas/pages/announcementsPageSettings.ts`**

Same pattern as eventsPageSettings with note "Announcements are managed in Active / Inactive below."
`preview: { prepare: () => ({ title: "Announcements Page" }) }`

- [ ] **Step 5: Create `src/sanity/schemas/pages/servicesPageSettings.ts`**

Fields:
- `heroBadge` (string), `heroHeading` (string, required), `heroHeadingAccent` (string), `heroDescription` (text)
- `heroCategoryTags` (array of string, max 5) — Category pills shown below hero description (e.g. "Religious Services")
- `heroImage` (image, hotspot) — Hero image (desktop only). Recommended: 1200×600px.
- Read-only note: "Services are managed in Active / Inactive below. To edit the service inquiry form, go to Forms > Service Inquiry Form."
- `ctaVisible` (boolean, default true), `ctaHeading` (string), `ctaDescription` (text), `ctaButtonLabel` (string), `ctaButtonUrl` (string)
- `...seoFields`
- `preview: { prepare: () => ({ title: "Services Page" }) }`

- [ ] **Step 6: Create `src/sanity/schemas/pages/imamsPageSettings.ts`**

Fields:
- `heroHeading` (string, required), `heroHeadingAccent` (string), `heroDescription` (text)
- `imamsSectionHeading` (string) — "Meet Our Religious Leaders" section heading
- `imamsSectionDescription` (text) — Section intro text
- Read-only note: "Team members are managed in the Team Members list below."
- `servicesOfferedVisible` (boolean, default true), `servicesOfferedHeading` (string)
- `servicesOfferedCards` (array of {title, description, icon}, max 6) — e.g. "Religious Counselling"
- `ctaVisible` (boolean, default true), `ctaHeading` (string), `ctaDescription` (text)
- `ctaButtons` (array of {label, url, variant}, max 2)
- `...seoFields`
- `preview: { prepare: () => ({ title: "Imams Page" }) }`

- [ ] **Step 7: Create `src/sanity/schemas/pages/resourcesPageSettings.ts`**

Fields:
- `heroBadge` (string), `heroHeading` (string, required), `heroHeadingAccent` (string), `heroDescription` (text)
- Read-only note: "Resources are managed in the All Resources list below."
- `...seoFields`
- `preview: { prepare: () => ({ title: "Resources Page" }) }`

- [ ] **Step 8: Create `src/sanity/schemas/pages/mediaPageSettings.ts`**

Fields:
- `heroBadge` (string), `heroHeading` (string, required), `heroHeadingAccent` (string), `heroDescription` (text)
- `youtubeVisible` (boolean, default true) — Show/hide YouTube section. Note: "Videos are pulled from the AIC YouTube channel."
- `galleryVisible` (boolean, default true) — Show/hide gallery section. Note: "Gallery images are managed in Gallery Images list below."
- `socialVisible` (boolean, default true) — Show/hide social links section. Note: "Social links are pulled from Site Settings."
- `...seoFields`
- `preview: { prepare: () => ({ title: "Media Page" }) }`

- [ ] **Step 9: Create `src/sanity/schemas/pages/partnersPageSettings.ts`**

Fields:
- `heroBadge` (string), `heroHeading` (string, required), `heroHeadingAccent` (string), `heroDescription` (text)
- Read-only note: "Partners are managed in the All Partners list below."
- `ctaVisible` (boolean, default true), `ctaHeading` (string), `ctaHeadingAccent` (string), `ctaDescription` (text), `ctaButtonLabel` (string), `ctaButtonUrl` (string)
- `...seoFields`
- `preview: { prepare: () => ({ title: "Partners Page" }) }`

- [ ] **Step 10: Create `src/sanity/schemas/pages/privacyPageSettings.ts`**

Fields:
- `heading` (string, required) — Page heading (e.g. "Privacy Policy")
- `lastUpdated` (date) — "Last updated" date shown below heading. Note: "Melbourne time (AEST/AEDT)."
- `content` (portable text with h2, h3, blockquote, lists, links, bold, italic) — Full policy content rendered on the page
- `...seoFields`
- `preview: { prepare: () => ({ title: "Privacy Policy Page" }) }`

The portable text `content` field uses:
```typescript
defineField({
  name: "content",
  title: "Page Content",
  type: "array",
  description: "Full privacy policy content. Use Heading 2 for section headings.",
  of: [
    {
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              { name: "href", type: "url", title: "URL" },
            ],
          },
        ],
      },
    },
  ],
})
```

- [ ] **Step 11: Create `src/sanity/schemas/pages/termsPageSettings.ts`**

Same structure as privacyPageSettings:
- `heading` (string, required), `lastUpdated` (date with Melbourne note), `content` (portable text same as above)
- `...seoFields`
- `preview: { prepare: () => ({ title: "Terms of Use Page" }) }`

- [ ] **Step 12: Run type-check**

```bash
npm run type-check
```

Expected: passes.

- [ ] **Step 13: Commit**

```bash
git add src/sanity/schemas/pages/
git commit -m "feat(sanity): add page singleton schemas for all 14 pages"
```

---

## Task 5: Create form singleton schemas

### 5a: `contactFormSettings`

- [ ] **Step 1: Create `src/sanity/schemas/forms/contactFormSettings.ts`**

```typescript
import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactFormSettings",
  title: "Contact Form",
  type: "document",
  fields: [
    defineField({ name: "contactEnabled", title: "Form Enabled", type: "boolean", initialValue: true, description: "Toggle to enable or disable the contact form" }),
    defineField({ name: "contactRecipientEmail", title: "Recipient Email", type: "email", description: "Email address that receives contact form submissions", validation: (Rule) => Rule.email() }),
    defineField({ name: "contactHeading", title: "Page Heading", type: "string", description: "Main heading on the /contact page (e.g. 'Get in')" }),
    defineField({ name: "contactHeadingAccent", title: "Heading Accent Word", type: "string", description: "Word shown in teal colour in the heading" }),
    defineField({ name: "contactDescription", title: "Page Description", type: "text", rows: 3, description: "Paragraph shown below the heading on the contact page" }),
    defineField({ name: "contactFormHeading", title: "Form Section Heading", type: "string", description: "Heading above the form fields (e.g. 'Send Us a Message')" }),
    defineField({ name: "contactFormDescription", title: "Form Section Description", type: "text", rows: 2, description: "Text shown above the form fields" }),
    defineField({
      name: "contactInquiryTypes",
      title: "Enquiry Type Options",
      type: "array",
      description: "Options in the 'Enquiry Type' dropdown on the contact form",
      of: [{ type: "string" }],
    }),
    defineField({ name: "contactSuccessHeading", title: "Success Heading", type: "string", description: "Shown after the form is successfully submitted" }),
    defineField({ name: "contactSuccessMessage", title: "Success Message", type: "text", rows: 2, description: "Body text shown after successful submission" }),
  ],
  preview: { prepare: () => ({ title: "Contact Form" }) },
});
```

### 5b: `serviceInquiryFormSettings`

- [ ] **Step 1: Create `src/sanity/schemas/forms/serviceInquiryFormSettings.ts`**

```typescript
import { defineField, defineType } from "sanity";

export default defineType({
  name: "serviceInquiryFormSettings",
  title: "Service Inquiry Form",
  type: "document",
  fields: [
    defineField({ name: "serviceInquiryEnabled", title: "Form Enabled", type: "boolean", initialValue: true }),
    defineField({ name: "serviceInquiryRecipientEmail", title: "Recipient Email", type: "email", description: "Receives service inquiry submissions", validation: (Rule) => Rule.email() }),
    defineField({ name: "serviceInquiryFormHeading", title: "Form Heading", type: "string", description: "Heading shown above the service inquiry form" }),
    defineField({ name: "serviceInquiryFormDescription", title: "Form Description", type: "text", rows: 2 }),
    defineField({ name: "serviceInquirySuccessHeading", title: "Success Heading", type: "string" }),
    defineField({ name: "serviceInquirySuccessMessage", title: "Success Message", type: "text", rows: 2 }),
  ],
  preview: { prepare: () => ({ title: "Service Inquiry Form" }) },
});
```

### 5c: `eventInquiryFormSettings`

- [ ] **Step 1: Create `src/sanity/schemas/forms/eventInquiryFormSettings.ts`**

```typescript
import { defineField, defineType } from "sanity";

export default defineType({
  name: "eventInquiryFormSettings",
  title: "Event Inquiry Form",
  type: "document",
  fields: [
    defineField({ name: "eventInquiryEnabled", title: "Form Enabled", type: "boolean", initialValue: true }),
    defineField({ name: "eventInquiryRecipientEmail", title: "Recipient Email", type: "email", description: "Receives event inquiry submissions. Falls back to Contact Form recipient if empty.", validation: (Rule) => Rule.email() }),
  ],
  preview: { prepare: () => ({ title: "Event Inquiry Form" }) },
});
```

### 5d: `newsletterSettings`

- [ ] **Step 1: Create `src/sanity/schemas/forms/newsletterSettings.ts`**

```typescript
import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsletterSettings",
  title: "Newsletter",
  type: "document",
  fields: [
    defineField({ name: "newsletterEnabled", title: "Newsletter Enabled", type: "boolean", initialValue: true }),
    defineField({ name: "newsletterRecipientEmail", title: "Recipient Email", type: "email", description: "Receives newsletter subscription notifications", validation: (Rule) => Rule.email() }),
    defineField({ name: "newsletterHeading", title: "Footer Heading", type: "string", description: "Heading shown in the footer newsletter section" }),
    defineField({ name: "newsletterDescription", title: "Footer Description", type: "text", rows: 2, description: "Description shown in the footer newsletter section" }),
    defineField({ name: "newsletterButtonText", title: "Subscribe Button Text", type: "string", description: "Label on the subscribe button (e.g. 'Subscribe')" }),
    defineField({ name: "newsletterSuccessMessage", title: "Success Message", type: "string", description: "Shown after a visitor subscribes" }),
  ],
  preview: { prepare: () => ({ title: "Newsletter" }) },
});
```

### 5e: `allowedFormDomains`

- [ ] **Step 1: Create `src/sanity/schemas/forms/allowedFormDomains.ts`**

```typescript
import { defineField, defineType } from "sanity";

export default defineType({
  name: "allowedFormDomains",
  title: "Allowed Form Domains",
  type: "document",
  fields: [
    defineField({
      name: "allowedDomains",
      title: "Trusted Domains",
      type: "array",
      description:
        "Domains allowed to embed forms on event pages (e.g. jotform.com, forms.google.com). These are security-checked before rendering iframes.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "domain", title: "Domain", type: "string", description: "e.g. 'jotform.com'", validation: (Rule) => Rule.required() }),
            defineField({ name: "label", title: "Label", type: "string", description: "Human-readable name (e.g. 'JotForm')" }),
          ],
          preview: { select: { title: "label", subtitle: "domain" } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Allowed Form Domains" }) },
});
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/sanity/schemas/forms/
git commit -m "feat(sanity): add form singleton schemas (contact, service inquiry, event inquiry, newsletter, allowed domains)"
```

---

## Task 6: Add orderRankField to orderable document schemas

The `@sanity/orderable-document-list` plugin requires an `orderRank` field and `orderRankOrdering` on each schema that should be draggable.

**Schemas to update:** `service`, `teamMember`, `galleryImage` (was `gallery`), `partner`, `resource`.

- [ ] **Step 1: Update `src/sanity/schemas/documents/service.ts`**

Add at the top of the file:
```typescript
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
```

Add as the first item in `fields` array:
```typescript
orderRankField({ type: "service" }),
```

Add `orderings` property to the schema (alongside `fields`):
```typescript
orderings: [orderRankOrdering],
```

Remove the manual `order` number field from `fields` (search for `name: "order"` and delete that `defineField` block).

- [ ] **Step 2: Update `src/sanity/schemas/documents/teamMember.ts`**

Same pattern:
```typescript
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
// add orderRankField({ type: "teamMember" }) as first field
// add orderings: [orderRankOrdering]
// remove manual order field if present
```

- [ ] **Step 3: Update `src/sanity/schemas/documents/galleryImage.ts`**

```typescript
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
// add orderRankField({ type: "galleryImage" }) as first field
// add orderings: [orderRankOrdering]
// remove manual order field if present
```

- [ ] **Step 4: Update `src/sanity/schemas/documents/partner.ts`**

Same pattern with `{ type: "partner" }`.

- [ ] **Step 5: Update `src/sanity/schemas/documents/resource.ts`**

Same pattern with `{ type: "resource" }`. Also remove manual `order` field if present.

- [ ] **Step 6: Run type-check**

```bash
npm run type-check
```

- [ ] **Step 7: Commit**

```bash
git add src/sanity/schemas/documents/
git commit -m "feat(sanity): add orderRankField to service, teamMember, galleryImage, partner, resource"
```

---

## Task 7: Rebuild desk structure in `sanity.config.ts`

Replace the entire desk structure and add plugins. This is the largest single-file change.

- [ ] **Step 1: Replace `sanity.config.ts`**

```typescript
"use client";

import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder, type StructureResolverContext } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { media } from "sanity-plugin-media";
import {
  orderableDocumentListDeskItem,
} from "@sanity/orderable-document-list";
import { schemaTypes } from "./src/sanity/schemas";

/** All singleton document IDs — these use .documentId() in the desk */
const singletonIds = [
  "siteSettings",
  "homepageSettings",
  "prayerSettings",
  "donationSettings",
  "donatePageSettings",
  "formSettings",
  "mediaGallery",
  "offlineDonations",
  // Page singletons
  "aboutPageSettings",
  "architecturePageSettings",
  "visitPageSettings",
  "worshippersPageSettings",
  "contactPageSettings",
  "eventsPageSettings",
  "announcementsPageSettings",
  "servicesPageSettings",
  "imamsPageSettings",
  "resourcesPageSettings",
  "mediaPageSettings",
  "partnersPageSettings",
  "privacyPageSettings",
  "termsPageSettings",
  // Form singletons
  "contactFormSettings",
  "serviceInquiryFormSettings",
  "eventInquiryFormSettings",
  "newsletterSettings",
  "allowedFormDomains",
];

/** Helper: singleton list item */
const singleton = (S: StructureBuilder, schemaType: string, title: string) =>
  S.listItem()
    .title(title)
    .child(S.document().schemaType(schemaType).documentId(schemaType));

const structure = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title("Content")
    .items([
      // ── Site Pages ──
      S.listItem()
        .title("Site Pages")
        .child(
          S.list()
            .title("Site Pages")
            .items([
              singleton(S, "homepageSettings", "Homepage"),
              singleton(S, "aboutPageSettings", "About"),
              singleton(S, "architecturePageSettings", "Architecture"),
              singleton(S, "visitPageSettings", "Visit"),
              singleton(S, "worshippersPageSettings", "Worshippers"),
              singleton(S, "contactPageSettings", "Contact"),

              S.divider(),

              // Events folder
              S.listItem()
                .title("Events")
                .child(
                  S.list()
                    .title("Events")
                    .items([
                      singleton(S, "eventsPageSettings", "Page Settings"),
                      S.divider(),
                      S.listItem()
                        .title("Live on Website")
                        .child(
                          S.documentList()
                            .title("Live Events")
                            .filter(
                              `_type == "event" && active == true && (
                                (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= now())) ||
                                date >= now() ||
                                endDate >= now()
                              )`
                            )
                        ),
                      S.listItem()
                        .title("Expired")
                        .child(
                          S.documentList()
                            .title("Expired Events")
                            .filter(
                              `_type == "event" && active == true && !(
                                (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= now())) ||
                                date >= now() ||
                                endDate >= now()
                              )`
                            )
                        ),
                      S.listItem()
                        .title("Inactive")
                        .child(
                          S.documentList()
                            .title("Inactive Events")
                            .filter('_type == "event" && active == false')
                        ),
                    ])
                ),

              // Announcements folder
              S.listItem()
                .title("Announcements")
                .child(
                  S.list()
                    .title("Announcements")
                    .items([
                      singleton(S, "announcementsPageSettings", "Page Settings"),
                      S.divider(),
                      S.listItem()
                        .title("Active")
                        .child(
                          S.documentList()
                            .title("Active Announcements")
                            .filter('_type == "announcement" && active == true')
                        ),
                      S.listItem()
                        .title("Inactive")
                        .child(
                          S.documentList()
                            .title("Inactive Announcements")
                            .filter('_type == "announcement" && active == false')
                        ),
                    ])
                ),

              // Services folder
              S.listItem()
                .title("Services")
                .child(
                  S.list()
                    .title("Services")
                    .items([
                      singleton(S, "servicesPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "service",
                        title: "Active Services",
                        filter: '_type == "service" && active == true',
                        S,
                        context,
                      }),
                      S.listItem()
                        .title("Inactive")
                        .child(
                          S.documentList()
                            .title("Inactive Services")
                            .filter('_type == "service" && active == false')
                        ),
                    ])
                ),

              // Donate folder
              S.listItem()
                .title("Donate")
                .child(
                  S.list()
                    .title("Donate")
                    .items([
                      singleton(S, "donatePageSettings", "Page Settings"),
                      S.divider(),
                      S.listItem()
                        .title("Active Campaigns")
                        .child(
                          S.documentList()
                            .title("Active Campaigns")
                            .filter('_type == "donationCampaign" && active == true')
                        ),
                      S.listItem()
                        .title("Inactive Campaigns")
                        .child(
                          S.documentList()
                            .title("Inactive Campaigns")
                            .filter('_type == "donationCampaign" && active == false')
                        ),
                      S.divider(),
                      singleton(S, "offlineDonations", "Offline Donations"),
                    ])
                ),

              // Imams / Team folder
              S.listItem()
                .title("Imams / Team")
                .child(
                  S.list()
                    .title("Imams / Team")
                    .items([
                      singleton(S, "imamsPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "teamMember",
                        title: "Team Members",
                        S,
                        context,
                      }),
                    ])
                ),

              // Resources folder
              S.listItem()
                .title("Resources")
                .child(
                  S.list()
                    .title("Resources")
                    .items([
                      singleton(S, "resourcesPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "resource",
                        title: "All Resources",
                        S,
                        context,
                      }),
                    ])
                ),

              // Media folder
              S.listItem()
                .title("Media")
                .child(
                  S.list()
                    .title("Media")
                    .items([
                      singleton(S, "mediaPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "galleryImage",
                        title: "Gallery Images",
                        S,
                        context,
                      }),
                      singleton(S, "mediaGallery", "Media Page Gallery"),
                    ])
                ),

              // Partners folder
              S.listItem()
                .title("Partners")
                .child(
                  S.list()
                    .title("Partners")
                    .items([
                      singleton(S, "partnersPageSettings", "Page Settings"),
                      S.divider(),
                      orderableDocumentListDeskItem({
                        type: "partner",
                        title: "All Partners",
                        S,
                        context,
                      }),
                    ])
                ),

              S.divider(),
              singleton(S, "privacyPageSettings", "Privacy Policy"),
              singleton(S, "termsPageSettings", "Terms of Use"),
              S.divider(),

              // Custom CMS pages (dynamic pageContent documents)
              S.listItem()
                .title("Custom Pages")
                .child(
                  S.documentList()
                    .title("Custom Pages")
                    .filter('_type == "pageContent"')
                ),
            ])
        ),

      S.divider(),

      // ── Prayer Times ──
      singleton(S, "prayerSettings", "Prayer Times"),

      // ── Forms ──
      S.listItem()
        .title("Forms")
        .child(
          S.list()
            .title("Forms")
            .items([
              singleton(S, "contactFormSettings", "Contact Form"),
              singleton(S, "serviceInquiryFormSettings", "Service Inquiry Form"),
              singleton(S, "eventInquiryFormSettings", "Event Inquiry Form"),
              singleton(S, "newsletterSettings", "Newsletter"),
              S.divider(),
              singleton(S, "allowedFormDomains", "Allowed Form Domains"),
            ])
        ),

      // ── Donation Settings ──
      singleton(S, "donationSettings", "Donation Settings"),

      // ── Site Settings ──
      singleton(S, "siteSettings", "Site Settings"),
    ]);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://aic-website.vercel.app";

const previewPaths: Record<string, (slug?: string) => string> = {
  event: (slug) => `/events${slug ? `/${slug}` : ""}`,
  announcement: (slug) => `/announcements${slug ? `/${slug}` : ""}`,
  service: () => "/services",
  donationSettings: () => "/donate",
  donatePageSettings: () => "/donate",
  offlineDonations: () => "/donate",
  donationCampaign: () => "/donate",
  galleryImage: () => "/media",
  mediaGallery: () => "/media",
  mediaPageSettings: () => "/media",
  faq: () => "/resources",
  etiquette: () => "/visit",
  homepageSettings: () => "/",
  siteSettings: () => "/",
  prayerSettings: () => "/worshippers",
  teamMember: (slug) => `/imams${slug ? `/${slug}` : ""}`,
  pageContent: (slug) => (slug ? `/${slug}` : "/"),
  resource: () => "/resources",
  partner: (slug) => `/partners${slug ? `/${slug}` : ""}`,
  aboutPageSettings: () => "/about",
  architecturePageSettings: () => "/architecture",
  visitPageSettings: () => "/visit",
  worshippersPageSettings: () => "/worshippers",
  contactPageSettings: () => "/contact",
  eventsPageSettings: () => "/events",
  announcementsPageSettings: () => "/announcements",
  servicesPageSettings: () => "/services",
  imamsPageSettings: () => "/imams",
  resourcesPageSettings: () => "/resources",
  partnersPageSettings: () => "/partners",
  privacyPageSettings: () => "/privacy",
  termsPageSettings: () => "/terms",
  contactFormSettings: () => "/contact",
  serviceInquiryFormSettings: () => "/services",
  eventInquiryFormSettings: () => "/events",
  newsletterSettings: () => "/",
};

function resolvePreviewUrl(docType: string, slug?: string): string | undefined {
  const pathFn = previewPaths[docType];
  if (!pathFn) return undefined;
  return `${baseUrl}${pathFn(slug)}`;
}

export default defineConfig({
  name: "australian-islamic-centre",
  title: "Australian Islamic Centre",
  projectId,
  dataset,
  basePath: "/studio",

  plugins: [
    structureTool({ structure }),
    media(),
    presentationTool({
      previewUrl: {
        initial: baseUrl,
        previewMode: { enable: "/api/draft-mode/enable" },
        resolve: (doc: { _type?: string; slug?: { current?: string } } | null) => {
          const docType = doc?._type;
          const slug = doc?.slug?.current;
          if (!docType) return baseUrl;
          return resolvePreviewUrl(docType, slug) || baseUrl;
        },
      },
    }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],

  scheduledPublishing: {
    enabled: true,
    inputDateTimeFormat: "dd/MM/yyyy h:mm a",
  },

  schema: { types: schemaTypes },

  document: {
    actions: (prev, context) => {
      if (singletonIds.includes(context.schemaType)) {
        return prev.filter(
          (action) => action.action !== "delete" && action.action !== "duplicate"
        );
      }
      return prev;
    },
    productionUrl: async (prev, context) => {
      const { document } = context;
      const docType = document._type;
      const slug = (document.slug as { current?: string })?.current;
      const url = resolvePreviewUrl(docType, slug);
      return url || prev;
    },
  },
});
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: passes. Fix any import errors.

- [ ] **Step 3: Start dev server and verify Studio loads**

```bash
npm run dev
```

Open `http://localhost:3000/studio` and verify the new sidebar structure is visible with all folders.

- [ ] **Step 4: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(sanity): rebuild desk structure with page-centric sidebar, add media plugin and scheduled publishing"
```

---

## Task 8: Add GROQ queries for new singletons

Add one query per new page singleton and form singleton to `src/sanity/lib/queries.ts`.

- [ ] **Step 1: Add queries at the end of `src/sanity/lib/queries.ts`**

```typescript
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

export const allowedFormDomainsQuery = groq`
  *[_id == "allowedFormDomains"][0] {
    allowedDomains
  }
`;
```

- [ ] **Step 2: Update existing order queries to use `orderRank`**

In `queries.ts`, find these queries and replace `order(order asc)` with `order(orderRank)`:
- `galleryQuery` — change to `| order(orderRank)`
- `featuredGalleryQuery` — change to `| order(orderRank)`
- `servicesQuery` — change to `| order(orderRank)`
- `featuredServicesQuery` — change to `| order(orderRank)`
- `resourcesQuery` — change to `| order(orderRank)`
- `partnersQuery` — change to `| order(orderRank)`
- `teamMembersQuery`, `teamMembersByCategoryQuery`, `featuredTeamMembersQuery` — change to `| order(orderRank)`

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/sanity/lib/queries.ts
git commit -m "feat(sanity): add GROQ queries for all page and form singletons, update order queries to use orderRank"
```

---

## Task 9: Add TypeScript interfaces for new singletons

- [ ] **Step 1: Add interfaces to `src/types/sanity.ts`**

Append to the end of the file:

```typescript
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
  operatingHours?: string;
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

/** Allowed embed domains singleton settings. */
export interface SanityAllowedFormDomains {
  allowedDomains?: Array<{ domain: string; label?: string }>;
}
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/types/sanity.ts
git commit -m "feat(types): add TypeScript interfaces for all new page and form singletons"
```

---

## Task 10: Add fetch functions for new singletons

- [ ] **Step 1: Add new imports to top of `src/sanity/lib/fetch.ts`**

Add to the existing query imports:
```typescript
  aboutPageSettingsQuery,
  architecturePageSettingsQuery,
  visitPageSettingsQuery,
  worshippersPageSettingsQuery,
  contactPageSettingsQuery,
  eventsPageSettingsQuery,
  announcementsPageSettingsQuery,
  servicesPageSettingsQuery,
  imamsPageSettingsQuery,
  resourcesPageSettingsQuery,
  mediaPageSettingsQuery,
  partnersPageSettingsQuery,
  privacyPageSettingsQuery,
  termsPageSettingsQuery,
  contactFormSettingsQuery,
  serviceInquiryFormSettingsQuery,
  eventInquiryFormSettingsQuery,
  newsletterSettingsQuery,
  allowedFormDomainsQuery,
```

Add to the type imports:
```typescript
  SanityAboutPageSettings,
  SanityArchitecturePageSettings,
  SanityVisitPageSettings,
  SanityWorshippersPageSettings,
  SanityContactPageSettings,
  SanitySimplePageSettings,
  SanityServicesPageSettings,
  SanityImamsPageSettings,
  SanityMediaPageSettings,
  SanityPartnersPageSettings,
  SanityLegalPageSettings,
  SanityContactFormSettings,
  SanityServiceInquiryFormSettings,
  SanityEventInquiryFormSettings,
  SanityNewsletterSettings,
  SanityAllowedFormDomains,
```

- [ ] **Step 2: Add fetch functions to `src/sanity/lib/fetch.ts`**

Append before the final export:

```typescript
// Page settings fetch functions
export async function getAboutPageSettings(): Promise<SanityAboutPageSettings | null> {
  try {
    return await sanityFetch<SanityAboutPageSettings>(aboutPageSettingsQuery, {}, ["aboutPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch aboutPageSettings:", error);
    return null;
  }
}

export async function getArchitecturePageSettings(): Promise<SanityArchitecturePageSettings | null> {
  try {
    return await sanityFetch<SanityArchitecturePageSettings>(architecturePageSettingsQuery, {}, ["architecturePageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch architecturePageSettings:", error);
    return null;
  }
}

export async function getVisitPageSettings(): Promise<SanityVisitPageSettings | null> {
  try {
    return await sanityFetch<SanityVisitPageSettings>(visitPageSettingsQuery, {}, ["visitPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch visitPageSettings:", error);
    return null;
  }
}

export async function getWorshippersPageSettings(): Promise<SanityWorshippersPageSettings | null> {
  try {
    return await sanityFetch<SanityWorshippersPageSettings>(worshippersPageSettingsQuery, {}, ["worshippersPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch worshippersPageSettings:", error);
    return null;
  }
}

export async function getContactPageSettings(): Promise<SanityContactPageSettings | null> {
  try {
    return await sanityFetch<SanityContactPageSettings>(contactPageSettingsQuery, {}, ["contactPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch contactPageSettings:", error);
    return null;
  }
}

export async function getEventsPageSettings(): Promise<SanitySimplePageSettings | null> {
  try {
    return await sanityFetch<SanitySimplePageSettings>(eventsPageSettingsQuery, {}, ["eventsPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch eventsPageSettings:", error);
    return null;
  }
}

export async function getAnnouncementsPageSettings(): Promise<SanitySimplePageSettings | null> {
  try {
    return await sanityFetch<SanitySimplePageSettings>(announcementsPageSettingsQuery, {}, ["announcementsPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch announcementsPageSettings:", error);
    return null;
  }
}

export async function getServicesPageSettings(): Promise<SanityServicesPageSettings | null> {
  try {
    return await sanityFetch<SanityServicesPageSettings>(servicesPageSettingsQuery, {}, ["servicesPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch servicesPageSettings:", error);
    return null;
  }
}

export async function getImamsPageSettings(): Promise<SanityImamsPageSettings | null> {
  try {
    return await sanityFetch<SanityImamsPageSettings>(imamsPageSettingsQuery, {}, ["imamsPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch imamsPageSettings:", error);
    return null;
  }
}

export async function getResourcesPageSettings(): Promise<SanitySimplePageSettings | null> {
  try {
    return await sanityFetch<SanitySimplePageSettings>(resourcesPageSettingsQuery, {}, ["resourcesPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch resourcesPageSettings:", error);
    return null;
  }
}

export async function getMediaPageSettings(): Promise<SanityMediaPageSettings | null> {
  try {
    return await sanityFetch<SanityMediaPageSettings>(mediaPageSettingsQuery, {}, ["mediaPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch mediaPageSettings:", error);
    return null;
  }
}

export async function getPartnersPageSettings(): Promise<SanityPartnersPageSettings | null> {
  try {
    return await sanityFetch<SanityPartnersPageSettings>(partnersPageSettingsQuery, {}, ["partnersPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch partnersPageSettings:", error);
    return null;
  }
}

export async function getPrivacyPageSettings(): Promise<SanityLegalPageSettings | null> {
  try {
    return await sanityFetch<SanityLegalPageSettings>(privacyPageSettingsQuery, {}, ["privacyPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch privacyPageSettings:", error);
    return null;
  }
}

export async function getTermsPageSettings(): Promise<SanityLegalPageSettings | null> {
  try {
    return await sanityFetch<SanityLegalPageSettings>(termsPageSettingsQuery, {}, ["termsPageSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch termsPageSettings:", error);
    return null;
  }
}

// Form settings fetch functions
export async function getContactFormSettings(): Promise<SanityContactFormSettings | null> {
  try {
    return await sanityFetch<SanityContactFormSettings>(contactFormSettingsQuery, {}, ["contactFormSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch contactFormSettings:", error);
    return null;
  }
}

export async function getServiceInquiryFormSettings(): Promise<SanityServiceInquiryFormSettings | null> {
  try {
    return await sanityFetch<SanityServiceInquiryFormSettings>(serviceInquiryFormSettingsQuery, {}, ["serviceInquiryFormSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch serviceInquiryFormSettings:", error);
    return null;
  }
}

export async function getEventInquiryFormSettings(): Promise<SanityEventInquiryFormSettings | null> {
  try {
    return await sanityFetch<SanityEventInquiryFormSettings>(eventInquiryFormSettingsQuery, {}, ["eventInquiryFormSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch eventInquiryFormSettings:", error);
    return null;
  }
}

export async function getNewsletterSettings(): Promise<SanityNewsletterSettings | null> {
  try {
    return await sanityFetch<SanityNewsletterSettings>(newsletterSettingsQuery, {}, ["newsletterSettings"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch newsletterSettings:", error);
    return null;
  }
}

export async function getAllowedFormDomains(): Promise<SanityAllowedFormDomains | null> {
  try {
    return await sanityFetch<SanityAllowedFormDomains>(allowedFormDomainsQuery, {}, ["allowedFormDomains"], { skipCdn: true });
  } catch (error) {
    console.error("Failed to fetch allowedFormDomains:", error);
    return null;
  }
}
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/sanity/lib/fetch.ts src/sanity/lib/queries.ts
git commit -m "feat(sanity): add fetch functions for all page and form singletons"
```

---

## Task 11: Update revalidation and preview routes

- [ ] **Step 1: Update `src/app/api/revalidate/route.ts`**

Add to `validDocumentTypes` Set:
```typescript
"aboutPageSettings",
"architecturePageSettings",
"visitPageSettings",
"worshippersPageSettings",
"contactPageSettings",
"eventsPageSettings",
"announcementsPageSettings",
"servicesPageSettings",
"imamsPageSettings",
"resourcesPageSettings",
"mediaPageSettings",
"partnersPageSettings",
"privacyPageSettings",
"termsPageSettings",
"contactFormSettings",
"serviceInquiryFormSettings",
"eventInquiryFormSettings",
"newsletterSettings",
"allowedFormDomains",
"offlineDonations",
```

Replace `"formSettings"` entry in `validDocumentTypes` with the 4 new form singletons (keep `formSettings` temporarily for backward compatibility during migration).

Add to `documentTypeToPath`:
```typescript
aboutPageSettings: ["/about"],
architecturePageSettings: ["/architecture"],
visitPageSettings: ["/visit"],
worshippersPageSettings: ["/worshippers"],
contactPageSettings: ["/contact"],
eventsPageSettings: ["/events"],
announcementsPageSettings: ["/announcements"],
servicesPageSettings: ["/services"],
imamsPageSettings: ["/imams"],
resourcesPageSettings: ["/resources"],
mediaPageSettings: ["/media"],
partnersPageSettings: ["/partners"],
privacyPageSettings: ["/privacy"],
termsPageSettings: ["/terms"],
contactFormSettings: ["/contact"],
serviceInquiryFormSettings: ["/services"],
eventInquiryFormSettings: ["/events"],
newsletterSettings: ["/"],
allowedFormDomains: ["/events"],
offlineDonations: ["/donate", "/live-donations"],
```

Also update `partner` detail path in `detailPathPrefix` to `/partners`.

- [ ] **Step 2: Run type-check and tests**

```bash
npm run type-check && npm run test:run
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/revalidate/route.ts src/app/api/preview-url/route.ts
git commit -m "feat(api): update revalidation and preview routes for new singleton types"
```

---

## Task 12: Refactor /about page to server+client split

Currently `src/app/about/page.tsx` is `"use client"` — all content hardcoded. Refactor to server component that fetches from Sanity and passes to client component. Content falls back to hardcoded defaults when Sanity returns null.

- [ ] **Step 1: Write the failing test**

Create `src/app/about/AboutContent.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import AboutContent from "./AboutContent";
import type { SanityAboutPageSettings } from "@/types/sanity";

vi.mock("framer-motion", () => ({ motion: { div: "div", span: "span" } }));
vi.mock("@/components/animations/FadeIn", () => ({ FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt ?? "")} /> }));
vi.mock("@/sanity/lib/image", () => ({ urlFor: () => ({ width: () => ({ height: () => ({ url: () => "https://cdn.sanity.io/test.jpg" }) }) }) }));

const defaultSettings: SanityAboutPageSettings = {
  heroHeading: "About the Australian Islamic Centre",
  heroHeadingAccent: "Australian Islamic Centre",
  heroDescription: "A vibrant community hub",
  heroStats: [{ value: "40+", label: "Years Serving" }],
};

describe("AboutContent", () => {
  it("renders hero heading from Sanity settings", () => {
    render(<AboutContent settings={defaultSettings} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("About the Australian Islamic Centre");
  });

  it("renders hardcoded fallback heading when settings is null", () => {
    render(<AboutContent settings={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders hero stats when provided", () => {
    render(<AboutContent settings={defaultSettings} />);
    expect(screen.getByText("40+")).toBeInTheDocument();
    expect(screen.getByText("Years Serving")).toBeInTheDocument();
  });

  it("hides mission section when missionVisible is false", () => {
    render(<AboutContent settings={{ ...defaultSettings, missionVisible: false }} />);
    expect(screen.queryByText(/Mission & Vision/i)).not.toBeInTheDocument();
  });

  it("hides timeline section when timelineVisible is false", () => {
    render(<AboutContent settings={{ ...defaultSettings, timelineVisible: false }} />);
    expect(screen.queryByText(/Legacy of Service/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run src/app/about/AboutContent.test.tsx
```

Expected: FAIL — "AboutContent" not found.

- [ ] **Step 3: Create `src/app/about/AboutContent.tsx`**

This is a client component that accepts `settings: SanityAboutPageSettings | null` as a prop. It renders the full about page using Sanity data when available, falling back to the current hardcoded values.

Key implementation notes:
- Add `"use client"` at top
- Accept `settings: SanityAboutPageSettings | null` prop
- For each field, use: `settings?.heroHeading ?? "About the Australian Islamic Centre"`
- Each section (`missionVisible`, `timelineVisible`, etc.) uses `settings?.missionVisible !== false` so it defaults to visible when Sanity is empty
- Copy all JSX from the current `src/app/about/page.tsx` into this component
- Replace all hardcoded strings with `settings?.fieldName ?? "hardcoded fallback"`

- [ ] **Step 4: Refactor `src/app/about/page.tsx` to server component**

Replace the entire file:

```typescript
import type { Metadata } from "next";
import { getAboutPageSettings } from "@/sanity/lib/fetch";
import AboutContent from "./AboutContent";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAboutPageSettings();
  return {
    title: settings?.seo?.title ?? "About Us | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Learn about the Australian Islamic Centre — a vibrant community hub in Newport, Melbourne.",
    alternates: { canonical: "/about" },
    openGraph: settings?.seo?.image ? { images: [{ url: settings.seo.image.asset._ref }] } : undefined,
  };
}

export default async function AboutPage() {
  const settings = await getAboutPageSettings();
  return <AboutContent settings={settings} />;
}
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run src/app/about/AboutContent.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Run type-check**

```bash
npm run type-check
```

- [ ] **Step 7: Commit**

```bash
git add src/app/about/
git commit -m "feat(about): refactor to server/client split, wire to aboutPageSettings Sanity singleton"
```

---

## Task 13: Refactor /architecture page

Same pattern as Task 12.

- [ ] **Step 1: Write test `src/app/architecture/ArchitectureContent.test.tsx`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import ArchitectureContent from "./ArchitectureContent";

vi.mock("framer-motion", () => ({ motion: { div: "div", span: "span" } }));
vi.mock("@/components/animations/FadeIn", () => ({ FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt ?? "")} /> }));
vi.mock("@/sanity/lib/image", () => ({ urlFor: () => ({ width: () => ({ height: () => ({ url: () => "https://cdn.sanity.io/test.jpg" }) }) }) }));

describe("ArchitectureContent", () => {
  it("renders hero heading from Sanity settings", () => {
    render(<ArchitectureContent settings={{ heroHeading: "Our Architecture" }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Our Architecture");
  });

  it("renders hardcoded fallback when settings is null", () => {
    render(<ArchitectureContent settings={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("hides awards section when awardsVisible is false", () => {
    render(<ArchitectureContent settings={{ awardsVisible: false }} />);
    expect(screen.queryByText(/Awards & Accolades/i)).not.toBeInTheDocument();
  });

  it("hides quote section when quoteVisible is false", () => {
    render(<ArchitectureContent settings={{ quoteVisible: false }} />);
    expect(screen.queryByRole("blockquote")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run src/app/architecture/ArchitectureContent.test.tsx
```

- [ ] **Step 3: Create `src/app/architecture/ArchitectureContent.tsx`**

Client component accepting `settings: SanityArchitecturePageSettings | null`. Copy all JSX from current `src/app/architecture/page.tsx`, replace hardcoded strings with `settings?.field ?? "fallback"`. Respect `visible` toggles using `settings?.featuresVisible !== false`.

- [ ] **Step 4: Refactor `src/app/architecture/page.tsx`**

```typescript
import type { Metadata } from "next";
import { getArchitecturePageSettings } from "@/sanity/lib/fetch";
import ArchitectureContent from "./ArchitectureContent";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getArchitecturePageSettings();
  return {
    title: settings?.seo?.title ?? "Architecture | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Explore the award-winning architecture of the Australian Islamic Centre, designed by Pritzker Prize laureate Glenn Murcutt.",
    alternates: { canonical: "/architecture" },
  };
}

export default async function ArchitecturePage() {
  const settings = await getArchitecturePageSettings();
  return <ArchitectureContent settings={settings} />;
}
```

- [ ] **Step 5: Run tests and type-check**

```bash
npx vitest run src/app/architecture/ArchitectureContent.test.tsx && npm run type-check
```

- [ ] **Step 6: Commit**

```bash
git add src/app/architecture/
git commit -m "feat(architecture): refactor to server/client split, wire to architecturePageSettings"
```

---

## Task 14: Refactor /contact page

The current `src/app/contact/page.tsx` is `"use client"`. Extract JSX into `ContactContent.tsx` and make `page.tsx` the server component.

- [ ] **Step 1: Write test `src/app/contact/ContactContent.test.tsx`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import ContactContent from "./ContactContent";

vi.mock("framer-motion", () => ({ motion: { div: "div" } }));
vi.mock("@/components/animations/FadeIn", () => ({ FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe("ContactContent", () => {
  it("renders page heading from contactPageSettings", () => {
    render(<ContactContent pageSettings={{ heroHeading: "Contact", heroHeadingAccent: "Us" }} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders hardcoded fallback when pageSettings is null", () => {
    render(<ContactContent pageSettings={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders the contact form", () => {
    render(<ContactContent pageSettings={null} />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run src/app/contact/ContactContent.test.tsx
```

- [ ] **Step 3: Create `src/app/contact/ContactContent.tsx`**

Extract everything from the current `page.tsx` into this file. Accept `pageSettings: SanityContactPageSettings | null` prop. Use `pageSettings?.heroHeading ?? "Get in"` etc. for text fallbacks. Keep all existing form logic, hooks, and state management as-is.

- [ ] **Step 4: Refactor `src/app/contact/page.tsx`**

```typescript
import type { Metadata } from "next";
import { getContactPageSettings } from "@/sanity/lib/fetch";
import ContactContent from "./ContactContent";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContactPageSettings();
  return {
    title: settings?.seo?.title ?? "Contact Us | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Get in touch with the Australian Islamic Centre.",
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const settings = await getContactPageSettings();
  return <ContactContent pageSettings={settings} />;
}
```

- [ ] **Step 5: Run tests and type-check**

```bash
npx vitest run src/app/contact/ContactContent.test.tsx && npm run type-check
```

- [ ] **Step 6: Commit**

```bash
git add src/app/contact/
git commit -m "feat(contact): refactor to server/client split, wire to contactPageSettings"
```

---

## Task 15: Wire /privacy and /terms to Sanity

These pages already have a server/client split. Wire them to fetch from the new singletons. Content falls back to hardcoded text when Sanity returns null.

- [ ] **Step 1: Update `src/app/privacy/page.tsx`**

```typescript
import type { Metadata } from "next";
import { getPrivacyPageSettings } from "@/sanity/lib/fetch";
import PrivacyContent from "./PrivacyContent";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPrivacyPageSettings();
  return {
    title: settings?.seo?.title ?? "Privacy Policy | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Privacy policy for the Australian Islamic Centre website.",
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const settings = await getPrivacyPageSettings();
  return <PrivacyContent settings={settings} />;
}
```

- [ ] **Step 2: Update `src/app/privacy/PrivacyContent.tsx`**

Add `settings: SanityLegalPageSettings | null` prop. At the top of the component:
- If `settings?.content` exists, render it via PortableText instead of the hardcoded sections
- If `settings?.heading` exists, use it instead of hardcoded "Privacy Policy"
- If `settings?.lastUpdated` exists, format it as `dd MMMM yyyy` in Melbourne timezone using `new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", day: "numeric", month: "long", year: "numeric" }).format(new Date(settings.lastUpdated))`
- Otherwise render existing hardcoded content (no visible change until admin publishes content)

Import `PortableText` from `@portabletext/react` for rendering.

- [ ] **Step 3: Apply same pattern to `/terms`**

Update `src/app/terms/page.tsx` and `src/app/terms/TermsContent.tsx` identically, using `getTermsPageSettings()` and `SanityLegalPageSettings`.

- [ ] **Step 4: Run type-check**

```bash
npm run type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/app/privacy/ src/app/terms/
git commit -m "feat(privacy,terms): wire to Sanity privacyPageSettings and termsPageSettings with portable text rendering"
```

---

## Task 16: Wire existing pages to new page settings

Pages already connected to Sanity (visit, worshippers, events, announcements, services, imams, resources, media, partners) need their `page.tsx` updated to also fetch the new page settings singleton and pass it to the content component.

- [ ] **Step 1: Update `src/app/visit/page.tsx`**

Add `getVisitPageSettings` to the parallel fetch. Pass result to `VisitContent` as `pageSettings` prop. In `VisitContent.tsx`, accept and use `pageSettings: SanityVisitPageSettings | null` for hero heading, etiquette items (prefer `pageSettings.etiquetteItems` over the old `etiquette` documents if both exist), FAQ items, visiting hours.

- [ ] **Step 2: Update `src/app/worshippers/page.tsx`**

Same pattern — add `getWorshippersPageSettings()` to parallel fetch. Pass to content component.

- [ ] **Step 3: Update `src/app/events/page.tsx`**

Add `getEventsPageSettings()`. Pass hero text to `EventsContent`.

- [ ] **Step 4: Update `src/app/announcements/page.tsx`**

Add `getAnnouncementsPageSettings()`. Pass to content component.

- [ ] **Step 5: Update `src/app/services/page.tsx`**

Add `getServicesPageSettings()`. Pass to `ServicesContent`.

- [ ] **Step 6: Update `src/app/imams/page.tsx`**

Add `getImamsPageSettings()`. Pass to `ImamsContent`.

- [ ] **Step 7: Update `src/app/resources/page.tsx`**

Add `getResourcesPageSettings()`. Pass to `ResourcesContent`.

- [ ] **Step 8: Update `src/app/media/page.tsx`**

Add `getMediaPageSettings()`. Pass to `MediaContent`. Respect `youtubeVisible`, `galleryVisible`, `socialVisible` toggles.

- [ ] **Step 9: Update `src/app/partners/page.tsx`**

Add `getPartnersPageSettings()`. Pass to `PartnersContent`.

- [ ] **Step 10: Run type-check and tests**

```bash
npm run type-check && npm run test:run
```

Fix any type errors from new props.

- [ ] **Step 11: Commit**

```bash
git add src/app/visit/ src/app/worshippers/ src/app/events/ src/app/announcements/ src/app/services/ src/app/imams/ src/app/resources/ src/app/media/ src/app/partners/
git commit -m "feat(pages): wire all existing pages to new page settings singletons"
```

---

## Task 17: Update FormSettingsContext to use 5 new form singletons

`FormSettingsContext` currently merges data from the single `formSettings` singleton. Update it to use the 5 new form singletons instead, keeping the same shape so no child components break.

- [ ] **Step 1: Update `src/app/layout.tsx` (or wherever FormSettingsContext is populated)**

Find where `formSettings` is fetched for the context. Replace with parallel fetches of all 5 new form singletons:

```typescript
const [contactForm, serviceForm, eventForm, newsletter] = await Promise.all([
  getContactFormSettings(),
  getServiceInquiryFormSettings(),
  getEventInquiryFormSettings(),
  getNewsletterSettings(),
]);
```

Merge these into the existing `FormSettingsData` shape, with the same hardcoded fallbacks that currently exist.

- [ ] **Step 2: Update `src/lib/form-settings.ts`**

The server-side recipient lookup uses `formSettings`. Update it to call `getContactFormSettings()` and `getServiceInquiryFormSettings()` instead, with the same fallback email logic.

- [ ] **Step 3: Update `src/middleware.ts`**

Find where `siteSettings.allowedEmbedDomains` is queried. Replace with a query against `allowedFormDomains.allowedDomains`. Keep the same validation logic.

- [ ] **Step 4: Run type-check and tests**

```bash
npm run type-check && npm run test:run
```

- [ ] **Step 5: Commit**

```bash
git add src/contexts/FormSettingsContext.tsx src/lib/form-settings.ts src/middleware.ts
git commit -m "feat(forms): update FormSettingsContext and form-settings.ts to use 5 form singletons"
```

---

## Task 18: Partner dynamic route

Replace hardcoded `/partners/aicc/` with `/partners/[slug]` dynamic route using the existing `partner` schema.

- [ ] **Step 1: Write test `src/app/partners/[slug]/PartnerDetailContent.test.tsx`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import PartnerDetailContent from "./PartnerDetailContent";
import type { SanityPartner } from "@/types/sanity";

vi.mock("framer-motion", () => ({ motion: { div: "div" } }));
vi.mock("@/components/animations/FadeIn", () => ({ FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt ?? "")} /> }));
vi.mock("@/sanity/lib/image", () => ({ urlFor: () => ({ width: () => ({ height: () => ({ url: () => "https://cdn.sanity.io/test.jpg" }) }) }) }));

const mockPartner: SanityPartner = {
  _id: "partner-1",
  name: "AIC College",
  slug: "aicc",
  shortDescription: "A leading Islamic school",
};

describe("PartnerDetailContent", () => {
  it("renders partner name as heading", () => {
    render(<PartnerDetailContent partner={mockPartner} />);
    expect(screen.getByRole("heading", { name: "AIC College" })).toBeInTheDocument();
  });

  it("renders short description", () => {
    render(<PartnerDetailContent partner={mockPartner} />);
    expect(screen.getByText("A leading Islamic school")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run "src/app/partners/\[slug\]/PartnerDetailContent.test.tsx"
```

- [ ] **Step 3: Add `getPartnerBySlug` GROQ query to `src/sanity/lib/queries.ts`**

```typescript
export const partnerBySlugQuery = groq`
  *[_type == "partner" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    logo,
    coverImage,
    website,
    email,
    phone,
    active
  }
`;

export const allPartnerSlugsQuery = groq`
  *[_type == "partner" && defined(slug.current)] { "slug": slug.current }
`;
```

- [ ] **Step 4: Add `getPartnerBySlug` and `getAllPartnerSlugs` to `src/sanity/lib/fetch.ts`**

```typescript
export async function getPartnerBySlug(slug: string): Promise<SanityPartner | null> {
  try {
    return await sanityFetch<SanityPartner>(partnerBySlugQuery, { slug }, ["partner"]);
  } catch (error) {
    console.error("Failed to fetch partner by slug:", error);
    return null;
  }
}

export async function getAllPartnerSlugs(): Promise<{ slug: string }[]> {
  try {
    return await sanityFetch<{ slug: string }[]>(allPartnerSlugsQuery, {}, ["partner"]);
  } catch (error) {
    console.error("Failed to fetch partner slugs:", error);
    return [];
  }
}
```

- [ ] **Step 5: Create `src/app/partners/[slug]/PartnerDetailContent.tsx`**

Client component accepting `partner: SanityPartner`. Renders: breadcrumb, cover image, logo, name (h1), shortDescription, fullDescription via PortableText, website/email/phone contact box, back to partners link. Style should match the rest of the site (teal/navy palette, Playfair Display headings).

- [ ] **Step 6: Create `src/app/partners/[slug]/page.tsx`**

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPartnerBySlug, getAllPartnerSlugs } from "@/sanity/lib/fetch";
import PartnerDetailContent from "./PartnerDetailContent";

export async function generateStaticParams() {
  const slugs = await getAllPartnerSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) return { title: "Partner Not Found" };
  return {
    title: `${partner.name} | Australian Islamic Centre`,
    description: partner.shortDescription,
    alternates: { canonical: `/partners/${slug}` },
  };
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) notFound();
  return <PartnerDetailContent partner={partner} />;
}
```

- [ ] **Step 7: Add redirect for old `/partners/aicc` URL in `next.config.ts`**

```typescript
async redirects() {
  return [
    {
      source: "/partners/aicc",
      destination: "/partners/aicc",  // same slug — no-op if already slug-based
      permanent: true,
    },
  ];
},
```

Note: If the AICC partner document has slug `aicc`, this redirect is effectively a no-op since the new dynamic route handles `/partners/aicc` directly. Add it anyway for safety with any cached links.

- [ ] **Step 8: Delete hardcoded partner page**

```bash
rm -rf src/app/partners/aicc/
```

- [ ] **Step 9: Run tests and type-check**

```bash
npx vitest run "src/app/partners/\[slug\]/PartnerDetailContent.test.tsx" && npm run type-check
```

- [ ] **Step 10: Commit**

```bash
git add src/app/partners/ src/sanity/lib/ next.config.ts
git commit -m "feat(partners): add dynamic [slug] route, remove hardcoded /partners/aicc page"
```

---

## Task 19: Migration script for formSettings

Migrate data from the old `formSettings` document to the 5 new form singletons. Run once against production after all schemas are deployed.

- [ ] **Step 1: Create `scripts/migrate-form-settings.ts`**

```typescript
/**
 * One-time migration: copy fields from legacy formSettings singleton
 * into the 5 new form singleton documents.
 *
 * Run with: npx ts-node --project tsconfig.json scripts/migrate-form-settings.ts
 *
 * Prerequisites:
 * - SANITY_WRITE_TOKEN must be set in .env.local
 * - Run AFTER deploying the new schema to production
 * - Run ONCE — subsequent runs are safe (they overwrite with same data)
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

async function migrate() {
  console.log("Reading legacy formSettings...");
  const formSettings = await client.fetch('*[_id == "formSettings"][0]');

  if (!formSettings) {
    console.log("No formSettings document found — skipping migration.");
    return;
  }

  console.log("Migrating to contactFormSettings...");
  await client.createOrReplace({
    _id: "contactFormSettings",
    _type: "contactFormSettings",
    contactEnabled: formSettings.contactEnabled ?? true,
    contactRecipientEmail: formSettings.contactRecipientEmail,
    contactHeading: formSettings.contactHeading,
    contactHeadingAccent: formSettings.contactHeadingAccent,
    contactDescription: formSettings.contactDescription,
    contactFormHeading: formSettings.contactFormHeading,
    contactFormDescription: formSettings.contactFormDescription,
    contactInquiryTypes: formSettings.contactInquiryTypes ?? [],
    contactSuccessHeading: formSettings.contactSuccessHeading,
    contactSuccessMessage: formSettings.contactSuccessMessage,
  });

  console.log("Migrating to serviceInquiryFormSettings...");
  await client.createOrReplace({
    _id: "serviceInquiryFormSettings",
    _type: "serviceInquiryFormSettings",
    serviceInquiryEnabled: formSettings.serviceInquiryEnabled ?? true,
    serviceInquiryRecipientEmail: formSettings.serviceInquiryRecipientEmail,
    serviceInquiryFormHeading: formSettings.serviceInquiryFormHeading,
    serviceInquiryFormDescription: formSettings.serviceInquiryFormDescription,
    serviceInquirySuccessHeading: formSettings.serviceInquirySuccessHeading,
    serviceInquirySuccessMessage: formSettings.serviceInquirySuccessMessage,
  });

  console.log("Migrating to eventInquiryFormSettings...");
  await client.createOrReplace({
    _id: "eventInquiryFormSettings",
    _type: "eventInquiryFormSettings",
    eventInquiryEnabled: formSettings.eventInquiryEnabled ?? true,
    eventInquiryRecipientEmail: formSettings.eventInquiryRecipientEmail,
  });

  console.log("Migrating to newsletterSettings...");
  await client.createOrReplace({
    _id: "newsletterSettings",
    _type: "newsletterSettings",
    newsletterEnabled: formSettings.newsletterEnabled ?? true,
    newsletterRecipientEmail: formSettings.newsletterRecipientEmail,
    newsletterHeading: formSettings.newsletterHeading,
    newsletterDescription: formSettings.newsletterDescription,
    newsletterButtonText: formSettings.newsletterButtonText,
    newsletterSuccessMessage: formSettings.newsletterSuccessMessage,
  });

  console.log("Migrating to allowedFormDomains...");
  const allowedDomains = (formSettings.allowedEmbedDomains ?? []).map((d: string) => ({
    _key: d.replace(/\./g, "-"),
    domain: d,
    label: d,
  }));
  await client.createOrReplace({
    _id: "allowedFormDomains",
    _type: "allowedFormDomains",
    allowedDomains,
  });

  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Add ts-node dev dependency if not already present**

```bash
npm install --save-dev ts-node
```

- [ ] **Step 3: Test the migration script against local dataset**

```bash
npx ts-node --project tsconfig.json scripts/migrate-form-settings.ts
```

Verify in Sanity Studio (`/studio`) that the 5 new form singletons now have the correct data.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-form-settings.ts package.json package-lock.json
git commit -m "feat(migration): add formSettings migration script to populate 5 new form singletons"
```

---

## Task 20: Post-deploy orderable list reset

After deploying to production, existing documents have no `orderRank` value. This step must be done manually in Sanity Studio after deploy.

- [ ] **Step 1: Open each orderable list in Studio and reset order**

After deployment, for each of the following lists in Sanity Studio:
1. Site Pages > Services > Active Services
2. Site Pages > Imams / Team > Team Members
3. Site Pages > Resources > All Resources
4. Site Pages > Media > Gallery Images
5. Site Pages > Partners > All Partners

Click the **three-dot menu (⋮)** in the top-right of the list → click **"Reset Order"**. This assigns initial `orderRank` values to all existing documents so drag-and-drop works correctly.

---

## Task 21: Final validation

- [ ] **Step 1: Run full validate**

```bash
npm run validate
```

Expected: type-check → lint → test:run → build all pass with zero errors.

- [ ] **Step 2: Start dev server and smoke-test all pages**

```bash
npm run dev
```

Visit each page and verify:
- `/` — homepage loads
- `/about` — renders (may show hardcoded fallbacks — expected)
- `/architecture` — renders
- `/contact` — form visible, submittable
- `/visit` — etiquette items visible
- `/worshippers` — prayer times visible
- `/events`, `/announcements`, `/services`, `/resources`, `/media`, `/partners` — all load
- `/privacy`, `/terms` — render (hardcoded fallback until Sanity content published)
- `/donate` — FundraiseUp widgets load
- `/studio` — Sanity Studio loads with new sidebar structure

- [ ] **Step 3: Verify Studio sidebar structure**

In Studio, confirm:
- "Site Pages" folder expands to show Homepage, About, Architecture, Visit, Worshippers, Contact, Events (with sub-folders), Announcements, Services, Donate, Imams/Team, Resources, Media, Partners, Privacy, Terms, Custom Pages
- "Prayer Times" singleton visible at root
- "Forms" folder with 5 sub-items
- "Donation Settings" singleton at root
- "Site Settings" singleton at root
- No extra auto-listed document types at the bottom

- [ ] **Step 4: Run migration script against production**

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=<prod-id> NEXT_PUBLIC_SANITY_DATASET=production npx ts-node --project tsconfig.json scripts/migrate-form-settings.ts
```

Verify form data migrated correctly in Studio.

- [ ] **Step 5: Final commit and push**

```bash
git add -A
git commit -m "chore: final cleanup and validation for sanity restructure"
git push origin update/sanity-content-structure
```

- [ ] **Step 6: Open PR**

```bash
gh pr create --title "Sanity Studio restructure — page-centric sidebar, CMS-editable pages" --body "$(cat <<'EOF'
## Summary
- Restructures Sanity Studio sidebar into page-centric folders (Site Pages, Prayer Times, Forms, Donation Settings, Site Settings)
- Adds 14 new page singleton schemas so all hardcoded page content is editable from Studio
- Splits formSettings into 5 focused singletons (Contact Form, Service Inquiry, Event Inquiry, Newsletter, Allowed Domains)
- Refactors /about, /architecture, /contact pages to server+client split and wires to Sanity
- Wires /privacy and /terms to Sanity portable text content
- Adds /partners/[slug] dynamic route, removes hardcoded /partners/aicc page
- Adds drag-and-drop ordering for services, team members, gallery images, partners, resources
- Adds sanity-plugin-media for enhanced asset library
- Enables scheduled publishing (requires Growth plan)
- All hardcoded fallbacks remain so pages never break while Sanity docs are empty

## Test plan
- [ ] `npm run validate` passes (type-check, lint, tests, build)
- [ ] Sanity Studio loads at /studio with correct sidebar structure
- [ ] All pages load without errors
- [ ] Run migration script against production dataset
- [ ] Open each orderable list in Studio and click "Reset Order"
- [ ] Verify form settings data migrated correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Studio sidebar restructure → Task 7
- [x] 14 page singleton schemas → Task 4
- [x] 5 form singleton schemas → Task 5
- [x] seoFields shared object → Task 2
- [x] orderRankField on 5 schemas → Task 6
- [x] sanity-plugin-media → Task 7
- [x] Scheduled publishing → Task 7
- [x] GROQ queries → Task 8
- [x] TypeScript types → Task 9
- [x] Fetch functions → Task 10
- [x] Revalidation route → Task 11
- [x] /about refactor → Task 12
- [x] /architecture refactor → Task 13
- [x] /contact refactor → Task 14
- [x] /privacy and /terms → Task 15
- [x] Wire existing pages → Task 16
- [x] FormSettingsContext update → Task 17
- [x] Partner dynamic route → Task 18
- [x] formSettings migration script → Task 19
- [x] Post-deploy orderable reset → Task 20
- [x] Melbourne timezone on all date fields → included in schema descriptions and PrivacyContent date formatting
- [x] Singleton delete/duplicate protection → Task 7 (`singletonIds` array)
- [x] schema file reorganisation into subfolders → Task 3
- [x] etiquette schema deprecated (hidden from desk) → Task 3 (moved, hidden in desk via not listing it)
- [x] Custom document previews (event, announcement, etc.) → noted in Task 6 for schemas that were updated — add `preview` config to each updated schema
- [x] Better field validation (url, email, character counts) → included inline in schema field definitions throughout Task 4 and 5
