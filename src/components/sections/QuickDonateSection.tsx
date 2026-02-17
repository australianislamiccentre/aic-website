"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  Heart,
  ArrowRight,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// Hadith/Quran quotes about charity
const charityQuotes = [
  {
    text: "The example of those who spend their wealth in the way of Allah is like a seed of grain that sprouts seven ears; in every ear there are a hundred grains.",
    source: "Quran 2:261",
  },
  {
    text: "Charity does not decrease wealth.",
    source: "Sahih Muslim",
  },
  {
    text: "Protect yourself from Hellfire even with half a date in charity.",
    source: "Sahih Bukhari",
  },
  {
    text: "The believer's shade on the Day of Resurrection will be their charity.",
    source: "Tirmidhi",
  },
  {
    text: "Give charity without delay, for it stands in the way of calamity.",
    source: "Tirmidhi",
  },
];

// Quick donation amounts
const quickAmounts = [25, 50, 100, 250];

export function QuickDonateSection() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Rotate quotes every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % charityQuotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const parsedCustom = parseFloat(customAmount);
  const amount = customAmount && !isNaN(parsedCustom) ? parsedCustom : selectedAmount || 0;

  // Validation functions
  const isValidName = (name: string) => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\s'-]+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (!isValidName(value)) return "Please enter a valid name";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!isValidName(value)) return "Please enter a valid name";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email";
        return "";
      default:
        return "";
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, donorInfo[field as keyof typeof donorInfo]);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setDonorInfo((prev) => ({ ...prev, [field]: value }));
    if (touchedFields[field]) {
      const error = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleQuickDonate = async () => {
    if (amount < 1) {
      setError("Please select a donation amount");
      return;
    }

    // Validate all fields
    const requiredFields = ["firstName", "lastName", "email"];
    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    requiredFields.forEach((field) => {
      newTouched[field] = true;
      const error = validateField(field, donorInfo[field as keyof typeof donorInfo]);
      newErrors[field] = error;
      if (error) hasErrors = true;
    });

    setTouchedFields((prev) => ({ ...prev, ...newTouched }));
    setFieldErrors((prev) => ({ ...prev, ...newErrors }));

    if (hasErrors) {
      setError("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          frequency: "once",
          cause: "general",
          causeTitle: "General Fund",
          donorInfo: {
            ...donorInfo,
            phone: "",
            anonymous: false,
            message: "",
          },
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
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    setError(null);
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Quote & Links */}
          <FadeIn className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-lime-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Quick <span className="text-lime-400">Donate</span>
              </h2>
            </div>

            {/* Rotating Quote */}
            <div className="min-h-[120px] md:min-h-[100px] flex items-center mb-6">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-white/70 italic"
                >
                  <p className="text-base md:text-lg mb-2">
                    &ldquo;{charityQuotes[currentQuoteIndex].text}&rdquo;
                  </p>
                  <footer className="text-lime-400 text-sm font-medium">
                    — {charityQuotes[currentQuoteIndex].source}
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-white/50 mb-6">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tax Deductible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% to Cause</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link
                href="/donate"
                className="inline-flex items-center gap-1.5 text-sm text-lime-400 hover:text-lime-300 transition-colors"
              >
                View All Donation Options
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          {/* Right: Quick Donate Form */}
          <FadeIn delay={0.1}>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
                  {/* Amount Selection */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-white/70 mb-3">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {quickAmounts.map((value) => (
                        <motion.button
                          key={value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAmountSelect(value)}
                          className={`py-3 rounded-xl text-center font-bold transition-all ${
                            selectedAmount === value
                              ? "bg-lime-500 text-neutral-900"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          ${value}
                        </motion.button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Custom amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="space-y-3 mb-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="First Name *"
                          value={donorInfo.firstName}
                          onChange={(e) => handleFieldChange("firstName", e.target.value)}
                          onBlur={() => handleFieldBlur("firstName")}
                          className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent ${
                            touchedFields.firstName && fieldErrors.firstName
                              ? "border-red-500"
                              : "border-white/10"
                          }`}
                        />
                        {touchedFields.firstName && fieldErrors.firstName && (
                          <p className="mt-1 text-xs text-red-400">{fieldErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Last Name *"
                          value={donorInfo.lastName}
                          onChange={(e) => handleFieldChange("lastName", e.target.value)}
                          onBlur={() => handleFieldBlur("lastName")}
                          className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent ${
                            touchedFields.lastName && fieldErrors.lastName
                              ? "border-red-500"
                              : "border-white/10"
                          }`}
                        />
                        {touchedFields.lastName && fieldErrors.lastName && (
                          <p className="mt-1 text-xs text-red-400">{fieldErrors.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={donorInfo.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        onBlur={() => handleFieldBlur("email")}
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent ${
                          touchedFields.email && fieldErrors.email
                            ? "border-red-500"
                            : "border-white/10"
                        }`}
                      />
                      {touchedFields.email && fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="button"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={isProcessing || amount < 1}
                    onClick={handleQuickDonate}
                    icon={
                      isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Heart className="w-5 h-5" />
                      )
                    }
                  >
                    {isProcessing ? "Processing..." : `Donate $${amount.toFixed(2)}`}
                  </Button>

                  <p className="text-center text-xs text-white/40 mt-3">
                    Secure payment powered by Stripe
                  </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
