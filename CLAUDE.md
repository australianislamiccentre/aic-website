# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository. Follow every rule in this file. Do not skip steps. Do not ask for permission to do things this file tells you to do - just do it. If a rule in this file conflicts with your default behaviour, this file wins.

## Commands

```bash
npm run dev              # Dev server at localhost:3000 (includes Sanity Studio at /studio)
npm run build            # Production build
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run type-check       # TypeScript check (tsc --noEmit)
npm run test             # Vitest in watch mode
npm run test:run         # Run all tests once
npx vitest run src/components/ui/Button.test.tsx  # Run a single test file
npm run test:coverage    # Tests with v8 coverage
npm run validate         # Full CI check: type-check -> lint -> test:run -> build
```

Pre-commit hooks (Husky + lint-staged) auto-fix ESLint on `*.{ts,tsx,js,jsx,json,md}`. The hook is lightweight (lint only) — CI runs the full `validate` check on push.

---

## Architecture

**Next.js 16** (App Router, React 19) + **Sanity CMS** (embedded at `/studio`) + **Tailwind CSS 4** + **Framer Motion**. Deployed on Vercel.

### Server/Client Component Split

Every route follows this pattern:
- `app/<route>/page.tsx` - Server Component that fetches data from Sanity
- `app/<route>/<Route>Content.tsx` - Client Component (`"use client"`) with state, filtering, animations

Never break this pattern. If a new route is added, it must follow this structure.

### Data Flow: Sanity -> ISR -> Page

```
Sanity Studio publish -> webhook POST /api/revalidate -> ISR cache invalidated
Next request -> src/sanity/lib/fetch.ts -> sanityFetch() -> page.tsx -> *Content.tsx
```

- **All Sanity clients have `useCdn: false`** - Next.js ISR (`revalidate: 120`) is the sole cache
- Fetch functions in `src/sanity/lib/fetch.ts` never throw; they return `[]` or `null` on error
- GROQ queries live in `src/sanity/lib/queries.ts`; types in `src/types/sanity.ts`

### Sanity-First with Fallback

Pages use Sanity data when available, falling back to hardcoded defaults in `src/data/content.ts`. Contexts (`SiteSettingsContext`, `FormSettingsContext`) merge Sanity + fallback data so UI never sees raw optional fields.

### Stega Encoding - CRITICAL

Sanity's stega injects invisible zero-width characters into strings, breaking `===` and `Array.includes()` on the client.

- `stega.enabled: false` on `client` and `noCdnClient` (production reads)
- `stega.enabled: true` only on `previewClient` (draft mode / Presentation tool)
- **Never** gate stega on `NEXT_PUBLIC_VERCEL_ENV` - it's `undefined` on localhost

### Four Sanity Clients (`src/sanity/lib/client.ts`)

| Client          | Stega | Token | Purpose                       |
| --------------- | ----- | ----- | ----------------------------- |
| `client`        | off   | none  | Default reads                 |
| `noCdnClient`   | off   | none  | Singleton settings            |
| `writeClient`   | off   | write | Server-only mutations         |
| `previewClient` | on    | read  | Draft mode with click-to-edit |

### Sanity Client Usage

Always import `client` from `src/sanity/lib/client.ts` for production reads. Never import `previewClient` in production components — it has stega enabled and will inject invisible characters into all strings. Use `writeClient` only in server-side code (API routes, server actions).

### Singleton Schemas

Singletons are one-document-per-type schemas. They use `.documentId("schemaName")` in the desk structure (`sanity.config.ts`) and are fetched with `_id == "schemaName"` in GROQ queries.

**Core singletons:** `siteSettings`, `prayerSettings`, `donationSettings`, `donatePageSettings`, `homepageSettings`

**Page settings singletons** (one per page, controls hero text, section visibility, CTA content):
`aboutPageSettings`, `architecturePageSettings`, `visitPageSettings`, `worshippersPageSettings`, `contactPageSettings`, `eventsPageSettings`, `announcementsPageSettings`, `servicesPageSettings`, `imamsPageSettings`, `resourcesPageSettings`, `mediaPageSettings`, `partnersPageSettings`, `privacyPageSettings`, `termsPageSettings`

**Form singletons:** `contactFormSettings`, `serviceInquiryFormSettings`, `eventInquiryFormSettings`, `newsletterSettings`, `allowedFormDomains`

Every singleton must have: schema → desk structure entry → GROQ query → fetch function → page.tsx wiring → component rendering → tests. See "Sanity CMS Rules" for the full checklist.

### Event Schema

`eventType` field (radio): `"single"` | `"multi"` | `"recurring"`. GROQ date comparison uses `string::split(string(now()), "T")[0]` for fair date-only comparison.

## Key Directories

| Path                         | Purpose                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `src/sanity/schemas/`        | 16 Sanity document type definitions                               |
| `src/sanity/lib/`            | Client config, GROQ queries, fetch functions, image helper        |
| `src/components/ui/`         | Base components (Button, Card, Input, etc.)                       |
| `src/components/sections/`   | Homepage section components (see conventions below)               |
| `src/components/animations/` | Framer Motion wrappers (FadeIn)                                   |
| `src/contexts/`              | SiteSettingsContext, FormSettingsContext                          |
| `src/data/content.ts`        | Hardcoded fallback content                                        |
| `src/lib/`                   | Utilities: `cn()`, prayer times, validation, rate limiting, email |
| `src/types/sanity.ts`        | TypeScript interfaces for all CMS documents                       |

### Homepage Section Conventions

Every section component in `src/components/sections/` must return `null` when its data is empty. Never render a heading or empty container when there's no content — the homepage layout depends on empty sections being invisible. Example:

```tsx
if (images.length === 0) return null;
```

### Prayer Keyword Filtering

`WhatsOnSection` filters out services, events, and programs with prayer-related titles (e.g. "Friday Prayer", "Jumu'ah", "Taraweeh") because those appear separately in the `PrayerStrip` component. The keyword list lives in the `isPrayerRelated()` function inside `WhatsOnSection.tsx`. If adding a new prayer-related content type, add the keyword to that list.

---

## Design Decision Process

- For any new UI component or significant visual change, describe the design approach FIRST before writing code
- Include: layout structure, spacing values, colour choices, responsive behaviour at each breakpoint
- Wait for approval before implementing visual changes
- For structural/logic/backend changes, cascading updates, tests, and refactoring - proceed without asking

---

## Sanity CMS Rules

### The #1 Rule: Every Sanity Field Must Work End-to-End

A Sanity field is not "done" until changing its value in Sanity Studio changes what appears on the live site. A field that exists in the schema but doesn't render is a bug. Every field must be wired through the **complete pipeline**:

```
Schema field → GROQ query → TypeScript type → fetch function → page.tsx prop → Content.tsx renders it → test proves it works
```

If any link in this chain is missing, the field is broken. Do not commit partial implementations.

### Mandatory Checklist: Adding a Sanity Field

When adding ANY new field to a Sanity schema, complete ALL of these steps in the same commit. Do not split across PRs or leave any step for later:

1. **Schema** — Add the field in `src/sanity/schemas/`
2. **GROQ query** — Add the field to the query in `src/sanity/lib/queries.ts`. If the query uses explicit field projections, add the new field. If it fetches the whole object (e.g. `welcomeSection,`), verify the field is inside that object
3. **TypeScript type** — Add the field to the interface in `src/types/sanity.ts` (mark optional with `?` if it may not exist in Sanity)
4. **Fetch function** — Verify the fetch function in `src/sanity/lib/fetch.ts` returns the data (usually no change needed if query is updated)
5. **Server component (page.tsx)** — Verify the fetched data is passed as a prop to the client component. **This is the step most likely to be missed.** Check that the prop is actually passed, not just that the component accepts it
6. **Client component** — Use the prop with a fallback: `prop?.newField ?? "Default value"`. Never render `undefined`
7. **Test** — Write a test that renders the component with the new field set AND with it missing (fallback). Both must work
8. **Fallback content** — If the field has a hardcoded default, add it to `src/data/content.ts` or as inline fallback in the component

### Mandatory Checklist: Adding a Sanity Page Settings Singleton

When adding a new page settings singleton (e.g. `fooPageSettings`), complete ALL steps:

1. **Schema** — Create `src/sanity/schemas/pages/fooPageSettings.ts` with all fields
2. **Register schema** — Add to `src/sanity/schemas/index.ts`
3. **Desk structure** — Add singleton entry in `sanity.config.ts` with `.documentId("fooPageSettings")`
4. **GROQ query** — Add `fooPageSettingsQuery` in `src/sanity/lib/queries.ts` using `*[_id == "fooPageSettings"][0]`
5. **TypeScript type** — Add `SanityFooPageSettings` interface in `src/types/sanity.ts`
6. **Fetch function** — Add `getFooPageSettings()` in `src/sanity/lib/fetch.ts` with `skipCdn: true` and tags `["fooPageSettings"]`
7. **Server component** — Call `getFooPageSettings()` in `app/foo/page.tsx` and pass as prop to `FooContent`
8. **Client component** — Accept the settings prop and use every field with fallbacks
9. **Revalidation** — Add `"fooPageSettings"` to `validDocumentTypes` and `documentTypeToPath` in `src/app/api/revalidate/route.ts`
10. **Test** — Write tests covering: all fields rendering, missing fields falling back, empty/null settings

### Verification After Any Sanity Change

After implementing any Sanity schema change, verify the full pipeline by answering these questions:

1. If I change this field's value in Sanity Studio, will the site update? (Trace: query → fetch → prop → render)
2. If this field is empty/missing in Sanity, will the site crash or show a blank? (Must show fallback)
3. Is the field included in the GROQ query? (Check explicit projections — a field not in the query won't be fetched even if it's in the schema)
4. Is the fetched data actually passed as a prop from page.tsx to the Content component? (The most common failure point)
5. Does the revalidation webhook know about this document type? (Check `validDocumentTypes` and `documentTypeToPath` in route.ts)

### General Sanity Rules

- Any UI change that displays Sanity content must account for the schema in src/sanity/schemas/
- When adding new content sections, create or update the Sanity schema FIRST, then build the UI
- Handle missing/null content gracefully — never crash if a Sanity field is empty
- Use the fallback pattern: Sanity data → `src/data/content.ts` defaults via context
- Portable Text fields must use a proper `<PortableText>` serializer, not raw rendering
- When renaming or restructuring content, consider existing published data migration
- GROQ queries must be efficient — only fetch the fields you need, avoid `*`
- New queries go in `src/sanity/lib/queries.ts`, never inline in components
- Types for new schemas must be added to `src/types/sanity.ts`
- Sanity Studio customisation (desk structure, input components) lives in `src/sanity/`
- Validate that Sanity Studio still works at /studio after schema changes
- **Never leave a Sanity field unwired** — if a field is in the schema, it must render on the site. If it's not ready to be wired, don't add it to the schema yet

---

## FundraiseUp / Donations

Donations are handled entirely by **FundraiseUp** (not Stripe). FundraiseUp manages payment processing, receipts, and donor management externally.

### How it works
- `src/components/FundraiseUpScript.tsx` loads the FundraiseUp SDK globally via Next.js `<Script strategy="afterInteractive">`
- The organisation key defaults to `"AGUWBDNC"` and can be overridden via the `donationSettings` Sanity singleton
- The donate page (`DonateContent.tsx`) renders FundraiseUp widget HTML snippets stored in Sanity

### Sanity schemas
- `donationSettings` (singleton) — organisation key, optional custom installation script
- `donatePageSettings` (singleton) — hero text, form element HTML, campaign references, impact stats
- `donationCampaign` — individual campaign with title, description, FundraiseUp element HTML, active toggle

### Security: FundraiseUp HTML sanitization
Campaign and form HTML comes from Sanity and is rendered via `dangerouslySetInnerHTML`. The `sanitizeFundraiseUpElement()` function in `DonateContent.tsx` strips:
- `<script>` and `<iframe>` tags
- Event handler attributes (`onclick`, `onerror`, etc.)
- `javascript:` URLs
- Sanity stega zero-width characters

Never render FundraiseUp HTML without running it through this sanitizer first.

---

## Brand and Design

- Primary colour: teal/navy #01476b
- CTA colour: green #00ad4c
- Accent colours: lime, gold
- Headings: Playfair Display
- Body: Inter
- Arabic text: Amiri font with proper RTL support
- Islamic design elements should be tasteful and culturally appropriate
- Quran verses must be displayed with proper Arabic typography, diacritics, and attribution
- Right-to-left (RTL) layout for any Arabic content sections
- Use the cn() utility from src/lib/utils.ts for all conditional class merging
- Icons from lucide-react only - do not add new icon libraries

---

## Animation Conventions (Framer Motion)

- Use the `FadeIn` wrapper from `src/components/animations/FadeIn.tsx` for simple scroll-reveal fade-ins
- Inline `motion.div` / `motion.span` is acceptable in section components for animations that need custom variants, stagger, or per-element control
- Animations must respect prefers-reduced-motion - use motion-safe or check the media query
- Keep durations short: 0.2s-0.4s for UI transitions, 0.5s-0.8s max for reveal animations
- No bouncy spring animations on content - use ease or easeOut
- Stagger children by 0.05s-0.1s max, not 0.2s+
- Scroll-triggered animations should use `whileInView` with `viewport={{ once: true }}`, not scroll listeners
- Don't animate layout properties (width, height, top, left) - use transform and opacity only for performance
- **Hydration-safe motion components**: Any `motion.*` component that uses dynamic motion values (`useScroll`, `useSpring`, `useTransform`, `useMotionValue`) must defer rendering until after mount. Framer Motion injects dynamic inline `style` attributes on the client that won't match the server-rendered HTML, causing hydration mismatches. Use the mount-guard pattern:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <motion.div style={{ scaleX }} />;
  ```
  This applies especially to components rendered in the root layout tree. Static animation props (`animate`, `whileInView`, `whileHover`) are safe because they don't inject conflicting inline styles during hydration.

---

## Dates and hydration

The site serves a Melbourne-local audience. Vercel's Node runtime runs in UTC; users' browsers run in their own local timezone. Any code that reads timezone-local fields of `Date` (hours, minutes, calendar day) will produce different values on the server and the client — and React will throw a hydration mismatch. This is not theoretical; Sentry issue AIC-WEBSITE-1 was exactly this bug, firing 112+ times across every browser in production.

**Rule 1: All timezone-sensitive operations go through `src/lib/time.ts`.**

That module is the only place in the codebase allowed to use `Intl.DateTimeFormat` with a `timeZone` option, and the only place that builds Melbourne-specific calendar logic. Callers import the helpers — they do not reach for `Date` methods themselves.

Helpers you should be reaching for:

From `@/lib/time` (pure functions — safe to import anywhere):

- `getMelbourneMinutesOfDay(date)` — "what's the minute-of-day in Melbourne right now?"
- `getMelbourneDateString(date?)` — "what's today's Melbourne calendar date (YYYY-MM-DD)?"
- `isSameMelbourneDay(a, b)` — "are these two instants on the same Melbourne day?"
- `formatMelbourneDate(date, options?)` — "format this date for display in Melbourne tz"
- `formatMelbourneTime(date, options?)` — "format this time for display in Melbourne tz"
- `MELBOURNE_TZ` — the string `"Australia/Melbourne"` (import the constant, don't inline the string)

From `@/hooks/useIsMounted` (React hook — client components only):

- `useIsMounted()` — returns `false` during SSR and the first client render, then flips to `true` after mount. Used to gate `Date.now()`-dependent render output.

The hook lives in its own file because Next.js disallows importing React hooks from modules that are reachable from server components; splitting keeps `lib/time.ts` importable from API routes and server components without pulling the hook into their module graph.

**Rule 2: NEVER call these directly in component code:**

```ts
// 🔴 BANNED in components, hooks, and page.tsx files:
date.getHours()            // returns runtime-local hours, not Melbourne
date.getMinutes()
date.getDate()
date.getFullYear()
date.setHours(...)
date.setDate(...)
date.toLocaleDateString()  // uses runtime locale and timezone
date.toLocaleTimeString()
date.toLocaleString()
Date.parse(s)              // parses with runtime-local assumptions
new Date(y, m, d, ...)     // constructs in runtime-local tz
```

These are allowed **only inside `src/lib/time.ts`** (and its tests), which wraps them with the right `Intl.DateTimeFormat` options.

Also banned: the `new Date(date.toLocaleString("en-US", { timeZone: ... }))` round-trip pattern as a "timezone conversion trick". It silently drops milliseconds and doesn't handle DST boundaries. Use `Intl.DateTimeFormat.formatToParts` instead (already done inside `lib/time.ts`).

**Rule 3: Anything that reads `Date.now()` during render must be gated.**

Countdowns, "X minutes ago" timestamps, relative time displays — the server renders at T and the client hydrates at T + ~300ms, so the minute/second value can differ and trip hydration. Gate these behind `useIsMounted()`:

```tsx
import { useIsMounted } from "@/lib/time";

function RecentDonation({ at }: { at: string }) {
  const isMounted = useIsMounted();
  // Empty string on SSR and first client render → identical HTML.
  // Real text appears after mount. No hydration mismatch.
  return <span>{isMounted ? formatRelativeTime(at) : ""}</span>;
}
```

**Rule 4: GROQ date filters take `$today` as a parameter, not `now()`.**

Sanity `type: "date"` fields store `"YYYY-MM-DD"` in the admin's intended local calendar (Melbourne). GROQ's `now()` returns UTC, so using it inline for date-only comparisons introduces a ~10-hour skew at the Melbourne midnight boundary — an event that should disappear at midnight Melbourne keeps showing until UTC catches up.

Correct pattern for date-only comparisons:

```ts
// src/sanity/lib/fetch.ts
import { getMelbourneDateString } from "@/lib/time";

export async function getEvents() {
  return sanityFetch(eventsQuery, { today: getMelbourneDateString() }, ["events"]);
}
```

```groq
// src/sanity/lib/queries.ts
export const eventsQuery = groq`
  *[_type == "event" && active != false && (
    date >= $today || endDate >= $today
  )] { ... }
`;
```

When comparing `datetime` fields (stored as UTC ISO strings, e.g. `expiresAt`) against "now", continue to use `expiresAt > now()` — that comparison is tz-neutral because both sides are absolute instants. `$today` is only for date-string fields.

Prefer string-based comparisons for date-only data. Compare `"YYYY-MM-DD"` strings with `>=`, `<=`, `===` — do not round-trip through `new Date(...)` unless you specifically need Melbourne-aware calendar math, in which case use `getMelbourneDateString()`.

**Rule 5: Tests run with `TZ=Australia/Melbourne`.**

`vitest.config.ts` pins `process.env.TZ = "Australia/Melbourne"` before the worker pool starts. This means tests run in the same tz your devs use locally, and tests that assert specific date/time strings are deterministic. Do not remove this.

**Why this section exists:** on 2026-04-15 we shipped a prayer widget that called `date.getHours()` during render. The server computed the "next prayer" based on UTC hours, the client computed it based on Melbourne hours, and React hydration errored on every page load for every visitor. Root cause was a single call to a seemingly-innocent stdlib method. The rules above are the minimum discipline needed to stop this class of bug from recurring.

---

## Environment

- Local dev: npm run dev at localhost:3000
- Sanity Studio: localhost:3000/studio
- Production: Vercel (auto-deploys from main branch)
- Environment variables must be in .env.local (never committed)
- Client-side env vars must use NEXT_PUBLIC_ prefix
- Server-only env vars (Sanity write token, API secrets) must NEVER have NEXT_PUBLIC_ prefix
- **Never delete the `.next` directory** — it contains the dev compilation cache. Deleting it forces a full recompile and can expose environment-specific issues. If a stale lock file exists at `.next/dev/lock`, remove only that file, not the entire directory
- Do not modify `next.config.ts` to debug tooling issues — fix the root cause instead

---

## API Route Conventions

- All API routes go in app/api/<name>/route.ts
- Export only the HTTP methods the route supports (GET, POST, etc.)
- Validate request body with Zod or manual checks at the top of every handler
- Return NextResponse.json() with consistent shape: { data } on success, { error, status } on failure
- Always set appropriate status codes (200, 201, 400, 401, 404, 500)
- Rate limit public endpoints (contact, donations) using src/lib/rate-limiting
- Log errors server-side with context before returning generic error to client

---

## Testing

- **Vitest** + **Testing Library** (React + User Event), `jsdom` environment
- Tests co-located with source: `Button.test.tsx` next to `Button.tsx`
- Always import from `@/test/test-utils` (custom `render()` with providers, re-exports Testing Library)
- Global setup (`src/test/setup.tsx`) mocks: Next.js navigation/headers/image, all Sanity fetch functions (return `[]`/`null`), browser APIs (IntersectionObserver, ResizeObserver, matchMedia)
- `server-only` package stubbed via Vitest alias in `vitest.config.ts`
- Every new component must have tests
- Every bug fix must include a regression test
- Section component tests must mock: `framer-motion` (motion.div as plain div), `@/components/animations/FadeIn` (render children), `next/image` (render as img), and `@/sanity/lib/image` (urlFor chain returning a stub URL). Copy the mock pattern from an existing section test like `WhatsOnSection.test.tsx`
- Test mobile and desktop variants of responsive components
- Test Sanity content edge cases: missing fields, empty arrays, null references
- Test donation page states: campaigns rendering, empty campaigns, sanitization of FundraiseUp HTML
- Test loading, error, and empty states - not just the happy path
- Test accessibility: keyboard navigation, screen reader labels, focus management

### Sanity Field Wiring Tests — MANDATORY

Every component that receives Sanity data must have tests proving the wiring works. These are not optional:

1. **Sanity data renders** — Pass Sanity data as props, assert the values appear in the DOM
2. **Fallback renders** — Pass `undefined`/missing props, assert the hardcoded fallback appears
3. **Partial data** — Pass an object with some fields set and others missing, assert no crash and correct mix of Sanity + fallback content
4. **Every field individually** — If a component uses 5 Sanity fields, test each one. Don't just test the happy path where all fields are present

Example pattern for a page settings component:
```tsx
it("renders Sanity hero heading when provided", () => {
  render(<FooContent pageSettings={{ heroHeading: "Custom Title" }} />);
  expect(screen.getByText("Custom Title")).toBeInTheDocument();
});

it("renders fallback hero heading when pageSettings is undefined", () => {
  render(<FooContent />);
  expect(screen.getByText("Default Title")).toBeInTheDocument();
});

it("renders fallback hero heading when heroHeading is missing", () => {
  render(<FooContent pageSettings={{ heroDescription: "Some desc" }} />);
  expect(screen.getByText("Default Title")).toBeInTheDocument();
});
```

---

## Performance Standards

### Core Web Vitals Targets
- LCP (Largest Contentful Paint): under 2.5s
- FID (First Input Delay): under 100ms
- CLS (Cumulative Layout Shift): under 0.1

### Image Optimisation
- Always use Next.js Image component with width, height, and alt props
- Use responsive sizes prop for images that change size across viewports
- Use priority prop only for above-the-fold hero images
- Sanity images must use `urlFor()` from `src/sanity/lib/image.ts` — always chain `.width().height().url()`. Never use raw `asset._ref` strings directly
- Lazy load all below-the-fold images (default Next.js behaviour)
- Set explicit dimensions to prevent CLS

### Bundle and Loading
- Minimise 'use client' - keep as much as possible in Server Components
- Dynamic import (next/dynamic) for heavy components not needed on initial load
- Code-split by route - never import page-specific code in shared layouts
- Use tree-shakeable imports (e.g., import { Calendar } from 'lucide-react' not import * as icons)
- Flag any single component import that adds more than 50kb

### Data Fetching
- Fetch data in Server Components, pass as props to Client Components
- Use ISR (revalidate: 120) - never fetch on every request unless real-time data is needed
- Parallel fetch with Promise.all when a page needs multiple independent queries
- Never waterfall fetches - identify parallel opportunities
- Use Suspense boundaries for streaming where appropriate

---

## Accessibility Standards

- All images must have meaningful alt text (not "image" or "photo")
- All form inputs must have associated labels - never placeholder-only
- All interactive elements must have visible focus styles (focus-visible:)
- Colour contrast must meet WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- Keyboard navigation must work for all interactive elements
- Use semantic HTML: nav, main, article, section, aside, header, footer
- ARIA labels on icon-only buttons and links
- Skip-to-content link for keyboard users
- Error messages in forms must be associated with inputs via aria-describedby
- Modal/dialog focus must be trapped and returned on close
- Announce dynamic content changes with aria-live regions where appropriate

---

## SEO

- Every page must have unique metadata via Next.js Metadata API (title, description, openGraph)
- Dynamic pages must generate metadata from Sanity content
- Use semantic heading hierarchy: one h1 per page, logical h2/h3 nesting
- Structured data (JSON-LD) for organisation, events, and donation pages
- Canonical URLs on all pages
- Sitemap must be auto-generated and include all public routes
- robots.txt must exist and be correct
- Internal links should use Next.js Link component for client-side navigation
- 404 page must be helpful with navigation back to main sections

---

## Security

- Never expose API keys, tokens, or secrets in client-side code
- Use environment variables for all sensitive configuration
- Validate and sanitise all user input on both client and server
- API routes must validate request methods and body shapes
- Rate limit public-facing API routes (contact forms, donation endpoints)
- XSS prevention: never use dangerouslySetInnerHTML unless content is sanitised
- FundraiseUp HTML from Sanity must be sanitised before rendering (see FundraiseUp section)
- Sanitise Sanity Portable Text output to prevent stored XSS
- No sensitive data in URL parameters

---

## Error Handling and Resilience

- Every data-fetching component must handle: loading, success, error, and empty states
- Fetch functions never throw - return sensible defaults ([], null, fallback content)
- API routes must return consistent error shape: { error: string, status: number }
- Root error boundary lives at `src/app/error.tsx` — catches rendering errors across all routes
- Log errors with enough context to debug (route, params, user action)
- API errors must show clear human-readable messages, not raw error codes
- Network failures should show retry options, not just "something went wrong"
- Sanity content failures should fall back to src/data/content.ts, not break the page
- Never show stack traces or internal errors to users in production

---

## Cascading Changes Rule

When any structural change is made (adding, removing, or renaming a page, route, feature, or content type), trace and update ALL references across the entire codebase. Do not ask - just do it.

### When removing a page/route:
- Delete the app/<route>/ directory and all its files
- Remove or update the Sanity schema if it powered that page's content
- Update navigation menus (header, footer, mobile nav) to remove links
- Update src/data/content.ts to remove fallback content for that page
- Remove related GROQ queries in src/sanity/lib/queries.ts
- Remove related types from src/types/sanity.ts
- Remove or update any internal links pointing to that route across all components
- Remove or update related API routes in app/api/
- Update sitemap generation to exclude the removed route
- Remove related test files
- Check for any context providers that reference that page's data
- Update any breadcrumb or sidebar navigation components
- Add a redirect from the old path to an appropriate page in next.config if the page was public-facing

### When adding a page/route:
- Create app/<route>/page.tsx (Server Component) and <Route>Content.tsx (Client Component)
- Create the Sanity schema in src/sanity/schemas/ and register it in src/sanity/schemas/index.ts
- Add GROQ query in src/sanity/lib/queries.ts
- Add types in src/types/sanity.ts
- Add fallback content in src/data/content.ts
- Add navigation links in header, footer, and mobile nav
- Add API routes in app/api/ if the page needs server endpoints
- Add metadata for SEO (title, description, openGraph)
- Add test files for the new components
- Ensure the page is mobile-responsive from the start
- Add structured data (JSON-LD) if applicable

### When renaming a page/route:
- Treat as remove old + add new
- Add a redirect from the old path to the new path in next.config
- Update all internal links, navigation, and Sanity references
- Update tests to use the new route/names

### When modifying a Sanity schema:
- Update the corresponding GROQ queries to include new/renamed fields
- Update TypeScript types in src/types/sanity.ts
- Update fallback content in src/data/content.ts if fields changed
- Update all components that consume that schema's data
- **Verify the page.tsx server component passes the new data as props** — this is the most commonly missed step
- Handle migration of existing published content if fields are renamed/removed
- Check that null/undefined handling still works for changed fields
- Write tests proving the new field renders when set AND falls back when missing
- Verify Sanity Studio still works at /studio
- Verify the revalidation webhook handles this document type (check `validDocumentTypes` and `documentTypeToPath` in `src/app/api/revalidate/route.ts`)

### When adding/removing a component:
- Update all pages and sections that use it
- Update or create tests
- Remove unused imports across the codebase
- Check for orphaned styles or utilities

### Data flow trace for every structural change:
```
Sanity Schema -> GROQ Query -> types/sanity.ts -> fetch function -> page.tsx -> Content.tsx -> child components -> navigation -> API routes -> fallback content -> tests -> sitemap -> SEO metadata
```
Every link in this chain must be consistent. Do not leave orphaned references.

---

## Code Quality Gates

Before considering any task complete:

1. `npm run type-check` passes with zero errors
2. `npm run lint` passes with zero warnings
3. `npm run test:run` passes with zero failures
4. No console.log statements left in code (use proper error logging)
5. No commented-out code left behind
6. No TODO comments without a clear plan
7. No unused imports, variables, or functions
8. All new user-facing strings are free of typos
9. No hardcoded strings that should come from Sanity - if content is editable, it belongs in the CMS

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`): checkout -> Node 20 -> `npm ci` -> type-check -> lint -> test:run -> build. Runs on push/PR to `main`.

Branch naming: `feature/<name>`, `fix/<name>`, `update/<name>`, `refactor/<name>`.

### Branch Workflow — MANDATORY

Every new branch must start from the latest remote `main`. Every push must be validated. Never skip these steps.

**Creating a new branch:**
```bash
git fetch origin main
git checkout main
git pull origin main        # Always pull latest remote into local main
git checkout -b <branch>    # Branch from up-to-date main
```

**Before committing:**
```bash
npm run validate             # type-check -> lint -> test:run -> build
```

**Before pushing:**
```bash
git fetch origin main
git rebase origin/main       # Ensure branch has latest production changes
npm run validate             # Re-validate after rebase
git push
```

**Resuming work on an existing branch:**
```bash
git fetch origin main
git rebase origin/main       # Pull latest production changes into branch
npm run validate             # Confirm build is good after rebase
```

Never push without running `npm run validate` first. Never create a branch from a stale local `main` — always `git pull origin main` first. Never push commits that were made after a PR was already merged — they will be orphaned on the remote branch and never reach production.

---

## When Making Any Change in This Project

1. Check if it affects mobile layout - test at 375px, 768px, 1024px
2. **Check if it touches Sanity content** - verify schema, GROQ query, type, fetch function, page.tsx prop passing, component rendering, AND tests. If ANY link in this chain is missing, fix it before committing. See "Sanity CMS Rules" for the full checklist
3. Check if it affects the donate page or FundraiseUp integration
4. Check if tests exist for the affected code - add or update them (co-located, import from @/test/test-utils)
5. Check if TypeScript types in src/types/sanity.ts need updating
6. Check for cascading changes - trace the full data flow and update everything
7. Check accessibility - keyboard nav, focus styles, labels, contrast
8. Check SEO metadata if a page title, description, or route changed
9. Check performance - no unnecessary client components, images optimised, no bundle bloat
10. Run npm run validate before committing
11. Check stega is not breaking string comparisons on the client
12. **If adding/modifying Sanity fields**: Verify the revalidation webhook handles the document type, and verify page.tsx actually passes the data to the client component

---

## Corrections Log

<!-- When Claude makes a mistake, ask "what rule in CLAUDE.md caused this or failed to prevent it?" then add the correction here so it never happens again -->

1. **Stale local main caused orphaned commits (2026-03-18):** Created `fix/site-updates` from local `main` without pulling latest remote first. This meant the branch was missing commits that had been merged via PR on GitHub. Additionally, commits pushed to `feature/live-donations-api` after its PR was already merged never reached `main`. **Fix:** Added mandatory branch workflow in CI/CD section — always `git pull origin main` before branching, always rebase onto `origin/main` before pushing.

2. **Sanity fields created but never wired to frontend (2026-04-02):** Schema fields, GROQ queries, fetch functions, and TypeScript types were all created for page settings singletons, but the final step — passing fetched data as props from `page.tsx` to the client component — was missed for 6 pages (homepage, visit, imams, partners, services, worshippers). Fields existed in Sanity Studio but changing them had zero effect on the live site. The homepage `AboutPreviewSection` was rendered as `<AboutPreviewSection />` (no props) instead of `<AboutPreviewSection welcomeSection={homepageSettings?.welcomeSection} />`. **Fix:** Added "Sanity CMS Rules" section with mandatory end-to-end checklist for every field, explicit verification step for page.tsx prop passing, and mandatory wiring tests. The rule: a Sanity field is not "done" until changing its value in Studio changes what appears on the site.

3. **Revalidation webhook only busted page cache, not data cache (2026-04-01):** The `/api/revalidate` webhook called `revalidatePath()` but not `revalidateTag()`. In Next.js App Router, these bust separate caches — `revalidatePath` busts the rendered HTML cache, but `revalidateTag` busts the fetch data cache. Without both, pages would re-render using stale cached Sanity data. **Fix:** Added `revalidateTag("sanity")` and `revalidateTag(documentType)` calls to the webhook handler. Both are required for Sanity content changes to reflect immediately.

4. **Framer Motion dynamic values cause hydration mismatch (2026-04-14):** `ScrollProgress` component used `motion.div` with `style={{ scaleX }}` where `scaleX` came from `useSpring(useScroll().scrollYProgress)`. On the server, Framer Motion renders a `<div>` with static inline styles. On the client, it injects different dynamic styles during hydration. Because `ScrollProgress` was a direct child in the root layout (sibling of `<main>`), the attribute mismatch caused React to lose its place in the DOM tree — it expected `<main>` but found `<section>` (the hero), producing a "Recoverable Error: Hydration failed" warning. **Fix:** Added rule to Animation Conventions: any `motion.*` component using dynamic motion values (`useScroll`, `useSpring`, `useTransform`, `useMotionValue`) must defer rendering until after mount. The `ScrollProgress` component was later removed entirely.

5. **Timezone-local `Date` APIs in render caused site-wide hydration errors (2026-04-16):** The prayer widget — mounted in the root layout and therefore rendered on every page — called `date.getHours() * 60 + date.getMinutes()` inside `getNextPrayer()`. Vercel's Node runs in UTC, users' browsers run in Melbourne, so the two environments computed a different "current minute of day" → different "next prayer" name → different SSR vs hydration HTML. Sentry issue AIC-WEBSITE-1 fired 112+ times across every browser/device/geo in 24 hours before we caught it. Secondary issues: `parsePrayerTimeToDate()` used `setHours()` with runtime-local tz, and the "in X min" countdown text was computed from `Date.now()` during render. **Fix:** (1) Added the "Dates and hydration" section above with strict rules banning timezone-local `Date` methods outside `lib/time.ts`. (2) Extracted all Melbourne-aware helpers into `src/lib/time.ts` as the single source of truth. (3) Added a `useIsMounted()` hook from the same module for gating `Date.now()`-dependent render output. (4) Pinned `process.env.TZ = "Australia/Melbourne"` in `vitest.config.ts` so tests are deterministic across dev and CI. The rule is now: if a component needs to know "what time is it", it imports a helper from `lib/time.ts` — it does not call `Date` methods directly.

6. **GROQ `now()` created a 10-hour Melbourne-midnight skew on event auto-hide (2026-04-17):** Event/program queries used `string::split(string(now()), "T")[0]` to extract "today's date" for filtering. `now()` returns UTC, so between Melbourne midnight (00:00 AEST/AEDT) and UTC midnight — roughly 10 hours each day — the extracted date was *yesterday* in Melbourne terms. An admin setting an event to end on April 19 would see it keep showing until 10am on April 20 (= UTC midnight). **Fix:** Changed all date-filtering queries (`eventsQuery`, `featuredEventsQuery`, `programsQuery`) to accept a `$today` parameter. Fetch functions compute `today = getMelbourneDateString()` server-side and pass it in. The datetime-comparison queries (`expiresAt > now()` on announcements) are unchanged — `datetime` fields are already UTC-anchored, so `now()` is correct for them. New rule in "Dates and hydration" documents this split.
