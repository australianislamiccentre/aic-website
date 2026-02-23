/**
 * Button Component
 *
 * Polymorphic button that renders as either a `<button>` or a Next.js `<Link>`
 * depending on whether `href` is provided. Supports 6 colour variants,
 * 4 sizes, optional icon, and a loading spinner state.
 *
 * Uses Framer Motion for hover / tap micro-animations.
 *
 * @module components/ui/Button
 */
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";

/** Props for the Button component. */
interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "gold" | "ghost" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  target?: string;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const variants = {
  primary:
    "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:shadow-green-500/25",
  secondary:
    "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl hover:shadow-primary-500/25",
  outline:
    "border-2 border-primary-700 text-primary-800 hover:bg-primary-50 hover:border-primary-800",
  gold: "bg-gradient-to-r from-lime-500 to-lime-600 text-white hover:from-lime-600 hover:to-lime-700 shadow-lg hover:shadow-xl hover:shadow-lime-500/25",
  ghost:
    "text-primary-700 hover:bg-primary-100 hover:text-primary-900",
  white:
    "bg-white text-primary-800 hover:bg-gray-50 shadow-lg hover:shadow-xl",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3 text-lg",
  xl: "px-10 py-4 text-xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  target,
  className,
  icon,
  iconPosition = "right",
  loading = false,
  disabled,
  type = "button",
  onClick,
}: ButtonProps) {
  const baseClasses = cn(
    "relative inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden",
    variants[variant],
    sizes[size],
    className
  );

  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && iconPosition === "left" && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="absolute inset-0 bg-white/20 transform translate-x-[-100%] skew-x-12 transition-transform duration-500 group-hover:translate-x-[100%]" />
    </>
  );

  if (href) {
    // Use regular anchor for external links
    if (target === "_blank" || href.startsWith("http")) {
      return (
        <a
          href={href}
          target={target || "_blank"}
          rel="noopener noreferrer"
          className={cn(baseClasses, "group")}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cn(baseClasses, "group")} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(baseClasses, "group")}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
    >
      {content}
    </motion.button>
  );
}

interface IconButtonProps {
  icon: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  className,
  label,
  onClick,
  disabled,
}: IconButtonProps) {
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      className={cn(
        "rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
        variants[variant],
        sizeClasses[size],
        className
      )}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </motion.button>
  );
}
