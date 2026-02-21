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

// Event Card Component (compact vertical card with image at top)
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
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col">
          {/* Image at top */}
          <div className="relative h-32 w-full overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CalendarDays className="w-8 h-8 text-white/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Category badge */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                {event.categories?.[0] || "Event"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
              {event.title}
            </h3>

            {/* Short description if available */}
            {event.shortDescription && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">
                {event.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-auto">
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
        </div>
      </Link>
    </motion.div>
  );
}

// Weekly Event Card Component (compact with image at top)
function WeeklyEventCard({ event, index }: { event: SanityEvent; index: number }) {
  const imageUrl = getImageUrl(event.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/events/${event.slug}`} className="block group">
        <div className="bg-neutral-800/50 hover:bg-neutral-800 rounded-xl overflow-hidden transition-all duration-300 border border-neutral-700/50 hover:border-teal-500/50 h-full">
          {/* Image at top */}
          <div className="relative h-32 w-full overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
                <Repeat className="w-8 h-8 text-white/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />

            {/* Weekly Badge */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500 text-white">
                Weekly
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-semibold text-white mb-2 group-hover:text-teal-300 transition-colors line-clamp-2">
              {event.title}
            </h4>

            {/* Short description if available */}
            {event.shortDescription && (
              <p className="text-neutral-400 text-sm line-clamp-2 mb-3">
                {event.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
              {event.recurringDay && (
                <div className="flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-teal-400" />
                  <span>{getDayFull(event.recurringDay)}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{event.time}</span>
                </div>
              )}
            </div>
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
        href={program.externalLink || `/events/${program.slug}`}
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
    .filter((event) => event.eventType !== "recurring" && event.date && !isPrayerProgram(event))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 4);

  // Filter recurring/weekly events separately (exclude prayer-related)
  const weeklyEvents = events
    .filter((event) => event.eventType === "recurring" && event.recurringDay && !isPrayerProgram(event))
    .sort((a, b) => getDayOrder(a.recurringDay) - getDayOrder(b.recurringDay))
    .slice(0, 4);

  // Filter programs (remove prayer-related ones)
  const filteredPrograms = programs
    .filter((program) => !isPrayerProgram(program))
    .slice(0, 6);

  // Don't render if nothing to show
  if (datedEvents.length === 0 && weeklyEvents.length === 0 && filteredPrograms.length === 0) {
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

        {/* Row 1: Upcoming Dated Events */}
        {datedEvents.length > 0 && (
          <div className="mb-10">
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {datedEvents.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Row 2: Weekly Programs */}
        {filteredPrograms.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-400" />
                Weekly Programs
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {filteredPrograms.map((program, index) => (
                <ProgramCard key={program._id} program={program} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Row 3: Weekly Events (at bottom) */}
        {weeklyEvents.length > 0 && (
          <div className="pt-8 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-teal-400" />
                Weekly Events
              </h3>
              <Button
                href="/events?type=recurring"
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View all
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeklyEvents.map((event, index) => (
                <WeeklyEventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
