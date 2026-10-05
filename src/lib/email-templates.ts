/**
 * Email Template System
 *
 * Generates branded HTML emails for all form submissions. Two email types:
 * - **Admin notification** — Sent to AIC staff with form details (uses `adminLayout`),
 *   followed by the "Request details" security block when the route passes one.
 * - **User confirmation** — Sent to the submitter acknowledging receipt (uses `confirmationLayout`).
 *   Confirmations never take request details: the submitter must not see them.
 *
 * All user input is passed through `escapeHtml()` before interpolation
 * to prevent XSS in email clients.
 *
 * @module lib/email-templates
 * @see src/app/api/contact/route.ts for usage example
 */
import type { ContactFormData, ServiceInquiryFormData, EventInquiryFormData } from "./contact-validation";
import type { RequestMeta } from "./request-meta";
import { formatMelbourneDate, formatMelbourneTime } from "./time";

// AIC Brand Colors
const BLUE = "#01476b";
const GREEN_DARK = "#00ad4c";
const GREEN_LIGHT = "#98c93c";

// Served from the public site: aic-website.vercel.app is behind Vercel's login, so images there don't load in email
const LOGO_URL = "https://australianislamiccentre.org/images/aic%20logo.png";

function adminLayout(title: string, content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><div style="max-width:600px;margin:0 auto;padding:20px 8px"><div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><div style="background:${BLUE};padding:24px 32px"><h1 style="margin:0;color:#fff;font-size:20px;font-weight:600">${title}</h1><div style="margin-top:8px;height:3px;width:60px;background:linear-gradient(to right,${GREEN_DARK},${GREEN_LIGHT});border-radius:2px"></div></div><div style="padding:32px">${content}</div></div></div></body></html>`;
}

function confirmationLayout(title: string, content: string): string {
  const ts = Date.now();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><div style="max-width:600px;margin:0 auto;padding:20px 8px"><div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><div style="background:${BLUE};padding:24px 32px;text-align:center"><img src="${LOGO_URL}" alt="Australian Islamic Centre" style="height:50px;margin-bottom:12px;pointer-events:none;user-select:none" draggable="false" /><h1 style="margin:0;color:#fff;font-size:20px;font-weight:600">${title}</h1><div style="margin:8px auto 0;height:3px;width:60px;background:linear-gradient(to right,${GREEN_DARK},${GREEN_LIGHT});border-radius:2px"></div></div><div style="padding:32px">${content}</div><div style="padding:16px 32px;background:${BLUE};text-align:center"><p style="margin:0;font-size:12px"><span style="color:rgba(255,255,255,0.7)">Australian Islamic Centre</span> <span style="color:rgba(255,255,255,0.5)">&middot;</span> <a href="https://maps.google.com/?q=23-27+Blenheim+Rd+Newport+VIC+3015" style="color:rgba(255,255,255,0.7);text-decoration:none">23-27 Blenheim Rd, Newport VIC 3015</a></p><p style="margin:4px 0 0;font-size:11px"><a href="tel:0390000177" style="color:rgba(255,255,255,0.5);text-decoration:none">(03) 9000 0177</a> <span style="color:rgba(255,255,255,0.5)">&middot;</span> <a href="https://australianislamiccentre.org" style="color:rgba(255,255,255,0.5);text-decoration:none">australianislamiccentre.org</a></p></div></div></div><div style="display:none;font-size:0;color:#f3f4f6">${ts}</div></body></html>`;
}

function fieldRow(label: string, value: string, isLink = false): string {
  const display = isLink ? `<a href="mailto:${value}" style="color:${GREEN_DARK};text-decoration:none;word-break:break-all">${value}</a>` : value;
  return `<div style="padding:10px 0;border-bottom:1px solid #f3f4f6"><p style="margin:0 0 2px;color:#6b7280;font-size:12px">${label}</p><p style="margin:0;color:#111827;font-size:14px;word-break:break-word">${display}</p></div>`;
}

function detailsTable(rows: string): string {
  return `<div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 16px">${rows}</div>`;
}

function messageBox(message: string): string {
  return `<div style="background:#f9fafb;border-radius:8px;padding:16px;border-left:4px solid ${GREEN_DARK}"><p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600">Message</p><p style="margin:0;color:#111827;font-size:14px;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</p></div>`;
}

/** The security record shown to staff under a submission. */
export interface RequestDetails {
  submissionId: string;
  meta: RequestMeta;
}

/** Joins the parts that are present, or returns null when none are. */
function joinPresent(parts: Array<string | null>, separator: string): string | null {
  const present = parts.filter((part): part is string => Boolean(part));
  return present.length > 0 ? present.join(separator) : null;
}

/**
 * "Request details" block for staff notifications: who sent the submission, as
 * far as the platform can tell. Every value comes from request headers the
 * sender controls, so all of it is escaped. The full record is stored privately.
 */
function requestDetailsBlock({ submissionId, meta }: RequestDetails): string {
  const received = new Date(meta.receivedAt);
  const melbourne = `${formatMelbourneDate(received, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}, ${formatMelbourneTime(received)} Melbourne time`;
  const { location, client, vercel } = meta;
  const place = joinPresent(
    [location.city, joinPresent([location.countryRegion, location.postalCode], " "), location.country],
    ", ",
  );
  const coordinates = location.latitude && location.longitude ? `${location.latitude}, ${location.longitude}` : null;

  const row = (label: string, value: string | null) => fieldRow(label, value ? escapeHtml(value) : "Not available");
  const rows =
    row("Submission ID", submissionId) +
    row("Received", `${melbourne} (${meta.receivedAt} UTC)`) +
    row("IP address", meta.ip) +
    row("X-Forwarded-For (raw)", meta.ipHeaders.xForwardedFor) +
    row("Location (approximate, from IP)", place) +
    row("Coordinates", coordinates) +
    row("IP timezone", location.timezone) +
    row("Browser", client.userAgent) +
    row("Language", client.language) +
    row("Referrer", client.referer) +
    row("Vercel request ID", vercel.requestId) +
    row("TLS fingerprint (JA4)", vercel.ja4Digest);

  return `<p style="margin:24px 0 8px;color:#6b7280;font-size:13px;font-weight:600">Request details</p>${detailsTable(rows)}<p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5">For staff only. Location is based on the IP address and is approximate. The full record is stored privately under the submission ID.</p>`;
}

/** The request details block, or nothing when the route didn't pass any. */
function optionalRequestDetails(details?: RequestDetails): string {
  return details ? requestDetailsBlock(details) : "";
}

// --- Contact Form ---

export function contactNotificationEmail(data: ContactFormData, details?: RequestDetails): { subject: string; html: string } {
  const rows = fieldRow("Name", `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`) + fieldRow("Email", escapeHtml(data.email), true) + fieldRow("Phone", data.phone ? escapeHtml(data.phone) : "Not provided") + fieldRow("Enquiry Type", `<strong>${escapeHtml(data.inquiryType)}</strong>`);
  return {
    subject: `New Contact Enquiry: ${data.inquiryType}`,
    html: adminLayout(`Contact Form - ${escapeHtml(data.inquiryType)}`, `<p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.5">A new enquiry has been submitted via the website contact form.</p>${detailsTable(rows)}${messageBox(data.message)}${optionalRequestDetails(details)}`),
  };
}

export function contactConfirmationEmail(data: ContactFormData): { subject: string; html: string } {
  const rows = fieldRow("Name", `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`) + fieldRow("Email", escapeHtml(data.email), true) + fieldRow("Phone", data.phone ? escapeHtml(data.phone) : "Not provided") + fieldRow("Enquiry Type", `<strong>${escapeHtml(data.inquiryType)}</strong>`);
  return {
    subject: "We've received your message - Australian Islamic Centre",
    html: confirmationLayout("Thanks for Getting in Touch", `<h2 style="margin:0 0 16px;color:${BLUE};font-size:18px">Assalamu Alaikum, ${escapeHtml(data.firstName)}!</h2><p style="color:#4b5563;line-height:1.6;margin:0 0 20px;font-size:14px">We've received your enquiry and will get back to you as soon as possible.</p><p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600">Your submission details</p>${detailsTable(rows)}${messageBox(data.message)}`),
  };
}

// --- Service Inquiry ---

export function serviceNotificationEmail(data: ServiceInquiryFormData, details?: RequestDetails): { subject: string; html: string } {
  const rows = fieldRow("Name", `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`) + fieldRow("Email", escapeHtml(data.email), true) + fieldRow("Phone", data.phone ? escapeHtml(data.phone) : "Not provided") + fieldRow("Service", `<strong>${escapeHtml(data.serviceName)}</strong>`);
  return {
    subject: `Service Inquiry: ${data.serviceName}`,
    html: adminLayout(`Service Inquiry - ${escapeHtml(data.serviceName)}`, `<p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.5">A new service inquiry has been submitted via the website.</p>${detailsTable(rows)}${messageBox(data.message)}${optionalRequestDetails(details)}`),
  };
}

export function serviceConfirmationEmail(data: ServiceInquiryFormData): { subject: string; html: string } {
  const rows = fieldRow("Name", `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`) + fieldRow("Email", escapeHtml(data.email), true) + fieldRow("Phone", data.phone ? escapeHtml(data.phone) : "Not provided") + fieldRow("Service", `<strong>${escapeHtml(data.serviceName)}</strong>`);
  return {
    subject: `We've received your inquiry about ${data.serviceName} - Australian Islamic Centre`,
    html: confirmationLayout(`${escapeHtml(data.serviceName)} Inquiry Received`, `<h2 style="margin:0 0 16px;color:${BLUE};font-size:18px">Assalamu Alaikum, ${escapeHtml(data.firstName)}!</h2><p style="color:#4b5563;line-height:1.6;margin:0 0 20px;font-size:14px">We've received your inquiry about <strong style="color:${BLUE}">${escapeHtml(data.serviceName)}</strong> and will get back to you as soon as possible.</p><p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600">Your submission details</p>${detailsTable(rows)}${messageBox(data.message)}`),
  };
}

// --- Event Inquiry ---

export function eventNotificationEmail(data: EventInquiryFormData, details?: RequestDetails): { subject: string; html: string } {
  const rows = fieldRow("Name", `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`) + fieldRow("Email", escapeHtml(data.email), true) + fieldRow("Phone", data.phone ? escapeHtml(data.phone) : "Not provided") + fieldRow("Event", `<strong>${escapeHtml(data.eventName)}</strong>`);
  return {
    subject: `Event Inquiry: ${data.eventName}`,
    html: adminLayout(`Event Inquiry - ${escapeHtml(data.eventName)}`, `<p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.5">A new event inquiry has been submitted via the website.</p>${detailsTable(rows)}${messageBox(data.message)}${optionalRequestDetails(details)}`),
  };
}

export function eventConfirmationEmail(data: EventInquiryFormData): { subject: string; html: string } {
  const rows = fieldRow("Name", `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`) + fieldRow("Email", escapeHtml(data.email), true) + fieldRow("Phone", data.phone ? escapeHtml(data.phone) : "Not provided") + fieldRow("Event", `<strong>${escapeHtml(data.eventName)}</strong>`);
  return {
    subject: `We've received your inquiry about ${data.eventName} - Australian Islamic Centre`,
    html: confirmationLayout(`${escapeHtml(data.eventName)} Inquiry Received`, `<h2 style="margin:0 0 16px;color:${BLUE};font-size:18px">Assalamu Alaikum, ${escapeHtml(data.firstName)}!</h2><p style="color:#4b5563;line-height:1.6;margin:0 0 20px;font-size:14px">We've received your inquiry about <strong style="color:${BLUE}">${escapeHtml(data.eventName)}</strong> and will get back to you as soon as possible.</p><p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600">Your submission details</p>${detailsTable(rows)}${messageBox(data.message)}`),
  };
}

// --- Newsletter Subscribe ---

export interface SubscribeData {
  email: string;
  name?: string;
  phone?: string;
  whatsapp?: boolean;
}

export function subscribeNotificationEmail(data: SubscribeData, details?: RequestDetails): { subject: string; html: string } {
  const rows = fieldRow("Email", escapeHtml(data.email), true) + (data.name ? fieldRow("Name", escapeHtml(data.name)) : "") + (data.phone ? fieldRow("Phone", escapeHtml(data.phone)) : "") + fieldRow("WhatsApp Group", data.whatsapp ? "Yes — wants to join" : "No");
  return {
    subject: `New Newsletter Subscriber: ${data.name || data.email}`,
    html: adminLayout("New Newsletter Subscriber", `<p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.5">A new subscriber has signed up for the AIC newsletter.</p>${detailsTable(rows)}${optionalRequestDetails(details)}`),
  };
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
