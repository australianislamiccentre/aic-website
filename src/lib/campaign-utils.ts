/**
 * Campaign utility functions for calculating status, billing, and validation
 *
 * IMPORTANT: All date calculations use Melbourne timezone (Australia/Melbourne).
 * This ensures campaigns go live at 12:00 AM Melbourne time regardless of the
 * user's local timezone.
 */

const MELBOURNE_TIMEZONE = "Australia/Melbourne";

export interface CampaignDates {
  startDate: string;
  endDate?: string;
  isOngoing?: boolean;
  signupStartDate?: string;
  signupEndDate?: string;
}

export interface CampaignStatus {
  status: "upcoming" | "active" | "ending-soon" | "ended" | "ongoing";
  label: string;
  color: string;
}

/**
 * Get the current date in Melbourne timezone as YYYY-MM-DD string
 */
export function getMelbourneToday(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: MELBOURNE_TIMEZONE });
}

/**
 * Get Melbourne date components from a Date object
 */
export function getMelbourneDateComponents(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const formatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: MELBOURNE_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(date);
  return {
    year: parseInt(parts.find(p => p.type === "year")?.value || "0"),
    month: parseInt(parts.find(p => p.type === "month")?.value || "0"),
    day: parseInt(parts.find(p => p.type === "day")?.value || "0"),
  };
}

/**
 * Convert a date string (YYYY-MM-DD) to a Date at midnight Melbourne time
 * This ensures "2025-01-30" means 12:00 AM on Jan 30 in Melbourne
 */
export function toMelbourneMidnight(dateStr: string): Date {
  // Parse the date string
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create a date in Melbourne timezone by finding the UTC offset
  // We create a date and adjust to ensure it represents Melbourne midnight
  const tempDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  // Calculate offset by comparing UTC midnight to Melbourne time
  // Melbourne is UTC+10 (AEST) or UTC+11 (AEDT)
  const offset = getMelbourneOffset(tempDate);

  // Return the UTC time that represents Melbourne midnight
  return new Date(Date.UTC(year, month - 1, day, -offset, 0, 0));
}

/**
 * Get Melbourne timezone offset in hours (handles DST)
 */
function getMelbourneOffset(date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const melbourneDate = new Date(date.toLocaleString("en-US", { timeZone: MELBOURNE_TIMEZONE }));
  return (melbourneDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate days between two dates in Melbourne timezone
 */
export function getDaysDifference(
  fromDate: string,
  toDate: string
): number {
  const from = toMelbourneMidnight(fromDate);
  const to = toMelbourneMidnight(toDate);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate the status of a campaign based on its dates
 * All comparisons use Melbourne timezone
 */
export function getCampaignStatus(campaign: CampaignDates): CampaignStatus {
  const today = getMelbourneToday();
  const startDate = campaign.startDate;
  const endDate = campaign.endDate;
  const isOngoing = campaign.isOngoing || !campaign.endDate;

  if (today < startDate) {
    const daysUntil = getDaysDifference(today, startDate);
    return {
      status: "upcoming",
      label: daysUntil === 1 ? "Starts tomorrow" : `Starts in ${daysUntil} days`,
      color: "bg-blue-100 text-blue-700",
    };
  }

  // For time-bound campaigns only
  if (endDate && today > endDate) {
    return {
      status: "ended",
      label: "Ended",
      color: "bg-gray-100 text-gray-600",
    };
  }

  // Ongoing campaigns
  if (isOngoing) {
    return {
      status: "ongoing",
      label: "Ongoing",
      color: "bg-teal-100 text-teal-700",
    };
  }

  // Calculate remaining days including today (today to endDate inclusive)
  const daysRemaining = getDaysDifference(today, endDate!) + 1;

  if (daysRemaining <= 3) {
    return {
      status: "ending-soon",
      label: daysRemaining === 1 ? "Ends today" : `${daysRemaining} days left`,
      color: "bg-amber-100 text-amber-700",
    };
  }

  return {
    status: "active",
    label: `${daysRemaining} days remaining`,
    color: "bg-green-100 text-green-700",
  };
}

/**
 * Format a date range for display
 * Uses Melbourne timezone for consistency
 */
export function formatDateRange(
  startDate: string,
  endDate?: string,
  isOngoing?: boolean
): string {
  // Parse dates as Melbourne midnight to ensure correct display
  const start = toMelbourneMidnight(startDate);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: MELBOURNE_TIMEZONE,
  };

  const startStr = start.toLocaleDateString("en-AU", options);

  if (isOngoing || !endDate) {
    return `From ${startStr} (Ongoing)`;
  }

  const end = toMelbourneMidnight(endDate);
  const endStr = end.toLocaleDateString("en-AU", {
    ...options,
    year: "numeric",
    timeZone: MELBOURNE_TIMEZONE,
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Calculate billing information for a campaign subscription
 * All calculations use Melbourne timezone
 */
export interface BillingInfo {
  billingStartDate: Date;
  isLateJoin: boolean;
  remainingDays?: number;
  totalAmount?: number;
}

export function calculateBillingInfo(
  campaign: CampaignDates,
  dailyAmount: number,
  nowDate: Date = new Date()
): BillingInfo {
  const today = getMelbourneToday(nowDate);
  const campaignStart = campaign.startDate;

  let billingStartDate: Date;
  let billingStartStr: string;
  let isLateJoin = false;

  if (today < campaignStart) {
    // Pre-signup: billing starts on campaign start date (Melbourne midnight)
    billingStartDate = toMelbourneMidnight(campaignStart);
    billingStartStr = campaignStart;
  } else {
    // Late join: billing starts tomorrow (Melbourne time)
    isLateJoin = true;
    const { year, month, day } = getMelbourneDateComponents(nowDate);
    // Create tomorrow's date
    const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
    billingStartStr = getMelbourneToday(tomorrow);
    billingStartDate = toMelbourneMidnight(billingStartStr);
  }

  // Calculate remaining days from billing start to end (inclusive)
  // For ongoing campaigns, remainingDays is undefined
  let remainingDays: number | undefined;
  let totalAmount: number | undefined;

  if (campaign.endDate) {
    remainingDays = getDaysDifference(billingStartStr, campaign.endDate) + 1;

    if (remainingDays > 0) {
      totalAmount = dailyAmount * remainingDays;
    }
  }

  return {
    billingStartDate,
    isLateJoin,
    remainingDays,
    totalAmount,
  };
}

/**
 * Check if signup is open for a campaign
 * Uses Melbourne timezone for all date comparisons
 */
export function isSignupOpen(campaign: CampaignDates): {
  isOpen: boolean;
  reason?: string;
} {
  const today = getMelbourneToday();

  if (campaign.signupStartDate && campaign.signupStartDate > today) {
    return {
      isOpen: false,
      reason: `Signup opens on ${campaign.signupStartDate}`,
    };
  }

  // For ongoing campaigns, only check signupEndDate if it exists
  // For time-bound campaigns, fallback to endDate
  const signupEnd = campaign.signupEndDate || campaign.endDate;
  if (signupEnd && signupEnd < today) {
    return {
      isOpen: false,
      reason: "Signup for this campaign has closed",
    };
  }

  return { isOpen: true };
}

/**
 * Validate a donation amount against campaign settings
 */
export interface AmountValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAmount(
  amount: number,
  minimumAmount: number,
  maximumAmount?: number,
  presetAmounts?: number[],
  allowCustomAmount?: boolean
): AmountValidationResult {
  if (isNaN(amount) || amount < minimumAmount) {
    return {
      isValid: false,
      error: `Minimum daily amount is $${minimumAmount}`,
    };
  }

  if (maximumAmount && amount > maximumAmount) {
    return {
      isValid: false,
      error: `Maximum daily amount is $${maximumAmount}`,
    };
  }

  // Validate against preset amounts if custom not allowed
  if (
    !allowCustomAmount &&
    presetAmounts &&
    !presetAmounts.includes(amount)
  ) {
    return {
      isValid: false,
      error: "Please select a valid preset amount",
    };
  }

  return { isValid: true };
}

/**
 * Sanitize strings to remove hidden Unicode characters
 * (prevents Stripe metadata limit issues)
 */
export function sanitizeMetadata(str: string | undefined): string {
  if (!str) return "";
  // Remove non-printable ASCII characters and trim
  return str.replace(/[^\x20-\x7E]/g, "").trim().slice(0, 500);
}
