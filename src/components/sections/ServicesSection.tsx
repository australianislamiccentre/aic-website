/**
 * ServicesSection
 *
 * Displays the centre's services in an animated, staggered grid on the homepage.
 * Receives SanityService[] data from the CMS, mapping each service to an icon
 * and linking through to its detail page.
 *
 * @module components/sections/ServicesSection
 */
"use client";

import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { SanityService, SanityImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Users,
  BookOpen,
  Award,
  HandHeart,
  Moon,
  Calendar,
  Star,
  Home,
  GraduationCap,
  Church,
} from "lucide-react";

// Map Sanity icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon: Moon,
  BookOpen: BookOpen,
  Heart: Heart,
  Users: Users,
  Calendar: Calendar,
  Star: Star,
  Home: Home,
  HandHeart: HandHeart,
  GraduationCap: GraduationCap,
  Church: Church,
  // Fallback mappings for legacy icon names
  prayer: Sparkles,
  mosque: BookOpen,
  heart: Heart,
  support: HandHeart,
  users: Users,
  certificate: Award,
};

// Filter out prayer-related services
const PRAYER_KEYWORDS = [
  "friday prayer",
  "jumu'ah",
  "jumuah",
  "daily prayer",
  "prayer times",
  "salah",
  "salat",
  "religious services",
];

function isPrayerService(service: SanityService): boolean {
  const title = service.title.toLowerCase();
  return PRAYER_KEYWORDS.some((keyword) => title.includes(keyword));
}

// Get image URL from Sanity
function getImageUrl(image: SanityImage | undefined): string | null {
  if (!image) return null;
  return urlFor(image).width(600).height(400).url();
}

interface ServicesSectionProps {
  services: SanityService[];
}

// Service Card Component with image
function ServiceCard({ service, index }: { service: SanityService; index: number }) {
  const imageUrl = getImageUrl(service.image);
  const Icon = iconMap[service.icon] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/services/${service.slug}`} className="block group h-full">
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={service.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Icon className="w-16 h-16 text-white/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Icon overlay */}
            <div className="absolute bottom-3 left-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
              {service.shortDescription}
            </p>
            <div className="flex items-center text-teal-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ServicesSection({ services }: ServicesSectionProps) {
  // Filter out prayer-related services and take top 3
  const filteredServices = services
    .filter((service) => !isPrayerService(service))
    .slice(0, 3);

  // Show nothing if no services
  if (filteredServices.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-neutral-100 rounded-full blur-3xl opacity-40 -translate-x-1/2" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-40 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Our Services
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Serving Our Community with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">Excellence</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              From spiritual guidance to practical support, we offer comprehensive
              services to meet the diverse needs of our community. On top of daily prayers
              and Friday prayers, we provide a range of religious and community services
              to support you through life&apos;s important moments.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <ServiceCard key={service._id} service={service} index={index} />
          ))}
        </div>

        <FadeIn delay={0.4}>
          <div className="text-center mt-12">
            <Button
              href="/services"
              variant="outline"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              View All Services
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
