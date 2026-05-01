# Prayer-Relative Event Times Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to express event start/end times in three modes — fixed dropdown (existing), prayer-relative ("After Isha"), or custom typed text — with prayer-relative resolving to the adhan time of the chosen prayer for the event's relevant date.

**Architecture:** Extend the `event` Sanity schema with 8 new fields (mode discriminator + per-mode value + editable label, both sides). Add new `src/lib/event-time.ts` with `formatEventTime()` that resolves all three modes to display strings. Add `getNextMelbourneOccurrence()` to `src/lib/time.ts` for finding the next matching weekday for recurring events. Resolution happens in server components (page.tsx files) and pre-formatted strings are passed to client components — keeps the existing hydration-safety discipline.

**Tech Stack:** TypeScript + Next.js 16 App Router + Sanity CMS + Vitest + Testing Library

**Spec:** [docs/superpowers/specs/2026-04-30-prayer-relative-event-times-design.md](../specs/2026-04-30-prayer-relative-event-times-design.md)

---

## File Structure

**New files:**
- `src/lib/event-time.ts` — `formatEventTime()` + helpers
- `src/lib/event-time.test.ts` — unit tests

**Modified files:**
- `src/lib/time.ts` — add `getNextMelbourneOccurrence()`
- `src/lib/time.test.ts` — extend with tests for new helper
- `src/types/sanity.ts` — add new fields to `SanityEvent`
- `src/sanity/schemas/documents/event.ts` — add 8 new fields, hide existing `time`/`endTime` conditionally
- `src/sanity/schemas/documents/event.test.ts` — schema validation tests
- `src/sanity/lib/queries.ts` — add new fields to 4 event queries
- `src/app/events/page.tsx` — fetch prayerSettings + resolve times
- `src/app/events/EventsContent.tsx` — consume resolved times via new prop type
- `src/app/events/EventsContent.test.tsx` — update tests for new prop
- `src/app/events/[slug]/page.tsx` — fetch prayerSettings + resolve time
- `src/app/page.tsx` — homepage: resolve times for events and programs
- `src/components/sections/WhatsOnSection.tsx` — `EventItem` and `ProgramItem` consume resolved times
- `src/components/sections/WhatsOnSection.test.tsx` — update tests

---

## Task 1: `getNextMelbourneOccurrence()` helper

**Files:**
- Modify: `src/lib/time.ts` — add new exported function at the end of file
- Modify: `src/lib/time.test.ts` — extend with tests for the new helper

The helper resolves a `recurringDay` string like `"Fridays"` to a `Date` representing **noon Melbourne** on the next matching calendar day. Noon-anchoring avoids the UTC-midnight tz boundary bug (CLAUDE.md correction #9): `new Date("2026-12-31")` reads as `2027-01-01` in Melbourne; passing such a date to `getPrayerTimesForDate()` would look up the wrong day in the 365-day table.

When today already matches the requested day, return today (so a Friday recurring event displayed on a Friday shows that day's prayer time, not next week's).

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/time.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getNextMelbourneOccurrence } from "./time";

describe("getNextMelbourneOccurrence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today when today matches the requested day", () => {
    // 2026-05-01 is a Friday in Melbourne
    vi.setSystemTime(new Date("2026-05-01T03:00:00Z")); // 1 PM Melbourne
    const result = getNextMelbourneOccurrence("Fridays");
    expect(result.toISOString().startsWith("2026-05-01")).toBe(true);
  });

  it("returns the next matching weekday when today is a different day", () => {
    // 2026-04-30 is a Thursday in Melbourne; next Friday is 2026-05-01
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("Fridays");
    // Anchored to noon Melbourne on 2026-05-01 — UTC equivalent depends on DST
    // but the Melbourne calendar date should always be 2026-05-01
    const melbourneDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(result);
    expect(melbourneDateStr).toBe("2026-05-01");
  });

  it("wraps to next week when target day is before today", () => {
    // 2026-04-30 is a Thursday; previous Monday was 2026-04-27, next Monday is 2026-05-04
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("Mondays");
    const melbourneDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(result);
    expect(melbourneDateStr).toBe("2026-05-04");
  });

  it("anchors result to noon Melbourne (avoids UTC-midnight boundary)", () => {
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("Fridays");
    // Hour part in Melbourne should be 12 (noon)
    const hour = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Australia/Melbourne",
      hour: "2-digit",
      hour12: false,
    }).format(result);
    expect(hour).toBe("12");
  });

  it("handles all seven weekday names (singular and plural forms)", () => {
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z")); // Thursday
    expect(getNextMelbourneOccurrence("Mondays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Tuesdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Wednesdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Thursdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Fridays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Saturdays")).toBeInstanceOf(Date);
    expect(getNextMelbourneOccurrence("Sundays")).toBeInstanceOf(Date);
  });

  it("returns today's date for unknown day names (defensive fallback)", () => {
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z"));
    const result = getNextMelbourneOccurrence("nonsense");
    const melbourneDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(result);
    expect(melbourneDateStr).toBe("2026-04-30");
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/lib/time.test.ts -t getNextMelbourneOccurrence
```

Expected: all 6 tests fail with `getNextMelbourneOccurrence is not exported`.

- [ ] **Step 3: Implement `getNextMelbourneOccurrence`**

Append to `src/lib/time.ts` (after `formatMelbourneHijri`):

```ts
/**
 * Map of plural weekday names (matching the `recurringDay` field values used
 * across the events schema) to JS day-of-week indices (0 = Sunday … 6 = Saturday).
 */
const DAY_NAME_TO_INDEX: Record<string, number> = {
  Sundays: 0,
  Mondays: 1,
  Tuesdays: 2,
  Wednesdays: 3,
  Thursdays: 4,
  Fridays: 5,
  Saturdays: 6,
};

/**
 * Given a plural weekday name (e.g. "Fridays"), returns a `Date` anchored to
 * **noon Melbourne** on the next calendar day matching that weekday.
 *
 * Today is returned if today already matches the requested weekday. Unknown
 * day names fall back to today (defensive — should not happen for validated
 * Sanity data).
 *
 * Noon-anchoring is critical: passing a date created at UTC midnight to
 * `getPrayerTimesForDate()` can read the wrong day from the prayer-times
 * table when Melbourne is +10/+11 ahead of UTC. Noon Melbourne is always
 * unambiguously on the right day no matter which side of UTC midnight
 * the absolute instant lands on.
 *
 * @example
 *   // Today is Thursday 2026-04-30 — returns Friday 2026-05-01 at noon Melbourne
 *   getNextMelbourneOccurrence("Fridays");
 */
export function getNextMelbourneOccurrence(dayName: string): Date {
  const targetIndex = DAY_NAME_TO_INDEX[dayName];
  // Get today's Melbourne wall-clock components
  const now = new Date();
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MELBOURNE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const year = Number(todayParts.find((p) => p.type === "year")?.value);
  const month = Number(todayParts.find((p) => p.type === "month")?.value);
  const day = Number(todayParts.find((p) => p.type === "day")?.value);
  const weekdayShort = todayParts.find((p) => p.type === "weekday")?.value ?? "";
  const todayIndex =
    ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[
      weekdayShort
    ] ?? 0;

  if (targetIndex === undefined) {
    // Defensive: unknown day name → return today at noon Melbourne
    return melbourneInstant(year, month, day, 12, 0);
  }

  const offset = (targetIndex - todayIndex + 7) % 7;
  // Add `offset` days to today's Melbourne calendar date, anchoring at noon
  const targetUtcMs = melbourneInstant(year, month, day, 12, 0).getTime() + offset * 86_400_000;
  return new Date(targetUtcMs);
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/lib/time.test.ts -t getNextMelbourneOccurrence
```

Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/time.ts src/lib/time.test.ts
git commit -m "feat(time): add getNextMelbourneOccurrence helper

Resolves a plural weekday name (e.g. \"Fridays\") to a Date anchored to
noon Melbourne on the next matching calendar day. Returns today if today
already matches. Noon-anchoring avoids the UTC-midnight tz boundary bug.

Used in the upcoming prayer-relative event times feature to compute the
reference date for recurring events."
```

---

## Task 2: Extend `SanityEvent` interface

**Files:**
- Modify: `src/types/sanity.ts:15-47`

Add the 8 new fields as optional. Required-ness is enforced at the Sanity validation layer (Task 3), not in TypeScript — this keeps the type compatible with legacy documents that lack the new fields.

- [ ] **Step 1: Add fields to `SanityEvent` interface**

Edit `src/types/sanity.ts`. After the `endTime?: string;` field (line 26), insert:

```ts
  /** "fixed" = use existing time dropdown, "prayer" = relative to prayer, "custom" = free text. Defaults to "fixed". */
  startTimeMode?: "fixed" | "prayer" | "custom";
  /** Selected prayer when startTimeMode === "prayer". */
  startPrayer?: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  /** Editable label preceding the prayer name on display, e.g. "After", "Before". Default "After". */
  startPrayerLabel?: string;
  /** Free-text start time when startTimeMode === "custom", e.g. "TBD", "After dinner". */
  customStartTime?: string;
  /** Same modes as startTimeMode for the end side. */
  endTimeMode?: "fixed" | "prayer" | "custom";
  /** Selected prayer when endTimeMode === "prayer". */
  endPrayer?: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  /** Editable label preceding the prayer name. Default "Until". */
  endPrayerLabel?: string;
  /** Free-text end time when endTimeMode === "custom". */
  customEndTime?: string;
```

- [ ] **Step 2: Run type-check — confirm it passes**

```bash
npm run type-check
```

Expected: no errors. Existing code that reads `event.time` / `event.endTime` is unaffected because both fields remain on the interface.

- [ ] **Step 3: Commit**

```bash
git add src/types/sanity.ts
git commit -m "types(sanity): add prayer-relative time fields to SanityEvent

Eight new optional fields per the feature spec: startTimeMode/endTimeMode
discriminators, startPrayer/endPrayer enums, startPrayerLabel/endPrayerLabel
editable prefixes, and customStartTime/customEndTime for free-text mode.
All optional at the type level; required-ness enforced in Sanity validation."
```

---

## Task 3: Extend event schema (with validation)

**Files:**
- Modify: `src/sanity/schemas/documents/event.ts:288-317` (existing `time` and `endTime` fields)

The two existing fields (`time`, `endTime`) get `hidden` conditionals. Eight new fields are added — placed immediately after the existing time fields and before the `location` field so the time-related controls cluster together in Studio.

- [ ] **Step 1: Modify `time` and `endTime` to be hidden in non-fixed modes**

In `src/sanity/schemas/documents/event.ts`, find the `time` field (line 288):

Replace:

```ts
    defineField({
      name: "time",
      title: "Start Time",
      type: "string",
      description: "Optional — leave blank if time is flexible or TBA",
      options: {
        list: timeOptions,
      },
    }),
```

with:

```ts
    defineField({
      name: "time",
      title: "Start Time",
      type: "string",
      description: "Optional — leave blank if time is flexible or TBA",
      options: {
        list: timeOptions,
      },
      hidden: ({ document }) => {
        const mode = (document as { startTimeMode?: string } | undefined)?.startTimeMode;
        return mode === "prayer" || mode === "custom";
      },
    }),
```

Similarly for `endTime` (find the `defineField({ name: "endTime", ... })` block):

```ts
    defineField({
      name: "endTime",
      title: "End Time",
      type: "string",
      description: "Optional — must be after start time",
      options: {
        list: timeOptions,
      },
      hidden: ({ document }) => {
        const mode = (document as { endTimeMode?: string } | undefined)?.endTimeMode;
        return mode === "prayer" || mode === "custom";
      },
      validation: (Rule) =>
        Rule.custom((endTime, context) => {
          const doc = context.document as { time?: string; endTimeMode?: string; startTimeMode?: string } | undefined;
          // Skip the start-vs-end check unless both modes are fixed
          if (doc?.endTimeMode && doc.endTimeMode !== "fixed") return true;
          if (doc?.startTimeMode && doc.startTimeMode !== "fixed") return true;
          if (!endTime || !doc?.time) return true;
          const timeToIndex = (t: string) => timeOptions.findIndex((o) => o.value === t);
          const startIdx = timeToIndex(doc.time);
          const endIdx = timeToIndex(endTime);
          if (startIdx >= 0 && endIdx >= 0 && endIdx <= startIdx) {
            return "End time must be after start time";
          }
          return true;
        }),
    }),
```

- [ ] **Step 2: Add `startTimeMode` and related fields**

In `src/sanity/schemas/documents/event.ts`, immediately **after** the (now updated) `time` field block and **before** the `endTime` field block, add:

```ts
    // ── Start time mode (fixed dropdown / prayer-relative / custom text) ──
    defineField({
      name: "startTimeMode",
      title: "Start Time Mode",
      type: "string",
      initialValue: "fixed",
      description: "How to express start time. Switching modes hides the other inputs.",
      options: {
        list: [
          { title: "Fixed time (use the dropdown)", value: "fixed" },
          { title: "After / Before / Around a prayer", value: "prayer" },
          { title: "Custom text (e.g. TBD, After dinner)", value: "custom" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "startPrayer",
      title: "Start Prayer",
      type: "string",
      description: "Which prayer this event starts relative to.",
      options: {
        list: [
          { title: "Fajr", value: "fajr" },
          { title: "Dhuhr", value: "dhuhr" },
          { title: "Asr", value: "asr" },
          { title: "Maghrib", value: "maghrib" },
          { title: "Isha", value: "isha" },
        ],
        layout: "radio",
      },
      hidden: ({ document }) =>
        (document as { startTimeMode?: string } | undefined)?.startTimeMode !== "prayer",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { startTimeMode?: string } | undefined;
          if (doc?.startTimeMode === "prayer" && !value) {
            return "Pick a prayer when start mode is set to prayer";
          }
          return true;
        }),
    }),
    defineField({
      name: "startPrayerLabel",
      title: "Start Label",
      type: "string",
      initialValue: "After",
      description: 'Word(s) before the prayer name on display. Default: "After".',
      hidden: ({ document }) =>
        (document as { startTimeMode?: string } | undefined)?.startTimeMode !== "prayer",
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: "customStartTime",
      title: "Custom Start Time",
      type: "string",
      description: 'Free text shown verbatim, e.g. "TBD", "After dinner".',
      hidden: ({ document }) =>
        (document as { startTimeMode?: string } | undefined)?.startTimeMode !== "custom",
      validation: (Rule) =>
        Rule.max(80).custom((value, context) => {
          const doc = context.document as { startTimeMode?: string } | undefined;
          if (doc?.startTimeMode === "custom" && !value?.toString().trim()) {
            return "Type the custom start time text";
          }
          return true;
        }),
    }),
```

- [ ] **Step 3: Add `endTimeMode` and related fields**

Immediately after the (updated) `endTime` field block, add:

```ts
    // ── End time mode (fixed dropdown / prayer-relative / custom text) ──
    defineField({
      name: "endTimeMode",
      title: "End Time Mode",
      type: "string",
      initialValue: "fixed",
      description: "How to express end time.",
      options: {
        list: [
          { title: "Fixed time (use the dropdown)", value: "fixed" },
          { title: "Until / Before a prayer", value: "prayer" },
          { title: "Custom text (e.g. Late night)", value: "custom" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "endPrayer",
      title: "End Prayer",
      type: "string",
      description: "Which prayer this event ends relative to.",
      options: {
        list: [
          { title: "Fajr", value: "fajr" },
          { title: "Dhuhr", value: "dhuhr" },
          { title: "Asr", value: "asr" },
          { title: "Maghrib", value: "maghrib" },
          { title: "Isha", value: "isha" },
        ],
        layout: "radio",
      },
      hidden: ({ document }) =>
        (document as { endTimeMode?: string } | undefined)?.endTimeMode !== "prayer",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { endTimeMode?: string } | undefined;
          if (doc?.endTimeMode === "prayer" && !value) {
            return "Pick a prayer when end mode is set to prayer";
          }
          return true;
        }),
    }),
    defineField({
      name: "endPrayerLabel",
      title: "End Label",
      type: "string",
      initialValue: "Until",
      description: 'Word(s) before the prayer name on display. Default: "Until".',
      hidden: ({ document }) =>
        (document as { endTimeMode?: string } | undefined)?.endTimeMode !== "prayer",
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: "customEndTime",
      title: "Custom End Time",
      type: "string",
      description: 'Free text shown verbatim.',
      hidden: ({ document }) =>
        (document as { endTimeMode?: string } | undefined)?.endTimeMode !== "custom",
      validation: (Rule) =>
        Rule.max(80).custom((value, context) => {
          const doc = context.document as { endTimeMode?: string } | undefined;
          if (doc?.endTimeMode === "custom" && !value?.toString().trim()) {
            return "Type the custom end time text";
          }
          return true;
        }),
    }),
```

- [ ] **Step 4: Add schema validation tests**

Append to `src/sanity/schemas/documents/event.test.ts`:

```ts
import event from "./event";

function getField(name: string) {
  // event.fields is an array of defineField outputs; we look up by name
  const fields = (event as { fields: Array<{ name: string; validation?: unknown; hidden?: unknown; initialValue?: unknown }> }).fields;
  return fields.find((f) => f.name === name);
}

describe("event schema — prayer-relative time fields", () => {
  it("exposes startTimeMode with default 'fixed'", () => {
    const field = getField("startTimeMode");
    expect(field).toBeDefined();
    expect(field?.initialValue).toBe("fixed");
  });

  it("exposes startPrayerLabel with default 'After'", () => {
    expect(getField("startPrayerLabel")?.initialValue).toBe("After");
  });

  it("exposes endTimeMode with default 'fixed'", () => {
    expect(getField("endTimeMode")?.initialValue).toBe("fixed");
  });

  it("exposes endPrayerLabel with default 'Until'", () => {
    expect(getField("endPrayerLabel")?.initialValue).toBe("Until");
  });

  it("hides startPrayer when startTimeMode is not 'prayer'", () => {
    const field = getField("startPrayer");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "prayer" } })).toBe(false);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(true);
  });

  it("hides customStartTime when startTimeMode is not 'custom'", () => {
    const field = getField("customStartTime");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(false);
  });

  it("hides existing time field when startTimeMode is prayer or custom", () => {
    const field = getField("time");
    const hidden = field?.hidden as ((arg: { document: unknown }) => boolean) | undefined;
    expect(hidden?.({ document: { startTimeMode: "fixed" } })).toBe(false);
    expect(hidden?.({ document: { startTimeMode: "prayer" } })).toBe(true);
    expect(hidden?.({ document: { startTimeMode: "custom" } })).toBe(true);
  });
});
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
npx vitest run src/sanity/schemas/documents/event.test.ts
```

Expected: all new tests pass; existing tests in the file still pass.

- [ ] **Step 6: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 7: Smoke test in Sanity Studio**

```bash
npm run dev
```

In a browser, open `http://localhost:3000/studio` → Site Pages → Events → Live on Website → Events → open Anchored - Brothers Nights. Confirm:
- "Start Time Mode" radio appears with three options
- Selecting "Fixed time" shows the existing Start Time dropdown
- Selecting "After / Before / Around a prayer" hides the dropdown and shows Start Prayer + Start Label
- Selecting "Custom text" hides the dropdown and shows Custom Start Time
- Same flow for the end side

Stop the dev server (Ctrl+C).

- [ ] **Step 8: Commit**

```bash
git add src/sanity/schemas/documents/event.ts src/sanity/schemas/documents/event.test.ts
git commit -m "feat(event-schema): add prayer-relative time fields

Eight new fields (start/end × mode/prayer/label/custom) wire up the
three-mode design: fixed dropdown, prayer-relative, or custom text. The
existing time/endTime dropdowns are hidden in non-fixed modes via
conditional hidden() callbacks. Validation ensures the per-mode field
is set when its mode is selected, and the label inputs are capped at
20 chars. Defaults: startPrayerLabel='After', endPrayerLabel='Until'."
```

---

## Task 4: Update GROQ queries

**Files:**
- Modify: `src/sanity/lib/queries.ts` — `eventsQuery`, `featuredEventsQuery`, `programsQuery`, `eventBySlugQuery`

GROQ projections that use explicit field lists need the new fields added. Without this, the data won't reach the page even though it's stored in Sanity.

- [ ] **Step 1: Add fields to `eventsQuery`**

Find `eventsQuery` (around line 70). In its projection block (the `{ ... }` after the filter), add the new fields after `endTime,`:

```groq
    time,
    endTime,
    startTimeMode,
    startPrayer,
    startPrayerLabel,
    customStartTime,
    endTimeMode,
    endPrayer,
    endPrayerLabel,
    customEndTime,
    location,
```

- [ ] **Step 2: Add fields to `featuredEventsQuery`**

Find `featuredEventsQuery` (around line 105). Add the same eight fields after `endTime,` in its projection.

- [ ] **Step 3: Add fields to `programsQuery`**

Find `programsQuery` (around line 185). Programs don't have an `endTime` field in the existing projection but do have `time`. Add after the `time` line:

```groq
    time,
    endTime,
    startTimeMode,
    startPrayer,
    startPrayerLabel,
    customStartTime,
    endTimeMode,
    endPrayer,
    endPrayerLabel,
    customEndTime,
```

(Add `endTime` too — programs may use it now.)

- [ ] **Step 4: Add fields to `eventBySlugQuery`**

Find `eventBySlugQuery` (around line 35). Add the same fields after `endTime,`.

- [ ] **Step 5: Run type-check**

```bash
npm run type-check
```

Expected: no errors. (GROQ is a string; the query change won't trigger type errors directly. The check confirms nothing else broke.)

- [ ] **Step 6: Verify fetched shape (manual)**

```bash
npx sanity documents query '*[_id == "c8e051af-0450-4a36-9003-b2d46d532c78"]{startTimeMode, startPrayer, startPrayerLabel, customStartTime, endTimeMode, endPrayer, endPrayerLabel, customEndTime}' --pretty 2>&1 | tail -10
```

Expected: returns the document with all 8 fields (most likely all `null` for now since no admin has set them — that's correct).

- [ ] **Step 7: Commit**

```bash
git add src/sanity/lib/queries.ts
git commit -m "feat(queries): include prayer-relative time fields in event GROQ queries

Eight new fields added to projections in eventsQuery, featuredEventsQuery,
programsQuery, and eventBySlugQuery so the data reaches the consuming
pages. programsQuery also gains endTime since the new modes can apply
there too."
```

---

## Task 5: `src/lib/event-time.ts` — `formatEventTime()`

**Files:**
- Create: `src/lib/event-time.ts`
- Create: `src/lib/event-time.test.ts`

The core display module. Pure function over `(event, prayerSettings)`. Returns `{ start: string; end: string }`. Resolves prayer mode using `getPrayerTimesForDate()` and `getNextMelbourneOccurrence()`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/event-time.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatEventTime } from "./event-time";
import type { SanityEvent, SanityPrayerSettings } from "@/types/sanity";

function makeEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: "evt-1",
    title: "Test",
    slug: "test",
    eventType: "single",
    date: "2026-05-01",
    time: "",
    location: "",
    categories: [],
    description: "",
    ...overrides,
  };
}

describe("formatEventTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T03:00:00Z")); // Thursday
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("fixed mode (backward compatibility)", () => {
    it("returns the time field when mode is undefined (legacy doc)", () => {
      const event = makeEvent({ time: "7:30 PM" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("7:30 PM");
      expect(result.end).toBe("");
    });

    it("returns time and endTime when both set", () => {
      const event = makeEvent({ time: "7:30 PM", endTime: "9:00 PM" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("7:30 PM");
      expect(result.end).toBe("9:00 PM");
    });

    it("explicit startTimeMode='fixed' behaves the same as undefined", () => {
      const event = makeEvent({ time: "7:30 PM", startTimeMode: "fixed" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("7:30 PM");
    });

    it("returns empty string when time is blank", () => {
      const event = makeEvent({ time: "", startTimeMode: "fixed" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("");
    });
  });

  describe("custom mode", () => {
    it("renders trimmed customStartTime", () => {
      const event = makeEvent({ startTimeMode: "custom", customStartTime: "  TBD  " });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("TBD");
    });

    it("renders trimmed customEndTime", () => {
      const event = makeEvent({ endTimeMode: "custom", customEndTime: "Late night" });
      const result = formatEventTime(event, null);
      expect(result.end).toBe("Late night");
    });

    it("returns empty string when customStartTime is blank/missing", () => {
      const event = makeEvent({ startTimeMode: "custom" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("");
    });
  });

  describe("prayer mode — single event", () => {
    it("renders 'After Isha (time)' for a single event on a known date", () => {
      // 2026-05-01 — May = day 121 of year. Look up actual table value.
      // The test asserts the format and that *some* HH:MM AM/PM appears.
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
        startPrayerLabel: "After",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha \(\d{1,2}:\d{2} (AM|PM)\)$/);
    });

    it("uses 'After' as default label when startPrayerLabel is blank", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "maghrib",
        startPrayerLabel: "",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Maghrib /);
    });

    it("uses 'Until' as default label for end side when endPrayerLabel is blank", () => {
      const event = makeEvent({
        date: "2026-05-01",
        endTimeMode: "prayer",
        endPrayer: "fajr",
        endPrayerLabel: "",
      });
      const result = formatEventTime(event, null);
      expect(result.end).toMatch(/^Until Fajr /);
    });

    it("uses admin-supplied label when provided", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "maghrib",
        startPrayerLabel: "Before",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^Before Maghrib /);
    });
  });

  describe("prayer mode — recurring event", () => {
    it("uses next occurrence of recurringDay as the reference date", () => {
      // Today is Thursday 2026-04-30. Next Friday is 2026-05-01.
      const event = makeEvent({
        eventType: "recurring",
        date: undefined,
        recurringDay: "Fridays",
        startTimeMode: "prayer",
        startPrayer: "isha",
        startPrayerLabel: "After",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha \(\d{1,2}:\d{2} (AM|PM)\)$/);
    });
  });

  describe("combined start + end", () => {
    it("renders both sides when both are set", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
        endTimeMode: "prayer",
        endPrayer: "fajr",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha /);
      expect(result.end).toMatch(/^Until Fajr /);
    });

    it("supports mixed modes — prayer start, fixed end", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
        endTimeMode: "fixed",
        endTime: "11:00 PM",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha /);
      expect(result.end).toBe("11:00 PM");
    });
  });

  describe("defensive fallbacks", () => {
    it("returns empty string when prayer mode but no startPrayer set", () => {
      const event = makeEvent({ date: "2026-05-01", startTimeMode: "prayer" });
      const result = formatEventTime(event, null);
      expect(result.start).toBe("");
    });

    it("does not crash when prayerSettings is null (uses hardcoded table)", () => {
      const event = makeEvent({
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
      });
      expect(() => formatEventTime(event, null)).not.toThrow();
    });

    it("falls back to today when single event has no date", () => {
      const event = makeEvent({
        date: undefined,
        startTimeMode: "prayer",
        startPrayer: "isha",
      });
      const result = formatEventTime(event, null);
      expect(result.start).toMatch(/^After Isha /);
    });
  });

  it("ignores stale fields when mode switches (e.g. mode=custom but time still set)", () => {
    const event = makeEvent({
      time: "7:30 PM",
      startTimeMode: "custom",
      customStartTime: "TBD",
    });
    const result = formatEventTime(event, null);
    expect(result.start).toBe("TBD");
    expect(result.start).not.toContain("7:30 PM");
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/lib/event-time.test.ts
```

Expected: all tests fail with `Cannot find module './event-time'`.

- [ ] **Step 3: Implement `formatEventTime`**

Create `src/lib/event-time.ts`:

```ts
/**
 * Event time display resolution — turns the schema-level fields
 * (startTimeMode, startPrayer, etc.) into ready-to-render display strings.
 *
 * Three modes per side:
 *   - "fixed":  use the existing time/endTime dropdown value
 *   - "prayer": "{label} {Prayer} ({adhan time for relevant date})"
 *   - "custom": free text the admin typed
 *
 * Reference date for prayer-mode lookup:
 *   - recurring → next occurrence of recurringDay (today if today matches)
 *   - single/multi → event.date, parsed at noon Melbourne for tz safety
 *   - missing date → today (defensive)
 *
 * Pure function — runs server-side. Output is a string, so it can safely be
 * passed as a prop from a server component to a client component without
 * triggering hydration mismatches.
 *
 * @module lib/event-time
 */
import type { PrayerName } from "./prayer-times";
import { getPrayerTimesForDate } from "./prayer-times";
import { getNextMelbourneOccurrence, melbourneInstant } from "./time";
import type { SanityEvent, SanityPrayerSettings } from "@/types/sanity";

export interface ResolvedEventTime {
  start: string;
  end: string;
}

/**
 * Shape consumed by client components — original event/program plus the
 * server-resolved display strings. Defined here so consumers don't each
 * declare their own copy.
 */
export type EventForDisplay = SanityEvent & { resolvedTime: ResolvedEventTime };

const VALID_PRAYERS: ReadonlySet<PrayerName> = new Set([
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
]);

/**
 * Given an event and (optional) prayer settings, returns the display strings
 * for start and end. Empty string means "don't render".
 */
export function formatEventTime(
  event: SanityEvent,
  prayerSettings: SanityPrayerSettings | null,
): ResolvedEventTime {
  return {
    start: resolveSide(event, prayerSettings, "start"),
    end: resolveSide(event, prayerSettings, "end"),
  };
}

function resolveSide(
  event: SanityEvent,
  prayerSettings: SanityPrayerSettings | null,
  side: "start" | "end",
): string {
  const mode = side === "start" ? event.startTimeMode : event.endTimeMode;
  // Default mode is "fixed" for legacy documents
  if (!mode || mode === "fixed") {
    return (side === "start" ? event.time : event.endTime) ?? "";
  }
  if (mode === "custom") {
    const raw = side === "start" ? event.customStartTime : event.customEndTime;
    return (raw ?? "").trim();
  }
  // mode === "prayer"
  const prayer = side === "start" ? event.startPrayer : event.endPrayer;
  if (!prayer || !VALID_PRAYERS.has(prayer)) {
    return "";
  }
  const labelRaw = side === "start" ? event.startPrayerLabel : event.endPrayerLabel;
  const fallbackLabel = side === "start" ? "After" : "Until";
  const label = (labelRaw ?? "").trim() || fallbackLabel;
  const referenceDate = deriveReferenceDate(event);
  const times = getPrayerTimesForDate(referenceDate, prayerSettings);
  const adhan = times[prayer]?.adhan ?? "";
  const prayerLabel = capitalize(prayer);
  return adhan ? `${label} ${prayerLabel} (${adhan})` : `${label} ${prayerLabel}`;
}

function deriveReferenceDate(event: SanityEvent): Date {
  if (event.eventType === "recurring") {
    return event.recurringDay
      ? getNextMelbourneOccurrence(event.recurringDay)
      : new Date();
  }
  if (event.date) {
    return parseMelbourneDateString(event.date);
  }
  return new Date();
}

/**
 * Parses a "YYYY-MM-DD" string as **noon Melbourne** on that calendar day.
 * Noon-anchoring avoids the UTC-midnight tz boundary bug.
 */
function parseMelbourneDateString(yyyyMmDd: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!match) return new Date();
  const [, y, m, d] = match;
  return melbourneInstant(Number(y), Number(m), Number(d), 12, 0);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/lib/event-time.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/event-time.ts src/lib/event-time.test.ts
git commit -m "feat(event-time): add formatEventTime resolver

New module that turns event schema time fields into display strings.
Three modes per side: fixed (existing dropdown), prayer-relative
('After Isha (7:43 PM)'), or custom text. Defensive fallbacks for
legacy documents missing the mode field, blank labels (default 'After'
for start, 'Until' for end), and missing reference dates.

Pure function — designed to run server-side and pass result as a
string prop to client components, avoiding hydration mismatches."
```

---

## Task 6: Wire up `/events` page (server resolution + EventsContent)

**Files:**
- Modify: `src/app/events/page.tsx`
- Modify: `src/app/events/EventsContent.tsx`
- Modify: `src/app/events/EventsContent.test.tsx`

The events page server component fetches events + prayer settings, computes display strings, and passes the augmented events to the client component.

- [ ] **Step 1: Augment server component (events/page.tsx) to resolve times**

Read the current `src/app/events/page.tsx`:

```bash
cat src/app/events/page.tsx
```

Replace the file with this version (preserving any existing metadata exports — adapt as needed):

```tsx
/**
 * Events Page
 *
 * Server component that fetches events + prayer settings, resolves time
 * display strings, and passes augmented data to the client component.
 *
 * @route /events
 * @module app/events/page
 */
import { Metadata } from "next";
import EventsContent, { type EventForDisplay } from "./EventsContent";
import { getEvents, getEventsPageSettings, getPrayerSettings } from "@/sanity/lib/fetch";
import { formatEventTime } from "@/lib/event-time";
import type { SanityEvent } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Events",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const [events, settings, prayerSettings] = await Promise.all([
    getEvents() as Promise<SanityEvent[]>,
    getEventsPageSettings(),
    getPrayerSettings(),
  ]);

  const eventsForDisplay: EventForDisplay[] = events.map((event) => ({
    ...event,
    resolvedTime: formatEventTime(event, prayerSettings),
  }));

  return <EventsContent events={eventsForDisplay} pageSettings={settings} />;
}
```

If the existing file has a different shape (different metadata or other side-effects), preserve those — only change the body of `EventsPage` to add prayer settings + resolution.

- [ ] **Step 2: Update `EventsContent.tsx` to consume the new prop type**

In `src/app/events/EventsContent.tsx`:

(a) Import the shared type at the top of the file:

```tsx
import type { EventForDisplay } from "@/lib/event-time";
```

(The type itself lives in `event-time.ts` to avoid duplicating the definition across consumers.)

(b) Change the `EventsContentProps` interface and `EventCardProps`:

```tsx
interface EventsContentProps {
  events: EventForDisplay[];
  pageSettings?: SanitySimplePageSettings | null;
}

interface EventCardProps {
  event: EventForDisplay;
  viewMode: "grid" | "list";
  index: number;
}
```

(c) Replace the existing `getDisplayTime` function with a reader against `resolvedTime`:

Find:

```ts
function getDisplayTime(event: SanityEvent): string {
  if (!event.time) return "";
  if (event.endTime) {
    return `${event.time} - ${event.endTime}`;
  }
  return event.time;
}
```

Replace with:

```ts
function getDisplayTime(event: EventForDisplay): string {
  const { start, end } = event.resolvedTime;
  if (start && end) return `${start} - ${end}`;
  return start || end;
}
```

(d) Anywhere `event.time` is rendered directly (search for `{event.time}` and `{getDisplayTime(event)}`), it should now use `getDisplayTime(event)` consistently.

- [ ] **Step 3: Update existing tests to provide `resolvedTime`**

In `src/app/events/EventsContent.test.tsx`, update the `makeEvent` factory to include `resolvedTime`:

```tsx
function makeEvent(overrides: Partial<EventForDisplay> = {}): EventForDisplay {
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
    resolvedTime: { start: overrides.time ?? "10:00 AM", end: overrides.endTime ?? "" },
    ...overrides,
  };
}
```

Add the import at the top:

```tsx
import type { EventForDisplay } from "./EventsContent";
```

- [ ] **Step 4: Add specific tests for prayer-mode rendering**

Append to the existing `describe("EventsContent", ...)` block in the test file:

```tsx
  it("renders the resolved time string from resolvedTime, not raw time field", () => {
    const events: EventForDisplay[] = [
      {
        _id: "p1",
        title: "Prayer Event",
        slug: "prayer-event",
        description: "x",
        categories: ["Community"],
        time: "",
        location: "Main Hall",
        eventType: "single",
        displayAs: "event",
        date: "2026-05-01",
        startTimeMode: "prayer",
        startPrayer: "isha",
        startPrayerLabel: "After",
        resolvedTime: { start: "After Isha (7:43 PM)", end: "" },
      },
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByText("After Isha (7:43 PM)")).toBeInTheDocument();
  });

  it("renders custom typed time verbatim", () => {
    const events: EventForDisplay[] = [
      {
        _id: "c1",
        title: "Custom Event",
        slug: "custom-event",
        description: "x",
        categories: ["Community"],
        time: "",
        location: "Main Hall",
        eventType: "single",
        displayAs: "event",
        date: "2026-05-01",
        startTimeMode: "custom",
        customStartTime: "TBD",
        resolvedTime: { start: "TBD", end: "" },
      },
    ];
    render(<EventsContent events={events} />);
    expect(screen.getByText("TBD")).toBeInTheDocument();
  });
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
npx vitest run src/app/events/EventsContent.test.tsx
```

Expected: all tests pass (existing + new).

- [ ] **Step 6: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 7: Smoke test in browser**

```bash
npm run dev
```

In Sanity Studio, edit Anchored - Brothers Nights:
- Set Start Time Mode = "After / Before / Around a prayer"
- Set Start Prayer = "Isha"
- Leave label as default "After"
- Publish

Then visit `http://localhost:3000/events`. The Anchored card should show **"After Isha (7:43 PM)"** (or whatever Friday's Isha is). If you don't see the change immediately:

```bash
SECRET=$(grep "SANITY_REVALIDATE_SECRET" .env.local | cut -d= -f2-)
curl -s -X POST "http://localhost:3000/api/revalidate?secret=$SECRET" -H "Content-Type: application/json" -d '{"_type":"event"}'
```

Then refresh the events page. After verifying, **revert Anchored's mode back to "fixed"** so we don't leave it modified before merging the feature.

Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add src/app/events/page.tsx src/app/events/EventsContent.tsx src/app/events/EventsContent.test.tsx
git commit -m "feat(events-page): render resolved prayer/custom time strings

The /events page now fetches prayerSettings and resolves each event's
display time server-side via formatEventTime(). EventsContent accepts
the new EventForDisplay shape (SanityEvent + resolvedTime) and renders
event.resolvedTime.start / .end instead of event.time directly.

Backward compatible: legacy documents (no startTimeMode) resolve as
'fixed' mode and produce identical output to before."
```

---

## Task 7: Wire up event detail page (`/events/[slug]`)

**Files:**
- Modify: `src/app/events/[slug]/page.tsx`

The detail page currently has a local `getTimeDisplay()` function (around line 107-115). Replace with a call to `formatEventTime()` plus prayer settings fetch.

- [ ] **Step 1: Read current state**

```bash
sed -n '76,130p' src/app/events/\[slug\]/page.tsx
```

Note the existing `getTimeDisplay()` function and its callers.

- [ ] **Step 2: Add prayer settings fetch + resolved time**

In `src/app/events/[slug]/page.tsx`, find the `EventPage` server component:

```tsx
export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) as SanityEvent | null;

  if (!event) {
    notFound();
  }
```

Replace with:

```tsx
export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const [event, prayerSettings] = await Promise.all([
    getEventBySlug(slug) as Promise<SanityEvent | null>,
    getPrayerSettings(),
  ]);

  if (!event) {
    notFound();
  }

  const resolvedTime = formatEventTime(event, prayerSettings);
```

Add the imports at the top:

```tsx
import { getPrayerSettings } from "@/sanity/lib/fetch";
import { formatEventTime } from "@/lib/event-time";
```

Make sure `getEventBySlug` is still in the import list — adjust as needed:

```tsx
import { getEventBySlug, getEventsForStaticGeneration, getSiteSettings, getPrayerSettings } from "@/sanity/lib/fetch";
```

- [ ] **Step 3: Replace `getTimeDisplay` with the resolved value**

Find:

```tsx
  // Format time display
  const getTimeDisplay = () => {
    if (event.time) {
      if (event.endTime) {
        return `${event.time} - ${event.endTime}`;
      }
      return event.time;
    }
    return "Time TBA";
  };
```

Replace with:

```tsx
  // Format time display from resolved time strings
  const getTimeDisplay = () => {
    const { start, end } = resolvedTime;
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    if (end) return end;
    return "Time TBA";
  };
```

(All existing call sites of `getTimeDisplay()` continue to work unchanged.)

- [ ] **Step 4: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 5: Smoke test**

```bash
npm run dev
```

Visit `http://localhost:3000/events/anchored` (or whatever Anchored's slug is). Confirm the event detail page renders the prayer-mode time correctly. Revert Anchored to fixed mode in Studio if you set it for testing.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/app/events/\[slug\]/page.tsx
git commit -m "feat(event-detail): render resolved prayer/custom time

Event detail page (/events/[slug]) now fetches prayerSettings and
resolves the time display via formatEventTime(). Replaces the local
getTimeDisplay() that read raw time/endTime fields."
```

---

## Task 8: Wire up homepage + WhatsOnSection

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/sections/WhatsOnSection.tsx`
- Modify: `src/components/sections/WhatsOnSection.test.tsx`

The homepage fetches featured events and programs. Both lists need prayer-mode resolution. `WhatsOnSection`'s `EventItem` and `ProgramItem` render `event.time` / `program.time` inline — they need to switch to `event.resolvedTime` / `program.resolvedTime`.

- [ ] **Step 1: Update homepage to resolve times**

In `src/app/page.tsx`, find the `Promise.allSettled([...])` block. Add `getPrayerSettings()` to the list (alongside the existing fetches):

```tsx
const results = await Promise.allSettled([
  getFeaturedEvents(),
  getUrgentAnnouncements(),
  getFeaturedServices(),
  getLatestAnnouncements(),
  getPrograms(),
  getTeamMembersByCategory("imam"),
  getFeaturedGalleryImages(),
  getHomepageSettings(),
  getPrayerSettings(),
]);
```

Add the destructuring after the existing `homepageSettings` line:

```tsx
const prayerSettings = results[8].status === "fulfilled" ? (results[8].value as SanityPrayerSettings | null) : null;
```

Resolve times before passing to WhatsOnSection. Replace the existing pass-through:

```tsx
<WhatsOnSection
  events={allEvents}
  programs={programs}
  services={services}
/>
```

with:

```tsx
const eventsWithTime = allEvents.map((event) => ({
  ...event,
  resolvedTime: formatEventTime(event, prayerSettings),
}));
const programsWithTime = programs.map((program) => ({
  ...program,
  resolvedTime: formatEventTime(program, prayerSettings),
}));

return (
  <>
    {/* ... existing JSX above WhatsOnSection unchanged ... */}
    <WhatsOnSection
      events={eventsWithTime}
      programs={programsWithTime}
      services={services}
    />
    {/* ... existing JSX below unchanged ... */}
  </>
);
```

(Adjust the JSX edit to match how the existing `return (...)` is structured. The point: pass arrays with `resolvedTime` instead of raw events/programs.)

Add the imports:

```tsx
import { getPrayerSettings } from "@/sanity/lib/fetch";
import { formatEventTime } from "@/lib/event-time";
import type { SanityPrayerSettings } from "@/types/sanity";
```

- [ ] **Step 2: Update `WhatsOnSection.tsx` to accept resolved times**

In `src/components/sections/WhatsOnSection.tsx`:

(a) Import the shared type from `event-time.ts`:

```tsx
import type { EventForDisplay } from "@/lib/event-time";
```

Since `SanityProgram = SanityEvent` (alias in `src/types/sanity.ts:81`), `EventForDisplay` works for both events and programs. Use it as the prop type for both `EventItem` and `ProgramItem`.

(b) Update `WhatsOnSectionProps`:

```tsx
interface WhatsOnSectionProps {
  services?: SanityService[];
  events?: EventForDisplay[];
  programs?: EventForDisplay[];
}
```

(c) Update `EventItem` to use `resolvedTime`. Find:

```tsx
{event.time && (
  <span className="flex items-center gap-1">
    <Clock className="w-3 h-3 text-green-500" />
    {event.time}
  </span>
)}
```

Replace with:

```tsx
{event.resolvedTime.start && (
  <span className="flex items-center gap-1">
    <Clock className="w-3 h-3 text-green-500" />
    {event.resolvedTime.end
      ? `${event.resolvedTime.start} - ${event.resolvedTime.end}`
      : event.resolvedTime.start}
  </span>
)}
```

Update the `event` prop type on the `EventItem` function signature:

```tsx
function EventItem({ event, index, size = "compact" }: { event: EventForDisplay; index: number; size?: CardSize }) {
```

(d) Same change for `ProgramItem`. Find any `program.time` reference in the time cell and apply the same pattern. Update the function signature:

```tsx
function ProgramItem({ program, index, size = "compact" }: { program: EventForDisplay; index: number; size?: CardSize }) {
```

- [ ] **Step 3: Update WhatsOnSection tests**

In `src/components/sections/WhatsOnSection.test.tsx`, update any test fixtures that build event/program objects to include `resolvedTime`:

```tsx
function makeEventForDisplay(overrides = {}): EventForDisplay {
  return {
    _id: "e1",
    title: "Test Event",
    slug: "test",
    description: "",
    categories: [],
    eventType: "single",
    time: "7:00 PM",
    location: "Hall",
    resolvedTime: { start: "7:00 PM", end: "" },
    ...overrides,
  };
}
```

Add a test for prayer-mode rendering:

```tsx
it("renders resolved prayer time on EventItem", () => {
  const events = [makeEventForDisplay({
    title: "Anchored",
    resolvedTime: { start: "After Isha (7:43 PM)", end: "" },
  })];
  render(<WhatsOnSection events={events} programs={[]} services={[]} />);
  // The Events tab should be visible with the resolved time
  expect(screen.getByText("After Isha (7:43 PM)")).toBeInTheDocument();
});
```

(Adjust the import of `EventForDisplay` from where it's exported — if not yet exported from `WhatsOnSection.tsx`, export it: `export type EventForDisplay = ...`.)

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/components/sections/WhatsOnSection.test.tsx
```

Expected: all tests pass.

- [ ] **Step 5: Run full type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 6: Smoke test homepage**

```bash
npm run dev
```

Visit `http://localhost:3000`. Scroll to "What's On" section. Confirm:
- Events tab still shows Anchored (with whatever time mode you've left it in)
- Programs tab still shows the recurring programs
- No console errors about missing `resolvedTime`

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/components/sections/WhatsOnSection.tsx src/components/sections/WhatsOnSection.test.tsx
git commit -m "feat(homepage): render resolved prayer/custom time on WhatsOnSection

Homepage now fetches prayerSettings and resolves event + program time
strings server-side. WhatsOnSection's EventItem and ProgramItem render
event.resolvedTime.start / .end instead of event.time directly. Same
backward-compat guarantee — legacy documents resolve as 'fixed' mode."
```

---

## Task 9: Final validation + push

- [ ] **Step 1: Run full validate**

```bash
npm run type-check && npm run lint && npm run test:run && npm run build
```

Expected: all four pass. (`check:sanity` may fail locally on a stale token — that's not in CI, can be ignored for push purposes.)

- [ ] **Step 2: Manual end-to-end test in browser**

```bash
npm run dev
```

In Sanity Studio:

(a) Edit Anchored - Brothers Nights:
- Set Start Time Mode = "Prayer"
- Set Start Prayer = "Isha"
- Leave label as "After"
- Publish

(b) In a separate browser tab, hit revalidate:

```bash
SECRET=$(grep "SANITY_REVALIDATE_SECRET" .env.local | cut -d= -f2-)
curl -s -X POST "http://localhost:3000/api/revalidate?secret=$SECRET" -H "Content-Type: application/json" -d '{"_type":"event"}'
```

(c) Verify three pages display correctly:
- `/` (homepage) — Events tab shows Anchored with "After Isha (X:XX PM)"
- `/events` — Anchored card shows "After Isha (X:XX PM)"
- `/events/anchored` — detail page shows "After Isha (X:XX PM)"

(d) Edit Anchored again:
- Set Start Label = "Before"
- Publish + revalidate

Confirm all three pages now show "Before Isha (X:XX PM)".

(e) Switch to custom mode:
- Set Start Time Mode = "Custom"
- Set Custom Start Time = "TBD"
- Publish + revalidate

Confirm all three pages now show "TBD".

(f) **Revert** Anchored back to its original fixed-mode state before pushing — set Start Time Mode = "Fixed time" and clear any temporary values. This keeps prod data clean.

Stop the dev server.

- [ ] **Step 3: Push branch**

```bash
git push -u origin feature/prayer-relative-event-times
```

- [ ] **Step 4: Open PR**

```bash
gh pr create --title "Prayer-relative event times" --body "$(cat <<'EOF'
## Summary

Admins can now set an event's start or end time in three modes:
- **Fixed** — the existing time dropdown (default, unchanged behaviour)
- **Prayer-relative** — "After Isha", "Before Maghrib", etc. Resolves to the chosen prayer's adhan time for the relevant date
- **Custom** — free-typed text like "TBD", "After dinner"

Prayer-relative resolves the actual time from the existing 365-day prayer-times table for the relevant date — `event.date` for one-off events, next occurrence of `recurringDay` for recurring events. The preceding label ("After" / "Until" / "Before" / etc.) is editable per event with sensible defaults.

## Spec
[docs/superpowers/specs/2026-04-30-prayer-relative-event-times-design.md](docs/superpowers/specs/2026-04-30-prayer-relative-event-times-design.md)

## What changed

- 8 new fields on the event schema (start/end × mode/prayer/label/custom)
- `src/lib/event-time.ts` — new `formatEventTime()` resolver
- `src/lib/time.ts` — new `getNextMelbourneOccurrence()` helper
- All event GROQ queries fetch the new fields
- Server-side resolution in `app/events/page.tsx`, `app/events/[slug]/page.tsx`, `app/page.tsx` — resolved strings passed to client components (no hydration risk)
- WhatsOnSection EventItem / ProgramItem render `event.resolvedTime`

## Backward compatibility

Existing event documents have no `startTimeMode` field. The display logic treats undefined as `"fixed"`, so the page renders identically to before. **Zero migration needed.**

## Test plan

- [ ] Set Anchored to prayer mode → confirm "After Isha (X:XX PM)" on /, /events, /events/anchored
- [ ] Change start label to "Before" → confirm prefix updates
- [ ] Switch to custom mode "TBD" → confirm verbatim render
- [ ] Revert to fixed mode → confirm identical to current production behaviour
- [ ] Existing fixed-mode events show their dropdown time as before

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Final commit if anything was missed**

If the validate or smoke test surfaced any issues fixed inline, commit them now:

```bash
git add -p
git commit -m "fix: <describe inline fix>"
git push
```

---

## Self-Review Checklist

After implementation is complete, verify:

1. [ ] Existing events render identically to current production (smoke test on a fixed-mode event)
2. [ ] Prayer-mode renders "After Isha (X:XX PM)" with the correct date's prayer time
3. [ ] Custom mode renders the typed text verbatim
4. [ ] Editable label defaults: "After" for start, "Until" for end
5. [ ] Recurring events use the next occurrence's date for prayer lookup
6. [ ] No hydration mismatch warnings in browser console
7. [ ] Sanity Studio shows only the relevant input per mode (fixed → dropdown only; prayer → prayer + label only; custom → text only)
8. [ ] All four CI checks pass (type-check, lint, test:run, build)
9. [ ] Schema validation prevents publishing prayer mode without a prayer selected
10. [ ] Schema validation prevents publishing custom mode with empty text
