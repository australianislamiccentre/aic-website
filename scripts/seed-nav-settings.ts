/**
 * Seed Navigation Settings
 *
 * Pre-populates headerSettings and footerSettings singletons with current
 * hardcoded values. Also updates siteSettings.operatingHours to the new
 * simple string format. Safe to re-run (uses createIfNotExists + setIfMissing).
 *
 * Usage: npx tsx scripts/seed-nav-settings.ts
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
  console.log("Seeding navigation settings...\n");

  // ── Header Settings ──
  await client.createIfNotExists({
    _id: "headerSettings",
    _type: "headerSettings",
  });

  await client
    .patch("headerSettings")
    .setIfMissing({
      announcementBar: {
        enabled: false,
        dismissable: true,
        backgroundColor: "teal",
      },
      topBar: {
        desktopWelcome: "Welcome to the Australian Islamic Centre",
        mobileWelcome: "Welcome to AIC",
        visible: true,
      },
      ctaButton: {
        label: "Donate",
        linkType: "page",
        page: "/donate",
        accentColor: "lime",
      },
      showSearch: true,
      menuDonateCard: {
        heading: "Support Our Community",
        description: "Your generosity helps us serve the community",
        buttonText: "Donate",
        linkType: "page",
        page: "/donate",
        visible: true,
      },
      contactLink: {
        label: "Contact Us",
        linkType: "page",
        page: "/contact",
        visible: true,
      },
      navGroups: [
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
      ],
    })
    .commit();
  console.log("Header settings seeded");

  // ── Footer Settings ──
  await client.createIfNotExists({
    _id: "footerSettings",
    _type: "footerSettings",
  });

  await client
    .patch("footerSettings")
    .setIfMissing({
      newsletter: { visible: true },
      brandDescription:
        "Serving the community through prayer, education, and spiritual growth. A centre welcoming all who seek knowledge and connection.",
      donateCard: {
        heading: "Support Us",
        description: "Support our community programs, services, and the maintenance of our centre.",
        buttonText: "Donate Now",
        linkType: "page",
        page: "/donate",
        visible: true,
      },
      quranVerse: {
        arabicText:
          "\u0645\u064E\u062B\u064E\u0644\u064F \u0627\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u064A\u064F\u0646\u0641\u0650\u0642\u064F\u0648\u0646\u064E \u0623\u064E\u0645\u0648\u064E\u0627\u0644\u064E\u0647\u064F\u0645\u0652 \u0641\u0650\u064A \u0633\u064E\u0628\u0650\u064A\u0644\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0643\u064E\u0645\u064E\u062B\u064E\u0644\u0650 \u062D\u064E\u0628\u0651\u064E\u0629\u064D \u0623\u064E\u0646\u0628\u064E\u062A\u064E\u062A\u0652 \u0633\u064E\u0628\u0652\u0639\u064E \u0633\u064E\u0646\u064E\u0627\u0628\u0650\u0644\u064E",
        reference: "Qur'an 2:261",
        visible: true,
      },
      bottomBarLinks: [
        { _key: "privacy", label: "Privacy Policy", linkType: "page", page: "/privacy" },
        { _key: "terms", label: "Terms of Use", linkType: "page", page: "/terms" },
        { _key: "accessibility", label: "Accessibility", linkType: "custom", customUrl: "/accessibility" },
      ],
      navGroups: [
        {
          _key: "about",
          label: "About",
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
          visible: true,
          links: [
            { _key: "gallery", label: "Media Gallery", linkType: "page", page: "/media", visible: true },
            { _key: "resources", label: "Resources", linkType: "page", page: "/resources", visible: true },
          ],
        },
        {
          _key: "involved",
          label: "Get Involved",
          visible: true,
          links: [
            { _key: "donate", label: "Donate", linkType: "page", page: "/donate", visible: true },
            { _key: "contact", label: "Contact Us", linkType: "page", page: "/contact", visible: true },
            { _key: "volunteer", label: "Volunteer", linkType: "page", page: "/contact", visible: true },
            { _key: "partners", label: "Our Partners", linkType: "page", page: "/partners", visible: true },
          ],
        },
      ],
    })
    .commit();
  console.log("Footer settings seeded");

  // ── Update siteSettings operating hours ──
  await client.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });
  await client
    .patch("siteSettings")
    .setIfMissing({ operatingHours: "Open Daily from Fajr to Isha" })
    .commit();
  console.log("Site settings operating hours updated");

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
