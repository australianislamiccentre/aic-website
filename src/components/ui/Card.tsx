/**
 * Card Components
 *
 * A family of card variants used across the site:
 * - `Card` — basic container with optional hover lift and glass effect.
 * - `ImageCard` — card with an image header, overlay badge, and body content.
 * - `InfoCard` — icon + title + description layout for feature grids.
 * - `StatsCard` — numeric stat with label and optional trend indicator.
 *
 * All cards use Framer Motion for hover micro-animations.
 *
 * @module components/ui/Card
 */
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Props for the base Card wrapper. */
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className,
  hover = true,
  glass = false,
  padding = "md",
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-2xl transition-all duration-300",
        glass
          ? "glass"
          : "bg-white shadow-lg hover:shadow-2xl hover:shadow-green-500/10",
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface ImageCardProps {
  image: string;
  alt: string;
  title: string;
  subtitle?: string;
  description?: string;
  href?: string;
  badge?: string;
  overlay?: boolean;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  className?: string;
  expandOnHover?: boolean;
}

const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[2/1]",
};

export function ImageCard({
  image,
  alt,
  title,
  subtitle,
  description,
  href,
  badge,
  overlay = true,
  aspectRatio = "video",
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expandOnHover = false,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300",
        className
      )}
    >
      <div className={cn("relative overflow-hidden", aspectRatios[aspectRatio])}>
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover"
          />
        </motion.div>
        {overlay && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            animate={{ opacity: isHovered ? 0.9 : 0.6 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {badge && (
          <motion.span
            className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {badge}
          </motion.span>
        )}
        {overlay && (
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {subtitle && (
              <motion.p
                className="text-lime-400 text-sm font-medium mb-1"
                animate={{ y: isHovered ? 0 : 4, opacity: isHovered ? 1 : 0.8 }}
              >
                {subtitle}
              </motion.p>
            )}
            <motion.h3
              className="text-xl font-bold mb-2"
              animate={{ y: isHovered ? 0 : 2 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h3>
            {description && (
              <p className="text-white/80 text-sm line-clamp-2 mb-3">
                {description}
              </p>
            )}
            {href && (
              <div className="flex items-center gap-2 text-lime-400 text-sm font-medium">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        )}
      </div>
      {!overlay && (
        <div className="p-6">
          {subtitle && (
            <p className="text-green-600 text-sm font-medium mb-1">{subtitle}</p>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {description && (
            <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
          )}
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

interface StatCardProps {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.3, type: "spring" }}
      className={cn(
        "relative p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center overflow-hidden group",
        className
      )}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {icon && (
        <motion.div
          className="absolute top-2 right-2 md:top-4 md:right-4 text-white/20 group-hover:text-white/40 transition-colors"
          whileHover={{ rotate: 10, scale: 1.1 }}
        >
          <span className="[&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-8 md:[&>svg]:h-8">
            {icon}
          </span>
        </motion.div>
      )}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2 relative"
      >
        {value}
      </motion.div>
      <p className="text-white/80 font-medium text-xs sm:text-sm md:text-base relative">{label}</p>
    </motion.div>
  );
}

// Service Card with icon reveal
interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features?: string[];
  href?: string;
  className?: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  features = [],
  href,
  className,
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      className={cn(
        "group relative p-6 rounded-2xl bg-white shadow-lg overflow-hidden cursor-pointer",
        isHovered && "shadow-2xl",
        className
      )}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-500 to-primary-700"
        initial={{ y: "100%" }}
        animate={{ y: isHovered ? "0%" : "100%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <motion.div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
            isHovered ? "bg-white/20 text-white" : "bg-green-100 text-green-600"
          )}
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>

        <motion.h3
          className={cn(
            "text-lg font-bold mb-2 transition-colors duration-300",
            isHovered ? "text-white" : "text-gray-900"
          )}
        >
          {title}
        </motion.h3>

        <motion.p
          className={cn(
            "text-sm mb-4 transition-colors duration-300",
            isHovered ? "text-white/90" : "text-gray-600"
          )}
        >
          {description}
        </motion.p>

        {/* Features - always visible */}
        {features.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
            {features.slice(0, 3).map((feature) => (
              <div
                key={feature}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors duration-300",
                  isHovered ? "text-white/90" : "text-gray-600"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                  isHovered ? "bg-white/60" : "bg-green-500"
                )} />
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Arrow indicator - always visible */}
        <div className="absolute bottom-6 right-6">
          <ArrowRight className={cn(
            "w-5 h-5 transition-colors duration-300",
            isHovered ? "text-white" : "text-green-600"
          )} />
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
