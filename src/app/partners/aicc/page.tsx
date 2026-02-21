"use client";

import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  MapPin,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const highlights = [
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    description: "Comprehensive curriculum meeting Australian educational standards.",
  },
  {
    icon: BookOpen,
    title: "Islamic Values",
    description: "Education grounded in Islamic principles and moral development.",
  },
  {
    icon: Users,
    title: "Inclusive Community",
    description: "Welcoming students from all backgrounds in a supportive environment.",
  },
  {
    icon: Award,
    title: "Holistic Development",
    description: "Nurturing academic, spiritual, and personal growth in every student.",
  },
];

export default function AICCPage() {
  return (
    <>
      {/* Header */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-neutral-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                Affiliated Partner
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                AIC <span className="text-teal-600">College</span>
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                The Australian Islamic College of Commerce (AICC) is an educational institution
                affiliated with the Australian Islamic Centre. AICC provides quality education
                that combines academic excellence with Islamic values, preparing students for
                success in both this world and the hereafter.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  href="https://aicc.vic.edu.au/"
                  variant="primary"
                  icon={<ExternalLink className="w-4 h-4" />}
                >
                  Visit Website
                </Button>
                <Button
                  href="/contact"
                  variant="outline"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Get In Touch
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic start.jpg"
                  alt="AIC College"
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What We Offer</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {highlights.map((item) => (
              <FadeIn key={item.title}>
                <div className="bg-neutral-50 rounded-xl p-4 border border-gray-100 text-center h-full">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-teal-100 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About AIC College</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  AICC was established to address the growing need for an educational institution
                  that provides high-quality academic programs within an Islamic framework. The
                  college is committed to nurturing well-rounded individuals who excel
                  academically while maintaining strong Islamic identity and values.
                </p>
                <p>
                  Operating in partnership with the Australian Islamic Centre, AICC benefits from
                  the centre&apos;s facilities, community support, and spiritual guidance. The college
                  offers a supportive learning environment where students can thrive academically,
                  socially, and spiritually.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Newport, Melbourne</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-4">
              Enrol at AIC College
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Give your child the gift of quality education grounded in Islamic values.
              Visit the AICC website to learn about enrolment and programs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="https://aicc.vic.edu.au/"
                variant="gold"
                size="lg"
                icon={<ExternalLink className="w-5 h-5" />}
              >
                Visit Website
              </Button>
              <Button
                href="/partners"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                All Partners
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
