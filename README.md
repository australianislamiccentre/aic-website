# Australian Islamic Centre — Website

Community website for the Australian Islamic Centre (AIC) in Newport, Melbourne. Built with Next.js 16, Sanity CMS, and deployed on Vercel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| CMS | [Sanity](https://sanity.io) (embedded Studio at `/studio`) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Animations | [Framer Motion](https://motion.dev) |
| Email | [Resend](https://resend.com) |
| Donations | [FundraiseUp](https://fundraiseup.com) |
| Testing | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Deployment | [Vercel](https://vercel.com) |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (Next.js + Sanity Studio)
npm run dev

# Open the site
open http://localhost:3000

# Open Sanity Studio
open http://localhost:3000/studio
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Public (safe in browser)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Sanity (server-only)
SANITY_API_READ_TOKEN=
SANITY_PREVIEW_SECRET=
SANITY_REVALIDATE_SECRET=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_AUDIENCE_ID=

# Form recipients
CONTACT_FORM_TO_EMAIL=
FORM_TO_EMAIL=
SERVICE_INQUIRY_TO_EMAIL=
SUBSCRIBE_TO_EMAIL=

# YouTube
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Check linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run type-check` | TypeScript type checking |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run validate` | Run all checks (types + lint + tests + build) |

## Project Structure

```
src/
├── app/                    # Routes (Next.js App Router)
│   ├── page.tsx            #   Homepage
│   ├── events/             #   Events listing + detail pages
│   ├── services/           #   Services listing + detail pages
│   ├── announcements/      #   Announcements listing + detail pages
│   ├── donate/             #   Donation page (FundraiseUp)
│   ├── worshippers/        #   Prayer times
│   ├── imams/              #   Team members
│   ├── media/              #   Gallery + YouTube videos
│   ├── visit/              #   Mosque etiquette guide
│   ├── contact/            #   Contact form
│   ├── api/                #   API routes (forms, webhooks, draft mode)
│   └── studio/             #   Sanity Studio (embedded CMS)
├── components/
│   ├── ui/                 #   Base components (Button, Card, Input, etc.)
│   ├── sections/           #   Homepage sections (16 components)
│   ├── layout/             #   Header + Footer
│   └── animations/         #   Framer Motion wrappers
├── sanity/
│   ├── schemas/            #   CMS content type definitions (16 types)
│   └── lib/                #   Client, GROQ queries, fetch functions
├── lib/                    #   Utilities (validation, email, rate-limit)
├── contexts/               #   React Context (site settings, form config)
├── hooks/                  #   Custom hooks (prayer times, scroll animation)
├── data/                   #   Hardcoded fallback content
├── types/                  #   TypeScript interfaces
└── test/                   #   Test setup and utilities
```

## Architecture

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for detailed diagrams covering:

- System overview (Sanity → Vercel → Browser)
- Data fetching pipeline with ISR caching
- On-demand revalidation via Sanity webhooks
- Form submission security pipeline
- Draft mode preview flow
- Server vs client component split
- Environment variable reference

### Key patterns

**Sanity-first with fallback** — Pages fetch from Sanity CMS. If Sanity returns empty data or is unreachable, hardcoded defaults from `src/data/content.ts` keep the site functional.

**ISR as the only cache** — Sanity CDN is disabled (`useCdn: false`). Next.js ISR handles all caching with a 120-second TTL plus instant on-demand revalidation via webhook.

**Server + Client split** — `page.tsx` files are Server Components that fetch data. `*Content.tsx` files are Client Components that handle interactivity (filters, forms, animations).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, events, services, announcements |
| `/events` | Events listing with filters |
| `/events/[slug]` | Event detail with calendar, contact form |
| `/services` | Services listing |
| `/services/[slug]` | Service detail with inquiry form |
| `/announcements` | Announcements listing |
| `/announcements/[slug]` | Announcement detail with share button |
| `/donate` | Donation page (FundraiseUp widget) |
| `/worshippers` | Prayer times with date picker |
| `/imams` | Team members |
| `/media` | Photo gallery + YouTube videos |
| `/visit` | Mosque visiting etiquette |
| `/contact` | Contact form |
| `/about` | About the AIC |
| `/architecture` | Mosque architecture |
| `/partners` | Partner organisations |
| `/studio` | Sanity CMS Studio |

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/contact` | POST | Contact form (rate-limited, honeypot) |
| `/api/event-inquiry` | POST | Event inquiry from detail page |
| `/api/service-inquiry` | POST | Service inquiry from detail page |
| `/api/subscribe` | POST | Newsletter signup (Resend audience) |
| `/api/revalidate` | POST | Sanity webhook for ISR invalidation |
| `/api/draft` | GET/POST | Enable draft mode (preview unpublished) |
| `/api/disable-draft` | POST | Exit draft mode |

## Testing

Tests are co-located with source files (e.g., `Button.test.tsx` next to `Button.tsx`).

```bash
# Run all tests
npm run test:run

# Watch mode
npm run test

# Coverage report
npm run test:coverage
```

The test setup (`src/test/setup.tsx`) automatically mocks:
- Next.js modules (navigation, headers, image)
- All Sanity fetch functions (return empty arrays)
- Browser APIs (IntersectionObserver, ResizeObserver, matchMedia)

Import test utilities from one place:
```ts
import { render, screen, userEvent } from "@/test/test-utils";
```

## Deployment

Deployed on **Vercel** with automatic preview deployments for every PR.

- **Production**: merging to `main` triggers a production deploy
- **Preview**: every PR gets a unique preview URL
- **CI**: GitHub Actions runs type-check, lint, tests, and build on every PR

### Sanity Webhook Setup

For instant content updates, configure a Sanity webhook:
- **URL**: `https://your-domain.com/api/revalidate?secret=YOUR_SECRET`
- **Trigger**: On publish/unpublish
- **Dataset**: production

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the development workflow, branch naming, and troubleshooting.

## Documentation

Every source file has JSDoc documentation. Hover over any function or component in VS Code to see its purpose, parameters, and cross-references.

For the full architecture with visual diagrams, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.
