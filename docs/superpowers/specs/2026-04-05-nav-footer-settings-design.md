# Navigation Settings Design Spec

**Date:** 2026-04-05
**Branch:** `feature/nav-footer-settings`
**Scope:** CMS-editable header and footer via two new Sanity singletons, icon picker plugin, operating hours consolidation.

---

## Overview

Make the site header and footer fully configurable from Sanity Studio. Two new singletons (`headerSettings`, `footerSettings`) grouped under a "Navigation Settings" folder in the desk structure. Admins can edit nav groups, announcement bar, CTA buttons, donate cards, Qur'an verse, bottom bar links, and more — all with sensible fallbacks so the site never breaks.

Additionally: install `sanity-plugin-icon-picker` for visual icon selection, consolidate operating hours into a single `siteSettings` field, and remove the redundant `contactPageSettings.operatingHours`.

---

## Desk Structure

```
Content
  ├── Site Pages (existing)
  ├── ──────────
  ├── Navigation Settings        ← NEW folder
  │     ├── Header Settings      ← singleton
  │     └── Footer Settings      ← singleton
  ├── Prayer Times (existing)
  ├── Forms (existing)
  ├── Donation Settings (existing)
  ├── Site Settings (existing)
```

---

## Schema: `headerSettings`

Singleton with `_id == "headerSettings"`.

### Announcement Bar (object: `announcementBar`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `false` | Show/hide the banner |
| `message` | string | — | Banner text |
| `link` | url | — | Optional: makes message clickable |
| `linkText` | string | — | Optional: e.g. "Learn more". If empty, whole message is the link |
| `backgroundColor` | string radio: `teal` \| `gold` \| `lime` \| `red` | `teal` | Banner background colour |
| `dismissable` | boolean | `true` | Show X button to dismiss |

### Top Bar (object: `topBar`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `desktopWelcome` | string | "Welcome to the Australian Islamic Centre" | Desktop welcome text |
| `mobileWelcome` | string | "Welcome to AIC" | Mobile welcome text |
| `visible` | boolean | `true` | Show/hide the top bar |

Admin note: *"Contact info (phone, address) is pulled from Site Settings."*

### CTA Button (object: `ctaButton`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | string | "Donate" | Button text |
| `url` | string (url) | "/donate" | Button link |
| `icon` | iconPicker | Heart | Icon from icon picker plugin |
| `accentColor` | string radio: `lime` \| `gold` \| `teal` | `lime` | Button background colour |

### Menu Donate Card (object: `menuDonateCard`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `heading` | string | "Support Our Community" | Card heading |
| `description` | string | "Your generosity helps us serve the community" | Card subtitle |
| `buttonText` | string | "Donate" | CTA text inside card |
| `url` | string (url) | "/donate" | Card link |
| `visible` | boolean | `true` | Show/hide the card |

### Search

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `showSearch` | boolean | `true` | Show/hide search button |

### Contact Link (object: `contactLink`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | string | "Contact Us" | Standalone link label in mobile menu |
| `url` | string (url) | "/contact" | Link URL |
| `visible` | boolean | `true` | Show/hide |

### Nav Groups (array: `navGroups`)

Orderable array. Pre-seeded with 4 groups matching current hardcoded navigation.

Each item:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `_key` | string | auto | Sanity array key |
| `label` | string | e.g. "About" | Group heading |
| `description` | string | e.g. "Learn about our centre" | Desktop subtitle |
| `icon` | iconPicker | e.g. Users | Group icon (desktop only) |
| `visible` | boolean | `true` | Show/hide entire group |
| `links` | array | — | Orderable links within group |

Each link:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `_key` | string | auto | Sanity array key |
| `label` | string | e.g. "Our Story" | Display name |
| `url` | string | e.g. "/about" | Href path |
| `visible` | boolean | `true` | Show/hide link |

**Pre-seeded groups:**
1. About: Our Story (/about), Our Imams (/imams), Affiliated Partners (/partners)
2. What's On: Events (/events), Services (/services), Announcements (/announcements), Programs (/events#programs)
3. Our Mosque: For Worshippers (/worshippers), Plan Your Visit (/visit), Architecture (/architecture)
4. Media & Resources: Media Gallery (/media), Resources (/resources)

---

## Schema: `footerSettings`

Singleton with `_id == "footerSettings"`.

### Newsletter Section (object: `newsletter`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `visible` | boolean | `true` | Show/hide the newsletter section |

Admin note: *"Newsletter content (heading, description, button text) is configured in Forms → Newsletter."*

### Brand Description

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `brandDescription` | text | "Serving the community through prayer, education, and spiritual growth. A centre welcoming all who seek knowledge and connection." | Paragraph under the logo |

### Operating Hours Note

Read-only description field: *"Operating hours are configured in Site Settings."*

No operating hours fields in this schema — footer reads from `siteSettings.operatingHours`.

### Donate Card (object: `donateCard`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `heading` | string | "Support Us" | Card heading |
| `description` | string | "Support our community programs, services, and the maintenance of our centre." | Card text |
| `buttonText` | string | "Donate Now" | Button label |
| `url` | string (url) | "/donate" | Button link |
| `visible` | boolean | `true` | Show/hide |

### Qur'an Verse (object: `quranVerse`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `arabicText` | text | Current verse (2:261 excerpt) | Arabic text, Amiri font |
| `translation` | text | — | Optional English translation |
| `reference` | string | "Qur'an 2:261" | Surah and verse reference |
| `visible` | boolean | `true` | Show/hide |

### Bottom Bar Links (array: `bottomBarLinks`)

Orderable array. Admins can add, remove, reorder, rename.

Each item:

| Field | Type | Description |
|-------|------|-------------|
| `_key` | string | Sanity array key |
| `label` | string | Display text |
| `url` | string | Href path |

**Pre-seeded:**
1. Privacy Policy → /privacy
2. Terms of Use → /terms
3. Accessibility → /accessibility

### Copyright

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `copyrightText` | string | — | Optional override. Default auto-generates "© {year} {orgName}. All rights reserved." |

### Nav Groups (array: `navGroups`)

Same structure as header nav groups but without `icon` or `description` fields (footer doesn't display those). Independent from header — footer can show different groups/links.

Each item:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `_key` | string | auto | Sanity array key |
| `label` | string | e.g. "About" | Group heading |
| `visible` | boolean | `true` | Show/hide group |
| `links` | array | — | Orderable links |

Each link: same as header (`label`, `url`, `visible`).

**Pre-seeded groups:**
1. About: Our Story, Our Imams, Affiliated Partners
2. What's On: Events, Services, Announcements, Programs
3. Our Mosque: For Worshippers, Plan Your Visit, Architecture
4. Media & Resources: Media Gallery, Resources
5. Get Involved: Donate (/donate), Contact Us (/contact), Volunteer (/contact), Our Partners (/partners)

---

## Schema Modification: `siteSettings`

Replace the current `operatingHours` object (weekdays/weekends/notes) with a single string:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `operatingHours` | string | "Open Daily from Fajr to Isha" | Single operating hours line, used site-wide |

### Migration

The old `operatingHours` object (`{ weekdays, weekends, notes }`) is replaced. The seed script will set the new string value. Existing Sanity data will be overwritten by the new field type on next publish.

---

## Schema Modification: `contactPageSettings`

Remove the `operatingHours` field. The contact page will read operating hours from `siteSettings.operatingHours` via context instead.

---

## Plugin: `sanity-plugin-icon-picker`

### Installation

```bash
npm install sanity-plugin-icon-picker
```

Register in `sanity.config.ts` plugins array.

### Usage

Used in `headerSettings` schema for:
- `navGroups[].icon` — group icon
- `ctaButton.icon` — CTA button icon

The plugin provides a visual icon picker in Studio. Stores a structured value:
```json
{ "provider": "lucide", "name": "Users" }
```

### Frontend Icon Mapping

A lookup utility maps stored icon names to Lucide React components:

```typescript
// src/lib/icon-map.ts
import { Users, Calendar, Landmark, Play, MessageCircle, Heart, ... } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Calendar, Landmark, Play, MessageCircle, Heart, ArrowRight,
  // ... all Lucide icons used on the site
};

export function getIcon(name?: string, fallback?: string): React.ComponentType<{ className?: string }> | null {
  if (name && iconMap[name]) return iconMap[name];
  if (fallback && iconMap[fallback]) return iconMap[fallback];
  return null;
}
```

This avoids importing the entire Lucide library. Only icons in the map are available; unknown names gracefully return the fallback or null.

### Icon Picker Configuration

Configure the plugin to show only Lucide icons (matching our existing icon library):

```typescript
iconPicker({
  providers: ["lucide"],
})
```

---

## Data Flow

```
Sanity Studio
  ↓ publish
Webhook → /api/revalidate → revalidateTag("headerSettings") + revalidateTag("footerSettings")
  ↓
layout.tsx: Promise.all([
  getSiteSettings(),
  getHeaderSettings(),    ← NEW
  getFooterSettings(),    ← NEW
  getNavigationPages(),
  ...
])
  ↓
SiteSettingsProvider receives headerSettings + footerSettings as props
  ↓
Context provides merged data (Sanity values + hardcoded fallbacks)
  ↓
HeaderB.tsx / Footer.tsx consume via useSiteSettings()
```

### Context Changes

Add to `SiteInfo` interface:
- `headerSettings: MergedHeaderSettings` (merged Sanity + defaults)
- `footerSettings: MergedFooterSettings` (merged Sanity + defaults)

`buildSiteInfo()` gains two new optional parameters and merges them with hardcoded defaults.

### GROQ Queries

```groq
// headerSettingsQuery
*[_id == "headerSettings"][0]{
  announcementBar,
  topBar,
  ctaButton,
  menuDonateCard,
  showSearch,
  contactLink,
  navGroups[]{
    _key, label, description, icon, visible,
    links[]{ _key, label, url, visible }
  }
}

// footerSettingsQuery
*[_id == "footerSettings"][0]{
  newsletter,
  brandDescription,
  donateCard,
  quranVerse,
  bottomBarLinks[]{ _key, label, url },
  copyrightText,
  navGroups[]{
    _key, label, visible,
    links[]{ _key, label, url, visible }
  }
}
```

### Fetch Functions

```typescript
// src/sanity/lib/fetch.ts
export async function getHeaderSettings(): Promise<SanityHeaderSettings | null> { ... }
export async function getFooterSettings(): Promise<SanityFooterSettings | null> { ... }
```

Both use `skipCdn: true` and appropriate tags.

---

## Fallback Strategy

Every field has a hardcoded default. The merge happens in `buildSiteInfo()`:

**Header fallbacks** — Current values from `navigation.ts` (nav groups) and `HeaderB.tsx` (welcome text, donate card text, etc.) become the defaults. If `headerSettings` is null, the header renders exactly as it does today.

**Footer fallbacks** — Current values from `navigation.ts` (nav groups) and `Footer.tsx` (operating hours, Qur'an verse, bottom bar links, etc.) become the defaults. If `footerSettings` is null, the footer renders exactly as it does today.

**Operating hours** — `siteSettings.operatingHours ?? "Open Daily from Fajr to Isha"`. Used by both footer and contact page.

---

## Revalidation

Add to `validDocumentTypes` and `documentTypeToPath` in `src/app/api/revalidate/route.ts`:

| Document Type | Path |
|---------------|------|
| `headerSettings` | `/` (affects all pages) |
| `footerSettings` | `/` (affects all pages) |

---

## Seeding

`scripts/seed-nav-settings.ts` — pre-populates both singletons with current hardcoded values using `createIfNotExists` + `setIfMissing`. Safe to re-run.

Seed data matches exactly what's currently hardcoded so deploying this branch changes nothing visually — it just makes everything editable.

Also seeds the simplified `siteSettings.operatingHours` string.

---

## Component Changes

### HeaderB.tsx

- Reads `headerSettings` from context instead of importing `buildHeaderNavGroups`
- Announcement bar rendered conditionally above the top bar
- Top bar welcome text from settings
- CTA button label, URL, icon, colour from settings
- Nav groups from settings (filtered by `visible`), with icon mapping
- Menu donate card from settings
- Search button visibility from settings
- Contact link from settings
- All with fallbacks to current hardcoded values

### Footer.tsx

- Reads `footerSettings` from context instead of importing `buildFooterNavGroups`
- Newsletter section visibility from settings
- Brand description from settings
- Operating hours from `siteSettings.operatingHours`
- Nav groups from settings (filtered by `visible`)
- "Get Involved" group includes partners link (pre-seeded)
- Donate card from settings
- Qur'an verse from settings
- Bottom bar links from settings (dynamic, not hardcoded)
- Copyright text from settings
- Affiliates section removed (folded into Get Involved)

### ContactContent.tsx

- Remove local `operatingHours` variable
- Read from `useSiteSettings().operatingHours`
- Fallback: "Open Daily from Fajr to Isha"

### navigation.ts

- `headerNavGroups` and `footerNavGroups` arrays remain as fallback data
- `buildHeaderNavGroups()` and `buildFooterNavGroups()` still exist but are used only as fallback when settings are null
- Custom nav pages from `pageContent` with `showInNav` are always appended as a final "More" group (header) or "Pages" group (footer) after whatever groups come from settings (or fallback). This logic moves into the context merge so HeaderB/Footer don't need to handle it

### SiteSettingsContext.tsx

- `SiteInfo` gains `headerSettings` and `footerSettings` typed fields
- `buildSiteInfo()` accepts and merges the new settings
- `SiteSettingsProvider` accepts new optional props
- `operatingHours` becomes a simple string field on `SiteInfo`

### layout.tsx

- Fetches `getHeaderSettings()` and `getFooterSettings()` in existing `Promise.all`
- Passes both to `SiteSettingsProvider`

---

## TypeScript Types

```typescript
// src/types/sanity.ts

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
    icon?: { provider?: string; name?: string };
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
  navGroups?: Array<{
    _key: string;
    label?: string;
    description?: string;
    icon?: { provider?: string; name?: string };
    visible?: boolean;
    links?: Array<{
      _key: string;
      label?: string;
      url?: string;
      visible?: boolean;
    }>;
  }>;
}

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
    links?: Array<{
      _key: string;
      label?: string;
      url?: string;
      visible?: boolean;
    }>;
  }>;
}
```

---

## Tests

### Wiring Tests (mandatory per CLAUDE.md)

For each component (HeaderB, Footer, ContactContent):

1. **Sanity data renders** — pass settings, assert custom values appear
2. **Fallback renders** — pass undefined settings, assert hardcoded defaults appear
3. **Partial data** — some fields set, others missing, assert correct mix
4. **Every field individually** — each editable field tested in isolation
5. **Visibility toggles** — `visible: false` hides sections, `visible: true` shows them

### Specific test scenarios

- Announcement bar: enabled shows banner, disabled hides it, dismissable shows X, colours apply
- CTA button: custom label/URL render, icon mapping works, fallback icon on unknown name
- Nav groups: custom groups render, hidden groups excluded, links filtered by visible, custom order preserved
- Footer bottom bar: custom links render in order, empty array shows nothing
- Qur'an verse: custom text renders, hidden when `visible: false`
- Operating hours: site settings value used in both footer and contact page
- Icon picker: valid icon name maps to component, invalid name falls back gracefully

### Navigation builder tests

- Update existing `navigation.test.ts` tests to account for settings-driven groups
- Test that custom `pageContent` pages with `showInNav` still append correctly

---

## Files Changed (Summary)

### New Files
- `src/sanity/schemas/singletons/headerSettings.ts`
- `src/sanity/schemas/singletons/footerSettings.ts`
- `src/lib/icon-map.ts`
- `scripts/seed-nav-settings.ts`

### Modified Files
- `src/sanity/schemas/index.ts` — register new schemas
- `sanity.config.ts` — add Navigation Settings folder, icon picker plugin, singletons
- `src/sanity/lib/queries.ts` — add headerSettingsQuery, footerSettingsQuery
- `src/sanity/lib/fetch.ts` — add getHeaderSettings(), getFooterSettings()
- `src/types/sanity.ts` — add SanityHeaderSettings, SanityFooterSettings, update SanitySiteSettings
- `src/contexts/SiteSettingsContext.tsx` — add headerSettings, footerSettings to context
- `src/app/layout.tsx` — fetch and pass new settings
- `src/components/layout/HeaderB.tsx` — consume settings from context
- `src/components/layout/Footer.tsx` — consume settings from context
- `src/app/contact/ContactContent.tsx` — read operatingHours from context
- `src/data/navigation.ts` — retain as fallback data
- `src/app/api/revalidate/route.ts` — add new document types
- `src/sanity/schemas/singletons/siteSettings.ts` — simplify operatingHours
- `src/sanity/schemas/pages/contactPageSettings.ts` — remove operatingHours field
- `package.json` — add sanity-plugin-icon-picker

### Test Files
- `src/components/layout/HeaderB.test.tsx` — new/updated wiring tests
- `src/components/layout/Footer.test.tsx` — new/updated wiring tests
- `src/app/contact/ContactContent.test.tsx` — update operating hours tests
- `src/data/navigation.test.ts` — update for settings-driven nav
- `src/lib/icon-map.test.ts` — icon mapping tests
