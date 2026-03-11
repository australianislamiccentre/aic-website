/**
 * Header Variant B -- Hamburger + Accordion Mobile Nav
 *
 * Minimal header bar at every breakpoint: logo (left), hamburger + donate CTA +
 * search (right). No inline nav links. Clicking the hamburger opens a full-screen
 * accordion menu with:
 *
 * - Subtle Islamic geometric pattern overlay on dark gradient background
 * - Staggered entrance animation for each group title
 * - Accordion expand/collapse with height + opacity animation
 * - Plus icon rotates 45° to form × when expanded
 * - Single-open: only one group expanded at a time
 * - Contact as a standalone link (no accordion)
 * - Standalone Donate feature card
 * - Contact info strip at the bottom
 *
 * Uses the shared `headerNavGroups` data from `src/data/navigation.ts`.
 *
 * @module components/layout/HeaderB
 * @see src/data/navigation.ts -- navigation data
 * @see src/components/layout/Header.tsx -- original header (kept intact)
 */
"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
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
  ArrowRight,
  Plus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll hook                                                        */
/* ------------------------------------------------------------------ */

/**
 * Returns `true` once `window.scrollY` exceeds the given pixel threshold.
 * Uses `useSyncExternalStore` for SSR-safe hydration.
 */
function useIsScrolled(threshold = 50) {
  const subscribe = useCallback(
    (callback: () => void) => {
      window.addEventListener("scroll", callback, { passive: true });
      return () => window.removeEventListener("scroll", callback);
    },
    [],
  );

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                             */
/* ------------------------------------------------------------------ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const menuContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    transition: { duration: 0.2 },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const accordionContentVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeOut" as const },
      opacity: { duration: 0.25, delay: 0.05 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.25, ease: "easeOut" as const },
      opacity: { duration: 0.15 },
    },
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HeaderB() {
  const pathname = usePathname();
  const isScrolled = useIsScrolled(50);

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  const info = useSiteSettings();

  /* ---------- Focus trap ---------- */
  useFocusTrap(overlayRef, overlayOpen);

  /* ---------- Helpers ---------- */

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    setExpandedGroup(null);
  }, []);

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
        closeOverlay();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [overlayOpen, closeOverlay]);

  // Return focus to hamburger button after overlay closes
  const prevOverlayOpen = useRef(overlayOpen);
  useEffect(() => {
    if (prevOverlayOpen.current && !overlayOpen) {
      hamburgerRef.current?.focus();
    }
    prevOverlayOpen.current = overlayOpen;
  }, [overlayOpen]);

  const handleLogoClick = useCallback(() => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  const handleOverlayNavClick = useCallback(
    (href: string) => {
      closeOverlay();
      if (href === "/" && pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname, closeOverlay],
  );

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroup((prev) => (prev === label ? null : label));
  }, []);

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
                className="flex items-center group relative h-14 flex-shrink-0"
              >
                {/* Dark-background logo (visible when NOT scrolled) */}
                <Image
                  src="/images/aic logo.png"
                  alt="Australian Islamic Centre"
                  width={150}
                  height={60}
                  className={cn(
                    "h-14 w-auto object-contain transition-opacity duration-300",
                    isScrolled ? "opacity-0" : "opacity-100",
                  )}
                />
                {/* Light-background logo (visible when scrolled) */}
                <Image
                  src="/images/aic website logo.svg"
                  alt="Australian Islamic Centre"
                  width={150}
                  height={60}
                  className={cn(
                    "h-14 w-auto object-contain absolute left-0 top-0 transition-opacity duration-300",
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

      {/* ===== Full-screen accordion overlay ===== */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            ref={overlayRef}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950"
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
                width={150}
                height={60}
                className="h-14 w-auto object-contain"
              />
              <button
                onClick={closeOverlay}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:rotate-90"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Accordion nav */}
            <div className="relative px-8 py-8">
              <motion.div
                variants={menuContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-lg"
              >
                {headerNavGroups.map((group) => {
                  const isExpanded = expandedGroup === group.label;

                  return (
                    <motion.div
                      key={group.label}
                      variants={menuItemVariants}
                      className="border-b border-white/10"
                    >
                      {/* Accordion trigger */}
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="w-full flex items-center justify-between py-4 group/accordion"
                        aria-expanded={isExpanded}
                      >
                        <span className="text-2xl font-bold text-white">
                          {group.label}
                        </span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 45 : 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <Plus className="w-6 h-6 text-white/50 group-hover/accordion:text-white transition-colors" />
                        </motion.span>
                      </button>

                      {/* Accordion content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            variants={accordionContentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="exit"
                            className="overflow-hidden"
                          >
                            <ul className="pb-4 pl-1 space-y-1">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  {link.external ? (
                                    <a
                                      href={link.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn(
                                        "block py-1.5 text-base transition-colors",
                                        "text-white/60 hover:text-white",
                                      )}
                                    >
                                      {link.name}
                                    </a>
                                  ) : (
                                    <Link
                                      href={link.href}
                                      onClick={() => handleOverlayNavClick(link.href)}
                                      className={cn(
                                        "block py-1.5 text-base transition-colors",
                                        isActive(link.href)
                                          ? "text-lime-400"
                                          : "text-white/60 hover:text-white",
                                      )}
                                    >
                                      {link.name}
                                    </Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Contact — standalone link, no accordion */}
                <motion.div variants={menuItemVariants} className="border-b border-white/10">
                  <Link
                    href="/contact"
                    onClick={() => handleOverlayNavClick("/contact")}
                    className={cn(
                      "block py-4 text-base transition-colors",
                      isActive("/contact")
                        ? "text-lime-400"
                        : "text-white/60 hover:text-white",
                    )}
                  >
                    Contact Us
                  </Link>
                </motion.div>

                {/* Donate feature card */}
                <motion.div variants={menuItemVariants} className="mt-8">
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
              </motion.div>
            </div>

            {/* Contact info strip */}
            <div className="relative border-t border-white/10 px-8 py-4 mt-auto">
              <div className="flex flex-col gap-3 text-sm text-white/40">
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
        )}
      </AnimatePresence>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
