"use client";

import { createContext, useContext } from "react";

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

// Default inquiry types (used when Sanity has none configured)
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

// Convert a plain string list to {value, label} for the Select component
function toInquiryTypes(labels: string[]): InquiryType[] {
  return labels.map((label) => ({ value: label, label }));
}

// Sanity raw shape (all fields optional)
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

const FormSettingsContext = createContext<FormSettingsData>(buildFormSettings(null));

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

export function useFormSettings(): FormSettingsData {
  return useContext(FormSettingsContext);
}
