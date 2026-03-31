/**
 * Form Settings — Centralised Form Configuration
 *
 * Provides two functions consumed by all form API routes:
 * - `getFormRecipientEmail(form)` — Resolves the recipient email using a
 *   3-tier fallback: Sanity singleton → environment variable → hardcoded default.
 * - `isFormEnabled(form)` — Checks whether a form is enabled in Sanity CMS
 *   (defaults to enabled if not explicitly set to false).
 *
 * Settings are cached in-memory for 60 seconds to avoid per-request Sanity fetches.
 *
 * @module lib/form-settings
 * @see src/sanity/schemas/contactFormSettings.ts          for the contact form schema
 * @see src/sanity/schemas/serviceInquiryFormSettings.ts   for the service inquiry schema
 * @see src/sanity/schemas/eventInquiryFormSettings.ts     for the event inquiry schema
 * @see src/sanity/schemas/newsletterSettings.ts           for the newsletter schema
 */
import { noCdnClient } from "@/sanity/lib/client";
import {
  contactFormSettingsQuery,
  serviceInquiryFormSettingsQuery,
  eventInquiryFormSettingsQuery,
  newsletterSettingsQuery,
} from "@/sanity/lib/queries";

interface ContactSettings {
  contactRecipientEmail?: string;
  contactEnabled?: boolean;
}

interface ServiceInquirySettings {
  serviceInquiryRecipientEmail?: string;
  serviceInquiryEnabled?: boolean;
}

interface EventInquirySettings {
  eventInquiryRecipientEmail?: string;
  eventInquiryEnabled?: boolean;
}

interface NewsletterSettings {
  newsletterRecipientEmail?: string;
  newsletterEnabled?: boolean;
}

interface FormSettingsCache {
  contact: ContactSettings;
  serviceInquiry: ServiceInquirySettings;
  eventInquiry: EventInquirySettings;
  newsletter: NewsletterSettings;
  ts: number;
}

const FALLBACK_EMAIL = "contact@australianislamiccentre.org";

let cached: FormSettingsCache | null = null;
const CACHE_TTL = 60_000; // 1 minute

async function getSettings(): Promise<Omit<FormSettingsCache, "ts">> {
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    const { ts: _ts, ...rest } = cached;
    return rest;
  }
  try {
    const [contact, serviceInquiry, eventInquiry, newsletter] = await Promise.all([
      noCdnClient.fetch<ContactSettings | null>(contactFormSettingsQuery),
      noCdnClient.fetch<ServiceInquirySettings | null>(serviceInquiryFormSettingsQuery),
      noCdnClient.fetch<EventInquirySettings | null>(eventInquiryFormSettingsQuery),
      noCdnClient.fetch<NewsletterSettings | null>(newsletterSettingsQuery),
    ]);
    const result = {
      contact: contact ?? {},
      serviceInquiry: serviceInquiry ?? {},
      eventInquiry: eventInquiry ?? {},
      newsletter: newsletter ?? {},
    };
    cached = { ...result, ts: Date.now() };
    return result;
  } catch (error) {
    console.error("Failed to fetch form settings from Sanity:", error);
    if (cached) {
      const { ts: _ts, ...rest } = cached;
      return rest;
    }
    return { contact: {}, serviceInquiry: {}, eventInquiry: {}, newsletter: {} };
  }
}

type FormType = "contact" | "serviceInquiry" | "eventInquiry" | "newsletter";

export async function getFormRecipientEmail(
  form: FormType
): Promise<string> {
  const settings = await getSettings();

  const envFallbacks: Record<string, string | undefined> = {
    contact: process.env.CONTACT_FORM_TO_EMAIL || process.env.FORM_TO_EMAIL,
    serviceInquiry: process.env.SERVICE_INQUIRY_TO_EMAIL || process.env.FORM_TO_EMAIL,
    eventInquiry: process.env.FORM_TO_EMAIL,
    newsletter: process.env.SUBSCRIBE_TO_EMAIL || process.env.FORM_TO_EMAIL,
  };

  const sanityEmails: Record<string, string | undefined> = {
    contact: settings.contact.contactRecipientEmail,
    serviceInquiry: settings.serviceInquiry.serviceInquiryRecipientEmail,
    eventInquiry: settings.eventInquiry.eventInquiryRecipientEmail,
    newsletter: settings.newsletter.newsletterRecipientEmail,
  };

  // Sanity takes priority, then env vars, then hardcoded fallback
  return sanityEmails[form] || envFallbacks[form] || FALLBACK_EMAIL;
}

export async function isFormEnabled(
  form: FormType
): Promise<boolean> {
  const settings = await getSettings();

  const enabledMap: Record<string, boolean | undefined> = {
    contact: settings.contact.contactEnabled,
    serviceInquiry: settings.serviceInquiry.serviceInquiryEnabled,
    eventInquiry: settings.eventInquiry.eventInquiryEnabled,
    newsletter: settings.newsletter.newsletterEnabled,
  };

  // Default to enabled if not set
  return enabledMap[form] !== false;
}
