"use client";

/**
 * Partner Detail Content
 *
 * Client component that renders the full partner profile page, including hero,
 * about section, and contact details.
 *
 * @module app/partners/[slug]/PartnerDetailContent
 */

import Image from "next/image";
import { ExternalLink, Mail, Phone, ArrowLeft } from "lucide-react";
import { PortableText } from "@portabletext/react";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";
import { urlFor } from "@/sanity/lib/image";
import { SanityPartner } from "@/types/sanity";

interface PartnerDetailContentProps {
  partner: SanityPartner;
}

export default function PartnerDetailContent({ partner }: PartnerDetailContentProps) {
  const coverImageUrl = partner.coverImage
    ? urlFor(partner.coverImage).width(1200).height(480).url()
    : null;

  const logoUrl = partner.logo
    ? urlFor(partner.logo).width(120).height(120).url()
    : null;

  const hasContactInfo = partner.website || partner.email || partner.phone;

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#01476b] overflow-hidden">
        {coverImageUrl ? (
          <>
            <Image
              src={coverImageUrl}
              alt={partner.name}
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#01476b] via-[#01476b]/70 to-[#01476b]/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#01476b] via-[#015a85] to-[#01476b]" />
        )}

        <div className="relative max-w-5xl mx-auto px-6 pt-8 pb-12">
          <BreadcrumbLight />

          <div className="mt-6 flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Logo overlay */}
            {logoUrl && (
              <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white shadow-lg border-2 border-white/30">
                <Image
                  src={logoUrl}
                  alt={`${partner.name} logo`}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain p-2"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-[Playfair_Display] leading-tight">
                {partner.name}
              </h1>
              {partner.shortDescription && (
                <p className="mt-2 text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed">
                  {partner.shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons in hero */}
          {hasContactInfo && (
            <div className="mt-6 flex flex-wrap gap-3">
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#01476b] text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              )}
              {partner.email && (
                <a
                  href={`mailto:${partner.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {partner.email}
                </a>
              )}
              {partner.phone && (
                <a
                  href={`tel:${partner.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {partner.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_280px] gap-10">

            {/* Left Column — About */}
            <FadeIn>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  About {partner.name}
                </h2>

                {partner.fullDescription && partner.fullDescription.length > 0 ? (
                  <div className="prose prose-gray prose-p:leading-relaxed prose-headings:font-bold prose-a:text-[#01476b] max-w-none">
                    <PortableText value={partner.fullDescription} />
                  </div>
                ) : partner.shortDescription ? (
                  <p className="text-gray-600 leading-relaxed text-base">
                    {partner.shortDescription}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">No description available.</p>
                )}
              </div>
            </FadeIn>

            {/* Right Column — Sidebar */}
            <div className="space-y-5">
              <FadeIn>
                {/* Contact Card */}
                {hasContactInfo && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      Contact & Links
                    </h3>
                    <div className="space-y-3">
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 text-sm text-[#01476b] hover:text-[#015a85] transition-colors font-medium"
                        >
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{partner.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                      )}
                      {partner.email && (
                        <a
                          href={`mailto:${partner.email}`}
                          className="flex items-center gap-2.5 text-sm text-[#01476b] hover:text-[#015a85] transition-colors"
                        >
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="break-all">{partner.email}</span>
                        </a>
                      )}
                      {partner.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="flex items-center gap-2.5 text-sm text-[#01476b] hover:text-[#015a85] transition-colors"
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          {partner.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Back Link */}
                <div className={hasContactInfo ? "mt-5" : ""}>
                  <Button
                    href="/partners"
                    variant="outline"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    iconPosition="left"
                    className="w-full"
                  >
                    Back to Partners
                  </Button>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
