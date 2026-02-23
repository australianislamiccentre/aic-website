/**
 * Form Settings Context
 *
 * Provides CMS-editable form copy (headings, descriptions, success messages,
 * inquiry type options, enabled/disabled toggles) to every client component.
 * Data comes from the Sanity `formSettings` singleton, with sensible hardcoded
 * defaults for every field so forms always render.
 *
 * Covers three form areas:
 * - **Contact form** — heading, description, inquiry type dropdown, success text
 * - **Service inquiry** — heading, description, success text
 * - **Newsletter** — heading, description, button text, success text
 *
 * @module contexts/FormSettingsContext
 * @see src/sanity/schemas/formSettings.ts — Sanity schema for this data
 * @see src/lib/form-settings.ts           — server-side form toggle & recipient lookup
 */
"use client";

import { createContext, useContext } from "react";

/** A single option in the contact form inquiry type dropdown. */
export interface InquiryType {
  value: string;
  label: string;
}

export interface FormSettingsData {
  // Contact Form
  contactEnabled: boolean;
  contactHeading: string;
  contactHeadingAccent: string;
  contactDescription: string;
  contactFormHeading: string;
  contactFormDescription: string;
  contactInquiryTypes: InquiryType[];
  contactSuccessHeading: string;
  contactSuccessMessage: string;
  // Service Inquiry
  serviceInquiryEnabled: boolean;
  serviceInquiryFormHeading: string;
  serviceInquiryFormDescription: string;
  serviceInquirySuccessHeading: string;
  serviceInquirySuccessMessage: string;
  // Newsletter
  newsletterEnabled: boolean;
  newsletterHeading: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  newsletterSuccessMessage: string;
}

/** Fallback inquiry types when Sanity `formSettings.contactInquiryTypes` is empty. */
const DEFAULT_INQUIRY_TYPES: string[] = [
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
];

/** Converts a plain string list to `{value, label}` pairs for the Select component. */
function toInquiryTypes(labels: string[]): InquiryType[] {
  return labels.map((label) => ({ value: label, label }));
}

/** Raw Sanity response shape — every field is optional because the document may not exist yet. */
export interface SanityFormSettings {
  _id?: string;
  contactRecipientEmail?: string;
  contactEnabled?: boolean;
  contactHeading?: string;
  contactHeadingAccent?: string;
  contactDescription?: string;
  contactFormHeading?: string;
  contactFormDescription?: string;
  contactInquiryTypes?: string[];
  contactSuccessHeading?: string;
  contactSuccessMessage?: string;
  serviceInquiryRecipientEmail?: string;
  serviceInquiryEnabled?: boolean;
  serviceInquiryFormHeading?: string;
  serviceInquiryFormDescription?: string;
  serviceInquirySuccessHeading?: string;
  serviceInquirySuccessMessage?: string;
  newsletterRecipientEmail?: string;
  newsletterEnabled?: boolean;
  newsletterHeading?: string;
  newsletterDescription?: string;
  newsletterButtonText?: string;
  newsletterSuccessMessage?: string;
}

/**
 * Merges raw Sanity form settings with hardcoded defaults.
 * Guarantees every field is populated even if Sanity returns null.
 */
export function buildFormSettings(raw: SanityFormSettings | null): FormSettingsData {
  const inquiryLabels = raw?.contactInquiryTypes?.length ? raw.contactInquiryTypes : DEFAULT_INQUIRY_TYPES;

  return {
    // Contact
    contactEnabled: raw?.contactEnabled !== false,
    contactHeading: raw?.contactHeading || "Get in",
    contactHeadingAccent: raw?.contactHeadingAccent || "Touch",
    contactDescription: raw?.contactDescription || "Have a question or need assistance? We're here to help.",
    contactFormHeading: raw?.contactFormHeading || "Send Us a Message",
    contactFormDescription: raw?.contactFormDescription || "Fill out the form below and we'll get back to you shortly.",
    contactInquiryTypes: toInquiryTypes(inquiryLabels),
    contactSuccessHeading: raw?.contactSuccessHeading || "Message Sent!",
    contactSuccessMessage: raw?.contactSuccessMessage || "Thank you for contacting us. We'll get back to you as soon as possible.",
    // Service Inquiry
    serviceInquiryEnabled: raw?.serviceInquiryEnabled !== false,
    serviceInquiryFormHeading: raw?.serviceInquiryFormHeading || "Get in Touch",
    serviceInquiryFormDescription: raw?.serviceInquiryFormDescription || "Have questions? Fill out the form below and we'll get back to you.",
    serviceInquirySuccessHeading: raw?.serviceInquirySuccessHeading || "Inquiry Sent!",
    serviceInquirySuccessMessage: raw?.serviceInquirySuccessMessage || "Thank you for your inquiry. We'll get back to you as soon as possible.",
    // Newsletter
    newsletterEnabled: raw?.newsletterEnabled !== false,
    newsletterHeading: raw?.newsletterHeading || "Stay Connected with Our Community",
    newsletterDescription: raw?.newsletterDescription || "Subscribe to receive updates on events, programs, and spiritual reminders from the Australian Islamic Centre.",
    newsletterButtonText: raw?.newsletterButtonText || "Subscribe",
    newsletterSuccessMessage: raw?.newsletterSuccessMessage || "Thanks for subscribing! We'll be in touch.",
  };
}

/** Default value uses hardcoded fallbacks only (no Sanity data). */
const FormSettingsContext = createContext<FormSettingsData>(buildFormSettings(null));

/**
 * Wraps the app tree and provides merged form settings to all descendants.
 * Typically rendered once in the root layout with fresh Sanity data.
 */
export function FormSettingsProvider({
  formSettings,
  children,
}: {
  formSettings: SanityFormSettings | null;
  children: React.ReactNode;
}) {
  const settings = buildFormSettings(formSettings);
  return (
    <FormSettingsContext.Provider value={settings}>
      {children}
    </FormSettingsContext.Provider>
  );
}

/** Returns the merged form settings. Must be called inside `FormSettingsProvider`. */
export function useFormSettings(): FormSettingsData {
  return useContext(FormSettingsContext);
}
