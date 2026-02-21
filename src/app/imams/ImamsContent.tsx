"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { SanityTeamMember } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import {
  Mail,
  Phone,
  Clock,
  GraduationCap,
  BookOpen,
  ArrowRight,
  User,
} from "lucide-react";

interface ImamsContentProps {
  imams: SanityTeamMember[];
}

export default function ImamsContent({ imams }: ImamsContentProps) {
  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Our <span className="text-teal-600">Imams</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Meet the spiritual leaders who guide our community in faith, provide Islamic education, and serve as a source of knowledge and wisdom.
            </p>
          </div>
        </div>
      </section>

      {/* Imams Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Religious Leaders
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our Imams bring years of Islamic scholarship and community service,
                dedicated to nurturing faith and providing guidance to our community.
              </p>
            </div>
          </FadeIn>

          {imams.length > 0 ? (
            <StaggerContainer className="space-y-16">
              {imams.map((imam, index) => (
                <StaggerItem key={imam._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`grid lg:grid-cols-2 gap-12 items-start ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                      <div className="relative">
                        {imam.image ? (
                          <Image
                            src={urlFor(imam.image).width(600).height(700).url()}
                            alt={imam.name}
                            width={600}
                            height={700}
                            className="rounded-2xl shadow-2xl object-cover w-full aspect-[4/5]"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl shadow-2xl w-full aspect-[4/5] flex items-center justify-center">
                            <User className="w-32 h-32 text-teal-300" />
                          </div>
                        )}
                        {/* Decorative element */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-500/10 rounded-2xl -z-10" />
                        <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-500/10 rounded-2xl -z-10" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
                        <BookOpen className="w-4 h-4" />
                        {imam.role}
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {imam.name}
                      </h3>

                      {/* Short Bio or Full Bio */}
                      {imam.bio && imam.bio.length > 0 ? (
                        <div className="prose prose-lg text-gray-600 mb-6">
                          <PortableText value={imam.bio} />
                        </div>
                      ) : imam.shortBio ? (
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                          {imam.shortBio}
                        </p>
                      ) : null}

                      {/* Qualifications */}
                      {imam.qualifications && imam.qualifications.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="w-5 h-5 text-teal-600" />
                            <h4 className="font-semibold text-gray-900">Qualifications</h4>
                          </div>
                          <ul className="space-y-2">
                            {imam.qualifications.map((qual, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                                {qual}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Specializations */}
                      {imam.specializations && imam.specializations.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {imam.specializations.map((spec, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-neutral-100 text-gray-700 rounded-full text-sm"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      {imam.showContactInfo && (imam.email || imam.phone || imam.officeHours) && (
                        <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                          <div className="space-y-3">
                            {imam.email && (
                              <a
                                href={`mailto:${imam.email}`}
                                className="flex items-center gap-3 text-gray-600 hover:text-teal-600 transition-colors"
                              >
                                <Mail className="w-5 h-5" />
                                {imam.email}
                              </a>
                            )}
                            {imam.phone && (
                              <a
                                href={`tel:${imam.phone}`}
                                className="flex items-center gap-3 text-gray-600 hover:text-teal-600 transition-colors"
                              >
                                <Phone className="w-5 h-5" />
                                {imam.phone}
                              </a>
                            )}
                            {imam.officeHours && (
                              <div className="flex items-center gap-3 text-gray-600">
                                <Clock className="w-5 h-5" />
                                {imam.officeHours}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Divider between imams */}
                  {index < imams.length - 1 && (
                    <div className="border-t border-gray-100 mt-16" />
                  )}
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <FadeIn>
              <div className="text-center py-16 bg-neutral-50 rounded-2xl">
                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Information about our Imams will be available soon. Please check back later
                  or contact us for more information.
                </p>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Services Offered by Our Imams
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { title: "Religious Counselling", description: "Guidance on Islamic matters and spiritual well-being" },
              { title: "Marriage Services", description: "Nikah ceremonies and pre-marriage counselling" },
              { title: "Funeral Services", description: "Janazah prayers and support for families" },
              { title: "Islamic Education", description: "Quran classes and religious instruction" },
              { title: "Friday Sermons", description: "Weekly Jumu'ah khutbahs" },
              { title: "Community Programs", description: "Ramadan, Eid, and spiritual events" },
            ].map((service) => (
              <StaggerItem key={service.title}>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{service.title}</h3>
                  <p className="text-gray-500 text-xs">{service.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-neutral-800 via-neutral-700 to-sage-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Need Spiritual Guidance?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Our Imams are here to help. Whether you have questions about Islam, need counselling,
              or require assistance with religious services, don&apos;t hesitate to reach out.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/contact"
                variant="gold"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Contact Us
              </Button>
              <Button
                href="/services"
                variant="outline"
                size="lg"
                className="text-white border-white/30 hover:bg-white/10"
              >
                View All Services
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
