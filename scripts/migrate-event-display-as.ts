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
