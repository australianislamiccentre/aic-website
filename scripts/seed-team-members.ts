/**
 * Seed Team Members (placeholders)
 *
 * Creates placeholder team member docs so the /imams and /about pages
 * render something instead of an empty state. Admin should replace these
 * with real content in Studio.
 *
 * Touches doc _ids: "team-head-imam", "team-assistant-imam", "team-quran-teacher".
 *
 * Usage: npx tsx scripts/seed-team-members.ts
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

type Member = {
  _id: string;
  name: string;
  slug: string;
  role: string;
  category: "imam" | "teacher" | "board" | "admin";
  active: boolean;
  featured: boolean;
  shortBio: string;
};

const members: Member[] = [
  {
    _id: "team-head-imam",
    name: "Head Imam (Placeholder)",
    slug: "head-imam",
    role: "Head Imam",
    category: "imam",
    active: true,
    featured: true,
    shortBio: "Leads daily prayers, delivers khutbahs, and provides spiritual guidance to the community.",
  },
  {
    _id: "team-assistant-imam",
    name: "Assistant Imam (Placeholder)",
    slug: "assistant-imam",
    role: "Assistant Imam",
    category: "imam",
    active: true,
    featured: true,
    shortBio: "Assists with daily prayers, teaches classes, and supports community outreach programs.",
  },
  {
    _id: "team-quran-teacher",
    name: "Quran Teacher (Placeholder)",
    slug: "quran-teacher",
    role: "Quran Teacher",
    category: "teacher",
    active: true,
    featured: false,
    shortBio: "Teaches Quran recitation, tajweed, and memorisation to children and adults.",
  },
];

const REQUIRED = ["name", "slug", "role", "category"] as const;

async function main() {
  console.log("=== Seed Team Members (placeholders) ===\n");

  for (const m of members) {
    console.log(`Team member: ${m.name} (${m._id})`);

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{ _id }`,
      { id: m._id },
    );

    if (!existing) {
      console.log("  · does not exist, creating");
      await client.create({
        _id: m._id,
        _type: "teamMember",
        name: m.name,
        slug: { _type: "slug", current: m.slug },
      });
    } else {
      console.log("  · already exists, patching fields");
    }

    await client
      .patch(m._id)
      .set({
        name: m.name,
        slug: { _type: "slug", current: m.slug },
        role: m.role,
        category: m.category,
        active: m.active,
        featured: m.featured,
        shortBio: m.shortBio,
      })
      .commit();
    console.log("  · patched");

    const after = await client.fetch<Record<string, unknown> | null>(
      `*[_id == $id][0]`,
      { id: m._id },
    );
    if (!after) throw new Error(`${m._id} not found after patch`);
    for (const f of REQUIRED) {
      const v = after[f];
      const ok =
        v !== null &&
        v !== undefined &&
        !(typeof v === "string" && v.trim() === "");
      if (!ok) throw new Error(`Verification failed: ${m._id}.${f} is empty`);
    }
    console.log(`  ✓ verified: role="${after.role}", category="${after.category}"\n`);
  }

  console.log("✓ All team members seeded and verified.");
  console.log("  NOTE: These are placeholders. Replace with real content in Studio.");
}

main().catch((e) => {
  console.error("\n✗ Error:", e);
  process.exit(1);
});
