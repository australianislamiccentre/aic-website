/**
 * Header Variant B -- Hamburger + Enhanced Drop-Down Panel
 *
 * Minimal header bar at every breakpoint: logo (left), hamburger + donate CTA +
 * search (right). No inline nav links. Clicking the hamburger opens a refined
 * drop-down panel with:
 *
 * - Subtle Islamic geometric pattern overlay on dark gradient background
 * - Staggered entrance animation for each nav group
 * - Link hover micro-interactions (left accent bar + translateX)
 * - Group headings with icons and brief descriptions
 * - Standalone Donate feature card (visually distinct from nav links)
 * - Contact info strip at the bottom
 *
 * Uses the shared `headerNavGroups` data from `src/data/navigation.ts`.
 *
 * @module components/layout/HeaderB
 * @see src/data/navigation.ts -- navigation data
 * @see src/components/layout/HeaderA.tsx -- scroll hook & pattern reference
 * @see src/components/layout/Header.tsx -- original header (kept intact)
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/ui/SearchDialog";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { headerNavGroups } from "@/data/navigation";
import {
  Menu,
  X,
  Search,
  Heart,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Landmark,
  Play,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useIsScrolled } from "./HeaderA";

/* ------------------------------------------------------------------ */
/*  Nav group metadata (icons + descriptions)                          */
/* ------------------------------------------------------------------ */

const groupMeta: Record<string, { icon: typeof Users; description: string }> = {
  About: { icon: Users, description: "Learn about our centre" },
  "What's On": { icon: Calendar, description: "Events, services & programs" },
  "Our Mosque": { icon: Landmark, description: "Prayer, worship & visiting" },
  "Media & Resources": { icon: Play, description: "Gallery & downloads" },
  "Get In Touch": { icon: MessageCircle, description: "Connect with us" },
};

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                             */
/* ------------------------------------------------------------------ */

const panelVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const groupContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const groupItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const donateCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const, delay: 0.4 },
  },
};

/* ------------------------------------------------------------------ */
/*  Focus-trap hook                                                    */
/* ------------------------------------------------------------------ */

/**
 * Traps keyboard focus inside the given container while active.
 * Pressing Tab / Shift+Tab cycles through focusable elements.
 */
function useFocusTrap(containerRef: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    const getFocusable = () =>
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Focus the first focusable element on mount
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}

/* ------------------------------------------------------------------ */
/*  NavLink with hover micro-interaction                               */
/* ------------------------------------------------------------------ */

function NavLinkItem({
  href,
  name,
  active,
  external,
  onClick,
}: {
  href: string;
  name: string;
  active: boolean;
  external?: boolean;
  onClick?: () => void;
}) {
  const baseClasses =
    "group/link relative flex items-center py-0.5 text-xs transition-all duration-200";

  const content = (
    <>
      {/* Left accent bar */}
      <span
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full transition-all duration-200",
          active
            ? "h-full bg-lime-400"
            : "h-0 bg-white/40 group-hover/link:h-full group-hover/link:bg-lime-400/70",
        )}
      />
      {/* Link text */}
      <span
        className={cn(
          "pl-2 transition-transform duration-200 group-hover/link:translate-x-1",
          active ? "translate-x-1" : "",
        )}
      >
        {name}
      </span>
    </>
  );

  if (external) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(baseClasses, "text-white/70 hover:text-white")}
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          baseClasses,
          active ? "text-lime-400" : "text-white/70 hover:text-white",
        )}
      >
        {content}
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HeaderB() {
  const pathname = usePathname();
  const isScrolled = useIsScrolled(50);

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  const info = useSiteSettings();

  /* ---------- Focus trap ---------- */
  useFocusTrap(overlayRef, overlayOpen);

  /* ---------- Side effects ---------- */

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (overlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  // Close overlay on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && overlayOpen) {
        setOverlayOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [overlayOpen]);

  // Return focus to hamburger button after overlay closes
  const prevOverlayOpen = useRef(overlayOpen);
  useEffect(() => {
    if (prevOverlayOpen.current && !overlayOpen) {
      hamburgerRef.current?.focus();
    }
    prevOverlayOpen.current = overlayOpen;
  }, [overlayOpen]);

  /* ---------- Helpers ---------- */

  const handleLogoClick = useCallback(() => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  const handleOverlayNavClick = useCallback(
    (href: string) => {
      setOverlayOpen(false);
      if (href === "/" && pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname],
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  /* ---------- Render ---------- */

  return (
    <>
      {/* ===== Top bar - Desktop ===== */}
      <div className="hidden lg:block bg-neutral-900 text-white/90 py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-white/70">Welcome to the Australian Islamic Centre</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/50" />
              <span className="text-white/70">
                {info.address.suburb}, {info.address.state}
              </span>
            </div>
            <a
              href={`tel:${info.phone}`}
              className="flex items-center gap-2 hover:text-lime-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{info.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ===== Top bar - Mobile / Tablet ===== */}
      <div className="lg:hidden bg-neutral-900 text-white py-2 px-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/70">Welcome to AIC</span>
          <a
            href={`tel:${info.phone}`}
            className="flex items-center gap-1.5 text-white/70 hover:text-lime-400 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{info.phone}</span>
          </a>
        </div>
      </div>

      {/* ===== Main header (sticky) ===== */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-neutral-900/90 backdrop-blur-sm",
        )}
      >
        <div className="relative">
          <nav className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* ----- Logo ----- */}
              <Link
                href="/"
                onClick={handleLogoClick}
                className="flex items-center group relative h-10 flex-shrink-0"
              >
                {/* Dark-background logo (visible when NOT scrolled) */}
                <Image
                  src="/images/aic logo.png"
                  alt="Australian Islamic Centre"
                  width={100}
                  height={40}
                  className={cn(
                    "h-10 w-auto object-contain transition-opacity duration-300",
                    isScrolled ? "opacity-0" : "opacity-100",
                  )}
                />
                {/* Light-background logo (visible when scrolled) */}
                <Image
                  src="/images/aic website logo.svg"
                  alt="Australian Islamic Centre"
                  width={100}
                  height={40}
                  className={cn(
                    "h-10 w-auto object-contain absolute left-0 top-0 transition-opacity duration-300",
                    isScrolled ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>

              {/* ----- Actions: Search + Donate + Hamburger ----- */}
              <div className="flex items-center h-16">
                {/* Search button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-200 mx-2",
                    isScrolled
                      ? "text-gray-600 hover:text-neutral-900 hover:bg-neutral-100"
                      : "text-white/90 hover:text-white hover:bg-white/10",
                  )}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Donate CTA */}
                <Link
                  href="/donate"
                  className="flex items-center gap-2 h-16 px-4 sm:px-6 bg-lime-500 hover:bg-lime-600 text-neutral-900 font-semibold transition-all duration-200 text-sm sm:text-base"
                >
                  <Heart className="w-4 h-4" />
                  <span>Donate</span>
                </Link>

                {/* Hamburger button */}
                <button
                  ref={hamburgerRef}
                  onClick={() => setOverlayOpen(true)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-200 ml-2",
                    isScrolled
                      ? "text-gray-600 hover:text-neutral-900 hover:bg-neutral-100"
                      : "text-white/90 hover:text-white hover:bg-white/10",
                  )}
                  aria-label="Open menu"
                  aria-expanded={overlayOpen}
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ===== Drop-down panel + backdrop ===== */}
      <AnimatePresence>
        {overlayOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setOverlayOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={overlayRef}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 right-0 z-50 overflow-y-auto max-h-[85vh] shadow-2xl bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Geometric pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Panel header with logo + close */}
              <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10">
                <Image
                  src="/images/aic logo.png"
                  alt="Australian Islamic Centre"
                  width={100}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setOverlayOpen(false)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:rotate-90"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Nav grid — staggered entrance */}
              <div className="relative px-6 md:px-12 lg:px-20 py-8">
                <motion.div
                  variants={groupContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
                >
                  {headerNavGroups.map((group) => {
                    const meta = groupMeta[group.label];
                    const Icon = meta?.icon;

                    return (
                      <motion.div key={group.label} variants={groupItemVariants}>
                        {/* Group heading with icon */}
                        <div className="flex items-center gap-2.5 mb-1">
                          {Icon && (
                            <Icon className="w-4 h-4 text-lime-400/70" />
                          )}
                          <h2 className="text-sm font-semibold tracking-wider uppercase text-white/50">
                            {group.label}
                          </h2>
                        </div>

                        {/* Group description */}
                        {meta?.description && (
                          <p className="text-xs text-white/25 mb-4 pl-[26px]">
                            {meta.description}
                          </p>
                        )}

                        {/* Group links */}
                        <ul className="space-y-0.5">
                          {group.links.map((link) => (
                            <NavLinkItem
                              key={link.href}
                              href={link.href}
                              name={link.name}
                              active={isActive(link.href)}
                              external={link.external}
                              onClick={() => handleOverlayNavClick(link.href)}
                            />
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}

                  {/* Get In Touch group (Contact only) */}
                  <motion.div variants={groupItemVariants}>
                    <div className="flex items-center gap-2.5 mb-1">
                      <MessageCircle className="w-4 h-4 text-lime-400/70" />
                      <h2 className="text-sm font-semibold tracking-wider uppercase text-white/50">
                        Get In Touch
                      </h2>
                    </div>
                    <p className="text-xs text-white/25 mb-4 pl-[26px]">
                      Connect with us
                    </p>
                    <ul className="space-y-0.5">
                      <NavLinkItem
                        href="/contact"
                        name="Contact Us"
                        active={isActive("/contact")}
                        onClick={() => handleOverlayNavClick("/contact")}
                      />
                    </ul>
                  </motion.div>
                </motion.div>

                {/* Donate feature card — standalone, visually distinct */}
                <motion.div
                  variants={donateCardVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-5xl mx-auto mt-10"
                >
                  <Link
                    href="/donate"
                    onClick={() => handleOverlayNavClick("/donate")}
                    className="group/donate flex items-center justify-between gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-lime-500/15 to-green-500/10 border border-lime-500/20 hover:border-lime-400/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-500/20">
                        <Heart className="w-5 h-5 text-lime-400" />
                      </div>
                      <div>
                        <span className="block text-base font-semibold text-white">
                          Support Our Community
                        </span>
                        <span className="block text-sm text-white/40">
                          Your generosity helps us serve the community
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
                      <span className="hidden sm:inline">Donate</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/donate:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              </div>

              {/* Contact info strip */}
              <div className="relative border-t border-white/10 px-6 md:px-12 lg:px-20 py-4">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-sm text-white/40">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <span>
                      {info.address.street}, {info.address.suburb} {info.address.state}{" "}
                      {info.address.postcode}
                    </span>
                  </div>
                  <a
                    href={`tel:${info.phone}`}
                    className="flex items-center gap-2 hover:text-white/70 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <span>{info.phone}</span>
                  </a>
                  <a
                    href={`mailto:${info.email}`}
                    className="flex items-center gap-2 hover:text-white/70 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <span>{info.email}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
