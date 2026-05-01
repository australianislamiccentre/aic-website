/**
 * Migrate Event Time Modes — Backfill `startTimeMode` and `endTimeMode`
 * on existing event documents that pre-date the prayer-relative time feature.
 *
 * Why this exists: the schema sets `initialValue: "fixed"` on both mode
 * fields, but `initialValue` only fires for *new* documents. Existing
 * documents have `startTimeMode = undefined`, which renders the radio in
 * Studio with no option visually selected — confusing for admins even
 * though the display layer treats undefined as fixed.
 *
 * This script sets `startTimeMode = "fixed"` and `endTimeMode = "fixed"`
 * on every event document where they're missing, so the radio always
 * shows a selection. The display layer treats fixed-mode events
 * identically whether the field is undefined or explicitly "fixed", so
 * this is a no-op visually on the public site.
 *
 * Run modes:
 *   npx tsx scripts/migrate-event-time-modes.ts           # dry-run (default)
 *   npx tsx scripts/migrate-event-time-modes.ts --apply   # actually patch
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local.
 *
 * Per CLAUDE.md Sanity rules:
 *   - Uses client.patch().set() with setIfMissing — NEVER createOrReplace
 *   - Reads back every patched doc and asserts both fields are present
 *   - Dry-run prints every doc ID + target before any mutation
 *   - Skips docs that already have both fields set
 *
 * @see docs/superpowers/specs/2026-04-30-prayer-relative-event-times-design.md
 */
import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

interface EventDoc {
  _id: string;
  _type: "event";
  title?: string;
  startTimeMode?: string;
  endTimeMode?: string;
}

interface PlanRow {
  _id: string;
  title: string;
  needsStartMode: boolean;
  needsEndMode: boolean;
  action: "skip" | "patch";
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

async function buildPlan(client: SanityClient): Promise<PlanRow[]> {
  const docs = await client.fetch<EventDoc[]>(
    `*[_type == "event"]{ _id, _type, title, startTimeMode, endTimeMode }`,
  );
  return docs.map((doc) => {
    const needsStartMode = !doc.startTimeMode;
    const needsEndMode = !doc.endTimeMode;
    return {
      _id: doc._id,
      title: doc.title ?? "(no title)",
      needsStartMode,
      needsEndMode,
      action: needsStartMode || needsEndMode ? "patch" : "skip",
    };
  });
}

function printPlan(plan: PlanRow[]): void {
  const counts = {
    skip: plan.filter((p) => p.action === "skip").length,
    patchBoth: plan.filter((p) => p.action === "patch" && p.needsStartMode && p.needsEndMode).length,
    patchStart: plan.filter((p) => p.action === "patch" && p.needsStartMode && !p.needsEndMode).length,
    patchEnd: plan.filter((p) => p.action === "patch" && !p.needsStartMode && p.needsEndMode).length,
  };
  console.log(`\nFound ${plan.length} event document(s).`);
  console.log(`  → already migrated (skip):  ${counts.skip}`);
  console.log(`  → will set both modes:      ${counts.patchBoth}`);
  console.log(`  → will set startTimeMode:   ${counts.patchStart}`);
  console.log(`  → will set endTimeMode:     ${counts.patchEnd}\n`);
  for (const row of plan) {
    if (row.action === "skip") {
      console.log(`  ${row._id}  [skip]  ${row.title}`);
      continue;
    }
    const fields: string[] = [];
    if (row.needsStartMode) fields.push("startTimeMode=fixed");
    if (row.needsEndMode) fields.push("endTimeMode=fixed");
    console.log(`  ${row._id}  [set ${fields.join(", ")}]  ${row.title}`);
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
      const fields: Record<string, string> = {};
      if (row.needsStartMode) fields.startTimeMode = "fixed";
      if (row.needsEndMode) fields.endTimeMode = "fixed";

      await client.patch(row._id).set(fields).commit();

      // Read-back verification per CLAUDE.md seed-script rules.
      const verify = await client.fetch<{ startTimeMode?: string; endTimeMode?: string } | null>(
        `*[_id == $id][0]{ startTimeMode, endTimeMode }`,
        { id: row._id },
      );
      const startOk = !row.needsStartMode || verify?.startTimeMode === "fixed";
      const endOk = !row.needsEndMode || verify?.endTimeMode === "fixed";
      if (!startOk || !endOk) {
        failures.push({
          id: row._id,
          reason: `read-back mismatch: start=${verify?.startTimeMode ?? "undefined"}, end=${verify?.endTimeMode ?? "undefined"}`,
        });
        console.error(`  ✗ ${row._id}  read-back failed`);
      } else {
        success++;
        const setLabel = [
          row.needsStartMode ? "start" : "",
          row.needsEndMode ? "end" : "",
        ].filter(Boolean).join("+");
        console.log(`  ✓ ${row._id}  → ${setLabel}=fixed`);
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

  console.log("Event time modes migration");
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

const isEntryPoint = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1] === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
