"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play, ChevronLeft, ChevronRight, ChevronDown, Sunrise, Sun, Cloud, Sunset, Moon } from "lucide-react";
import { aicImages, jumuahTimes } from "@/data/content";
import { usePrayerTimes, useNextPrayer } from "@/hooks/usePrayerTimes";
import { TARAWEEH_CONFIG, EID_CONFIG } from "@/lib/prayer-config";
import type { PrayerName } from "@/lib/prayer-times";
import type { SanityPrayerSettings } from "@/types/sanity";
import { Star } from "lucide-react";

// Hero slides with different images and content
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
    image: aicImages.architecture.roofGolden,
    title: "Serving Our",
    highlight: "Community",
    subtitle: "Education, worship, and support for all",
  },
  {
    id: 4,
    image: aicImages.interior.prayerHallNight,
    title: "Join Us in",
    highlight: "Prayer",
    subtitle: "Five daily prayers in our beautiful prayer hall",
  },
  {
    id: 5,
    image: aicImages.exterior.aerialDrone,
    title: "A Beacon of",
    highlight: "Faith & Unity",
    subtitle: "Integrating Australian values with Islamic beauty",
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
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(heroSlides.length).fill(false));
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Check if today is Friday (for Jumu'ah display)
  const isFriday = new Date().toLocaleString("en-US", {
    timeZone: "Australia/Melbourne",
    weekday: "long"
  }) === "Friday";

  // Use dynamic prayer times
  const prayerTimes = usePrayerTimes();
  const nextPrayerData = useNextPrayer();

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

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / innerWidth;
      const y = (clientY - innerHeight / 2) / innerHeight;
      mouseX.set(x * 15);
      mouseY.set(y * 15);
      setMousePosition({ x: clientX, y: clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

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
    opacity: 0,
    scale: type === "enter" ? 1.1 : 0.95,
  });

  const centerVariant = {
    x: 0,
    opacity: 1,
    scale: 1,
  };

  const currentSlideData = heroSlides[currentSlide];
  const firstImageLoaded = imagesLoaded[0];

  return (
    <section ref={containerRef} className="relative h-screen min-h-[750px] overflow-hidden bg-black">
      {/* Background Images with Carousel */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-[-20px]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={getSlideVariant("enter", direction)}
            animate={centerVariant}
            exit={getSlideVariant("exit", direction)}
            transition={{
              x: { type: "spring", stiffness: 50, damping: 20 },
              opacity: { duration: 0.8 },
              scale: { duration: 1.2 },
            }}
            className="absolute inset-0"
            style={{
              x: smoothMouseX,
            }}
          >
            <Image
              src={currentSlideData.image}
              alt={currentSlideData.highlight}
              fill
              priority={currentSlide === 0}
              className="object-cover"
              onLoad={() => handleImageLoad(currentSlide)}
            />

            {/* Ken Burns effect overlay */}
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.08],
              }}
              transition={{
                duration: 6,
                ease: "linear",
              }}
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

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-lime-400/40 rounded-full"
            style={{
              left: `${10 + (i * 6)}%`,
              top: `${20 + (i * 5) % 60}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Animated light sweep */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          animate={{
            x: ["-100%", "400%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 6,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Cursor glow effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none hidden lg:block z-20"
        style={{
          background: "radial-gradient(circle, rgba(152,201,60,0.08) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          opacity: firstImageLoaded ? 1 : 0,
        }}
      />

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
              className="h-1 bg-gradient-to-r from-lime-400 via-green-400 to-transparent mb-8 rounded-full"
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
                <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  <span className="block">{currentSlideData.title}</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-green-400 to-lime-400">
                    {currentSlideData.highlight}
                  </span>
                </motion.h1>

                <motion.p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
                  {currentSlideData.subtitle}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap gap-4 mb-8"
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

      {/* Prayer Times Bar - Fixed at bottom, always in view */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-40"
      >
        <div className="backdrop-blur-xl bg-black/60 border-t border-white/10">
          {/* Desktop: Prayer cards layout */}
          <div className="hidden lg:block">
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
                    <span className="text-lime-400 font-semibold">{jumuahTimes[0].time}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                    <span className="text-white/50 text-xs">English</span>
                    <span className="text-lime-400 font-semibold">{jumuahTimes[1].time}</span>
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

          {/* Tablet: Compact grid */}
          <div className="hidden md:block lg:hidden">
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
                    <span className="text-lime-400 font-semibold text-sm">{jumuahTimes[0].time}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">
                    <span className="text-white/40 text-xs">English</span>
                    <span className="text-lime-400 font-semibold text-sm">{jumuahTimes[1].time}</span>
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

          {/* Mobile: Collapsible layout */}
          <div className="md:hidden">
            <div className="px-4 py-3">
              {/* Next Prayer with expand toggle */}
              {/* On Friday when Dhuhr is next, show Jumu'ah instead */}
              {isFriday && nextPrayer.key === "dhuhr" ? (
                <>
                  <button
                    onClick={() => setMobileExpanded(!mobileExpanded)}
                    className="w-full px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 active:bg-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-400" />
                        <div className="text-left">
                          <p className="text-white/50 text-xs">Next Prayer</p>
                          <p className="text-amber-400 font-bold text-sm">Jumu&apos;ah</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <span className="text-white/40">Arabic</span>
                            <span className="text-white font-semibold">{jumuahTimes[0].time}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <span className="text-white/40">English</span>
                            <span className="text-amber-400 font-bold">{jumuahTimes[1].time}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center ml-1">
                          <motion.div
                            animate={{ rotate: mobileExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-white/50" />
                          </motion.div>
                          <span className="text-white/30 text-[10px]">All times</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setMobileExpanded(!mobileExpanded)}
                    className="w-full px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 active:bg-green-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = PRAYER_ICONS[nextPrayer.key];
                          return <Icon className="w-5 h-5 text-green-400" />;
                        })()}
                        <div className="text-left">
                          <p className="text-white/50 text-xs">Next Prayer</p>
                          <p className="text-green-400 font-bold text-sm">{nextPrayer.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-white text-sm font-semibold">{nextPrayer.adhan}</p>
                          {nextPrayer.key !== "sunrise" && (
                            <p className="text-green-400 text-xs font-bold">Iqamah {nextPrayer.iqamah}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-center ml-1">
                          <motion.div
                            animate={{ rotate: mobileExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-white/50" />
                          </motion.div>
                          <span className="text-white/30 text-[10px]">All times</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Friday Jumu'ah - Visible on Fridays when Dhuhr is NOT next */}
                  {isFriday && !mobileExpanded && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-amber-400/80 text-xs font-medium">Jumu&apos;ah Today</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5">
                        <span className="text-white/30 text-xs">Arabic</span>
                        <span className="text-amber-400 font-semibold text-xs">{jumuahTimes[0].time}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5">
                        <span className="text-white/30 text-xs">English</span>
                        <span className="text-amber-400 font-semibold text-xs">{jumuahTimes[1].time}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Expanded: All Prayer Times */}
              <AnimatePresence>
                {mobileExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {/* Prayer Times Grid - 3x2 */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
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
                            <p className={`text-xs font-bold ${isNext ? "text-green-400" : "text-lime-400/80"}`}>
                              {prayer.iqamah}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Jumu'ah, Taraweeh & Eid in expanded view */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <span className="text-white/40 text-xs">Jumu&apos;ah</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5">
                        <span className="text-white/30 text-xs">Arabic</span>
                        <span className="text-lime-400 font-semibold text-xs">{jumuahTimes[0].time}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5">
                        <span className="text-white/30 text-xs">English</span>
                        <span className="text-lime-400 font-semibold text-xs">{jumuahTimes[1].time}</span>
                      </div>
                    </div>
                    {(taraweehActive || eidFitrActive || eidAdhaActive) && (
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        {taraweehActive && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                            <Star className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-300 text-xs">Taraweeh</span>
                            <span className="text-purple-400 font-semibold text-xs">{taraweehTime}</span>
                          </div>
                        )}
                        {eidFitrActive && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-300 text-xs">Eid al-Fitr</span>
                            <span className="text-amber-400 font-semibold text-xs">{eidFitrTime}</span>
                          </div>
                        )}
                        {eidAdhaActive && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-300 text-xs">Eid al-Adha</span>
                            <span className="text-amber-400 font-semibold text-xs">{eidAdhaTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative corner elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute top-24 right-8 w-32 h-32 hidden lg:block z-20"
      >
        <motion.div
          animate={{ rotate: [0, 90] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-t-2 border-r-2 border-lime-400/20 rounded-tr-3xl"
        />
        <div className="absolute top-0 right-0 w-2 h-2 bg-lime-400/50 rounded-full" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-36 left-8 w-32 h-32 hidden lg:block z-20"
      >
        <motion.div
          animate={{ rotate: [0, -90] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-b-2 border-l-2 border-lime-400/20 rounded-bl-3xl"
        />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-lime-400/50 rounded-full" />
      </motion.div>

      {/* Side accent line */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 120 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute right-8 top-1/3 w-px bg-gradient-to-b from-transparent via-lime-400/30 to-transparent hidden xl:block z-20"
      />
    </section>
  );
}
