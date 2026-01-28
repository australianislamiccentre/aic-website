/**
 * Campaign utility functions for calculating status, billing, and validation
 */

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
 * Calculate the status of a campaign based on its dates
 */
export function getCampaignStatus(campaign: CampaignDates): CampaignStatus {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const startDate = campaign.startDate;
  const endDate = campaign.endDate;
  const isOngoing = campaign.isOngoing || !campaign.endDate;

  if (today < startDate) {
    const daysUntil = Math.ceil(
      (new Date(startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
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

  // Calculate remaining days including today and end date (inclusive)
  const endDateTime = new Date(endDate + "T23:59:59Z");
  const daysRemaining = Math.ceil(
    (endDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining <= 3) {
    return {
      status: "ending-soon",
      label: daysRemaining === 1 ? "Ends tomorrow" : `${daysRemaining} days left`,
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
 */
export function formatDateRange(
  startDate: string,
  endDate?: string,
  isOngoing?: boolean
): string {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

  const startStr = start.toLocaleDateString("en-AU", options);

  if (isOngoing || !endDate) {
    return `From ${startStr} (Ongoing)`;
  }

  const end = new Date(endDate);
  const endStr = end.toLocaleDateString("en-AU", {
    ...options,
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Calculate billing information for a campaign subscription
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
  const startDate = new Date(campaign.startDate + "T00:00:00Z");
  const endDate = campaign.endDate
    ? new Date(campaign.endDate + "T23:59:59Z")
    : null;

  let billingStartDate: Date;
  let isLateJoin = false;

  if (nowDate < startDate) {
    // Pre-signup: billing starts on campaign start date
    billingStartDate = startDate;
  } else {
    // Late join: billing starts tomorrow
    billingStartDate = new Date(nowDate);
    billingStartDate.setDate(billingStartDate.getDate() + 1);
    billingStartDate.setHours(0, 0, 0, 0);
    isLateJoin = true;
  }

  // Calculate remaining days from billing start to end (inclusive)
  // For ongoing campaigns, remainingDays is undefined
  let remainingDays: number | undefined;
  let totalAmount: number | undefined;

  if (endDate) {
    remainingDays =
      Math.ceil(
        (endDate.getTime() - billingStartDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

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
 */
export function isSignupOpen(campaign: CampaignDates): {
  isOpen: boolean;
  reason?: string;
} {
  const today = new Date().toISOString().split("T")[0];

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
