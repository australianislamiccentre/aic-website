/**
 * Seed Images — Upload local images to Sanity and wire them into page settings
 *
 * Uploads images from public/images/ to Sanity's asset pipeline, then patches
 * the corresponding singleton fields with image references.
 *
 * Safe to run multiple times — uses setIfMissing() so existing images are never overwritten.
 *
 * Usage:
 *   npx tsx scripts/seed-images.ts
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const IMAGES_DIR = path.resolve(__dirname, "../public/images");

// Cache uploaded assets so we don't upload the same file twice
const uploadCache: Record<string, string> = {};

async function uploadImage(filename: string): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } }> {
  if (uploadCache[filename]) {
    console.log(`    ↩ ${filename} (cached)`);
    return {
      _type: "image",
      asset: { _type: "reference", _ref: uploadCache[filename] },
    };
  }

  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Image not found: ${filePath}`);
  }

  const ext = path.extname(filename).replace(".", "");
  const contentType =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "svg"
            ? "image/svg+xml"
            : "image/jpeg";

  console.log(`    ⬆ Uploading ${filename}...`);
  const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
    filename,
    contentType,
  });

  uploadCache[filename] = asset._id;
  console.log(`    ✓ ${filename} → ${asset._id}`);

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

async function main() {
  console.log("🖼️  Seeding images into Sanity...\n");

  // ── 1. homepageSettings ──────────────────────────────────────────────────

  console.log("📋 homepageSettings");

  // welcomeSection.image — aerial drone shot with crescent moon
  const welcomeImage = await uploadImage("aic 9.jpeg");
  await client.createIfNotExists({ _id: "homepageSettings", _type: "homepageSettings" });
  await client
    .patch("homepageSettings")
    .setIfMissing({ "welcomeSection.image": welcomeImage })
    .commit();
  console.log("  ✓ welcomeSection.image\n");

  // heroSlides — the default hero carousel images
  // Check if heroSlides already has data
  const homepageDoc = await client.fetch(`*[_id == "homepageSettings"][0]{ heroSlides }`);
  if (!homepageDoc?.heroSlides || homepageDoc.heroSlides.length === 0) {
    const slide1Image = await uploadImage("aic start.jpg");
    const slide2Image = await uploadImage("aic 1.jpg");
    const slide3Image = await uploadImage("aic end.jpg");

    const heroSlides = [
      {
        _key: "slide1",
        title: "Welcome to the",
        highlight: "Australian Islamic Centre",
        subtitle: "A beacon of faith, knowledge, and community in Melbourne's west",
        image: slide1Image,
        active: true,
        primaryButton: { label: "Explore Our Centre", url: "/about" },
        secondaryButton: { label: "Visit Us", url: "/visit" },
      },
      {
        _key: "slide2",
        title: "Award-Winning",
        highlight: "Architecture",
        subtitle: "Designed by Pritzker Prize laureate Glenn Murcutt AO",
        image: slide2Image,
        active: true,
        primaryButton: { label: "Discover the Design", url: "/architecture" },
        secondaryButton: { label: "View Gallery", url: "/media" },
      },
      {
        _key: "slide3",
        title: "Join Our",
        highlight: "Community",
        subtitle: "Daily prayers, educational programs, and community events",
        image: slide3Image,
        active: true,
        primaryButton: { label: "Our Programs", url: "/services" },
        secondaryButton: { label: "Upcoming Events", url: "/events" },
      },
    ];

    await client.patch("homepageSettings").setIfMissing({ heroSlides }).commit();
    console.log("  ✓ heroSlides (3 slides)\n");
  } else {
    console.log("  ↩ heroSlides already populated\n");
  }

  // ── 2. aboutPageSettings ─────────────────────────────────────────────────

  console.log("📋 aboutPageSettings");
  await client.createIfNotExists({ _id: "aboutPageSettings", _type: "aboutPageSettings" });

  // heroImage — exterior courtyard
  const aboutHeroImage = await uploadImage("aic 1.jpg");
  await client.patch("aboutPageSettings").setIfMissing({ heroImage: aboutHeroImage }).commit();
  console.log("  ✓ heroImage\n");

  // missionImage — interior detail of colorful ceiling lights
  const missionImage = await uploadImage("aic 5.jpg");
  await client.patch("aboutPageSettings").setIfMissing({ missionImage }).commit();
  console.log("  ✓ missionImage\n");

  // architectureImages — images for architecture preview on about page
  const archPreview1 = await uploadImage("aic 9.jpeg");
  const archPreview2 = await uploadImage("aic start.jpg");
  const archPreview3 = await uploadImage("aic 2.jpg");
  await client
    .patch("aboutPageSettings")
    .setIfMissing({ architectureImages: [archPreview1, archPreview2, archPreview3] })
    .commit();
  console.log("  ✓ architectureImages (3 images)\n");

  // ── 3. architecturePageSettings ──────────────────────────────────────────

  console.log("📋 architecturePageSettings");
  await client.createIfNotExists({ _id: "architecturePageSettings", _type: "architecturePageSettings" });

  // heroImage — aerial view of golden roof lanterns
  const archHeroImage = await uploadImage("aic 2.jpg");
  await client.patch("architecturePageSettings").setIfMissing({ heroImage: archHeroImage }).commit();
  console.log("  ✓ heroImage\n");

  // philosophyImages — minaret close-up + roof dusk
  const philImg1 = await uploadImage("aic 6.webp");
  const philImg2 = await uploadImage("aic 7.webp");
  await client
    .patch("architecturePageSettings")
    .setIfMissing({ philosophyImages: [philImg1, philImg2] })
    .commit();
  console.log("  ✓ philosophyImages (2 images)\n");

  // galleryImages — array of {image, alt, caption}
  const archDoc = await client.fetch(`*[_id == "architecturePageSettings"][0]{ galleryImages }`);
  if (!archDoc?.galleryImages || archDoc.galleryImages.length === 0) {
    const g1 = await uploadImage("aic start.jpg");
    const g2 = await uploadImage("aic 2.jpg");
    const g3 = await uploadImage("aic 10.webp");
    const g4 = await uploadImage("aic 1.jpg");

    const galleryImages = [
      { _key: "g1", image: g1, alt: "Prayer Hall", caption: "The prayer hall with colourful skylights" },
      { _key: "g2", image: g2, alt: "Roof Lanterns", caption: "Aerial view of the 96 golden roof lanterns" },
      { _key: "g3", image: g3, alt: "Interior at Night", caption: "Interior prayer hall at night with calligraphy" },
      { _key: "g4", image: g4, alt: "Courtyard", caption: "The serene courtyard with water features" },
    ];

    await client.patch("architecturePageSettings").setIfMissing({ galleryImages }).commit();
    console.log("  ✓ galleryImages (4 images)\n");
  } else {
    console.log("  ↩ galleryImages already populated\n");
  }

  // ── 4. visitPageSettings ─────────────────────────────────────────────────

  console.log("📋 visitPageSettings");
  await client.createIfNotExists({ _id: "visitPageSettings", _type: "visitPageSettings" });

  // visitingInfoImage — front view
  const visitInfoImage = await uploadImage("aic end.jpg");
  await client.patch("visitPageSettings").setIfMissing({ visitingInfoImage: visitInfoImage }).commit();
  console.log("  ✓ visitingInfoImage\n");

  // facilitiesImage — front view
  const facilitiesImage = await uploadImage("aic end.jpg");
  await client.patch("visitPageSettings").setIfMissing({ facilitiesImage: facilitiesImage }).commit();
  console.log("  ✓ facilitiesImage\n");

  // ── 5. servicesPageSettings ──────────────────────────────────────────────

  console.log("📋 servicesPageSettings");
  await client.createIfNotExists({ _id: "servicesPageSettings", _type: "servicesPageSettings" });

  const servicesHeroImage = await uploadImage("aic end.jpg");
  await client.patch("servicesPageSettings").setIfMissing({ heroImage: servicesHeroImage }).commit();
  console.log("  ✓ heroImage\n");

  // ── Done ─────────────────────────────────────────────────────────────────

  console.log("✅ All images uploaded and wired successfully!");
  console.log(`   ${Object.keys(uploadCache).length} unique images uploaded to Sanity`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
