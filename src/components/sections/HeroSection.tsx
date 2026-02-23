/**
 * HeroSection
 *
 * Full-width homepage hero with an auto-advancing background image carousel,
 * a live prayer-times strip, and primary call-to-action buttons.
 * Appears at the top of the homepage as the first visible section.
 *
 * @module components/sections/HeroSection
 */
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play, ChevronLeft, ChevronRight, Sunrise, Sun, Cloud, Sunset, Moon, Star } from "lucide-react";
import { aicImages, jumuahTimes } from "@/data/content";
import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
import { TARAWEEH_CONFIG, EID_CONFIG } from "@/lib/prayer-config";
import type { PrayerName } from "@/lib/prayer-times";
import type { SanityPrayerSettings } from "@/types/sanity";

// Hero slides - reduced to 3 for cleaner experience
const heroSlides = [
  {
    id: 1,
    image: aicImages.interior.prayerHallBright,
    title: "Welcome to the",
    highlight: "Australian Islamic Centre",
    subtitle: "A place of worship, learning, and community",
  },
  {
    id: 2,
    image: aicImages.exterior.front,
    title: "Award-Winning",
    highlight: "Architecture",
    subtitle: "Experience our globally recognized Islamic architecture",
  },
  {
    id: 3,
    image: aicImages.interior.prayerHallNight,
    title: "Join Us in",
    highlight: "Prayer",
    subtitle: "Five daily prayers in our beautiful prayer hall",
  },
];

// Prayer icons config
const PRAYER_ICONS: Record<PrayerName, typeof Moon> = {
  fajr: Moon,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: Cloud,
  maghrib: Sunset,
  isha: Moon,
};

interface HeroSectionProps {
  prayerSettings?: SanityPrayerSettings | null;
}

export function HeroSection({ prayerSettings }: HeroSectionProps) {
  // Use Sanity data with fallback to hardcoded config
  const taraweehActive = prayerSettings?.taraweehEnabled ?? TARAWEEH_CONFIG.enabled;
  const taraweehTime = prayerSettings?.taraweehTime ?? TARAWEEH_CONFIG.time;
  const eidFitrActive = prayerSettings?.eidFitrActive ?? EID_CONFIG.eidAlFitr.active;
  const eidFitrTime = prayerSettings?.eidFitrTime ?? EID_CONFIG.eidAlFitr.times[0]?.time;
  const eidAdhaActive = prayerSettings?.eidAdhaActive ?? EID_CONFIG.eidAlAdha.active;
  const eidAdhaTime = prayerSettings?.eidAdhaTime ?? EID_CONFIG.eidAlAdha.times[0]?.time;
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Use dynamic prayer times with Sanity iqamah overrides
  const prayerTimes = usePrayerTimes(prayerSettings);
  const nextPrayerData = useNextPrayer(prayerSettings);

  // Jumu'ah times from Sanity with hardcoded fallback
  const jumuahArabicTime = prayerSettings?.jumuahArabicTime ?? jumuahTimes[0]?.time;
  const jumuahEnglishTime = prayerSettings?.jumuahEnglishTime ?? jumuahTimes[1]?.time;

  // Build prayers array with full data
  const prayers = [
    { key: "fajr" as const, name: "Fajr", adhan: prayerTimes.fajr.adhan, iqamah: prayerTimes.fajr.iqamah },
    { key: "sunrise" as const, name: "Sunrise", adhan: prayerTimes.sunrise.adhan, iqamah: prayerTimes.sunrise.iqamah },
    { key: "dhuhr" as const, name: "Dhuhr", adhan: prayerTimes.dhuhr.adhan, iqamah: prayerTimes.dhuhr.iqamah },
    { key: "asr" as const, name: "Asr", adhan: prayerTimes.asr.adhan, iqamah: prayerTimes.asr.iqamah },
    { key: "maghrib" as const, name: "Maghrib", adhan: prayerTimes.maghrib.adhan, iqamah: prayerTimes.maghrib.iqamah },
    { key: "isha" as const, name: "Isha", adhan: prayerTimes.isha.adhan, iqamah: prayerTimes.isha.iqamah },
  ];

  const nextPrayer = {
    name: nextPrayerData.displayName,
    adhan: nextPrayerData.adhan,
    iqamah: nextPrayerData.iqamah,
    key: nextPrayerData.name,
  };

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const getSlideVariant = (type: "enter" | "exit", dir: number) => ({
    x: type === "enter"
      ? (dir > 0 ? "100%" : "-100%")
      : (dir > 0 ? "-100%" : "100%"),
    opacity: type === "enter" ? 0.5 : 0,
    scale: 1,
  });

  const centerVariant = {
    x: 0,
    opacity: 1,
    scale: 1,
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <>
    <section ref={containerRef} className="relative h-[45vh] md:h-[55vh] lg:h-[65vh] min-h-[400px] overflow-hidden bg-black">
      {/* Background Images with Carousel */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-[-20px]"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={currentSlide}
            initial={getSlideVariant("enter", direction)}
            animate={centerVariant}
            exit={getSlideVariant("exit", direction)}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlideData.image}
              alt={currentSlideData.highlight}
              fill
              priority={currentSlide === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-10" />

        {/* Vignette effect */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 100%)"
          }}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex items-center z-30"
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            {/* Decorative line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-lime-400 via-green-400 to-transparent mb-4 md:mb-8 rounded-full"
            />

            {/* Animated text content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  <span className="block">{currentSlideData.title}</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-green-400 to-lime-400">
                    {currentSlideData.highlight}
                  </span>
                </motion.h1>

                <motion.p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-6 md:mb-8 leading-relaxed max-w-2xl">
                  {currentSlideData.subtitle}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  href="/about"
                  variant="white"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Explore Our Centre
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  href="/visit"
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-lime-400/50"
                  icon={<Play className="w-5 h-5" />}
                >
                  Book a Visit
                </Button>
              </motion.div>
            </motion.div>

            {/* Slide indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-3"
            >
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="group relative"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentSlide
                        ? "w-12 bg-gradient-to-r from-lime-400 to-green-400"
                        : "w-6 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                  {index === currentSlide && isAutoPlaying && (
                    <motion.div
                      className="absolute inset-0 h-1.5 rounded-full bg-white/30 origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 6, ease: "linear" }}
                      key={`progress-${currentSlide}`}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-40">
          <motion.button
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, x: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>
    </section>

    {/* Prayer Times Bar - Below hero */}
    <motion.div
      id="prayer-times"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="relative z-40 bg-neutral-900 scroll-mt-20"
    >
      <div className="border-b border-white/10">
          {/* Desktop: Prayer cards layout - only at xl and above */}
          <div className="hidden xl:block">
            <div className="max-w-7xl mx-auto px-6 py-4">
              {/* Next Prayer Highlight + Prayer Grid */}
              <div className="flex items-start gap-6">
                {/* Next Prayer Card */}
                <div className="flex-shrink-0 px-5 py-3 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/20 border border-green-500/40">
                  <p className="text-green-400/80 text-xs font-medium uppercase tracking-wider mb-1">Next Prayer</p>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = PRAYER_ICONS[nextPrayer.key];
                      return <Icon className="w-6 h-6 text-green-400" />;
                    })()}
                    <div>
                      <p className="text-white font-bold text-lg">{nextPrayer.name}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-white/60">Athan <span className="text-white font-semibold">{nextPrayer.adhan}</span></span>
                        {nextPrayer.key !== "sunrise" && (
                          <span className="text-white/60">Iqamah <span className="text-green-400 font-bold">{nextPrayer.iqamah}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Prayers Grid */}
                <div className="flex-1 grid grid-cols-6 gap-3">
                  {prayers.map((prayer) => {
                    const Icon = PRAYER_ICONS[prayer.key];
                    const isNext = nextPrayer.key === prayer.key;

                    return (
                      <div
                        key={prayer.key}
                        className={`rounded-xl p-3 transition-all ${
                          isNext
                            ? "bg-green-500/20 border border-green-500/40"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${isNext ? "text-green-400" : "text-white/50"}`} />
                          <span className={`font-medium text-sm ${isNext ? "text-green-400" : "text-white/80"}`}>
                            {prayer.name}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-white/40 text-xs">Athan</span>
                            <span className={`font-semibold text-sm ${isNext ? "text-white" : "text-white/90"}`}>
                              {prayer.adhan}
                            </span>
                          </div>
                          {prayer.key !== "sunrise" ? (
                            <div className="flex justify-between items-center">
                              <span className="text-white/40 text-xs">Iqamah</span>
                              <span className={`font-bold text-sm ${isNext ? "text-green-400" : "text-lime-400"}`}>
                                {prayer.iqamah}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-white/40 text-xs">Shuruk</span>
                              <span className="font-bold text-sm text-orange-400">
                                {prayer.iqamah}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jumu'ah, Taraweeh & Eid */}
              <div className="flex items-center justify-end gap-6 mt-3 pt-3 border-t border-white/10">
                {/* Jumu'ah */}
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-sm font-medium">Jumu&apos;ah</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                    <span className="text-white/50 text-xs">Arabic</span>
                    <span className="text-lime-400 font-semibold">{jumuahArabicTime}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                    <span className="text-white/50 text-xs">English</span>
                    <span className="text-lime-400 font-semibold">{jumuahEnglishTime}</span>
                  </div>
                </div>

                {/* Taraweeh - only during Ramadan */}
                {taraweehActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">Taraweeh</span>
                    <span className="text-purple-400 font-semibold">{taraweehTime}</span>
                  </div>
                )}

                {/* Eid al-Fitr */}
                {eidFitrActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-sm font-medium">Eid al-Fitr</span>
                    <span className="text-amber-400 font-semibold">{eidFitrTime}</span>
                  </div>
                )}

                {/* Eid al-Adha */}
                {eidAdhaActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-sm font-medium">Eid al-Adha</span>
                    <span className="text-amber-400 font-semibold">{eidAdhaTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tablet/Small Desktop: Compact grid */}
          <div className="hidden md:block xl:hidden">
            <div className="max-w-4xl mx-auto px-6 py-4">
              {/* Next Prayer */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">Next Prayer:</span>
                  <div className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
                    <span className="text-green-400 font-bold">{nextPrayer.name}</span>
                    <span className="text-white/60 text-sm ml-2">Athan</span>
                    <span className="text-white font-semibold ml-1">{nextPrayer.adhan}</span>
                    {nextPrayer.key !== "sunrise" && (
                      <>
                        <span className="text-white/40 mx-2">|</span>
                        <span className="text-white/60 text-sm">Iqamah</span>
                        <span className="text-green-400 font-bold ml-1">{nextPrayer.iqamah}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Prayer Grid */}
              <div className="grid grid-cols-6 gap-2 mb-3">
                {prayers.map((prayer) => {
                  const isNext = nextPrayer.key === prayer.key;
                  return (
                    <div
                      key={prayer.key}
                      className={`rounded-lg p-2 text-center ${
                        isNext ? "bg-green-500/20 border border-green-500/30" : "bg-white/5"
                      }`}
                    >
                      <p className={`text-xs font-medium mb-1 ${isNext ? "text-green-400" : "text-white/60"}`}>
                        {prayer.name}
                      </p>
                      <p className={`text-sm font-semibold ${isNext ? "text-white" : "text-white/80"}`}>
                        {prayer.adhan}
                      </p>
                      <p className={`text-xs font-bold ${isNext ? "text-green-400" : "text-lime-400"}`}>
                        {prayer.iqamah}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Jumu'ah, Taraweeh & Eid */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-sm">Jumu&apos;ah</span>
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">
                    <span className="text-white/40 text-xs">Arabic</span>
                    <span className="text-lime-400 font-semibold text-sm">{jumuahArabicTime}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">
                    <span className="text-white/40 text-xs">English</span>
                    <span className="text-lime-400 font-semibold text-sm">{jumuahEnglishTime}</span>
                  </div>
                </div>
                {taraweehActive && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30">
                    <Star className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-300 text-xs">Taraweeh</span>
                    <span className="text-purple-400 font-semibold text-sm">{taraweehTime}</span>
                  </div>
                )}
                {eidFitrActive && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300 text-xs">Eid al-Fitr</span>
                    <span className="text-amber-400 font-semibold text-sm">{eidFitrTime}</span>
                  </div>
                )}
                {eidAdhaActive && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300 text-xs">Eid al-Adha</span>
                    <span className="text-amber-400 font-semibold text-sm">{eidAdhaTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile: Always visible prayer times */}
          <div className="md:hidden">
            <div className="px-4 py-3">
              {/* Prayer Times Grid - 3x2 - Always visible */}
              <div className="grid grid-cols-3 gap-2">
                {prayers.map((prayer) => {
                  const isNext = nextPrayer.key === prayer.key;
                  return (
                    <div
                      key={prayer.key}
                      className={`rounded-lg p-2 ${
                        isNext ? "bg-green-500/15 border border-green-500/30" : "bg-white/5"
                      }`}
                    >
                      <p className={`text-xs font-medium mb-0.5 ${isNext ? "text-green-400" : "text-white/50"}`}>
                        {prayer.name}
                      </p>
                      <p className={`text-sm font-semibold ${isNext ? "text-white" : "text-white/80"}`}>
                        {prayer.adhan}
                      </p>
                      {prayer.key !== "sunrise" && (
                        <p className={`text-xs font-bold ${isNext ? "text-green-400" : "text-lime-400/80"}`}>
                          {prayer.iqamah}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Jumu'ah times - full width on mobile */}
              <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <span className="text-white/40 text-xs">Jumu&apos;ah</span>
                <div className="w-full flex justify-center gap-2">
                  <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5">
                    <span className="text-white/40 text-xs">Arabic</span>
                    <span className="text-lime-400 font-semibold text-sm">{jumuahArabicTime}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5">
                    <span className="text-white/40 text-xs">English</span>
                    <span className="text-lime-400 font-semibold text-sm">{jumuahEnglishTime}</span>
                  </div>
                </div>
              </div>

              {/* Taraweeh & Eid - full width rows on mobile */}
              {(taraweehActive || eidFitrActive || eidAdhaActive) && (
                <div className="flex flex-col gap-2 mt-2 w-full">
                  {taraweehActive && (
                    <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                      <Star className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 text-sm font-medium">Taraweeh</span>
                      <span className="text-purple-400 font-semibold text-sm">{taraweehTime}</span>
                    </div>
                  )}
                  {eidFitrActive && (
                    <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 text-sm font-medium">Eid al-Fitr</span>
                      <span className="text-amber-400 font-semibold text-sm">{eidFitrTime}</span>
                    </div>
                  )}
                  {eidAdhaActive && (
                    <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 text-sm font-medium">Eid al-Adha</span>
                      <span className="text-amber-400 font-semibold text-sm">{eidAdhaTime}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
