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
        url: "/donate",
        accentColor: "lime",
      },
      showSearch: true,
      menuDonateCard: {
        heading: "Support Our Community",
        description: "Your generosity helps us serve the community",
        buttonText: "Donate",
        url: "/donate",
        visible: true,
      },
      contactLink: {
        label: "Contact Us",
        url: "/contact",
        visible: true,
      },
      navGroups: [
        {
          _key: "about",
          label: "About",
          description: "Learn about our centre",
          visible: true,
          links: [
            { _key: "story", label: "Our Story", url: "/about", visible: true },
            { _key: "imams", label: "Our Imams", url: "/imams", visible: true },
            { _key: "partners", label: "Affiliated Partners", url: "/partners", visible: true },
          ],
        },
        {
          _key: "whatson",
          label: "What's On",
          description: "Events, services & programs",
          visible: true,
          links: [
            { _key: "events", label: "Events", url: "/events", visible: true },
            { _key: "services", label: "Services", url: "/services", visible: true },
            { _key: "announcements", label: "Announcements", url: "/announcements", visible: true },
            { _key: "programs", label: "Programs", url: "/events#programs", visible: true },
          ],
        },
        {
          _key: "mosque",
          label: "Our Mosque",
          description: "Prayer, worship & visiting",
          visible: true,
          links: [
            { _key: "worshippers", label: "For Worshippers", url: "/worshippers", visible: true },
            { _key: "visit", label: "Plan Your Visit", url: "/visit", visible: true },
            { _key: "architecture", label: "Architecture", url: "/architecture", visible: true },
          ],
        },
        {
          _key: "media",
          label: "Media & Resources",
          description: "Gallery & downloads",
          visible: true,
          links: [
            { _key: "gallery", label: "Media Gallery", url: "/media", visible: true },
            { _key: "resources", label: "Resources", url: "/resources", visible: true },
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
        url: "/donate",
        visible: true,
      },
      quranVerse: {
        arabicText:
          "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ",
        reference: "Qur'an 2:261",
        visible: true,
      },
      bottomBarLinks: [
        { _key: "privacy", label: "Privacy Policy", url: "/privacy" },
        { _key: "terms", label: "Terms of Use", url: "/terms" },
        { _key: "accessibility", label: "Accessibility", url: "/accessibility" },
      ],
      navGroups: [
        {
          _key: "about",
          label: "About",
          visible: true,
          links: [
            { _key: "story", label: "Our Story", url: "/about", visible: true },
            { _key: "imams", label: "Our Imams", url: "/imams", visible: true },
            { _key: "partners", label: "Affiliated Partners", url: "/partners", visible: true },
          ],
        },
        {
          _key: "whatson",
          label: "What's On",
          visible: true,
          links: [
            { _key: "events", label: "Events", url: "/events", visible: true },
            { _key: "services", label: "Services", url: "/services", visible: true },
            { _key: "announcements", label: "Announcements", url: "/announcements", visible: true },
            { _key: "programs", label: "Programs", url: "/events#programs", visible: true },
          ],
        },
        {
          _key: "mosque",
          label: "Our Mosque",
          visible: true,
          links: [
            { _key: "worshippers", label: "For Worshippers", url: "/worshippers", visible: true },
            { _key: "visit", label: "Plan Your Visit", url: "/visit", visible: true },
            { _key: "architecture", label: "Architecture", url: "/architecture", visible: true },
          ],
        },
        {
          _key: "media",
          label: "Media & Resources",
          visible: true,
          links: [
            { _key: "gallery", label: "Media Gallery", url: "/media", visible: true },
            { _key: "resources", label: "Resources", url: "/resources", visible: true },
          ],
        },
        {
          _key: "involved",
          label: "Get Involved",
          visible: true,
          links: [
            { _key: "donate", label: "Donate", url: "/donate", visible: true },
            { _key: "contact", label: "Contact Us", url: "/contact", visible: true },
            { _key: "volunteer", label: "Volunteer", url: "/contact", visible: true },
            { _key: "partners", label: "Our Partners", url: "/partners", visible: true },
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
