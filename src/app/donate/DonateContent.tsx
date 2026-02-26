/**
 * Donate Content
 *
 * Client component rendering the /donate page UI. Hero image with text
 * overlay and a donation form that floats across the image/white boundary
 * on desktop, stacking cleanly and centred on mobile/tablet. Campaign cards
 * in a responsive grid below. Fundraise Up HTML snippets are sanitised
 * before rendering.
 *
 * @module app/donate/DonateContent
 */
"use client";

import Image from "next/image";
import { Heart, BookOpen, Users, Home } from "lucide-react";
import type { DonatePageSettings } from "@/sanity/lib/fetch";

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

const impactItems = [
  { icon: BookOpen, text: "Educational programs for all ages" },
  { icon: Users, text: "Community services and support" },
  { icon: Home, text: "Maintaining our centre and facilities" },
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

  return (
    <>
      {/* ── Hero with image ── */}
      <section className="relative">
        <div className="relative h-[300px] sm:h-[400px] lg:h-[520px]">
          <Image
            src="/images/aic 2.jpg"
            alt="Australian Islamic Centre"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

          {/* Text overlay — centred on mobile, left-aligned on desktop */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center lg:justify-start">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Make a Difference
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                {heroHeading}
              </h1>

              <p className="text-sm sm:text-lg text-white/85 mb-5 sm:mb-8 leading-relaxed">
                {heroDescription}
              </p>

              <div className="hidden sm:flex flex-col items-center lg:items-start space-y-3" data-testid="impact-list">
                {impactItems.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/90 text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop floating form — overlaps image and white area below */}
        {showForm && (
          <div className="hidden lg:block relative z-20 max-w-7xl mx-auto px-6">
            <div className="absolute right-6 top-0 -translate-y-1/2 w-[420px]">
              <FundraiseUpWidget
                html={settings!.formElement!}
                className="fundraise-up-wrapper"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Ayah + Form area ── */}
      <section className={`bg-white ${showForm ? "lg:min-h-[480px]" : ""} ${!showCampaigns ? "pb-10 sm:pb-14" : ""}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 ${showForm ? "lg:pt-8 lg:pb-16" : "lg:py-16"}`}>
          {/* Ayah — centred on mobile, left-aligned on desktop beside the floating form */}
          <div className={`text-center lg:text-left ${showForm ? "lg:max-w-[calc(100%-460px)]" : "max-w-3xl mx-auto lg:mx-0"}`}>
            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-gray-700 leading-relaxed">
              &ldquo;Who is it that would loan Allah a goodly loan so He may multiply it for him many times over?&rdquo;
            </blockquote>
            <p className="mt-3 sm:mt-4 text-sm text-gray-400">Surah Al-Baqarah 2:245</p>
          </div>

          {/* Mobile/tablet form — card wrapper, centred */}
          {showForm && (
            <div className="lg:hidden mt-10 flex justify-center">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-fit">
                <FundraiseUpWidget
                  html={settings!.formElement!}
                  className="fundraise-up-wrapper"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Campaign Cards ── */}
      {showCampaigns && (
        <section className="py-10 sm:py-14 bg-white" data-testid="campaigns-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Active Campaigns
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Support a specific cause below.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-md sm:max-w-none mx-auto lg:mx-0"
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
