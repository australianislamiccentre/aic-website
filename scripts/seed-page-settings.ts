/**
 * Seed Page Settings — Populate ALL page settings singletons with current frontend defaults
 *
 * Seeds every field that appears on the live site into its corresponding Sanity singleton,
 * so that Sanity Studio shows the exact same content the frontend currently renders.
 *
 * Seeds the following singletons:
 *   - homepageSettings  (welcomeSection + ctaBanner)
 *   - visitPageSettings
 *   - worshippersPageSettings
 *   - imamsPageSettings
 *   - partnersPageSettings
 *   - servicesPageSettings
 *   - aboutPageSettings
 *   - contactPageSettings
 *   - announcementsPageSettings
 *   - eventsPageSettings
 *   - mediaPageSettings
 *   - resourcesPageSettings
 *   - architecturePageSettings
 *   - termsPageSettings
 *   - privacyPageSettings
 *
 * Safe to run multiple times — uses setIfMissing() so existing data is never overwritten.
 *
 * Usage:
 *   npx tsx scripts/seed-page-settings.ts
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

let seeded = 0;

async function seedSingleton(
  id: string,
  fields: Record<string, unknown>,
  label: string
): Promise<void> {
  console.log(`📋 Seeding ${label}...`);
  await client.createIfNotExists({ _id: id, _type: id });
  await client.patch(id).setIfMissing(fields).commit();
  console.log(`  ✓ ${label} seeded\n`);
  seeded++;
}

async function main() {
  console.log("🌱 Seeding ALL page settings singletons...\n");

  // ── 1. homepageSettings — welcomeSection ──────────────────────────────────

  console.log("📋 Seeding homepageSettings (welcomeSection)...");
  await client.createIfNotExists({ _id: "homepageSettings", _type: "homepageSettings" });
  await client
    .patch("homepageSettings")
    .setIfMissing({
      "welcomeSection.title": "A Beacon of Faith,",
      "welcomeSection.subtitle": "About Our Centre",
      "welcomeSection.stats": [
        { _key: "stat-0", value: "5", label: "Daily Prayers" },
        { _key: "stat-1", value: "40+", label: "Years Serving" },
        { _key: "stat-2", value: "Global", label: "Recognition" },
        { _key: "stat-3", value: "20+", label: "Weekly Programs" },
      ],
    })
    .commit();
  console.log("  ✓ homepageSettings (welcomeSection) seeded\n");
  seeded++;

  // ── 2. homepageSettings — ctaBanner ───────────────────────────────────────

  console.log("📋 Seeding homepageSettings (ctaBanner)...");
  await client
    .patch("homepageSettings")
    .setIfMissing({
      "ctaBanner.enabled": false,
      "ctaBanner.title": "Support Our Community",
      "ctaBanner.subtitle": "Your generous contributions help us serve the community",
      "ctaBanner.buttonLabel": "Donate Now",
      "ctaBanner.buttonUrl": "/donate",
    })
    .commit();
  console.log("  ✓ homepageSettings (ctaBanner) seeded\n");
  seeded++;

  // ── 3. visitPageSettings ──────────────────────────────────────────────────

  await seedSingleton(
    "visitPageSettings",
    {
      // Hero
      heroHeading: "Visit",
      heroHeadingAccent: "Us",
      heroDescription:
        "Plan your visit to the Australian Islamic Centre. We welcome visitors of all faiths to experience our beautiful award-winning architecture.",

      // Visiting Information section
      visitingInfoVisible: true,
      visitingInfoHeading: "Visiting Information",
      visitingHours: "4:30 AM – 10:30 PM Daily",

      // Facilities section
      facilitiesVisible: true,
      facilitiesHeading: "Our Facilities",
      facilitiesDescription:
        "Our centre features modern facilities designed to serve the diverse needs of our community and visitors.",
      facilitiesCards: [
        { _key: "fac-0", name: "Main Prayer Hall", capacity: "1,000+", icon: "Users" },
        { _key: "fac-1", name: "Women's Prayer Area", capacity: "500+", icon: "Users" },
        { _key: "fac-2", name: "Education Centre", capacity: "200", icon: "GraduationCap" },
        { _key: "fac-3", name: "Community Hall", capacity: "300", icon: "Building" },
        { _key: "fac-4", name: "Youth Centre", capacity: "100", icon: "Dumbbell" },
        { _key: "fac-5", name: "Library", capacity: "30", icon: "BookOpen" },
      ],

      // Mosque Manners section
      mannersVisible: true,
      mannersBadge: "Visitor Guidelines",
      mannersHeading: "Mosque Manners",
      mannersDescription:
        "We welcome visitors of all faiths. Please observe these guidelines during your visit.",
      etiquetteItems: [
        {
          _key: "etq-0",
          title: "Remove Shoes",
          description:
            "Please remove your shoes before entering the prayer areas. Shoe racks are provided at all entrances.",
          icon: "FootprintsIcon",
        },
        {
          _key: "etq-1",
          title: "Dress Modestly",
          description:
            "Wear clothing that covers shoulders and knees. Headscarves are available for women visitors.",
          icon: "ShirtIcon",
        },
        {
          _key: "etq-2",
          title: "Maintain Silence",
          description:
            "Keep voices low, especially during prayer times. Mobile phones should be on silent mode.",
          icon: "VolumeX",
        },
        {
          _key: "etq-3",
          title: "Respect Prayer",
          description:
            "Do not walk in front of those praying. Wait until prayers conclude before moving through the hall.",
          icon: "Heart",
        },
        {
          _key: "etq-4",
          title: "Wudu Facilities",
          description:
            "Ablution (wudu) facilities are available for those wishing to pray. Separate facilities for men and women.",
          icon: "Droplets",
        },
        {
          _key: "etq-5",
          title: "Ask Questions",
          description:
            "Feel free to ask questions respectfully. Our community members are happy to help and share information.",
          icon: "HelpCircle",
        },
      ],

      // FAQ section
      faqVisible: true,
      faqBadge: "FAQs",
      faqHeading: "Frequently Asked Questions",
      faqItems: [
        {
          _key: "faq-0",
          question: "Is the mosque open to non-Muslim visitors?",
          answer:
            "Yes, we welcome visitors of all faiths and backgrounds. We encourage you to visit and learn about our centre, architecture, and community.",
        },
        {
          _key: "faq-1",
          question: "What should I wear when visiting?",
          answer:
            "We ask all visitors to dress modestly. This means clothing that covers shoulders and knees. Women are welcome to wear a headscarf — we have some available at the entrance if needed.",
        },
        {
          _key: "faq-2",
          question: "Do I need to remove my shoes?",
          answer:
            "Yes, shoes must be removed before entering the prayer halls. Shoe racks are provided at all entrances. You may want to wear socks for comfort.",
        },
        {
          _key: "faq-3",
          question: "Is there parking available?",
          answer:
            "Yes, free parking is available on-site with dedicated spaces for visitors. Additional street parking is also available nearby.",
        },
        {
          _key: "faq-4",
          question: "How do I get to AIC by public transport?",
          answer:
            "The nearest station is Newport Station on the Werribee line, approximately a 10-minute walk from the centre. Bus routes also service the area.",
        },
        {
          _key: "faq-5",
          question: "Can I take photos inside the mosque?",
          answer:
            "Photography of the architecture is welcome in public areas. However, please be respectful and avoid photographing worshippers during prayer times without permission.",
        },
        {
          _key: "faq-6",
          question: "What are the prayer times?",
          answer:
            "Prayer times change daily based on the position of the sun. You can find the current prayer times on our Worshippers page or by contacting us directly.",
        },
      ],

      // CTA section
      ctaVisible: true,
      ctaHeading: "We Look Forward to Welcoming You",
      ctaDescription:
        "Whether you're joining us for prayer, exploring our architecture, or simply curious about Islam, you're always welcome at the Australian Islamic Centre.",
      ctaButtons: [
        { _key: "cta-0", label: "Book a Visit", url: "/contact", variant: "primary" },
        { _key: "cta-1", label: "Prayer Times", url: "/worshippers", variant: "secondary" },
      ],
    },
    "visitPageSettings"
  );

  // ── 4. worshippersPageSettings ────────────────────────────────────────────

  await seedSingleton(
    "worshippersPageSettings",
    {
      // Hero
      heroBadge: "Prayer Times & Guidance",
      heroHeading: "For",
      heroHeadingAccent: "Worshippers",
      heroDescription:
        "Join our congregation for daily prayers, Friday Jumu'ah, and spiritual programs at the Australian Islamic Centre.",

      // Etiquette section
      etiquetteVisible: true,
      etiquetteHeading: "Mosque Etiquette",
      etiquetteDescription: "Please observe these guidelines for a peaceful environment.",
      etiquetteItems: [
        {
          _key: "etq-0",
          title: "Remove Shoes",
          description:
            "Please remove your shoes before entering the prayer areas. Shoe racks are provided.",
          icon: "FootprintsIcon",
        },
        {
          _key: "etq-1",
          title: "Dress Modestly",
          description:
            "Wear clothing that covers shoulders and knees. Headscarves available for women.",
          icon: "ShirtIcon",
        },
        {
          _key: "etq-2",
          title: "Maintain Silence",
          description:
            "Keep voices low, especially during prayer times. Phones should be on silent.",
          icon: "VolumeX",
        },
        {
          _key: "etq-3",
          title: "Respect Prayer",
          description:
            "Do not walk in front of those praying. Wait until prayers conclude before moving.",
          icon: "Heart",
        },
        {
          _key: "etq-4",
          title: "Wudu Facilities",
          description:
            "Ablution (wudu) facilities are available for those wishing to pray.",
          icon: "Droplets",
        },
        {
          _key: "etq-5",
          title: "Ask Questions",
          description:
            "Feel free to ask questions respectfully. Our community is happy to help.",
          icon: "HelpCircle",
        },
      ],

      // Khutbah section
      khutbahVisible: true,
      khutbahHeading: "Islamic Talks",

      // CTA section
      ctaVisible: true,
      ctaHeading: "Visit Us Today",
      ctaDescription:
        "Experience the warmth of our community. Join us for daily prayers, Friday Jumu'ah, or any of our programs.",
      ctaButtonLabel: "Get Directions",
      ctaButtonUrl: "https://maps.app.goo.gl/DZUnHYjsaBvREAmw9",
    },
    "worshippersPageSettings"
  );

  // ── 5. imamsPageSettings ──────────────────────────────────────────────────

  await seedSingleton(
    "imamsPageSettings",
    {
      // Hero
      heroHeading: "Our",
      heroHeadingAccent: "Imams",
      heroDescription:
        "Meet the spiritual leaders who guide our community in faith, provide Islamic education, and serve as a source of knowledge and wisdom.",

      // Imams list section
      imamsSectionHeading: "Meet Our Religious Leaders",
      imamsSectionDescription:
        "Our Imams bring years of Islamic scholarship and community service, dedicated to nurturing faith and providing guidance to our community.",

      // Services offered
      servicesOfferedVisible: true,
      servicesOfferedHeading: "Services Offered by Our Imams",
      servicesOfferedCards: [
        {
          _key: "svc-0",
          title: "Religious Counselling",
          description: "Guidance on Islamic matters and spiritual well-being",
          icon: "Heart",
        },
        {
          _key: "svc-1",
          title: "Marriage Services",
          description: "Nikah ceremonies and pre-marriage counselling",
          icon: "Users",
        },
        {
          _key: "svc-2",
          title: "Funeral Services",
          description: "Janazah prayers and support for families",
          icon: "Landmark",
        },
        {
          _key: "svc-3",
          title: "Islamic Education",
          description: "Quran classes and religious instruction",
          icon: "BookOpen",
        },
        {
          _key: "svc-4",
          title: "Friday Sermons",
          description: "Weekly Jumu'ah khutbahs",
          icon: "Mic",
        },
        {
          _key: "svc-5",
          title: "Community Programs",
          description: "Ramadan, Eid, and spiritual events",
          icon: "Globe",
        },
      ],

      // CTA section
      ctaVisible: true,
      ctaHeading: "Need Spiritual Guidance?",
      ctaDescription:
        "Our Imams are here to help. Whether you have questions about Islam, need counselling, or require assistance with religious services, don't hesitate to reach out.",
      ctaButtons: [
        { _key: "cta-0", label: "Contact Us", url: "/contact", variant: "primary" },
        { _key: "cta-1", label: "View All Services", url: "/services", variant: "secondary" },
      ],
    },
    "imamsPageSettings"
  );

  // ── 6. partnersPageSettings ───────────────────────────────────────────────

  await seedSingleton(
    "partnersPageSettings",
    {
      // Hero
      heroBadge: "Our Network",
      heroHeading: "Affiliated",
      heroHeadingAccent: "Partners",
      heroDescription:
        "The Australian Islamic Centre works alongside these affiliated organisations to serve our community through education, sports, and social development.",

      // CTA section
      ctaVisible: true,
      ctaHeading: "Partner With",
      ctaHeadingAccent: "Us",
      ctaDescription:
        "Interested in partnering with the Australian Islamic Centre? We welcome organisations that share our commitment to community development, education, and social impact.",
      ctaButtonLabel: "Get in Touch",
      ctaButtonUrl: "/contact",
    },
    "partnersPageSettings"
  );

  // ── 7. servicesPageSettings ───────────────────────────────────────────────

  await seedSingleton(
    "servicesPageSettings",
    {
      // Hero
      heroBadge: "Community Support",
      heroHeading: "Our",
      heroHeadingAccent: "Services",
      heroDescription:
        "From spiritual guidance to practical support, we offer comprehensive services to meet the diverse needs of our community.",
      heroCategoryTags: ["Religious Services", "Counselling", "Family Support"],

      // CTA section
      ctaVisible: true,
      ctaHeading: "Need Help Finding the Right Service?",
      ctaDescription:
        "Our team is here to help you find the support and services you need. Reach out to us and we'll guide you.",
      ctaButtonLabel: "Contact Us",
      ctaButtonUrl: "/contact",
    },
    "servicesPageSettings"
  );

  // ── 8. aboutPageSettings ──────────────────────────────────────────────────

  await seedSingleton(
    "aboutPageSettings",
    {
      // Hero
      heroBadge: "Welcome to AIC",
      heroHeading: "About the",
      heroHeadingAccent: "Australian Islamic Centre",
      heroDescription:
        "A vibrant community hub in Melbourne's west, serving Muslims and welcoming visitors from around the world to our award-winning architectural landmark.",
      heroStats: [
        { _key: "hero-stat-0", value: "40+", label: "Years Serving" },
        { _key: "hero-stat-1", value: "1000+", label: "Weekly Worshippers" },
        { _key: "hero-stat-2", value: "3", label: "Int'l Awards" },
      ],

      // Mission & Vision section
      missionVisible: true,
      missionBadge: "Our Mission & Vision",
      missionHeading: "Serving the Community",
      missionButtonLabel: "Visit Our Centre",
      missionButtonUrl: "/visit",

      // Timeline section
      timelineVisible: true,
      timelineHeading: "A Legacy of Service",
      timelineItems: [
        {
          _key: "tl-0",
          year: "1970s",
          title: "Newport Islamic Society Founded",
          description:
            "The Newport Islamic Society (NIS) was established to serve the local Muslim community in Newport, Melbourne.",
          icon: "Flag",
        },
        {
          _key: "tl-1",
          year: "2000s",
          title: "Community Growth",
          description:
            "As the community grew, plans began for a purpose-built Islamic centre that would serve future generations.",
          icon: "Users",
        },
        {
          _key: "tl-2",
          year: "2010",
          title: "Vision Takes Shape",
          description:
            "Renowned architect Glenn Murcutt was commissioned to design a unique Islamic centre blending Australian and Islamic aesthetics.",
          icon: "Lightbulb",
        },
        {
          _key: "tl-3",
          year: "2013",
          title: "IQRA Academy Established",
          description:
            "IQRA Academy weekend school was established to provide Quranic education to local children.",
          icon: "BookOpen",
        },
        {
          _key: "tl-4",
          year: "2016",
          title: "Centre Completion",
          description:
            "The Australian Islamic Centre opened its doors, quickly becoming a global architectural landmark.",
          icon: "Building",
        },
        {
          _key: "tl-5",
          year: "Present",
          title: "Serving the Community",
          description:
            "Today, AIC serves 1000+ weekly worshippers with comprehensive religious, educational, and community services.",
          icon: "Heart",
        },
      ],

      // Architecture Preview section
      architecturePreviewVisible: true,
      architectureHeading: "An Architectural Masterpiece",
      architectureDescription:
        "Designed by Pritzker Prize-winning architect Glenn Murcutt in collaboration with Hakan Elevli, the Australian Islamic Centre is a globally recognized landmark.",
      architectureFeatures: [
        {
          _key: "arch-feat-0",
          title: "96 Lanterns",
          description:
            "Colorful skylights that flood the prayer hall with natural light, creating a spiritual atmosphere.",
          icon: "Sun",
        },
        {
          _key: "arch-feat-1",
          title: "Qibla Orientation",
          description:
            "Precisely aligned towards the Kaaba in Mecca, with the qibla wall featuring intricate calligraphy.",
          icon: "Compass",
        },
        {
          _key: "arch-feat-2",
          title: "Sustainable Design",
          description:
            "Natural ventilation and passive cooling systems that minimize environmental impact.",
          icon: "Leaf",
        },
      ],
      architectureButtonLabel: "Explore Full Architecture Story",
      architectureButtonUrl: "/architecture",

      // Values section
      valuesVisible: true,
      valuesHeading: "What We Stand For",
      valuesDescription:
        "Our values guide everything we do at the Australian Islamic Centre",
      valuesCards: [
        {
          _key: "val-0",
          title: "Compassion",
          description:
            "We serve with love and mercy, following the example of Prophet Muhammad (PBUH).",
          icon: "Heart",
        },
        {
          _key: "val-1",
          title: "Knowledge",
          description:
            "We believe in the transformative power of Islamic education for all ages.",
          icon: "BookOpen",
        },
        {
          _key: "val-2",
          title: "Community",
          description:
            "We integrate Australian values with the beauty of Islam, building bridges of understanding.",
          icon: "Users",
        },
        {
          _key: "val-3",
          title: "Excellence",
          description:
            "We strive for the highest standards in everything we do.",
          icon: "Star",
        },
      ],
      valuesButtons: [
        { _key: "val-btn-0", label: "Plan Your Visit", url: "/visit", variant: "primary" },
        { _key: "val-btn-1", label: "Get In Touch", url: "/contact", variant: "outline" },
      ],
    },
    "aboutPageSettings"
  );

  // ── 9. contactPageSettings ────────────────────────────────────────────────

  await seedSingleton(
    "contactPageSettings",
    {
      heroHeading: "Get in",
      heroHeadingAccent: "Touch",
      heroDescription:
        "We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.",
      sidebarVisible: true,
      operatingHours: "4:30 AM – 10:30 PM Daily",
    },
    "contactPageSettings"
  );

  // ── 10. announcementsPageSettings ─────────────────────────────────────────

  await seedSingleton(
    "announcementsPageSettings",
    {
      heroBadge: "Stay Informed",
      heroHeading: "News &",
      heroHeadingAccent: "Announcements",
      heroDescription:
        "Stay informed with the latest news, updates, and important notices from the Australian Islamic Centre. From community updates to prayer time changes.",
    },
    "announcementsPageSettings"
  );

  // ── 11. eventsPageSettings ────────────────────────────────────────────────

  await seedSingleton(
    "eventsPageSettings",
    {
      heroBadge: "Community Gatherings",
      heroHeading: "Events &",
      heroHeadingAccent: "Programs",
      heroDescription:
        "Discover upcoming events, weekly programs, and community gatherings at the Australian Islamic Centre. From spiritual enrichment to sports and education.",
    },
    "eventsPageSettings"
  );

  // ── 12. mediaPageSettings ─────────────────────────────────────────────────

  await seedSingleton(
    "mediaPageSettings",
    {
      heroHeading: "Media",
      heroHeadingAccent: "Gallery",
      heroDescription:
        "Explore photos and videos from the Australian Islamic Centre community.",
      youtubeVisible: true,
      galleryVisible: true,
      socialVisible: true,
    },
    "mediaPageSettings"
  );

  // ── 13. resourcesPageSettings ─────────────────────────────────────────────

  await seedSingleton(
    "resourcesPageSettings",
    {
      heroBadge: "Resource Library",
      heroHeading: "Community",
      heroHeadingAccent: "Resources",
      heroDescription:
        "Browse our collection of Islamic literature, audio lectures, video content, and educational materials. Download or access resources to support your learning journey.",
    },
    "resourcesPageSettings"
  );

  // ── 14. architecturePageSettings ──────────────────────────────────────────

  await seedSingleton(
    "architecturePageSettings",
    {
      // Hero
      heroBadge: "Award-Winning Design",
      heroHeading: "Our",
      heroHeadingAccent: "Architecture",
      heroImageBadge: "World Architecture Festival Winner 2017",

      // Design Philosophy section
      philosophyVisible: true,
      philosophyBadge: "Design Philosophy",

      // Architectural Features section
      featuresVisible: true,
      featuresHeading: "Architectural Features",
      featuresCards: [
        {
          _key: "arch-0",
          title: "Natural Light Design",
          description:
            "Strategic skylight placement floods the prayer hall with natural light, creating an atmosphere of spiritual tranquility.",
          icon: "Sun",
        },
        {
          _key: "arch-1",
          title: "Qibla Orientation",
          description:
            "The entire building is precisely aligned towards the Kaaba in Mecca, ensuring accurate prayer direction.",
          icon: "Compass",
        },
        {
          _key: "arch-2",
          title: "Sustainable Design",
          description:
            "Natural ventilation systems and energy-efficient features minimize environmental impact.",
          icon: "Leaf",
        },
        {
          _key: "arch-3",
          title: "Water Features",
          description:
            "Reflective pools and fountains create a sense of peace and echo traditional Islamic garden design.",
          icon: "Droplets",
        },
        {
          _key: "arch-4",
          title: "Contemporary Geometry",
          description:
            "Modern interpretation of traditional Islamic geometric patterns throughout the structure.",
          icon: "Hexagon",
        },
      ],

      // Gallery section
      galleryVisible: true,
      galleryHeading: "Gallery",
      galleryDescription: "Experience the beauty of our architectural masterpiece.",

      // Awards section
      awardsVisible: true,
      awardsBadge: "Recognition",
      awardsHeading: "Awards & Accolades",
      awardsCards: [
        {
          _key: "award-0",
          year: "2017",
          title: "Australian Institute of Architects Award",
          organization: "AIA",
          category: "Public Architecture",
        },
        {
          _key: "award-1",
          year: "2017",
          title: "World Architecture Festival Award",
          organization: "WAF",
          category: "Religious Building of the Year",
        },
        {
          _key: "award-2",
          year: "2018",
          title: "Aga Khan Award for Architecture",
          organization: "Aga Khan Foundation",
          category: "Shortlisted",
        },
      ],

      // Quote section
      quoteVisible: true,
      quoteText:
        "The challenge was to create a building that speaks to both Islamic tradition and Australian identity - a place where faith, light, and landscape converge.",
      quoteAttribution: "Glenn Murcutt AO, Pritzker Prize Laureate, Lead Architect",

      // CTA section
      ctaVisible: true,
      ctaHeading: "Experience It In Person",
      ctaDescription:
        "Photos can only capture so much. Visit the Australian Islamic Centre to truly experience this architectural masterpiece.",
      ctaButtonLabel: "Plan Your Visit",
      ctaButtonUrl: "/visit",
    },
    "architecturePageSettings"
  );

  // ── 15. termsPageSettings ─────────────────────────────────────────────────

  await seedSingleton(
    "termsPageSettings",
    {
      heading: "Terms of Use",
      lastUpdated: "2026-03-01",
    },
    "termsPageSettings"
  );

  // ── 16. privacyPageSettings ───────────────────────────────────────────────

  await seedSingleton(
    "privacyPageSettings",
    {
      heading: "Privacy Policy",
      lastUpdated: "2026-03-01",
    },
    "privacyPageSettings"
  );

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log("─".repeat(50));
  console.log(`✅ Seed complete — ${seeded} singletons seeded.`);
  console.log(
    "   Run again at any time — setIfMissing() ensures existing data is never overwritten."
  );
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
