# Event / Program Display Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an explicit `displayAs` field (`program` | `event` | `both`) on the `event` schema, replacing the implicit "recurring + Education/Youth/Sports/Women = program" rule. Split Sanity Studio into Programs and Events folders. Update queries to honour the toggle. Provide a migration script (run by user) that backfills existing documents.

**Architecture:** Single document type with a discriminator field. Two desk folders read from the same schema, filtered by `displayAs`. Queries gate placement; `featured` continues to gate homepage prominence. Phased rollout — ship without `Rule.required()`, migrate, then tighten validation in a follow-up commit.

**Tech Stack:** Next.js 16 (App Router) + Sanity CMS v3 + TypeScript + Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-04-30-event-program-display-toggle-design.md`

---

## File Structure

**Files modified:**
| File | Responsibility |
| ---- | -------------- |
| `src/sanity/schemas/documents/event.ts` | Add `displayAs` field; update preview; clean up misleading descriptions |
| `src/sanity/schemas/documents/event.test.ts` | Test the new field's options and absence of required validation in phase 1 |
| `src/types/sanity.ts` | Add `displayAs?: "program" \| "event" \| "both"` to `SanityEvent` |
| `src/sanity/lib/queries.ts` | Update `programsQuery`, `eventsQuery`, `featuredEventsQuery` to filter by `displayAs` |
| `sanity.config.ts` | Replace single Events folder with separate Programs and Events folders + initial-value templates |
| `src/app/events/EventsContent.tsx` | Add doc comment explaining new filter source-of-truth (no logic change) |
| `src/app/events/EventsContent.test.tsx` | Add tests covering rendering with `displayAs` mixed input |
| `src/components/sections/WhatsOnSection.test.tsx` | Add a fixture-shape test verifying programs prop still renders |

**Files created:**
| File | Responsibility |
| ---- | -------------- |
| `scripts/migrate-event-display-as.ts` | One-off migration script: dry-run by default, `--apply` to write. Uses `client.patch().set()` (never `createOrReplace`) |
| `scripts/migrate-event-display-as.test.ts` | Unit test for the pure rule function |

**Files NOT changed (verified during planning):**
- `src/data/content.ts` — fallback `upcomingEvents` is documented as "no longer displayed on the live site" and kept "for test compatibility only". No update needed.
- `src/sanity/lib/fetch.ts` — already passes `$today` to `programsQuery` and `eventsQuery`. No change.
- `src/app/api/revalidate/route.ts` — `event` is already in `validDocumentTypes` and `documentTypeToPath`. No change.
- `src/app/page.tsx` — already passes `programs={programs}` to `WhatsOnSection`. No change.

---

## Important constraints

- **Claude does NOT run the migration script.** Per CLAUDE.md, content mutations require explicit user authorisation. The plan's final task hands the script to the user with instructions.
- **Phase 1 only.** This plan delivers the schema, queries, desk, and migration script. **Phase 3** (tightening `displayAs` to `Rule.required()`) is a follow-up commit after the user has run the migration. A reminder is included as the last task.
- **No push.** The user said: "Don't push anything until I give the OK." The final task validates and commits — the user pushes when ready.
- **Commits should pass `npm run validate` (type-check → lint → test:run → build).** The pre-commit hook only runs lint, so each task's "commit" step assumes type-check + tests already pass. A final validation task at the end runs the full check.

---

## Tasks

### Task 1: Add `displayAs` field to event schema (TDD)

**Files:**
- Modify: `src/sanity/schemas/documents/event.ts` — add field after `featured`, before hero image
- Modify: `src/sanity/schemas/documents/event.test.ts` — add tests for the new field

- [ ] **Step 1: Add the failing schema test**

Append to `src/sanity/schemas/documents/event.test.ts` inside the existing `describe("Event Schema", () => { ... })` block:

```ts
  it("has displayAs field with program, event, and both options", () => {
    const displayAs = getField("displayAs");
    expect(displayAs).toBeDefined();
    const values = displayAs?.options?.list?.map((o) => o.value);
    expect(values).toEqual(["program", "event", "both"]);
  });

  it("does NOT mark displayAs as required in phase 1 (migration sequencing)", () => {
    const displayAs = getField("displayAs");
    // Phase 1 ships without Rule.required() so unmigrated docs don't fail
    // validation in Studio. Phase 3 (separate follow-up commit) tightens it.
    expect(displayAs?.validation).toBeUndefined();
  });
```

- [ ] **Step 2: Run the new tests — both must FAIL**

Run:
```bash
npx vitest run src/sanity/schemas/documents/event.test.ts
```

Expected: both new tests fail with `Expected: defined ... Received: undefined` (the field doesn't exist yet).

- [ ] **Step 3: Add the schema field**

In `src/sanity/schemas/documents/event.ts`, find the `featured` field's `defineField({ ... })` block (around lines 79–93). Insert the new field IMMEDIATELY AFTER the closing `}),` of the `featured` field, BEFORE the `// ── 1. Hero Image ──` section comment:

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
      // Phase 3 (follow-up commit, after migration runs): tighten with
      // validation: (Rule) => Rule.required().error("Please select where this should be displayed"),
    }),
```

- [ ] **Step 4: Run the schema tests — both must PASS**

Run:
```bash
npx vitest run src/sanity/schemas/documents/event.test.ts
```

Expected: all 7 tests pass (5 existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add src/sanity/schemas/documents/event.ts src/sanity/schemas/documents/event.test.ts
git commit -m "feat(event-schema): add displayAs field (program/event/both)

New field on the event schema controls where each document appears
on the site. Phase 1 ships without Rule.required() so existing docs
don't fail validation before the migration runs. Tests cover the
options list and the deliberate absence of required validation."
```

---

### Task 2: Add `displayAs` to TypeScript type

**Files:**
- Modify: `src/types/sanity.ts:15-45` (the `SanityEvent` interface)

`SanityProgram` is a `type SanityProgram = SanityEvent;` alias and inherits automatically — no separate edit.

- [ ] **Step 1: Add the field to the interface**

Open `src/types/sanity.ts`. Inside the `export interface SanityEvent { ... }` block (lines 15–45), add the new field next to `featured?` (currently around line 37). Insert this line below `featured?: boolean;`:

```ts
  /** Controls placement: "program" → homepage Programs strip only; "event" → Events page only; "both" → both. */
  displayAs?: "program" | "event" | "both";
```

Optional in TypeScript because phase 1 ships before the migration runs — unmigrated docs return `undefined` for this field. Runtime treats missing as `"event"` (queries do this via `displayAs in [...]` not matching, plus runtime fallback noted in Task 6).

- [ ] **Step 2: Run type-check**

Run:
```bash
npm run type-check
```

Expected: zero errors. (The field is optional, so no existing fixtures or callers need updating.)

- [ ] **Step 3: Commit**

```bash
git add src/types/sanity.ts
git commit -m "feat(types): add displayAs to SanityEvent

Optional in phase 1 because unmigrated docs lack the field. Will tighten
to required after migration runs (separate follow-up). SanityProgram is
a type alias and inherits automatically."
```

---

### Task 3: Update event preview to show display badge (TDD)

**Files:**
- Modify: `src/sanity/schemas/documents/event.ts:422-444` (the `prepare()` function inside the schema's `preview` block)

Add a prefix to the subtitle so admin sees `📋 Program`, `📅 Event`, or `⚡ Program & Event` at-a-glance.

- [ ] **Step 1: Write the failing preview test**

Append to `src/sanity/schemas/documents/event.test.ts` inside the same `describe` block:

```ts
  // The preview prepare() function lives inside the schema export, not in fields.
  // We access it via the default-exported schema object.
  it("preview prepare() prefixes subtitle with display badge", () => {
    const prepare = (schema as unknown as {
      preview: {
        prepare: (selection: Record<string, unknown>) => { title: string; subtitle: string };
      };
    }).preview.prepare;

    const program = prepare({
      title: "Quran Class",
      eventType: "recurring",
      recurringDay: "Mondays",
      displayAs: "program",
      active: true,
    });
    expect(program.subtitle).toContain("📋 Program");

    const event = prepare({
      title: "Eid Dinner",
      eventType: "single",
      date: "2026-05-20",
      displayAs: "event",
      active: true,
    });
    expect(event.subtitle).toContain("📅 Event");

    const both = prepare({
      title: "Open Day",
      eventType: "single",
      date: "2026-06-01",
      displayAs: "both",
      active: true,
    });
    expect(both.subtitle).toContain("⚡ Program & Event");
  });
```

- [ ] **Step 2: Run the test — must FAIL**

Run:
```bash
npx vitest run src/sanity/schemas/documents/event.test.ts -t "preview prepare"
```

Expected: fails with subtitle not containing the badge text.

- [ ] **Step 3: Update `prepare()` in `event.ts`**

In `src/sanity/schemas/documents/event.ts`, replace the entire `preview` block (lines 422–444) with:

```ts
  preview: {
    select: {
      title: "title",
      date: "date",
      endDate: "endDate",
      recurringDay: "recurringDay",
      eventType: "eventType",
      displayAs: "displayAs",
      active: "active",
      media: "image",
    },
    prepare({ title, date, endDate, recurringDay, eventType, displayAs, active, media }) {
      // Display badge — shows admin where this doc appears at a glance.
      const badge =
        displayAs === "both"
          ? "⚡ Program & Event"
          : displayAs === "program"
            ? "📋 Program"
            : "📅 Event";

      let scheduleSummary = (date as string | undefined) || "";
      if (eventType === "recurring") {
        scheduleSummary = (recurringDay as string | undefined) || "Recurring";
      } else if (eventType === "multi" && date && endDate) {
        scheduleSummary = `${date} → ${endDate}`;
      }

      return {
        title: `${title}${active === false ? " (Inactive)" : ""}`,
        subtitle: scheduleSummary ? `${badge} — ${scheduleSummary}` : badge,
        media,
      };
    },
  },
```

- [ ] **Step 4: Run the preview test — must PASS**

Run:
```bash
npx vitest run src/sanity/schemas/documents/event.test.ts -t "preview prepare"
```

Expected: pass.

- [ ] **Step 5: Run the whole event test file**

Run:
```bash
npx vitest run src/sanity/schemas/documents/event.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/sanity/schemas/documents/event.ts src/sanity/schemas/documents/event.test.ts
git commit -m "feat(event-schema): show display badge in document preview

Admin sees '📋 Program', '📅 Event', or '⚡ Program & Event' as the
subtitle prefix in the desk pane — makes the new placement field
visible without opening each document."
```

---

### Task 4: Update `programsQuery` to filter by `displayAs`

**Files:**
- Modify: `src/sanity/lib/queries.ts:179-205`

This query feeds the homepage Programs strip via `getPrograms()` → `WhatsOnSection`. We keep `featured == true` so the homepage stays curated.

- [ ] **Step 1: Replace the query body**

In `src/sanity/lib/queries.ts`, find `export const programsQuery = groq` (around line 180). Replace it with:

```ts
// Programs - items the admin has explicitly flagged for the Programs section.
// Homepage strip → keeps featured == true (curated). A future /programs
// listing page would use a separate query without that requirement.
export const programsQuery = groq`
  *[_type == "event" && active != false && featured == true && displayAs in ["program", "both"] && (
    recurringEndDate == null || recurringEndDate >= $today
  )] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    displayAs,
    shortDescription,
    description,
    image,
    categories,
    keyFeatures,
    features,
    ageGroup,
    externalLink,
    recurringDay,
    time,
    endTime,
    location,
    locationDetails,
    featured
  }
`;
```

Key differences from the old query:
- Added `displayAs in ["program", "both"]` (the new gate)
- Removed `eventType == "recurring"` requirement (placement no longer tied to eventType)
- Removed the four-category whitelist (Education/Youth/Sports/Women)
- Added `displayAs` to the projection so consumers can read it
- Kept `featured == true` so the homepage strip stays curated
- Kept the `recurringEndDate` cutoff

- [ ] **Step 2: Run the existing test suite**

Run:
```bash
npm run test:run
```

Expected: all tests pass. (The query is a string — no test directly asserts its body. Component tests using the post-query shape will still pass because mocked data is hand-shaped.)

- [ ] **Step 3: Commit**

```bash
git add src/sanity/lib/queries.ts
git commit -m "feat(queries): gate programsQuery on displayAs

Homepage Programs strip now reads from documents explicitly flagged
'program' or 'both', not from the implicit 'recurring + Education/
Youth/Sports/Women' rule. featured == true is kept so the strip
remains curated (mirrors featuredEventsQuery)."
```

---

### Task 5: Update `eventsQuery` to filter by `displayAs`

**Files:**
- Modify: `src/sanity/lib/queries.ts:67-100`

- [ ] **Step 1: Replace the query body**

In `src/sanity/lib/queries.ts`, find `export const eventsQuery = groq`. Replace the entire export (the `groq\`...\`` block) with:

```ts
// Events - items the admin has explicitly flagged for the Events page.
// Recurring events with displayAs == "both" still appear in the page's
// "Weekly Programs" section (split locally in EventsContent).
export const eventsQuery = groq`
  *[_type == "event" && active != false && displayAs in ["event", "both"] && (
    (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= $today)) ||
    date >= $today ||
    endDate >= $today
  )] | order(eventType asc, featured desc, date asc) {
    _id,
    title,
    "slug": slug.current,
    eventType,
    displayAs,
    date,
    endDate,
    recurringDay,
    recurringEndDate,
    time,
    endTime,
    location,
    locationDetails,
    categories,
    image,
    shortDescription,
    description,
    keyFeatures,
    features,
    ageGroup,
    externalLink,
    featured,
    registrationUrl
  }
`;
```

Key differences:
- Added `displayAs in ["event", "both"]`
- Added `displayAs` to the projection

- [ ] **Step 2: Run the test suite**

Run:
```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/sanity/lib/queries.ts
git commit -m "feat(queries): gate eventsQuery on displayAs

Items flagged 'program' (only) no longer appear on /events. Items
flagged 'both' continue to appear (Weekly Programs section)."
```

---

### Task 6: Update `featuredEventsQuery` to filter by `displayAs`

**Files:**
- Modify: `src/sanity/lib/queries.ts:102-127`

- [ ] **Step 1: Replace the query body**

In `src/sanity/lib/queries.ts`, find `export const featuredEventsQuery = groq`. Replace it with:

```ts
// Featured events for homepage — only events with featured == true.
// Mirrors eventsQuery's displayAs gate so a "program" item never appears
// on the homepage events strip.
export const featuredEventsQuery = groq`
  *[_type == "event" && active != false && featured == true && displayAs in ["event", "both"] && (
    (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= $today)) ||
    date >= $today ||
    endDate >= $today
  )] | order(eventType asc, date asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    eventType,
    displayAs,
    date,
    endDate,
    recurringDay,
    recurringEndDate,
    time,
    endTime,
    location,
    locationDetails,
    categories,
    image,
    shortDescription,
    ageGroup,
    registrationUrl
  }
`;
```

- [ ] **Step 2: Run the test suite**

Run:
```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/sanity/lib/queries.ts
git commit -m "feat(queries): gate featuredEventsQuery on displayAs

Homepage events strip honours the same placement toggle as the events
page — keeps the two surfaces consistent."
```

---

### Task 7: Clean up misleading schema descriptions

**Files:**
- Modify: `src/sanity/schemas/documents/event.ts:128` (categories description)
- Modify: `src/sanity/schemas/documents/event.ts:172` (eventType description)

These descriptions still reference the old implicit rule. Replace them so admin sees accurate guidance.

- [ ] **Step 1: Update the `categories` description**

In `src/sanity/schemas/documents/event.ts`, find the `categories` field. Replace the description from:

```ts
      description: 'Shown as coloured badges on the event page. IMPORTANT: Recurring events with Education, Youth, Sports, or Women categories are automatically treated as Programs and displayed in the "Weekly Programs" section on the Events page and homepage.',
```

To:

```ts
      description: "Shown as coloured badges on the event page. Use any combination — categories no longer control whether something is treated as a Program (use the 'Display As' field above for that).",
```

- [ ] **Step 2: Update the `eventType` description**

In the same file, find the `eventType` field. Replace its description from:

```ts
      description: 'How is this event scheduled? To create a PROGRAM (e.g. weekly Quran class), select "Recurring" and choose Education, Youth, Sports, or Women as the category — it will automatically appear in the Programs section on the Events page.',
```

To:

```ts
      description: 'How is this scheduled? "Single" = one date, "Multi" = date range, "Recurring" = weekly. To control where this appears (Programs section, Events page, or both), use the "Display As" field above — eventType only affects the schedule.',
```

- [ ] **Step 3: Run the test suite**

Run:
```bash
npm run test:run
```

Expected: all tests pass. (Existing tests don't assert on these description strings.)

- [ ] **Step 4: Commit**

```bash
git add src/sanity/schemas/documents/event.ts
git commit -m "docs(event-schema): remove references to implicit program rule

The descriptions on 'categories' and 'eventType' still pointed at the
old auto-rule. Updated to direct admin to the new 'Display As' field
for placement control."
```

---

### Task 8: Split desk structure into Programs and Events folders

**Files:**
- Modify: `sanity.config.ts:87-130` (the existing single Events folder)

Replace one folder with two, plus initial-value templates so `+ New` defaults `displayAs` correctly per folder.

- [ ] **Step 1: Add initial-value templates**

In `sanity.config.ts`, find the `defineConfig({ ... })` call. Inside the top-level `schema: { types: schemaTypes }` near line 422, replace it with:

```ts
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: "event-as-program",
        title: "New Program",
        schemaType: "event",
        value: { displayAs: "program", eventType: "recurring", active: true },
      },
      {
        id: "event-as-event",
        title: "New Event",
        schemaType: "event",
        value: { displayAs: "event", eventType: "single", active: true },
      },
    ],
  },
```

- [ ] **Step 2: Replace the single Events folder with Programs + Events folders**

In `sanity.config.ts`, find the existing block:

```ts
              // Events folder
              S.listItem()
                .title("Events")
                .child(
                  S.list()
                    .title("Events")
                    .items([
                      singleton(S, "eventsPageSettings", "Page Settings"),
                      S.divider(),
                      // ... Live / Expired / Inactive child items
                    ])
                ),
```

(Roughly lines 87–130 — verify by searching for `// Events folder`.)

Replace that single `S.listItem()...` block with TWO folders:

```ts
              // Programs folder — items where admin chose displayAs in ["program", "both"]
              S.listItem()
                .title("Programs")
                .child(
                  S.list()
                    .title("Programs")
                    .items([
                      S.listItem()
                        .title("Live on Website")
                        .child(
                          S.documentList()
                            .title("Live Programs")
                            .filter(
                              `_type == "event" && active == true && displayAs in ["program", "both"] && (
                                recurringEndDate == null || recurringEndDate >= string::split(string(now()), "T")[0] ||
                                date >= string::split(string(now()), "T")[0] ||
                                endDate >= string::split(string(now()), "T")[0]
                              )`
                            )
                            .initialValueTemplates([S.initialValueTemplateItem("event-as-program")])
                        ),
                      S.listItem()
                        .title("Expired")
                        .child(
                          S.documentList()
                            .title("Expired Programs")
                            .filter(
                              `_type == "event" && active == true && displayAs in ["program", "both"] && !(
                                recurringEndDate == null || recurringEndDate >= string::split(string(now()), "T")[0] ||
                                date >= string::split(string(now()), "T")[0] ||
                                endDate >= string::split(string(now()), "T")[0]
                              )`
                            )
                            .initialValueTemplates([S.initialValueTemplateItem("event-as-program")])
                        ),
                      S.listItem()
                        .title("Inactive")
                        .child(
                          S.documentList()
                            .title("Inactive Programs")
                            .filter('_type == "event" && active == false && displayAs in ["program", "both"]')
                            .initialValueTemplates([S.initialValueTemplateItem("event-as-program")])
                        ),
                    ])
                ),

              // Events folder — items where admin chose displayAs in ["event", "both"]
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
                              `_type == "event" && active == true && displayAs in ["event", "both"] && (
                                (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= string::split(string(now()), "T")[0])) ||
                                date >= string::split(string(now()), "T")[0] ||
                                endDate >= string::split(string(now()), "T")[0]
                              )`
                            )
                            .initialValueTemplates([S.initialValueTemplateItem("event-as-event")])
                        ),
                      S.listItem()
                        .title("Expired")
                        .child(
                          S.documentList()
                            .title("Expired Events")
                            .filter(
                              `_type == "event" && active == true && displayAs in ["event", "both"] && !(
                                (eventType == "recurring" && (recurringEndDate == null || recurringEndDate >= string::split(string(now()), "T")[0])) ||
                                date >= string::split(string(now()), "T")[0] ||
                                endDate >= string::split(string(now()), "T")[0]
                              )`
                            )
                            .initialValueTemplates([S.initialValueTemplateItem("event-as-event")])
                        ),
                      S.listItem()
                        .title("Inactive")
                        .child(
                          S.documentList()
                            .title("Inactive Events")
                            .filter('_type == "event" && active == false && displayAs in ["event", "both"]')
                            .initialValueTemplates([S.initialValueTemplateItem("event-as-event")])
                        ),
                    ])
                ),
```

Notes:
- `eventsPageSettings` singleton stays inside the **Events** folder only (it's the settings for the /events page).
- A `displayAs: "both"` document appears in BOTH folders' "Live on Website" lists — same underlying document, edit once.
- `initialValueTemplates([...])` ensures clicking `+ New` inside a folder pre-fills `displayAs` with the right default.
- Desk filters use `string::split(string(now()), "T")[0]` (UTC) because desk filters can't take parameters. This matches the existing pattern; the runtime queries use the Melbourne-aware `$today` separately. Known minor admin-side timezone drift, not in scope.

- [ ] **Step 3: Run the build to verify Studio still compiles**

Run:
```bash
npm run build
```

Expected: clean build. (`sanity.config.ts` is included in the Next.js bundle for Studio at /studio.)

- [ ] **Step 4: Manual verification (skip if running in CI)**

Run:
```bash
npm run dev
```

Open `http://localhost:3000/studio` and verify:
- Sidebar shows two folders: "Programs" and "Events"
- Both have "Live on Website" / "Expired" / "Inactive" sub-items
- Clicking `+ New` inside Programs creates a doc with `displayAs: "program"` pre-selected
- Clicking `+ New` inside Events creates a doc with `displayAs: "event"` pre-selected
- "Page Settings" still appears under Events only

Stop the dev server (Ctrl+C) when done.

- [ ] **Step 5: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(studio): split events folder into Programs and Events

Two top-level folders, both reading from _type == 'event' but filtered
by displayAs. Initial-value templates pre-fill displayAs based on which
folder admin clicked '+ New' from. A document with displayAs == 'both'
is visible in both folders (same underlying document)."
```

---

### Task 9: Update `EventsContent` test fixtures to include `displayAs`

**Files:**
- Modify: `src/app/events/EventsContent.test.tsx:67-81` (the `makeEvent` factory)
- Add a new test asserting the section split still works

- [ ] **Step 1: Update the `makeEvent` factory to include `displayAs`**

In `src/app/events/EventsContent.test.tsx`, replace the `makeEvent` function (lines 67–81) with:

```tsx
function makeEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "evt-1",
    title: "Test Event",
    slug: "test-event",
    description: "A test event description",
    shortDescription: "Short desc",
    categories: ["Community"],
    date: "2026-04-01",
    time: "10:00 AM",
    location: "Main Hall",
    eventType: "single",
    displayAs: "event",
    ...overrides,
  };
}
```

(Just adds `displayAs: "event"` as the default, since EventsContent's input list will only contain `"event"` or `"both"` items in production.)

- [ ] **Step 2: Add a new test for section split with mixed displayAs**

Append at the end of the `describe("EventsContent", () => { ... })` block (before its closing `})`):

```tsx
  it("splits 'both' recurring items into the Weekly Programs section", () => {
    const events = [
      makeEvent({
        _id: "evt-single",
        title: "Eid Dinner",
        slug: "eid-dinner",
        eventType: "single",
        displayAs: "event",
        date: "2026-05-20",
      }),
      makeEvent({
        _id: "evt-both-recurring",
        title: "Weekly Open House",
        slug: "open-house",
        eventType: "recurring",
        displayAs: "both",
        recurringDay: "Saturdays",
        date: undefined,
      }),
    ];

    render(<EventsContent events={events} />);

    // Single-day event lands in the upcoming events grid
    expect(screen.getByText("Eid Dinner")).toBeInTheDocument();

    // Recurring "both" item lands in the Weekly Programs section
    expect(screen.getByText("Weekly Programs")).toBeInTheDocument();
    expect(screen.getByText("Weekly Open House")).toBeInTheDocument();
  });

  it("hides Weekly Programs section when no recurring items present", () => {
    const events = [
      makeEvent({
        _id: "evt-single",
        title: "Eid Dinner",
        slug: "eid-dinner",
        eventType: "single",
        displayAs: "event",
      }),
    ];

    render(<EventsContent events={events} />);

    // Section heading should not appear when there are no recurring items
    expect(screen.queryByText("Weekly Programs")).not.toBeInTheDocument();
  });
```

- [ ] **Step 3: Run the test file**

Run:
```bash
npx vitest run src/app/events/EventsContent.test.tsx
```

Expected: all tests pass (including the two new ones).

- [ ] **Step 4: Commit**

```bash
git add src/app/events/EventsContent.test.tsx
git commit -m "test(events): cover section split with displayAs-flagged input

Updates the makeEvent fixture default and adds two regression tests
proving 'both' recurring items still land in Weekly Programs and the
section hides when no recurring items are present."
```

---

### Task 10: Add doc comment to `EventsContent.tsx` explaining new filter source

**Files:**
- Modify: `src/app/events/EventsContent.tsx:391-403`

The component itself doesn't change behaviour — but anyone reading it should know that the input list is already pre-filtered by `displayAs` at the query layer.

- [ ] **Step 1: Add the doc comment**

In `src/app/events/EventsContent.tsx`, find the line `const filteredEvents = events.filter((event) => {` (around line 391). Insert this comment block immediately ABOVE that line:

```tsx
  // The `events` prop is already filtered by `displayAs in ["event", "both"]`
  // at the query layer (see eventsQuery in src/sanity/lib/queries.ts). This
  // means items the admin flagged as `displayAs: "program"` are NOT in this
  // list — that's why a recurring "program" never appears in the Weekly
  // Programs section below. Items flagged "both" do appear here.
```

- [ ] **Step 2: Run lint and type-check**

Run:
```bash
npm run lint && npm run type-check
```

Expected: zero issues.

- [ ] **Step 3: Commit**

```bash
git add src/app/events/EventsContent.tsx
git commit -m "docs(events): explain that displayAs filtering happens at query

Comment-only change. The component's local eventType split is unchanged —
adds context for future readers about why recurring items might be
absent from Weekly Programs."
```

---

### Task 11: Add migration rule pure function (TDD)

**Files:**
- Modify: `vitest.config.ts:30` — extend include pattern to scan `scripts/`
- Create: `scripts/migrate-event-display-as.ts` (rule function exported, script harness in next task)
- Create: `scripts/migrate-event-display-as.test.ts`

The rule logic is a pure function so it can be unit-tested without hitting Sanity. **First** we extend vitest's include pattern — by default it only scans `src/`, so a test file under `scripts/` would be silently skipped by `npm run test:run`.

- [ ] **Step 1: Update vitest's include pattern**

In `vitest.config.ts`, find the line:

```ts
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
```

Replace with:

```ts
    include: [
      "src/**/*.{test,spec}.{js,jsx,ts,tsx}",
      "scripts/**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],
```

This ensures `npm run test:run` (and therefore `npm run validate`) picks up the migration script's tests. Other migration scripts in `scripts/` don't have tests today, so no other files are affected.

- [ ] **Step 2: Write the failing test**

Create `scripts/migrate-event-display-as.test.ts` with:

```ts
import { describe, it, expect } from "vitest";
import { computeDisplayAs } from "./migrate-event-display-as";

describe("computeDisplayAs (migration rule B)", () => {
  it("returns 'program' for recurring + Education", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Education"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + Youth (case-sensitive)", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Youth"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + Sports", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Sports"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + Women", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Women"] }),
    ).toBe("program");
  });

  it("returns 'program' for recurring + multiple categories including a program one", () => {
    expect(
      computeDisplayAs({
        eventType: "recurring",
        categories: ["Community", "Education"],
      }),
    ).toBe("program");
  });

  it("returns 'event' for recurring + Community only (no program-category)", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: ["Community"] }),
    ).toBe("event");
  });

  it("returns 'event' for single-day even if a program-category is set", () => {
    expect(
      computeDisplayAs({ eventType: "single", categories: ["Education"] }),
    ).toBe("event");
  });

  it("returns 'event' for multi-day", () => {
    expect(
      computeDisplayAs({ eventType: "multi", categories: ["Education"] }),
    ).toBe("event");
  });

  it("returns 'event' for missing eventType", () => {
    expect(computeDisplayAs({ categories: ["Education"] })).toBe("event");
  });

  it("returns 'event' for missing categories", () => {
    expect(computeDisplayAs({ eventType: "recurring" })).toBe("event");
  });

  it("returns 'event' for empty categories", () => {
    expect(
      computeDisplayAs({ eventType: "recurring", categories: [] }),
    ).toBe("event");
  });
});
```

- [ ] **Step 3: Run the test — must FAIL with import error**

Run:
```bash
npx vitest run scripts/migrate-event-display-as.test.ts
```

Expected: fails because the source file doesn't exist yet.

- [ ] **Step 4: Create the rule function**

Create `scripts/migrate-event-display-as.ts` with this minimal content (script harness comes in Task 12):

```ts
/**
 * Migrate Event Display As — Backfill `displayAs` on existing event documents.
 *
 * Phase 1 of the event/program toggle ships the field as optional. This
 * script populates every existing `event` document with a value derived
 * from rule B in the design doc:
 *
 *   if eventType === "recurring" AND categories includes any of
 *   ["Education", "Youth", "Sports", "Women"]:
 *     displayAs = "program"
 *   else:
 *     displayAs = "event"
 *
 * Admin reviews after and toggles individual docs to "both" if needed.
 *
 * Run modes:
 *   npx tsx scripts/migrate-event-display-as.ts           # dry-run (default)
 *   npx tsx scripts/migrate-event-display-as.ts --apply   # actually patch
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local.
 *
 * Per CLAUDE.md Sanity rules:
 *   - Uses client.patch().set() — NEVER createOrReplace
 *   - Reads back every patched doc and asserts displayAs is the expected
 *     value, throws on mismatch
 *   - Dry-run prints every doc ID + target before any mutation
 *   - Skips docs that already have displayAs set
 *
 * @see docs/superpowers/specs/2026-04-30-event-program-display-toggle-design.md
 */

const PROGRAM_CATEGORIES = ["Education", "Youth", "Sports", "Women"] as const;

export type DisplayAs = "program" | "event" | "both";

export interface EventInput {
  eventType?: string;
  categories?: string[];
}

/**
 * Pure rule for backfilling `displayAs` on existing event documents.
 * Exported separately from the script harness so it's testable without
 * hitting Sanity.
 */
export function computeDisplayAs(input: EventInput): DisplayAs {
  if (input.eventType !== "recurring") return "event";
  if (!input.categories || input.categories.length === 0) return "event";
  const hasProgramCategory = input.categories.some((c) =>
    (PROGRAM_CATEGORIES as readonly string[]).includes(c),
  );
  return hasProgramCategory ? "program" : "event";
}
```

- [ ] **Step 5: Run the test — all 11 cases must PASS**

Run:
```bash
npx vitest run scripts/migrate-event-display-as.test.ts
```

Expected: 11 passing.

- [ ] **Step 6: Confirm `npm run test:run` now picks it up**

Run:
```bash
npm run test:run -- --reporter=verbose 2>&1 | grep -i "migrate-event-display-as"
```

Expected: the test file appears in the output (proving the vitest config update from Step 1 worked).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts scripts/migrate-event-display-as.ts scripts/migrate-event-display-as.test.ts
git commit -m "feat(scripts): add migration rule function for displayAs backfill

Pure function implementing rule B from the design doc — recurring +
Education/Youth/Sports/Women → 'program', everything else → 'event'.
Unit-tested across all combinations. Script harness follows in next
commit. vitest.config include pattern extended to scan scripts/ so
test:run picks up the new test."
```

---

### Task 12: Wrap rule in migration script (dry-run + `--apply`)

**Files:**
- Modify: `scripts/migrate-event-display-as.ts` (append the harness below the rule function)

This is the executable part. Claude does NOT run it — the user runs it explicitly.

- [ ] **Step 1: Append the script harness**

Open `scripts/migrate-event-display-as.ts`. Append this block AFTER the `computeDisplayAs` function (everything below the existing content, no overwriting):

```ts
// ─────────────────────────────────────────────────────────────────────────
// Script harness — only runs when invoked via `npx tsx scripts/...`
// (i.e. when this file is the entry point, not when imported by tests).
// ─────────────────────────────────────────────────────────────────────────

import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

interface SanityEventDoc extends EventInput {
  _id: string;
  _type: "event";
  title?: string;
  displayAs?: DisplayAs;
}

function buildClient(): SanityClient {
  dotenv.config({ path: ".env.local" });
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !token) {
    throw new Error(
      "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN required.",
    );
  }
  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-01-01",
    useCdn: false,
  });
}

interface PlanRow {
  _id: string;
  title: string;
  current: DisplayAs | undefined;
  target: DisplayAs;
  action: "skip" | "patch";
}

async function buildPlan(client: SanityClient): Promise<PlanRow[]> {
  const docs = await client.fetch<SanityEventDoc[]>(
    `*[_type == "event"]{ _id, _type, title, eventType, categories, displayAs }`,
  );
  return docs.map((doc) => {
    const target = computeDisplayAs(doc);
    return {
      _id: doc._id,
      title: doc.title ?? "(no title)",
      current: doc.displayAs,
      target,
      action: doc.displayAs ? "skip" : "patch",
    };
  });
}

function printPlan(plan: PlanRow[]): void {
  const counts = {
    skip: plan.filter((p) => p.action === "skip").length,
    program: plan.filter((p) => p.action === "patch" && p.target === "program").length,
    event: plan.filter((p) => p.action === "patch" && p.target === "event").length,
  };
  console.log(`\nFound ${plan.length} event document(s).`);
  console.log(`  → already has displayAs (skip): ${counts.skip}`);
  console.log(`  → will set displayAs="program": ${counts.program}`);
  console.log(`  → will set displayAs="event":   ${counts.event}\n`);
  for (const row of plan) {
    const tag =
      row.action === "skip"
        ? `skip (already=${row.current})`
        : `set ${row.target}`;
    console.log(`  ${row._id}  [${tag}]  ${row.title}`);
  }
  console.log("");
}

async function applyPlan(client: SanityClient, plan: PlanRow[]): Promise<void> {
  const toPatch = plan.filter((p) => p.action === "patch");
  console.log(`\nApplying ${toPatch.length} patch operations...\n`);

  let success = 0;
  const failures: Array<{ id: string; reason: string }> = [];

  for (const row of toPatch) {
    try {
      await client.patch(row._id).set({ displayAs: row.target }).commit();
      // Read-back verification per CLAUDE.md seed-script rules.
      const verify = await client.fetch<{ displayAs?: DisplayAs } | null>(
        `*[_id == $id][0]{ displayAs }`,
        { id: row._id },
      );
      if (verify?.displayAs !== row.target) {
        failures.push({
          id: row._id,
          reason: `read-back mismatch: expected "${row.target}", got "${verify?.displayAs ?? "undefined"}"`,
        });
        console.error(`  ✗ ${row._id}  read-back failed`);
      } else {
        success++;
        console.log(`  ✓ ${row._id}  → ${row.target}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push({ id: row._id, reason: message });
      console.error(`  ✗ ${row._id}  ${message}`);
    }
  }

  console.log(`\nDone. ${success} patched, ${failures.length} failed.`);
  if (failures.length > 0) {
    for (const f of failures) console.error(`  ${f.id}: ${f.reason}`);
    throw new Error(`${failures.length} patch operation(s) failed`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");

  console.log("Event displayAs migration (rule B)");
  console.log(apply ? "Mode: APPLY (will write to Sanity)" : "Mode: DRY-RUN (no writes)");

  const client = buildClient();
  const plan = await buildPlan(client);
  printPlan(plan);

  if (!apply) {
    console.log("Dry-run complete. Re-run with --apply to write the changes.");
    return;
  }
  await applyPlan(client, plan);
}

// Only execute when this file is the entry point (not when imported by tests).
const isEntryPoint = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1] === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 2: Confirm the rule-function tests still pass**

Run:
```bash
npx vitest run scripts/migrate-event-display-as.test.ts
```

Expected: all 11 cases pass — adding the harness shouldn't have broken them.

- [ ] **Step 3: Verify type-check is clean**

Run:
```bash
npm run type-check
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-event-display-as.ts
git commit -m "feat(scripts): add Sanity migration script harness for displayAs

Dry-run by default — prints each doc ID + target before any mutation.
--apply triggers the patch loop. Each patch is followed by a read-back
verification (per CLAUDE.md seed-script rules) and the script throws
on any mismatch. Skips docs that already have displayAs set.

Claude does not run this script; user runs it explicitly when ready."
```

---

### Task 13: Run full validation and confirm clean baseline

**Files:** none (verification only)

- [ ] **Step 1: Run full validate**

Run:
```bash
npm run validate
```

This runs `type-check && lint && test:run && build` per the CLAUDE.md `Code Quality Gates` rule. Expected: all four pass.

- [ ] **Step 2: If anything fails**

Diagnose using the relevant single-step command (`npm run type-check`, `npm run lint`, `npm run test:run`, `npm run build`) to narrow down. Fix the issue, re-run validate, and amend the previous commit only if the fix is in code that was just modified — otherwise commit as a fixup.

- [ ] **Step 3: Final commit/no-op confirmation**

If everything's clean, no commit is needed for this task — it's a gate.

---

### Task 14: Hand off to user — migration and PR

**Files:** none (instructions only)

- [ ] **Step 1: Print the hand-off message**

In your response to the user, include the following sections:

**Branch state:**
- Branch: `feature/event-program-display-toggle`
- All tasks committed locally; nothing pushed yet (per user instruction)

**What to do next (in order):**

1. **Review the local commits** — `git log origin/main..HEAD --oneline`
2. **Run the migration in DRY-RUN first** — confirms what will change without touching data:
   ```bash
   npx tsx scripts/migrate-event-display-as.ts
   ```
   This prints every event doc, its current `displayAs` (likely `undefined`), and its computed target.
3. **If the dry-run output looks right, run with `--apply`:**
   ```bash
   npx tsx scripts/migrate-event-display-as.ts --apply
   ```
   The script writes one patch per doc and reads back each one to confirm.
4. **Spot-check Studio** — open `/studio`, click into the Programs folder, click into the Events folder, confirm a few documents are where you expect them. Toggle one to `"both"` and check it appears in both folders.
5. **When you're happy, push the branch and open a PR:**
   ```bash
   git push -u origin feature/event-program-display-toggle
   gh pr create --title "feat: event/program display toggle" --body-file docs/superpowers/specs/2026-04-30-event-program-display-toggle-design.md --base main
   ```

**Phase 3 follow-up (separate small commit AFTER migration is verified live):** tighten validation:

```ts
// In src/sanity/schemas/documents/event.ts, on the displayAs field:
validation: (Rule) => Rule.required().error("Please select where this should be displayed"),
```

Do NOT do this until every event document in production has a `displayAs` value. A quick check:
```bash
# Count docs missing displayAs
npx sanity documents query '*[_type == "event" && !defined(displayAs)] | count'
```
Should return `0` before tightening.

- [ ] **Step 2: Mark task complete**

This task is the final hand-off — no code change. Mark it done in your tracker.

---

## Out of scope (re-stated)

- Adding a `/programs` listing page
- Splitting `event` into separate document types
- Program-specific fields (instructor, term dates, enrolment cap)
- Renaming the `event` schema
- Broader Sanity audit / plugin recommendations
- Tightening `displayAs` validation to required (Phase 3 — separate follow-up)

---

## Summary of commits this plan produces

```
feat(event-schema): add displayAs field (program/event/both)
feat(types): add displayAs to SanityEvent
feat(event-schema): show display badge in document preview
feat(queries): gate programsQuery on displayAs
feat(queries): gate eventsQuery on displayAs
feat(queries): gate featuredEventsQuery on displayAs
docs(event-schema): remove references to implicit program rule
feat(studio): split events folder into Programs and Events
test(events): cover section split with displayAs-flagged input
docs(events): explain that displayAs filtering happens at query
feat(scripts): add migration rule function for displayAs backfill
feat(scripts): add Sanity migration script harness for displayAs
```

12 commits, each independently revertible if needed. No commit pushes — user pushes when ready.
