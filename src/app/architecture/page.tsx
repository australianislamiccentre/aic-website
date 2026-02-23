/**
 * Architecture Page
 *
 * Client component showcasing the award-winning architectural design of the
 * Australian Islamic Centre. Highlights key design features such as natural
 * light, Qibla orientation, and sustainability elements.
 *
 * @route /architecture
 * @module app/architecture/page
 */
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import {
  ArrowRight,
  Award,
  Sparkles,
  Sun,
  Wind,
  Droplet,
  Compass,
} from "lucide-react";

const features = [
  {
    icon: Sun,
    title: "Natural Light Design",
    description: "Strategic skylight placement floods the prayer hall with natural light, creating an atmosphere of spiritual tranquility.",
  },
  {
    icon: Compass,
    title: "Qibla Orientation",
    description: "The entire building is precisely aligned towards the Kaaba in Mecca, ensuring accurate prayer direction.",
  },
  {
    icon: Wind,
    title: "Sustainable Design",
    description: "Natural ventilation systems and energy-efficient features minimize environmental impact.",
  },
  {
    icon: Droplet,
    title: "Water Features",
    description: "Reflective pools and fountains create a sense of peace and echo traditional Islamic garden design.",
  },
  {
    icon: Sparkles,
    title: "Contemporary Geometry",
    description: "Modern interpretation of traditional Islamic geometric patterns throughout the structure.",
  },
];

const gallery = [
  {
    id: "1",
    src: "/images/aic start.jpg",
    alt: "Main prayer hall interior",
    caption: "The expansive prayer hall with its stunning ceiling design",
  },
  {
    id: "2",
    src: "/images/aic 2.jpg",
    alt: "Exterior architecture",
    caption: "The contemporary façade featuring the 99 names",
  },
  {
    id: "3",
    src: "/images/aic 10.webp",
    alt: "Dome interior",
    caption: "Intricate dome design with natural light",
  },
  {
    id: "4",
    src: "/images/aic 1.jpg",
    alt: "Courtyard",
    caption: "The serene courtyard with water features",
  },
];

const awards = [
  {
    year: "2017",
    title: "Australian Institute of Architects Award",
    category: "Public Architecture",
  },
  {
    year: "2017",
    title: "World Architecture Festival Award",
    category: "Religious Building of the Year",
  },
  {
    year: "2018",
    title: "Aga Khan Award for Architecture",
    category: "Shortlisted",
  },
];

export default function ArchitecturePage() {
  return (
    <>
      {/* Hero Section with Image */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-teal-50/30 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                Award-Winning Design
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Our <span className="text-teal-600">Architecture</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Designed by Pritzker Prize laureate Glenn Murcutt AO in collaboration with Hakan Elevli, the Australian Islamic Centre in Newport, Melbourne is a globally celebrated architectural landmark.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Completed in 2016, the centre features 96 coloured lanterns inspired by Islamic geometry that flood the prayer hall with kaleidoscopic light. The building is precisely oriented towards Mecca and employs natural ventilation and passive cooling — a hallmark of Murcutt&apos;s environmentally responsive practice.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The centre won the Victorian Architecture Medal in 2017, the AIA National Award for Public Architecture, and was shortlisted for the Aga Khan Award for Architecture.
              </p>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic 2.jpg"
                  alt="Australian Islamic Centre exterior"
                  width={600}
                  height={400}
                  className="w-full h-48 md:h-72 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">World Architecture</p>
                  <p className="text-xs text-gray-500">Festival Winner 2017</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section id="explore" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-6">
                  Design Philosophy
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  A Dialogue Between{" "}
                  <span className="text-gradient">Tradition & Innovation</span>
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Designed by the renowned Glenn Murcutt in collaboration with
                  Hakan Elevli, the Australian Islamic Centre represents a
                  masterful synthesis of Islamic architectural traditions and
                  contemporary Australian design sensibilities.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  The building challenges conventional mosque architecture by
                  reimagining sacred space through the lens of Australian light,
                  landscape, and climate. Every element serves both functional
                  and spiritual purposes.
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl overflow-hidden shadow-xl"
                  >
                    <Image
                      src="/images/aic 6.webp"
                      alt="Architecture detail 1"
                      width={300}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl overflow-hidden shadow-xl mt-8"
                  >
                    <Image
                      src="/images/aic 7.webp"
                      alt="Architecture detail 2"
                      width={300}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>
                </div>
                {/* Floating award badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Award Winner</p>
                    <p className="text-sm text-gray-500">World Architecture Festival</p>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Design Features - Single Row */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Architectural Features
            </h2>
          </FadeIn>

          {/* Desktop: single row; Mobile: horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-5 lg:overflow-visible">
            {features.map((feature) => (
              <div key={feature.title} className="flex-shrink-0 w-[200px] lg:w-auto bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section with Parallax */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Gallery
              </h2>
              <p className="text-lg text-gray-600">
                Experience the beauty of our architectural masterpiece.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <FadeIn key={image.id} delay={index * 0.1}>
                <div className="group relative rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium">{image.caption}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-12 bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage-800">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                Recognition
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Awards & Accolades
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-3 gap-3">
            {awards.map((award) => (
              <div key={award.title} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all flex flex-col items-center justify-center min-h-[120px]">
                <Award className="w-5 h-5 text-teal-400 mb-2" />
                <p className="text-teal-400 font-bold text-xs mb-1">{award.year}</p>
                <h3 className="text-white font-bold text-xs leading-tight mb-1">{award.title}</h3>
                <p className="text-white/60 text-[10px]">{award.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architect Quote */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="relative">
              <div className="text-8xl text-neutral-100 font-serif absolute -top-10 left-0">&ldquo;</div>
              <blockquote className="text-2xl md:text-3xl text-gray-700 italic leading-relaxed relative z-10">
                The challenge was to create a building that speaks to both Islamic
                tradition and Australian identity - a place where faith, light,
                and landscape converge.
              </blockquote>
              <div className="mt-8">
                <p className="font-bold text-gray-900 text-lg">Glenn Murcutt AO</p>
                <p className="text-gray-500">Pritzker Prize Laureate, Lead Architect</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Visit CTA */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Experience It In Person
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Photos can only capture so much. Visit the Australian Islamic Centre
              to truly experience this architectural masterpiece.
            </p>
            <Button
              href="/visit"
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Plan Your Visit
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
