"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";

import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { SanityService } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import {
  ArrowRight,
  Clock,
  Phone,
  Mail,
  Heart,
  BookOpen,
  Users,
  Sparkles,
  HandHeart,
  CheckCircle2,
  Moon,
  Calendar,
  Star,
  Home,
  GraduationCap,
  Church,
  Baby,
  Scroll,
  MessageCircle,
  Scale,
  type LucideIcon,
} from "lucide-react";

// Icon mapping — keys must match Sanity schema icon values (PascalCase)
const iconMap: Record<string, LucideIcon> = {
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

// No hardcoded fallback — Sanity is the single source of truth for services.

// Transform Sanity service to display format
interface ServiceDisplay {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  features: string[];
  schedule: string;
  contact: string;
  iconKey: string;
}

function transformSanityService(service: SanityService, defaultEmail: string): ServiceDisplay {
  return {
    id: service.slug,
    title: service.title,
    subtitle: service.shortDescription,
    image: service.image ? urlFor(service.image).width(600).height(400).url() : "/images/aic start.jpg",
    features: service.highlights || [],
    schedule: service.availability || "By appointment",
    contact: service.contactEmail || service.contactPhone || defaultEmail,
    iconKey: service.icon || "Heart",
  };
}

interface ServicesContentProps {
  services: SanityService[];
}

export default function ServicesContent({ services }: ServicesContentProps) {
  const info = useSiteSettings();

  // Sanity is the single source of truth — no hardcoded fallback
  const serviceDetails: ServiceDisplay[] = services.map((s) => transformSanityService(s, info.email));

  return (
    <>
      {/* Header */}
      <section className="pt-8 pb-4 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Our <span className="text-teal-600">Services</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              From spiritual guidance to practical support, we offer comprehensive services to meet the diverse needs of our community.
            </p>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {serviceDetails.length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-gray-100">
              <Heart className="w-14 h-14 mx-auto text-gray-300 mb-5" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Services Are Being Updated</h3>
              <p className="text-gray-500 max-w-lg mx-auto mb-3">
                We&apos;re currently adding our full range of services to the website. These include religious guidance,
                nikah ceremonies, funeral services, counselling, and more.
              </p>
              <p className="text-gray-500 max-w-lg mx-auto mb-6">
                In the meantime, please don&apos;t hesitate to reach out — we&apos;re here to help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`mailto:${info.email}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
                <a
                  href={`tel:${info.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-200 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  {info.phone}
                </a>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {serviceDetails.map((service) => {
                const IconComponent = iconMap[service.iconKey] || Sparkles;
                return (
                  <FadeIn key={service.id}>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-52">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <div className="w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <IconComponent className="w-5 h-5 text-teal-600" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4">
                          <h2 className="text-lg font-bold text-white leading-tight">{service.title}</h2>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Short description */}
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                          {service.subtitle}
                        </p>

                        {/* Highlights */}
                        {service.features.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {service.features.slice(0, 3).map((feature) => (
                              <div key={feature} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Spacer to push footer down */}
                        <div className="flex-1" />

                        {/* Schedule */}
                        {service.schedule && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                            <span>{service.schedule}</span>
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <Link
                            href={`/services/${service.id}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm"
                          >
                            Learn More
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            Contact Us
                          </Link>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
