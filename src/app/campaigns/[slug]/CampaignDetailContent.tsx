"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Moon,
  Heart,
  Star,
  Gift,
  Calendar,
  Sunrise,
  Sun,
  Sparkles,
  ArrowLeft,
  Clock,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { SanityDonationCampaign, CampaignSubscriptionResponse } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { PortableText } from "@portabletext/react";
import {
  getMelbourneToday,
  getDaysDifference,
  formatDateRange as formatDateRangeUtil,
} from "@/lib/campaign-utils";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon,
  Heart,
  Star,
  Gift,
  Calendar,
  Sunrise,
  Sun,
  Sparkles,
};

interface CampaignDetailContentProps {
  campaign: SanityDonationCampaign;
}

function getCampaignStatus(campaign: SanityDonationCampaign): {
  status: "upcoming" | "active" | "ending-soon" | "ended" | "signup-not-open" | "ongoing";
  label: string;
  color: string;
  canSignup: boolean;
} {
  // Use Melbourne timezone for all date comparisons
  const today = getMelbourneToday();
  const isOngoing = campaign.isOngoing || !campaign.endDate;

  // Check signup window
  if (campaign.signupStartDate && campaign.signupStartDate > today) {
    const daysUntil = getDaysDifference(today, campaign.signupStartDate);
    return {
      status: "signup-not-open",
      label: daysUntil === 1 ? "Signup opens tomorrow" : `Signup opens in ${daysUntil} days`,
      color: "bg-purple-100 text-purple-700",
      canSignup: false,
    };
  }

  // For time-bound campaigns, check if signup has closed
  const signupEnd = campaign.signupEndDate || campaign.endDate;
  if (signupEnd && signupEnd < today) {
    return {
      status: "ended",
      label: "Signup closed",
      color: "bg-gray-100 text-gray-600",
      canSignup: false,
    };
  }

  // For time-bound campaigns, check if campaign has ended
  if (campaign.endDate && today > campaign.endDate) {
    return {
      status: "ended",
      label: "Campaign ended",
      color: "bg-gray-100 text-gray-600",
      canSignup: false,
    };
  }

  if (today < campaign.startDate) {
    const daysUntil = getDaysDifference(today, campaign.startDate);
    return {
      status: "upcoming",
      label: daysUntil === 1 ? "Starts tomorrow" : `Starts in ${daysUntil} days`,
      color: "bg-blue-100 text-blue-700",
      canSignup: true,
    };
  }

  // For ongoing campaigns
  if (isOngoing) {
    return {
      status: "ongoing",
      label: "Ongoing",
      color: "bg-teal-100 text-teal-700",
      canSignup: true,
    };
  }

  // Calculate remaining days including today (today to endDate inclusive)
  const daysRemaining = getDaysDifference(today, campaign.endDate!) + 1;

  if (daysRemaining <= 3) {
    return {
      status: "ending-soon",
      label: daysRemaining === 1 ? "Ends today" : `${daysRemaining} days left`,
      color: "bg-amber-100 text-amber-700",
      canSignup: true,
    };
  }

  return {
    status: "active",
    label: `${daysRemaining} days remaining`,
    color: "bg-green-100 text-green-700",
    canSignup: true,
  };
}

function calculateBillingInfo(campaign: SanityDonationCampaign): {
  totalDays: number | null;
  remainingDays: number | null;
  isLateJoin: boolean;
  billingStartDate: string;
  isOngoing: boolean;
} {
  // Use Melbourne timezone for all date comparisons
  const today = getMelbourneToday();
  const isOngoing = campaign.isOngoing || !campaign.endDate;

  // For ongoing campaigns, no end date calculations
  if (isOngoing) {
    let billingStartStr: string;
    let isLateJoin = false;

    if (today < campaign.startDate) {
      billingStartStr = campaign.startDate;
    } else {
      // Late join: billing starts tomorrow (Melbourne time)
      // Parse today's date and add 1 day
      const [year, month, day] = today.split("-").map(Number);
      const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1));
      billingStartStr = getMelbourneToday(tomorrowDate);
      isLateJoin = true;
    }

    return {
      totalDays: null,
      remainingDays: null,
      isLateJoin,
      billingStartDate: billingStartStr,
      isOngoing: true,
    };
  }

  // Time-bound campaign calculations
  // Total days from start to end (inclusive)
  const totalDays = getDaysDifference(campaign.startDate, campaign.endDate!) + 1;

  let billingStartStr: string;
  let isLateJoin = false;

  if (today < campaign.startDate) {
    billingStartStr = campaign.startDate;
  } else {
    // Late join: billing starts tomorrow (Melbourne time)
    const [year, month, day] = today.split("-").map(Number);
    const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1));
    billingStartStr = getMelbourneToday(tomorrowDate);
    isLateJoin = true;
  }

  // Remaining days from billing start to end (inclusive)
  const remainingDays = getDaysDifference(billingStartStr, campaign.endDate!) + 1;

  return {
    totalDays,
    remainingDays: Math.max(0, remainingDays),
    isLateJoin,
    billingStartDate: billingStartStr,
    isOngoing: false,
  };
}

function formatDate(dateStr: string): string {
  // Parse the date string and format in Melbourne timezone
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Noon UTC to avoid timezone edge cases
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  });
}

// Use the shared formatDateRange utility for consistency
function formatDateRangeLocal(startDate: string, endDate?: string, isOngoing?: boolean): string {
  return formatDateRangeUtil(startDate, endDate, isOngoing);
}

export default function CampaignDetailContent({ campaign }: CampaignDetailContentProps) {
  const searchParams = useSearchParams();
  const wasCancelled = searchParams.get("cancelled") === "true";

  const IconComponent = iconMap[campaign.icon || "Moon"] || Moon;
  const { status, label, color, canSignup } = getCampaignStatus(campaign);
  const billingInfo = calculateBillingInfo(campaign);

  // Form state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [billingType, setBillingType] = useState<"daily" | "upfront">("daily");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    anonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progress calculation
  const progress =
    campaign.goal && campaign.raised
      ? Math.min((campaign.raised / campaign.goal) * 100, 100)
      : 0;

  // Effective daily amount (selected preset or custom)
  const effectiveAmount =
    selectedAmount ??
    (customAmount ? parseFloat(customAmount) : null);

  // For ongoing campaigns, no total commitment (it's unlimited)
  const totalCommitment = effectiveAmount && billingInfo.remainingDays
    ? effectiveAmount * billingInfo.remainingDays
    : null;

  // Clear cancelled message after viewing
  useEffect(() => {
    if (wasCancelled) {
      const timer = setTimeout(() => {
        window.history.replaceState(null, "", window.location.pathname);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [wasCancelled]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    const formatted = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;
    setCustomAmount(formatted);
    setSelectedAmount(null);
    setError(null);
  };

  // Active validation on blur for custom amount
  const handleCustomAmountBlur = () => {
    if (!customAmount) return;

    const amount = parseFloat(customAmount);
    if (isNaN(amount)) {
      setCustomAmount("");
      return;
    }

    if (amount < campaign.minimumAmount) {
      setError(`Minimum daily amount is $${campaign.minimumAmount}. Amount adjusted.`);
      setCustomAmount(campaign.minimumAmount.toString());
    } else if (campaign.maximumAmount && amount > campaign.maximumAmount) {
      setError(`Maximum daily amount is $${campaign.maximumAmount}. Amount adjusted.`);
      setCustomAmount(campaign.maximumAmount.toString());
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!effectiveAmount) {
      return "Please select or enter a daily donation amount";
    }

    if (effectiveAmount < campaign.minimumAmount) {
      return `Minimum daily amount is $${campaign.minimumAmount}`;
    }

    if (campaign.maximumAmount && effectiveAmount > campaign.maximumAmount) {
      return `Maximum daily amount is $${campaign.maximumAmount}`;
    }

    if (!campaign.allowCustomAmount && customAmount) {
      return "Please select one of the preset amounts";
    }

    if (!formData.firstName.trim()) {
      return "First name is required";
    }

    if (!formData.lastName.trim()) {
      return "Last name is required";
    }

    if (!formData.email.trim()) {
      return "Email address is required";
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/create-campaign-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug: campaign.slug,
          dailyAmount: effectiveAmount,
          billingType,
          donorInfo: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || undefined,
            message: formData.message.trim() || undefined,
            anonymous: formData.anonymous,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      const result = data as CampaignSubscriptionResponse;

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${color}`}>
                {label}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {campaign.title}
            </h1>
            <p className="text-gray-600 max-w-2xl mb-4">{campaign.description}</p>
            <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>
                  {formatDateRangeLocal(campaign.startDate, campaign.endDate, billingInfo.isOngoing)}
                </span>
              </div>
              {!billingInfo.isOngoing && billingInfo.totalDays && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{billingInfo.totalDays} days total</span>
                </div>
              )}
              {campaign.subscriberCount !== undefined && campaign.subscriberCount > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>{campaign.subscriberCount} donors</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cancelled Notice */}
      {wasCancelled && (
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-800">
                Your signup was cancelled. Feel free to try again when you&apos;re ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-8">
            {/* Left Column - Campaign Details */}
            <div className="lg:col-span-3 space-y-8">
              {/* Campaign Image */}
              {campaign.image && (
                <FadeIn>
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={urlFor(campaign.image).width(800).height(450).url()}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </FadeIn>
              )}

              {/* Progress (if goal exists) */}
              {campaign.goal && (
                <FadeIn delay={0.1}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Campaign Progress</h3>
                      </div>
                      <span className="text-sm font-medium text-teal-600">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-teal-500 to-lime-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">
                          ${campaign.raised?.toLocaleString() || 0}
                        </span>{" "}
                        raised
                      </span>
                      <span className="text-gray-500">
                        ${campaign.goal.toLocaleString()} goal
                      </span>
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Full Description */}
              {campaign.fullDescription && (
                <FadeIn delay={0.2}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">About This Campaign</h3>
                    <div className="prose prose-gray max-w-none">
                      <PortableText value={campaign.fullDescription} />
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* How It Works - Only show for campaigns where signup is still open */}
              {canSignup && (
                <FadeIn delay={0.3}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-6">How It Works</h3>
                    <StaggerContainer className="space-y-4">
                      <StaggerItem>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-teal-600">1</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Choose your daily amount</p>
                            <p className="text-sm text-gray-600">
                              Select how much you&apos;d like to donate each day
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                      <StaggerItem>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-lime-600">2</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Complete your signup</p>
                            <p className="text-sm text-gray-600">
                              Enter your details and payment information securely via Stripe
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                      <StaggerItem>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-green-600">3</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Daily donations processed</p>
                            <p className="text-sm text-gray-600">
                              {billingInfo.isOngoing
                                ? "Your donation is automatically charged daily. Cancel anytime by contacting us."
                                : "Your donation is automatically charged daily until the campaign ends. Cancel anytime."}
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                    </StaggerContainer>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* Right Column - Signup Form */}
            <div className="lg:col-span-2">
              <FadeIn delay={0.2}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 sticky top-24">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">
                      {canSignup ? "Join This Campaign" : "Campaign Information"}
                    </h3>
                    {billingInfo.isLateJoin && canSignup && !billingInfo.isOngoing && billingInfo.remainingDays && (
                      <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Late join: {billingInfo.remainingDays} days remaining
                      </p>
                    )}
                    {billingInfo.isOngoing && canSignup && (
                      <p className="text-sm text-teal-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Ongoing daily donation - cancel anytime
                      </p>
                    )}
                  </div>

                  {canSignup ? (
                    <div className="p-6 space-y-6">
                      {/* Amount Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Daily Donation Amount
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {campaign.presetAmounts.map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => handleAmountSelect(amount)}
                              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                                selectedAmount === amount
                                  ? "bg-teal-600 text-white ring-2 ring-teal-600 ring-offset-2"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              ${amount}
                            </button>
                          ))}
                        </div>

                        {campaign.allowCustomAmount && (
                          <div className="mt-3">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                $
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Custom amount"
                                value={customAmount}
                                onChange={(e) => handleCustomAmountChange(e.target.value)}
                                onBlur={handleCustomAmountBlur}
                                className={`w-full pl-8 pr-4 py-3 rounded-lg border transition-all ${
                                  customAmount
                                    ? "border-teal-500 ring-2 ring-teal-500 ring-offset-2"
                                    : "border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                                }`}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Min: ${campaign.minimumAmount}
                              {campaign.maximumAmount && ` | Max: $${campaign.maximumAmount}`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Billing Type Selection - Only show for time-bound campaigns */}
                      {effectiveAmount && !billingInfo.isOngoing && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Payment Option
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setBillingType("daily")}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                billingType === "daily"
                                  ? "border-teal-500 bg-teal-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-teal-600" />
                                <span className="font-medium text-sm">Daily</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                ${effectiveAmount?.toFixed(2)}/day
                              </p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillingType("upfront")}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                billingType === "upfront"
                                  ? "border-teal-500 bg-teal-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-teal-600" />
                                <span className="font-medium text-sm">Pay Upfront</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                ${totalCommitment?.toFixed(2)} total
                              </p>
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {billingType === "daily"
                              ? "You'll be charged daily throughout the campaign"
                              : "Pay the full amount now in one payment"}
                          </p>
                        </div>
                      )}

                      {/* Commitment Summary */}
                      {effectiveAmount && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-gradient-to-br from-teal-50 to-lime-50 rounded-lg p-4 border border-teal-100"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-teal-600" />
                            <span className="font-medium text-teal-800">Your Commitment</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Daily amount</span>
                              <span className="font-medium">${effectiveAmount.toFixed(2)}</span>
                            </div>
                            {billingInfo.isOngoing ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Duration</span>
                                  <span className="font-medium">Ongoing (cancel anytime)</span>
                                </div>
                                <div className="border-t border-teal-200 pt-1 mt-1">
                                  <p className="text-xs text-gray-500">
                                    You&apos;ll be charged ${effectiveAmount.toFixed(2)} daily until you cancel.
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    {billingInfo.isLateJoin ? "Remaining days" : "Total days"}
                                  </span>
                                  <span className="font-medium">{billingInfo.remainingDays}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Payment type</span>
                                  <span className="font-medium">
                                    {billingType === "daily" ? "Daily charges" : "One-time payment"}
                                  </span>
                                </div>
                                <div className="border-t border-teal-200 pt-1 mt-1">
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-teal-800">Total</span>
                                    <span className="font-bold text-teal-800">
                                      ${totalCommitment?.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Donor Info */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message (Optional)
                          </label>
                          <textarea
                            value={formData.message}
                            onChange={(e) => handleInputChange("message", e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                            placeholder="Add a personal message..."
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.anonymous}
                            onChange={(e) => handleInputChange("anonymous", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-600">
                            Make my donation anonymous
                          </span>
                        </label>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        variant="gold"
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        icon={
                          isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )
                        }
                      >
                        {isSubmitting
                          ? "Processing..."
                          : billingInfo.isOngoing && effectiveAmount
                          ? `Start Daily Donation - $${effectiveAmount.toFixed(2)}/day`
                          : totalCommitment
                          ? `Continue to Payment - $${totalCommitment.toFixed(2)} total`
                          : "Select an Amount"}
                      </Button>

                      {/* Required fields hint when form is incomplete */}
                      {(!effectiveAmount ||
                        !formData.firstName.trim() ||
                        !formData.lastName.trim() ||
                        !formData.email.trim()) && (
                        <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Please fill in all required fields to continue
                        </p>
                      )}

                      <p className="text-xs text-gray-500 text-center">
                        Secure payment powered by Stripe. Cancel anytime.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {status === "ended" ? "Campaign Ended" : "Signup Not Open Yet"}
                        </h4>
                        <p className="text-sm text-gray-600 mb-6">
                          {status === "ended"
                            ? "This campaign has concluded. Thank you to all who participated."
                            : `Signup opens on ${formatDate(campaign.signupStartDate!)}`}
                        </p>
                        <Link href="/campaigns">
                          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                            View Other Campaigns
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
