"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Breadcrumb } from "./Breadcrumb";

interface PageHeroProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  height?: "compact" | "short" | "medium" | "tall";
  variant?: "image" | "minimal";
  children?: React.ReactNode;
}

export function PageHero({
  title,
  highlight,
  subtitle,
  badge,
  badgeIcon,
  image,
  imageAlt,
  height = "medium",
  variant = "minimal",
  children,
}: PageHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const heightClasses = {
    compact: "py-20 md:py-28",
    short: "h-[50vh] min-h-[400px]",
    medium: "h-[60vh] min-h-[450px]",
    tall: "h-[70vh] min-h-[500px]",
  };

  const isCompact = height === "compact";

  return (
    <section
      ref={heroRef}
      className={`relative ${heightClasses[height]} overflow-hidden`}
    >
      {/* Background */}
      {variant === "minimal" ? (
        // Minimal: Clean gradient background
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
          {/* Subtle decorative glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-lime-500/5 blur-3xl" />
          </div>
        </div>
      ) : (
        // Image variant: Original parallax image background
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {image && (
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 via-neutral-800/70 to-neutral-900/90" />
        </motion.div>
      )}

      <motion.div
        style={!isCompact ? { opacity: heroOpacity } : undefined}
        className={`relative h-full flex flex-col ${isCompact ? "justify-center" : "justify-center"}`}
      >
        {/* Breadcrumb */}
        <div className={`${isCompact ? "mb-8" : "absolute top-24 left-0 right-0"} px-6`}>
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              {badgeIcon && (
                <span className="text-lime-400">{badgeIcon}</span>
              )}
              <span className="text-lime-400 text-sm font-medium tracking-wide uppercase">
                {badge}
              </span>
            </motion.div>
          )}

          {/* Decorative accent line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 60, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="h-1 bg-gradient-to-r from-lime-400 to-green-500 mx-auto mb-6 rounded-full"
          />

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            {title}{" "}
            {highlight && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                {highlight}
              </span>
            )}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/70 max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
