"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import Link from "next/link";
import { ModalCampaign, DonationGoalMeter } from "@/sanity/lib/fetch";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalTitle?: string;
  goalMeter?: DonationGoalMeter | null;
  featuredCampaign?: ModalCampaign | null;
  additionalCampaigns?: ModalCampaign[];
}

export function DonateModal({
  isOpen,
  onClose,
  modalTitle = "Support Our Centre",
  goalMeter,
  featuredCampaign,
  additionalCampaigns = [],
}: DonateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close when clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Clean Fundraise Up element code of hidden Unicode characters
  const cleanElementCode = (code: string) => {
    return code.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  };

  const hasCampaigns = featuredCampaign || (additionalCampaigns && additionalCampaigns.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalTitle}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {hasCampaigns ? (
                <div className="space-y-4">
                  {/* Overall Goal Meter (Fundraise Up Element) */}
                  {goalMeter?.enabled && goalMeter?.fundraiseUpElement && (
                    <div
                      className="fundraise-up-goal-meter mb-4"
                      dangerouslySetInnerHTML={{
                        __html: cleanElementCode(goalMeter.fundraiseUpElement),
                      }}
                    />
                  )}

                  {/* Featured Campaign - integrated title header */}
                  {featuredCampaign && (
                    <div className="w-[300px] mx-auto rounded-xl overflow-hidden shadow-sm">
                      {/* Title bar - matches Fundraise Up widget header */}
                      <div className="bg-[#1a5d57] px-4 py-2.5">
                        <h3 className="text-white text-sm font-semibold text-center leading-snug">
                          {featuredCampaign.title}
                        </h3>
                      </div>
                      {/* Fundraise Up Element */}
                      <div
                        className="fundraise-up-wrapper"
                        dangerouslySetInnerHTML={{
                          __html: cleanElementCode(featuredCampaign.fundraiseUpElement),
                        }}
                      />
                    </div>
                  )}

                  {/* Additional Campaigns */}
                  {additionalCampaigns && additionalCampaigns.length > 0 && (
                    <>
                      {featuredCampaign && (
                        <div className="relative py-3">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-3 bg-white text-xs text-gray-400 uppercase tracking-wide">
                              More Campaigns
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap justify-center gap-4">
                        {additionalCampaigns.map((campaign) => (
                          <div
                            key={campaign._id}
                            className="w-[300px] rounded-xl overflow-hidden shadow-sm"
                          >
                            {/* Title bar */}
                            <div className="bg-[#1a5d57] px-4 py-2">
                              <p className="text-white text-xs font-medium text-center leading-snug">
                                {campaign.title}
                              </p>
                            </div>
                            {/* Fundraise Up Element */}
                            <div
                              className="fundraise-up-wrapper"
                              dangerouslySetInnerHTML={{
                                __html: cleanElementCode(campaign.fundraiseUpElement),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Fallback when no campaigns configured
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Support Our Community
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Your generosity helps us maintain our mosque and support community programs.
                  </p>
                  <Link
                    href="/donate"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    View Donation Options
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            {hasCampaigns && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <Link
                  href="/donate"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  View all donation options →
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
