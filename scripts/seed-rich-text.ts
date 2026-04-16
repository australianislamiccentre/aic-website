/**
 * Seed Rich Text Content — Populate all Portable Text fields in Sanity singletons
 *
 * This script seeds the rich text (Portable Text) content that can't be seeded as
 * simple strings. It creates the exact block structures matching the hardcoded
 * fallback content currently shown on the site.
 *
 * Fields seeded:
 *   - homepageSettings.welcomeSection.content (2 paragraphs)
 *   - aboutPageSettings.missionContent (2 paragraphs)
 *   - architecturePageSettings.heroContent (3 paragraphs)
 *   - architecturePageSettings.philosophyContent (2 paragraphs)
 *   - visitPageSettings.faqItems (7 FAQ items with rich text answers)
 *   - privacyPageSettings.content (11 sections with headings, lists, bold text)
 *   - termsPageSettings.content (12 sections with headings, lists)
 *
 * Safe to run multiple times — uses setIfMissing() so existing data is never overwritten.
 *
 * Usage:
 *   npx tsx scripts/seed-rich-text.ts
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

// ── Portable Text helpers ──────────────────────────────────────────────────

let keyCounter = 0;
function key(): string {
  return `k${++keyCounter}`;
}

function paragraph(text: string, style = "normal") {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [] as unknown[],
    children: [{ _type: "span", _key: key(), text, marks: [] as string[] }],
  };
}

function heading2(text: string) {
  return paragraph(text, "h2");
}

function heading3(text: string) {
  return paragraph(text, "h3");
}

function listItem(text: string, level = 1) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet" as const,
    level,
    markDefs: [] as unknown[],
    children: [{ _type: "span", _key: key(), text, marks: [] as string[] }],
  };
}

/** A paragraph with a bold prefix then normal text, e.g. "**FundraiseUp** — processes..." */
function boldPrefixParagraph(boldText: string, normalText: string) {
  const markKey = key();
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet" as const,
    level: 1,
    markDefs: [] as unknown[],
    children: [
      { _type: "span", _key: key(), text: boldText, marks: ["strong"] },
      { _type: "span", _key: key(), text: normalText, marks: [] as string[] },
    ],
  };
}

/** A paragraph containing a link */
function paragraphWithLink(beforeText: string, linkText: string, href: string, afterText = "") {
  const markKey = key();
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [{ _type: "link", _key: markKey, href }],
    children: [
      ...(beforeText ? [{ _type: "span", _key: key(), text: beforeText, marks: [] as string[] }] : []),
      { _type: "span", _key: key(), text: linkText, marks: [markKey] },
      ...(afterText ? [{ _type: "span", _key: key(), text: afterText, marks: [] as string[] }] : []),
    ],
  };
}

// ── Content definitions ────────────────────────────────────────────────────

const homepageWelcomeContent = [
  paragraph("The Australian Islamic Centre stands as one of Melbourne's most significant Islamic institutions. Our award-winning architecture houses a vibrant community dedicated to worship, education, and service."),
  paragraph("From daily prayers to comprehensive educational programs, from community events to social services, we serve as a complete Islamic centre for Muslims of all ages and backgrounds."),
];

const aboutMissionContent = [
  paragraph("The Australian Islamic Centre serves as a beacon of Islamic faith and practice in Melbourne. We bridge Australian and Islamic values, contributing to broader society through education, interfaith dialogue, and community service."),
  paragraph("Our holistic approach combines traditional Islamic scholarship with contemporary understanding — providing comprehensive religious services, education, and programs for Muslims and the broader public."),
];

const architectureHeroContent = [
  paragraph("Designed by Pritzker Prize laureate Glenn Murcutt AO in collaboration with Hakan Elevli, the Australian Islamic Centre in Newport, Melbourne is a globally celebrated architectural landmark."),
  paragraph("Completed in 2016, the centre features 96 coloured lanterns inspired by Islamic geometry that flood the prayer hall with kaleidoscopic light. The building is precisely oriented towards Mecca and employs natural ventilation and passive cooling — a hallmark of Murcutt's environmentally responsive practice."),
  paragraph("The centre won the Victorian Architecture Medal in 2017, the AIA National Award for Public Architecture, and was shortlisted for the Aga Khan Award for Architecture."),
];

const architecturePhilosophyContent = [
  paragraph("Designed by the renowned Glenn Murcutt in collaboration with Hakan Elevli, the Australian Islamic Centre represents a masterful synthesis of Islamic architectural traditions and contemporary Australian design sensibilities."),
  paragraph("The building challenges conventional mosque architecture by reimagining sacred space through the lens of Australian light, landscape, and climate. Every element serves both functional and spiritual purposes."),
];

const visitFaqItems = [
  {
    _key: key(),
    question: "Is the mosque open to non-Muslim visitors?",
    answer: [paragraph("Yes! We welcome visitors of all faiths and backgrounds. We encourage everyone to come and experience our award-winning architecture and learn about our community.")],
  },
  {
    _key: key(),
    question: "What should I wear when visiting?",
    answer: [paragraph("We ask all visitors to dress modestly. For women, a headscarf is appreciated but not required — we have scarves available at the entrance. Please avoid shorts and sleeveless tops.")],
  },
  {
    _key: key(),
    question: "Do I need to remove my shoes?",
    answer: [paragraph("Yes, shoes must be removed before entering the prayer hall. Shoe racks are provided at the entrance. We recommend wearing clean socks.")],
  },
  {
    _key: key(),
    question: "Is there parking available?",
    answer: [paragraph("Yes, free parking is available on-site. The centre is accessible via Blenheim Road, Newport, with ample parking spaces for visitors.")],
  },
  {
    _key: key(),
    question: "How do I get to AIC by public transport?",
    answer: [paragraph("The nearest station is Newport Station on the Werribee line (Metro Trains), followed by a short walk or bus ride. Multiple bus routes also service the Newport area.")],
  },
  {
    _key: key(),
    question: "Can I take photos inside the mosque?",
    answer: [paragraph("Photography of the architecture is welcome outside of prayer times. Please be respectful and avoid photographing worshippers without their permission.")],
  },
  {
    _key: key(),
    question: "What are the prayer times?",
    answer: [paragraph("Prayer times change daily based on the position of the sun. You can find the current prayer times on our homepage or the Worshippers page. The mosque is open for all five daily prayers.")],
  },
];

const privacyContent = [
  heading2("1. Introduction"),
  paragraph('The Australian Islamic Centre ("AIC", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at australianislamiccentre.org.'),

  heading2("2. Information We Collect"),
  heading3("Personal Information"),
  paragraph("We may collect personal information you voluntarily provide when you:"),
  listItem("Submit a contact or enquiry form"),
  listItem("Subscribe to our newsletter"),
  listItem("Register for an event or program"),
  listItem("Make a donation through our platform"),
  paragraph("This information may include your name, email address, phone number, and any message content you choose to provide."),
  heading3("Automatically Collected Information"),
  paragraph("When you visit our website, we may automatically collect certain information about your device and browsing behaviour, including your IP address, browser type, operating system, referring URLs, and pages viewed. This data is collected through cookies and similar technologies."),

  heading2("3. How We Use Your Information"),
  paragraph("We use the information we collect to:"),
  listItem("Respond to your enquiries and requests"),
  listItem("Send newsletter communications you have subscribed to"),
  listItem("Process event registrations and donations"),
  listItem("Improve our website and services"),
  listItem("Analyse website usage patterns and trends"),
  listItem("Comply with legal obligations"),

  heading2("4. Third-Party Services"),
  paragraph("Our website uses the following third-party services:"),
  boldPrefixParagraph("FundraiseUp", " — processes donations on our behalf. When you make a donation, your payment information is handled directly by FundraiseUp in accordance with their privacy policy. We do not store your credit card or banking details."),
  boldPrefixParagraph("Google Analytics", " — helps us understand how visitors interact with our website. Google Analytics uses cookies to collect anonymised usage data."),
  boldPrefixParagraph("Sanity CMS", " — manages our website content. No personal visitor data is shared with Sanity."),
  boldPrefixParagraph("Vercel", " — hosts our website. Vercel may collect standard server logs including IP addresses."),

  heading2("5. Cookies"),
  paragraph("Our website uses cookies to enhance your browsing experience and to analyse site traffic. Cookies are small text files stored on your device. You can control cookie preferences through your browser settings. Disabling cookies may affect some website functionality."),

  heading2("6. Data Security"),
  paragraph("We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security."),

  heading2("7. Data Retention"),
  paragraph("We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Newsletter subscribers can unsubscribe at any time, after which their data will be removed from our mailing list."),

  heading2("8. Your Rights"),
  paragraph("Under the Australian Privacy Act 1988, you have the right to:"),
  listItem("Access the personal information we hold about you"),
  listItem("Request correction of inaccurate information"),
  listItem("Request deletion of your personal information"),
  listItem("Opt out of marketing communications"),

  heading2("9. Children's Privacy"),
  paragraph("Our website is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us so we can promptly remove it."),

  heading2("10. Changes to This Policy"),
  paragraph("We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically."),

  heading2("11. Contact Us"),
  paragraph("If you have questions or concerns about this Privacy Policy or our data practices, please contact us:"),
  paragraph("Australian Islamic Centre"),
  paragraph("23-27 Blenheim Road, Newport VIC 3015"),
  paragraph("Phone: (03) 9391 5724"),
  paragraphWithLink("Email: ", "info@australianislamiccentre.org", "mailto:info@australianislamiccentre.org"),
];

const termsContent = [
  heading2("1. Acceptance of Terms"),
  paragraph("By accessing and using the Australian Islamic Centre website (australianislamiccentre.org), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use our website."),

  heading2("2. Use of the Website"),
  paragraph("You agree to use this website only for lawful purposes and in a manner that:"),
  listItem("Does not infringe the rights of others"),
  listItem("Does not restrict or inhibit anyone else's use of the website"),
  listItem("Does not attempt to gain unauthorised access to any part of the website"),
  listItem("Does not introduce malicious software or harmful code"),
  listItem("Complies with all applicable Australian laws and regulations"),

  heading2("3. Intellectual Property"),
  paragraph("All content on this website, including text, images, logos, graphics, and design elements, is the property of the Australian Islamic Centre or its content suppliers and is protected by Australian and international copyright laws. You may not reproduce, distribute, or create derivative works from this content without our prior written consent."),

  heading2("4. User Submissions"),
  paragraph("When you submit information through our contact forms, event registrations, or newsletter subscriptions, you grant us permission to use that information for the purposes described in our Privacy Policy. You are responsible for ensuring that any information you submit is accurate and does not violate the rights of any third party."),

  heading2("5. Donations"),
  paragraph("Donations made through our website are processed by FundraiseUp, a third-party payment processor. By making a donation, you agree to FundraiseUp's terms and conditions in addition to these terms. All donations are made voluntarily and are generally non-refundable unless required by law. Tax receipts are issued in accordance with Australian Taxation Office requirements."),

  heading2("6. Event Registration"),
  paragraph("Registrations for events and programs are subject to availability. We reserve the right to cancel, reschedule, or modify events at our discretion. In such cases, registered participants will be notified through the contact details provided during registration."),

  heading2("7. Third-Party Links"),
  paragraph("Our website may contain links to third-party websites, including those of our partner organisations. We are not responsible for the content, privacy practices, or terms of use of these external sites. Visiting linked websites is at your own risk."),

  heading2("8. Disclaimer of Warranties"),
  paragraph('This website is provided on an "as is" and "as available" basis. While we strive to keep the information accurate and up to date, we make no warranties or representations about the completeness, accuracy, or reliability of any content on this website. Prayer times, event schedules, and other time-sensitive information should be confirmed directly with the centre.'),

  heading2("9. Limitation of Liability"),
  paragraph("To the fullest extent permitted by Australian law, the Australian Islamic Centre shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use this website."),

  heading2("10. Governing Law"),
  paragraph("These Terms of Use are governed by and construed in accordance with the laws of the State of Victoria, Australia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Victoria."),

  heading2("11. Changes to These Terms"),
  paragraph("We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to this page. Your continued use of the website after any changes constitutes acceptance of the updated terms."),

  heading2("12. Contact Us"),
  paragraph("If you have any questions about these Terms of Use, please contact us:"),
  paragraph("Australian Islamic Centre"),
  paragraph("23-27 Blenheim Road, Newport VIC 3015"),
  paragraph("Phone: (03) 9391 5724"),
  paragraphWithLink("Email: ", "info@australianislamiccentre.org", "mailto:info@australianislamiccentre.org"),
];

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding rich text (Portable Text) content...\n");

  // 1. Homepage — welcomeSection.content
  console.log("📋 homepageSettings → welcomeSection.content");
  await client.createIfNotExists({ _id: "homepageSettings", _type: "homepageSettings" });
  await client.patch("homepageSettings").setIfMissing({ "welcomeSection.content": homepageWelcomeContent }).commit();
  console.log("  ✓ Done\n");

  // 2. About — missionContent
  console.log("📋 aboutPageSettings → missionContent");
  await client.createIfNotExists({ _id: "aboutPageSettings", _type: "aboutPageSettings" });
  await client.patch("aboutPageSettings").setIfMissing({ missionContent: aboutMissionContent }).commit();
  console.log("  ✓ Done\n");

  // 3. Architecture — heroContent + philosophyContent
  console.log("📋 architecturePageSettings → heroContent + philosophyContent");
  await client.createIfNotExists({ _id: "architecturePageSettings", _type: "architecturePageSettings" });
  await client
    .patch("architecturePageSettings")
    .setIfMissing({
      heroContent: architectureHeroContent,
      philosophyContent: architecturePhilosophyContent,
    })
    .commit();
  console.log("  ✓ Done\n");

  // 4. Visit — faqItems
  console.log("📋 visitPageSettings → faqItems");
  await client.createIfNotExists({ _id: "visitPageSettings", _type: "visitPageSettings" });
  await client.patch("visitPageSettings").setIfMissing({ faqItems: visitFaqItems }).commit();
  console.log("  ✓ Done\n");

  // 5. Privacy — content
  console.log("📋 privacyPageSettings → content");
  await client.createIfNotExists({ _id: "privacyPageSettings", _type: "privacyPageSettings" });
  await client.patch("privacyPageSettings").setIfMissing({ content: privacyContent }).commit();
  console.log("  ✓ Done\n");

  // 6. Terms — content
  console.log("📋 termsPageSettings → content");
  await client.createIfNotExists({ _id: "termsPageSettings", _type: "termsPageSettings" });
  await client.patch("termsPageSettings").setIfMissing({ content: termsContent }).commit();
  console.log("  ✓ Done\n");

  console.log("✅ All rich text content seeded successfully!");
  console.log("\n📸 The following IMAGE fields still need manual upload in Sanity Studio:");
  console.log("   - homepageSettings → welcomeSection.image");
  console.log("   - homepageSettings → heroSlides[].image");
  console.log("   - homepageSettings → ctaBanner.backgroundImage (optional)");
  console.log("   - aboutPageSettings → heroImage, missionImage, architectureImages");
  console.log("   - architecturePageSettings → heroImage, philosophyImages, galleryImages");
  console.log("   - visitPageSettings → visitingInfoImage, facilitiesImage");
  console.log("   - servicesPageSettings → heroImage");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
