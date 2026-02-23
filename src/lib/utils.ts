/**
 * General-Purpose Utility Functions
 *
 * Shared helpers used across the AIC website. All date and currency formatting
 * uses the en-AU locale to match the Melbourne, Australia context.
 *
 * @module lib/utils
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (deduplicates
 * conflicting utilities — e.g. "p-4 p-6" resolves to "p-6").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a date as "Saturday, 22 February 2026" (en-AU full format). */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Formats a time as "2:30 pm" (en-AU 12-hour format). */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Formats a number as "$1,234.00" (AUD currency). */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

/** Truncates text to `maxLength` characters, appending "..." if trimmed. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/** Converts text to a URL-safe slug (lowercase, hyphens, no special chars). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extracts up to 2 initials from a name (e.g. "John Smith" → "JS"). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
