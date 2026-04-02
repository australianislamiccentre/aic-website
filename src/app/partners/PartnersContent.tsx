/**
 * Partners Hub Content
 *
 * Client component that displays affiliated partner organisations.
 * Receives Sanity data from the server component and falls back to
 * hardcoded defaults when CMS data is empty.
 *
 * @module app/partners/PartnersContent
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import {
  ArrowRight,
  Handshake,
  GraduationCap,
  Trophy,
  Heart,
  Users,
  Building,
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import type { SanityPartner, SanityPartnersPageSettings } from "@/types/sanity";
import type { LucideIcon } from "lucide-react";

/** Map Sanity icon string values to lucide-react icon components. */
const iconMap: Record<string, LucideIcon> = {
  trophy: Trophy,
  "graduation-cap": GraduationCap,
  heart: Heart,
  users: Users,
  building: Building,
  handshake: Handshake,
};

/** Resolve a Sanity icon string to its lucide-react component, defaulting to Handshake. */
function getIcon(iconName?: string): LucideIcon {
  if (!iconName) return Handshake;
  return iconMap[iconName] ?? Handshake;
}

/** Hardcoded fallback partners used when Sanity returns no data. */
const fallbackPartners: SanityPartner[] = [
  {
    _id: "fallback-newport-storm",
    name: "Newport Storm FC",
    slug: "newport-storm",
    shortDescription:
      "A community football club affiliated with the Australian Islamic Centre, promoting sportsmanship, fitness, and community spirit among youth and adults.",
    icon: "trophy",
    color: "from-blue-500 to-blue-600",
  },
  {
    _id: "fallback-aicc",
    name: "AIC College (AICC)",
    slug: "aicc",
    shortDescription:
      "The Australian Islamic Centre College provides quality education rooted in Islamic values, offering comprehensive academic programs for students.",
    icon: "graduation-cap",
    color: "from-teal-500 to-teal-600",
  },
];

/** Fallback image paths keyed by slug, used when no Sanity coverImage exists. */
const fallbackImages: Record<string, string> = {
  "newport-storm": "/images/aic 5.jpg",
  aicc: "/images/aic start.jpg",
};

interface PartnersContentProps {
  partners: SanityPartner[];
  pageSettings?: SanityPartnersPageSettings | null;
}

export default function PartnersContent({ partners, pageSettings }: PartnersContentProps) {
  const displayPartners = partners.length > 0 ? partners : fallbackPartners;

  return (
    <>
      {/* Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
              <Handshake className="w-4 h-4" />
              {pageSettings?.heroBadge ?? "Our Network"}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {pageSettings?.heroHeading ?? "Affiliated"}{" "}
              {pageSettings?.heroHeadingAccent !== undefined ? (
                <span className="text-teal-600">{pageSettings.heroHeadingAccent}</span>
              ) : (
                <span className="text-teal-600">Partners</span>
              )}
            </h1>
            <p className="text-gray-600 max-w-2xl">
              {pageSettings?.heroDescription ?? "The Australian Islamic Centre works alongside these affiliated organisations to serve our community through education, sports, and social development."}
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {displayPartners.map((partner) => {
              const IconComponent = getIcon(partner.icon);
              const gradientColor =
                partner.color ?? "from-teal-500 to-teal-600";

              // Resolve image: Sanity coverImage first, then fallback by slug
              let imageSrc: string | undefined;
              if (partner.coverImage) {
                imageSrc = urlFor(partner.coverImage)
                  .width(800)
                  .height(400)
                  .url();
              } else {
                imageSrc = fallbackImages[partner.slug];
              }

              return (
                <FadeIn key={partner._id}>
                  <Link
                    href={`/partners/${partner.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 h-full"
                  >
                    {imageSrc && (
                      <div className="relative h-48">
                        <Image
                          src={imageSrc}
                          alt={partner.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {partner.name}
                          </h2>
                        </div>
                      </div>
                    )}
                    {!imageSrc && (
                      <div className="relative h-48 bg-gray-100">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {partner.name}
                          </h2>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {partner.shortDescription}
                      </p>
                      <span className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {pageSettings?.ctaVisible !== false && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {pageSettings?.ctaHeading ?? "Partner With"}{" "}
                {pageSettings?.ctaHeadingAccent !== undefined ? (
                  <span className="text-teal-600">{pageSettings.ctaHeadingAccent}</span>
                ) : (
                  <span className="text-teal-600">Us</span>
                )}
              </h2>
              <p className="text-gray-600 mb-8">
                {pageSettings?.ctaDescription ?? "Interested in partnering with the Australian Islamic Centre? We welcome organisations that share our commitment to community development, education, and social impact."}
              </p>
              <Link
                href={pageSettings?.ctaButtonUrl ?? "/contact"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ad4c] text-white font-semibold rounded-lg hover:bg-[#009040] transition-colors"
              >
                {pageSettings?.ctaButtonLabel ?? "Get in Touch"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>
          </div>
        </section>
      )}
    </>
  );
}
