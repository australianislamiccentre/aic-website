/**
 * Seed SEO Fields — Populate all page settings singletons with SEO metadata
 *
 * Seeds the seo.title and seo.description fields for all 14 page settings
 * singletons, using the exact fallback values currently shown on the site.
 *
 * Safe to run multiple times — uses setIfMissing() so existing data is never overwritten.
 *
 * Usage:
 *   npx tsx scripts/seed-seo.ts
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

const seoData: Array<{ id: string; label: string; title: string; description: string }> = [
  {
    id: "aboutPageSettings",
    label: "About",
    title: "About Us | Australian Islamic Centre",
    description: "Learn about the Australian Islamic Centre — a vibrant community hub in Newport, Melbourne.",
  },
  {
    id: "architecturePageSettings",
    label: "Architecture",
    title: "Architecture | Australian Islamic Centre",
    description: "Explore the award-winning architecture of the Australian Islamic Centre, designed by Pritzker Prize laureate Glenn Murcutt AO with Hakan Elevli.",
  },
  {
    id: "visitPageSettings",
    label: "Visit",
    title: "Visit Us | Australian Islamic Centre",
    description: "Plan your visit to the Australian Islamic Centre. Explore our award-winning architecture and learn about our community.",
  },
  {
    id: "worshippersPageSettings",
    label: "Worshippers",
    title: "For Worshippers | Australian Islamic Centre",
    description: "Prayer times, mosque etiquette, Jumu'ah services, and khutbah videos for worshippers at the Australian Islamic Centre.",
  },
  {
    id: "contactPageSettings",
    label: "Contact",
    title: "Contact Us | Australian Islamic Centre",
    description: "Get in touch with the Australian Islamic Centre. Send us a message, call, or visit us at 23-27 Blenheim Road, Newport VIC 3015.",
  },
  {
    id: "eventsPageSettings",
    label: "Events",
    title: "Events | Australian Islamic Centre",
    description: "Join us for spiritual gatherings, educational workshops, and community celebrations at the Australian Islamic Centre.",
  },
  {
    id: "announcementsPageSettings",
    label: "Announcements",
    title: "Announcements | Australian Islamic Centre",
    description: "Stay informed about important updates, community news, and upcoming activities at the Australian Islamic Centre.",
  },
  {
    id: "servicesPageSettings",
    label: "Services",
    title: "Services | Australian Islamic Centre",
    description: "Comprehensive Islamic services including religious guidance, nikah ceremonies, funeral services, and counselling support for our community.",
  },
  {
    id: "imamsPageSettings",
    label: "Imams",
    title: "Our Imams | Australian Islamic Centre",
    description: "Meet the dedicated imams and scholars of the Australian Islamic Centre.",
  },
  {
    id: "resourcesPageSettings",
    label: "Resources",
    title: "Resources | Australian Islamic Centre",
    description: "Browse and download community resources including Islamic literature, audio lectures, video content, and educational materials from the Australian Islamic Centre.",
  },
  {
    id: "mediaPageSettings",
    label: "Media",
    title: "Media Gallery | Australian Islamic Centre",
    description: "Photos and videos from the Australian Islamic Centre community.",
  },
  {
    id: "partnersPageSettings",
    label: "Partners",
    title: "Partners | Australian Islamic Centre",
    description: "Discover the Australian Islamic Centre's affiliated partner organisations working together in education, sports, and community development.",
  },
  {
    id: "privacyPageSettings",
    label: "Privacy",
    title: "Privacy Policy | Australian Islamic Centre",
    description: "Privacy policy for the Australian Islamic Centre website.",
  },
  {
    id: "termsPageSettings",
    label: "Terms",
    title: "Terms of Use | Australian Islamic Centre",
    description: "Terms of use for the Australian Islamic Centre website.",
  },
];

async function main() {
  console.log("🔍 Seeding SEO fields for all 14 page settings...\n");

  for (const page of seoData) {
    console.log(`📋 ${page.label} (${page.id})`);
    await client.createIfNotExists({ _id: page.id, _type: page.id });
    await client
      .patch(page.id)
      .setIfMissing({
        "seo.title": page.title,
        "seo.description": page.description,
      })
      .commit();
    console.log(`  ✓ title: "${page.title}"`);
    console.log(`  ✓ description: "${page.description.slice(0, 60)}..."\n`);
  }

  console.log("✅ All SEO fields seeded successfully!");
  console.log("   Note: seo.image (Open Graph image) can be set per-page in Sanity Studio.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
