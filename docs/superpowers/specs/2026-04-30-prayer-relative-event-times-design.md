# Prayer-Relative Event Times — Design

**Date:** 2026-04-30
**Branch:** `feature/prayer-relative-event-times`
**Status:** Draft, awaiting user review

---

## Problem

Some events at AIC are scheduled relative to a prayer time, not a fixed clock time — e.g. "After Isha". The Anchored - Brothers Nights poster reads "EVERY FRIDAY AFTER ISHA", but the events page can only render a fixed time string from the `time` dropdown. So today the admin either types "After Isha" into a free-text description (lossy, no live time computation) or picks an approximate clock time that drifts as the seasons change Isha (~7 PM in winter, ~9:30 PM in summer).

Admins want a structured way to express "after Isha" once and have the events page display "After Isha (7:43 PM)" with the time auto-resolved per the event's actual date.

The same problem applies to end times for events that wrap up around another prayer (iftars finishing at Maghrib, all-night programs ending at Fajr), and to ad-hoc descriptors that don't fit either pattern (e.g. "TBD", "After dinner").

## Goals

1. Admin can express start and end times in **three modes**: fixed clock time, prayer-relative, or custom free text.
2. Prayer-relative times resolve to the **adhan time of the relevant prayer for the relevant date** — single events use `event.date`, recurring events use the next occurrence of `recurringDay`.
3. The preceding label ("After", "Before", "Until", etc.) is editable per event with sensible defaults so admins aren't locked into one phrasing.
4. Existing events continue to render exactly as before — zero migration, zero behavioural change for `mode: "fixed"` documents.
5. No hydration mismatch: prayer-time resolution happens server-side and is passed to client components as resolved strings.

## Non-goals

- Changing the `time` / `endTime` dropdown values or the existing prayer-times data table.
- Adding offsets to prayer modes (e.g. "30 min after Isha"). Admins use **custom mode** if they need that phrasing.
- Touching the prayer widget, prayer-times.ts logic, or iqamah/adhan calculations.
- Resolving prayer time using iqamah; "after Isha" is interpreted as **adhan time** for simplicity (per Q1).
- Validating linguistic correctness of admin-typed labels (admin types "Until" for an end-side prefix; we don't try to enforce vocabulary).
- A migration script — every existing event is a `mode: "fixed"` event by default-fallback.

## Solution

### 1. Schema (`src/sanity/schemas/documents/event.ts`)

Add **eight new fields** — four per side. The existing `time` and `endTime` dropdowns stay, just hidden when their side's mode is not `"fixed"`.

#### Start side

```ts
defineField({
  name: "startTimeMode",
  title: "Start Time Mode",
  type: "string",
  initialValue: "fixed",
  options: {
    list: [
      { title: "Fixed time (use the dropdown)", value: "fixed" },
      { title: "After / Before / Until a prayer", value: "prayer" },
      { title: "Custom text (e.g. TBD, After dinner)", value: "custom" },
    ],
    layout: "radio",
  },
}),

defineField({
  name: "startPrayer",
  title: "Start Prayer",
  type: "string",
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
  hidden: ({ document }) => document?.startTimeMode !== "prayer",
  validation: (Rule) =>
    Rule.custom((value, ctx) => {
      const doc = ctx.document as { startTimeMode?: string } | undefined;
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
  description: "Word(s) before the prayer name. Default: \"After\".",
  hidden: ({ document }) => document?.startTimeMode !== "prayer",
  validation: (Rule) => Rule.max(20),
}),

defineField({
  name: "customStartTime",
  title: "Custom Start Time",
  type: "string",
  description: "Free text shown verbatim, e.g. \"TBD\", \"After dinner\".",
  hidden: ({ document }) => document?.startTimeMode !== "custom",
  validation: (Rule) =>
    Rule.max(80).custom((value, ctx) => {
      const doc = ctx.document as { startTimeMode?: string } | undefined;
      if (doc?.startTimeMode === "custom" && !value?.trim()) {
        return "Type the custom start time text";
      }
      return true;
    }),
}),
```

The existing `time` field gets a `hidden: ({document}) => document?.startTimeMode === "prayer" || document?.startTimeMode === "custom"` so it disappears in non-fixed modes.

#### End side

Mirror — `endTimeMode`, `endPrayer`, `endPrayerLabel` (default `"Until"`), `customEndTime`. Same validation pattern. Existing `endTime` hidden when end mode is not `"fixed"`.

#### Backward compatibility

Documents with no `startTimeMode` / `endTimeMode` are treated as `"fixed"` everywhere — both Studio (the field is hidden by default = field is fixed) and the display layer. Admin doesn't need to touch existing events.

### 2. Display logic (`src/lib/event-time.ts`)

New module. One public function:

```ts
export interface ResolvedEventTime {
  start: string;
  end: string;
}

export function formatEventTime(
  event: SanityEvent,
  prayerSettings: SanityPrayerSettings | null,
): ResolvedEventTime;
```

Per-side resolution:

| Mode | Output |
|---|---|
| `fixed` (value present) | `event.time` (or `event.endTime`) verbatim |
| `fixed` (blank) | `""` |
| `prayer` | `"{label} {Prayer} ({adhan time})"` |
| `custom` | trimmed `customStartTime` (or `customEndTime`) |

Prayer formatting:
- `label`: `event.startPrayerLabel?.trim() || "After"` for start, `event.endPrayerLabel?.trim() || "Until"` for end.
- `Prayer`: capitalised English (`isha` → `"Isha"`).
- `adhan time`: from `getPrayerTimesForDate(referenceDate, prayerSettings)[event.startPrayer].adhan`.

Reference-date derivation (used only for prayer mode):

```
if event.eventType === "recurring":
  referenceDate = getNextMelbourneOccurrence(event.recurringDay)
elif event.date:
  referenceDate = parse Melbourne-local YYYY-MM-DD
else:
  referenceDate = new Date()  // today, defensive fallback
```

If the resulting prayer-time lookup returns no adhan (e.g. malformed prayer settings), the function returns `"{label} {Prayer}"` with no parenthetical time — never blank or NaN.

### 3. New helper in `src/lib/time.ts`

```ts
/**
 * Returns a Date anchored to noon Melbourne on the next calendar day
 * matching `dayName`. Noon anchoring avoids the UTC-midnight tz boundary
 * (per CLAUDE.md correction #9 / rule 4): a Date constructed at UTC
 * midnight for "2026-12-31" reads as "2027-01-01" in Melbourne.
 *
 * @param dayName "Mondays" | "Tuesdays" | ... | "Sundays" — pluralised to
 *   match the existing `recurringDay` field values.
 */
export function getNextMelbourneOccurrence(dayName: string): Date;
```

Used by `formatEventTime` to compute the reference date for recurring events. Returns today's date if today already matches the requested weekday (so a Friday recurring event displayed on a Friday shows that day's time, not next week's).

### 4. Server-side resolution (hydration safety)

Per CLAUDE.md "Dates and hydration" rules, the formatted strings are computed in **server components** and passed to client components as resolved props. This avoids `Date.now()`-dependent computation during client render.

Pattern, applied at every consumer:

```tsx
// app/events/page.tsx (server)
const [events, prayerSettings, settings] = await Promise.all([
  getEvents(),
  getPrayerSettings(),
  getEventsPageSettings(),
]);

const eventsWithTime = events.map((event) => ({
  ...event,
  resolvedTime: formatEventTime(event, prayerSettings),
}));

return <EventsContent events={eventsWithTime} pageSettings={settings} />;
```

Type extension:

```ts
// in src/types/sanity.ts (or co-located helper)
export type SanityEventWithResolvedTime = SanityEvent & {
  resolvedTime: ResolvedEventTime;
};
```

`EventsContent` and `WhatsOnSection`'s `EventItem` accept the `WithResolvedTime` shape; their `getDisplayTime` / equivalent inline expressions are replaced with `event.resolvedTime.start` / `.end`.

### 5. Display in event cards

Card cell that previously rendered `getDisplayTime()` becomes:

```tsx
{event.resolvedTime.start && event.resolvedTime.end
  ? `${event.resolvedTime.start} - ${event.resolvedTime.end}`
  : event.resolvedTime.start || event.resolvedTime.end || null}
```

Both blank → entire time row hidden (existing behaviour for events without times).

### 6. Consumers to update

| File | Change |
|---|---|
| `src/sanity/schemas/documents/event.ts` | Add 8 new fields + hide existing `time`/`endTime` conditionally |
| `src/types/sanity.ts` | Add new fields to `SanityEvent` interface (all optional) |
| `src/sanity/lib/queries.ts` | Add new fields to `eventsQuery`, `featuredEventsQuery`, `programsQuery`, `eventBySlugQuery` (all four read events) |
| `src/lib/event-time.ts` | **NEW** — `formatEventTime()` + helpers |
| `src/lib/time.ts` | Add `getNextMelbourneOccurrence()` |
| `src/app/events/page.tsx` | Fetch prayer settings; resolve times before passing to client |
| `src/app/events/EventsContent.tsx` | Replace `getDisplayTime` with `event.resolvedTime` reads |
| `src/app/events/[slug]/page.tsx` | Resolve time for detail page |
| `src/app/events/[slug]/EventDetailContent.tsx` (or equivalent) | Use resolved time |
| `src/app/page.tsx` (homepage) | Resolve time for `getFeaturedEvents()` and `getPrograms()` results |
| `src/components/sections/WhatsOnSection.tsx` | `EventItem` and `ProgramItem` use `event.resolvedTime` |

The `getPrayerSettings()` fetch already exists (used by PrayerWidget) — we just import it where we need it.

### 7. Studio UX notes

- Mode radio sits **above** the `time` field, so the admin sees the choice before the input.
- The conditional `hidden` based on `startTimeMode` means only the relevant input is visible; switching modes hides the others.
- Field `description`s state defaults explicitly: "Default: 'After'", "Default: 'Until'".
- The radio's option titles are descriptive ("Fixed time (use the dropdown)") so admins understand the choice without separate help text.

## Edge cases

| Case | Behaviour |
|---|---|
| Existing event, no `startTimeMode` field | Treated as `"fixed"`. Renders identically to before. |
| `mode = "prayer"`, `startPrayer` blank | Validation prevents publish. Display returns empty string defensively. |
| `mode = "custom"`, `customStartTime` blank | Validation prevents publish. Display returns empty string defensively. |
| `mode = "prayer"`, `startPrayerLabel` blank | Falls back to `"After"` (start) / `"Until"` (end). Display string is well-formed. |
| Recurring event, no `recurringDay` | `getNextMelbourneOccurrence()` returns today's date. Display still works. |
| Single event, no `event.date` | Reference date falls back to today. Display still works (admin shouldn't have a single event without a date, but defensive). |
| `prayerSettings` is null | `getPrayerTimesForDate()` already falls through to the hardcoded 365-day table. Display still works. |
| Adhan lookup returns falsy | Display becomes `"{label} {Prayer}"` with no parenthetical time. Never `"(undefined)"` or NaN. |
| Admin types overlong `startPrayerLabel` (> 20 chars) | Sanity validation rejects publish. |
| DST transition day | Prayer-times table is keyed by day-of-year; DST shift is irrelevant to the index. Display string is still correct. |

## Test plan

**New test files:**
- `src/lib/event-time.test.ts` — `formatEventTime()` over the cartesian product of start mode × end mode (9 combos), for each `eventType` (single/multi/recurring); missing `prayerSettings`; custom label override; default-label fallback; `event.date` parse; recurring `recurringDay` lookup.
- `src/lib/time.test.ts` (extend existing) — `getNextMelbourneOccurrence()` for each weekday; today-matches-name returns today; DST transition correctness; invalid `dayName` returns today.

**Updated test files:**
- `src/sanity/schemas/documents/event.test.ts` — validation: prayer mode requires `startPrayer`; custom mode requires `customStartTime`; label `Rule.max(20)` enforced.
- `src/app/events/EventsContent.test.tsx` — render resolved times for each mode; per-mode UI smoke tests; both-blank hides the row.
- `src/components/sections/WhatsOnSection.test.tsx` — `EventItem` renders resolved times for prayer-mode and custom-mode events.

**Existing tests stay green** — backward-compat for documents without mode fields is part of the design, so no test should need changing solely to accommodate the new schema.

## Migration

**None required.** Existing event documents render identically because:
- `startTimeMode` undefined ⇒ display logic treats as `"fixed"` ⇒ reads `event.time` ⇒ identical to current.
- Same for end side.

If we later want every document to have an explicit mode for cleanliness, a one-shot patch script could set `startTimeMode = "fixed"` (and same for end) on every doc that doesn't already have a value. Out of scope for this work.

## Rollout

1. Land schema + display logic + tests in one PR.
2. After merge, verify in Studio: existing events behave identically, new mode radios work as expected.
3. Admin tries the new modes on Anchored - Brothers Nights as a real-world test (set `startTimeMode: "prayer"`, `startPrayer: "isha"`, leave default label `"After"`).
4. Confirm `/events` card shows `"After Isha (7:43 PM)"` (or whatever Friday's Isha is) and updates automatically week-on-week as the date rolls forward.
