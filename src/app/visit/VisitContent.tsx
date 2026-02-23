/**
 * Visit Content
 *
 * Client component rendering the visit page UI with directions, opening
 * hours, contact details, etiquette guidelines from Sanity, and an FAQ
 * accordion for common visitor questions.
 *
 * @module app/visit/VisitContent
 */
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { SanityEtiquette, SanityFaq } from "@/types/sanity";
import { PortableText } from "@portabletext/react";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  Users,
  Info,
  Navigation,
  CheckCircle2,
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
  { day: "Daily", hours: "4:30 AM – 10:30 PM" },
];

const fallbackFaqs = [
  {
    _id: "faq-1",
    question: "Is the mosque open to non-Muslim visitors?",
    answer: "Yes! We welcome visitors of all faiths and backgrounds. We encourage everyone to come and experience our award-winning architecture and learn about our community.",
  },
  {
    _id: "faq-2",
    question: "What should I wear when visiting?",
    answer: "We ask all visitors to dress modestly. For women, a headscarf is appreciated but not required — we have scarves available at the entrance. Please avoid shorts and sleeveless tops.",
  },
  {
    _id: "faq-3",
    question: "Do I need to remove my shoes?",
    answer: "Yes, shoes must be removed before entering the prayer hall. Shoe racks are provided at the entrance. We recommend wearing clean socks.",
  },
  {
    _id: "faq-4",
    question: "Is there parking available?",
    answer: "Yes, free parking is available on-site. The centre is accessible via Blenheim Road, Newport, with ample parking spaces for visitors.",
  },
  {
    _id: "faq-5",
    question: "How do I get to AIC by public transport?",
    answer: "The nearest station is Newport Station on the Werribee line (Metro Trains), followed by a short walk or bus ride. Multiple bus routes also service the Newport area.",
  },
  {
    _id: "faq-6",
    question: "Can I take photos inside the mosque?",
    answer: "Photography of the architecture is welcome outside of prayer times. Please be respectful and avoid photographing worshippers without their permission.",
  },
  {
    _id: "faq-7",
    question: "What are the prayer times?",
    answer: "Prayer times change daily based on the position of the sun. You can find the current prayer times on our homepage or the Worshippers page. The mosque is open for all five daily prayers.",
  },
];

const etiquetteIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  shirt: Shirt,
  volume: Volume2,
  hands: HandHeart,
  droplets: Droplets,
  help: HelpCircle,
};

interface VisitContentProps {
  etiquette: SanityEtiquette[];
  faqs: SanityFaq[];
}

export default function VisitContent({ etiquette, faqs }: VisitContentProps) {
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
      <section id="hours" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <FadeIn direction="left">
              <div className="relative h-[300px] lg:h-full min-h-[300px] rounded-2xl overflow-hidden shadow-xl">
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

      {/* Facilities */}
      <section className="py-12 bg-neutral-50">
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
                      className="bg-white rounded-xl p-4 flex items-center gap-3"
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

      {/* Mosque Manners */}
      <section id="manners" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-8">
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
            <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {etiquette.map((item) => {
                const Icon = etiquetteIcons[item.icon] || CheckCircle2;
                return (
                  <div key={item._id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-gray-500 text-xs">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Please contact us for visitor guidelines before your visit.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-12 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-8">
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

          {(() => {
            const displayFaqs = faqs.length > 0 ? faqs : fallbackFaqs;
            const isSanity = faqs.length > 0;
            return (
              <div className="space-y-3">
                {displayFaqs.map((faq, index) => (
                  <FadeIn key={faq._id} delay={index * 0.05}>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${
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
                            {isSanity ? (
                              <PortableText value={(faq as SanityFaq).answer} />
                            ) : (
                              <p>{(faq as typeof fallbackFaqs[number]).answer}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </FadeIn>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage-800">
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
