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
