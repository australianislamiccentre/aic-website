/**
 * Migrate Homepage Settings — Hero Slides
 *
 * Ensures the homepageSettings singleton has the `heroSlides` field
 * populated. Handles three scenarios:
 *
 * 1. Old `heroContent` + `heroBackgroundImages` format → merge into heroSlides
 * 2. No data at all → populate with defaults
 * 3. Already has heroSlides → no-op
 *
 * Usage:
 *   npx tsx scripts/migrate-homepage-hero.ts
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local
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

// Default hero slides — matches the hardcoded fallback in HeroSection.tsx
const defaultHeroSlides = [
  {
    _type: "heroSlide",
    _key: "slide-welcome",
    title: "Welcome to the",
    highlight: "Australian Islamic Centre",
    subtitle: "A place of worship, learning, and community",
    primaryButton: { label: "Explore Our Centre", url: "/about" },
    secondaryButton: { label: "Book a Visit", url: "/visit" },
    active: true,
  },
  {
    _type: "heroSlide",
    _key: "slide-architecture",
    title: "Award-Winning",
    highlight: "Architecture",
    subtitle: "Experience our globally recognized Islamic architecture",
    primaryButton: { label: "View Architecture", url: "/architecture" },
    secondaryButton: { label: "Book a Visit", url: "/visit" },
    active: true,
  },
  {
    _type: "heroSlide",
    _key: "slide-prayer",
    title: "Join Us in",
    highlight: "Prayer",
    subtitle: "Five daily prayers in our beautiful prayer hall",
    primaryButton: { label: "Prayer Times", url: "#prayer-times" },
    secondaryButton: { label: "Visit Us", url: "/visit" },
    active: true,
  },
];

async function migrate() {
  console.log("🔄 Migrating homepage hero settings to heroSlides format...\n");

  // Fetch current document (including any old/new fields)
  const current = await client.fetch(
    `*[_id == "homepageSettings"][0] {
      _id, _type, _rev,
      heroSlides,
      heroContent,
      heroBackgroundImages,
      heroMode, heroVideoUrl,
      welcomeSection, ctaBanner
    }`
  );

  if (!current) {
    // No document — create with defaults
    console.log("📝 No homepageSettings document found. Creating with defaults...");
    await client.createOrReplace({
      _id: "homepageSettings",
      _type: "homepageSettings",
      heroMode: "carousel",
      heroSlides: defaultHeroSlides,
    });
    console.log("✅ Created homepageSettings with default hero slides.\n");
    return;
  }

  // Already has heroSlides — skip
  if (current.heroSlides && current.heroSlides.length > 0) {
    console.log("✅ homepageSettings already has heroSlides. No migration needed.\n");
    return;
  }

  // Has heroContent (from the separated format) — merge back into heroSlides
  if (current.heroContent && current.heroContent.length > 0) {
    console.log(`📦 Found ${current.heroContent.length} heroContent items. Converting to heroSlides...`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bgImages = (current.heroBackgroundImages ?? []) as any[];

    const heroSlides = current.heroContent.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any, index: number) => ({
        _type: "heroSlide",
        _key: item._key || `migrated-slide-${index}`,
        title: item.title || defaultHeroSlides[index]?.title || "Welcome to the",
        highlight: item.highlight || defaultHeroSlides[index]?.highlight || "Australian Islamic Centre",
        subtitle: item.subtitle || defaultHeroSlides[index]?.subtitle || "",
        ...(item.primaryButton ? { primaryButton: item.primaryButton } : {}),
        ...(item.secondaryButton ? { secondaryButton: item.secondaryButton } : {}),
        // Merge in the corresponding background image if one exists
        ...(bgImages[index]?.image ? { image: bgImages[index].image } : {}),
        active: item.active !== false,
      })
    );

    await client
      .patch("homepageSettings")
      .set({ heroSlides })
      .unset(["heroContent", "heroBackgroundImages"]) // Remove old fields
      .commit();

    console.log(`✅ Migrated ${heroSlides.length} slides to heroSlides format.`);
    console.log("✅ Removed old heroContent and heroBackgroundImages fields.\n");
    return;
  }

  // No data at all — populate with defaults
  console.log("📝 No hero content found. Populating with default slides...");
  await client
    .patch("homepageSettings")
    .set({
      heroSlides: defaultHeroSlides,
      heroMode: current.heroMode || "carousel",
    })
    .commit();
  console.log("✅ Populated with default hero slides.\n");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
