/**
 * EventsSection
 *
 * Displays upcoming events in a responsive grid on the homepage.
 * Receives SanityEvent[] data from the server and falls back to
 * hardcoded recurring programs when no CMS events are available.
 *
 * @module components/sections/EventsSection
 */
"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Calendar, Clock, MapPin, Repeat } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SanityEvent, SanityImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";

// Fallback data for when Sanity returns no events
const fallbackRecurringPrograms = [
  {
    _id: "jumuah",
    title: "Jumu'ah Prayer",
    eventType: "recurring" as const,
    recurringDay: "Fridays",
    time: "1:00 PM (Arabic) / 2:15 PM (English)",
    location: "Main Prayer Hall",
    slug: "jumuah-prayer",
    categories: ["Prayer"],
    description: "Weekly congregational Friday prayer with khutbah in Arabic and English sessions.",
  },
  {
    _id: "iqra-academy",
    title: "IQRA Academy",
    eventType: "recurring" as const,
    recurringDay: "Saturdays",
    time: "9:00 AM - 1:00 PM",
    location: "Education Centre",
    slug: "iqra-academy",
    categories: ["Education"],
    description: "Quran recitation, Islamic studies, and memorization classes for children aged 5-12.",
  },
  {
    _id: "salam-arabic",
    title: "Salam Arabic School",
    eventType: "recurring" as const,
    recurringDay: "Weekends",
    time: "Various Sessions",
    location: "Education Centre",
    slug: "salam-arabic",
    categories: ["Education"],
    description: "Comprehensive Arabic language instruction for all levels.",
  },
];

interface EventsSectionProps {
  events?: SanityEvent[];
}

// Helper to get image URL from Sanity or fallback to static path
function getImageUrl(image: SanityImage | string | undefined, fallbackIndex: number): string {
  const fallbacks = ["/images/aic start.jpg", "/images/aic 1.jpg", "/images/aic end.jpg"];
  if (!image) return fallbacks[fallbackIndex % fallbacks.length];
  if (typeof image === "string") return image;
  return urlFor(image).width(400).height(300).url();
}

// Helper to check if a date string is a valid date
function isValidDate(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// Helper to get card description (short description or truncated full description)
function getCardDescription(event: SanityEvent): string {
  if (event.shortDescription) {
    return event.shortDescription;
  }
  // Fallback to truncated full description
  if (event.description && event.description.length > 100) {
    return event.description.substring(0, 97) + "...";
  }
  return event.description || "";
}

// Dated Event Card - Clean modern design with consistent styling
function DatedEventCard({ event, index }: { event: SanityEvent; index: number }) {
  const imageUrl = getImageUrl(event.image, index);
  const eventDate = event.date ? new Date(event.date) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/events/${event.slug || event._id}`} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
          {/* Image with date overlay */}
          <div className="relative h-44 overflow-hidden">
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Date badge */}
            {eventDate && isValidDate(event.date) && (
              <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 shadow-md">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {eventDate.toLocaleDateString('en-AU', { month: 'short' })}
                </p>
                <p className="text-2xl font-bold text-teal-600 leading-none">
                  {eventDate.getDate()}
                </p>
              </div>
            )}

            {/* Category badges */}
            <div className="absolute top-4 right-4 flex flex-wrap gap-1 justify-end max-w-[50%]">
              {event.categories?.slice(0, 2).map((cat, idx) => (
                <span key={idx} className="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                  {cat}
                </span>
              ))}
              {event.categories && event.categories.length > 2 && (
                <span className="px-2 py-1 bg-amber-400 text-white text-xs font-medium rounded-full">
                  +{event.categories.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {getCardDescription(event)}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-500" />
                <span className="truncate">{event.locationDetails || event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Recurring Program Card - Clean consistent design
function RecurringCard({ event, index }: { event: SanityEvent; index: number }) {
  const imageUrl = getImageUrl(event.image, index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/events/${event.slug || event._id}`} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
          <div className="flex flex-col sm:flex-row h-full">
            {/* Image */}
            <div className="relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 sm:bg-gradient-to-t" />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 rounded-full">
                  <Repeat className="w-3 h-3 text-teal-600" />
                  <span className="text-xs font-semibold text-teal-700">{event.recurringDay}</span>
                </div>
                {event.categories?.slice(0, 2).map((cat, idx) => (
                  <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cat === "Prayer"
                      ? "bg-green-50 text-green-700"
                      : "bg-blue-50 text-blue-700"
                  }`}>
                    {cat}
                  </span>
                ))}
                {event.categories && event.categories.length > 2 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{event.categories.length - 2}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                {event.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-500" />
                  <span>{event.locationDetails || event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function EventsSection({ events = [] }: EventsSectionProps) {
  // Separate dated events (non-recurring) and recurring events
  const datedEvents = events
    .filter((e) => e.eventType !== "recurring")
    .slice(0, 2); // Show only first 2 dated events

  // Get recurring events from Sanity or use fallback
  const recurringEvents = events.filter((e) => e.eventType === "recurring");
  const displayRecurring = recurringEvents.length > 0
    ? recurringEvents.slice(0, 3)
    : fallbackRecurringPrograms;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-teal-50/50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-4">
                <Calendar className="w-4 h-4" />
                What&apos;s On
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Upcoming{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                  Events & Programs
                </span>
              </h2>
              <p className="text-gray-600 max-w-xl">
                Join us for spiritual gatherings, educational programs, and community activities.
              </p>
            </div>
            <Button
              href="/events"
              variant="outline"
              icon={<ArrowRight className="w-5 h-5" />}
              className="self-start md:self-auto"
            >
              View All Events
            </Button>
          </div>
        </FadeIn>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Dated Events - Takes up 2 columns */}
          {datedEvents.length > 0 && (
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Coming Up
                </h3>
              </div>
              {datedEvents.map((event, index) => (
                <DatedEventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          )}

          {/* Recurring Programs - Takes up 3 columns (or 5 if no dated events) */}
          <div className={`${datedEvents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Repeat className="w-4 h-4 text-neutral-500" />
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Weekly Programs
              </h3>
            </div>
            <div className="space-y-4">
              {displayRecurring.map((event, index) => (
                <RecurringCard key={event._id} event={event as SanityEvent} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Empty state for when there are no events at all */}
        {datedEvents.length === 0 && recurringEvents.length === 0 && events.length === 0 && (
          <FadeIn>
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 mt-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Stay Connected</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Check our events page for the latest community gatherings and programs.
              </p>
              <Button href="/events" variant="primary">
                View Events Calendar
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
