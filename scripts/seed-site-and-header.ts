/**
 * Seed: siteSettings.name + headerSettings.navGroups + homepageSettings.heroSlides
 *
 * Populates critical missing fields using patch().set() operations only.
 * Never uses setIfMissing or createOrReplace.
 *
 * Touches docs:
 *   - siteSettings (patch: name if missing)
 *   - headerSettings (patch: navGroups + topBar + ctaButton + showSearch + contactLink if missing)
 *   - homepageSettings (patch: heroSlides if missing)
 *
 * Each field is read back after writing and verified non-empty.
 *
 * Usage: npx tsx scripts/seed-site-and-header.ts
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

type Patch = { id: string; field: string; value: unknown };
const writes: Patch[] = [];

async function patchIfEmpty(id: string, field: string, value: unknown) {
  const current = await client.fetch<Record<string, unknown> | null>(
    `*[_id == $id][0]{ "v": ${field} }`,
    { id },
  );
  const existing = current?.v;
  const isEmpty =
    existing === null ||
    existing === undefined ||
    (Array.isArray(existing) && existing.length === 0) ||
    (typeof existing === "string" && existing.trim() === "");
  if (!isEmpty) {
    console.log(`  = ${id}.${field} already set, skipping`);
    return;
  }
  await client.patch(id).set({ [field]: value }).commit();
  writes.push({ id, field, value });
  console.log(`  ✓ ${id}.${field} patched`);
}

async function main() {
  console.log("=== Seed siteSettings + headerSettings + homepageSettings ===\n");

  // ── siteSettings ──
  console.log("siteSettings:");
  await patchIfEmpty("siteSettings", "name", "Australian Islamic Centre");

  // ── headerSettings ──
  console.log("\nheaderSettings:");
  await patchIfEmpty("headerSettings", "topBar", {
    desktopWelcome: "Welcome to the Australian Islamic Centre",
    mobileWelcome: "Welcome to AIC",
    visible: true,
  });
  await patchIfEmpty("headerSettings", "ctaButton", {
    label: "Donate",
    linkType: "page",
    page: "/donate",
    accentColor: "lime",
    icon: "Heart",
  });
  await patchIfEmpty("headerSettings", "showSearch", true);
  await patchIfEmpty("headerSettings", "contactLink", {
    label: "Contact Us",
    linkType: "page",
    page: "/contact",
    visible: true,
  });
  await patchIfEmpty("headerSettings", "menuDonateCard", {
    heading: "Support Our Community",
    description: "Your generosity helps us serve the community",
    buttonText: "Donate",
    linkType: "page",
    page: "/donate",
    visible: true,
  });
  await patchIfEmpty("headerSettings", "navGroups", [
    {
      _key: "about",
      label: "About",
      description: "Learn about our centre",
      visible: true,
      links: [
        { _key: "story", label: "Our Story", linkType: "page", page: "/about", visible: true },
        { _key: "imams", label: "Our Imams", linkType: "page", page: "/imams", visible: true },
        { _key: "partners", label: "Affiliated Partners", linkType: "page", page: "/partners", visible: true },
      ],
    },
    {
      _key: "whatson",
      label: "What's On",
      description: "Events, services & programs",
      visible: true,
      links: [
        { _key: "events", label: "Events", linkType: "page", page: "/events", visible: true },
        { _key: "services", label: "Services", linkType: "page", page: "/services", visible: true },
        { _key: "announcements", label: "Announcements", linkType: "page", page: "/announcements", visible: true },
        { _key: "programs", label: "Programs", linkType: "custom", customUrl: "/events#programs", visible: true },
      ],
    },
    {
      _key: "mosque",
      label: "Our Mosque",
      description: "Prayer, worship & visiting",
      visible: true,
      links: [
        { _key: "worshippers", label: "For Worshippers", linkType: "page", page: "/worshippers", visible: true },
        { _key: "visit", label: "Plan Your Visit", linkType: "page", page: "/visit", visible: true },
        { _key: "architecture", label: "Architecture", linkType: "page", page: "/architecture", visible: true },
      ],
    },
    {
      _key: "media",
      label: "Media & Resources",
      description: "Gallery & downloads",
      visible: true,
      links: [
        { _key: "gallery", label: "Media Gallery", linkType: "page", page: "/media", visible: true },
        { _key: "resources", label: "Resources", linkType: "page", page: "/resources", visible: true },
      ],
    },
  ]);

  // ── homepageSettings ──
  console.log("\nhomepageSettings:");
  await patchIfEmpty("homepageSettings", "heroMode", "carousel");
  // Note: heroSlides requires background images (schema validation). We skip seeding
  // slides here because they need real image assets — admin will add them in Studio.
  // The homepage falls back to defaults via hardcoded content when slides are empty.

  // ── Read-back verification ──
  console.log("\n── Verification ──");
  for (const w of writes) {
    const doc = await client.fetch<Record<string, unknown> | null>(
      `*[_id == $id][0]{ "v": ${w.field} }`,
      { id: w.id },
    );
    const v = doc?.v;
    const ok =
      v !== null &&
      v !== undefined &&
      !(Array.isArray(v) && v.length === 0) &&
      !(typeof v === "string" && v.trim() === "");
    if (!ok) {
      throw new Error(`Verification failed: ${w.id}.${w.field} is empty after patch`);
    }
    const preview = Array.isArray(v) ? `[${v.length} items]` : typeof v === "object" ? "{object}" : String(v).slice(0, 50);
    console.log(`  ✓ ${w.id}.${w.field} = ${preview}`);
  }

  console.log(`\n✓ ${writes.length} field(s) patched and verified.`);
}

main().catch((e) => {
  console.error("\n✗ Error:", e);
  process.exit(1);
});
