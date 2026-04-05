# Navigation & Footer Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site header and footer fully configurable from Sanity Studio via two new singletons, with icon picker plugin and operating hours consolidation.

**Architecture:** Two new Sanity singletons (`headerSettings`, `footerSettings`) grouped under "Navigation Settings" in the desk. Data flows through `SiteSettingsContext` to `HeaderB.tsx` and `Footer.tsx` with hardcoded fallbacks for every field. The `sanity-plugin-icon-picker` with a custom Lucide provider lets admins pick icons visually.

**Tech Stack:** Sanity v3, Next.js 16 App Router, React 19, sanity-plugin-icon-picker, lucide-react, Vitest + Testing Library

---

### Task 1: Install icon picker plugin and configure

**Files:**
- Modify: `package.json`
- Modify: `sanity.config.ts`

- [ ] **Step 1: Install the plugin**

```bash
npm install sanity-plugin-icon-picker
```

- [ ] **Step 2: Register plugin in sanity.config.ts**

Add the import at the top of `sanity.config.ts`:

```typescript
import { iconPicker } from "sanity-plugin-icon-picker";
```

Add to the `plugins` array (after `media()`):

```typescript
plugins: [
  structureTool({ structure }),
  media(),
  iconPicker(),
  // ... rest of plugins
],
```

- [ ] **Step 3: Verify Studio still loads**

```bash
npm run dev
```

Visit `http://localhost:3000/studio` — confirm no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json sanity.config.ts
git commit -m "chore: install sanity-plugin-icon-picker"
```

---

### Task 2: Create TypeScript types for header and footer settings

**Files:**
- Modify: `src/types/sanity.ts`

- [ ] **Step 1: Add SanityHeaderSettings interface**

Add after the `SanitySiteSettings` interface in `src/types/sanity.ts`:

```typescript
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
```

- [ ] **Step 2: Update SanitySiteSettings — simplify operatingHours**

Replace the existing `operatingHours` type in `SanitySiteSettings`:

```typescript
// Old:
operatingHours?: {
  weekdays?: string;
  weekends?: string;
  notes?: string;
};

// New:
operatingHours?: string;
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

Expected: May see errors in files that reference the old `operatingHours` shape — that's fine, we'll fix those in later tasks.

- [ ] **Step 4: Commit**

```bash
git add src/types/sanity.ts
git commit -m "feat: add TypeScript types for header and footer settings"
```

---

### Task 3: Create headerSettings Sanity schema

**Files:**
- Create: `src/sanity/schemas/singletons/headerSettings.ts`
- Modify: `src/sanity/schemas/index.ts`

- [ ] **Step 1: Create the schema file**

Create `src/sanity/schemas/singletons/headerSettings.ts`:

```typescript
/**
 * Sanity Schema: Header Settings (singleton)
 *
 * Controls the site header: announcement bar, welcome text, CTA button,
 * nav groups with drag-and-drop ordering, search visibility, and donate card.
 *
 * @module sanity/schemas/headerSettings
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "headerSettings",
  title: "Header Settings",
  type: "document",
  fields: [
    // ── 1. Announcement Bar ──
    defineField({
      name: "announcementBar",
      title: "Announcement Bar",
      type: "object",
      description: "A dismissable banner above the header for urgent messages.",
      fields: [
        defineField({
          name: "enabled",
          title: "Enabled",
          type: "boolean",
          initialValue: false,
          description: "Show the announcement bar across all pages.",
        }),
        defineField({
          name: "message",
          title: "Message",
          type: "string",
          description: "The banner text (keep it short — one line).",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "link",
          title: "Link URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          description: "Optional: makes the message clickable.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "linkText",
          title: "Link Text",
          type: "string",
          description: "Optional: e.g. 'Learn more'. If empty, the whole message is the link.",
          hidden: ({ parent }) => !parent?.enabled || !parent?.link,
        }),
        defineField({
          name: "backgroundColor",
          title: "Background Colour",
          type: "string",
          options: {
            list: [
              { title: "Teal", value: "teal" },
              { title: "Gold", value: "gold" },
              { title: "Lime", value: "lime" },
              { title: "Red (Urgent)", value: "red" },
            ],
            layout: "radio",
            direction: "horizontal",
          },
          initialValue: "teal",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "dismissable",
          title: "Dismissable",
          type: "boolean",
          initialValue: true,
          description: "Allow visitors to close the banner with an X button.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
      ],
    }),

    // ── 2. Top Bar ──
    defineField({
      name: "topBar",
      title: "Top Bar",
      type: "object",
      description: "The slim bar above the main header. Contact info (phone, address) is pulled from Site Settings.",
      fields: [
        defineField({
          name: "desktopWelcome",
          title: "Desktop Welcome Text",
          type: "string",
          initialValue: "Welcome to the Australian Islamic Centre",
        }),
        defineField({
          name: "mobileWelcome",
          title: "Mobile Welcome Text",
          type: "string",
          initialValue: "Welcome to AIC",
        }),
        defineField({
          name: "visible",
          title: "Visible",
          type: "boolean",
          initialValue: true,
          description: "Show/hide the top bar.",
        }),
      ],
    }),

    // ── 3. CTA Button ──
    defineField({
      name: "ctaButton",
      title: "CTA Button",
      type: "object",
      description: "The main call-to-action button in the header bar.",
      fields: [
        defineField({
          name: "label",
          title: "Button Label",
          type: "string",
          initialValue: "Donate",
        }),
        defineField({
          name: "url",
          title: "Button URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          initialValue: "/donate",
        }),
        defineField({
          name: "icon",
          title: "Button Icon",
          type: "iconPicker",
          options: {
            storeSvg: true,
          },
        }),
        defineField({
          name: "accentColor",
          title: "Accent Colour",
          type: "string",
          options: {
            list: [
              { title: "Lime", value: "lime" },
              { title: "Gold", value: "gold" },
              { title: "Teal", value: "teal" },
            ],
            layout: "radio",
            direction: "horizontal",
          },
          initialValue: "lime",
        }),
      ],
    }),

    // ── 4. Search ──
    defineField({
      name: "showSearch",
      title: "Show Search Button",
      type: "boolean",
      initialValue: true,
    }),

    // ── 5. Menu Donate Card ──
    defineField({
      name: "menuDonateCard",
      title: "Menu Donate Card",
      type: "object",
      description: "The donate feature card shown inside the navigation overlay.",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Support Our Community" }),
        defineField({ name: "description", title: "Description", type: "string", initialValue: "Your generosity helps us serve the community" }),
        defineField({ name: "buttonText", title: "Button Text", type: "string", initialValue: "Donate" }),
        defineField({
          name: "url",
          title: "URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          initialValue: "/donate",
        }),
        defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
      ],
    }),

    // ── 6. Contact Link ──
    defineField({
      name: "contactLink",
      title: "Contact Link",
      type: "object",
      description: "The standalone Contact link in the mobile menu.",
      fields: [
        defineField({ name: "label", title: "Label", type: "string", initialValue: "Contact Us" }),
        defineField({
          name: "url",
          title: "URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          initialValue: "/contact",
        }),
        defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
      ],
    }),

    // ── 7. Nav Groups ──
    defineField({
      name: "navGroups",
      title: "Navigation Groups",
      type: "array",
      description: "Drag to reorder groups. Each group contains orderable links.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Group Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "description", title: "Description", type: "string", description: "Shown on desktop menu below the group heading." }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "iconPicker",
              options: { storeSvg: true },
              description: "Group icon shown on desktop menu.",
            }),
            defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
                    defineField({
                      name: "url",
                      title: "URL",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                      description: "Path like /about or full URL.",
                    }),
                    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
                  ],
                  preview: {
                    select: { title: "label", subtitle: "url" },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "label", visible: "visible" },
            prepare({ title, visible }: { title?: string; visible?: boolean }) {
              return {
                title: title || "Untitled Group",
                subtitle: visible === false ? "Hidden" : "Visible",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Header Settings" };
    },
  },
});
```

- [ ] **Step 2: Register in schema index**

In `src/sanity/schemas/index.ts`, add after the existing singleton imports:

```typescript
import headerSettings from "./singletons/headerSettings";
```

Add `headerSettings` to the `schemaTypes` array inside the "Global singletons" section:

```typescript
// Global singletons
siteSettings,
homepageSettings,
headerSettings,
// ... rest
```

- [ ] **Step 3: Commit**

```bash
git add src/sanity/schemas/singletons/headerSettings.ts src/sanity/schemas/index.ts
git commit -m "feat: add headerSettings Sanity schema"
```

---

### Task 4: Create footerSettings Sanity schema

**Files:**
- Create: `src/sanity/schemas/singletons/footerSettings.ts`
- Modify: `src/sanity/schemas/index.ts`

- [ ] **Step 1: Create the schema file**

Create `src/sanity/schemas/singletons/footerSettings.ts`:

```typescript
/**
 * Sanity Schema: Footer Settings (singleton)
 *
 * Controls the site footer: brand description, donate card, Qur'an verse,
 * bottom bar links, copyright text, newsletter visibility, and nav groups.
 *
 * @module sanity/schemas/footerSettings
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "footerSettings",
  title: "Footer Settings",
  type: "document",
  fields: [
    // ── 1. Newsletter Section ──
    defineField({
      name: "newsletter",
      title: "Newsletter Section",
      type: "object",
      description: "Newsletter content (heading, description, button text) is configured in Forms → Newsletter.",
      fields: [
        defineField({
          name: "visible",
          title: "Show Newsletter Section",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),

    // ── 2. Brand Description ──
    defineField({
      name: "brandDescription",
      title: "Brand Description",
      type: "text",
      rows: 3,
      description: "Paragraph below the logo in the footer.",
      initialValue: "Serving the community through prayer, education, and spiritual growth. A centre welcoming all who seek knowledge and connection.",
    }),

    // ── 3. Operating Hours Note ──
    defineField({
      name: "operatingHoursNote",
      title: "Operating Hours",
      type: "string",
      readOnly: true,
      description: "Operating hours are configured in Site Settings. The footer displays them automatically.",
      initialValue: "Configured in Site Settings",
    }),

    // ── 4. Donate Card ──
    defineField({
      name: "donateCard",
      title: "Donate Card",
      type: "object",
      description: "The donate call-to-action card in the footer.",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Support Us" }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 2,
          initialValue: "Support our community programs, services, and the maintenance of our centre.",
        }),
        defineField({ name: "buttonText", title: "Button Text", type: "string", initialValue: "Donate Now" }),
        defineField({
          name: "url",
          title: "URL",
          type: "url",
          validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
          initialValue: "/donate",
        }),
        defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
      ],
    }),

    // ── 5. Qur'an Verse ──
    defineField({
      name: "quranVerse",
      title: "Qur'an Verse",
      type: "object",
      fields: [
        defineField({
          name: "arabicText",
          title: "Arabic Text",
          type: "text",
          rows: 3,
          description: "Arabic text displayed with Amiri font.",
        }),
        defineField({
          name: "translation",
          title: "English Translation",
          type: "text",
          rows: 3,
          description: "Optional English translation.",
        }),
        defineField({
          name: "reference",
          title: "Reference",
          type: "string",
          description: "e.g. 'Qur'an 2:261'",
          initialValue: "Qur'an 2:261",
        }),
        defineField({
          name: "visible",
          title: "Visible",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),

    // ── 6. Bottom Bar Links ──
    defineField({
      name: "bottomBarLinks",
      title: "Bottom Bar Links",
      type: "array",
      description: "Links shown in the footer bottom bar (e.g. Privacy, Terms). Drag to reorder.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({
              name: "url",
              title: "URL",
              type: "string",
              validation: (Rule) => Rule.required(),
              description: "Path like /privacy or full URL.",
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        },
      ],
    }),

    // ── 7. Copyright ──
    defineField({
      name: "copyrightText",
      title: "Copyright Text",
      type: "string",
      description: "Optional override. If empty, auto-generates '© {year} {org name}. All rights reserved.'",
    }),

    // ── 8. Nav Groups ──
    defineField({
      name: "navGroups",
      title: "Navigation Groups",
      type: "array",
      description: "Footer navigation columns. Drag to reorder groups.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Group Label", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
                    defineField({
                      name: "url",
                      title: "URL",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
                  ],
                  preview: {
                    select: { title: "label", subtitle: "url" },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "label", visible: "visible" },
            prepare({ title, visible }: { title?: string; visible?: boolean }) {
              return {
                title: title || "Untitled Group",
                subtitle: visible === false ? "Hidden" : "Visible",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Footer Settings" };
    },
  },
});
```

- [ ] **Step 2: Register in schema index**

In `src/sanity/schemas/index.ts`, add after the `headerSettings` import:

```typescript
import footerSettings from "./singletons/footerSettings";
```

Add `footerSettings` to the `schemaTypes` array right after `headerSettings`:

```typescript
headerSettings,
footerSettings,
```

- [ ] **Step 3: Commit**

```bash
git add src/sanity/schemas/singletons/footerSettings.ts src/sanity/schemas/index.ts
git commit -m "feat: add footerSettings Sanity schema"
```

---

### Task 5: Update siteSettings schema and contactPageSettings

**Files:**
- Modify: `src/sanity/schemas/singletons/siteSettings.ts`
- Modify: `src/sanity/schemas/pages/contactPageSettings.ts`

- [ ] **Step 1: Simplify operatingHours in siteSettings**

In `src/sanity/schemas/singletons/siteSettings.ts`, replace the `operatingHours` field definition (lines ~91-99) from:

```typescript
defineField({
  name: "operatingHours",
  title: "Operating Hours",
  type: "object",
  fields: [
    defineField({ name: "weekdays", title: "Weekdays", type: "string", description: "e.g., '9:00 AM - 5:00 PM'" }),
    defineField({ name: "weekends", title: "Weekends", type: "string", description: "e.g., '10:00 AM - 2:00 PM'" }),
    defineField({ name: "notes", title: "Notes", type: "string", description: "e.g., 'Open for all prayer times'" }),
  ],
}),
```

To:

```typescript
defineField({
  name: "operatingHours",
  title: "Operating Hours",
  type: "string",
  description: "Displayed site-wide in the footer and contact page. e.g. 'Open Daily from Fajr to Isha'",
  initialValue: "Open Daily from Fajr to Isha",
}),
```

- [ ] **Step 2: Remove operatingHours from contactPageSettings**

In `src/sanity/schemas/pages/contactPageSettings.ts`, remove the line:

```typescript
defineField({ name: "operatingHours", title: "Operating Hours", type: "string", description: "Hours shown in sidebar (e.g. '4:30 AM – 10:30 PM Daily')" }),
```

- [ ] **Step 3: Commit**

```bash
git add src/sanity/schemas/singletons/siteSettings.ts src/sanity/schemas/pages/contactPageSettings.ts
git commit -m "feat: simplify operatingHours to single string, remove from contactPageSettings"
```

---

### Task 6: Add desk structure, singletons, and revalidation

**Files:**
- Modify: `sanity.config.ts`
- Modify: `src/app/api/revalidate/route.ts`

- [ ] **Step 1: Add to singletonIds in sanity.config.ts**

Add `"headerSettings"` and `"footerSettings"` to the `singletonIds` array:

```typescript
const singletonIds = [
  "siteSettings",
  "homepageSettings",
  "headerSettings",
  "footerSettings",
  // ... rest
```

- [ ] **Step 2: Add Navigation Settings folder to desk structure**

In the `structure` function, add the Navigation Settings folder after the Site Pages divider and before Prayer Times. Replace:

```typescript
S.divider(),

// ── Prayer Times ──
singleton(S, "prayerSettings", "Prayer Times"),
```

With:

```typescript
S.divider(),

// ── Navigation Settings ──
S.listItem()
  .title("Navigation Settings")
  .child(
    S.list()
      .title("Navigation Settings")
      .items([
        singleton(S, "headerSettings", "Header Settings"),
        singleton(S, "footerSettings", "Footer Settings"),
      ])
  ),

// ── Prayer Times ──
singleton(S, "prayerSettings", "Prayer Times"),
```

- [ ] **Step 3: Add previewPaths entries**

Add to the `previewPaths` object:

```typescript
headerSettings: () => "/",
footerSettings: () => "/",
```

- [ ] **Step 4: Add to revalidation webhook**

In `src/app/api/revalidate/route.ts`, add to `validDocumentTypes`:

```typescript
"headerSettings",
"footerSettings",
```

Add to `documentTypeToPath`:

```typescript
headerSettings: ["/"],
footerSettings: ["/"],
```

- [ ] **Step 5: Commit**

```bash
git add sanity.config.ts src/app/api/revalidate/route.ts
git commit -m "feat: add Navigation Settings desk structure and revalidation"
```

---

### Task 7: Add GROQ queries and fetch functions

**Files:**
- Modify: `src/sanity/lib/queries.ts`
- Modify: `src/sanity/lib/fetch.ts`

- [ ] **Step 1: Add queries**

Add at the end of `src/sanity/lib/queries.ts`, before the form singleton queries section:

```typescript
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
      links[]{ _key, label, url, visible }
    }
  }
`;

export const footerSettingsQuery = groq`
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
`;
```

- [ ] **Step 2: Remove operatingHours from contactPageSettingsQuery**

In the `contactPageSettingsQuery`, remove `operatingHours` from the projection:

```groq
// Before:
sidebarVisible, operatingHours,

// After:
sidebarVisible,
```

- [ ] **Step 3: Add fetch functions**

In `src/sanity/lib/fetch.ts`, add the imports at the top:

```typescript
import {
  // ... existing imports
  headerSettingsQuery,
  footerSettingsQuery,
} from "./queries";
import {
  // ... existing imports
  SanityHeaderSettings,
  SanityFooterSettings,
} from "@/types/sanity";
```

Add the fetch functions after the existing singleton fetch functions:

```typescript
// ── Navigation Settings ──

export async function getHeaderSettings(): Promise<SanityHeaderSettings | null> {
  try {
    return await sanityFetch<SanityHeaderSettings | null>(headerSettingsQuery, {}, ["headerSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}

export async function getFooterSettings(): Promise<SanityFooterSettings | null> {
  try {
    return await sanityFetch<SanityFooterSettings | null>(footerSettingsQuery, {}, ["footerSettings"], { skipCdn: true });
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/sanity/lib/queries.ts src/sanity/lib/fetch.ts
git commit -m "feat: add GROQ queries and fetch functions for nav settings"
```

---

### Task 8: Create icon map utility

**Files:**
- Create: `src/lib/icon-map.ts`
- Create: `src/lib/icon-map.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/icon-map.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getIcon } from "./icon-map";

describe("getIcon", () => {
  it("returns a component for a known icon name", () => {
    const Icon = getIcon("Heart");
    expect(Icon).toBeDefined();
    expect(typeof Icon).toBe("function");
  });

  it("returns null for an unknown icon name", () => {
    const Icon = getIcon("NonExistentIcon12345");
    expect(Icon).toBeNull();
  });

  it("returns fallback icon when primary is unknown", () => {
    const Icon = getIcon("NonExistent", "Heart");
    expect(Icon).toBeDefined();
  });

  it("returns null when both primary and fallback are unknown", () => {
    const Icon = getIcon("NonExistent", "AlsoNonExistent");
    expect(Icon).toBeNull();
  });

  it("returns null when name is undefined", () => {
    const Icon = getIcon(undefined);
    expect(Icon).toBeNull();
  });

  it("maps all expected nav group icons", () => {
    const navIcons = ["Users", "Calendar", "Landmark", "Play", "MessageCircle", "ArrowRight"];
    for (const name of navIcons) {
      expect(getIcon(name)).toBeDefined();
    }
  });

  it("maps Heart icon for CTA button default", () => {
    expect(getIcon("Heart")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/icon-map.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create the icon map**

Create `src/lib/icon-map.ts`:

```typescript
/**
 * Icon Map
 *
 * Maps Sanity icon picker string names to Lucide React components.
 * Only icons that are actually used on the site are included to keep
 * the bundle lean. Unknown names gracefully return null.
 *
 * @module lib/icon-map
 */
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Calendar,
  Landmark,
  Play,
  MessageCircle,
  Heart,
  ArrowRight,
  Plus,
  Menu,
  X,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Star,
  BookOpen,
  GraduationCap,
  Home,
  Info,
  Settings,
  Globe,
  HandHeart,
  Megaphone,
  Newspaper,
  Camera,
  Download,
  FileText,
  Shield,
  Scale,
  Accessibility,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Landmark,
  Play,
  MessageCircle,
  Heart,
  ArrowRight,
  Plus,
  Menu,
  X,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Star,
  BookOpen,
  GraduationCap,
  Home,
  Info,
  Settings,
  Globe,
  HandHeart,
  Megaphone,
  Newspaper,
  Camera,
  Download,
  FileText,
  Shield,
  Scale,
  Accessibility,
};

/**
 * Look up a Lucide icon by name. Returns the component or null if not found.
 * Supports an optional fallback name.
 */
export function getIcon(name?: string, fallback?: string): LucideIcon | null {
  if (name && iconMap[name]) return iconMap[name];
  if (fallback && iconMap[fallback]) return iconMap[fallback];
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/icon-map.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/icon-map.ts src/lib/icon-map.test.ts
git commit -m "feat: add icon map utility for Sanity icon picker"
```

---

### Task 9: Update SiteSettingsContext with header/footer settings

**Files:**
- Modify: `src/contexts/SiteSettingsContext.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update SiteInfo interface and buildSiteInfo**

In `src/contexts/SiteSettingsContext.tsx`:

Add imports:

```typescript
import type { SanitySiteSettings, SanityHeaderSettings, SanityFooterSettings } from "@/types/sanity";
```

Update `SiteInfo` interface — change `operatingHours` from object to string and add header/footer settings:

```typescript
export interface SiteInfo {
  name: string;
  shortName: string;
  tagline: string;
  parentOrganization: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    full: string;
  };
  phone: string;
  email: string;
  googleMapsUrl?: string;
  operatingHours: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  externalLinks: {
    college: string;
    bookstore: string;
    newportStorm: string;
  };
  customNavPages: CustomNavPage[];
  headerSettings: SanityHeaderSettings | null;
  footerSettings: SanityFooterSettings | null;
}
```

Update `buildSiteInfo()` signature and body:

```typescript
export function buildSiteInfo(
  settings: SanitySiteSettings | null,
  customNavPages: CustomNavPage[] = [],
  headerSettings: SanityHeaderSettings | null = null,
  footerSettings: SanityFooterSettings | null = null,
): SiteInfo {
  // ... existing address logic ...

  return {
    // ... existing fields ...
    operatingHours: (typeof settings?.operatingHours === "string"
      ? settings.operatingHours
      : null) ?? "Open Daily from Fajr to Isha",
    // ... existing socialMedia, externalLinks, customNavPages ...
    headerSettings,
    footerSettings,
  };
}
```

Update `SiteSettingsProvider` props and call:

```typescript
export function SiteSettingsProvider({
  siteSettings,
  customNavPages,
  headerSettings,
  footerSettings,
  children,
}: {
  siteSettings: SanitySiteSettings | null;
  customNavPages?: CustomNavPage[];
  headerSettings?: SanityHeaderSettings | null;
  footerSettings?: SanityFooterSettings | null;
  children: React.ReactNode;
}) {
  const info = buildSiteInfo(siteSettings, customNavPages, headerSettings ?? null, footerSettings ?? null);
  return (
    <SiteSettingsContext.Provider value={info}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
```

Update the default context value:

```typescript
const SiteSettingsContext = createContext<SiteInfo>(buildSiteInfo(null));
```

- [ ] **Step 2: Update layout.tsx to fetch and pass new settings**

In `src/app/layout.tsx`:

Add imports:

```typescript
import { getSiteSettings, getDonationSettings, getContactFormSettings, getServiceInquiryFormSettings, getNewsletterSettings, getNavigationPages, getHeaderSettings, getFooterSettings } from "@/sanity/lib/fetch";
```

Update the `Promise.all` call:

```typescript
const [{ isEnabled: isDraftMode }, siteSettings, donationSettings, contactFormSettingsRaw, serviceInquiryFormSettingsRaw, newsletterSettingsRaw, liveStream, navigationPages, headerSettings, footerSettings] = await Promise.all([
  draftMode(),
  getSiteSettings(),
  getDonationSettings(),
  getContactFormSettings(),
  getServiceInquiryFormSettings(),
  getNewsletterSettings(),
  getYouTubeLiveStream(),
  getNavigationPages(),
  getHeaderSettings(),
  getFooterSettings(),
]);
```

Update `SiteSettingsProvider`:

```typescript
<SiteSettingsProvider
  siteSettings={siteSettings}
  customNavPages={navigationPages.map(p => ({ title: p.title, slug: p.slug, navLabel: p.navLabel }))}
  headerSettings={headerSettings}
  footerSettings={footerSettings}
>
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

Fix any remaining type errors from the `operatingHours` change.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/SiteSettingsContext.tsx src/app/layout.tsx
git commit -m "feat: wire header and footer settings through context"
```

---

### Task 10: Update HeaderB.tsx to consume settings from context

**Files:**
- Modify: `src/components/layout/HeaderB.tsx`

- [ ] **Step 1: Add imports and read settings**

Add import at the top:

```typescript
import { getIcon } from "@/lib/icon-map";
import { headerNavGroups } from "@/data/navigation";
```

Inside the component, after `const info = useSiteSettings();`, add:

```typescript
const hs = info.headerSettings;

// Merge nav groups: Sanity settings → fallback to hardcoded → append custom pages
const baseGroups = (hs?.navGroups && hs.navGroups.length > 0)
  ? hs.navGroups
    .filter(g => g.visible !== false)
    .map(g => ({
      label: g.label || "",
      links: (g.links || [])
        .filter(l => l.visible !== false)
        .map(l => ({ name: l.label || "", href: l.url || "#" })),
    }))
  : headerNavGroups;

// Append custom pages from pageContent with showInNav
const customPageGroup = (info.customNavPages && info.customNavPages.length > 0)
  ? [{
      label: "More",
      links: info.customNavPages.map(p => ({
        name: p.navLabel || p.title,
        href: `/${p.slug}`,
      })),
    }]
  : [];

const navGroups = [...baseGroups, ...customPageGroup];
```

Remove the old import and usage:

```typescript
// Remove this:
import { buildHeaderNavGroups } from "@/data/navigation";
// Remove this:
const navGroups = buildHeaderNavGroups(info.customNavPages);
```

- [ ] **Step 2: Add announcement bar**

Before the top bar `<div>`, add:

```tsx
{/* ===== Announcement Bar ===== */}
{hs?.announcementBar?.enabled && hs.announcementBar.message && (
  <AnnouncementBar
    message={hs.announcementBar.message}
    link={hs.announcementBar.link}
    linkText={hs.announcementBar.linkText}
    backgroundColor={hs.announcementBar.backgroundColor ?? "teal"}
    dismissable={hs.announcementBar.dismissable !== false}
  />
)}
```

Add the `AnnouncementBar` component before the `HeaderB` export:

```tsx
function AnnouncementBar({
  message,
  link,
  linkText,
  backgroundColor,
  dismissable,
}: {
  message: string;
  link?: string;
  linkText?: string;
  backgroundColor: string;
  dismissable: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const bgColors: Record<string, string> = {
    teal: "bg-teal-600",
    gold: "bg-amber-500 text-neutral-900",
    lime: "bg-lime-500 text-neutral-900",
    red: "bg-red-600",
  };

  const content = link ? (
    linkText ? (
      <span>
        {message}{" "}
        <a href={link} className="underline font-semibold hover:no-underline">
          {linkText}
        </a>
      </span>
    ) : (
      <a href={link} className="underline hover:no-underline">
        {message}
      </a>
    )
  ) : (
    <span>{message}</span>
  );

  return (
    <div className={cn("relative text-white text-sm text-center py-2 px-6", bgColors[backgroundColor] || bgColors.teal)}>
      <div className="max-w-7xl mx-auto">{content}</div>
      {dismissable && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire top bar welcome text**

Replace the hardcoded welcome text in the desktop top bar:

```tsx
// Desktop:
<span className="text-white/70">{hs?.topBar?.desktopWelcome ?? "Welcome to the Australian Islamic Centre"}</span>

// Mobile:
<span className="text-white/70">{hs?.topBar?.mobileWelcome ?? "Welcome to AIC"}</span>
```

Wrap both top bars with the visibility toggle:

```tsx
{(hs?.topBar?.visible !== false) && (
  <>
    {/* Desktop top bar */}
    <div className="hidden lg:block bg-neutral-900 text-white/90 py-2">
      ...
    </div>
    {/* Mobile top bar */}
    <div className="lg:hidden bg-neutral-900 text-white py-2 px-4">
      ...
    </div>
  </>
)}
```

- [ ] **Step 4: Wire CTA button**

Replace the hardcoded Donate button:

```tsx
<Link
  href={hs?.ctaButton?.url ?? "/donate"}
  className={cn(
    "flex items-center gap-2 h-16 px-4 sm:px-6 font-semibold transition-all duration-200 text-sm sm:text-base",
    {
      "bg-lime-500 hover:bg-lime-600 text-neutral-900": (hs?.ctaButton?.accentColor ?? "lime") === "lime",
      "bg-amber-500 hover:bg-amber-600 text-neutral-900": hs?.ctaButton?.accentColor === "gold",
      "bg-teal-600 hover:bg-teal-700 text-white": hs?.ctaButton?.accentColor === "teal",
    }
  )}
>
  <Heart className="w-4 h-4" />
  <span>{hs?.ctaButton?.label ?? "Donate"}</span>
</Link>
```

Note: For the icon, we keep the Heart component as default since the icon picker SVG rendering would add complexity. The icon picker value can be used when `storeSvg` is enabled — render via `dangerouslySetInnerHTML` with the stored SVG string.

- [ ] **Step 5: Wire search visibility**

Wrap the search button:

```tsx
{(hs?.showSearch !== false) && (
  <button onClick={() => setSearchOpen(true)} ...>
    <Search className="w-5 h-5" />
  </button>
)}
```

- [ ] **Step 6: Wire menu donate card**

Replace hardcoded text in both mobile and desktop donate cards:

```tsx
{(hs?.menuDonateCard?.visible !== false) && (
  <motion.div variants={menuItemVariants} className="mt-8">
    <Link
      href={hs?.menuDonateCard?.url ?? "/donate"}
      onClick={() => handleOverlayNavClick(hs?.menuDonateCard?.url ?? "/donate")}
      className="group/donate flex items-center justify-between gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-lime-500/15 to-green-500/10 border border-lime-500/20 hover:border-lime-400/40 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-500/20">
          <Heart className="w-5 h-5 text-lime-400" />
        </div>
        <div>
          <span className="block text-base font-semibold text-white">
            {hs?.menuDonateCard?.heading ?? "Support Our Community"}
          </span>
          <span className="block text-sm text-white/40">
            {hs?.menuDonateCard?.description ?? "Your generosity helps us serve the community"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
        <span className="hidden sm:inline">{hs?.menuDonateCard?.buttonText ?? "Donate"}</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/donate:translate-x-1" />
      </div>
    </Link>
  </motion.div>
)}
```

- [ ] **Step 7: Wire contact link**

Replace hardcoded Contact Us link in mobile menu:

```tsx
{(hs?.contactLink?.visible !== false) && (
  <motion.div variants={menuItemVariants} className="border-b border-white/10">
    <Link
      href={hs?.contactLink?.url ?? "/contact"}
      onClick={() => handleOverlayNavClick(hs?.contactLink?.url ?? "/contact")}
      className={cn(
        "block py-4 text-2xl font-bold transition-colors",
        isActive(hs?.contactLink?.url ?? "/contact")
          ? "text-lime-400"
          : "text-white hover:text-white/80",
      )}
    >
      {hs?.contactLink?.label ?? "Contact Us"}
    </Link>
  </motion.div>
)}
```

- [ ] **Step 8: Wire desktop panel group icons from settings**

Update the desktop nav grid to use settings icons (falling back to `groupMeta`):

```tsx
{navGroups.map((group) => {
  const meta = groupMeta[group.label];
  // Try to get icon from Sanity settings
  const sanityGroup = hs?.navGroups?.find(g => g.label === group.label);
  const SanityIcon = getIcon(sanityGroup?.icon?.name);
  const Icon = SanityIcon || meta?.icon;
  const description = sanityGroup?.description || meta?.description;

  return (
    <motion.div key={group.label} variants={groupItemVariants}>
      <div className="flex items-center gap-2.5 mb-3">
        {Icon && <Icon className="w-4 h-4 text-lime-400/70" />}
        <h2 className="text-sm font-semibold tracking-wider uppercase text-white/50">
          {group.label}
        </h2>
      </div>
      {description && (
        <p className="text-xs text-white/30 mb-2 -mt-1">{description}</p>
      )}
      <ul className="space-y-0.5">
        {group.links.map((link) => (
          <NavLinkItem
            key={link.href}
            href={link.href}
            name={link.name}
            active={isActive(link.href)}
            onClick={() => handleOverlayNavClick(link.href)}
          />
        ))}
      </ul>
    </motion.div>
  );
})}
```

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/HeaderB.tsx
git commit -m "feat: wire HeaderB to consume header settings from context"
```

---

### Task 11: Update Footer.tsx to consume settings from context

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Read footer settings and merge with fallbacks**

Inside the `Footer` component, after `const info = useSiteSettings();`:

```typescript
const fs = info.footerSettings;

// Merge nav groups from settings or fallback
const footerNavData = (fs?.navGroups && fs.navGroups.length > 0)
  ? fs.navGroups
    .filter(g => g.visible !== false)
    .map(g => ({
      label: g.label || "",
      links: (g.links || [])
        .filter(l => l.visible !== false)
        .map(l => ({ name: l.label || "", href: l.url || "#" })),
    }))
  : buildFooterNavGroups(info.customNavPages);

// Append custom pages if using Sanity groups
const customPageGroup = (fs?.navGroups && fs.navGroups.length > 0 && info.customNavPages && info.customNavPages.length > 0)
  ? [{
      label: "Pages",
      links: info.customNavPages.map(p => ({
        name: p.navLabel || p.title,
        href: `/${p.slug}`,
      })),
    }]
  : [];

const navGroups = [...footerNavData, ...customPageGroup];
```

Remove the old usage:

```typescript
// Remove:
const navGroups = buildFooterNavGroups(info.customNavPages);
```

- [ ] **Step 2: Wire newsletter visibility**

Wrap the newsletter section:

```tsx
{(fs?.newsletter?.visible !== false) && (
  <div className="relative border-b border-white/10">
    {/* Newsletter content */}
  </div>
)}
```

- [ ] **Step 3: Wire brand description**

Replace the hardcoded paragraph:

```tsx
<p className="text-white/80 mb-6 leading-relaxed">
  {fs?.brandDescription ?? `${info.tagline}. A centre for prayer, education, and community building, welcoming all who seek knowledge and spiritual growth.`}
</p>
```

- [ ] **Step 4: Wire operating hours from site settings**

Replace the hardcoded hours:

```tsx
<div className="flex items-start gap-3">
  <Clock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
  <p className="text-white/80">{info.operatingHours}</p>
</div>
```

- [ ] **Step 5: Wire donate card**

```tsx
{(fs?.donateCard?.visible !== false) && (
  <div>
    <h4 className="font-semibold text-lg mb-6">{fs?.donateCard?.heading ?? "Support Us"}</h4>
    <div className="p-4 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30">
      <p className="text-sm text-white/80 mb-3">
        {fs?.donateCard?.description ?? "Support our community programs, services, and the maintenance of our centre."}
      </p>
      <Button href={fs?.donateCard?.url ?? "/donate"} variant="gold" size="sm" icon={<Heart className="w-4 h-4" />}>
        {fs?.donateCard?.buttonText ?? "Donate Now"}
      </Button>
    </div>
```

- [ ] **Step 6: Wire Qur'an verse**

```tsx
{(fs?.quranVerse?.visible !== false) && (
  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
    <p className="text-white/70 text-sm font-arabic text-center leading-relaxed">
      &ldquo;{fs?.quranVerse?.arabicText ?? "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ"}&rdquo;
    </p>
    {fs?.quranVerse?.translation && (
      <p className="text-white/50 text-xs text-center mt-2 italic">
        {fs.quranVerse.translation}
      </p>
    )}
    <p className="text-white/60 text-xs text-center mt-2">{fs?.quranVerse?.reference ?? "Qur\u2019an 2:261"}</p>
  </div>
)}
```

- [ ] **Step 7: Wire bottom bar links**

Replace the hardcoded Privacy/Terms/Accessibility links:

```tsx
<div className="flex items-center gap-6">
  {(fs?.bottomBarLinks && fs.bottomBarLinks.length > 0)
    ? fs.bottomBarLinks.map((link) => (
        <Link key={link._key} href={link.url || "#"} className="hover:text-teal-400 transition-colors">
          {link.label}
        </Link>
      ))
    : (
      <>
        <Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-teal-400 transition-colors">Terms of Use</Link>
        <Link href="/accessibility" className="hover:text-teal-400 transition-colors">Accessibility</Link>
      </>
    )
  }
</div>
```

- [ ] **Step 8: Wire copyright text**

```tsx
<p>&copy; {currentYear} {fs?.copyrightText ?? `${info.name}. All rights reserved.`}</p>
```

- [ ] **Step 9: Remove affiliates section (folded into Get Involved)**

Remove the entire "Affiliates" heading and `affiliateLinks` mapping. Remove the `buildAffiliateLinks` import if no longer used.

- [ ] **Step 10: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: wire Footer to consume footer settings from context"
```

---

### Task 12: Update ContactContent to use site-wide operating hours

**Files:**
- Modify: `src/app/contact/ContactContent.tsx`
- Modify: `src/types/sanity.ts` (if needed for SanityContactPageSettings)

- [ ] **Step 1: Update contact content to read from context**

In `src/app/contact/ContactContent.tsx`, replace:

```typescript
const operatingHours = settings?.operatingHours ?? "4:30 AM \u2013 10:30 PM Daily";
```

With:

```typescript
const operatingHours = info.operatingHours;
```

The `info.operatingHours` already defaults to "Open Daily from Fajr to Isha" in the context.

- [ ] **Step 2: Remove operatingHours from SanityContactPageSettings type**

In `src/types/sanity.ts`, remove `operatingHours` from the `SanityContactPageSettings` interface.

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

Expected: PASS — no more references to the old operatingHours shape.

- [ ] **Step 4: Commit**

```bash
git add src/app/contact/ContactContent.tsx src/types/sanity.ts
git commit -m "fix: use site-wide operating hours in contact page"
```

---

### Task 13: Update tests — HeaderB

**Files:**
- Modify: `src/components/layout/HeaderB.test.tsx`

- [ ] **Step 1: Update the SiteSettings mock to include headerSettings and footerSettings**

Update the mock in `HeaderB.test.tsx`:

```typescript
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    name: "Australian Islamic Centre",
    shortName: "AIC",
    tagline: "A unique Islamic environment",
    parentOrganization: "Newport Islamic Society",
    phone: "03 9000 0177",
    email: "contact@australianislamiccentre.org",
    address: {
      street: "23-27 Blenheim Rd",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
      full: "23-27 Blenheim Rd, Newport VIC 3015",
    },
    operatingHours: "Open Daily from Fajr to Isha",
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/aic",
    },
    externalLinks: {
      college: "https://aicollege.edu.au",
      bookstore: "https://aicbookstore.com.au",
      newportStorm: "https://newportstorm.com.au",
    },
    customNavPages: [],
    headerSettings: null,
    footerSettings: null,
  }),
  SiteSettingsProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
```

- [ ] **Step 2: Add mock for icon-map**

```typescript
vi.mock("@/lib/icon-map", () => ({
  getIcon: () => null,
}));
```

- [ ] **Step 3: Add tests for header settings wiring**

```typescript
describe("Header settings wiring", () => {
  it("renders fallback welcome text when headerSettings is null", () => {
    render(<HeaderB />);
    expect(screen.getByText("Welcome to the Australian Islamic Centre")).toBeInTheDocument();
    expect(screen.getByText("Welcome to AIC")).toBeInTheDocument();
  });

  it("renders fallback CTA label when headerSettings is null", () => {
    render(<HeaderB />);
    const donateLinks = screen.getAllByRole("link", { name: /Donate/i });
    expect(donateLinks.length).toBeGreaterThan(0);
  });

  it("renders search button when headerSettings is null (default visible)", () => {
    render(<HeaderB />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/components/layout/HeaderB.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/HeaderB.test.tsx
git commit -m "test: update HeaderB tests for settings wiring"
```

---

### Task 14: Update tests — Footer

**Files:**
- Modify: `src/components/layout/Footer.test.tsx`

- [ ] **Step 1: Update context mocks**

Add `operatingHours`, `customNavPages`, `headerSettings`, `footerSettings` to the SiteSettings mock (via the `aicInfo` mock or by adding a direct mock):

```typescript
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    name: "Australian Islamic Centre",
    shortName: "AIC",
    tagline: "A beacon of faith and knowledge",
    phone: "(03) 9391 9303",
    email: "contact@australianislamiccentre.org",
    address: {
      street: "15 Corporate Crescent",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
      full: "15 Corporate Crescent, Newport VIC 3015",
    },
    operatingHours: "Open Daily from Fajr to Isha",
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/aic",
    },
    externalLinks: {
      college: "https://aicollege.edu.au",
      bookstore: "https://aicbookstore.com.au",
      newportStorm: "https://newportstorm.com.au",
    },
    customNavPages: [],
    headerSettings: null,
    footerSettings: null,
  }),
  SiteSettingsProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
```

- [ ] **Step 2: Add wiring tests**

```typescript
describe("Footer settings wiring", () => {
  it("renders operating hours from site settings", () => {
    render(<Footer />);
    expect(screen.getByText("Open Daily from Fajr to Isha")).toBeInTheDocument();
  });

  it("renders fallback bottom bar links when footerSettings is null", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Terms of Use/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Accessibility/i })).toBeInTheDocument();
  });

  it("renders fallback Qur'an verse reference when footerSettings is null", () => {
    render(<Footer />);
    expect(screen.getByText(/Qur'an 2:261/)).toBeInTheDocument();
  });

  it("renders fallback donate card when footerSettings is null", () => {
    render(<Footer />);
    expect(screen.getByText("Support Us")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Donate Now/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Update any tests that check for affiliate links**

If the affiliates section has been removed (folded into Get Involved), update tests that assert on "Affiliates" heading or affiliate links. The "Our Partners" link should now be in the "Get Involved" group instead.

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/components/layout/Footer.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Footer.test.tsx
git commit -m "test: update Footer tests for settings wiring"
```

---

### Task 15: Update ContactContent test

**Files:**
- Modify: `src/app/contact/ContactContent.test.tsx`

- [ ] **Step 1: Update mock to include operatingHours**

Update the `useSiteSettings` mock:

```typescript
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    phone: "+61 3 9391 1933",
    email: "info@aic.org.au",
    address: { full: "23-27 Blenheim Road, Newport VIC 3015" },
    operatingHours: "Open Daily from Fajr to Isha",
    socialMedia: { facebook: "#", instagram: "#", youtube: "#" },
  }),
}));
```

- [ ] **Step 2: Add test for operating hours from context**

```typescript
it("renders operating hours from site settings context", () => {
  render(<ContactContent settings={null} />);
  expect(screen.getByText("Open Daily from Fajr to Isha")).toBeInTheDocument();
});
```

- [ ] **Step 3: Remove any tests that check for the old "4:30 AM – 10:30 PM Daily" value**

Search for `operatingHours` in the test file and update or remove references to the contactPageSettings-level operating hours.

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/app/contact/ContactContent.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/contact/ContactContent.test.tsx
git commit -m "test: update contact tests for site-wide operating hours"
```

---

### Task 16: Create seed script

**Files:**
- Create: `scripts/seed-nav-settings.ts`

- [ ] **Step 1: Create the seed script**

Create `scripts/seed-nav-settings.ts`:

```typescript
/**
 * Seed Navigation Settings
 *
 * Pre-populates headerSettings and footerSettings singletons with current
 * hardcoded values. Also updates siteSettings.operatingHours to the new
 * simple string format. Safe to re-run (uses createIfNotExists + setIfMissing).
 *
 * Usage: npx tsx scripts/seed-nav-settings.ts
 */
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

async function main() {
  console.log("🔧 Seeding navigation settings...\n");

  // ── Header Settings ──
  await client.createIfNotExists({
    _id: "headerSettings",
    _type: "headerSettings",
  });

  await client
    .patch("headerSettings")
    .setIfMissing({
      announcementBar: {
        enabled: false,
        dismissable: true,
        backgroundColor: "teal",
      },
      topBar: {
        desktopWelcome: "Welcome to the Australian Islamic Centre",
        mobileWelcome: "Welcome to AIC",
        visible: true,
      },
      ctaButton: {
        label: "Donate",
        url: "/donate",
        accentColor: "lime",
      },
      showSearch: true,
      menuDonateCard: {
        heading: "Support Our Community",
        description: "Your generosity helps us serve the community",
        buttonText: "Donate",
        url: "/donate",
        visible: true,
      },
      contactLink: {
        label: "Contact Us",
        url: "/contact",
        visible: true,
      },
      navGroups: [
        {
          _key: "about",
          label: "About",
          description: "Learn about our centre",
          visible: true,
          links: [
            { _key: "story", label: "Our Story", url: "/about", visible: true },
            { _key: "imams", label: "Our Imams", url: "/imams", visible: true },
            { _key: "partners", label: "Affiliated Partners", url: "/partners", visible: true },
          ],
        },
        {
          _key: "whatson",
          label: "What's On",
          description: "Events, services & programs",
          visible: true,
          links: [
            { _key: "events", label: "Events", url: "/events", visible: true },
            { _key: "services", label: "Services", url: "/services", visible: true },
            { _key: "announcements", label: "Announcements", url: "/announcements", visible: true },
            { _key: "programs", label: "Programs", url: "/events#programs", visible: true },
          ],
        },
        {
          _key: "mosque",
          label: "Our Mosque",
          description: "Prayer, worship & visiting",
          visible: true,
          links: [
            { _key: "worshippers", label: "For Worshippers", url: "/worshippers", visible: true },
            { _key: "visit", label: "Plan Your Visit", url: "/visit", visible: true },
            { _key: "architecture", label: "Architecture", url: "/architecture", visible: true },
          ],
        },
        {
          _key: "media",
          label: "Media & Resources",
          description: "Gallery & downloads",
          visible: true,
          links: [
            { _key: "gallery", label: "Media Gallery", url: "/media", visible: true },
            { _key: "resources", label: "Resources", url: "/resources", visible: true },
          ],
        },
      ],
    })
    .commit();
  console.log("✅ Header settings seeded");

  // ── Footer Settings ──
  await client.createIfNotExists({
    _id: "footerSettings",
    _type: "footerSettings",
  });

  await client
    .patch("footerSettings")
    .setIfMissing({
      newsletter: { visible: true },
      brandDescription:
        "Serving the community through prayer, education, and spiritual growth. A centre welcoming all who seek knowledge and connection.",
      donateCard: {
        heading: "Support Us",
        description: "Support our community programs, services, and the maintenance of our centre.",
        buttonText: "Donate Now",
        url: "/donate",
        visible: true,
      },
      quranVerse: {
        arabicText:
          "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ",
        reference: "Qur'an 2:261",
        visible: true,
      },
      bottomBarLinks: [
        { _key: "privacy", label: "Privacy Policy", url: "/privacy" },
        { _key: "terms", label: "Terms of Use", url: "/terms" },
        { _key: "accessibility", label: "Accessibility", url: "/accessibility" },
      ],
      navGroups: [
        {
          _key: "about",
          label: "About",
          visible: true,
          links: [
            { _key: "story", label: "Our Story", url: "/about", visible: true },
            { _key: "imams", label: "Our Imams", url: "/imams", visible: true },
            { _key: "partners", label: "Affiliated Partners", url: "/partners", visible: true },
          ],
        },
        {
          _key: "whatson",
          label: "What's On",
          visible: true,
          links: [
            { _key: "events", label: "Events", url: "/events", visible: true },
            { _key: "services", label: "Services", url: "/services", visible: true },
            { _key: "announcements", label: "Announcements", url: "/announcements", visible: true },
            { _key: "programs", label: "Programs", url: "/events#programs", visible: true },
          ],
        },
        {
          _key: "mosque",
          label: "Our Mosque",
          visible: true,
          links: [
            { _key: "worshippers", label: "For Worshippers", url: "/worshippers", visible: true },
            { _key: "visit", label: "Plan Your Visit", url: "/visit", visible: true },
            { _key: "architecture", label: "Architecture", url: "/architecture", visible: true },
          ],
        },
        {
          _key: "media",
          label: "Media & Resources",
          visible: true,
          links: [
            { _key: "gallery", label: "Media Gallery", url: "/media", visible: true },
            { _key: "resources", label: "Resources", url: "/resources", visible: true },
          ],
        },
        {
          _key: "involved",
          label: "Get Involved",
          visible: true,
          links: [
            { _key: "donate", label: "Donate", url: "/donate", visible: true },
            { _key: "contact", label: "Contact Us", url: "/contact", visible: true },
            { _key: "volunteer", label: "Volunteer", url: "/contact", visible: true },
            { _key: "partners", label: "Our Partners", url: "/partners", visible: true },
          ],
        },
      ],
    })
    .commit();
  console.log("✅ Footer settings seeded");

  // ── Update siteSettings operating hours ──
  await client.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });
  await client
    .patch("siteSettings")
    .setIfMissing({ operatingHours: "Open Daily from Fajr to Isha" })
    .commit();
  console.log("✅ Site settings operating hours updated");

  console.log("\n🎉 Done!");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
```

- [ ] **Step 2: Commit**

```bash
git add scripts/seed-nav-settings.ts
git commit -m "feat: add seed script for navigation settings"
```

---

### Task 17: Full validation

**Files:** All modified files

- [ ] **Step 1: Run full validation**

```bash
npm run validate
```

This runs: type-check → lint → test:run → build

Expected: All pass with zero errors.

- [ ] **Step 2: Fix any issues found**

Address any type errors, lint warnings, or test failures.

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address validation issues"
```

- [ ] **Step 4: Run seed script (optional, for local testing)**

```bash
npx tsx scripts/seed-nav-settings.ts
```

- [ ] **Step 5: Verify Sanity Studio at /studio**

Start dev server and check:
- Navigation Settings folder appears with Header Settings and Footer Settings
- Both singletons load without errors
- Nav groups array is editable and orderable
- Icon picker fields render the picker UI
- All field descriptions and admin notes display correctly

---
