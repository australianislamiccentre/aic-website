"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import {
  ArrowRight,
  Award,
  Sparkles,
  Building,
  Sun,
  Wind,
  Droplet,
  Compass,
} from "lucide-react";

const features = [
  {
    icon: Building,
    title: "99 Names of Allah",
    description: "The 99 beautiful names of Allah are intricately carved into the façade, creating a stunning visual testament to Islamic faith.",
  },
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

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Explore the award-winning design of the Australian Islamic Centre, where Islamic tradition meets contemporary Australian architecture in a masterful synthesis of faith and form.
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-600">2016</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-600">3</p>
                  <p className="text-sm text-gray-500">Int&apos;l Awards</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-600">5,000m²</p>
                  <p className="text-sm text-gray-500">Total Area</p>
                </div>
              </div>

              <Button
                href="#explore"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Explore the Design
              </Button>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic 2.jpg"
                  alt="Australian Islamic Centre exterior"
                  width={600}
                  height={400}
                  className="w-full h-72 md:h-96 object-cover"
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
      <section id="explore" className="py-24 bg-white">
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
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  The building challenges conventional mosque architecture by
                  reimagining sacred space through the lens of Australian light,
                  landscape, and climate. Every element serves both functional
                  and spiritual purposes.
                </p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-4xl font-bold text-neutral-700">2016</p>
                    <p className="text-gray-500">Completed</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div>
                    <p className="text-4xl font-bold text-neutral-700">5,000m²</p>
                    <p className="text-gray-500">Total Area</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div>
                    <p className="text-4xl font-bold text-neutral-700">3</p>
                    <p className="text-gray-500">International Awards</p>
                  </div>
                </div>
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

      {/* Design Features */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Architectural Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Every element of the design serves both aesthetic and functional purposes,
                creating a space that inspires worship and community gathering.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Gallery Section with Parallax */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Gallery
              </h2>
              <p className="text-lg text-gray-600">
                Experience the beauty of our architectural masterpiece.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            {gallery.map((image, index) => (
              <FadeIn key={image.id} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="group relative rounded-2xl overflow-hidden shadow-xl"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={400}
                    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-lg font-medium">{image.caption}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage-800">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                Recognition
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Awards & Accolades
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Our architecture has received international recognition for its
                innovative design and cultural significance.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {awards.map((award) => (
              <StaggerItem key={award.title}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/20 flex items-center justify-center mb-6">
                    <Award className="w-8 h-8 text-teal-400" />
                  </div>
                  <p className="text-teal-400 font-bold text-lg mb-2">{award.year}</p>
                  <h3 className="text-white font-bold text-xl mb-2">{award.title}</h3>
                  <p className="text-white/60">{award.category}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Architect Quote */}
      <section className="py-24 bg-white">
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
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/visit"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Plan Your Visit
              </Button>
              <Button
                href="/media"
                variant="outline"
                size="lg"
              >
                View More Photos
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
