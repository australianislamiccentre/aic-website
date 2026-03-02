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

Five schemas are singletons (one document each): `siteSettings`, `prayerSettings`, `donationSettings`, `donatePageSettings`, `formSettings`. They use `.documentId("schemaName")` in the desk structure (`sanity.config.ts`) and are fetched with `_id == "schemaName"` in GROQ queries.

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

- Any UI change that displays Sanity content must account for the schema in src/sanity/schemas/
- When adding new content sections, create or update the Sanity schema FIRST, then build the UI
- Handle missing/null content gracefully - never crash if a Sanity field is empty
- Use the fallback pattern: Sanity data -> src/data/content.ts defaults via context
- Portable Text fields must use a proper serializer, not raw rendering
- When renaming or restructuring content, consider existing published data migration
- GROQ queries must be efficient - only fetch the fields you need, avoid *
- New queries go in src/sanity/lib/queries.ts, never inline in components
- Types for new schemas must be added to src/types/sanity.ts
- Sanity Studio customisation (desk structure, input components) lives in src/sanity/
- Validate that Sanity Studio still works at /studio after schema changes

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
- Update the corresponding GROQ queries
- Update TypeScript types in src/types/sanity.ts
- Update fallback content in src/data/content.ts if fields changed
- Update all components that consume that schema's data
- Handle migration of existing published content if fields are renamed/removed
- Check that null/undefined handling still works for changed fields
- Verify Sanity Studio still works at /studio

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

---

## When Making Any Change in This Project

1. Check if it affects mobile layout - test at 375px, 768px, 1024px
2. Check if it touches Sanity content - verify schema in src/sanity/schemas/
3. Check if it affects the donate page or FundraiseUp integration
4. Check if tests exist for the affected code - add or update them (co-located, import from @/test/test-utils)
5. Check if TypeScript types in src/types/sanity.ts need updating
6. Check for cascading changes - trace the full data flow and update everything
7. Check accessibility - keyboard nav, focus styles, labels, contrast
8. Check SEO metadata if a page title, description, or route changed
9. Check performance - no unnecessary client components, images optimised, no bundle bloat
10. Run npm run validate before committing
11. Check stega is not breaking string comparisons on the client

---

## Corrections Log

<!-- When Claude makes a mistake, ask "what rule in CLAUDE.md caused this or failed to prevent it?" then add the correction here so it never happens again -->
