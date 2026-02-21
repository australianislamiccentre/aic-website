"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { ArrowRight, Handshake, GraduationCap, Trophy } from "lucide-react";

const partners = [
  {
    name: "Newport Storm FC",
    slug: "newport-storm",
    description:
      "A community football club affiliated with the Australian Islamic Centre, promoting sportsmanship, fitness, and community spirit among youth and adults.",
    image: "/images/aic 5.jpg",
    icon: Trophy,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "AIC College (AICC)",
    slug: "aicc",
    description:
      "The Australian Islamic College of Commerce provides quality education rooted in Islamic values, offering comprehensive academic programs for students.",
    image: "/images/aic start.jpg",
    icon: GraduationCap,
    color: "from-teal-500 to-teal-600",
  },
];

export default function PartnersPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
              <Handshake className="w-4 h-4" />
              Our Network
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Affiliated <span className="text-teal-600">Partners</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              The Australian Islamic Centre works alongside these affiliated organisations
              to serve our community through education, sports, and social development.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <FadeIn key={partner.slug}>
                <Link
                  href={`/partners/${partner.slug}`}
                  className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 h-full"
                >
                  <div className="relative h-48">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${partner.color} flex items-center justify-center`}>
                        <partner.icon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-white">{partner.name}</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {partner.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
