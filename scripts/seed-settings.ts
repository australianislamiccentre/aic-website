/**
 * Seed Settings — Populate Site Settings, Form Settings, and Donation Settings
 *
 * Seeds all text/config fields for:
 *   - siteSettings (tagline, parent org, address, phone, email, social, operating hours)
 *   - contactFormSettings (headings, descriptions, inquiry types, success messages)
 *   - serviceInquiryFormSettings (headings, descriptions, success messages)
 *   - eventInquiryFormSettings (enabled flag)
 *   - newsletterSettings (headings, descriptions, button text, success message)
 *   - donationSettings (organization key)
 *   - donatePageSettings (hero text, impact stats)
 *
 * Also uploads logo images (aic logo.png, aic website logo.svg) to Sanity
 * and wires them into siteSettings.
 *
 * Safe to run multiple times — uses setIfMissing() so existing data is never overwritten.
 *
 * Usage:
 *   npx tsx scripts/seed-settings.ts
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

// ── Image upload helper ───────────────────────────────────────────────────

const uploadCache: Record<string, string> = {};

async function uploadImage(
  filename: string,
): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } }> {
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
  const asset = await client.assets.upload(
    "image",
    fs.createReadStream(filePath),
    { filename, contentType },
  );

  uploadCache[filename] = asset._id;
  console.log(`    ✓ ${filename} → ${asset._id}`);

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔧 Seeding Site Settings, Form Settings & Donation Settings...\n");

  // ── 1. siteSettings ─────────────────────────────────────────────────────

  console.log("📋 siteSettings");
  await client.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });

  // Text fields
  await client
    .patch("siteSettings")
    .setIfMissing({
      organizationName: "Australian Islamic Centre",
      shortName: "AIC",
      tagline:
        "A unique Islamic environment that integrates Australian values with the beauty of Islam",
      parentOrganization: "Newport Islamic Society",
      address: {
        street: "23-27 Blenheim Rd",
        suburb: "Newport",
        state: "VIC",
        postcode: "3015",
        country: "Australia",
      },
      phone: "03 9000 0177",
      email: "contact@australianislamiccentre.org",
      googleMapsUrl:
        "https://www.google.com/maps/place/Australian+Islamic+Centre/@-37.8422,144.8831,17z",
      operatingHours: {
        weekdays: "Open for all prayer times",
        weekends: "Open for all prayer times",
        notes: "The mosque is open daily from Fajr to Isha",
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
    })
    .commit();
  console.log("  ✓ Text fields seeded");

  // Logos
  const logoDark = await uploadImage("aic logo.png");
  const logoLight = await uploadImage("aic website logo.svg");
  await client
    .patch("siteSettings")
    .setIfMissing({ logo: logoDark, logoAlt: logoLight })
    .commit();
  console.log("  ✓ Logos uploaded and wired\n");

  // ── 2. contactFormSettings ──────────────────────────────────────────────

  console.log("📋 contactFormSettings");
  await client.createIfNotExists({
    _id: "contactFormSettings",
    _type: "contactFormSettings",
  });
  await client
    .patch("contactFormSettings")
    .setIfMissing({
      contactEnabled: true,
      contactRecipientEmail: "contact@australianislamiccentre.org",
      contactHeading: "Get in",
      contactHeadingAccent: "Touch",
      contactDescription:
        "Have a question or need assistance? We're here to help.",
      contactFormHeading: "Send Us a Message",
      contactFormDescription:
        "Fill out the form below and we'll get back to you shortly.",
      contactInquiryTypes: [
        "General Enquiry",
        "Services",
        "Programs & Education",
        "Events",
        "Donations",
        "Nikah Services",
        "Funeral Services",
        "Tours & Visits",
        "Media Interview",
        "Volunteer",
        "Other",
      ],
      contactSuccessHeading: "Message Sent!",
      contactSuccessMessage:
        "Thank you for contacting us. We'll get back to you as soon as possible.",
    })
    .commit();
  console.log("  ✓ All fields seeded\n");

  // ── 3. serviceInquiryFormSettings ───────────────────────────────────────

  console.log("📋 serviceInquiryFormSettings");
  await client.createIfNotExists({
    _id: "serviceInquiryFormSettings",
    _type: "serviceInquiryFormSettings",
  });
  await client
    .patch("serviceInquiryFormSettings")
    .setIfMissing({
      serviceInquiryEnabled: true,
      serviceInquiryRecipientEmail: "contact@australianislamiccentre.org",
      serviceInquiryFormHeading: "Get in Touch",
      serviceInquiryFormDescription:
        "Have questions? Fill out the form below and we'll get back to you.",
      serviceInquirySuccessHeading: "Inquiry Sent!",
      serviceInquirySuccessMessage:
        "Thank you for your inquiry. We'll get back to you as soon as possible.",
    })
    .commit();
  console.log("  ✓ All fields seeded\n");

  // ── 4. eventInquiryFormSettings ─────────────────────────────────────────

  console.log("📋 eventInquiryFormSettings");
  await client.createIfNotExists({
    _id: "eventInquiryFormSettings",
    _type: "eventInquiryFormSettings",
  });
  await client
    .patch("eventInquiryFormSettings")
    .setIfMissing({
      eventInquiryEnabled: true,
      eventInquiryRecipientEmail: "contact@australianislamiccentre.org",
    })
    .commit();
  console.log("  ✓ All fields seeded\n");

  // ── 5. newsletterSettings ───────────────────────────────────────────────

  console.log("📋 newsletterSettings");
  await client.createIfNotExists({
    _id: "newsletterSettings",
    _type: "newsletterSettings",
  });
  await client
    .patch("newsletterSettings")
    .setIfMissing({
      newsletterEnabled: true,
      newsletterRecipientEmail: "contact@australianislamiccentre.org",
      newsletterHeading: "Stay Connected with Our Community",
      newsletterDescription:
        "Subscribe to receive updates on events, programs, and spiritual reminders from the Australian Islamic Centre.",
      newsletterButtonText: "Subscribe",
      newsletterSuccessMessage: "Thanks for subscribing! We'll be in touch.",
    })
    .commit();
  console.log("  ✓ All fields seeded\n");

  // ── 6. allowedFormDomains ───────────────────────────────────────────────

  console.log("📋 allowedFormDomains");
  await client.createIfNotExists({
    _id: "allowedFormDomains",
    _type: "allowedFormDomains",
  });
  const formDomainsDoc = await client.fetch(
    `*[_id == "allowedFormDomains"][0]{ allowedDomains }`,
  );
  if (!formDomainsDoc?.allowedDomains || formDomainsDoc.allowedDomains.length === 0) {
    await client
      .patch("allowedFormDomains")
      .setIfMissing({
        allowedDomains: [
          { _key: "jotform", domain: "form.jotform.com", label: "JotForm" },
          { _key: "gforms", domain: "docs.google.com", label: "Google Forms" },
          { _key: "typeform", domain: "form.typeform.com", label: "Typeform" },
        ],
      })
      .commit();
    console.log("  ✓ Default domains seeded (JotForm, Google Forms, Typeform)\n");
  } else {
    console.log("  ↩ allowedDomains already populated\n");
  }

  // ── 7. donationSettings ─────────────────────────────────────────────────

  console.log("📋 donationSettings");
  await client.createIfNotExists({
    _id: "donationSettings",
    _type: "donationSettings",
  });
  await client
    .patch("donationSettings")
    .setIfMissing({
      organizationKey: "AGUWBDNC",
    })
    .commit();
  console.log("  ✓ Organization key seeded\n");

  // ── 8. donatePageSettings ───────────────────────────────────────────────

  console.log("📋 donatePageSettings");
  await client.createIfNotExists({
    _id: "donatePageSettings",
    _type: "donatePageSettings",
  });

  await client
    .patch("donatePageSettings")
    .setIfMissing({
      heroHeading: "Support Our Community",
      heroDescription:
        "Your generosity helps us maintain our centre, run educational programs, and support those in need.",
    })
    .commit();

  // Impact stats
  const donateDoc = await client.fetch(
    `*[_id == "donatePageSettings"][0]{ impactStats }`,
  );
  if (!donateDoc?.impactStats || donateDoc.impactStats.length === 0) {
    await client
      .patch("donatePageSettings")
      .setIfMissing({
        impactStats: [
          { _key: "stat1", value: "500+", label: "Families Supported" },
          { _key: "stat2", value: "20+", label: "Years Serving" },
          { _key: "stat3", value: "5", label: "Daily Prayers" },
          { _key: "stat4", value: "1000+", label: "Community Members" },
        ],
      })
      .commit();
    console.log("  ✓ Hero text + impact stats seeded\n");
  } else {
    console.log("  ✓ Hero text seeded (impact stats already populated)\n");
  }

  // ── Done ────────────────────────────────────────────────────────────────

  console.log("✅ All settings seeded successfully!");
  console.log(
    `   ${Object.keys(uploadCache).length} image(s) uploaded to Sanity`,
  );
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
