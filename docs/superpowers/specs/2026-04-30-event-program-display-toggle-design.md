# Event / Program Display Toggle — Design

**Date:** 2026-04-30
**Branch:** `feature/event-program-display-toggle`
**Status:** Draft, awaiting user review

---

## Problem

A single Sanity document type (`event`) powers both the Events page (`/events`) and the homepage Programs section. Today, placement is **implicit**:

- A document with `eventType: "recurring"` always shows on `/events` in the "Weekly Programs" section.
- A document with `eventType: "recurring"` AND `featured: true` AND a category in `["Education", "Youth", "Sports", "Women"]` *additionally* shows on the homepage Programs strip.
- The admin has no way to make a program that does **not** appear on `/events`, or an event that doesn't follow the program rules.

This is causing real confusion: the admin reports a program incorrectly appearing on the Events page with no way to remove it without breaking its program listing.

The conflation also leaks into copy — the events page hero says "Events & Programs" and the Weekly Programs section is just a filter on the same dataset. There is no source of truth that says "this is a program, not an event."

## Goals

1. Give the admin **explicit control** over where each item appears.
2. Replace the implicit "recurring + certain category = program" rule with an explicit field.
3. Reflect this distinction in Sanity Studio so admin sees Programs and Events as separate things to manage.
4. Migrate existing documents so the live site visually matches today's behaviour on day one.
5. No regressions to any other event-related feature (homepage events strip, event detail pages, registration flow, etc.).

## Non-goals

- Splitting `event` into two separate document types. We're keeping a single schema and using a discriminator field. (Rationale: ~80% field overlap, single migration, lower change blast radius. If programs grow their own fields later, we revisit.)
- Adding a new `/programs` route. The homepage Programs section + Programs folder in Studio is the current product surface; a dedicated public listing page is out of scope.
- Renaming the schema name (`event`). Cosmetic-only; not worth the migration churn.
- Touching unrelated schemas, plugins, or any of the broader Sanity audit work. Those are separate projects.

---

## Solution

### 1. Schema field: `displayAs`

Add a new `string` field on the `event` schema with a radio layout. **Required validation is added in a later phase** (see "Migration sequencing" below) — phase 1 ships without `Rule.required()` so old documents that haven't been migrated yet don't throw validation errors in Studio.

```ts
defineField({
  name: "displayAs",
  title: "Display As",
  type: "string",
  initialValue: "event",
  description:
    'Controls where this item appears on the website. "Program" shows in the homepage Programs section only. "Event" shows on the Events page only. "Both" shows in both places.',
  options: {
    list: [
      {
        title: "Program — only show in Programs sections (homepage Programs strip)",
        value: "program",
      },
      {
        title: "Event — only show on the Events page (and homepage Events sections)",
        value: "event",
      },
      {
        title: "Both — show as a Program and an Event across the site",
        value: "both",
      },
    ],
    layout: "radio",
  },
  // Phase 3 only: validation: (Rule) => Rule.required().error("Please select where this should be displayed"),
}),
```

**Placement in schema:** directly under `featured`, above the Hero Image section. Reasoning: it's a placement/visibility control, same conceptual group as `active` and `featured`.

**`initialValue: "event"`** is the global default for documents created outside either folder. The Programs folder's initial-value template (see §2) overrides this to `"program"`.

### 2. Desk structure: split into Programs and Events folders

Both folders read from `_type == "event"` but filter by `displayAs`. Update `sanity.config.ts`:

```
📋 Programs
   ├─ Live on Website        // displayAs in ["program", "both"] && active && eligible date
   ├─ Inactive               // displayAs in ["program", "both"] && active == false
   └─ Expired                // displayAs in ["program", "both"] && past recurringEndDate / endDate
📅 Events
   ├─ Live on Website        // displayAs in ["event", "both"] && active && upcoming
   ├─ Inactive               // displayAs in ["event", "both"] && active == false
   └─ Expired                // displayAs in ["event", "both"] && past date / endDate
```

A `displayAs: "both"` document is visible in **both** folders (same underlying document — edit once, updates everywhere). Cleaner than a third "Both" folder.

**Note on desk filters and timezones:** the existing Events folder filters in `sanity.config.ts` use the inline UTC pattern `string::split(string(now()), "T")[0]` — desk filters can't accept query parameters, so they can't use the `$today` Melbourne-aware pattern that runtime queries use (per CLAUDE.md correction #9). The new Programs folder filters will use the same inline pattern for consistency. This means the desk's "Live on Website" / "Expired" classification can drift from what the live site shows by up to 10 hours around Melbourne midnight — a known existing minor admin annoyance, not new in this work, not in scope to fix here.

**Initial value templates:** when admin clicks **+ New** inside the Programs folder, the new document opens with `displayAs` pre-set to `"program"`. Same for Events → `"event"`. Implemented via Sanity's `initialValueTemplate` mechanism — define one template per folder in `sanity.config.ts` and reference it in `S.documentTypeList(...).initialValueTemplates([...])`. The plan will spell out the exact API.

### 3. Document preview: badge for "both"

Update the `prepare()` function in `event.ts`. Today the subtitle says "📋 Program — Mondays" or "2026-05-15 → 2026-05-17". Add to that:

- `displayAs: "program"` → prefix with `📋 Program`
- `displayAs: "event"` → prefix with `📅 Event`
- `displayAs: "both"` → prefix with `⚡ Program & Event`

This means when admin scrolls the Programs folder, the ⚡ icon immediately shows which docs also appear on the Events page.

### 4. Query changes

#### `programsQuery` (`src/sanity/lib/queries.ts:180`)

This query feeds the homepage Programs strip — it's the *featured-programs-on-homepage* equivalent of `featuredEventsQuery`.

**Before:**
```groq
*[_type == "event" && active != false && featured == true && eventType == "recurring" && (
  "Education" in categories ||
  "Youth" in categories ||
  "Sports" in categories ||
  "Women" in categories
) && (recurringEndDate == null || recurringEndDate >= $today)]
```

**After:**
```groq
*[_type == "event" && active != false && featured == true && displayAs in ["program", "both"] && (
  recurringEndDate == null || recurringEndDate >= $today
)]
```

Notes:
- **Keeps `featured == true`.** The homepage Programs strip should still be a curated list, not every program. This mirrors `featuredEventsQuery` (which also requires `featured == true` for the homepage events strip). When/if a public `/programs` listing page is built, that page would use a separate query without the `featured` requirement to show all programs.
- Drops the four-category whitelist. A program in any category is now allowed. The category filter belonged to the implicit rule we're removing.
- Drops `eventType == "recurring"`. In practice every program *will* be recurring, but the field no longer controls placement — `displayAs` does. If admin wants a one-off "program" (rare, e.g. a 3-week intensive), they can.
- Keeps the `recurringEndDate` cutoff so expired programs disappear automatically.

**Symmetry with events queries (worth eyeballing as a sanity check):**

| Query | Active | Featured | Display flag | Date filter |
| ----- | ------ | -------- | ------------ | ----------- |
| `eventsQuery` | yes | — | `displayAs in ["event","both"]` | not-past (date / endDate / recurringEndDate) |
| `featuredEventsQuery` | yes | yes | `displayAs in ["event","both"]` | not-past |
| `programsQuery` | yes | yes | `displayAs in ["program","both"]` | not-past (recurringEndDate only) |

#### `eventsQuery` (`src/sanity/lib/queries.ts:71`)

Add a `displayAs in ["event", "both"]` filter:

```groq
*[_type == "event" && active != false && displayAs in ["event", "both"] && (
  (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= $today)) ||
  date >= $today ||
  endDate >= $today
)]
```

Effect: programs marked `displayAs: "program"` no longer appear on the Events page. Programs marked `displayAs: "both"` continue to appear in the "Weekly Programs" section.

#### `featuredEventsQuery` (`src/sanity/lib/queries.ts:103`)

Same `displayAs` filter as `eventsQuery`. The homepage events strip should match the events page — both honour the toggle.

#### `eventBySlugQuery` (`src/sanity/lib/queries.ts:35`)

**No change.** The detail page works for any event/program regardless of placement — direct URL access (`/events/<slug>`) should always work. This means a program shared via direct link still has a working page even if it's hidden from the events listing. (If we later want to gate detail-page access by `displayAs`, that's a separate decision.)

### 5. EventsContent local filter cleanup

`src/app/events/EventsContent.tsx:402-403` currently splits events into upcoming vs. recurring locally. **No change to this logic** — but with the new query filter, the input list will already exclude `displayAs: "program"` items, so the "Weekly Programs" section will only show programs that are flagged `"both"` (i.e. ones the admin explicitly opted in to both views).

Add a small note above this filter explaining why programs may be absent from the recurring section (admin chose `displayAs: "program"`).

### 6. Schema description cleanup

Remove the misleading lines in `event.ts`:

- `categories` field description (line 128): "IMPORTANT: Recurring events with Education, Youth, Sports, or Women categories are automatically treated as Programs..." — **delete the IMPORTANT sentence**, the auto-treatment is gone.
- `eventType` field description (line 172): "...To create a PROGRAM (e.g. weekly Quran class), select 'Recurring' and choose Education, Youth, Sports, or Women as the category — it will automatically appear in the Programs section..." — **rewrite** to point at the new `displayAs` field.

### 7. TypeScript types

`SanityProgram` is currently a type alias: `export type SanityProgram = SanityEvent;` — so we only edit `SanityEvent`. Add:

```ts
displayAs?: "program" | "event" | "both";
```

**Optional in TypeScript** even though long-term every document will have it. Reasons:

1. During phase 1 → phase 2 (deploy → migrate), unmigrated documents return `undefined` for this field at runtime. Strict typing would force every consumer to handle `undefined` explicitly anyway.
2. The runtime fallback (treat missing as `"event"`) keeps the site safe without forcing assertions.

After phase 3 (validation tightened), we can revisit and drop the `?` — but only if zero docs in production are missing the field. That's a small follow-up, not blocking.

### 8. Migration script

A one-off Node script at `scripts/migrate-event-display-as.ts` using `client.patch(id).set({displayAs}).commit()`. **Read-only by default** — runs in dry-run mode unless invoked with `--apply`.

**Migration rule (Option B from brainstorm):**

```
For each event document:
  if eventType === "recurring" AND categories includes any of ["Education","Youth","Sports","Women"]:
    displayAs = "program"
  else:
    displayAs = "event"
```

Rationale: matches the *intent* of the old auto-rule. Admin reviews after and toggles individual docs to `"both"` if needed. A migration to `"both"` for every recurring item would over-list programs on `/events`; a migration to `"event"` for everything would under-list programs on the homepage.

**Script behaviour (per CLAUDE.md seed-script rules):**

1. Query Sanity for all `_type == "event"` documents. List the count and a sample.
2. Group by computed migration target: how many will become `"program"`, how many `"event"`, how many already have `displayAs` set (skip these).
3. Print the full plan to stdout: each document ID, current state, target `displayAs`. **Wait for user approval.**
4. On `--apply`: patch each document with `client.patch(id).set({displayAs: <value>}).commit()`. **Never `createOrReplace`.**
5. After every patch, immediately re-query the document and assert `displayAs === <expected>`. Throw on mismatch with the document ID.
6. Print final summary: N successful, 0 failed (or fail loudly).

**Claude does not run this script.** Per CLAUDE.md Sanity rules, content mutations require explicit user authorisation. The plan will hand the script to the user with instructions to run it.

### 9. Revalidation

No change to `src/app/api/revalidate/route.ts`. The `event` document type is already in `validDocumentTypes` and `documentTypeToPath`. Adding a field to an existing schema doesn't change the webhook surface.

### 10. Fallback content

Update `src/data/content.ts` if it has any hardcoded event/program defaults — confirm during implementation. If anything is hardcoded with the implicit rule, normalise it to use explicit `displayAs`.

---

## Tests

Per the project's "Sanity Field Wiring Tests — MANDATORY" rule, every new field needs:

1. **Schema test** (`event.test.ts`): document with each `displayAs` value validates; missing value fails validation.
2. **Programs query test:** mock data with mixed `displayAs` values; assert only `"program"` and `"both"` come through.
3. **Events query test:** same shape, assert only `"event"` and `"both"` come through.
4. **EventsContent test:** with the post-query input (which excludes `displayAs: "program"` items at the query layer), feed a mix of `"event"` (non-recurring) and `"both"` (recurring) docs; assert "Upcoming Events" and "Weekly Programs" sections render the right ones. Empty input → empty state. The component itself doesn't filter on `displayAs` — the test exists so the section split keeps working with the new shape of inputs.
5. **`WhatsOnSection.test.tsx`** (the homepage section that consumes the `programs` prop, wired in `src/app/page.tsx:89`): no logic change in the component itself, but verify with the new query shape (mocked at `getPrograms()`) that `displayAs: "program"` and `"both"` items render; `"event"` items do not. Also confirm `isPrayerRelated()` filtering still works as before — the prayer-keyword filter is independent of `displayAs`.
6. **Migration script test (`scripts/migrate-event-display-as.test.ts`):** unit-test the rule function (input event shape → expected `displayAs`). No live-Sanity calls in tests.

All existing event tests should continue to pass after migration. Update test fixtures to include `displayAs` on each mock event so they reflect the new schema.

---

## Migration sequencing (deploy order)

This matters because `displayAs` will be required on the schema, but old documents won't have it until the migration runs. The order:

1. **Code change deployed with `displayAs` *not* required** — defaults to `"event"` if missing in the runtime fallback. Site continues to render normally because the query falls back gracefully.
2. **Run migration script (`--apply`)** — every existing document gets a `displayAs` value per Option B rule.
3. **Verify in Studio** that all documents now have a value (admin can spot-check or run a counting query).
4. **Tighten validation to required** in a follow-up commit. Push that.

We could try to do all of this in a single PR, but the validation flip after the migration is safer — it removes a window where Studio could show validation errors on un-migrated documents.

---

## Risks and how we mitigate them

- **Risk:** Migration mis-classifies a document. *Mitigation:* dry-run output prints every doc's target before applying; admin reviews before `--apply`. Admin can toggle any doc post-migration.
- **Risk:** A program shared via direct URL stops working. *Mitigation:* `eventBySlugQuery` is unchanged. Detail pages still resolve regardless of `displayAs`.
- **Risk:** SEO impact from removing programs from `/events`. *Mitigation:* `/events` already had Weekly Programs as a secondary section, not an SEO-load-bearing surface. Programs were also indexed via their own detail pages; those don't change.
- **Risk:** Tests break because fixtures don't include `displayAs`. *Mitigation:* update fixtures in the same PR; the type change forces the compiler to flag every fixture that's missing the field.
- **Risk:** Stega corruption on the new field. *Mitigation:* the production `client` already has `stega.enabled: false`. `displayAs` is a string compared with `===` and `in`, so it would be vulnerable to stega — but only the `previewClient` enables stega, and Presentation tool reads aren't used by the Programs query in production paths.
- **Risk:** Homepage Programs strip becomes empty after migration if no old "program" doc had `featured: true`. *Mitigation:* the new `programsQuery` keeps the same `featured == true` requirement as the old query, so the homepage strip's contents don't change at the moment of migration. Anything that showed yesterday will show today. Admin only needs to re-curate if they want the strip to look different.

---

## What's explicitly out of scope

- Adding a `/programs` listing page.
- Splitting `event` into `program` and `event` document types.
- Adding program-specific fields (instructor, term dates, enrolment).
- Reorganising existing event categories.
- The broader Sanity plugin / desk audit (separate project).
- Any change to `eventType` (single / multi / recurring) — that field stays as it is.

---

## Files touched (estimate)

| Path | Change |
| ---- | ------ |
| `src/sanity/schemas/documents/event.ts` | add `displayAs`, update preview, fix descriptions |
| `src/sanity/schemas/documents/event.test.ts` | new field validation tests |
| `src/sanity/lib/queries.ts` | update `eventsQuery`, `featuredEventsQuery`, `programsQuery` |
| `src/types/sanity.ts` | add `displayAs` to `SanityEvent` (`SanityProgram` inherits via type alias) |
| `sanity.config.ts` | split desk structure into Programs and Events folders, add initial-value templates |
| `src/app/events/EventsContent.tsx` | doc-comment about new filter behaviour (no logic change) |
| `src/app/events/EventsContent.test.tsx` | tests covering the new filter behaviour at the query layer |
| `src/components/sections/WhatsOnSection.tsx` | confirm wiring still works (no code change expected); update test fixtures |
| `scripts/migrate-event-display-as.ts` | new migration script (dry-run + `--apply`) |
| `scripts/migrate-event-display-as.test.ts` | unit test for rule function |
| `src/data/content.ts` | normalise any hardcoded fallbacks if present |

Migration script is read-only until user runs it with `--apply`. Claude does not run it.

---

## Decision log

- **One document type vs two:** chose one. ~80% field overlap and a single migration. Door open to split later.
- **Three values vs two:** chose three (`program | event | both`). The "both" case is a real product need (e.g. an open day for the youth program — both a program touchpoint and an event).
- **Migration default:** Option B from brainstorm — match the *intent* of the old auto-rule, not just preserve current behaviour exactly (Option A would have made everything recurring → `both`, over-listing on events).
- **Folder split:** chose two folders with "both" docs visible in both. Third "Both" folder considered and rejected — adds a place admin has to remember to look.
- **Schema name:** keep `event`. Renaming has zero functional benefit and migrates 100% of references.
