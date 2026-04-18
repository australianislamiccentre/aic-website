/**
 * Sanity Content Health Check (READ-ONLY)
 *
 * Audits the dataset for missing or empty content that the live site depends on.
 * Does NOT mutate anything. Safe to run anywhere, including CI.
 *
 * Exits 1 if any critical gap is found so CI can fail on it.
 *
 * Usage: npx tsx scripts/check-sanity-content.ts
 */
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
});

type Gap = { severity: "error" | "warn"; message: string };
const gaps: Gap[] = [];

function err(msg: string) { gaps.push({ severity: "error", message: msg }); }
function warn(msg: string) { gaps.push({ severity: "warn", message: msg }); }

// Content document types the site renders. Each needs at least one published doc.
const requiredCollections: Array<{ type: string; label: string; minCount: number }> = [
  { type: "partner", label: "Partners", minCount: 1 },
  { type: "teamMember", label: "Team members / Imams", minCount: 1 },
  { type: "service", label: "Services", minCount: 1 },
  { type: "resource", label: "Resources", minCount: 1 },
  { type: "galleryImage", label: "Gallery images", minCount: 1 },
  { type: "event", label: "Events", minCount: 0 }, // events can be empty
  { type: "announcement", label: "Announcements", minCount: 0 },
  { type: "donationCampaign", label: "Donation campaigns", minCount: 0 },
  { type: "faq", label: "FAQs", minCount: 0 },
];

// Singletons with critical fields. Each entry: id → list of field paths that must be non-null.
const criticalSingletonFields: Array<{ id: string; fields: string[] }> = [
  { id: "siteSettings", fields: ["name", "email", "phone", "address", "operatingHours"] },
  { id: "headerSettings", fields: ["navGroups"] },
  { id: "footerSettings", fields: ["navGroups", "brandDescription"] },
  { id: "homepageSettings", fields: ["heroSlides"] },
  { id: "prayerSettings", fields: [] },
];

async function main() {
  console.log("\n=== Sanity Content Health Check ===\n");
  console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}\n`);

  // 1. Collection counts
  console.log("── Collection counts (published only) ──");
  for (const c of requiredCollections) {
    const count = await client.fetch<number>(
      `count(*[_type == $t && !(_id in path("drafts.**"))])`,
      { t: c.type },
    );
    const status = count < c.minCount ? "✗" : "✓";
    console.log(`  ${status} ${c.label.padEnd(30)} ${count}`);
    if (count < c.minCount) {
      err(`${c.label}: expected >= ${c.minCount}, found ${count}`);
    }
  }

  // 2. Singleton critical fields
  console.log("\n── Singleton critical fields ──");
  for (const s of criticalSingletonFields) {
    const doc = await client.fetch<Record<string, unknown> | null>(
      `*[_id == $id][0]`,
      { id: s.id },
    );
    if (!doc) {
      console.log(`  ✗ ${s.id} — document does not exist`);
      err(`Singleton missing: ${s.id}`);
      continue;
    }
    console.log(`  • ${s.id}`);
    for (const field of s.fields) {
      const value = doc[field];
      const isEmpty =
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "");
      const status = isEmpty ? "✗" : "✓";
      const preview = isEmpty
        ? "(empty)"
        : Array.isArray(value)
          ? `[${value.length} items]`
          : typeof value === "object"
            ? "{object}"
            : String(value).slice(0, 60);
      console.log(`      ${status} ${field.padEnd(22)} ${preview}`);
      if (isEmpty) err(`${s.id}.${field} is empty`);
    }
  }

  // 3. operatingHours shape drift check
  console.log("\n── Schema drift checks ──");
  const site = await client.fetch<{ operatingHours?: unknown } | null>(
    `*[_id == "siteSettings"][0]{ operatingHours }`,
  );
  if (site?.operatingHours && typeof site.operatingHours === "object") {
    console.log(`  ✗ siteSettings.operatingHours is an object — schema expects string`);
    warn("siteSettings.operatingHours needs migration from object → string");
  } else if (typeof site?.operatingHours === "string") {
    console.log(`  ✓ siteSettings.operatingHours is a string`);
  }

  // 4. Partner slug sanity
  const partners = await client.fetch<Array<{ _id: string; name?: string; slug?: { current?: string } }>>(
    `*[_type == "partner" && !(_id in path("drafts.**"))]{ _id, name, "slug": slug }`,
  );
  if (partners.length > 0) {
    console.log("\n── Partners ──");
    for (const p of partners) {
      const slug = p.slug?.current;
      const status = slug ? "✓" : "✗";
      console.log(`  ${status} ${(p.name ?? "(unnamed)").padEnd(30)} /${slug ?? "(no slug)"}`);
      if (!slug) err(`Partner ${p._id} has no slug`);
    }
  }

  // Summary
  console.log("\n=== Summary ===");
  const errors = gaps.filter((g) => g.severity === "error");
  const warns = gaps.filter((g) => g.severity === "warn");
  console.log(`  Errors:   ${errors.length}`);
  console.log(`  Warnings: ${warns.length}`);
  if (gaps.length > 0) {
    console.log("\nDetails:");
    for (const g of gaps) console.log(`  [${g.severity}] ${g.message}`);
  }
  console.log();

  if (errors.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
