/**
 * Breadcrumb Navigation
 *
 * Two variants for different backgrounds:
 * - `Breadcrumb` — white text for dark hero sections.
 * - `BreadcrumbLight` — grey/black text for light backgrounds.
 *
 * Can be used with explicit `items` prop or will auto-generate
 * breadcrumbs from the current URL pathname using `pathLabels`.
 *
 * @module components/ui/Breadcrumb
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

/** A single breadcrumb entry (label + link). */
interface BreadcrumbItem {
  label: string;
  href: string;
}

/** Maps URL path segments to human-readable labels for auto-generated breadcrumbs. */
const pathLabels: Record<string, string> = {
  about: "About Us",
  architecture: "Architecture",
  contact: "Contact",
  donate: "Donate",
  events: "Events",
  media: "Media",
  programs: "Programs",
  resources: "Resources",
  services: "Services",
  visit: "Visit",
  worshippers: "Worshippers",
};

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs: BreadcrumbItem[] = items || generateBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-white/40" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-white font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </motion.nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") return [];

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

/** Light-background variant — grey/black text instead of white. */
export function BreadcrumbLight({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();
  const breadcrumbs: BreadcrumbItem[] = items || generateBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </motion.nav>
  );
}
