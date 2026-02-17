"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Sun, Compass, Droplets } from "lucide-react";
import {
  ArrowRight,
  Heart,
  Users,
  BookOpen,
  Award,
  Target,
  Eye,
  Lightbulb,
  Calendar,
  Building,
  Globe,
  MapPin,
} from "lucide-react";

// Partner logos
const partnerLogos = [
  { name: "Hobsons Bay City Council", logo: "/partners/hobsons bay.png" },
  { name: "Victorian Government", logo: "/partners/vic government.png" },
  { name: "Victoria Police", logo: "/partners/victoria police.jpeg" },
  { name: "Fire Rescue Victoria", logo: "/partners/fire rescue victoria.jpeg" },
  { name: "Western Health", logo: "/partners/western health.png" },
];

// Architecture features for expanded section
const architectureFeatures = [
  {
    icon: Sun,
    title: "96 Lanterns",
    description: "Colorful skylights that flood the prayer hall with natural light, creating a spiritual atmosphere.",
  },
  {
    icon: Compass,
    title: "Qibla Orientation",
    description: "Precisely aligned towards the Kaaba in Mecca, with the qibla wall featuring intricate calligraphy.",
  },
  {
    icon: Droplets,
    title: "Sustainable Design",
    description: "Natural ventilation and passive cooling systems that minimize environmental impact.",
  },
];

const timeline = [
  {
    year: "1970s",
    title: "Newport Islamic Society Founded",
    description: "The Newport Islamic Society (NIS) was established to serve the local Muslim community in Newport, Melbourne.",
    image: "/images/aic 8.jpg",
    icon: Users,
  },
  {
    year: "2000s",
    title: "Community Growth",
    description: "As the community grew, plans began for a purpose-built Islamic centre that would serve future generations.",
    image: "/images/aic 1.jpg",
    icon: Heart,
  },
  {
    year: "2010",
    title: "Vision Takes Shape",
    description: "Renowned architect Glenn Murcutt was commissioned to design a unique Islamic centre blending Australian and Islamic aesthetics.",
    image: "/images/aic 3.jpeg",
    icon: Lightbulb,
  },
  {
    year: "2013",
    title: "IQRA Academy Established",
    description: "IQRA Academy weekend school was established to provide Quranic education to local children.",
    image: "/images/aic start.jpg",
    icon: BookOpen,
  },
  {
    year: "2016",
    title: "Centre Completion",
    description: "The Australian Islamic Centre opened its doors, quickly becoming a global architectural landmark.",
    image: "/images/aic 9.jpeg",
    icon: Building,
  },
  {
    year: "Present",
    title: "Serving the Community",
    description: "Today, AIC serves 1000+ weekly worshippers with comprehensive religious, educational, and community services.",
    image: "/images/aic 5.jpg",
    icon: Globe,
  },
];

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description: "We serve with love and mercy, following the example of Prophet Muhammad (PBUH).",
  },
  {
    icon: BookOpen,
    title: "Knowledge",
    description: "We believe in the transformative power of Islamic education for all ages.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We integrate Australian values with the beauty of Islam, building bridges of understanding.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for the highest standards in everything we do.",
  },
];

export default function AboutPage() {
  const info = useSiteSettings();

  return (
    <>
      {/* Hero Intro Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-teal-50/30 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <FadeIn direction="left">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
                  <Heart className="w-4 h-4" />
                  Welcome to AIC
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  About the <span className="text-teal-600">Australian Islamic Centre</span>
                </h1>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  A vibrant community hub in Melbourne&apos;s west, serving Muslims and welcoming visitors from around the world to our award-winning architectural landmark.
                </p>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-teal-600">40+</p>
                    <p className="text-sm text-gray-500">Years Serving</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-teal-600">1000+</p>
                    <p className="text-sm text-gray-500">Weekly Worshippers</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-teal-600">3</p>
                    <p className="text-sm text-gray-500">Int&apos;l Awards</p>
                  </div>
                </div>

                <Button
                  href="/visit"
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Plan Your Visit
                </Button>
              </div>
            </FadeIn>

            {/* Image */}
            <FadeIn direction="right">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/aic 1.jpg"
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
                  <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Newport, Melbourne</p>
                    <p className="text-xs text-gray-500">Serving the Western Suburbs</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Mission Section - Compact */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <FadeIn direction="left">
              <div className="relative">
                <Image
                  src="/images/aic 5.jpg"
                  alt="Community gathering at AIC"
                  width={500}
                  height={400}
                  className="rounded-xl shadow-lg w-full h-64 md:h-80 object-cover"
                />
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div>
                <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-3">
                  <Target className="w-4 h-4" />
                  Our Mission
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {info.tagline}
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  The Australian Islamic Centre serves as a beacon of Islamic faith and practice in Melbourne.
                  What started as a local community centre has transformed into a global architectural icon.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We maintain our core identity as a community hub, providing comprehensive religious services,
                  education, and programs for Muslims and the broader public.
                </p>
                <Button
                  href="/visit"
                  variant="primary"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Visit Our Centre
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Architecture Section - Expanded */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <FadeIn>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium mb-3">
                <Award className="w-3.5 h-3.5" />
                Award-Winning Design
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                An Architectural Masterpiece
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Designed by Pritzker Prize-winning architect Glenn Murcutt in collaboration with Hakan Elevli,
                the Australian Islamic Centre is a globally recognized landmark.
              </p>
            </div>
          </FadeIn>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Images */}
            <FadeIn direction="left">
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/aic 9.jpeg"
                    alt="AIC Aerial View"
                    width={600}
                    height={350}
                    className="w-full h-56 md:h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold text-sm">World Architecture Festival Winner 2017</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <Image
                      src="/images/aic start.jpg"
                      alt="Prayer Hall Interior"
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <Image
                      src="/images/aic 2.jpg"
                      alt="Roof Detail"
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Features */}
            <FadeIn direction="right">
              <div className="space-y-4">
                {architectureFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Button
                  href="/architecture"
                  variant="primary"
                  className="w-full justify-center mt-4"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Full Architecture Story
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Vision & Values - Simple & Elegant */}
      <section id="vision" className="py-12 md:py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          {/* Vision & Approach - Simple two column */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <FadeIn>
              <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
                <div className="flex items-center gap-2 text-teal-400 mb-3">
                  <Eye className="w-4 h-4" />
                  <h3 className="font-semibold">Our Vision</h3>
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  To be a leading Islamic centre bridging Australian and Islamic values, with a thriving
                  community contributing to broader society through education and interfaith dialogue.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-teal-600/20 rounded-xl p-6 border border-teal-500/30">
                <div className="flex items-center gap-2 text-teal-400 mb-3">
                  <Lightbulb className="w-4 h-4" />
                  <h3 className="font-semibold">Our Approach</h3>
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  A holistic approach combining traditional Islamic scholarship with contemporary
                  understanding, reflected in our award-winning architecture.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Values - Compact 2x2 grid on mobile, 4 column on desktop */}
          <FadeIn delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <value.icon className="w-4 h-4 text-teal-400" />
                    <h4 className="font-semibold text-white text-sm">{value.title}</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-neutral-950 relative overflow-hidden">
        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.5) 40px,
                rgba(255,255,255,0.5) 41px
              )`,
            }}
          />
        </div>

        {/* Horizontal accent lines */}
        <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

        {/* Accent glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <FadeIn>
            <div className="text-center mb-12 md:mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/50 text-teal-400 text-xs font-medium tracking-wide uppercase mb-6">
                <Calendar className="w-3.5 h-3.5" />
                Our Journey
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                A Legacy of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                  Service
                </span>
              </h2>
              <p className="text-neutral-400 max-w-xl mx-auto text-lg">
                From humble beginnings to an architectural landmark
              </p>
            </div>
          </FadeIn>

          {/* Mobile: Horizontal Scroll Timeline */}
          <div className="lg:hidden">
            {/* Horizontal timeline track */}
            <div className="relative mb-6">
              <div className="h-1 bg-neutral-800 rounded-full mx-4" />
              <motion.div
                className="absolute top-0 left-4 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "calc(100% - 32px)" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {/* Year dots on the track */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className="relative"
                  >
                    <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-neutral-950" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-teal-400 whitespace-nowrap">
                      {item.year.replace("s", "")}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Scrollable cards */}
            <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              <div className="flex gap-4" style={{ width: `${timeline.length * 280 + (timeline.length - 1) * 16}px` }}>
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="w-[280px] flex-shrink-0"
                  >
                    <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl overflow-hidden h-full">
                      {/* Image */}
                      <div className="relative h-36 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
                        {/* Year badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-teal-500 text-white text-xs font-bold rounded-md shadow-lg">
                            {item.year}
                          </span>
                        </div>
                      </div>

                      {/* Text content */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
                            <item.icon className="w-4 h-4 text-teal-400" />
                          </div>
                          <h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Scroll hint */}
            <div className="flex justify-center mt-4 gap-1">
              <span className="text-neutral-500 text-xs">Swipe to explore</span>
              <ArrowRight className="w-3 h-3 text-neutral-500" />
            </div>
          </div>

          {/* Desktop: Vertical Timeline with Connector Lines */}
          <div className="hidden lg:block relative">
            {/* Timeline track - background */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-neutral-800 rounded-full" />

            {/* Timeline track - animated fill */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-1 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />

            <div className="space-y-24">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Connector line from center to card */}
                  <motion.div
                    className={`absolute top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r ${
                      index % 2 === 0
                        ? "left-1/2 right-[calc(50%+20px)] from-teal-500 to-teal-500/0"
                        : "right-1/2 left-[calc(50%+20px)] from-teal-500/0 to-teal-500"
                    }`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
                    style={{ transformOrigin: index % 2 === 0 ? "left" : "right" }}
                  />

                  {/* Timeline node with year */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
                      className="relative flex flex-col items-center"
                    >
                      {/* Year label */}
                      <div className="mb-2">
                        <span className="px-4 py-2 bg-teal-500 text-white text-base font-bold rounded-lg shadow-lg shadow-teal-500/30">
                          {item.year}
                        </span>
                      </div>
                      {/* Glow effect */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-teal-500 rounded-full blur-md opacity-60" />
                      {/* Node dot */}
                      <div className="relative w-4 h-4 rounded-full bg-teal-500 border-2 border-neutral-950" />
                    </motion.div>
                  </div>

                  {/* Content card */}
                  <div className={`flex-1 ${index % 2 === 0 ? "pr-24" : "pl-24"}`}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl overflow-hidden group hover:border-teal-500/30 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
                      </div>

                      {/* Text content */}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0 group-hover:bg-teal-500/30 transition-colors">
                            <item.icon className="w-5 h-5 text-teal-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        </div>
                        <p className="text-neutral-400 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section - Logos */}
      <section className="py-10 md:py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Proudly partnering with</p>
            </div>
          </FadeIn>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partnerLogos.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                title={partner.name}
              >
                <div className="h-12 md:h-14 flex items-center justify-center px-2">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={48}
                    className="h-10 md:h-12 w-auto object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
