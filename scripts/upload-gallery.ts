/**
 * Bulk upload images to the Media Page Gallery in Sanity.
 *
 * Usage:
 *   npx tsx scripts/upload-gallery.ts /path/to/folder-of-images
 *
 * Uploads all .jpg, .jpeg, .png, .webp files from the given folder
 * and appends them to the mediaGallery singleton document.
 */
import { createClient } from "@sanity/client";
import { readFileSync, readdirSync } from "fs";
import { join, extname } from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

async function uploadGalleryImages(folderPath: string) {
  const files = readdirSync(folderPath).filter((f) =>
    SUPPORTED_EXTENSIONS.includes(extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.error("No image files found in:", folderPath);
    process.exit(1);
  }

  console.log(`Found ${files.length} images. Uploading...`);

  const imageItems = [];

  for (const file of files) {
    const filePath = join(folderPath, file);
    const buffer = readFileSync(filePath);

    try {
      const asset = await client.assets.upload("image", buffer, {
        filename: file,
      });
      console.log(`  ✓ ${file}`);

      imageItems.push({
        _type: "image",
        _key: asset._id.replace("image-", "").slice(0, 12),
        asset: { _type: "reference", _ref: asset._id },
      });
    } catch (err) {
      console.error(`  ✗ ${file}:`, (err as Error).message);
    }
  }

  if (imageItems.length === 0) {
    console.error("No images uploaded successfully.");
    process.exit(1);
  }

  // Ensure the document exists
  await client.createIfNotExists({
    _id: "mediaGallery",
    _type: "mediaGallery",
    images: [],
  });

  // Append all images at once
  await client
    .patch("mediaGallery")
    .setIfMissing({ images: [] })
    .append("images", imageItems)
    .commit();

  console.log(
    `\nDone! ${imageItems.length} images added to Media Page Gallery.`
  );
  console.log("Go to /studio to publish the changes.");
}

const folderPath = process.argv[2];
if (!folderPath) {
  console.error("Usage: npx tsx scripts/upload-gallery.ts /path/to/images");
  process.exit(1);
}

uploadGalleryImages(folderPath);
