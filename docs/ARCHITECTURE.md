# Architecture

Visual overview of how data flows through the AIC website — from Sanity CMS to the browser.

---

## System Overview

```mermaid
graph TB
    subgraph CMS["Sanity CMS (sanity.io)"]
        Studio["Sanity Studio<br/>/studio"]
        CDN["Sanity API"]
    end

    subgraph Vercel["Vercel (Edge + Serverless)"]
        MW["Edge Middleware<br/>Security headers + CSP"]
        ISR["Next.js ISR Cache<br/>120s revalidate"]
        Pages["Server Components<br/>page.tsx files"]
        API["API Routes<br/>/api/*"]
    end

    subgraph External["External Services"]
        Resend["Resend<br/>Email delivery"]
        FU["FundraiseUp<br/>Donation widget"]
        YT["YouTube API<br/>Channel videos"]
    end

    subgraph Browser["User's Browser"]
        Client["Client Components<br/>Interactive UI"]
        Prayer["Prayer Times<br/>Client-side calculation"]
    end

    Studio -->|"publish/update"| CDN
    CDN -->|"webhook POST /api/revalidate"| API
    API -->|"revalidatePath()"| ISR
    CDN -->|"GROQ fetch"| Pages
    Pages -->|"HTML + RSC payload"| ISR
    ISR -->|"cached response"| MW
    MW -->|"+ security headers"| Browser
    Pages -->|"hydrate"| Client
    API -->|"send emails"| Resend
    Client -->|"form POST"| API
    FU -->|"donation modal"| Browser
    YT -->|"video data"| Pages
```

---

## Data Fetching Pipeline

Every page follows the same pattern: **Sanity first, fallback if empty**.

```mermaid
sequenceDiagram
    participant B as Browser
    participant V as Vercel (ISR)
    participant F as fetch.ts
    participant S as Sanity API
    participant D as data/content.ts

    B->>V: GET /events
    V->>V: Check ISR cache (120s TTL)

    alt Cache hit
        V-->>B: Cached HTML
    else Cache miss or stale
        V->>F: getEvents()
        F->>S: GROQ query via client.fetch()
        S-->>F: SanityEvent[]

        alt Sanity returns data
            F-->>V: events[]
        else Sanity empty or error
            F-->>V: []
            V->>D: Use fallback content
            D-->>V: hardcoded events
        end

        V-->>B: Fresh HTML (cache updated)
    end
```

---

## On-Demand Revalidation

When content is published in Sanity, pages update instantly — no need to wait for the 120s TTL.

```mermaid
sequenceDiagram
    participant E as Editor (Sanity Studio)
    participant S as Sanity Webhook
    participant R as /api/revalidate
    participant C as ISR Cache

    E->>S: Publish event "Jumuah Prayer"
    S->>R: POST with document type + secret
    R->>R: Validate SANITY_REVALIDATE_SECRET
    R->>R: Map document type → paths
    Note over R: "event" → ["/", "/events"]

    R->>C: revalidatePath("/")
    R->>C: revalidatePath("/events")
    C-->>R: Cache invalidated
    R-->>S: 200 OK
```

**Document type → path mapping:**

| Document Type | Revalidated Paths |
|---------------|-------------------|
| `event` | `/`, `/events` |
| `announcement` | `/`, `/announcements` |
| `service` | `/`, `/services` |
| `teamMember` | `/`, `/imams` |
| `galleryImage` | `/`, `/media` |
| `faq` | `/` |
| `siteSettings` | `/` (all pages via layout) |
| `prayerSettings` | `/worshippers` |
| `donationCampaign` | `/`, `/donate` |

---

## Form Submission Pipeline

All four form endpoints (`/api/contact`, `/api/event-inquiry`, `/api/service-inquiry`, `/api/subscribe`) follow the same pipeline.

```mermaid
flowchart TD
    A[User submits form] --> B{Honeypot filled?}
    B -->|Yes = bot| C[Return fake 200 OK]
    B -->|No| D{Form enabled in Sanity?}
    D -->|Disabled| E[Return 403]
    D -->|Enabled| F{Rate limit OK?}
    F -->|Exceeded| G[Return 429]
    F -->|OK| H[Validate fields]
    H -->|Invalid| I[Return 400 + errors]
    H -->|Valid| J[Send admin email via Resend]
    J --> K[Send user confirmation email]
    K --> L[Return 200 OK]

    style C fill:#fbbf24,color:#000
    style E fill:#ef4444,color:#fff
    style G fill:#ef4444,color:#fff
    style I fill:#ef4444,color:#fff
    style L fill:#10b981,color:#fff
```

**Security layers (in order):**
1. **Honeypot** — invisible field traps bots, returns fake success
2. **Form toggle** — forms can be disabled from Sanity dashboard
3. **Rate limit** — 5 requests per hour per IP (in-memory Map)
4. **Validation** — required fields, email format, max lengths
5. **CSP** — Content Security Policy set by Edge middleware

---

## Draft Mode (Preview)

Editors can preview unpublished Sanity content before it goes live.

```mermaid
sequenceDiagram
    participant E as Editor in Sanity Studio
    participant D as /api/draft
    participant N as Next.js
    participant P as Preview Client
    participant B as Browser with Banner

    E->>D: POST (from Presentation tool iframe)
    D->>D: Validate origin header
    D->>N: Enable draftMode() cookie
    N-->>B: Redirect to page

    B->>N: GET /events (with draft cookie)
    N->>N: Detect draftMode().isEnabled
    N->>P: Use previewClient (stega enabled)
    P-->>N: Unpublished + published content
    N-->>B: Page with preview banner

    B->>B: Click "Exit Preview"
    B->>D: POST /api/disable-draft
    D->>N: Disable draftMode() cookie
    N-->>B: Normal mode restored
```

---

## Client Architecture

```mermaid
graph LR
    subgraph Server["Server Components (page.tsx)"]
        Fetch["Sanity fetch<br/>getEvents(), getServices()..."]
        RSC["Server render<br/>HTML + RSC payload"]
    end

    subgraph Client["Client Components (*Content.tsx)"]
        State["React state<br/>filters, search, tabs"]
        Anim["Framer Motion<br/>scroll animations"]
        Forms["Form handlers<br/>POST to /api/*"]
    end

    subgraph Contexts["React Context"]
        Site["SiteSettingsContext<br/>logo, social links"]
        Form["FormSettingsContext<br/>form config, recipients"]
    end

    subgraph Hooks["Custom Hooks"]
        Prayer["usePrayerTimes<br/>client-side calculation"]
        Scroll["useScrollAnimation<br/>IntersectionObserver"]
    end

    Fetch --> RSC
    RSC -->|"props"| Client
    Contexts -->|"useContext"| Client
    Hooks -->|"state"| Client
```

**Server vs Client split:**
- **Server Components** (`page.tsx`) — fetch data from Sanity, generate static HTML
- **Client Components** (`*Content.tsx`) — handle interactivity (filters, forms, animations)
- **Contexts** — provide site-wide settings without prop drilling
- **Hooks** — encapsulate reusable client-side logic

---

## File Organisation

```
src/
├── app/                    # Routes (Next.js App Router)
│   ├── page.tsx            # Homepage (server component)
│   ├── events/
│   │   ├── page.tsx        # Server: fetch events
│   │   └── EventsContent   # Client: filters, search
│   └── api/                # API routes (serverless)
├── components/
│   ├── ui/                 # Base components (Button, Card, Input)
│   ├── sections/           # Homepage sections (16 components)
│   ├── layout/             # Header + Footer
│   └── animations/         # Framer Motion wrappers
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Pure utilities (no React)
├── sanity/
│   ├── schemas/            # CMS content type definitions
│   └── lib/                # Client, queries, fetch functions
├── data/                   # Hardcoded fallback content
├── types/                  # TypeScript interfaces
└── test/                   # Test utilities and setup
```

---

## Environment Variables

### Public (available in browser)
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project identifier |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (`production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version (`2024-01-01`) |
| `NEXT_PUBLIC_BASE_URL` | Site URL (for CSP, preview links) |

### Secret (server-only)
| Variable | Purpose |
|----------|---------|
| `SANITY_API_READ_TOKEN` | Sanity read token (draft mode) |
| `SANITY_PREVIEW_SECRET` | Shared secret for draft mode entry |
| `SANITY_REVALIDATE_SECRET` | Shared secret for ISR webhook |
| `RESEND_API_KEY` | Resend email API key |
| `RESEND_FROM_EMAIL` | Verified sender email address |
| `RESEND_AUDIENCE_ID` | Resend audience for newsletter |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `YOUTUBE_CHANNEL_ID` | AIC YouTube channel ID |
| `CONTACT_FORM_TO_EMAIL` | Contact form recipient |
| `FORM_TO_EMAIL` | General form recipient |
| `SERVICE_INQUIRY_TO_EMAIL` | Service inquiry recipient |
| `SUBSCRIBE_TO_EMAIL` | Newsletter notification recipient |

---

## Key Design Decisions

### Why ISR instead of Sanity CDN?
Next.js ISR is the **only** caching layer (`useCdn: false` on all Sanity clients). This gives us:
- On-demand revalidation via webhook (instant updates)
- Consistent cache behaviour (one TTL to reason about)
- No stale CDN edge cache to debug

### Why stega disabled on production client?
Sanity's stega feature injects invisible zero-width characters into strings for Visual Editing. This breaks client-side string comparisons (`===`, `.includes()`) because `"Education"` becomes 1,241 characters. Stega is only enabled on the `previewClient` used during draft mode.

### Why in-memory rate limiting?
Serverless functions on Vercel don't share memory across instances. The current in-memory Map rate limiter works for light traffic but won't prevent distributed attacks. For higher traffic, consider upgrading to Redis (Upstash) or Vercel KV.

### Why fallback content?
If Sanity is unreachable or returns empty data, pages still render with sensible defaults from `src/data/content.ts`. This prevents blank pages during CMS outages.
