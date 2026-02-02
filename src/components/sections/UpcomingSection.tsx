"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { SanityEvent, SanityProgram, SanityImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  BookOpen,
  Users,
  GraduationCap,
  Trophy,
  Sparkles,
  Repeat,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UpcomingSectionProps {
  events?: SanityEvent[];
  programs?: SanityProgram[];
}

// Filter out prayer-related programs
const PRAYER_KEYWORDS = [
  "friday prayer",
  "jumu'ah",
  "jumuah",
  "jummah",
  "daily prayer",
  "prayer",
  "salah",
  "salat",
  "taraweeh",
  "tarawih",
];

function isPrayerProgram(program: SanityProgram): boolean {
  const title = program.title.toLowerCase();
  return PRAYER_KEYWORDS.some((keyword) => title.includes(keyword));
}

// Get image URL from Sanity
function getImageUrl(image: SanityImage | undefined): string | null {
  if (!image) return null;
  return urlFor(image).width(400).height(250).url();
}

// Format date for display
function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Get day abbreviation
function getDayAbbrev(day: string | undefined): string {
  if (!day) return "";
  const dayMap: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };
  return dayMap[day.toLowerCase()] || day.slice(0, 3);
}

// Get full day name
function getDayFull(day: string | undefined): string {
  if (!day) return "";
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

// Get day order for sorting (0 = Sunday, 6 = Saturday)
function getDayOrder(day: string | undefined): number {
  if (!day) return 7;
  const dayOrder: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return dayOrder[day.toLowerCase()] ?? 7;
}

// Get program icon based on category
function getProgramIcon(program: SanityProgram) {
  const category = program.categories?.[0]?.toLowerCase() || "";
  if (category.includes("youth") || category.includes("sport")) {
    return <Trophy className="w-4 h-4" />;
  }
  if (category.includes("education") || category.includes("quran")) {
    return <GraduationCap className="w-4 h-4" />;
  }
  if (category.includes("sisters") || category.includes("women")) {
    return <Users className="w-4 h-4" />;
  }
  return <BookOpen className="w-4 h-4" />;
}

// Event Card Component
function EventCard({ event, index }: { event: SanityEvent; index: number }) {
  const imageUrl = getImageUrl(event.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/events/${event.slug}`} className="block group">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row h-full">
          {/* Image */}
          {imageUrl ? (
            <div className="relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0">
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 sm:bg-gradient-to-t sm:from-black/20 sm:to-transparent" />
            </div>
          ) : (
            <div className="w-full sm:w-32 h-32 sm:h-auto bg-gradient-to-br from-green-500 to-green-600 flex-shrink-0 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-white/80" />
            </div>
          )}

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {event.categories?.[0] || "Event"}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
              {event.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {event.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-green-500" />
                  <span>{formatEventDate(event.date)}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-green-500" />
                  <span>{event.time}</span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center px-4">
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Recurring Event Card Component (for weekly events)
function RecurringEventCard({ event, index }: { event: SanityEvent; index: number }) {
  const imageUrl = getImageUrl(event.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/events/${event.slug}`} className="block group">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row h-full">
          {/* Image */}
          {imageUrl ? (
            <div className="relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0">
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 sm:bg-gradient-to-t sm:from-black/20 sm:to-transparent" />
            </div>
          ) : (
            <div className="w-full sm:w-32 h-32 sm:h-auto bg-gradient-to-br from-teal-500 to-teal-600 flex-shrink-0 flex items-center justify-center">
              <Repeat className="w-8 h-8 text-white/80" />
            </div>
          )}

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                Weekly
              </span>
              {event.categories?.[0] && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {event.categories[0]}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
              {event.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {event.recurringDay && (
                <div className="flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-teal-500" />
                  <span>Every {getDayFull(event.recurringDay)}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  <span>{event.time}</span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center px-4">
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Compact Program Card Component
function ProgramCard({ program, index }: { program: SanityProgram; index: number }) {
  const schedule = program.recurringDay
    ? `${getDayAbbrev(program.recurringDay)}${program.time ? ` ${program.time}` : ""}`
    : "Contact for schedule";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={program.externalLink || `/programs#${program.slug}`}
        className="block group"
        target={program.externalLink ? "_blank" : undefined}
        rel={program.externalLink ? "noopener noreferrer" : undefined}
      >
        <div className="bg-neutral-800/50 hover:bg-neutral-800 rounded-xl p-3 transition-all duration-300 border border-neutral-700/50 hover:border-neutral-600 h-full">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-400 group-hover:bg-teal-500/30 transition-colors">
              {getProgramIcon(program)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white text-sm mb-1 line-clamp-2 group-hover:text-teal-300 transition-colors">
                {program.title}
              </h4>
              <p className="text-xs text-neutral-400">
                {schedule}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function UpcomingSection({
  events = [],
  programs = [],
}: UpcomingSectionProps) {
  // Filter events to get upcoming dated events (not recurring)
  const datedEvents = events
    .filter((event) => !event.recurring && event.date && !isPrayerProgram(event))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 3);

  // Filter recurring/weekly events (exclude prayer-related)
  const recurringEvents = events
    .filter((event) => event.recurring && event.recurringDay && !isPrayerProgram(event))
    .sort((a, b) => getDayOrder(a.recurringDay) - getDayOrder(b.recurringDay))
    .slice(0, 3);

  // Combine both types for display - dated first, then recurring
  const allEvents = [...datedEvents, ...recurringEvents].slice(0, 4);

  // Filter programs (remove prayer-related ones)
  const filteredPrograms = programs
    .filter((program) => !isPrayerProgram(program))
    .slice(0, 6);

  // Don't render if nothing to show
  if (allEvents.length === 0 && filteredPrograms.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              What&apos;s Happening
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Upcoming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                Events & Programs
              </span>
            </h2>
          </div>
        </FadeIn>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Events */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-green-400" />
                Upcoming Events
              </h3>
              <Button
                href="/events"
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View all
              </Button>
            </div>

            {allEvents.length > 0 ? (
              <div className="space-y-4">
                {allEvents.map((event, index) => (
                  event.recurring ? (
                    <RecurringEventCard key={event._id} event={event} index={index} />
                  ) : (
                    <EventCard key={event._id} event={event} index={index} />
                  )
                ))}
              </div>
            ) : (
              <div className="bg-neutral-800/30 rounded-xl p-8 text-center border border-neutral-700/50">
                <CalendarDays className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
                <p className="text-neutral-400 text-sm">
                  No upcoming events scheduled.
                </p>
                <Button
                  href="/events"
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-green-400 hover:text-green-300"
                >
                  Browse all events
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Programs */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-400" />
                Weekly Programs
              </h3>
              <Button
                href="/programs"
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View all
              </Button>
            </div>

            {filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredPrograms.map((program, index) => (
                  <ProgramCard key={program._id} program={program} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-neutral-800/30 rounded-xl p-8 text-center border border-neutral-700/50">
                <GraduationCap className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
                <p className="text-neutral-400 text-sm">
                  Programs coming soon.
                </p>
                <Button
                  href="/contact"
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-teal-400 hover:text-teal-300"
                >
                  Get notified
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
