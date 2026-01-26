"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { formatDate } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { SanityAnnouncement, SanityImage } from "@/types/sanity";
import {
  Bell,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

// Helper to get image URL from Sanity
function getImageUrl(image: SanityImage | undefined): string | null {
  if (!image) return null;
  return urlFor(image).width(600).height(400).url();
}

// Category color mapping
function getCategoryStyles(category: string, priority: string) {
  if (priority === "urgent") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (priority === "important") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  switch (category) {
    case "Prayer":
      return "bg-green-100 text-green-700 border-green-200";
    case "Ramadan":
    case "Eid":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Education":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Maintenance":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-teal-100 text-teal-700 border-teal-200";
  }
}

// Announcement Card Component
function AnnouncementCard({ announcement, index }: { announcement: SanityAnnouncement; index: number }) {
  const imageUrl = getImageUrl(announcement.image);
  const categoryStyles = getCategoryStyles(announcement.category, announcement.priority);
  const isHighlighted = announcement.priority === "important" || announcement.priority === "urgent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/announcements/${announcement.slug}`} className="block group">
        <div className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${isHighlighted ? 'border-amber-200' : 'border-gray-100'} h-full flex flex-col`}>
          {/* Image */}
          {imageUrl ? (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={imageUrl}
                alt={announcement.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Priority badge for urgent/important */}
              {isHighlighted && (
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    announcement.priority === "urgent"
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {announcement.priority === "urgent" ? "Urgent" : "Important"}
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 ${getCategoryStyles(announcement.category, "normal").replace('bg-', 'text-').split(' ')[1]}`}>
                  {announcement.category}
                </span>
              </div>
            </div>
          ) : (
            <div className={`h-2 ${isHighlighted ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-teal-500 to-teal-600'}`} />
          )}

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            {!imageUrl && (
              <div className="flex items-center gap-2 mb-3">
                {isHighlighted && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    announcement.priority === "urgent"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {announcement.priority === "urgent" ? "Urgent" : "Important"}
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryStyles}`}>
                  {announcement.category}
                </span>
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
              {announcement.title}
            </h3>

            <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
              {announcement.excerpt}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 text-teal-500" />
                <span>{formatDate(announcement.date)}</span>
              </div>
              <span className="text-teal-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Read more <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Categories must match the values in Sanity schema
const categories = [
  "All",
  "General",
  "Prayer",
  "Ramadan",
  "Eid",
  "Community",
  "Education",
  "Maintenance",
];

interface AnnouncementsContentProps {
  announcements: SanityAnnouncement[];
}

export default function AnnouncementsContent({ announcements }: AnnouncementsContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesCategory = selectedCategory === "All" || announcement.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchLower) ||
      announcement.excerpt.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  // Separate urgent and other announcements
  const urgentAnnouncements = filteredAnnouncements.filter(a => a.priority === "urgent");
  const otherAnnouncements = filteredAnnouncements.filter(a => a.priority !== "urgent");

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="mb-8">
            <Breadcrumb />
          </div>
          <FadeIn>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-amber-400 text-sm font-medium mb-6">
                <Bell className="w-4 h-4" />
                Stay Informed
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                News &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
                  Announcements
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Stay up to date with important updates, community news, and activities at the Australian Islamic Centre.
              </p>
            </div>
          </FadeIn>
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
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Announcements Banner */}
      {urgentAnnouncements.length > 0 && (
        <section className="py-6 bg-red-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-3">
              {urgentAnnouncements.map((announcement) => (
                <Link
                  key={announcement._id}
                  href={`/announcements/${announcement.slug}`}
                  className="block bg-red-600 text-white py-4 px-6 rounded-xl hover:bg-red-700 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{announcement.title}</p>
                        <p className="text-red-100 text-sm">{announcement.excerpt}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Announcements List */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {otherAnnouncements.length > 0 ? (
              <motion.div
                key={selectedCategory + searchQuery}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {otherAnnouncements.map((announcement, index) => (
                  <AnnouncementCard
                    key={announcement._id}
                    announcement={announcement}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-2xl border border-gray-100"
              >
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Announcements Found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchQuery || selectedCategory !== "All"
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "Check back soon for updates and community news."}
                </p>
                {(searchQuery || selectedCategory !== "All") && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Never Miss an Update</h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Subscribe to our newsletter and get notified about important announcements and community news.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  const emailInput = e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement;
                  const email = emailInput?.value;
                  if (email) {
                    const mailtoLink = `mailto:contact@australianislamiccentre.org?subject=${encodeURIComponent('Newsletter Subscription Request')}&body=${encodeURIComponent(`Please add me to the AIC newsletter.\n\nEmail: ${email}`)}`;
                    window.open(mailtoLink, '_blank');
                    emailInput.value = '';
                  }
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
