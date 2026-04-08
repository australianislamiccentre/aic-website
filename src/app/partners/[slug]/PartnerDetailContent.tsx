"use client";

/**
 * Partner Detail Content
 *
 * Sanity-driven partner detail page that mirrors the original hardcoded layout:
 * a themed gradient hero with side image, a "What We Offer" highlights grid,
 * an about card with location, and a coloured CTA band.
 *
 * @module app/partners/[slug]/PartnerDetailContent
 */

import { createElement } from "react";
import Image from "next/image";
import {
  ExternalLink,
  ArrowRight,
  MapPin,
  Trophy,
  GraduationCap,
  BookOpen,
  Users,
  Heart,
  Calendar,
  Award,
  Building,
  type LucideIcon,
} from "lucide-react";
import { PortableText } from "@portabletext/react";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";
import { urlFor } from "@/sanity/lib/image";
import { SanityPartner } from "@/types/sanity";

interface PartnerDetailContentProps {
  partner: SanityPartner;
}

const iconMap: Record<string, LucideIcon> = {
  trophy: Trophy,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  users: Users,
  heart: Heart,
  calendar: Calendar,
  award: Award,
  building: Building,
};

type ThemeKey = "teal" | "blue" | "green" | "purple" | "orange";

const themes: Record<ThemeKey, {
  heroBg: string;
  heroBgOrb: string;
  badgeBg: string;
  badgeText: string;
  nameAccent: string;
  cardIconBg: string;
  cardIconText: string;
  aboutPin: string;
  ctaBg: string;
  primaryBtn: string;
}> = {
  teal: {
    heroBg: "from-teal-50 via-white to-neutral-50",
    heroBgOrb: "bg-teal-100/40",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-700",
    nameAccent: "text-teal-600",
    cardIconBg: "bg-teal-100",
    cardIconText: "text-teal-600",
    aboutPin: "text-teal-600",
    ctaBg: "from-teal-600 to-teal-700",
    primaryBtn: "",
  },
  blue: {
    heroBg: "from-blue-50 via-white to-neutral-50",
    heroBgOrb: "bg-blue-100/40",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    nameAccent: "text-blue-600",
    cardIconBg: "bg-blue-100",
    cardIconText: "text-blue-600",
    aboutPin: "text-blue-600",
    ctaBg: "from-blue-600 to-blue-700",
    primaryBtn: "bg-blue-600 hover:bg-blue-700",
  },
  green: {
    heroBg: "from-green-50 via-white to-neutral-50",
    heroBgOrb: "bg-green-100/40",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
    nameAccent: "text-green-600",
    cardIconBg: "bg-green-100",
    cardIconText: "text-green-600",
    aboutPin: "text-green-600",
    ctaBg: "from-green-600 to-green-700",
    primaryBtn: "bg-green-600 hover:bg-green-700",
  },
  purple: {
    heroBg: "from-purple-50 via-white to-neutral-50",
    heroBgOrb: "bg-purple-100/40",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
    nameAccent: "text-purple-600",
    cardIconBg: "bg-purple-100",
    cardIconText: "text-purple-600",
    aboutPin: "text-purple-600",
    ctaBg: "from-purple-600 to-purple-700",
    primaryBtn: "bg-purple-600 hover:bg-purple-700",
  },
  orange: {
    heroBg: "from-orange-50 via-white to-neutral-50",
    heroBgOrb: "bg-orange-100/40",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    nameAccent: "text-orange-600",
    cardIconBg: "bg-orange-100",
    cardIconText: "text-orange-600",
    aboutPin: "text-orange-600",
    ctaBg: "from-orange-600 to-orange-700",
    primaryBtn: "bg-orange-600 hover:bg-orange-700",
  },
};

export default function PartnerDetailContent({ partner }: PartnerDetailContentProps) {
  const theme = themes[(partner.heroTheme as ThemeKey) ?? "teal"] ?? themes.teal;

  const coverImageUrl = partner.coverImage
    ? urlFor(partner.coverImage).width(1200).height(800).url()
    : null;

  const headerIcon = partner.icon && iconMap[partner.icon] ? iconMap[partner.icon] : Building;
  const headerIconNode = createElement(headerIcon, { className: "w-4 h-4" });

  const aboutHeading = partner.aboutHeading ?? `About ${partner.name}`;
  const ctaHeading = partner.ctaHeading ?? `Learn more about ${partner.name}`;
  const ctaDescription =
    partner.ctaDescription ??
    "Visit the website to learn more about this affiliated partner of the Australian Islamic Centre.";
  const ctaButtonLabel = partner.ctaButtonLabel ?? "Visit Website";

  // Split name for accent styling (last word gets themed colour)
  const nameParts = partner.name.split(" ");
  const nameLead = nameParts.slice(0, -1).join(" ");
  const nameTail = nameParts[nameParts.length - 1];

  return (
    <>
      {/* Header */}
      <section className={`relative bg-gradient-to-br ${theme.heroBg} overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-96 h-96 ${theme.heroBgOrb} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.badgeBg} ${theme.badgeText} text-sm font-medium mb-6`}>
                {headerIconNode}
                Affiliated Partner
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {nameLead ? <>{nameLead} <span className={theme.nameAccent}>{nameTail}</span></> : <span className={theme.nameAccent}>{nameTail}</span>}
              </h1>

              {partner.shortDescription && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {partner.shortDescription}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                {partner.website && (
                  <Button
                    href={partner.website}
                    variant="primary"
                    icon={<ExternalLink className="w-4 h-4" />}
                    className={theme.primaryBtn}
                  >
                    {ctaButtonLabel}
                  </Button>
                )}
                <Button
                  href="/contact"
                  variant="outline"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Get In Touch
                </Button>
              </div>
            </div>

            {coverImageUrl && (
              <div className="relative hidden lg:block">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={coverImageUrl}
                    alt={partner.name}
                    width={600}
                    height={400}
                    className="w-full h-72 object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Highlights */}
      {partner.highlights && partner.highlights.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What We Offer</h2>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {partner.highlights.map((item) => {
                const Icon = iconMap[item.icon] ?? Building;
                const iconNode = createElement(Icon, { className: `w-5 h-5 ${theme.cardIconText}` });
                return (
                  <FadeIn key={item._key ?? item.title}>
                    <div className="bg-neutral-50 rounded-xl p-4 border border-gray-100 text-center h-full">
                      <div className={`w-10 h-10 mx-auto rounded-lg ${theme.cardIconBg} flex items-center justify-center mb-3`}>
                        {iconNode}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-xs">{item.description}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{aboutHeading}</h2>

              {partner.fullDescription && partner.fullDescription.length > 0 ? (
                <div className="prose prose-gray prose-p:leading-relaxed prose-headings:font-bold max-w-none text-gray-600">
                  <PortableText value={partner.fullDescription} />
                </div>
              ) : partner.shortDescription ? (
                <p className="text-gray-600 leading-relaxed">{partner.shortDescription}</p>
              ) : null}

              {partner.location && (
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${theme.aboutPin}`} />
                    <span>{partner.location}</span>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-12 bg-gradient-to-br ${theme.ctaBg}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-4">{ctaHeading}</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">{ctaDescription}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {partner.website && (
                <Button
                  href={partner.website}
                  variant="gold"
                  size="lg"
                  icon={<ExternalLink className="w-5 h-5" />}
                >
                  {ctaButtonLabel}
                </Button>
              )}
              <Button
                href="/partners"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Back to Partners
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
