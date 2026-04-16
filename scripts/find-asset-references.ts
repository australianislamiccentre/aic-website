/**
 * Find Sanity documents that reference specific media assets.
 *
 * Useful when the Sanity media library blocks asset deletion because
 * one or more documents still hold a reference to the asset.
 *
 * Run with:
 *   npx tsx scripts/find-asset-references.ts
 *
 * Prerequisites: .env.local must contain:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET      (defaults to "production")
 *   SANITY_API_WRITE_TOKEN          (a token with at least read access)
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error("ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID is not set in .env.local");
  process.exit(1);
}
if (!token) {
  console.error("ERROR: SANITY_API_WRITE_TOKEN is not set in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ─── Assets to locate ────────────────────────────────────────────────────────
// Partial filename matches — case-insensitive substring match against
// the asset's originalFilename field in Sanity.
const TARGET_FILENAMES = [
  "Counselling & Support",
  "nikah",
  "funeral",
  "religious services",
  "pergola",
  "nfc favicon",
  "Untitled design (13)",
  "Green and Blue Playful Ramadan Daily",
  "urgent",
  "boys wrestling",
  "jiu-jitsu-kids",
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface SanityAsset {
  _id: string;
  originalFilename: string;
  url: string;
}

interface SanityDocument {
  _id: string;
  _type: string;
  title?: string;
  name?: string;
  slug?: { current?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return a human-readable label for a document. */
function docLabel(doc: SanityDocument): string {
  const label = doc.title ?? doc.name ?? doc.slug?.current ?? "(no title)";
  return `[${doc._type}] "${label}" (${doc._id})`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nConnecting to Sanity project "${projectId}" / dataset "${dataset}"...\n`);

  // 1. Fetch ALL image and file assets so we can match by filename.
  //    Fetching in one query is cheaper than N individual queries.
  const allAssets: SanityAsset[] = await client.fetch(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{
      _id,
      originalFilename,
      url
    }`
  );

  console.log(`Found ${allAssets.length} total assets in the media library.\n`);

  // 2. Filter to only the assets whose filename contains one of our targets.
  const targetAssets = allAssets.filter((asset) =>
    TARGET_FILENAMES.some((name) =>
      asset.originalFilename?.toLowerCase().includes(name.toLowerCase())
    )
  );

  if (targetAssets.length === 0) {
    console.log(
      "None of the target filenames were found in the media library.\n" +
        "Double-check the filenames in TARGET_FILENAMES and try again."
    );
    return;
  }

  console.log(`Matched ${targetAssets.length} asset(s) to investigate:\n`);
  for (const a of targetAssets) {
    console.log(`  • ${a.originalFilename}  →  ${a._id}`);
  }
  console.log("");

  // 3. For each asset, find every document that references it.
  let totalReferences = 0;
  const unreferenced: SanityAsset[] = [];

  for (const asset of targetAssets) {
    const refs: SanityDocument[] = await client.fetch(
      `*[references($assetId)]{_id, _type, title, name, slug}`,
      { assetId: asset._id }
    );

    if (refs.length === 0) {
      unreferenced.push(asset);
      console.log(`✓  "${asset.originalFilename}" — no references found (safe to delete)`);
    } else {
      totalReferences += refs.length;
      console.log(
        `✗  "${asset.originalFilename}" — referenced by ${refs.length} document(s):`
      );
      for (const doc of refs) {
        console.log(`     → ${docLabel(doc)}`);
      }
    }

    console.log("");
  }

  // 4. Summary
  console.log("─".repeat(60));
  console.log("SUMMARY");
  console.log("─".repeat(60));
  console.log(`Assets checked      : ${targetAssets.length}`);
  console.log(`Still referenced    : ${targetAssets.length - unreferenced.length}`);
  console.log(`Safe to delete      : ${unreferenced.length}`);
  console.log(`Total references    : ${totalReferences}`);

  if (unreferenced.length > 0) {
    console.log("\nAssets with no references (can be deleted immediately):");
    for (const a of unreferenced) {
      console.log(`  • ${a.originalFilename}  (${a._id})`);
    }
  }

  if (totalReferences > 0) {
    console.log(
      "\nNOTE: To delete a referenced asset you must first remove or update" +
        " the field(s) in the listed document(s) via Sanity Studio."
    );
  }

  console.log("");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
