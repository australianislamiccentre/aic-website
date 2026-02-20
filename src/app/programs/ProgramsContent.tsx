"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { urlFor } from "@/sanity/lib/image";
import { SanityProgram } from "@/types/sanity";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Trophy,
  ChevronDown,
  Heart,
} from "lucide-react";

function getImageUrl(image: SanityProgram["image"] | string | undefined): string {
  if (!image) return "/images/aic 1.jpg";
  if (typeof image === "string") return image;
  return urlFor(image).width(800).height(600).url();
}

// Helper to format schedule from event fields
function getSchedule(program: SanityProgram): string {
  if (!program.recurringDay) return "Contact for schedule";
  const day = program.recurringDay;
  const time = program.time || "";
  const endTime = program.endTime ? ` - ${program.endTime}` : "";
  return `${day} ${time}${endTime}`.trim();
}

// Helper to get primary category
function getPrimaryCategory(program: SanityProgram): string {
  return program.categories?.[0] || "Program";
}

// Helper to get description
function getDescription(program: SanityProgram): string {
  return program.shortDescription || program.description || "";
}

interface ProgramCardProps {
  program: SanityProgram;
}

function ProgramCard({ program }: ProgramCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(program.image);
  const features = program.features || [];

  return (
    <motion.div
      id={program.slug || program._id}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full flex flex-col relative group"
    >
      <div className="relative h-40 overflow-hidden">
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={imageUrl}
            alt={program.title}
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
          <motion.span
            animate={{ y: isHovered ? -4 : 0 }}
            transition={{ duration: 0.2 }}
            className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full"
          >
            {getPrimaryCategory(program)}
          </motion.span>
          {program.externalLink && (
            <motion.span
              animate={{ y: isHovered ? -4 : 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full inline-flex items-center gap-1"
            >
              External <ExternalLink className="w-3 h-3" />
            </motion.span>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-green-600/90 flex items-center justify-center"
        >
          <div className="text-center text-white">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">{getSchedule(program)}</p>
          </div>
        </motion.div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <motion.h3
          animate={{ color: isHovered ? "#0d9488" : "#111827" }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold mb-2"
        >
          {program.title}
        </motion.h3>
        <p className="text-gray-600 mb-4 flex-1 line-clamp-2">
          {getDescription(program)}
        </p>

        <AnimatePresence>
          {isHovered && features.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden mb-4"
            >
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {features.slice(0, 3).map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ opacity: isHovered ? 0 : 0.5 }}
          className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-4"
        >
          <span>Hover for details</span>
          <ChevronDown className="w-3 h-3" />
        </motion.div>

        <motion.div
          animate={{ y: isHovered ? 0 : 4, opacity: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {program.externalLink ? (
            <Button
              href={program.externalLink}
              target="_blank"
              variant="outline"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Visit Website
            </Button>
          ) : (
            <Button
              href="/contact"
              variant="outline"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Learn More
            </Button>
          )}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  );
}

interface ProgramsContentProps {
  programs: SanityProgram[];
}

export default function ProgramsContent({ programs }: ProgramsContentProps) {
  const educationPrograms = programs.filter((p) => p.categories?.includes("Education"));
  const youthPrograms = programs.filter((p) =>
    p.categories?.includes("Sports") || p.categories?.includes("Youth")
  );
  // Catch-all for programs that don't fit Education or Sports/Youth (e.g., Women, Community, Charity)
  const educationIds = new Set(educationPrograms.map((p) => p._id));
  const youthIds = new Set(youthPrograms.map((p) => p._id));
  const otherPrograms = programs.filter(
    (p) => !educationIds.has(p._id) && !youthIds.has(p._id)
  );
  const hasPrograms = programs.length > 0;

  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Our <span className="text-teal-600">Programs</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Comprehensive Islamic education and community programs designed to nurture faith, knowledge, and personal development for all ages.
            </p>
          </div>
        </div>
      </section>

      {/* Empty State */}
      {!hasPrograms && (
        <section className="py-12 bg-neutral-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <FadeIn>
              <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Programs Coming Soon
              </h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                We&apos;re currently updating our program offerings. Contact us to learn about
                our education and youth programs.
              </p>
              <Button
                href="/contact"
                variant="primary"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Contact Us
              </Button>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Quick Navigation */}
      {hasPrograms && (
      <section className="py-8 bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#education"
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-green-200 transition-colors"
            >
              Education Programs
            </a>
            <a
              href="#youth"
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Sports & Youth
            </a>
            {otherPrograms.length > 0 && (
              <a
                href="#other"
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Community & Other
              </a>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Education Programs Section */}
      {educationPrograms.length > 0 && (
      <section id="education" className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                Education Programs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Islamic Education for All Ages
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our education programs provide comprehensive Islamic learning,
                from Quran recitation to advanced Islamic studies.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-16">
            {educationPrograms.map((program, index) => {
              const isEven = index % 2 === 0;
              const imageUrl = getImageUrl(program.image);
              const features = program.features || [];

              return (
                <FadeIn key={program._id} direction={isEven ? "left" : "right"}>
                  <div
                    id={program.slug || program._id}
                    className={`grid lg:grid-cols-2 gap-12 items-center ${
                      !isEven ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`relative ${!isEven ? "lg:order-2" : ""}`}
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <Image
                          src={imageUrl}
                          alt={program.title}
                          width={600}
                          height={400}
                          className="w-full h-64 md:h-80 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                              {getPrimaryCategory(program)}
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                              {getSchedule(program)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`absolute -z-10 ${isEven ? "-bottom-6 -right-6" : "-bottom-6 -left-6"} w-full h-full bg-neutral-100 rounded-2xl`} />
                    </motion.div>

                    <div className={`${!isEven ? "lg:order-1" : ""}`}>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                        <BookOpen className="w-4 h-4" />
                        Program
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {program.title}
                      </h3>

                      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        {getDescription(program)}
                      </p>

                      <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Schedule</p>
                          <p className="font-semibold text-gray-900">{getSchedule(program)}</p>
                        </div>
                      </div>

                      {features.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-3 mb-8">
                          {features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4">
                        <Button
                          href="/contact"
                          variant="primary"
                          icon={<ArrowRight className="w-5 h-5" />}
                        >
                          Enroll Now
                        </Button>
                        <Button
                          href="/contact"
                          variant="outline"
                          icon={<Calendar className="w-5 h-5" />}
                        >
                          Enquire About Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Sports & Youth Section */}
      {youthPrograms.length > 0 && (
      <section id="youth" className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-sage-600 text-sm font-medium mb-4">
                <Trophy className="w-4 h-4" />
                Sports & Youth
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Building Character Through Sport & Community
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our youth programs combine physical activity with Islamic values,
                fostering leadership, teamwork, and personal growth.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {youthPrograms.map((program) => (
              <StaggerItem key={program._id}>
                <ProgramCard program={program} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      )}

      {/* Other Programs Section (Women, Community, Charity, etc.) */}
      {otherPrograms.length > 0 && (
      <section id="other" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
                <Heart className="w-4 h-4" />
                Community & Other
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Community Programs
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Programs supporting our diverse community, including women&apos;s initiatives,
                charitable activities, and community engagement.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {otherPrograms.map((program) => (
              <StaggerItem key={program._id}>
                <ProgramCard program={program} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      )}

      {/* Stats Section */}
      {hasPrograms && (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="bg-gradient-to-br from-neutral-800 via-neutral-700 to-sage-700 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Our Educational Impact
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto">
                  Join thousands of students who have transformed their lives through
                  our comprehensive Islamic education programs.
                </p>
              </div>

              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "100+", label: "IQRA Students" },
                  { value: "50+", label: "Weekly Classes" },
                  { value: "20+", label: "Qualified Teachers" },
                  { value: "10+", label: "Programs Offered" },
                ].map((stat) => (
                  <StaggerItem key={stat.label}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {stat.value}
                      </p>
                      <p className="text-white/70">{stat.label}</p>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* Contact CTA */}
      {hasPrograms && (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Interested in Our Programs?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              For more information about enrollment, schedules, and fees, please get in touch.
            </p>
            <Button
              href="/contact"
              variant="primary"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Contact Us
            </Button>
          </FadeIn>
        </div>
      </section>
      )}
    </>
  );
}
