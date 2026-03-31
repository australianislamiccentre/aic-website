/**
 * Migrate Form Settings — Split formSettings into 5 singletons
 *
 * Reads the existing (deprecated) `formSettings` singleton and copies its
 * fields into the 5 new dedicated form singleton documents:
 *   - contactFormSettings
 *   - serviceInquiryFormSettings
 *   - eventInquiryFormSettings
 *   - newsletterSettings
 *   - allowedFormDomains (from siteSettings.allowedEmbedDomains)
 *
 * Safe to run multiple times — skips any singleton that already has data.
 *
 * Usage:
 *   npx tsx scripts/migrate-form-settings.ts
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

async function main() {
  console.log("🔄 Migrating form settings...\n");

  // Fetch old formSettings singleton
  const old = await client.fetch<Record<string, unknown> | null>(
    `*[_id == "formSettings"][0]`
  );

  if (!old) {
    console.log("ℹ️  No formSettings document found — nothing to migrate.");
  } else {
    console.log("✓ Found formSettings document. Checking each singleton...\n");
  }

  // Also fetch siteSettings for allowedEmbedDomains
  const siteSettings = await client.fetch<
    { allowedEmbedDomains?: Array<{ domain: string; label?: string }> } | null
  >(`*[_id == "siteSettings"][0]{ allowedEmbedDomains }`);

  // ── 1. contactFormSettings ──
  console.log("📋 Checking contactFormSettings...");
  const existingContact = await client.fetch(`*[_id == "contactFormSettings"][0]`);
  if (!existingContact?.contactRecipientEmail && old?.contactRecipientEmail) {
    console.log("  → Migrating contactFormSettings...");
    await client.createOrReplace({
      _id: "contactFormSettings",
      _type: "contactFormSettings",
      contactEnabled: old.contactEnabled ?? true,
      contactRecipientEmail: old.contactRecipientEmail,
      contactHeading: old.contactHeading,
      contactHeadingAccent: old.contactHeadingAccent,
      contactDescription: old.contactDescription,
      contactFormHeading: old.contactFormHeading,
      contactFormDescription: old.contactFormDescription,
      contactInquiryTypes: old.contactInquiryTypes,
      contactSuccessHeading: old.contactSuccessHeading,
      contactSuccessMessage: old.contactSuccessMessage,
    });
    console.log("  ✓ contactFormSettings migrated\n");
  } else if (existingContact?.contactRecipientEmail) {
    console.log("  ↩️  contactFormSettings already has data — skipped\n");
  } else {
    console.log("  ⊘ No data to migrate\n");
  }

  // ── 2. serviceInquiryFormSettings ──
  console.log("📋 Checking serviceInquiryFormSettings...");
  const existingService = await client.fetch(
    `*[_id == "serviceInquiryFormSettings"][0]`
  );
  if (!existingService?.serviceInquiryRecipientEmail && old?.serviceInquiryRecipientEmail) {
    console.log("  → Migrating serviceInquiryFormSettings...");
    await client.createOrReplace({
      _id: "serviceInquiryFormSettings",
      _type: "serviceInquiryFormSettings",
      serviceInquiryEnabled: old.serviceInquiryEnabled ?? true,
      serviceInquiryRecipientEmail: old.serviceInquiryRecipientEmail,
      serviceInquiryFormHeading: old.serviceInquiryFormHeading,
      serviceInquiryFormDescription: old.serviceInquiryFormDescription,
      serviceInquirySuccessHeading: old.serviceInquirySuccessHeading,
      serviceInquirySuccessMessage: old.serviceInquirySuccessMessage,
    });
    console.log("  ✓ serviceInquiryFormSettings migrated\n");
  } else if (existingService?.serviceInquiryRecipientEmail) {
    console.log("  ↩️  serviceInquiryFormSettings already has data — skipped\n");
  } else {
    console.log("  ⊘ No data to migrate\n");
  }

  // ── 3. eventInquiryFormSettings ──
  console.log("📋 Checking eventInquiryFormSettings...");
  const existingEvent = await client.fetch(`*[_id == "eventInquiryFormSettings"][0]`);
  if (!existingEvent?.eventInquiryRecipientEmail && old?.eventInquiryRecipientEmail) {
    console.log("  → Migrating eventInquiryFormSettings...");
    await client.createOrReplace({
      _id: "eventInquiryFormSettings",
      _type: "eventInquiryFormSettings",
      eventInquiryEnabled: old.eventInquiryEnabled ?? true,
      eventInquiryRecipientEmail: old.eventInquiryRecipientEmail,
    });
    console.log("  ✓ eventInquiryFormSettings migrated\n");
  } else if (existingEvent?.eventInquiryRecipientEmail) {
    console.log("  ↩️  eventInquiryFormSettings already has data — skipped\n");
  } else {
    console.log("  ⊘ No data to migrate\n");
  }

  // ── 4. newsletterSettings ──
  console.log("📋 Checking newsletterSettings...");
  const existingNewsletter = await client.fetch(`*[_id == "newsletterSettings"][0]`);
  if (!existingNewsletter?.newsletterRecipientEmail && old?.newsletterRecipientEmail) {
    console.log("  → Migrating newsletterSettings...");
    await client.createOrReplace({
      _id: "newsletterSettings",
      _type: "newsletterSettings",
      newsletterEnabled: old.newsletterEnabled ?? true,
      newsletterRecipientEmail: old.newsletterRecipientEmail,
      newsletterHeading: old.newsletterHeading,
      newsletterDescription: old.newsletterDescription,
      newsletterButtonText: old.newsletterButtonText,
      newsletterSuccessMessage: old.newsletterSuccessMessage,
    });
    console.log("  ✓ newsletterSettings migrated\n");
  } else if (existingNewsletter?.newsletterRecipientEmail) {
    console.log("  ↩️  newsletterSettings already has data — skipped\n");
  } else {
    console.log("  ⊘ No data to migrate\n");
  }

  // ── 5. allowedFormDomains (from siteSettings) ──
  console.log("📋 Checking allowedFormDomains...");
  const existingDomains = await client.fetch(`*[_id == "allowedFormDomains"][0]`);
  const domainsToCopy = siteSettings?.allowedEmbedDomains;
  if (!existingDomains?.allowedDomains?.length && domainsToCopy?.length) {
    console.log("  → Migrating allowedFormDomains...");
    await client.createOrReplace({
      _id: "allowedFormDomains",
      _type: "allowedFormDomains",
      allowedDomains: domainsToCopy.map((d) => ({
        _type: "object",
        _key: d.domain.replace(/[^a-z0-9]/gi, "-"),
        domain: d.domain,
        label: d.label,
      })),
    });
    console.log("  ✓ allowedFormDomains migrated\n");
  } else if (existingDomains?.allowedDomains?.length) {
    console.log("  ↩️  allowedFormDomains already has data — skipped\n");
  } else {
    console.log("  ⊘ No data to migrate\n");
  }

  console.log("✅ Migration complete.");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
