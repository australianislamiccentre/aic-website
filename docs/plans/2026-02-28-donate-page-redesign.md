# Donate Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the /donate page with a side-by-side hero+form layout, impact stats section, and campaign grid — replacing the current fragile floating form design.

**Architecture:** Three-section page (hero, impact stats, campaigns) with all content Sanity-managed and hardcoded fallbacks. Side-by-side flexbox layout replaces absolute-positioned floating form. New `impactStats` array field added to existing `donatePageSettings` singleton.

**Tech Stack:** Next.js 16, Tailwind CSS, Sanity CMS (GROQ), Vitest + Testing Library

---

### Task 1: Add `impactStats` field to Sanity schema

**Files:**
- Modify: `src/sanity/schemas/donatePageSettings.ts:44-58` (add field before campaigns)
- Test: `src/sanity/schemas/donatePageSettings.test.ts`

**Step 1: Write the failing test**

Add to `src/sanity/schemas/donatePageSettings.test.ts` — a new describe block before "Removed fields":

```typescript
describe("Impact Stats field", () => {
  const impactStats = donatePageSettings.fields.find(
    (f) => f.name === "impactStats"
  );

  it("exists and is array", () => {
    expect(impactStats).toBeDefined();
    expect(impactStats?.type).toBe("array");
  });

  it("has object items with value and label fields", () => {
    const itemType = (impactStats as { of?: Array<{ type: string; fields?: Array<{ name: string; type: string }> }> })?.of?.[0];
    expect(itemType?.type).toBe("object");
    const fieldNames = itemType?.fields?.map((f) => f.name);
    expect(fieldNames).toContain("value");
    expect(fieldNames).toContain("label");
  });
});
```

Also update the field count test from `4` to `5`:

```typescript
it("has 5 fields", () => {
  expect(donatePageSettings.fields).toHaveLength(5);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/sanity/schemas/donatePageSettings.test.ts`
Expected: FAIL — "impactStats" field not found, field count is 4 not 5

**Step 3: Write minimal implementation**

Add to `src/sanity/schemas/donatePageSettings.ts` after the `formElement` field (line 42) and before the campaigns field:

```typescript
// ── Impact Stats ──
defineField({
  name: "impactStats",
  title: "Impact Stats",
  type: "array",
  description:
    'Up to 4 impact statistics shown below the hero (e.g. "500+" / "Families Supported"). Leave empty to use defaults.',
  validation: (rule) => rule.max(4),
  of: [
    {
      type: "object",
      fields: [
        defineField({
          name: "value",
          title: "Value",
          type: "string",
          description: 'The number or stat (e.g. "500+", "20+", "$1M")',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          description: 'Short description (e.g. "Families Supported")',
          validation: (rule) => rule.required(),
        }),
      ],
      preview: {
        select: { title: "value", subtitle: "label" },
      },
    },
  ],
}),
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/sanity/schemas/donatePageSettings.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/sanity/schemas/donatePageSettings.ts src/sanity/schemas/donatePageSettings.test.ts
git commit -m "feat(sanity): add impactStats field to donatePageSettings schema"
```

---

### Task 2: Update GROQ query and fetch types for impact stats

**Files:**
- Modify: `src/sanity/lib/queries.ts:263-276`
- Modify: `src/sanity/lib/fetch.ts:301-307`

**Step 1: Update the GROQ query**

In `src/sanity/lib/queries.ts`, update `donatePageSettingsQuery` to include `impactStats`:

```groq
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
```

**Step 2: Update the TypeScript interface**

In `src/sanity/lib/fetch.ts`, add the impact stat type and update `DonatePageSettings`:

```typescript
export interface DonatePageImpactStat {
  value: string;
  label: string;
}

export interface DonatePageSettings {
  _id: string;
  heroHeading?: string;
  heroDescription?: string;
  formElement?: string;
  impactStats?: DonatePageImpactStat[];
  campaigns?: DonatePageCampaign[];
}
```

**Step 3: Run existing tests to verify nothing broke**

Run: `npx vitest run src/app/donate/`
Expected: PASS (existing tests still work since impactStats is optional)

**Step 4: Commit**

```bash
git add src/sanity/lib/queries.ts src/sanity/lib/fetch.ts
git commit -m "feat(sanity): add impactStats to GROQ query and fetch types"
```

---

### Task 3: Rewrite DonateContent component — tests first

**Files:**
- Rewrite: `src/app/donate/DonateContent.test.tsx`

**Step 1: Rewrite the test file**

Replace the entire test file. The new tests reflect the redesigned layout: side-by-side hero (no image), impact stats section, and campaign grid. Keep the security/edge-case tests unchanged.

Update `fullSettings` fixture to include `impactStats`:

```typescript
const fullSettings: DonatePageSettings = {
  _id: "donatePageSettings",
  heroHeading: "Give Generously",
  heroDescription: "Help us build a better future.",
  formElement: '<a href="#FORM" style="display:none"></a>',
  impactStats: [
    { value: "500+", label: "Families Supported" },
    { value: "20+", label: "Years Serving" },
    { value: "5", label: "Daily Prayers" },
  ],
  campaigns: [
    {
      _id: "c1",
      title: "Campaign One",
      fundraiseUpElement: '<a href="#C1" style="display:none"></a>',
      active: true,
    },
    {
      _id: "c2",
      title: "Campaign Two",
      fundraiseUpElement: '<a href="#C2" style="display:none"></a>',
      active: true,
    },
    {
      _id: "c3",
      title: "Disabled Campaign",
      fundraiseUpElement: '<a href="#C3" style="display:none"></a>',
      active: false,
    },
  ],
};
```

New/updated test sections:

**Hero Section tests:**
- Renders default hero heading when no settings
- Renders custom hero heading from settings
- Renders custom hero description from settings
- Renders default description when no settings
- Renders hero badge ("Make a Difference")
- Renders Quran ayah in hero section (moved from separate section)
- Renders surah reference
- Does NOT render a hero background image (no `<img>` tag)

**Donation Form tests:**
- Renders form widget when formElement has content
- Does not render form when formElement is empty
- Form is inside the hero section (same parent container as text)

**Impact Stats tests:**
- Renders impact stats when provided in settings
- Renders each stat value and label
- Does not render impact stats section when no stats provided
- Renders fallback stats when settings exist but impactStats is empty/undefined
- Uses data-testid="impact-stats-section" for the section

**Campaigns tests:**
- Same as current (renders section, correct count, filters inactive, hides when empty)

**Edge cases:**
- Same as current (null/undefined settings, unicode cleaning, script sanitisation)

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/donate/DonateContent.test.tsx`
Expected: FAIL — component doesn't match new expected structure yet

---

### Task 4: Rewrite DonateContent component — implementation

**Files:**
- Rewrite: `src/app/donate/DonateContent.tsx`

**Step 1: Rewrite the component**

Key changes from current implementation:
- Remove `next/image` import (no hero image)
- Remove hero image section and gradient overlays
- Add `DonatePageImpactStat` to the import from fetch.ts
- Replace layout with flexbox side-by-side hero
- Move Quran ayah into the hero left column
- Add impact stats section between hero and campaigns
- Keep all existing utilities: `cleanElementCode`, `sanitizeFundraiseUpElement`, `FundraiseUpWidget`

Component structure:

```tsx
export default function DonateContent({ settings }: DonateContentProps) {
  // Same filtering logic for campaigns and form visibility
  const activeCampaigns = ...;
  const showForm = ...;
  const showCampaigns = ...;

  // Impact stats: Sanity data with hardcoded fallback
  const defaultStats = [
    { value: "500+", label: "Families Supported" },
    { value: "20+", label: "Years Serving" },
    { value: "5", label: "Daily Prayers" },
    { value: "1000+", label: "Community Members" },
  ];
  const impactStats = settings?.impactStats?.length
    ? settings.impactStats
    : defaultStats;

  return (
    <>
      {/* Hero — warm gradient bg, side-by-side on desktop */}
      <section className="bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className={`flex flex-col ${showForm ? "lg:flex-row lg:items-start lg:gap-12" : ""}`}>
            {/* Left column — text */}
            <div className={`${showForm ? "lg:flex-1" : "max-w-3xl mx-auto text-center"}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs sm:text-sm font-medium mb-6">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Make a Difference
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {heroHeading}
              </h1>

              <p className="text-sm sm:text-lg text-gray-600 mb-8 leading-relaxed">
                {heroDescription}
              </p>

              {/* Quran ayah */}
              <blockquote className="text-lg sm:text-xl font-serif italic text-gray-500 leading-relaxed">
                "Who is it that would loan Allah a goodly loan so He may multiply it for him many times over?"
              </blockquote>
              <p className="mt-2 text-sm text-gray-400">Surah Al-Baqarah 2:245</p>
            </div>

            {/* Right column — form (only when form exists) */}
            {showForm && (
              <div className="mt-10 lg:mt-0 lg:flex-shrink-0 lg:w-[420px]">
                <FundraiseUpWidget
                  html={settings!.formElement!}
                  className="fundraise-up-wrapper"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-stone-50 border-y border-stone-200" data-testid="impact-stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-green-700">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Cards — same pattern as before */}
      {showCampaigns && (
        <section className="py-10 sm:py-14 bg-white" data-testid="campaigns-section">
          ...same as current...
        </section>
      )}
    </>
  );
}
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run src/app/donate/DonateContent.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/donate/DonateContent.tsx src/app/donate/DonateContent.test.tsx
git commit -m "feat(donate): redesign page with side-by-side hero and impact stats"
```

---

### Task 5: Remove unused imports and clean up page.tsx

**Files:**
- Check: `src/app/donate/page.tsx` (likely no changes needed)
- Check: `src/app/donate/DonateContent.tsx` (verify no unused imports remain)

**Step 1: Verify the page server component still works**

`page.tsx` should need no changes — it fetches `getDonatePageSettings()` and passes to `DonateContent`. The new `impactStats` field flows through automatically.

**Step 2: Run full test suite for the donate page**

Run: `npx vitest run src/app/donate/`
Expected: PASS

**Step 3: Commit (only if changes were needed)**

```bash
git add src/app/donate/
git commit -m "chore(donate): clean up unused imports"
```

---

### Task 6: Visual verification and final check

**Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: All tests PASS

**Step 2: Run the dev server and visually check**

Run: `npm run dev`
Check: Navigate to http://localhost:3000/donate

Verify:
- Warm gradient background (no hero image)
- Heading + description + ayah on left, form on right (desktop)
- Stacks vertically on mobile (resize browser)
- Impact stats row visible below hero with fallback values
- Campaign cards grid below (if campaigns configured in Sanity)
- No form: left column centers, no empty right column

**Step 3: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 4: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "fix(donate): visual adjustments from manual review"
```
