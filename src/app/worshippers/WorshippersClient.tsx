/**
 * Worshippers Page Client Component
 *
 * Interactive client-side portion of the /worshippers page. Renders
 * mosque etiquette guidelines, Islamic talks (YouTube khutbahs), and
 * directions. All prayer-time information now lives in the global
 * PrayerWidget (mounted in the root layout).
 *
 * @module app/worshippers/WorshippersClient
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { mosqueEtiquette as fallbackEtiquette } from "@/data/content";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import type { SanityEtiquette, SanityWorshippersPageSettings } from "@/types/sanity";
import type { YouTubeVideo } from "@/lib/youtube";
import {
  Clock,
  MapPin,
  Heart,
  CheckCircle2,
  Footprints,
  Shirt,
  Volume2,
  HandHeart,
  Droplets,
  HelpCircle,
  Moon,
  Star,
  Play,
  ArrowRight,
  Users,
} from "lucide-react";

// Icon map supports both lowercase (hardcoded) and PascalCase (Sanity) icon names
const etiquetteIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  Footprints: Footprints,
  shirt: Shirt,
  Shirt: Shirt,
  volume: Volume2,
  Volume2: Volume2,
  VolumeX: Volume2,
  hands: HandHeart,
  HandHeart: HandHeart,
  Hand: HandHeart,
  droplets: Droplets,
  Droplets: Droplets,
  help: HelpCircle,
  HelpCircle: HelpCircle,
  Heart: Heart,
  Users: Users,
  Clock: Clock,
  Moon: Moon,
  Star: Star,
};

interface WorshippersClientProps {
  etiquette?: SanityEtiquette[];
  youtubeVideos?: YouTubeVideo[];
  pageSettings?: SanityWorshippersPageSettings | null;
}

export default function WorshippersClient({
  etiquette = [],
  youtubeVideos = [],
  pageSettings,
}: WorshippersClientProps) {
  const info = useSiteSettings();

  // Normalize Sanity data with hardcoded fallbacks
  // pageSettings.etiquetteItems takes highest priority, then etiquette prop, then fallback
  const etiquetteItems = (pageSettings?.etiquetteItems && pageSettings.etiquetteItems.length > 0)
    ? pageSettings.etiquetteItems.map(e => ({ title: e.title, description: e.description, icon: e.icon }))
    : etiquette.length > 0
      ? etiquette.map(e => ({ title: e.title, description: e.description, icon: e.icon }))
      : fallbackEtiquette;

  return (
    <>
      {/* Hero Section — matches events/services pattern */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-teal-50/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
                <Clock className="w-4 h-4" />
                {pageSettings?.heroBadge ?? "Guidance & Etiquette"}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {pageSettings?.heroHeading ?? "For"}{" "}
                {pageSettings?.heroHeadingAccent !== undefined ? (
                  <span className="text-teal-600">{pageSettings.heroHeadingAccent}</span>
                ) : (
                  <span className="text-teal-600">Worshippers</span>
                )}
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {pageSettings?.heroDescription ?? "Mosque etiquette, Islamic talks, and everything you need to know before your visit to the Australian Islamic Centre."}
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  Etiquette
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Khutbahs
                </span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Directions
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic start.jpg"
                  alt="Australian Islamic Centre prayer hall"
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube — Islamic Talks */}
      {youtubeVideos.length > 0 && (
        <section className="py-10 md:py-14 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{pageSettings?.khutbahHeading ?? "Islamic Talks"}</h2>
                  <p className="text-gray-500 text-sm">Khutbahs and lectures from the Australian Islamic Centre</p>
                </div>
                <Link
                  href="/media"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {youtubeVideos.slice(0, 4).map((video) => (
                <FadeIn key={video.id}>
                  <Link
                    href={`/media?v=${video.id}`}
                    className="group block rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-red-600 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {video.title}
                      </h3>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
            <Link
              href="/media"
              className="sm:hidden flex items-center justify-center gap-1.5 mt-4 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              View All Videos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Mosque Etiquette */}
      {pageSettings?.etiquetteVisible !== false && (
        <section id="etiquette" className={`py-10 md:py-14 ${youtubeVideos.length > 0 ? "bg-white" : "bg-neutral-50"}`}>
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {pageSettings?.etiquetteHeading ?? "Mosque Etiquette"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {pageSettings?.etiquetteDescription ?? "Please observe these guidelines for a peaceful environment."}
                </p>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {etiquetteItems.map((item) => {
                const Icon = etiquetteIcons[item.icon ?? ""] || CheckCircle2;
                return (
                  <FadeIn key={item.title}>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-gray-100">
                      <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Get Directions CTA */}
      {pageSettings?.ctaVisible !== false && (
        <section className={`py-10 ${youtubeVideos.length > 0 ? "bg-neutral-50" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              {(pageSettings?.ctaHeading || pageSettings?.ctaDescription) && (
                <div className="text-center mb-4">
                  {pageSettings?.ctaHeading && (
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{pageSettings.ctaHeading}</h2>
                  )}
                  {pageSettings?.ctaDescription && (
                    <p className="text-gray-500 text-sm">{pageSettings.ctaDescription}</p>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <span className="font-medium text-sm">{info.address.full}</span>
                </div>
                <a
                  href={pageSettings?.ctaButtonUrl ?? "https://maps.app.goo.gl/DZUnHYjsaBvREAmw9"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  {pageSettings?.ctaButtonLabel ?? "Get Directions"}
                </a>
              </div>
            </FadeIn>
          </div>
        </section>
      )}
    </>
  );
}
