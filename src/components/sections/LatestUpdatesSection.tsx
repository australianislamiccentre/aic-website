/**
 * LatestUpdatesSection
 *
 * Displays the most recent news and announcements on the homepage in a
 * combined feed. Receives LatestUpdateItem[] data (merged events and
 * announcements) sorted by date, with optional images and urgency badges.
 *
 * @module components/sections/LatestUpdatesSection
 */
"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Bell,
  AlertTriangle,
  Calendar,
  Megaphone,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SanityAnnouncement, SanityImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { LatestUpdateItem } from "@/sanity/lib/fetch";

interface LatestUpdatesSectionProps {
  announcements?: LatestUpdateItem[];
  urgentAnnouncement?: SanityAnnouncement | null;
}

function getImageUrl(image: SanityImage | undefined): string | null {
  if (!image) return null;
  return urlFor(image).width(400).height(300).url();
}

function getPriorityStyles(priority?: string) {
  if (priority === "urgent") {
    return { badge: "bg-red-100 text-red-700", icon: AlertTriangle, color: "text-red-600" };
  }
  if (priority === "important") {
    return { badge: "bg-amber-100 text-amber-700", icon: Bell, color: "text-amber-600" };
  }
  return { badge: "bg-amber-100 text-amber-700", icon: Megaphone, color: "text-amber-600" };
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

// Announcement Card
function AnnouncementCard({ item, index }: { item: LatestUpdateItem; index: number }) {
  const imageUrl = getImageUrl(item.image as SanityImage | undefined);
  const styles = getPriorityStyles(item.priority);
  const isUrgent = item.priority === "urgent";
  const isImportant = item.priority === "important";
  const borderClass = isUrgent ? 'border-red-300' : isImportant ? 'border-amber-200' : 'border-gray-100';


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/announcements/${item.slug}`} className="block group">
        <div className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border ${borderClass} h-full`}>
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
                {item.category && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="h-2" style={{ background: item.priority === 'urgent' ? '#dc2626' : item.priority === 'important' ? '#f59e0b' : '#d97706' }} />
          )}

          <div className="p-5">
            {!imageUrl && item.category && (
              <div className="mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {item.category}
                </span>
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
              {item.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {item.description}
            </p>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className={`w-4 h-4 ${styles.color}`} />
              <span>{formatDate(item.date)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function LatestUpdatesSection({
  announcements = [],
  urgentAnnouncement,
}: LatestUpdatesSectionProps) {
  const limitedAnnouncements = announcements.slice(0, 6);

  return (
    <section className="py-10 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Urgent Banner */}
        {urgentAnnouncement && <UrgentBanner announcement={urgentAnnouncement} />}

        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 mb-5 md:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs sm:text-sm font-medium mb-2 md:mb-3">
                <Megaphone className="w-3.5 h-3.5" />
                Announcements
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Latest{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">
                  Announcements
                </span>
              </h2>
            </div>
            <Button href="/announcements" variant="outline" size="sm">
              View All
            </Button>
          </div>
        </FadeIn>

        {/* Announcements Grid */}
        {limitedAnnouncements.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {limitedAnnouncements.map((item, index) => (
              <AnnouncementCard key={item._id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="text-center py-8 bg-neutral-50 rounded-2xl">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                No announcements right now. Check back soon for updates!
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
