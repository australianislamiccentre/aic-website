/**
 * MeetImamsSection
 *
 * Team member grid on the homepage showcasing the centre's imams.
 * Receives SanityTeamMember[] data and renders each imam with a photo,
 * name, role, and a link to the full team page.
 *
 * @module components/sections/MeetImamsSection
 */
"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { SanityTeamMember, SanityImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Star } from "lucide-react";

interface MeetImamsSectionProps {
  imams: SanityTeamMember[];
}

// Get image URL from Sanity — safe against null/invalid sources
function getImageUrl(image: SanityImage | undefined): string | null {
  if (!image) return null;
  try {
    return urlFor(image).width(400).height(500).url();
  } catch {
    return null;
  }
}


// ─── Mobile: Compact horizontal card ───────────────────────────────
function ImamCardMobile({ imam, index }: { imam: SanityTeamMember; index: number }) {
  const imageUrl = getImageUrl(imam.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href="/imams" className="block group">
        <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-neutral-700 to-neutral-800">
            {imageUrl ? (
              <Image src={imageUrl} alt={imam.name} fill className="object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white/40" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-teal-600 transition-colors">
              {imam.name}
            </h3>
            <p className="text-xs text-gray-500 mb-1">{imam.role}</p>
            {imam.specializations && imam.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {imam.specializations.slice(0, 2).map((spec) => (
                  <span key={spec} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-medium">
                    <Star className="w-2 h-2" />
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>

          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-all flex-shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Desktop: Vertical card with photo ─────────────────────────────
function ImamCardDesktop({ imam, index }: { imam: SanityTeamMember; index: number }) {
  const imageUrl = getImageUrl(imam.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        {/* Photo */}
        <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-neutral-700 to-neutral-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imam.name}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-white/40" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Name overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white">{imam.name}</h3>
            <p className="text-white/80 text-sm">{imam.role}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {imam.shortBio && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
              {imam.shortBio}
            </p>
          )}

          {/* Specializations */}
          {imam.specializations && imam.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {imam.specializations.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium"
                >
                  <Star className="w-2.5 h-2.5" />
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MeetImamsSection({ imams }: MeetImamsSectionProps) {
  // Hide section entirely when no imams exist in Sanity
  if (imams.length === 0) return null;

  const displayImams = imams.slice(0, 3);

  return (
    <section className="py-10 md:py-16 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between gap-4 mb-6 md:mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium mb-2 md:mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                Spiritual Guidance
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Meet Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                  Imams
                </span>
              </h2>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base max-w-lg hidden sm:block">
                Our imams are dedicated to serving the community through prayer, education, and pastoral care.
              </p>
            </div>
            <Button
              href="/imams"
              variant="outline"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Button>
          </div>
        </FadeIn>

        {/* Mobile: Compact horizontal cards */}
        <div className="sm:hidden space-y-2">
          {displayImams.map((imam, index) => (
            <ImamCardMobile key={imam._id} imam={imam} index={index} />
          ))}
        </div>

        {/* Desktop: Vertical cards with photos */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayImams.map((imam, index) => (
            <ImamCardDesktop key={imam._id} imam={imam} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
