/**
 * Donate Content
 *
 * Client component rendering the donation page UI. Sanitises FundraiseUp
 * element codes from Sanity, displays campaign cards, and embeds the
 * FundraiseUp donation widget for secure online giving.
 *
 * @module app/donate/DonateContent
 */
"use client";

import Image from "next/image";
import { Heart, Sparkles } from "lucide-react";
import type { DonatePageSettings, DonatePageCampaign } from "@/sanity/lib/fetch";

interface DonateContentProps {
  settings?: DonatePageSettings | null;
}

// Clean Fundraise Up element code of hidden Unicode characters and strip dangerous HTML
const cleanElementCode = (code: string) => {
  return code.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
};

/**
 * Sanitise FundraiseUp element code from Sanity.
 * Expected format: an anchor tag with data-fundraiseup attributes.
 * Strips <script>, <iframe>, event handlers (onerror, onload, etc.), and javascript: URLs.
 */
const sanitizeFundraiseUpElement = (code: string): string => {
  let cleaned = cleanElementCode(code);
  // Remove <script> and <iframe> tags and their content
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<iframe[^>]*\/?>/gi, "");
  // Remove inline event handlers (onclick, onerror, onload, onmouseover, etc.)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  // Remove javascript: URLs
  cleaned = cleaned.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');
  return cleaned;
};

export default function DonateContent({ settings }: DonateContentProps) {
  const enabledCampaigns = (settings?.campaigns || []).filter(
    (c) => c.enabled !== false && c.fundraiseUpElement
  );

  const showGoal = settings?.goalEnabled && settings?.goalElement;
  const showForm = settings?.formEnabled && settings?.formElement;
  const showDonorList = settings?.donorListEnabled && settings?.donorListElement;
  const showMap = settings?.mapEnabled && settings?.mapElement;
  const showCampaigns = enabledCampaigns.length > 0;

  return (
    <div className="bg-neutral-50">
      {/* ── Hero: Image background + gradient overlay + text left / form right ── */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/aic 2.jpg"
          alt="Australian Islamic Centre"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-900/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-transparent to-neutral-900/60 z-10" />

        {/* Islamic geometric pattern */}
        <div
          className="absolute inset-0 z-10 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23ffffff' stroke-opacity='1' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Hero content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center py-8 sm:py-12 md:py-16 lg:py-20">
            {/* Left — text */}
            <div>
              <div className="h-1 w-16 bg-gradient-to-r from-lime-400 to-green-400 rounded-full mb-6" />

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Support Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-green-400 to-lime-400">
                  Community
                </span>
              </h1>

              <p className="text-white/70 text-base sm:text-lg max-w-md mb-6">
                Your generosity helps us maintain our centre, run educational
                programs, and support those in need.
              </p>

              <div className="flex items-center gap-3 text-white/50 text-sm">
                <Heart className="w-4 h-4 text-lime-400" />
                <span>Every contribution makes a difference</span>
              </div>
            </div>

            {/* Right — donation form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-2xl p-1 w-full lg:max-w-md lg:ml-auto">
                <div
                  className="fundraise-up-wrapper"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeFundraiseUpElement(settings!.formElement!),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Goal Meter — centred between hero and campaigns ── */}
      {showGoal && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
            <div
              className="fundraise-up-goal-meter"
              dangerouslySetInnerHTML={{
                __html: sanitizeFundraiseUpElement(settings!.goalElement!),
              }}
            />
          </div>
        </div>
      )}

      {/* ── Active Campaigns — full-width styled section ── */}
      {showCampaigns && (
        <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-800 py-8 sm:py-12">
          {/* Decorative background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23ffffff' stroke-opacity='1' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-lime-400 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Make an impact
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Active Campaigns
              </h2>
              <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
                Choose a cause close to your heart and make a direct impact.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center sm:items-start gap-6">
              {enabledCampaigns.map((campaign: DonatePageCampaign) => (
                <div key={campaign._key} className="flex flex-col items-center">
                  {campaign.title && (
                    <h3 className="text-white text-sm font-semibold mb-2 text-center">
                      {campaign.title}
                    </h3>
                  )}
                  <div className="group rounded-2xl overflow-hidden border border-white/10 hover:border-lime-400/30 transition-all duration-300">
                    <div
                      className="fundraise-up-wrapper"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeFundraiseUpElement(campaign.fundraiseUpElement),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent Donations ── */}
      {showDonorList && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div
            className="fundraise-up-wrapper"
            dangerouslySetInnerHTML={{
              __html: sanitizeFundraiseUpElement(settings!.donorListElement!),
            }}
          />
        </div>
      )}

      {/* ── Donation Map ── */}
      {showMap && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4">
              {settings!.mapTitle || "Donations Around the World"}
            </h2>
            <div
              className="fundraise-up-wrapper"
              dangerouslySetInnerHTML={{
                __html: sanitizeFundraiseUpElement(settings!.mapElement!),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
