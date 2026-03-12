/**
 * Migrate Homepage Settings — Quick Links & Featured YouTube Video
 *
 * Populates the `quickLinksSection` and `featuredYoutubeUrl` fields on the
 * homepageSettings singleton with the current hardcoded data from the codebase.
 *
 * This matches the 3 quick-access cards (For Worshippers, For Visitors,
 * For Community) and the default YouTube video (BckNzo1ufDw).
 *
 * Usage:
 *   npx tsx scripts/migrate-quick-links.ts
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

// Current hardcoded quick link cards from QuickAccessSection.tsx
const quickLinksSection = {
  enabled: true,
  quickLinkCards: [
    {
      _type: "quickLinkCard",
      _key: "card-worshippers",
      title: "For Worshippers",
      subtitle: "Prayer & Services",
      accentColor: "green",
      links: [
        {
          _type: "quickLink",
          _key: "link-prayer-times",
          label: "Prayer Times",
          linkType: "internal",
          internalPage: "#prayer-times",
        },
        {
          _type: "quickLink",
          _key: "link-jumuah",
          label: "Friday Jumu'ah",
          linkType: "internal",
          internalPage: "/services",
        },
        {
          _type: "quickLink",
          _key: "link-services",
          label: "Religious Services",
          linkType: "internal",
          internalPage: "/services",
        },
      ],
      active: true,
    },
    {
      _type: "quickLinkCard",
      _key: "card-visitors",
      title: "For Visitors",
      subtitle: "Explore Our Centre",
      accentColor: "sky",
      links: [
        {
          _type: "quickLink",
          _key: "link-visit",
          label: "Plan Your Visit",
          linkType: "internal",
          internalPage: "/visit",
        },
        {
          _type: "quickLink",
          _key: "link-architecture",
          label: "Architecture",
          linkType: "internal",
          internalPage: "/architecture",
        },
        {
          _type: "quickLink",
          _key: "link-events",
          label: "Events Calendar",
          linkType: "internal",
          internalPage: "/events",
        },
      ],
      active: true,
    },
    {
      _type: "quickLinkCard",
      _key: "card-community",
      title: "For Community",
      subtitle: "Programs & Education",
      accentColor: "lime",
      links: [
        {
          _type: "quickLink",
          _key: "link-iqra",
          label: "IQRA Academy",
          linkType: "internal",
          internalPage: "/events",
        },
        {
          _type: "quickLink",
          _key: "link-college",
          label: "AIC College",
          linkType: "external",
          url: "https://aicc.vic.edu.au/",
        },
        {
          _type: "quickLink",
          _key: "link-youth",
          label: "Youth Programs",
          linkType: "internal",
          internalPage: "/events",
        },
      ],
      active: true,
    },
  ],
  bottomCtaText: "Can\u2019t find what you\u2019re looking for?",
};

// Current hardcoded YouTube video ID from MediaHighlightSection.tsx
const featuredYoutubeUrl = "https://www.youtube.com/watch?v=BckNzo1ufDw";

async function migrate() {
  console.log(
    "🔄 Populating quick links & featured YouTube video in homepageSettings...\n"
  );

  // Fetch current document
  const current = await client.fetch(
    `*[_id == "homepageSettings"][0] {
      _id, _type,
      quickLinksSection,
      featuredYoutubeUrl
    }`
  );

  if (!current) {
    // No document — create with the data
    console.log(
      "📝 No homepageSettings document found. Creating with quick links & YouTube data..."
    );
    await client.createOrReplace({
      _id: "homepageSettings",
      _type: "homepageSettings",
      quickLinksSection,
      featuredYoutubeUrl,
    });
    console.log("✅ Created homepageSettings with quick links & YouTube URL.\n");
    return;
  }

  const updates: Record<string, unknown> = {};

  // Check quickLinksSection
  if (
    current.quickLinksSection?.quickLinkCards &&
    current.quickLinksSection.quickLinkCards.length > 0
  ) {
    console.log(
      `✅ quickLinksSection already has ${current.quickLinksSection.quickLinkCards.length} cards. Skipping.`
    );
  } else {
    console.log("📝 Populating quickLinksSection with current hardcoded data...");
    updates.quickLinksSection = quickLinksSection;
  }

  // Check featuredYoutubeUrl
  if (current.featuredYoutubeUrl) {
    console.log(
      `✅ featuredYoutubeUrl already set: ${current.featuredYoutubeUrl}. Skipping.`
    );
  } else {
    console.log("📝 Setting featuredYoutubeUrl...");
    updates.featuredYoutubeUrl = featuredYoutubeUrl;
  }

  if (Object.keys(updates).length === 0) {
    console.log("\n✅ Nothing to update — all fields already populated.\n");
    return;
  }

  await client.patch("homepageSettings").set(updates).commit();

  console.log("\n✅ Migration complete:");
  if (updates.quickLinksSection) {
    console.log(
      `   - quickLinksSection: ${quickLinksSection.quickLinkCards.length} cards populated`
    );
  }
  if (updates.featuredYoutubeUrl) {
    console.log(`   - featuredYoutubeUrl: ${featuredYoutubeUrl}`);
  }
  console.log();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
