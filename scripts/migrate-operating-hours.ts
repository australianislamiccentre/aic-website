/**
 * Migration: siteSettings.operatingHours object → string
 *
 * Old shape: { weekdays: string, weekends: string, notes: string }
 * New shape: string (e.g. "Open Daily from Fajr to Isha")
 *
 * This script uses patch().set() (NOT createOrReplace). It reads the current
 * value, collapses it into a single sensible string, writes it, then reads
 * it back and asserts the final value is a string.
 *
 * Only touches document _id: "siteSettings".
 *
 * Usage: npx tsx scripts/migrate-operating-hours.ts
 */
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

async function main() {
  console.log("=== Migrate siteSettings.operatingHours (object → string) ===\n");

  const before = await client.fetch<{ operatingHours?: unknown } | null>(
    `*[_id == "siteSettings"][0]{ operatingHours }`,
  );
  if (!before) throw new Error("siteSettings document not found");

  console.log("Before:", JSON.stringify(before.operatingHours));

  // Already a string?
  if (typeof before.operatingHours === "string") {
    console.log("\nAlready a string — nothing to do.");
    return;
  }

  // Derive a single-line string from the object
  let value: string;
  if (before.operatingHours && typeof before.operatingHours === "object") {
    const oh = before.operatingHours as {
      weekdays?: string;
      weekends?: string;
      notes?: string;
    };
    // Prefer notes if it captures the sentiment, otherwise collapse all parts
    if (oh.notes && /daily/i.test(oh.notes)) {
      value = oh.notes;
    } else {
      const parts: string[] = [];
      if (oh.weekdays) parts.push(`Weekdays: ${oh.weekdays}`);
      if (oh.weekends) parts.push(`Weekends: ${oh.weekends}`);
      if (oh.notes) parts.push(oh.notes);
      value = parts.join(" · ") || "Open Daily from Fajr to Isha";
    }
  } else {
    value = "Open Daily from Fajr to Isha";
  }

  console.log(`\nWill patch siteSettings.operatingHours to:\n  "${value}"\n`);

  // First unset the object, then set the string. Sanity requires the types to match.
  await client
    .patch("siteSettings")
    .unset(["operatingHours"])
    .commit();
  await client
    .patch("siteSettings")
    .set({ operatingHours: value })
    .commit();

  // Read-back verify
  const after = await client.fetch<{ operatingHours?: unknown } | null>(
    `*[_id == "siteSettings"][0]{ operatingHours }`,
  );
  console.log("After:", JSON.stringify(after?.operatingHours));

  if (typeof after?.operatingHours !== "string") {
    throw new Error(
      `Verification failed: operatingHours is ${typeof after?.operatingHours}, expected string`,
    );
  }
  if (after.operatingHours !== value) {
    throw new Error(
      `Verification failed: expected "${value}", got "${after.operatingHours}"`,
    );
  }

  console.log("\n✓ Migration verified.");
}

main().catch((e) => {
  console.error("\n✗ Error:", e);
  process.exit(1);
});
