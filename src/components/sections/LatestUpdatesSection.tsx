"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Bell,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Megaphone,
  CalendarDays,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SanityAnnouncement, SanityImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { LatestUpdateItem } from "@/sanity/lib/fetch";

interface LatestUpdatesSectionProps {
  announcements?: LatestUpdateItem[];
  events?: LatestUpdateItem[];
  urgentAnnouncement?: SanityAnnouncement | null;
}

// Helper to get image URL from Sanity
function getImageUrl(image: SanityImage | undefined): string | null {
  if (!image) return null;
  return urlFor(image).width(400).height(300).url();
}

// Get type-specific styles
function getTypeStyles(type: string, priority?: string) {
  if (priority === "urgent") {
    return { badge: "bg-red-100 text-red-700", icon: AlertTriangle, color: "text-red-600" };
  }
  if (priority === "important") {
    return { badge: "bg-amber-100 text-amber-700", icon: Bell, color: "text-amber-600" };
  }

  switch (type) {
    case "announcement":
      return { badge: "bg-amber-100 text-amber-700", icon: Megaphone, color: "text-amber-600" };
    case "event":
      return { badge: "bg-green-100 text-green-700", icon: CalendarDays, color: "text-green-600" };
    default:
      return { badge: "bg-gray-100 text-gray-700", icon: Bell, color: "text-gray-600" };
  }
}

// Get link for item
function getItemLink(item: LatestUpdateItem): string {
  switch (item._type) {
    case "announcement":
      return `/announcements/${item.slug}`;
    case "event":
      return `/events/${item.slug}`;
    default:
      return "/";
  }
}

// Get type label
function getTypeLabel(type: string): string {
  switch (type) {
    case "announcement":
      return "Announcement";
    case "event":
      return "Event";
    default:
      return "Update";
  }
}

// Urgent Alert Banner
function UrgentBanner({ announcement }: { announcement: SanityAnnouncement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-600 text-white py-3 px-4 mb-8 rounded-xl"
    >
      <Link href={`/announcements/${announcement.slug}`} className="flex items-center justify-between gap-4 group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{announcement.title}</p>
            <p className="text-red-100 text-sm line-clamp-1">{announcement.excerpt}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

// Update Card Component
function UpdateCard({ item, index }: { item: LatestUpdateItem; index: number }) {
  const imageUrl = getImageUrl(item.image as SanityImage | undefined);
  const styles = getTypeStyles(item._type, item.priority);
  const TypeIcon = styles.icon;
  const isHighlighted = item.priority === "important" || item.priority === "urgent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={getItemLink(item)} className="block group">
        <div className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border ${isHighlighted ? 'border-amber-200' : 'border-gray-100'} h-full`}>
          {/* Image or gradient header */}
          {imageUrl ? (
            <div className="relative h-40 overflow-hidden">
              <Image
                src={imageUrl}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                  {getTypeLabel(item._type)}
                </span>
                {item.category && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className={`h-2 ${isHighlighted ? 'bg-gradient-to-r from-amber-400 to-amber-500' : item._type === 'event' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`} />
          )}

          {/* Content */}
          <div className="p-5">
            {!imageUrl && (
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                  {getTypeLabel(item._type)}
                </span>
                {item.category && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {item.category}
                  </span>
                )}
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
              {item.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {item.description}
            </p>

            {/* Meta info based on type */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {item._type === "event" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Calendar className={`w-4 h-4 ${styles.color}`} />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  {item.time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${styles.color}`} />
                      <span>{item.time}</span>
                    </div>
                  )}
                </>
              )}

              {item._type === "announcement" && (
                <div className="flex items-center gap-1.5">
                  <Calendar className={`w-4 h-4 ${styles.color}`} />
                  <span>{formatDate(item.date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Mobile Banner Button Component
function MobileBannerButton({
  href,
  icon: Icon,
  label,
  description,
  color
}: {
  href: string;
  icon: typeof Megaphone;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${color}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{label}</p>
            <p className="text-sm opacity-80">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
      </motion.div>
    </Link>
  );
}

export function LatestUpdatesSection({
  announcements = [],
  events = [],
  urgentAnnouncement,
}: LatestUpdatesSectionProps) {
  // Limit announcements
  const limitedAnnouncements = announcements.slice(0, 6);
  const hasContent = limitedAnnouncements.length > 0 || !!urgentAnnouncement;

  // Mobile banner links
  const mobileBanners = [
    {
      href: "/announcements",
      icon: Megaphone,
      label: "Announcements",
      description: "Latest news & updates",
      color: "bg-amber-500 text-white hover:bg-amber-600",
    },
    {
      href: "/events",
      icon: CalendarDays,
      label: "Events",
      description: "Upcoming activities",
      color: "bg-green-500 text-white hover:bg-green-600",
    },
    {
      href: "/donate",
      icon: Heart,
      label: "Donate",
      description: "Support our causes",
      color: "bg-teal-500 text-white hover:bg-teal-600",
    },
  ];

  return (
    <section className="py-10 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Urgent Banner */}
        {urgentAnnouncement && <UrgentBanner announcement={urgentAnnouncement} />}

        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 mb-5 md:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs sm:text-sm font-medium mb-2 md:mb-3">
                <Bell className="w-3.5 h-3.5" />
                Stay Updated
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Latest{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                  Updates
                </span>
              </h2>
            </div>
            {/* Desktop buttons - hidden on mobile */}
            <div className="hidden md:flex gap-3">
              <Button href="/announcements" variant="outline" size="sm">
                Announcements
              </Button>
              <Button href="/events" variant="outline" size="sm">
                Events
              </Button>
              <Button href="/donate" variant="outline" size="sm">
                Donate
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Mobile: Banner Buttons */}
        <div className="md:hidden space-y-2 mb-6">
          {mobileBanners.map((banner, index) => (
            <motion.div
              key={banner.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MobileBannerButton {...banner} />
            </motion.div>
          ))}
        </div>

        {/* Desktop: Announcements */}
        <div className="hidden md:block">
          {limitedAnnouncements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
                <span className="text-sm text-gray-400">({limitedAnnouncements.length})</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {limitedAnnouncements.map((item, index) => (
                  <UpdateCard key={item._id} item={item} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty state when no announcements */}
        {limitedAnnouncements.length === 0 && (
          <FadeIn>
            <div className="hidden md:block text-center py-8 bg-neutral-50 rounded-2xl">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                No announcements right now. Check back soon for updates!
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <Button href="/announcements" variant="outline" size="sm">
                  View Past Announcements
                </Button>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
