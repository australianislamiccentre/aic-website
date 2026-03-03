/**
 * Header Variant A -- Inline Links + Dropdown Panels
 *
 * Desktop: top info bar, sticky main bar with nav-group labels that reveal
 *          a single-column dropdown panel on hover. "Contact" is a flat link.
 * Mobile:  compact top bar, hamburger opens a full-screen slide-out drawer
 *          with accordion groups.
 *
 * Uses the shared `headerNavGroups` data from `src/data/navigation.ts`.
 *
 * @module components/layout/HeaderA
 * @see src/data/navigation.ts -- navigation data
 * @see src/components/layout/Header.tsx -- original header (kept intact)
 */
"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
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
  ChevronDown,
  ChevronRight,
  Search,
  Heart,
  MapPin,
  Phone,
  ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll hook (exported so HeaderB / HeaderC can reuse it)          */
/* ------------------------------------------------------------------ */

/**
 * Returns `true` once `window.scrollY` exceeds the given pixel threshold.
 * Uses `useSyncExternalStore` for SSR-safe hydration.
 */
export function useIsScrolled(threshold = 50) {
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
/*  Framer Motion variants                                            */
/* ------------------------------------------------------------------ */

const dropdownVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const drawerOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerPanelVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

const accordionVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function HeaderA() {
  const pathname = usePathname();
  const isScrolled = useIsScrolled(50);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const info = useSiteSettings();

  /* ---------- Side effects ---------- */

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* ---------- Helpers ---------- */

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMobileNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setMobileExpandedGroup(null);
    if (href === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleMobileGroup = (label: string) => {
    setMobileExpandedGroup((prev) => (prev === label ? null : label));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  /** True when *any* link inside a group matches the current path. */
  const isGroupActive = (links: { href: string }[]) =>
    links.some((link) => isActive(link.href));

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

              {/* ----- Desktop navigation ----- */}
              <div
                className="hidden lg:flex items-center h-full relative ml-auto"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {headerNavGroups.map((group) => (
                  <div
                    key={group.label}
                    className="relative h-16 flex items-center"
                    onMouseEnter={() => setActiveDropdown(group.label)}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === group.label}
                      className={cn(
                        "flex items-center gap-1 px-2 xl:px-3 h-full text-sm xl:text-base font-semibold transition-all duration-200 border-b-2 whitespace-nowrap",
                        isScrolled
                          ? cn(
                              "text-gray-700 hover:text-primary-600 border-transparent hover:border-primary-600",
                              isGroupActive(group.links) &&
                                "text-primary-600 border-primary-600",
                            )
                          : cn(
                              "text-white/90 hover:text-white border-transparent hover:border-lime-400",
                              isGroupActive(group.links) &&
                                "text-lime-400 border-lime-400",
                            ),
                      )}
                    >
                      {group.label}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0",
                          activeDropdown === group.label && "rotate-180",
                        )}
                      />
                    </button>

                    {/* Dropdown panel (single-column link list) */}
                    <AnimatePresence>
                      {activeDropdown === group.label && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-0 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                        >
                          <ul className="py-2">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                {link.external ? (
                                  <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors",
                                      isActive(link.href) &&
                                        "text-primary-600 font-medium",
                                    )}
                                  >
                                    <span>{link.name}</span>
                                    <ExternalLink className="w-3 h-3 opacity-50" />
                                  </a>
                                ) : (
                                  <Link
                                    href={link.href}
                                    className={cn(
                                      "block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors",
                                      isActive(link.href) &&
                                        "text-primary-600 font-medium",
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
                  </div>
                ))}

                {/* Contact - flat link, no dropdown */}
                <Link
                  href="/contact"
                  className={cn(
                    "flex items-center px-2 xl:px-3 h-16 text-sm xl:text-base font-semibold transition-all duration-200 border-b-2 whitespace-nowrap",
                    isScrolled
                      ? cn(
                          "text-gray-700 hover:text-primary-600 border-transparent hover:border-primary-600",
                          isActive("/contact") && "text-primary-600 border-primary-600",
                        )
                      : cn(
                          "text-white/90 hover:text-white border-transparent hover:border-lime-400",
                          isActive("/contact") && "text-lime-400 border-lime-400",
                        ),
                  )}
                >
                  Contact
                </Link>
              </div>

              {/* ----- Actions: Search + Donate + Hamburger ----- */}
              <div className="flex items-center h-16">
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

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className={cn(
                    "lg:hidden p-2.5 rounded-lg transition-all duration-200 ml-2",
                    isScrolled
                      ? "text-gray-600 hover:text-neutral-900 hover:bg-neutral-100"
                      : "text-white/90 hover:text-white hover:bg-white/10",
                  )}
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ===== Mobile drawer ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={drawerOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              variants={drawerPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 bg-neutral-900 z-50 lg:hidden flex flex-col"
            >
              {/* Sticky header */}
              <div className="sticky top-0 z-10 bg-neutral-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <Image
                  src="/images/aic logo.png"
                  alt="Australian Islamic Centre"
                  width={100}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Scrollable nav */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-1">
                  {headerNavGroups.map((group) => (
                    <div key={group.label}>
                      {/* Accordion trigger */}
                      <button
                        onClick={() => toggleMobileGroup(group.label)}
                        aria-expanded={mobileExpandedGroup === group.label}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                      >
                        <span className="text-lg font-semibold">{group.label}</span>
                        <motion.div
                          animate={{
                            rotate: mobileExpandedGroup === group.label ? 90 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-white/60" />
                        </motion.div>
                      </button>

                      {/* Accordion content */}
                      <AnimatePresence>
                        {mobileExpandedGroup === group.label && (
                          <motion.div
                            variants={accordionVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 pl-4 border-l-2 border-lime-500/30 space-y-0.5 py-2">
                              {group.links.map((link) =>
                                link.external ? (
                                  <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between pl-2 pr-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm"
                                  >
                                    <span>{link.name}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                                  </a>
                                ) : (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => handleMobileNavClick(link.href)}
                                    className={cn(
                                      "block pl-2 pr-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm",
                                      isActive(link.href) && "text-lime-400",
                                    )}
                                  >
                                    {link.name}
                                  </Link>
                                ),
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {/* Contact - flat link */}
                  <Link
                    href="/contact"
                    onClick={() => handleMobileNavClick("/contact")}
                    className="block px-4 py-4 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Contact
                  </Link>

                  {/* Donate link */}
                  <Link
                    href="/donate"
                    onClick={() => handleMobileNavClick("/donate")}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-semibold text-amber-400 hover:bg-white/10 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    Donate
                  </Link>
                </div>
              </div>

              {/* Fixed footer */}
              <div className="sticky bottom-0 bg-neutral-900 border-t border-white/10 px-6 py-4">
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
          </>
        )}
      </AnimatePresence>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
