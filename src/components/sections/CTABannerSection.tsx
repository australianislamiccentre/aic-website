/**
 * CTABannerSection
 *
 * Full-width call-to-action banner for the homepage. Renders only when
 * `ctaBanner.enabled` is explicitly `true` — the banner is opt-in. Supports
 * an optional Sanity background image (with a dark overlay) or falls back to
 * a solid gradient.
 *
 * @module components/sections/CTABannerSection
 */
"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { urlFor } from "@/sanity/lib/image";
import type { SanityHomepageSettings } from "@/types/sanity";

interface CTABannerProps {
  ctaBanner?: SanityHomepageSettings["ctaBanner"];
}

export function CTABannerSection({ ctaBanner }: CTABannerProps) {
  if (!ctaBanner?.enabled) return null;

  const bgImageUrl = ctaBanner.backgroundImage
    ? urlFor(ctaBanner.backgroundImage).width(1920).height(600).url()
    : null;

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Background — either a Sanity image with a dark overlay, or a solid gradient */}
      {bgImageUrl ? (
        <>
          <Image src={bgImageUrl} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#01476b]/85" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#01476b] to-[#012d44]" />
      )}

      <FadeIn>
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center text-white">
          {ctaBanner.title && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {ctaBanner.title}
            </h2>
          )}
          {ctaBanner.subtitle && (
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {ctaBanner.subtitle}
            </p>
          )}
          {ctaBanner.buttonLabel && ctaBanner.buttonUrl && (
            <Button
              href={ctaBanner.buttonUrl}
              variant="gold"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              {ctaBanner.buttonLabel}
            </Button>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
