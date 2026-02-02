"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { donationFrequencies, donationAmounts } from "@/data/content";
import { SanityDonationCause } from "@/types/sanity";
import {
  Heart,
  Building,
  BookOpen,
  Gift,
  Users,
  Hammer,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";

const causeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building,
  book: BookOpen,
  heart: Heart,
  gift: Gift,
  hammer: Hammer,
  users: Users,
};

interface DonateFormProps {
  donationCauses: SanityDonationCause[];
}

function DonateForm({ donationCauses }: DonateFormProps) {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled");

  const [selectedCause, setSelectedCause] = useState(donationCauses[0]?._id || "general");
  const [selectedFrequency, setSelectedFrequency] = useState("once");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    anonymous: false,
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const parsedCustom = parseFloat(customAmount);
  const amount = customAmount && !isNaN(parsedCustom) ? parsedCustom : selectedAmount || 0;

  // Name validation - letters, spaces, hyphens, apostrophes only (supports international names)
  const isValidName = (name: string) => {
    // Allow letters (including accented), spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\s'-]+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2;
  };

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation - minimum 8 digits (allows Australian and international formats)
  const isValidPhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 8;
  };

  // Validate a single field and return error message
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (!isValidName(value)) return 'Please enter a valid first name (letters only, min 2 characters)';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (!isValidName(value)) return 'Please enter a valid last name (letters only, min 2 characters)';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!isValidEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!isValidPhone(value)) return 'Please enter a valid phone number (include country code if outside Australia)';
        return '';
      default:
        return '';
    }
  };

  // Handle field blur - validate and show error if touched
  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, donorInfo[field as keyof typeof donorInfo] as string);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle field change - clear error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    setDonorInfo(prev => ({ ...prev, [field]: value }));
    // Only validate if field was already touched
    if (touchedFields[field]) {
      const error = validateField(field, value);
      setFieldErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleDonate = async () => {
    // Validate amount
    if (amount < 1) {
      setError("Please enter a valid donation amount (minimum $1)");
      return;
    }

    // Mark all required fields as touched and validate them
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    requiredFields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, donorInfo[field as keyof typeof donorInfo] as string);
      newErrors[field] = error;
      if (error) hasErrors = true;
    });

    setTouchedFields(prev => ({ ...prev, ...newTouched }));
    setFieldErrors(prev => ({ ...prev, ...newErrors }));

    if (hasErrors) {
      setError("Please fix the errors above before continuing");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const causeTitle = donationCauses.find(c => c._id === selectedCause)?.title || "General Fund";

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          frequency: selectedFrequency,
          cause: selectedCause,
          causeTitle,
          donorInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Donation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const frequencyDescriptions: Record<string, string> = {
    once: "One-time gift",
    daily: "Give daily and earn continuous rewards",
    weekly: "Weekly contribution to our community",
    fortnightly: "Every two weeks",
    monthly: "Monthly recurring donation",
    quarterly: "Every three months",
    yearly: "Annual contribution",
  };

  const selectedCauseData = donationCauses.find(c => c._id === selectedCause);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="mb-8">
            <Breadcrumb />
          </div>
          <FadeIn>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-lime-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Support Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">Mission</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Your generosity helps us maintain our centre, run educational programs,
                and support those in need. Every contribution makes a difference.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tax Deductible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>100% Goes to Cause</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                {/* Step 1: Choose Cause */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Choose a Cause</h2>
                  </div>

                  {donationCauses.length === 0 ? (
                    <div className="p-6 rounded-xl border-2 border-teal-500 bg-teal-50">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-600 text-white">
                          <Heart className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">General Fund</h3>
                          <p className="text-sm text-gray-500">
                            Your donation will support the Australian Islamic Centre&apos;s operations and community programs.
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {donationCauses.map((cause) => {
                        const Icon = causeIcons[cause.icon] || Heart;
                        const isSelected = selectedCause === cause._id;

                        return (
                          <motion.button
                            key={cause._id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCause(cause._id)}
                            className={`p-5 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? "border-teal-500 bg-teal-50"
                                : "border-gray-200 hover:border-teal-200"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? "bg-teal-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{cause.title}</h3>
                                <p className="text-sm text-gray-500">{cause.description}</p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 2: Donation Frequency */}
                <div className="mb-12" id="recurring">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Donation Frequency</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {donationFrequencies.slice(0, 4).map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setSelectedFrequency(freq.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          selectedFrequency === freq.value
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-teal-200"
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{freq.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {donationFrequencies.slice(4).map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setSelectedFrequency(freq.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          selectedFrequency === freq.value
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-teal-200"
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{freq.label}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {frequencyDescriptions[selectedFrequency]}
                  </p>
                </div>

                {/* Step 3: Select Amount */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Select Amount</h2>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                    {donationAmounts.map((value) => (
                      <motion.button
                        key={value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAmountSelect(value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          selectedAmount === value
                            ? "border-teal-500 bg-teal-600 text-white"
                            : "border-gray-200 hover:border-teal-200"
                        }`}
                      >
                        <p className="text-lg font-bold">${value}</p>
                      </motion.button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-lg"
                    />
                  </div>
                </div>

                {/* Step 4: Your Details */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      placeholder="Enter your first name"
                      value={donorInfo.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      onBlur={() => handleFieldBlur('firstName')}
                      error={touchedFields.firstName ? fieldErrors.firstName : undefined}
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={donorInfo.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      onBlur={() => handleFieldBlur('lastName')}
                      error={touchedFields.lastName ? fieldErrors.lastName : undefined}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      value={donorInfo.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleFieldBlur('email')}
                      error={touchedFields.email ? fieldErrors.email : undefined}
                      required
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="e.g. 0400 000 000"
                      value={donorInfo.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      onBlur={() => handleFieldBlur('phone')}
                      error={touchedFields.phone ? fieldErrors.phone : undefined}
                      required
                    />
                  </div>

                  <div className="mt-6">
                    <Textarea
                      label="Message (Optional)"
                      placeholder="Leave a message with your donation..."
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                    />
                  </div>

                  <label className="flex items-center gap-3 mt-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={donorInfo.anonymous}
                      onChange={(e) => setDonorInfo({ ...donorInfo, anonymous: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-gray-700">Make my donation anonymous</span>
                  </label>
                </div>

                {/* Payment Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                      5
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                  </div>

                  {cancelled && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <p className="text-amber-800 text-sm">
                        Your donation was cancelled. Feel free to try again when you&apos;re ready.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Donation Amount</span>
                      <span className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Frequency</span>
                      <span className="text-gray-700 capitalize">{selectedFrequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500">Cause</span>
                      <span className="text-gray-700">
                        {selectedCauseData?.title || "General Fund"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="gold"
                    size="xl"
                    className="w-full"
                    disabled={isProcessing || amount < 1 || !donorInfo.email || !donorInfo.firstName.trim() || !donorInfo.lastName.trim() || !donorInfo.phone.trim()}
                    onClick={handleDonate}
                    icon={isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  >
                    {isProcessing
                      ? "Processing..."
                      : `Donate $${amount.toFixed(2)} ${selectedFrequency !== "once" ? selectedFrequency : ""}`
                    }
                  </Button>

                  <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <FadeIn>
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Impact</h3>
                  <div className="space-y-4">
                    {[
                      { amount: 25, impact: "Provides meals for a family for a week" },
                      { amount: 50, impact: "Sponsors a child's education for a month" },
                      { amount: 100, impact: "Supports community programs" },
                      { amount: 250, impact: "Contributes to facility maintenance" },
                      { amount: 500, impact: "Funds a scholarship for a student" },
                    ].map((item) => (
                      <div key={item.amount} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">${item.amount}</span>
                          <p className="text-sm text-gray-500">{item.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-neutral-800 to-sage-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-4">Why Donate With Us?</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Lock, text: "100% Secure Payments" },
                      { icon: CheckCircle2, text: "Tax Deductible Receipts" },
                      { icon: Heart, text: "100% Goes to Cause" },
                      { icon: Calendar, text: "Flexible Recurring Options" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-teal-400" />
                        <span className="text-white/90">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our donations team for assistance with your gift.
                  </p>
                  <Button href="/contact" variant="outline" size="sm" className="w-full">
                    Contact Us
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Other Ways to Give</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Beyond online donations, there are many ways you can support our mission.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Bank Transfer",
                description: "Make a direct bank transfer to our account.",
                details: "BSB: 000-000 | Account: 12345678",
              },
              {
                title: "In-Person",
                description: "Visit our centre and make a donation in person.",
                details: "23-27 Blenheim Rd, Newport VIC 3015",
              },
              {
                title: "Legacy Giving",
                description: "Include the centre in your will for lasting impact.",
                details: "Contact us for more information",
              },
            ].map((method) => (
              <StaggerItem key={method.title}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="p-8 bg-neutral-50 rounded-2xl"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <p className="text-sm text-teal-600 font-medium">{method.details}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}

interface DonateContentProps {
  donationCauses: SanityDonationCause[];
}

export default function DonateContent({ donationCauses }: DonateContentProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DonateForm donationCauses={donationCauses} />
    </Suspense>
  );
}
