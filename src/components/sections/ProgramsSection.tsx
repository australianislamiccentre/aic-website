"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { SanityProgram } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { ArrowRight, BookOpen, Trophy, Clock, CheckCircle2, GraduationCap, ExternalLink, Bell } from "lucide-react";
import Image from "next/image";

const categoryIcons: Record<string, React.ReactNode> = {
  Education: <BookOpen className="w-4 h-4" />,
  Youth: <Trophy className="w-4 h-4" />,
  Sports: <Trophy className="w-4 h-4" />,
};

// Helper functions for merged Program/Event structure
function getPrimaryCategory(program: SanityProgram): string {
  return program.categories?.[0] || "Program";
}

function getSchedule(program: SanityProgram): string {
  if (!program.recurringDay) return "Contact for schedule";
  const day = program.recurringDay;
  const time = program.time || "";
  const endTime = program.endTime ? ` - ${program.endTime}` : "";
  return `${day} ${time}${endTime}`.trim();
}

function getDescription(program: SanityProgram): string {
  return program.shortDescription || program.description || "";
}

interface ProgramsSectionProps {
  programs: SanityProgram[];
}

export function ProgramsSection({ programs }: ProgramsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayPrograms = programs.slice(0, 5);
  const activeProgram = displayPrograms[activeIndex];

  // Show placeholder if no programs
  if (displayPrograms.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-neutral-950 relative overflow-hidden">
        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.5) 40px,
                rgba(255,255,255,0.5) 41px
              )`,
            }}
          />
        </div>

        {/* Horizontal accent lines */}
        <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

        {/* Accent glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <FadeIn>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/50 text-teal-400 text-xs font-medium tracking-wide uppercase mb-6">
                <GraduationCap className="w-3.5 h-3.5" />
                Education & Youth
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Transformative{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                  Programs
                </span>
              </h2>
              <p className="text-neutral-400 max-w-2xl mx-auto text-lg mb-8">
                We&apos;re preparing exciting new programs for our community. Stay tuned for educational courses, youth activities, and more.
              </p>

              <Button
                href="/contact"
                variant="primary"
                size="lg"
                icon={<Bell className="w-5 h-5" />}
              >
                Get Notified
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    );
  }

  // Get image URL - handle both Sanity images and static paths
  const getImageUrl = (program: SanityProgram) => {
    if (program.image) {
      return urlFor(program.image).width(800).height(600).url();
    }
    return "/images/aic start.jpg"; // Fallback image
  };

  return (
    <section className="py-20 md:py-28 bg-neutral-950 relative overflow-hidden">
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.5) 40px,
              rgba(255,255,255,0.5) 41px
            )`,
          }}
        />
      </div>

      {/* Horizontal accent lines */}
      <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
      <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/50 text-teal-400 text-xs font-medium tracking-wide uppercase mb-6">
              <GraduationCap className="w-3.5 h-3.5" />
              Education & Youth
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Transformative{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                Programs
              </span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Our comprehensive programs cater to every member of the family, from children to adults.
            </p>
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Program List */}
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-neutral-800 p-4">
            <div className="space-y-2">
              {displayPrograms.map((program, index) => (
                <motion.button
                  key={program._id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative ${
                    activeIndex === index
                      ? "bg-neutral-800 border border-neutral-700"
                      : "hover:bg-neutral-800/50 border border-transparent"
                  }`}
                >
                  {/* Active indicator */}
                  {activeIndex === index && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full"
                    />
                  )}

                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        activeIndex === index
                          ? "bg-teal-500/20 text-teal-400"
                          : "bg-neutral-700 text-neutral-400 group-hover:text-neutral-300"
                      }`}
                    >
                      {categoryIcons[getPrimaryCategory(program)] || <BookOpen className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium transition-colors ${
                          activeIndex === index ? "text-white" : "text-neutral-300 group-hover:text-white"
                        }`}
                      >
                        {program.title}
                      </h3>
                      <p className="text-sm text-neutral-500 truncate">
                        {getSchedule(program)}
                      </p>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition-all ${
                        activeIndex === index
                          ? "text-teal-400 translate-x-0 opacity-100"
                          : "text-neutral-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* View All Link */}
            <div className="pt-4 mt-2 border-t border-neutral-800">
              <Button
                href="/events"
                variant="ghost"
                className="text-neutral-400 hover:text-white w-full justify-center"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View all programs
              </Button>
            </div>
          </div>

          {/* Right: Detail Card */}
          <div className="lg:sticky lg:top-8">
            <AnimatePresence mode="wait">
              {activeProgram && (
                <motion.div
                  key={activeProgram._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800"
                >
                  {/* Image */}
                  <div className="relative h-52 md:h-64">
                    <Image
                      src={getImageUrl(activeProgram)}
                      alt={activeProgram.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        getPrimaryCategory(activeProgram) === "Education"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      }`}>
                        {categoryIcons[getPrimaryCategory(activeProgram)]}
                        {getPrimaryCategory(activeProgram)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 -mt-8 relative">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {activeProgram.title}
                    </h3>
                    <p className="text-neutral-400 mb-6 leading-relaxed">
                      {getDescription(activeProgram)}
                    </p>

                    {/* Features */}
                    {activeProgram.features && activeProgram.features.length > 0 && (
                      <div className="space-y-2.5 mb-6">
                        {activeProgram.features.slice(0, 4).map((feature) => (
                          <div key={feature} className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                            <span className="text-sm text-neutral-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{getSchedule(activeProgram)}</span>
                      </div>
                      {activeProgram.externalLink ? (
                        <Button
                          href={activeProgram.externalLink}
                          variant="primary"
                          size="sm"
                          icon={<ExternalLink className="w-4 h-4" />}
                        >
                          Visit
                        </Button>
                      ) : (
                        <Button
                          href={`/events/${activeProgram.slug}`}
                          variant="primary"
                          size="sm"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Learn More
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
