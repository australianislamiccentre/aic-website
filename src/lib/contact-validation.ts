export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

export interface ServiceInquiryFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  serviceName: string;
  message: string;
}

export interface EventInquiryFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  eventName: string;
  contactEmail?: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Maximum input lengths to prevent abuse (e.g. 10MB payloads)
const MAX_NAME = 100;
const MAX_EMAIL = 254; // RFC 5321
const MAX_PHONE = 20;
const MAX_LABEL = 200; // inquiry type, service name, event name
const MAX_MESSAGE = 5000;

function tooLong(value: string, max: number): boolean {
  return value.length > max;
}

export function validateContactForm(
  data: unknown
): { valid: true; data: ContactFormData } | { valid: false; error: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const d = data as Record<string, unknown>;

  if (!d.firstName || typeof d.firstName !== "string" || d.firstName.trim().length === 0) {
    return { valid: false, error: "First name is required" };
  }
  if (tooLong(String(d.firstName), MAX_NAME)) {
    return { valid: false, error: `First name must be under ${MAX_NAME} characters` };
  }
  if (!d.lastName || typeof d.lastName !== "string" || d.lastName.trim().length === 0) {
    return { valid: false, error: "Last name is required" };
  }
  if (tooLong(String(d.lastName), MAX_NAME)) {
    return { valid: false, error: `Last name must be under ${MAX_NAME} characters` };
  }
  if (!d.email || typeof d.email !== "string" || !EMAIL_REGEX.test(d.email)) {
    return { valid: false, error: "A valid email address is required" };
  }
  if (tooLong(String(d.email), MAX_EMAIL)) {
    return { valid: false, error: "Email address is too long" };
  }
  if (d.phone && typeof d.phone === "string" && tooLong(d.phone, MAX_PHONE)) {
    return { valid: false, error: `Phone number must be under ${MAX_PHONE} characters` };
  }
  if (!d.inquiryType || typeof d.inquiryType !== "string") {
    return { valid: false, error: "Enquiry type is required" };
  }
  if (tooLong(String(d.inquiryType), MAX_LABEL)) {
    return { valid: false, error: "Enquiry type is too long" };
  }
  if (!d.message || typeof d.message !== "string" || d.message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }
  if (tooLong(String(d.message), MAX_MESSAGE)) {
    return { valid: false, error: `Message must be under ${MAX_MESSAGE} characters` };
  }

  return {
    valid: true,
    data: {
      firstName: String(d.firstName).trim(),
      lastName: String(d.lastName).trim(),
      email: String(d.email).trim().toLowerCase(),
      phone: d.phone ? String(d.phone).trim() : undefined,
      inquiryType: String(d.inquiryType).trim(),
      message: String(d.message).trim(),
    },
  };
}

export function validateServiceInquiry(
  data: unknown
): { valid: true; data: ServiceInquiryFormData } | { valid: false; error: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const d = data as Record<string, unknown>;

  if (!d.firstName || typeof d.firstName !== "string" || d.firstName.trim().length === 0) {
    return { valid: false, error: "First name is required" };
  }
  if (tooLong(String(d.firstName), MAX_NAME)) {
    return { valid: false, error: `First name must be under ${MAX_NAME} characters` };
  }
  if (!d.lastName || typeof d.lastName !== "string" || d.lastName.trim().length === 0) {
    return { valid: false, error: "Last name is required" };
  }
  if (tooLong(String(d.lastName), MAX_NAME)) {
    return { valid: false, error: `Last name must be under ${MAX_NAME} characters` };
  }
  if (!d.email || typeof d.email !== "string" || !EMAIL_REGEX.test(d.email)) {
    return { valid: false, error: "A valid email address is required" };
  }
  if (tooLong(String(d.email), MAX_EMAIL)) {
    return { valid: false, error: "Email address is too long" };
  }
  if (d.phone && typeof d.phone === "string" && tooLong(d.phone, MAX_PHONE)) {
    return { valid: false, error: `Phone number must be under ${MAX_PHONE} characters` };
  }
  if (!d.serviceName || typeof d.serviceName !== "string") {
    return { valid: false, error: "Service name is required" };
  }
  if (tooLong(String(d.serviceName), MAX_LABEL)) {
    return { valid: false, error: "Service name is too long" };
  }
  if (!d.message || typeof d.message !== "string" || d.message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }
  if (tooLong(String(d.message), MAX_MESSAGE)) {
    return { valid: false, error: `Message must be under ${MAX_MESSAGE} characters` };
  }

  return {
    valid: true,
    data: {
      firstName: String(d.firstName).trim(),
      lastName: String(d.lastName).trim(),
      email: String(d.email).trim().toLowerCase(),
      phone: d.phone ? String(d.phone).trim() : undefined,
      serviceName: String(d.serviceName).trim(),
      message: String(d.message).trim(),
    },
  };
}

export function validateEventInquiry(
  data: unknown
): { valid: true; data: EventInquiryFormData } | { valid: false; error: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const d = data as Record<string, unknown>;

  if (!d.firstName || typeof d.firstName !== "string" || d.firstName.trim().length === 0) {
    return { valid: false, error: "First name is required" };
  }
  if (tooLong(String(d.firstName), MAX_NAME)) {
    return { valid: false, error: `First name must be under ${MAX_NAME} characters` };
  }
  if (!d.lastName || typeof d.lastName !== "string" || d.lastName.trim().length === 0) {
    return { valid: false, error: "Last name is required" };
  }
  if (tooLong(String(d.lastName), MAX_NAME)) {
    return { valid: false, error: `Last name must be under ${MAX_NAME} characters` };
  }
  if (!d.email || typeof d.email !== "string" || !EMAIL_REGEX.test(d.email)) {
    return { valid: false, error: "A valid email address is required" };
  }
  if (tooLong(String(d.email), MAX_EMAIL)) {
    return { valid: false, error: "Email address is too long" };
  }
  if (d.phone && typeof d.phone === "string" && tooLong(d.phone, MAX_PHONE)) {
    return { valid: false, error: `Phone number must be under ${MAX_PHONE} characters` };
  }
  if (!d.eventName || typeof d.eventName !== "string") {
    return { valid: false, error: "Event name is required" };
  }
  if (tooLong(String(d.eventName), MAX_LABEL)) {
    return { valid: false, error: "Event name is too long" };
  }
  if (!d.message || typeof d.message !== "string" || d.message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }
  if (tooLong(String(d.message), MAX_MESSAGE)) {
    return { valid: false, error: `Message must be under ${MAX_MESSAGE} characters` };
  }

  return {
    valid: true,
    data: {
      firstName: String(d.firstName).trim(),
      lastName: String(d.lastName).trim(),
      email: String(d.email).trim().toLowerCase(),
      phone: d.phone ? String(d.phone).trim() : undefined,
      eventName: String(d.eventName).trim(),
      contactEmail: d.contactEmail && typeof d.contactEmail === "string" && EMAIL_REGEX.test(d.contactEmail)
        ? String(d.contactEmail).trim().toLowerCase()
        : undefined,
      message: String(d.message).trim(),
    },
  };
}
