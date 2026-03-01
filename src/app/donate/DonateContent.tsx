/**
 * Donate Content
 *
 * Client component rendering the /donate page UI. Side-by-side hero with
 * gradient background (no image), Quran ayah in hero, impact stats section,
 * and campaign cards grid. Fundraise Up HTML snippets are sanitised before
 * rendering.
 *
 * @module app/donate/DonateContent
 */
"use client";

import { Heart } from "lucide-react";
import type { DonatePageSettings, DonatePageImpactStat } from "@/sanity/lib/fetch";

interface DonateContentProps {
  settings?: DonatePageSettings | null;
}

/** Strip invisible Unicode characters injected by Sanity stega encoding. */
const cleanElementCode = (code: string) => {
  return code.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
};

/**
 * Sanitise FundraiseUp element code from Sanity.
 * Strips <script>, <iframe>, event handlers, and javascript: URLs.
 */
const sanitizeFundraiseUpElement = (code: string): string => {
  let cleaned = cleanElementCode(code);
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<iframe[^>]*\/?>/gi, "");
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  cleaned = cleaned.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');
  return cleaned;
};

/** Renders a sanitised Fundraise Up HTML snippet. */
function FundraiseUpWidget({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeFundraiseUpElement(html) }}
    />
  );
}

const defaultStats: DonatePageImpactStat[] = [
  { value: "500+", label: "Families Supported" },
  { value: "20+", label: "Years Serving" },
  { value: "5", label: "Daily Prayers" },
  { value: "1000+", label: "Community Members" },
];

export default function DonateContent({ settings }: DonateContentProps) {
  const activeCampaigns = (settings?.campaigns || []).filter(
    (c) => c.active !== false && c.fundraiseUpElement
  );

  const showForm = !!settings?.formElement;
  const showCampaigns = activeCampaigns.length > 0;

  const heroHeading = settings?.heroHeading || "Support Our Community";
  const heroDescription =
    settings?.heroDescription ||
    "Your generosity helps us maintain our centre, run educational programs, and support those in need.";

  const impactStats =
    settings?.impactStats && settings.impactStats.length > 0
      ? settings.impactStats
      : defaultStats;

  return (
    <>
      {/* Hero — warm gradient bg, side-by-side on desktop */}
      <section className="bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
          <div className={`flex flex-col items-center ${showForm ? "lg:flex-row lg:items-start lg:gap-12" : ""}`}>
            {/* Left column — text */}
            <div className={`w-full text-center lg:text-left ${showForm ? "lg:flex-1" : "max-w-3xl mx-auto"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Make a Difference
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                {heroHeading}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-5 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {heroDescription}
              </p>

              <blockquote className="text-base sm:text-lg lg:text-xl font-serif italic text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                &ldquo;Who is it that would loan Allah a goodly loan so He may multiply it for him many times over?&rdquo;
              </blockquote>
              <p className="mt-2 text-sm text-gray-400">Surah Al-Baqarah 2:245</p>
            </div>

            {/* Right column — form */}
            {showForm && (
              <div className="mt-8 lg:mt-0 lg:w-[420px] lg:flex-shrink-0 flex justify-center lg:justify-start">
                <FundraiseUpWidget
                  html={settings!.formElement!}
                  className="fundraise-up-wrapper"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-stone-50 border-y border-stone-200" data-testid="impact-stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-4xl font-bold text-green-700">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Cards */}
      {showCampaigns && (
        <section className="py-8 sm:py-14 bg-white" data-testid="campaigns-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
                Active Campaigns
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Support a specific cause below.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-md sm:max-w-none mx-auto lg:mx-0"
              data-testid="campaigns-grid"
            >
              {activeCampaigns.map((campaign) => (
                <div key={campaign._id}>
                  <FundraiseUpWidget
                    html={campaign.fundraiseUpElement}
                    className="fundraise-up-wrapper [&>*]:!w-full [&>*]:!max-w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
