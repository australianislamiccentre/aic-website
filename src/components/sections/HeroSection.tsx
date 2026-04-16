/**
 * HeroSection
 *
 * Full-width homepage hero with an auto-advancing background image carousel
 * and primary call-to-action buttons.
 * Appears at the top of the homepage as the first visible section.
 *
 * @module components/sections/HeroSection
 */
"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { aicImages } from "@/data/content";
import type { SanityHomepageSettings } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";

/** A resolved hero slide with text, buttons, and a ready-to-use image URL. */
interface HeroButton {
  label?: string;
  linkType?: "internal" | "external";
  internalPage?: string;
  url?: string;
}

interface ResolvedSlide {
  title: string;
  highlight: string;
  subtitle?: string;
  primaryButton?: HeroButton;
  secondaryButton?: HeroButton;
  image: string;
}

/** Resolve a hero button's href — internal page path or custom URL. */
function resolveButtonUrl(btn?: HeroButton): string | undefined {
  if (!btn) return undefined;
  return btn.linkType === "external" ? btn.url : (btn.internalPage || btn.url);
}

// Fallback hero slides — used when Sanity data is not available
const fallbackSlides: ResolvedSlide[] = [
  {
    title: "Welcome to the",
    highlight: "Australian Islamic Centre",
    subtitle: "A place of worship, learning, and community",
    image: aicImages.interior.prayerHallBright,
  },
  {
    title: "Award-Winning",
    highlight: "Architecture",
    subtitle: "Experience our globally recognized Islamic architecture",
    image: aicImages.exterior.front,
  },
  {
    title: "Join Us in",
    highlight: "Prayer",
    subtitle: "Five daily prayers in our beautiful prayer hall",
    image: aicImages.interior.prayerHallNight,
  },
];

interface HeroSectionProps {
  heroMode?: "carousel" | "video";
  heroVideoUrl?: string;
  heroSlides?: SanityHomepageSettings["heroSlides"];
  heroVideoOverlays?: SanityHomepageSettings["heroVideoOverlays"];
}

export function HeroSection({ heroMode, heroVideoUrl, heroSlides, heroVideoOverlays }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Merge Sanity hero data with fallbacks — resolve correct array based on mode
  const slides: ResolvedSlide[] = useMemo(() => {
    const isVideo = heroMode === "video";

    // Video mode: prefer heroVideoOverlays, fall back to heroSlides text, then defaults
    if (isVideo) {
      const activeOverlays = heroVideoOverlays?.filter((item) => item.active !== false) ?? [];
      if (activeOverlays.length > 0) {
        return activeOverlays.map((overlay, i) => ({
          title: overlay.title,
          highlight: overlay.highlight,
          subtitle: overlay.subtitle,
          primaryButton: overlay.primaryButton,
          secondaryButton: overlay.secondaryButton,
          // Video provides the background; use fallback image for reduced-motion poster
          image: fallbackSlides[i % fallbackSlides.length].image,
        }));
      }
      // Fall through: try heroSlides text content (ignore their images)
      const activeSlides = heroSlides?.filter((item) => item.active !== false) ?? [];
      if (activeSlides.length > 0) {
        return activeSlides.map((slide, i) => ({
          title: slide.title,
          highlight: slide.highlight,
          subtitle: slide.subtitle,
          primaryButton: slide.primaryButton,
          secondaryButton: slide.secondaryButton,
          image: fallbackSlides[i % fallbackSlides.length].image,
        }));
      }
      return fallbackSlides;
    }

    // Carousel mode: use heroSlides with their images
    const active = heroSlides?.filter((item) => item.active !== false) ?? [];
    if (active.length === 0) return fallbackSlides;
    return active.map((slide, i) => ({
      title: slide.title,
      highlight: slide.highlight,
      subtitle: slide.subtitle,
      primaryButton: slide.primaryButton,
      secondaryButton: slide.secondaryButton,
      image: slide.image
        ? urlFor(slide.image).width(1920).height(1080).url()
        : fallbackSlides[i % fallbackSlides.length].image,
    }));
  }, [heroMode, heroSlides, heroVideoOverlays]);

  // Determine effective display mode — fall back to carousel if video URL missing or errored
  const isVideoMode = heroMode === "video" && !!heroVideoUrl && !videoError;

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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

  const currentSlideData = slides[currentSlide];

  return (
    <section ref={containerRef} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-black">
      {/* Background — Video or Image Carousel */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-[-20px]"
      >
        {isVideoMode ? (
          /* Video background — looping, muted, decorative */
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center motion-safe:block motion-reduce:hidden"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          /* Image carousel */
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
        )}

        {/* Static poster for reduced-motion users in video mode */}
        {isVideoMode && (
          <div className="absolute inset-0 motion-safe:hidden motion-reduce:block">
            <Image
              src={slides[0].image}
              alt={slides[0].highlight}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        )}

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

                {currentSlideData.subtitle && (
                  <motion.p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-6 md:mb-8 leading-relaxed max-w-2xl">
                    {currentSlideData.subtitle}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons — data-driven from heroSlides with hardcoded fallback */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  href={resolveButtonUrl(currentSlideData.primaryButton) || "/about"}
                  variant="white"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  {currentSlideData.primaryButton?.label || "Explore Our Centre"}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  href={resolveButtonUrl(currentSlideData.secondaryButton) || "/visit"}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-lime-400/50"
                  icon={<Play className="w-5 h-5" />}
                >
                  {currentSlideData.secondaryButton?.label || "Book a Visit"}
                </Button>
              </motion.div>
            </motion.div>

            {/* Slide indicators — hidden in video mode */}
            {!isVideoMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center gap-3"
              >
                {slides.map((_, index) => (
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
            )}
          </div>
        </div>

        {/* Navigation arrows — hidden in video mode */}
        {!isVideoMode && (
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
        )}
      </motion.div>
    </section>
  );
}
