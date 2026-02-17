"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { SanityTourType, SanityEtiquette, SanityFaq } from "@/types/sanity";
import { PortableText } from "@portabletext/react";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Car,
  Train,
  Bus,
  Calendar,
  Camera,
  Users,
  Info,
  Navigation,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Building,
  GraduationCap,
  Footprints,
  Shirt,
  Volume2,
  HandHeart,
  Droplets,
} from "lucide-react";
import { useState } from "react";

const facilities = [
  { name: "Main Prayer Hall", capacity: "1,000+", icon: Users },
  { name: "Women's Prayer Area", capacity: "500+", icon: Users },
  { name: "Education Centre", capacity: "200", icon: GraduationCap },
  { name: "Community Hall", capacity: "300", icon: Users },
  { name: "Youth Centre", capacity: "100", icon: Users },
  { name: "Library", capacity: "30", icon: Building },
];

const openingHours = [
  { day: "Monday - Thursday", hours: "Fajr - Isha" },
  { day: "Friday", hours: "Fajr - Late (Jumu'ah)" },
  { day: "Saturday", hours: "Fajr - Isha" },
  { day: "Sunday", hours: "Fajr - Isha" },
];

const etiquetteIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  shirt: Shirt,
  volume: Volume2,
  hands: HandHeart,
  droplets: Droplets,
  help: HelpCircle,
};

const tourTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building,
  graduation: GraduationCap,
  mosque: Building,
  info: Info,
};

interface VisitContentProps {
  tourTypes: SanityTourType[];
  etiquette: SanityEtiquette[];
  faqs: SanityFaq[];
}

export default function VisitContent({ tourTypes, etiquette, faqs }: VisitContentProps) {
  const info = useSiteSettings();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Visit <span className="text-teal-600">Us</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Plan your visit to the Australian Islamic Centre. We welcome visitors of all faiths to experience our beautiful award-winning architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Visiting Hours */}
      <section id="hours" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <FadeIn direction="left">
              <div className="relative h-[400px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/aic end.jpg"
                  alt="Australian Islamic Centre"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-teal-400" />
                    <h3 className="text-xl font-bold mb-2">{info.name}</h3>
                    <p className="text-white/80 mb-4">{info.address.full}</p>
                    <Button
                      href={`https://maps.google.com/?q=${encodeURIComponent(info.address.full)}`}
                      variant="gold"
                      icon={<Navigation className="w-4 h-4" />}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Visiting Information</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600">
                        {info.address.street}<br />
                        {info.address.suburb}, {info.address.state} {info.address.postcode}<br />
                        {info.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <a href={`tel:${info.phone}`} className="text-gray-600 hover:text-neutral-700">
                        {info.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a href={`mailto:${info.email}?subject=${encodeURIComponent('Visit Enquiry - Australian Islamic Centre')}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-neutral-700">
                        {info.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Opening Hours</h3>
                      <div className="space-y-1">
                        {openingHours.map((item) => (
                          <div key={item.day} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.day}</span>
                            <span className="text-gray-900 font-medium">{item.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Book a Visit */}
      <section id="book" className="py-20 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-200 text-sm font-medium mb-4">
                <Calendar className="w-4 h-4" />
                Book a Tour
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Guided Tours Available
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Experience our award-winning architecture and learn about our community through our guided tours.
                Each visit includes prayer observation, a guided building tour, and Q&A session.
              </p>
            </div>
          </FadeIn>

          {tourTypes.length > 0 && (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {tourTypes.map((tour) => {
                const Icon = tourTypeIcons[tour.icon] || Building;
                return (
                  <StaggerItem key={tour._id}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl p-6 shadow-lg"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{tour.title}</h3>
                      <p className="text-gray-600 text-sm">{tour.description}</p>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}

          <FadeIn>
            <div className="text-center">
              <Button
                href="/contact"
                variant="white"
                size="lg"
                icon={<Calendar className="w-5 h-5" />}
              >
                Book Your Visit
              </Button>
              <p className="text-white/70 text-sm mt-4">
                Contact us to arrange a guided tour for individuals or groups
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Mosque Manners */}
      <section id="manners" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                <Info className="w-4 h-4" />
                Visitor Guidelines
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Mosque Manners
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We welcome visitors of all faiths. Please observe these guidelines during your visit.
              </p>
            </div>
          </FadeIn>

          {etiquette.length > 0 ? (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {etiquette.map((item) => {
                const Icon = etiquetteIcons[item.icon] || CheckCircle2;
                return (
                  <StaggerItem key={item._id}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-neutral-50 rounded-xl p-6 border border-gray-100"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Please contact us for visitor guidelines before your visit.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Virtual Tour Placeholder */}
      <section id="virtual-tour" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div className="relative">
                <Image
                  src="/images/aic 2.jpg"
                  alt="360 Virtual Tour"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-neutral-900/50 rounded-2xl flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-6">
                  <Camera className="w-4 h-4" />
                  360° Virtual Tour
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Explore from Anywhere
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Can&apos;t visit in person? Take a virtual 360-degree tour of our award-winning
                  architecture and facilities from the comfort of your home.
                </p>
                <p className="text-gray-600 mb-8">
                  Experience the stunning design by Glenn Murcutt, featuring 96 lanterns that
                  create a unique interplay of light and shadow inspired by traditional Islamic
                  geometric patterns.
                </p>
                <Button
                  href="/contact"
                  variant="primary"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Request Virtual Tour Access
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Getting Here */}
      <section id="directions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Getting to AIC</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                The Australian Islamic Centre is easily accessible by car and public transport.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Car,
                title: "By Car",
                description: "Free parking available on-site. The centre is accessible via Blenheim Road, Newport.",
                details: "Ample parking spaces available",
              },
              {
                icon: Train,
                title: "By Train",
                description: "Nearest station is Newport Station on the Werribee line, followed by a short walk or bus.",
                details: "Werribee Line - Metro Trains",
              },
              {
                icon: Bus,
                title: "By Bus",
                description: "Multiple bus routes service the area around Newport and Williamstown.",
                details: "Check PTV for route details",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-neutral-50 rounded-2xl p-8 shadow-lg text-center border border-gray-100"
                >
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <p className="text-sm text-teal-600 font-medium">{item.details}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-20 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                <HelpCircle className="w-4 h-4" />
                FAQs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Find answers to common questions about visiting the Australian Islamic Centre.
              </p>
            </div>
          </FadeIn>

          {faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FadeIn key={faq._id} delay={index * 0.05}>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          openFAQ === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-4"
                      >
                        <div className="text-gray-600 prose prose-sm max-w-none">
                          <PortableText value={faq.answer} />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                Have questions? Contact us and we&apos;ll be happy to help.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Facilities</h2>
                <p className="text-gray-600 mb-8">
                  Our centre features modern facilities designed to serve the diverse needs of our
                  community and visitors.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {facilities.map((facility) => (
                    <div
                      key={facility.name}
                      className="bg-neutral-50 rounded-xl p-4 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <facility.icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{facility.name}</p>
                        <p className="text-xs text-gray-500">Capacity: {facility.capacity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="relative">
                <Image
                  src="/images/aic end.jpg"
                  alt="Centre facilities"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              We Look Forward to Welcoming You
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re joining us for prayer, exploring our architecture, or simply curious
              about Islam, you&apos;re always welcome at the Australian Islamic Centre.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/contact"
                variant="gold"
                size="lg"
                icon={<Calendar className="w-5 h-5" />}
              >
                Book a Visit
              </Button>
              <Button
                href="/worshippers"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Prayer Times
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
