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
  iconKey: string;
}

function transformSanityService(service: SanityService): ServiceDisplay {
  return {
    id: service.slug,
    title: service.title,
    subtitle: service.shortDescription,
    image: service.image ? urlFor(service.image).width(600).height(400).url() : "/images/aic start.jpg",
    features: service.highlights || [],
    schedule: service.availability || "By appointment",
    iconKey: service.icon || "Heart",
  };
}

interface ServicesContentProps {
  services: SanityService[];
}

export default function ServicesContent({ services }: ServicesContentProps) {
  const info = useSiteSettings();

  // Sanity is the single source of truth — no hardcoded fallback
  const serviceDetails: ServiceDisplay[] = services.map((s) => transformSanityService(s));

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-teal-50/30 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
                <HandHeart className="w-4 h-4" />
                Community Support
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Our <span className="text-teal-600">Services</span>
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                From spiritual guidance to practical support, we offer comprehensive services to meet the diverse needs of our community.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  Religious Services
                </span>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Counselling
                </span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Family Support
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic end.jpg"
                  alt="Australian Islamic Centre services"
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
                    <p className="text-2xl font-bold text-teal-600">{services.length}</p>
                    <p className="text-xs text-gray-500">Services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          {serviceDetails.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {serviceDetails.map((service) => {
                const IconComponent = iconMap[service.iconKey] || Sparkles;
                return (
                  <FadeIn key={service.id}>
                    <Link href={`/services/${service.id}`} className="block group">
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <div className="w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                              <IconComponent className="w-5 h-5 text-teal-600" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h2 className="text-lg font-bold text-white leading-tight">{service.title}</h2>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
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

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Schedule */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                            <span>{service.schedule}</span>
                          </div>

                          {/* CTA */}
                          <span className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-600 group-hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm">
                            Learn More
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
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
