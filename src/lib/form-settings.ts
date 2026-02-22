import { noCdnClient } from "@/sanity/lib/client";
import { formSettingsQuery } from "@/sanity/lib/queries";

interface FormSettings {
  contactRecipientEmail?: string;
  contactEnabled?: boolean;
  serviceInquiryRecipientEmail?: string;
  serviceInquiryEnabled?: boolean;
  eventInquiryRecipientEmail?: string;
  eventInquiryEnabled?: boolean;
  newsletterRecipientEmail?: string;
  newsletterEnabled?: boolean;
}

const FALLBACK_EMAIL = "contact@australianislamiccentre.org";

let cached: { settings: FormSettings; ts: number } | null = null;
const CACHE_TTL = 60_000; // 1 minute

async function getSettings(): Promise<FormSettings> {
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.settings;
  }
  try {
    const settings = await noCdnClient.fetch<FormSettings | null>(formSettingsQuery);
    const result = settings ?? {};
    cached = { settings: result, ts: Date.now() };
    return result;
  } catch (error) {
    console.error("Failed to fetch form settings from Sanity:", error);
    return cached?.settings ?? {};
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
    contact: settings.contactRecipientEmail,
    serviceInquiry: settings.serviceInquiryRecipientEmail,
    eventInquiry: settings.eventInquiryRecipientEmail,
    newsletter: settings.newsletterRecipientEmail,
  };

  // Sanity takes priority, then env vars, then hardcoded fallback
  return sanityEmails[form] || envFallbacks[form] || FALLBACK_EMAIL;
}

export async function isFormEnabled(
  form: FormType
): Promise<boolean> {
  const settings = await getSettings();

  const enabledMap: Record<string, boolean | undefined> = {
    contact: settings.contactEnabled,
    serviceInquiry: settings.serviceInquiryEnabled,
    eventInquiry: settings.eventInquiryEnabled,
    newsletter: settings.newsletterEnabled,
  };

  // Default to enabled if not set
  return enabledMap[form] !== false;
}
