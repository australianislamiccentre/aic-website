"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { SanityService, SanityEvent, SanityProgram, SanityImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  GraduationCap,
  Sparkles,
  Repeat,
  Moon,
  BookOpen,
  Users,
  Star,
  Home,
  HandHeart,
  Church,
  Baby,
  Scroll,
  MessageCircle,
  Scale,
} from "lucide-react";

interface WhatsOnSectionProps {
  services?: SanityService[];
  events?: SanityEvent[];
  programs?: SanityProgram[];
}

// Get image URL from Sanity — safe against null/invalid sources
function getImageUrl(image: SanityImage | undefined, w = 400, h = 300): string | null {
  if (!image) return null;
  try {
    return urlFor(image).width(w).height(h).url();
  } catch {
    return null;
  }
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

// Filter prayer-related items
const PRAYER_KEYWORDS = [
  "friday prayer", "jumu'ah", "jumuah", "jummah",
  "daily prayer", "prayer times", "salah", "salat",
  "taraweeh", "tarawih",
];

function isPrayerRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return PRAYER_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// Icon map for services — keys match Sanity schema icon values
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon,
  Heart,
  BookOpen,
  Users,
  Calendar,
  Star,
  Home,
  HandHeart,
  GraduationCap,
  Church,
  Baby,
  Scroll,
  MessageCircle,
  Scale,
};

// ─── Card Components ───────────────────────────────────────────────

function EventItem({ event, index }: { event: SanityEvent; index: number }) {
  const imageUrl = event.image ? getImageUrl(event.image, 200, 200) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/events/${event.slug}`} className="block group">
        <div className="flex gap-3 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
          <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <Image src={imageUrl} alt={event.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white/70" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-green-600 transition-colors">
              {event.title}
            </h4>
            {event.shortDescription && (
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                {event.shortDescription}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-2.5 mt-0.5 text-xs text-gray-500">
              {event.date && !event.recurring && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-green-500" />
                  {formatEventDate(event.date)}
                </span>
              )}
              {event.recurring && event.recurringDay && (
                <span className="flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-teal-500" />
                  {event.recurringDay}
                </span>
              )}
              {event.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-green-500" />
                  {event.time}
                </span>
              )}
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 transition-all flex-shrink-0 mt-1 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

function ProgramItem({ program, index }: { program: SanityProgram; index: number }) {
  const imageUrl = program.image ? getImageUrl(program.image, 200, 200) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        href={program.externalLink || `/programs#${program.slug}`}
        className="block group"
        target={program.externalLink ? "_blank" : undefined}
        rel={program.externalLink ? "noopener noreferrer" : undefined}
      >
        <div className="flex gap-3 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all duration-200">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {imageUrl ? (
              <Image src={imageUrl} alt={program.title} fill className="object-cover" />
            ) : (
              <GraduationCap className="w-5 h-5 text-white/80" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-teal-600 transition-colors">
              {program.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-2.5 mt-0.5 text-xs text-gray-500">
              {program.recurringDay && (
                <span className="flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-teal-500" />
                  {program.recurringDay}
                </span>
              )}
              {program.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-500" />
                  {program.time}
                </span>
              )}
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-500 transition-all flex-shrink-0 mt-1 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

function ServiceItem({ service, index }: { service: SanityService; index: number }) {
  const imageUrl = service.image ? getImageUrl(service.image, 200, 200) : null;
  const Icon = iconMap[service.icon] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/services/${service.slug}`} className="block group">
        <div className="flex gap-3 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
          <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <Image src={imageUrl} alt={service.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white/70" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-green-600 transition-colors">
              {service.title}
            </h4>
            {service.shortDescription && (
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                {service.shortDescription}
              </p>
            )}
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 transition-all flex-shrink-0 mt-1 hidden sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Tab / Column Config ──────────────────────────────────────────

type TabId = "events" | "programs" | "services";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  activeColor: string;
  iconBg: string;
  linkColor: string;
}

const allTabs: TabConfig[] = [
  { id: "events", label: "Events", icon: <Calendar className="w-4 h-4" />, href: "/events", color: "text-gray-500", activeColor: "text-green-600 border-green-600", iconBg: "bg-green-100", linkColor: "text-green-600 hover:text-green-700" },
  { id: "programs", label: "Programs", icon: <GraduationCap className="w-4 h-4" />, href: "/programs", color: "text-gray-500", activeColor: "text-teal-600 border-teal-600", iconBg: "bg-teal-100", linkColor: "text-teal-600 hover:text-teal-700" },
  { id: "services", label: "Services", icon: <Heart className="w-4 h-4" />, href: "/services", color: "text-gray-500", activeColor: "text-green-600 border-green-600", iconBg: "bg-green-100", linkColor: "text-green-600 hover:text-green-700" },
];

// ─── Column Header (desktop) ───────────────────────────────────────

function ColumnHeader({ icon, iconBg, title, href, linkColor }: { icon: React.ReactNode; iconBg: string; title: string; href: string; linkColor: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
        <div className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        {title}
      </h3>
      <Link href={href} className={`text-xs ${linkColor} font-medium flex items-center gap-1`}>
        All <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────

export function WhatsOnSection({ services = [], events = [], programs = [] }: WhatsOnSectionProps) {
  // Filter out prayer-related content — Sanity data only
  const filteredPrograms = useMemo(() => programs.filter((p) => !isPrayerRelated(p.title)).slice(0, 3), [programs]);
  const filteredServices = useMemo(() => services.filter((s) => !isPrayerRelated(s.title)).slice(0, 3), [services]);

  // Deduplicate: exclude events that already appear in Programs
  const programIds = useMemo(() => new Set(filteredPrograms.map((p) => p._id)), [filteredPrograms]);
  const filteredEvents = useMemo(
    () => events.filter((e) => !isPrayerRelated(e.title) && !programIds.has(e._id)).slice(0, 3),
    [events, programIds],
  );

  // Only show tabs that have content
  const activeTabs = useMemo(() => {
    return allTabs.filter((tab) => {
      if (tab.id === "events") return filteredEvents.length > 0;
      if (tab.id === "programs") return filteredPrograms.length > 0;
      if (tab.id === "services") return filteredServices.length > 0;
      return false;
    });
  }, [filteredEvents, filteredPrograms, filteredServices]);

  // Default to the first available tab
  const [activeTab, setActiveTab] = useState<TabId>("events");

  // If the selected tab has no content, fall back to first available
  const effectiveTab = activeTabs.find((t) => t.id === activeTab) ? activeTab : activeTabs[0]?.id;

  const activeTabHref = allTabs.find((t) => t.id === effectiveTab)?.href || "/";

  // Don't render section if there's no Sanity content at all
  if (activeTabs.length === 0) return null;

  // Desktop grid columns based on how many categories have content
  const desktopGridCols = activeTabs.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" : activeTabs.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3";

  return (
    <section className="py-10 md:py-16 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <FadeIn>
          <div className="mb-6 md:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              What&apos;s On at AIC
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Discover What&apos;s{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">
                Happening
              </span>
            </h2>
            <p className="text-gray-600 mt-1.5 max-w-xl text-xs sm:text-sm md:text-base">
              Events, programs, and services — there&apos;s always something at AIC.
            </p>
          </div>
        </FadeIn>

        {/* ── Mobile: Tabbed Interface ── */}
        <div className="md:hidden">
          {/* Tab Bar — only show tabs with content */}
          {activeTabs.length > 1 && (
            <div className="flex border-b border-gray-200 mb-4">
              {activeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    effectiveTab === tab.id ? tab.activeColor : "border-transparent " + tab.color
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {effectiveTab === "events" && filteredEvents.map((item, i) => <EventItem key={item._id} event={item} index={i} />)}
              {effectiveTab === "programs" && filteredPrograms.map((item, i) => <ProgramItem key={item._id} program={item} index={i} />)}
              {effectiveTab === "services" && filteredServices.map((item, i) => <ServiceItem key={item._id} service={item} index={i} />)}
            </motion.div>
          </AnimatePresence>

          {/* View All link */}
          <div className="text-center mt-4">
            <Link
              href={activeTabHref}
              className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View all {effectiveTab} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Desktop: Dynamic Column Grid ── */}
        <div className={`hidden md:grid gap-5 ${desktopGridCols}`}>
          {activeTabs.map((tab, tabIndex) => (
            <FadeIn key={tab.id} delay={tabIndex * 0.1}>
              <div>
                <ColumnHeader
                  icon={tab.id === "programs"
                    ? <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    : tab.id === "events"
                    ? <Calendar className="w-3.5 h-3.5 text-green-600" />
                    : <Heart className="w-3.5 h-3.5 text-green-600" />
                  }
                  iconBg={tab.iconBg}
                  title={tab.label}
                  href={tab.href}
                  linkColor={tab.linkColor}
                />
                <div className="space-y-2">
                  {tab.id === "events" && filteredEvents.map((event, i) => (
                    <EventItem key={event._id} event={event} index={i} />
                  ))}
                  {tab.id === "programs" && filteredPrograms.map((program, i) => (
                    <ProgramItem key={program._id} program={program} index={i} />
                  ))}
                  {tab.id === "services" && filteredServices.map((service, i) => (
                    <ServiceItem key={service._id} service={service} index={i} />
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
