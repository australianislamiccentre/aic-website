/**
 * Sanity Seed Script: Site Settings + Legal Pages + Homepage Welcome
 *
 * Populates existing empty Sanity fields with the content that's currently
 * hardcoded in the codebase. Run this from the project root with:
 *
 *   npx tsx scripts/seed-all-content.ts
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local
 */
import { createClient } from "next-sanity";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

function randomKey(): string {
  return Math.random().toString(36).substring(2, 10);
}

function block(
  text: string,
  style: string = "normal",
  markDefs: Array<{ _key: string; _type: string; href?: string }> = [],
  children?: Array<{ _type: string; _key: string; text: string; marks: string[] }>
): Record<string, unknown> {
  return {
    _type: "block",
    _key: randomKey(),
    style,
    markDefs,
    children: children || [
      { _type: "span", _key: randomKey(), text, marks: [] },
    ],
  };
}

function listItem(text: string): Record<string, unknown> {
  return {
    ...block(text),
    listItem: "bullet",
    level: 1,
  };
}

function boldListItem(boldPart: string, rest: string): Record<string, unknown> {
  return {
    _type: "block",
    _key: randomKey(),
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: randomKey(), text: boldPart, marks: ["strong"] },
      { _type: "span", _key: randomKey(), text: ` — ${rest}`, marks: [] },
    ],
    listItem: "bullet",
    level: 1,
  };
}

function emailBlock(prefix: string, email: string): Record<string, unknown> {
  const linkKey = randomKey();
  return {
    _type: "block",
    _key: randomKey(),
    style: "normal",
    markDefs: [{ _key: linkKey, _type: "link", href: `mailto:${email}` }],
    children: [
      { _type: "span", _key: randomKey(), text: `${prefix}: `, marks: [] },
      { _type: "span", _key: randomKey(), text: email, marks: [linkKey] },
    ],
  };
}

// ─────────────────────────────────────────────────────────
// 1. SITE SETTINGS — populate empty fields
// ─────────────────────────────────────────────────────────
async function seedSiteSettings() {
  console.log("\n📋 Seeding Site Settings...");

  const patch = client.patch("siteSettings").set({
    googleMapsUrl: "https://maps.app.goo.gl/sjUbtLMo1q6AXHi86",
    operatingHours: {
      weekdays: "4:30 AM – 10:30 PM",
      weekends: "4:30 AM – 10:30 PM",
      notes: "Open Daily",
    },
    socialMedia: {
      facebook: "https://www.facebook.com/AustralianIslamicCentre",
      instagram: "https://www.instagram.com/australianislamiccentre",
      youtube: "https://www.youtube.com/@AustralianIslamicCentre",
    },
    externalLinks: {
      college: "https://aicc.vic.edu.au/",
      bookstore: "https://shop.australianislamiccentre.org/",
      sportsClub: "https://www.newportstormfc.com.au/",
    },
  });

  await patch.commit();
  console.log("  ✓ Site Settings updated (operatingHours, googleMapsUrl, socialMedia, externalLinks)");
}

// ─────────────────────────────────────────────────────────
// 2. HOMEPAGE WELCOME SECTION
// ─────────────────────────────────────────────────────────
async function seedWelcomeSection() {
  console.log("\n🏠 Seeding Homepage Welcome Section...");

  const patch = client.patch("homepageSettings").set({
    welcomeSection: {
      title: "A Beacon of Faith,",
      subtitle: "Knowledge & Unity",
      stats: [
        { _key: randomKey(), value: "5", label: "Daily Prayers" },
        { _key: randomKey(), value: "40+", label: "Years Serving" },
        { _key: randomKey(), value: "Global", label: "Recognition" },
        { _key: randomKey(), value: "20+", label: "Weekly Programs" },
      ],
    },
  });

  await patch.commit();
  console.log("  ✓ Homepage welcomeSection updated (title, subtitle, stats)");
}

// ─────────────────────────────────────────────────────────
// 3. LEGAL PAGES (Privacy, Terms, Accessibility)
// ─────────────────────────────────────────────────────────

const privacyContent = [
  block("1. Introduction", "h2"),
  block('The Australian Islamic Centre ("AIC", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at australianislamiccentre.org.'),
  block("2. Information We Collect", "h2"),
  block("Personal Information", "h3"),
  block("We may collect personal information you voluntarily provide when you:"),
  listItem("Submit a contact or enquiry form"),
  listItem("Subscribe to our newsletter"),
  listItem("Register for an event or program"),
  listItem("Make a donation through our platform"),
  block("This information may include your name, email address, phone number, and any message content you choose to provide."),
  block("Automatically Collected Information", "h3"),
  block("When you visit our website, we may automatically collect certain information about your device and browsing behaviour, including your IP address, browser type, operating system, referring URLs, and pages viewed. This data is collected through cookies and similar technologies."),
  block("3. How We Use Your Information", "h2"),
  block("We use the information we collect to:"),
  listItem("Respond to your enquiries and requests"),
  listItem("Send newsletter communications you have subscribed to"),
  listItem("Process event registrations and donations"),
  listItem("Improve our website and services"),
  listItem("Analyse website usage patterns and trends"),
  listItem("Comply with legal obligations"),
  block("4. Third-Party Services", "h2"),
  block("Our website uses the following third-party services:"),
  boldListItem("FundraiseUp", "processes donations on our behalf. When you make a donation, your payment information is handled directly by FundraiseUp in accordance with their privacy policy. We do not store your credit card or banking details."),
  boldListItem("Google Analytics", "helps us understand how visitors interact with our website. Google Analytics uses cookies to collect anonymised usage data."),
  boldListItem("Sanity CMS", "manages our website content. No personal visitor data is shared with Sanity."),
  boldListItem("Vercel", "hosts our website. Vercel may collect standard server logs including IP addresses."),
  block("5. Cookies", "h2"),
  block("Our website uses cookies to enhance your browsing experience and to analyse site traffic. Cookies are small text files stored on your device. You can control cookie preferences through your browser settings. Disabling cookies may affect some website functionality."),
  block("6. Data Security", "h2"),
  block("We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security."),
  block("7. Data Retention", "h2"),
  block("We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Newsletter subscribers can unsubscribe at any time, after which their data will be removed from our mailing list."),
  block("8. Your Rights", "h2"),
  block("Under the Australian Privacy Act 1988, you have the right to:"),
  listItem("Access the personal information we hold about you"),
  listItem("Request correction of inaccurate information"),
  listItem("Request deletion of your personal information"),
  listItem("Opt out of marketing communications"),
  block("9. Children's Privacy", "h2"),
  block("Our website is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us so we can promptly remove it."),
  block("10. Changes to This Policy", "h2"),
  block("We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically."),
  block("11. Contact Us", "h2"),
  block("If you have questions or concerns about this Privacy Policy or our data practices, please contact us:"),
  block("Australian Islamic Centre"),
  block("23-27 Blenheim Road, Newport VIC 3015"),
  block("Phone: (03) 9391 5724"),
  emailBlock("Email", "info@australianislamiccentre.org"),
];

const termsContent = [
  block("1. Acceptance of Terms", "h2"),
  block("By accessing and using the Australian Islamic Centre website (australianislamiccentre.org), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use our website."),
  block("2. Use of the Website", "h2"),
  block("You agree to use this website only for lawful purposes and in a manner that:"),
  listItem("Does not infringe the rights of others"),
  listItem("Does not restrict or inhibit anyone else's use of the website"),
  listItem("Does not attempt to gain unauthorised access to any part of the website"),
  listItem("Does not introduce malicious software or harmful code"),
  listItem("Complies with all applicable Australian laws and regulations"),
  block("3. Intellectual Property", "h2"),
  block("All content on this website, including text, images, logos, graphics, and design elements, is the property of the Australian Islamic Centre or its content suppliers and is protected by Australian and international copyright laws. You may not reproduce, distribute, or create derivative works from this content without our prior written consent."),
  block("4. User Submissions", "h2"),
  block("When you submit information through our contact forms, event registrations, or newsletter subscriptions, you grant us permission to use that information for the purposes described in our Privacy Policy. You are responsible for ensuring that any information you submit is accurate and does not violate the rights of any third party."),
  block("5. Donations", "h2"),
  block("Donations made through our website are processed by FundraiseUp, a third-party payment processor. By making a donation, you agree to FundraiseUp's terms and conditions in addition to these terms. All donations are made voluntarily and are generally non-refundable unless required by law. Tax receipts are issued in accordance with Australian Taxation Office requirements."),
  block("6. Event Registration", "h2"),
  block("Registrations for events and programs are subject to availability. We reserve the right to cancel, reschedule, or modify events at our discretion. In such cases, registered participants will be notified through the contact details provided during registration."),
  block("7. Third-Party Links", "h2"),
  block("Our website may contain links to third-party websites, including those of our partner organisations. We are not responsible for the content, privacy practices, or terms of use of these external sites. Visiting linked websites is at your own risk."),
  block("8. Disclaimer of Warranties", "h2"),
  block('This website is provided on an "as is" and "as available" basis. While we strive to keep the information accurate and up to date, we make no warranties or representations about the completeness, accuracy, or reliability of any content on this website. Prayer times, event schedules, and other time-sensitive information should be confirmed directly with the centre.'),
  block("9. Limitation of Liability", "h2"),
  block("To the fullest extent permitted by Australian law, the Australian Islamic Centre shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use this website."),
  block("10. Governing Law", "h2"),
  block("These Terms of Use are governed by and construed in accordance with the laws of the State of Victoria, Australia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Victoria."),
  block("11. Changes to These Terms", "h2"),
  block("We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to this page. Your continued use of the website after any changes constitutes acceptance of the updated terms."),
  block("12. Contact Us", "h2"),
  block("If you have any questions about these Terms of Use, please contact us:"),
  block("Australian Islamic Centre"),
  block("23-27 Blenheim Road, Newport VIC 3015"),
  block("Phone: (03) 9391 5724"),
  emailBlock("Email", "info@australianislamiccentre.org"),
];

const accessibilityContent = [
  block("Our Commitment", "h2"),
  block("The Australian Islamic Centre is committed to ensuring that our website is accessible to all visitors, regardless of ability or the technology they use. We strive to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA conformance, and we continuously work to improve the accessibility and usability of our website."),
  block("Accessibility Features", "h2"),
  block("Our website incorporates the following accessibility features:"),
  boldListItem("Keyboard navigation", "all interactive elements can be accessed and operated using a keyboard alone."),
  boldListItem("Skip to content", "a skip link is provided to allow keyboard users to bypass repetitive navigation and jump directly to the main content."),
  boldListItem("Semantic HTML", "we use proper HTML elements (headings, lists, landmarks) to ensure content is structured logically for screen readers."),
  boldListItem("Text alternatives", "meaningful alt text is provided for all images to convey their content or function."),
  boldListItem("Colour contrast", "text and interactive elements meet WCAG AA minimum contrast ratios to ensure readability."),
  boldListItem("Focus indicators", "visible focus styles are provided on all interactive elements for keyboard users."),
  boldListItem("Responsive design", "the website adapts to different screen sizes and can be zoomed up to 200% without loss of content or functionality."),
  boldListItem("Reduced motion", 'animations respect the "prefers-reduced-motion" system setting for users who are sensitive to motion.'),
  boldListItem("Form labels", "all form inputs have associated labels to ensure they are identifiable by assistive technology."),
  block("Known Limitations", "h2"),
  block("While we strive for full accessibility, some areas of our website may have limitations:"),
  boldListItem("Third-party content", "some embedded content from third-party services (such as donation forms provided by FundraiseUp) may not fully meet accessibility standards. We work with our service providers to improve this."),
  boldListItem("PDF documents", "some older PDF documents may not be fully accessible. We are working to provide accessible alternatives."),
  boldListItem("Arabic content", "Quranic verses and Arabic text are displayed with proper right-to-left formatting and the Amiri font for accurate rendering."),
  block("Standards We Follow", "h2"),
  block("Our accessibility efforts are guided by:"),
  listItem("Web Content Accessibility Guidelines (WCAG) 2.1, Level AA"),
  listItem("Disability Discrimination Act 1992 (Australia)"),
  listItem("WAI-ARIA best practices for dynamic web content"),
  block("Feedback and Assistance", "h2"),
  block("We welcome your feedback on the accessibility of our website. If you encounter any barriers or have suggestions for improvement, please contact us. We take accessibility feedback seriously and will make reasonable efforts to address any issues."),
  block("Australian Islamic Centre"),
  block("23-27 Blenheim Road, Newport VIC 3015"),
  block("Phone: (03) 9391 5724"),
  emailBlock("Email", "info@australianislamiccentre.org"),
  block("If you need information from our website in an alternative format, please contact us and we will do our best to accommodate your request."),
];

async function seedLegalPages() {
  console.log("\n📄 Seeding Legal Pages (Privacy, Terms, Accessibility)...");

  const pages = [
    {
      _type: "pageContent",
      _id: "pageContent-privacy",
      active: true,
      showInNav: false,
      title: "Privacy Policy",
      slug: { _type: "slug", current: "privacy" },
      pageType: "privacy",
      subtitle: "Last updated: March 2026",
      content: privacyContent,
      seo: {
        metaTitle: "Privacy Policy",
        metaDescription: "Privacy policy for the Australian Islamic Centre website.",
      },
    },
    {
      _type: "pageContent",
      _id: "pageContent-terms",
      active: true,
      showInNav: false,
      title: "Terms of Use",
      slug: { _type: "slug", current: "terms" },
      pageType: "terms",
      subtitle: "Last updated: March 2026",
      content: termsContent,
      seo: {
        metaTitle: "Terms of Use",
        metaDescription: "Terms of use for the Australian Islamic Centre website.",
      },
    },
    {
      _type: "pageContent",
      _id: "pageContent-accessibility",
      active: true,
      showInNav: false,
      title: "Accessibility Statement",
      slug: { _type: "slug", current: "accessibility" },
      pageType: "custom",
      subtitle: "Last updated: March 2026",
      content: accessibilityContent,
      seo: {
        metaTitle: "Accessibility Statement",
        metaDescription: "Accessibility statement for the Australian Islamic Centre website, outlining our commitment to WCAG 2.1 AA compliance.",
      },
    },
  ];

  for (const doc of pages) {
    const result = await client.createOrReplace(doc);
    console.log(`  ✓ ${result.title} (${result._id})`);
  }
}

// ─────────────────────────────────────────────────────────
// RUN ALL
// ─────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding Sanity content...");
  console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}`);

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("\n❌ SANITY_API_WRITE_TOKEN not found in .env.local");
    process.exit(1);
  }

  await seedSiteSettings();
  await seedWelcomeSection();
  await seedLegalPages();

  console.log("\n✅ All content seeded! Check Sanity Studio to verify.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
