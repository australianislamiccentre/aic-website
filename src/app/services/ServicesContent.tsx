"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { aicInfo } from "@/data/content";
import { SanityService } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import {
  ArrowRight,
  Clock,
  Phone,
  Mail,
  Heart,
  BookOpen,
  Users,
  Sparkles,
  Award,
  HandHeart,
  CheckCircle2,
  FileText,
  Shield,
  Building,
  type LucideIcon,
} from "lucide-react";

// Icon mapping for Sanity icon strings
const iconMap: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "hand-heart": HandHeart,
  heart: Heart,
  users: Users,
  sparkles: Sparkles,
  award: Award,
  "file-text": FileText,
  shield: Shield,
  building: Building,
  prayer: Sparkles,
  mosque: Building,
  support: Users,
  certificate: FileText,
};

// Fallback service details when Sanity is empty
const fallbackServiceDetails = [
  {
    id: "religious",
    title: "Religious Services",
    subtitle: "Comprehensive Islamic Guidance",
    description: "We provide comprehensive religious services including advice and guidance on all aspects of Islamic practice, ceremonies related to births, marriages, and deaths, and general religious consultation.",
    image: "/images/aic start.jpg",
    features: [
      "Religious advice and consultation",
      "Birth ceremonies and aqiqah",
      "Shahada (conversion) guidance",
      "General Islamic guidance",
    ],
    schedule: "Available by appointment",
    contact: aicInfo.email,
    iconKey: "book-open",
  },
  {
    id: "funeral",
    title: "Funeral Services",
    subtitle: "Compassionate Care",
    description: "During difficult times, we provide comprehensive and compassionate funeral services according to Islamic traditions, supporting families through the entire process with dignity and care.",
    image: "/images/aic end.jpg",
    features: [
      "Ghusl (ritual washing) services",
      "Janazah (funeral) prayers",
      "Burial arrangement assistance",
      "Grief counselling and support",
    ],
    schedule: "24/7 Emergency service available",
    contact: aicInfo.phone,
    iconKey: "hand-heart",
  },
  {
    id: "nikah",
    title: "Nikah Services",
    subtitle: "Islamic Marriage Ceremonies",
    description: "We provide complete Islamic marriage services including nikah ceremonies, official Islamic Law certificates, pre-marital counselling, and all necessary documentation for a blessed union.",
    image: "/images/aic 5.jpg",
    features: [
      "Traditional nikah ceremonies",
      "Official Islamic Law certificates",
      "Pre-marital counselling sessions",
      "Venue available for ceremonies",
    ],
    schedule: "By appointment",
    contact: aicInfo.email,
    iconKey: "heart",
  },
  {
    id: "counselling",
    title: "Counselling & Support",
    subtitle: "Islamic Guidance & Care",
    description: "Our qualified counsellors provide confidential Islamic counselling for individuals and families, addressing spiritual, personal, and relationship challenges with compassion and wisdom.",
    image: "/images/aic 1.jpg",
    features: [
      "Individual counselling",
      "Family & marriage counselling",
      "Youth guidance and mentoring",
      "Confidential and supportive sessions",
    ],
    schedule: "By appointment",
    contact: aicInfo.email,
    iconKey: "users",
  },
];

const additionalServices = [
  {
    title: "Daily Prayers",
    description: "Join us for the five daily congregational prayers",
    iconKey: "sparkles",
    href: "/worshippers#prayers",
  },
  {
    title: "Friday Jumu'ah",
    description: "Arabic (1:00 PM) and English (2:15 PM) sessions",
    iconKey: "book-open",
    href: "/worshippers#jumuah",
  },
  {
    title: "Library Services",
    description: "Access our collection of Islamic books and resources",
    iconKey: "book-open",
    href: "/contact",
  },
  {
    title: "Facility Hire",
    description: "Hire our facilities for community events",
    iconKey: "award",
    href: "/contact",
  },
];

// Transform Sanity service to display format
interface ServiceDisplay {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  schedule: string;
  contact: string;
  iconKey: string;
  fullDescription?: SanityService["fullDescription"];
}

function transformSanityService(service: SanityService): ServiceDisplay {
  return {
    id: service.slug,
    title: service.title,
    subtitle: service.shortDescription,
    description: service.shortDescription, // Will use fullDescription in detail view if available
    image: service.image ? urlFor(service.image).width(600).height(400).url() : "/images/aic start.jpg",
    features: service.requirements || [],
    schedule: service.availability || "By appointment",
    contact: service.contactEmail || service.contactPhone || aicInfo.email,
    iconKey: service.icon || "book-open",
    fullDescription: service.fullDescription,
  };
}

interface ServicesContentProps {
  services: SanityService[];
}

export default function ServicesContent({ services }: ServicesContentProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Use Sanity data if available, otherwise fallback
  const serviceDetails: ServiceDisplay[] = services.length > 0
    ? services.map(transformSanityService)
    : fallbackServiceDetails;

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="/images/aic 10.webp"
            alt="Services at Australian Islamic Centre"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 via-neutral-800/70 to-neutral-900/90" />
        </motion.div>

        <div className="relative h-full flex flex-col">
          <div className="pt-24 px-6">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="max-w-4xl mx-auto px-6">
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-lime-400 text-sm font-medium mb-6">
                  <Heart className="w-4 h-4" />
                  Our Services
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Serving Our Community with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">Dedication</span>
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  From spiritual guidance to practical support, we offer comprehensive services
                  to meet the diverse needs of our community.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview - Quick Links on Mobile/Tablet, Cards on Desktop */}
      <section className="py-8 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile/Tablet: Compact Quick Links */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {serviceDetails.map((service) => {
                const IconComponent = iconMap[service.iconKey] || BookOpen;
                return (
                  <a
                    key={service.id}
                    href={`#${service.id}`}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center leading-tight">
                      {service.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Desktop: Full Service Cards */}
          <StaggerContainer className="hidden lg:grid lg:grid-cols-4 gap-6">
            {serviceDetails.map((service) => {
              const IconComponent = iconMap[service.iconKey] || BookOpen;
              return (
                <StaggerItem key={service.id}>
                  <ServiceCard
                    icon={<IconComponent className="w-6 h-6" />}
                    title={service.title}
                    description={service.subtitle}
                    features={service.features}
                    href={`#${service.id}`}
                  />
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Detailed Service Sections */}
      {serviceDetails.map((service, index) => {
        const isEven = index % 2 === 0;
        const IconComponent = iconMap[service.iconKey] || BookOpen;

        return (
          <section
            key={service.id}
            id={service.id}
            className={`py-24 ${isEven ? "bg-white" : "bg-neutral-50"}`}
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className={`grid lg:grid-cols-2 gap-16 items-center ${!isEven ? "lg:flex-row-reverse" : ""}`}>
                <FadeIn direction={isEven ? "left" : "right"}>
                  <div className={`${!isEven ? "lg:order-2" : ""}`}>
                    <div className="relative">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={600}
                        height={400}
                        className="rounded-2xl shadow-2xl"
                      />
                      <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Service</p>
                            <p className="font-semibold text-gray-900">{service.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn direction={isEven ? "right" : "left"}>
                  <div className={`${!isEven ? "lg:order-1" : ""}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                      {service.subtitle}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      {service.title}
                    </h2>

                    {/* Render full description from Sanity if available, otherwise plain text */}
                    {service.fullDescription && service.fullDescription.length > 0 ? (
                      <div className="prose prose-lg text-gray-600 mb-8 max-w-none">
                        <PortableText value={service.fullDescription} />
                      </div>
                    ) : (
                      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    {/* Features */}
                    {service.features.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        {service.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Schedule & Contact */}
                    <div className="space-y-3 mb-8">
                      {service.schedule && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="w-5 h-5 text-teal-600" />
                          <span>{service.schedule}</span>
                        </div>
                      )}
                      {service.contact && (
                        <div className="flex items-center gap-3 text-gray-600">
                          {service.contact.includes("@") ? (
                            <>
                              <Mail className="w-5 h-5 text-teal-600" />
                              <a href={`mailto:${service.contact}?subject=${encodeURIComponent(`${service.title} Enquiry - Australian Islamic Centre`)}`} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700">
                                {service.contact}
                              </a>
                            </>
                          ) : (
                            <>
                              <Phone className="w-5 h-5 text-teal-600" />
                              <a href={`tel:${service.contact}`} className="hover:text-neutral-700">
                                {service.contact}
                              </a>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        href="/contact"
                        variant="primary"
                        icon={<ArrowRight className="w-5 h-5" />}
                      >
                        Enquire Now
                      </Button>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>
        );
      })}

      {/* Additional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">More Services</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Explore other services and facilities available at the Australian Islamic Centre.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service) => {
              const IconComponent = iconMap[service.iconKey] || BookOpen;
              return (
                <StaggerItem key={service.title}>
                  <motion.a
                    href={service.href}
                    whileHover={{ y: -4 }}
                    className="block bg-neutral-50 rounded-xl p-6 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </motion.a>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-gradient-to-br from-neutral-800 via-neutral-700 to-sage-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Need Assistance with Our Services?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Our friendly staff are here to help you with any enquiries.
              Reach out to us and we&apos;ll be happy to assist.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/contact"
                variant="white"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Contact Us
              </Button>
              <Button
                href={`tel:${aicInfo.phone}`}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
                icon={<Phone className="w-5 h-5" />}
              >
                Call Now
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
