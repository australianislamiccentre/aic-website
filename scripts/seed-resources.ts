/**
 * Seed Resources (placeholders)
 *
 * Creates placeholder resource docs so /resources renders instead of
 * showing an empty state. Admin should replace with real content in Studio.
 *
 * Touches doc _ids: "resource-new-muslim-guide", "resource-prayer-guide",
 *                   "resource-ramadan-guide".
 *
 * Usage: npx tsx scripts/seed-resources.ts
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

type Resource = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  resourceType: "pdf" | "link";
  category: "new-muslims" | "general" | "ramadan";
  externalUrl?: string;
  active: boolean;
  featured: boolean;
  language: "en";
};

const resources: Resource[] = [
  {
    _id: "resource-new-muslim-guide",
    title: "Welcome to Islam — A Guide for New Muslims (Placeholder)",
    slug: "new-muslim-guide",
    description: "A beginner-friendly introduction to the pillars of Islam, daily practice, and community support for new Muslims.",
    resourceType: "link",
    category: "new-muslims",
    externalUrl: "https://www.australianislamiccentre.org",
    active: true,
    featured: true,
    language: "en",
  },
  {
    _id: "resource-prayer-guide",
    title: "How to Pray — Step-by-Step Guide (Placeholder)",
    slug: "prayer-guide",
    description: "A visual guide to performing the five daily prayers, including wudu, positions, and recitations.",
    resourceType: "link",
    category: "general",
    externalUrl: "https://www.australianislamiccentre.org",
    active: true,
    featured: true,
    language: "en",
  },
  {
    _id: "resource-ramadan-guide",
    title: "Ramadan Essentials (Placeholder)",
    slug: "ramadan-guide",
    description: "Everything you need to know about fasting, taraweeh, laylatul qadr, and making the most of Ramadan.",
    resourceType: "link",
    category: "ramadan",
    externalUrl: "https://www.australianislamiccentre.org",
    active: true,
    featured: false,
    language: "en",
  },
];

const REQUIRED = ["title", "slug", "description", "resourceType", "category"] as const;

async function main() {
  console.log("=== Seed Resources (placeholders) ===\n");

  for (const r of resources) {
    console.log(`Resource: ${r.title} (${r._id})`);

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{ _id }`,
      { id: r._id },
    );

    if (!existing) {
      console.log("  · does not exist, creating");
      await client.create({
        _id: r._id,
        _type: "resource",
        title: r.title,
        slug: { _type: "slug", current: r.slug },
      });
    } else {
      console.log("  · already exists, patching fields");
    }

    await client
      .patch(r._id)
      .set({
        title: r.title,
        slug: { _type: "slug", current: r.slug },
        description: r.description,
        resourceType: r.resourceType,
        category: r.category,
        externalUrl: r.externalUrl,
        active: r.active,
        featured: r.featured,
        language: r.language,
      })
      .commit();
    console.log("  · patched");

    const after = await client.fetch<Record<string, unknown> | null>(
      `*[_id == $id][0]`,
      { id: r._id },
    );
    if (!after) throw new Error(`${r._id} not found after patch`);
    for (const f of REQUIRED) {
      const v = after[f];
      const ok =
        v !== null &&
        v !== undefined &&
        !(typeof v === "string" && v.trim() === "");
      if (!ok) throw new Error(`Verification failed: ${r._id}.${f} is empty`);
    }
    console.log(`  ✓ verified: type="${after.resourceType}", category="${after.category}"\n`);
  }

  console.log("✓ All resources seeded and verified.");
  console.log("  NOTE: These are placeholders. Replace with real content in Studio.");
}

main().catch((e) => {
  console.error("\n✗ Error:", e);
  process.exit(1);
});
