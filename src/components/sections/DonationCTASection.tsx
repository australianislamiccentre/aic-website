"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Check, Shield, Award, HandHeart } from "lucide-react";

const donationOptions = [
  { amount: 25, label: "Feed a Family", description: "Provide meals for a family in need" },
  { amount: 50, label: "Education Fund", description: "Support a student's learning journey" },
  { amount: 100, label: "Zakat", description: "Fulfill your zakat obligation" },
  { amount: 250, label: "Building Fund", description: "Contribute to centre maintenance" },
];

const impactStats = [
  { value: "5,000+", label: "Meals Served Annually" },
  { value: "200+", label: "Students Supported" },
  { value: "100%", label: "Goes to Charity" },
];

export function DonationCTASection() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Main content card */}
        <div className="rounded-3xl overflow-hidden border border-green-500/20">
          {/* Inner content */}
          <div className="bg-gradient-to-br from-neutral-800 via-neutral-850 to-neutral-900 overflow-hidden">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="donation-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#donation-pattern)" />
              </svg>
            </div>

            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Content */}
                <FadeIn direction="left">
                  <div>
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-lime-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/25">
                      <HandHeart className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      Your Generosity{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                        Transforms Lives
                      </span>
                    </h2>

                    <p className="text-base text-white/70 mb-8 leading-relaxed">
                      Every contribution helps us maintain our centre,
                      run educational programs, and support those in need.
                    </p>

                    {/* Impact stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {impactStats.map((stat) => (
                        <div key={stat.label} className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                            {stat.value}
                          </div>
                          <div className="text-white/50 text-xs mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-3">
                      {[
                        { icon: Shield, text: "Secure Payment" },
                        { icon: Award, text: "Tax Deductible" },
                        { icon: Check, text: "Registered Charity" },
                      ].map((badge) => (
                        <div
                          key={badge.text}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
                        >
                          <badge.icon className="w-3.5 h-3.5 text-lime-400" />
                          <span className="text-white/70 text-xs">{badge.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>

                {/* Right side - Donation selector */}
                <FadeIn direction="right" delay={0.2}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-6">Choose Your Impact</h3>

                    {/* Amount buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {donationOptions.map((option) => (
                        <button
                          key={option.amount}
                          onClick={() => setSelectedAmount(option.amount)}
                          className={`relative p-4 rounded-xl text-left transition-all duration-300 overflow-hidden ${
                            selectedAmount === option.amount
                              ? "bg-gradient-to-br from-green-500 to-lime-500 text-white shadow-lg shadow-green-500/25"
                              : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="relative">
                            <div className="text-2xl font-bold mb-1">${option.amount}</div>
                            <div className={`text-sm ${selectedAmount === option.amount ? "text-white/90" : "text-white/60"}`}>
                              {option.label}
                            </div>
                          </div>
                          {selectedAmount === option.amount && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-5 h-5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Selected option description */}
                    <AnimatePresence mode="wait">
                      {selectedAmount && (
                        <motion.div
                          key={selectedAmount}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                          <p className="text-white/70 text-sm">
                            {donationOptions.find(o => o.amount === selectedAmount)?.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <Button
                        href={`/donate?amount=${selectedAmount || 100}`}
                        variant="gold"
                        size="lg"
                        className="w-full justify-center"
                        icon={<ArrowRight className="w-5 h-5" />}
                      >
                        Donate ${selectedAmount || 100} Now
                      </Button>
                      <Button
                        href="/donate#recurring"
                        variant="outline"
                        size="lg"
                        className="w-full justify-center border-white/20 text-white hover:bg-white/10"
                        icon={<Sparkles className="w-5 h-5" />}
                      >
                        Set Up Monthly Giving
                      </Button>
                    </div>

                    {/* Custom amount link */}
                    <p className="text-center mt-4 text-white/50 text-sm">
                      Want to give a different amount?{" "}
                      <a href="/donate" className="text-lime-400 hover:text-lime-300 underline underline-offset-2">
                        Enter custom amount
                      </a>
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
