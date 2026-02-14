"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { formatDate } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { SanityEvent, SanityImage } from "@/types/sanity";
import {
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
  Grid,
  List,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Helper to get image URL from Sanity or fallback to static path
function getImageUrl(image: SanityImage | string | undefined): string {
  if (!image) return "/images/aic 1.jpg";
  if (typeof image === "string") return image;
  return urlFor(image).width(800).height(600).url();
}

// Interactive Event Card with hover reveal
interface EventCardProps {
  event: SanityEvent;
  viewMode: "grid" | "list";
  index: number;
}

// Helper to check if a date string is a valid date
function isValidDate(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// Helper to format display date (handles multi-day events)
function getDisplayDate(event: SanityEvent): string {
  if (event.recurring) {
    return event.recurringDay || event.date || "";
  }
  if (!event.date) return "";

  // Check for multi-day events
  if (event.endDate && event.endDate !== event.date) {
    return `${formatDate(event.date)} - ${formatDate(event.endDate)}`;
  }

  return formatDate(event.date);
}

// Helper to format time display (handles end time)
function getDisplayTime(event: SanityEvent): string {
  if (!event.time) return "";
  if (event.endTime) {
    return `${event.time} - ${event.endTime}`;
  }
  return event.time;
}

// Helper to get card description (short description or truncated full description)
function getCardDescription(event: SanityEvent): string {
  if (event.shortDescription) {
    return event.shortDescription;
  }
  // Fallback to truncated full description
  if (event.description && event.description.length > 120) {
    return event.description.substring(0, 117) + "...";
  }
  return event.description || "";
}

function EventCard({ event, viewMode, index }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(event.image);

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col md:flex-row group"
      >
        <div className="relative md:w-1/3 overflow-hidden">
          <div className="relative h-48 md:h-full">
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {event.recurring && (
              <motion.span
                animate={{ scale: isHovered ? 1.1 : 1 }}
                className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full"
              >
                Recurring
              </motion.span>
            )}
            <div className="absolute top-4 right-4 flex flex-wrap gap-1 justify-end max-w-[60%]">
              {event.categories?.slice(0, 2).map((cat, idx) => (
                <span key={idx} className="px-2 py-1 bg-white/90 text-neutral-700 text-xs font-medium rounded-full">
                  {cat}
                </span>
              ))}
              {event.categories && event.categories.length > 2 && (
                <span className="px-2 py-1 bg-white/90 text-neutral-500 text-xs font-medium rounded-full">
                  +{event.categories.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="md:w-2/3 p-6 flex flex-col justify-center relative">
          <motion.h3
            animate={{ color: isHovered ? "#0d9488" : "#111827" }}
            className="text-xl font-bold mb-3 transition-colors"
          >
            {event.title}
          </motion.h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{getCardDescription(event)}</p>

          <div className="flex flex-wrap gap-4 mb-4">
            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ delay: 0 }}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <Calendar className="w-4 h-4 text-green-600" />
              <span>{getDisplayDate(event)}</span>
            </motion.div>
            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <Clock className="w-4 h-4 text-green-600" />
              <span>{getDisplayTime(event)}</span>
            </motion.div>
            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <MapPin className="w-4 h-4 text-green-600" />
              <span>{event.locationDetails || event.location}</span>
            </motion.div>
          </div>

          <motion.div
            animate={{ opacity: isHovered ? 1 : 0.8, x: isHovered ? 4 : 0 }}
          >
            <Button
              href={`/events/${event.slug || event._id}`}
              variant="outline"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              View Details
            </Button>
          </motion.div>

          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-green-600"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ originY: 0 }}
          />
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group relative"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.div
          animate={{ scale: isHovered ? 1.15 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {event.recurring && (
          <motion.span
            animate={{ y: isHovered ? -2 : 0, scale: isHovered ? 1.05 : 1 }}
            className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Recurring
          </motion.span>
        )}
        <motion.div
          animate={{ y: isHovered ? -2 : 0 }}
          className="absolute top-4 right-4 flex flex-wrap gap-1 justify-end max-w-[60%]"
        >
          {event.categories?.slice(0, 2).map((cat, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/90 text-neutral-700 text-xs font-medium rounded-full">
              {cat}
            </span>
          ))}
          {event.categories && event.categories.length > 2 && (
            <span className="px-2 py-1 bg-white/90 text-neutral-500 text-xs font-medium rounded-full">
              +{event.categories.length - 2}
            </span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-lg"
        >
          <div className="text-center">
            {event.recurring ? (
              <>
                <p className="text-sm font-bold text-green-600">Every</p>
                <p className="text-lg font-bold text-gray-800">
                  {(event.recurringDay || event.date || "").replace("s", "")}
                </p>
              </>
            ) : isValidDate(event.date) ? (
              <>
                <p className="text-2xl font-bold text-green-600">
                  {new Date(event.date!).getDate()}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {new Date(event.date!).toLocaleDateString("en-US", { month: "short" })}
                </p>
              </>
            ) : (
              <p className="text-sm font-bold text-green-600">{event.date}</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="p-6">
        <motion.h3
          animate={{ color: isHovered ? "#0d9488" : "#111827" }}
          className="text-xl font-bold mb-2"
        >
          {event.title}
        </motion.h3>

        {/* Always visible content - no hover-to-reveal */}
        <div>
          <p className="text-gray-600 mb-4 line-clamp-2">{getCardDescription(event)}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-green-600" />
              <span>{getDisplayDate(event)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-green-600" />
              <span>{getDisplayTime(event)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>{event.locationDetails || event.location}</span>
            </div>
          </div>

          <Button
            href={`/events/${event.slug || event._id}`}
            variant="primary"
            size="sm"
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full"
          >
            View Details
          </Button>
        </div>
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

// Categories must match the values in Sanity schema
const categories = [
  "All",
  "Prayer",
  "Education",
  "Community",
  "Youth",
  "Sports",
  "Women",
  "Charity",
  "Special Event",
];

interface EventsContentProps {
  events: SanityEvent[];
}

export default function EventsContent({ events }: EventsContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "All" ||
      (event.categories && event.categories.includes(selectedCategory));
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(searchLower) ||
      (event.shortDescription || "").toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const filteredUpcomingEvents = filteredEvents.filter((e) => !e.recurring);
  const filteredRecurringEvents = filteredEvents.filter((e) => e.recurring);

  return (
    <>
      {/* Hero Section with Image */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-green-50/30 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Community Gatherings
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Events & <span className="text-green-600">Programs</span>
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Discover upcoming events, weekly programs, and community gatherings at the Australian Islamic Centre. From spiritual enrichment to sports and education.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Weekly Programs
                </span>
                <span className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  Special Events
                </span>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Youth Activities
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic 1.jpg"
                  alt="Community gathering at AIC"
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Stats card */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{events.length}</p>
                    <p className="text-xs text-gray-500">Events</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{events.filter(e => e.recurring).length}</p>
                    <p className="text-xs text-gray-500">Weekly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid" ? "bg-white shadow text-green-600" : "text-gray-500"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list" ? "bg-white shadow text-green-600" : "text-gray-500"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Upcoming Events</h2>
          <AnimatePresence mode="wait">
            {filteredUpcomingEvents.length > 0 ? (
              <motion.div
                key={selectedCategory + viewMode + "upcoming"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-6"
                }
              >
                {filteredUpcomingEvents.map((event, index) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    viewMode={viewMode}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-2xl border border-gray-100"
              >
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Subscribe to our mailing list for the latest updates on upcoming events and community gatherings.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Recurring Events Section */}
      {filteredRecurringEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Regular Programs</h2>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory + viewMode + "recurring"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-6"
                }
              >
                {filteredRecurringEvents.map((event, index) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    viewMode={viewMode}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Subscribe CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="bg-gradient-to-r from-green-600 to-primary-700 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Never Miss an Event</h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Subscribe to our newsletter and get notified about upcoming events,
                programs, and community gatherings.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  const emailInput = e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement;
                  const email = emailInput?.value;
                  if (email) {
                    const mailtoLink = `mailto:contact@australianislamiccentre.org?subject=${encodeURIComponent('Newsletter Subscription Request - Events')}&body=${encodeURIComponent(`Please add me to the AIC events newsletter.\n\nEmail: ${email}`)}`;
                    window.open(mailtoLink, '_blank');
                    emailInput.value = '';
                  }
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button type="submit" variant="gold">
                  Subscribe
                </Button>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
