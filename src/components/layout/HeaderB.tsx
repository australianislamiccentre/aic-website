/**
 * Header Variant B -- Hamburger + Full-Page Overlay
 *
 * Minimal header bar at every breakpoint: logo (left), hamburger + donate CTA +
 * search (right). No inline nav links. Clicking the hamburger opens a full-page
 * overlay with nav groups laid out in a responsive CSS grid (3-col desktop,
 * 2-col tablet, 1-col mobile).
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
import { Menu, X, Search, Heart, MapPin, Phone } from "lucide-react";
import { useIsScrolled } from "./HeaderA";

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                             */
/* ------------------------------------------------------------------ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
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

              {/* ----- Actions: Hamburger + Search + Donate ----- */}
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

      {/* ===== Full-page overlay ===== */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            ref={overlayRef}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-neutral-900 flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Close button */}
            <div className="flex items-center justify-end px-6 py-4">
              <button
                onClick={() => setOverlayOpen(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Nav grid */}
            <div className="flex-1 px-6 md:px-12 lg:px-20 py-8">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                {headerNavGroups.map((group) => (
                  <div key={group.label}>
                    {/* Group heading */}
                    <h2 className="text-xs font-semibold tracking-wider uppercase text-white/50 mb-4">
                      {group.label}
                    </h2>

                    {/* Group links */}
                    <ul className="space-y-3">
                      {group.links.map((link) =>
                        link.external ? (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg text-white/80 hover:text-white transition-colors"
                            >
                              {link.name}
                            </a>
                          </li>
                        ) : (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={() => handleOverlayNavClick(link.href)}
                              className={cn(
                                "text-lg text-white/80 hover:text-white transition-colors",
                                isActive(link.href) && "text-lime-400",
                              )}
                            >
                              {link.name}
                            </Link>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                ))}

                {/* Standalone links: Contact & Donate */}
                <div>
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-white/50 mb-4">
                    Get In Touch
                  </h2>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/contact"
                        onClick={() => handleOverlayNavClick("/contact")}
                        className={cn(
                          "text-lg text-white/80 hover:text-white transition-colors",
                          isActive("/contact") && "text-lime-400",
                        )}
                      >
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/donate"
                        onClick={() => handleOverlayNavClick("/donate")}
                        className="flex items-center gap-2 text-lg text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        Donate
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer with contact info */}
            <div className="border-t border-white/10 px-6 py-4">
              <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                <a
                  href={`tel:${info.phone}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{info.phone}</span>
                </a>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{info.address.suburb}</span>
                </div>
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
