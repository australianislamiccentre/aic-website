# Nav & Footer Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current disorganised nav/footer with a clean 5-group structure and trial 3 different header interaction patterns (inline dropdowns, full-page overlay, hybrid) for comparison.

**Architecture:** Shared navigation data in `src/data/navigation.ts` consumed by 3 Header variants (`HeaderA`, `HeaderB`, `HeaderC`) and one updated Footer. A `NavProvider` wrapper in `layout.tsx` reads `?nav=a|b|c` and renders the selected variant. Existing `Header.tsx` is preserved untouched as a backup.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Framer Motion, lucide-react icons.

---

### Task 1: Create shared navigation data

**Files:**
- Create: `src/data/navigation.ts`

**Step 1: Create the navigation data file**

```typescript
// src/data/navigation.ts

/**
 * Shared Navigation Data
 *
 * Hardcoded navigation structure consumed by all Header variants and the Footer.
 * External links (College, Bookstore, Newport Storm) are injected at runtime
 * from SiteSettingsContext, not stored here.
 *
 * @module data/navigation
 */

export interface NavLink {
  name: string;
  href: string;
  external?: boolean;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

/**
 * Header navigation groups. Contact and Donate are handled separately
 * (Contact is a flat link, Donate is a CTA button).
 */
export const headerNavGroups: NavGroup[] = [
  {
    label: "About",
    links: [
      { name: "Our Story", href: "/about" },
      { name: "Our Imams", href: "/imams" },
      { name: "Affiliated Partners", href: "/partners" },
    ],
  },
  {
    label: "What's On",
    links: [
      { name: "Events", href: "/events" },
      { name: "Services", href: "/services" },
      { name: "Announcements", href: "/announcements" },
      { name: "Programs", href: "/events#programs" },
    ],
  },
  {
    label: "Our Mosque",
    links: [
      { name: "Prayer Times", href: "/#prayer-times" },
      { name: "For Worshippers", href: "/worshippers" },
      { name: "Plan Your Visit", href: "/visit" },
      { name: "Architecture", href: "/architecture" },
    ],
  },
  {
    label: "Media & Resources",
    links: [
      { name: "Media Gallery", href: "/media" },
      { name: "Resources", href: "/resources" },
    ],
  },
];

/** Footer link groups — mirrors header groups plus Get Involved. */
export const footerNavGroups: NavGroup[] = [
  ...headerNavGroups,
  {
    label: "Get Involved",
    links: [
      { name: "Donate", href: "/donate" },
      { name: "Contact Us", href: "/contact" },
      { name: "Volunteer", href: "/contact" },
    ],
  },
];

/**
 * Build affiliate links from SiteSettingsContext external links.
 * Call this inside components that have access to useSiteSettings().
 */
export function buildAffiliateLinks(externalLinks: {
  college: string;
  bookstore: string;
  newportStorm: string;
}): NavLink[] {
  return [
    { name: "AIC College", href: externalLinks.college, external: true },
    { name: "AIC Bookstore", href: externalLinks.bookstore, external: true },
    { name: "Newport Storm FC", href: externalLinks.newportStorm, external: true },
  ];
}
```

**Step 2: Run type-check to verify**

Run: `npm run type-check`
Expected: PASS — no errors from the new file

**Step 3: Commit**

```bash
git add src/data/navigation.ts
git commit -m "feat: add shared navigation data structure"
```

---

### Task 2: Create navigation data tests

**Files:**
- Create: `src/data/navigation.test.ts`

**Step 1: Write the tests**

```typescript
// src/data/navigation.test.ts
import { describe, it, expect } from "vitest";
import {
  headerNavGroups,
  footerNavGroups,
  buildAffiliateLinks,
} from "./navigation";

describe("navigation data", () => {
  describe("headerNavGroups", () => {
    it("has exactly 4 groups", () => {
      expect(headerNavGroups).toHaveLength(4);
    });

    it("contains About, What's On, Our Mosque, Media & Resources", () => {
      const labels = headerNavGroups.map((g) => g.label);
      expect(labels).toEqual([
        "About",
        "What's On",
        "Our Mosque",
        "Media & Resources",
      ]);
    });

    it("every link has a name and href", () => {
      for (const group of headerNavGroups) {
        for (const link of group.links) {
          expect(link.name).toBeTruthy();
          expect(link.href).toBeTruthy();
        }
      }
    });

    it("all hrefs start with /", () => {
      for (const group of headerNavGroups) {
        for (const link of group.links) {
          expect(link.href.startsWith("/")).toBe(true);
        }
      }
    });
  });

  describe("footerNavGroups", () => {
    it("includes all header groups plus Get Involved", () => {
      const labels = footerNavGroups.map((g) => g.label);
      expect(labels).toContain("About");
      expect(labels).toContain("What's On");
      expect(labels).toContain("Our Mosque");
      expect(labels).toContain("Media & Resources");
      expect(labels).toContain("Get Involved");
    });

    it("Get Involved contains Donate, Contact Us, Volunteer", () => {
      const getInvolved = footerNavGroups.find(
        (g) => g.label === "Get Involved"
      );
      expect(getInvolved).toBeDefined();
      const names = getInvolved!.links.map((l) => l.name);
      expect(names).toContain("Donate");
      expect(names).toContain("Contact Us");
      expect(names).toContain("Volunteer");
    });
  });

  describe("buildAffiliateLinks", () => {
    it("returns 3 external links", () => {
      const links = buildAffiliateLinks({
        college: "https://college.test",
        bookstore: "https://bookstore.test",
        newportStorm: "https://storm.test",
      });
      expect(links).toHaveLength(3);
      expect(links.every((l) => l.external)).toBe(true);
    });

    it("uses provided URLs", () => {
      const links = buildAffiliateLinks({
        college: "https://example.com/college",
        bookstore: "https://example.com/bookstore",
        newportStorm: "https://example.com/storm",
      });
      expect(links[0].href).toBe("https://example.com/college");
      expect(links[1].href).toBe("https://example.com/bookstore");
      expect(links[2].href).toBe("https://example.com/storm");
    });
  });
});
```

**Step 2: Run the tests**

Run: `npx vitest run src/data/navigation.test.ts`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/data/navigation.test.ts
git commit -m "test: add navigation data tests"
```

---

### Task 3: Build Header variant A — Inline Links + Dropdown Panels

**Files:**
- Create: `src/components/layout/HeaderA.tsx`

**Context for implementer:**
- Import `headerNavGroups` from `@/data/navigation`
- Import `useSiteSettings`, `usePathname`, `useIsScrolled` (extract from existing Header.tsx or inline)
- Import `SearchDialog` from `@/components/ui/SearchDialog`
- Reuse the same top bar, logo swap, scroll behaviour, and donate CTA from the existing `Header.tsx`
- The key difference: dropdown is a simple single-column list of links (no categories, no promo images)
- Use `cn()` from `@/lib/utils` for class merging
- All icons from `lucide-react`
- Animations: Framer Motion `AnimatePresence` + `motion.div` for dropdown/drawer, respect `prefers-reduced-motion`
- ARIA: `aria-expanded` on dropdown triggers, `aria-haspopup="true"`, `role="menu"` on dropdown panels

**Step 1: Create HeaderA component**

Build the component with these sections:
1. **Top bar** (desktop + mobile) — same as current Header
2. **Main header bar** — Logo (left), nav groups as text links with `ChevronDown` icon (centre/right), Search button, Donate CTA, mobile hamburger
3. **Desktop dropdowns** — on hover/focus, show a compact panel below the label with the group's links as a vertical list. Panel appears directly under the trigger (not full-width). Use `AnimatePresence` for enter/exit.
4. **Contact** — flat link (no dropdown), sits after the 4 groups
5. **Mobile drawer** — full-screen slide-out from right. Groups as accordion sections (expand/collapse with `ChevronRight` rotation). Donate link at bottom. Phone/location in fixed footer.

The component should export `HeaderA` and also export the `useIsScrolled` hook for reuse by B and C.

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/layout/HeaderA.tsx
git commit -m "feat: add Header variant A — inline links with dropdown panels"
```

---

### Task 4: Build Header variant B — Hamburger + Full-Page Overlay

**Files:**
- Create: `src/components/layout/HeaderB.tsx`

**Context for implementer:**
- Minimal header bar: Logo (left), hamburger icon + Donate CTA (right)
- No visible nav links in the header bar on any screen size
- Clicking hamburger opens a full-viewport overlay (`fixed inset-0 z-50`)
- Overlay background: `bg-neutral-900` (solid, not translucent)
- Layout inside overlay:
  - Close button top-right
  - Groups laid out in a CSS grid: 3 columns on desktop (≥1024px), 2 on tablet (≥768px), 1 on mobile
  - Each group: bold uppercase heading label, then vertical list of links
  - Contact and Donate appear as standalone items at the bottom of the grid
- Body scroll locked when overlay is open
- Entry animation: fade in + slight scale up. Exit: fade out. Use `AnimatePresence`.
- Same top bar, logo, scroll behaviour as HeaderA

**Step 1: Create HeaderB component**

Build the component following the pattern above.

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/layout/HeaderB.tsx
git commit -m "feat: add Header variant B — hamburger with full-page overlay"
```

---

### Task 5: Build Header variant C — Hybrid Inline + Hamburger

**Files:**
- Create: `src/components/layout/HeaderC.tsx`

**Context for implementer:**
- Header bar: Logo (left), "What's On" dropdown, "Our Mosque" dropdown, hamburger icon, Search, Donate CTA (right)
- Only 2 groups are inline — the two most-used community groups
- Dropdowns behave like HeaderA's dropdowns (compact panel, hover/focus triggered)
- Hamburger opens a side panel (not full-page — right-aligned, ~320px wide) with remaining groups: About, Media & Resources, Contact
- Side panel slides in from right with a semi-transparent backdrop behind
- Mobile (< 768px): all groups move into the hamburger side panel (inline dropdowns hidden)
- Same top bar, logo, scroll behaviour as HeaderA/B

**Step 1: Create HeaderC component**

Build the component following the pattern above.

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/layout/HeaderC.tsx
git commit -m "feat: add Header variant C — hybrid inline plus hamburger"
```

---

### Task 6: Create NavProvider — trial selector wrapper

**Files:**
- Create: `src/components/layout/NavProvider.tsx`
- Modify: `src/app/layout.tsx`

**Context for implementer:**
- `NavProvider` is a client component that reads `?nav=a|b|c` from the URL via `useSearchParams()`
- Renders `HeaderA`, `HeaderB`, or `HeaderC` based on the param (default: `a`)
- Wrap in `Suspense` boundary because `useSearchParams()` requires it in Next.js App Router

**Step 1: Create NavProvider**

```typescript
// src/components/layout/NavProvider.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HeaderA } from "./HeaderA";
import { HeaderB } from "./HeaderB";
import { HeaderC } from "./HeaderC";

function NavSelector() {
  const searchParams = useSearchParams();
  const variant = searchParams.get("nav") || "a";

  switch (variant) {
    case "b":
      return <HeaderB />;
    case "c":
      return <HeaderC />;
    default:
      return <HeaderA />;
  }
}

export function NavProvider() {
  return (
    <Suspense fallback={<HeaderA />}>
      <NavSelector />
    </Suspense>
  );
}
```

**Step 2: Update layout.tsx**

In `src/app/layout.tsx`:
- Replace `import { Header } from "@/components/layout/Header"` with `import { NavProvider } from "@/components/layout/NavProvider"`
- Replace `<Header />` with `<NavProvider />`
- Keep the old Header import commented out for easy rollback

**Step 3: Run type-check**

Run: `npm run type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/layout/NavProvider.tsx src/app/layout.tsx
git commit -m "feat: add NavProvider trial selector — switch headers via ?nav=a|b|c"
```

---

### Task 7: Update Footer with new link structure

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Context for implementer:**
- Import `footerNavGroups`, `buildAffiliateLinks` from `@/data/navigation`
- Replace the hardcoded `footerLinks` object with the shared data
- Keep the existing grid layout structure (6 columns) but update the link groups:
  - Column 1-2: Brand & Contact (unchanged)
  - Column 3: About + What's On (from `footerNavGroups`)
  - Column 4: Our Mosque + Media & Resources (from `footerNavGroups`)
  - Column 5: Get Involved (from `footerNavGroups`) + Affiliates (from `buildAffiliateLinks()`)
  - Column 6: Support Us / Donate CTA + Quran verse (unchanged)
- Newsletter section: unchanged
- Bottom bar: unchanged
- All existing styling and animations stay the same

**Step 1: Update the Footer component**

Replace the `footerLinks` object inside `Footer()` with:

```typescript
const affiliateLinks = buildAffiliateLinks(info.externalLinks);
```

Then render the `footerNavGroups` array dynamically. Each group becomes a section heading + link list. The Affiliates section uses `affiliateLinks`.

The grid columns for the link groups should be arranged so it doesn't feel lopsided. With 5 groups (About 3 links, What's On 4 links, Our Mosque 4 links, Media & Resources 2 links, Get Involved 3 links), group the smaller ones together:
- Column 3: About (3 links) and Media & Resources (2 links) stacked
- Column 4: What's On (4 links)
- Column 5: Our Mosque (4 links)
- Column 6: Get Involved (3 links) + Affiliates (3 external links)
- Column 7: Support Us / Donate CTA

Or flatten to however many columns fit. Use `footerNavGroups` in a loop so future nav changes propagate automatically.

**Step 2: Run type-check and lint**

Run: `npm run type-check && npm run lint`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: update Footer with shared navigation structure"
```

---

### Task 8: Write tests for Header variants and NavProvider

**Files:**
- Create: `src/components/layout/HeaderA.test.tsx`
- Create: `src/components/layout/HeaderB.test.tsx`
- Create: `src/components/layout/HeaderC.test.tsx`
- Create: `src/components/layout/NavProvider.test.tsx`

**Context for implementer:**
- Copy the mock setup pattern from existing `Header.test.tsx` (SiteSettingsContext mock, SearchDialog mock)
- Also mock `framer-motion` (`motion.div` → plain `div`, `AnimatePresence` → fragment)
- Also mock `next/image` (render as `img`)
- For NavProvider tests, mock `next/navigation`'s `useSearchParams` to return different `?nav=` values

**Key test cases per variant:**

**HeaderA tests:**
- Renders all 5 nav labels (About, What's On, Our Mosque, Media & Resources, Contact)
- Renders Donate CTA with correct href
- Renders Search button
- Renders mobile hamburger button
- Opening mobile menu shows all groups
- Contact link has href `/contact`
- Renders top bar with welcome message

**HeaderB tests:**
- Does NOT render nav labels in the header bar (only logo, hamburger, donate)
- Clicking hamburger opens overlay with all groups visible
- Overlay shows group headings (About, What's On, etc.)
- Close button closes overlay
- Renders Donate CTA

**HeaderC tests:**
- Renders "What's On" and "Our Mosque" inline in header bar
- Does NOT render "About" or "Media & Resources" inline
- Hamburger opens side panel with About, Media & Resources, Contact
- Renders Donate CTA and Search button

**NavProvider tests:**
- Default (no param) renders HeaderA
- `?nav=b` renders HeaderB
- `?nav=c` renders HeaderC
- Invalid param (e.g. `?nav=z`) falls back to HeaderA

**Step 1: Write all four test files**

Use the patterns described above.

**Step 2: Run all tests**

Run: `npx vitest run src/components/layout/HeaderA.test.tsx src/components/layout/HeaderB.test.tsx src/components/layout/HeaderC.test.tsx src/components/layout/NavProvider.test.tsx`
Expected: All PASS

**Step 3: Commit**

```bash
git add src/components/layout/HeaderA.test.tsx src/components/layout/HeaderB.test.tsx src/components/layout/HeaderC.test.tsx src/components/layout/NavProvider.test.tsx
git commit -m "test: add tests for Header variants A/B/C and NavProvider"
```

---

### Task 9: Update Footer tests

**Files:**
- Modify: `src/components/layout/Footer.test.tsx`

**Context for implementer:**
- The Footer now uses `footerNavGroups` from `@/data/navigation` instead of hardcoded `footerLinks`
- Update the "renders navigation link sections" test to check for the new group headings: About, What's On, Our Mosque, Media & Resources, Get Involved
- Remove checks for old headings ("Explore", "Worship") that no longer exist
- Keep tests for: Affiliates, newsletter form, social links, donate CTA, copyright, legal links, Quran verse
- Add test: all links from `footerNavGroups` render with correct hrefs

**Step 1: Update the Footer test file**

**Step 2: Run Footer tests**

Run: `npx vitest run src/components/layout/Footer.test.tsx`
Expected: All PASS

**Step 3: Commit**

```bash
git add src/components/layout/Footer.test.tsx
git commit -m "test: update Footer tests for new navigation structure"
```

---

### Task 10: Run full validation and fix any issues

**Files:**
- Potentially any files from Tasks 1-9

**Step 1: Run type-check**

Run: `npm run type-check`
Expected: Zero errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: Zero warnings

**Step 3: Run all tests**

Run: `npm run test:run`
Expected: Zero failures

**Step 4: Fix any issues found**

If anything fails, fix it and re-run.

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve validation issues from nav/footer redesign"
```

---

### Task 11: Manual testing checklist

This task is for the user to test in the browser. Do NOT automate.

**Desktop (≥1024px):**
- [ ] Visit `localhost:3000` — HeaderA renders by default
- [ ] Visit `localhost:3000?nav=b` — HeaderB renders (hamburger only)
- [ ] Visit `localhost:3000?nav=c` — HeaderC renders (hybrid)
- [ ] Hover over each dropdown group — links appear correctly
- [ ] Click through each link — navigates to correct page
- [ ] Scroll down — header transitions to scrolled style
- [ ] Footer shows new grouped link structure
- [ ] Newsletter form still works

**Tablet (768-1023px):**
- [ ] Test all 3 variants at this width
- [ ] Mobile drawer works for A and C

**Mobile (375px):**
- [ ] All 3 variants show hamburger
- [ ] Drawer/overlay opens and closes cleanly
- [ ] Accordion expand/collapse works
- [ ] Footer stacks correctly
- [ ] All links are tappable

**Accessibility:**
- [ ] Tab through all nav items — focus visible
- [ ] Enter/Space opens dropdowns
- [ ] Escape closes dropdowns/overlay/drawer
- [ ] Screen reader announces dropdown state
