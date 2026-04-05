/**
 * Header Variant B -- Hamburger + Responsive Nav Menu
 *
 * Minimal header bar at every breakpoint: logo (left), hamburger + donate CTA +
 * search (right). No inline nav links. Clicking the hamburger opens:
 *
 * **Mobile / Tablet (< md):** Full-screen accordion menu
 * - Accordion expand/collapse with height + opacity animation
 * - Plus icon rotates 45° to form × when expanded
 * - Single-open: only one group expanded at a time
 * - Contact as a standalone link (no accordion)
 * - Full-width layout
 *
 * **Desktop (md+):** Drop-down panel
 * - 5-column grid with group headings, icons, descriptions
 * - Link hover micro-interactions (left accent bar + translateX)
 * - Backdrop blur overlay behind panel
 *
 * Uses nav groups from `src/data/navigation.ts`, including dynamic custom pages from Sanity.
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
import { headerNavGroups, type NavGroup } from "@/data/navigation";
import { getIcon } from "@/lib/icon-map";
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
  Plus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll hook                                                        */
/* ------------------------------------------------------------------ */

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
/*  Nav group metadata (icons + descriptions) — desktop only           */
/* ------------------------------------------------------------------ */

const groupMeta: Record<string, { icon: typeof Users; description: string }> = {
  About: { icon: Users, description: "Learn about our centre" },
  "What's On": { icon: Calendar, description: "Events, services & programs" },
  "Our Mosque": { icon: Landmark, description: "Prayer, worship & visiting" },
  "Media & Resources": { icon: Play, description: "Gallery & downloads" },
  "Get In Touch": { icon: MessageCircle, description: "Connect with us" },
  More: { icon: ArrowRight, description: "Additional pages" },
};

/* ------------------------------------------------------------------ */
/*  Framer Motion variants                                             */
/* ------------------------------------------------------------------ */

// Desktop panel
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

// Mobile accordion
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

    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}

/* ------------------------------------------------------------------ */
/*  NavLink with hover micro-interaction — desktop only                */
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
    "group/link relative flex items-center py-0.5 text-sm transition-all duration-200";

  const content = (
    <>
      <span
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full transition-all duration-200",
          active
            ? "h-full bg-lime-400"
            : "h-0 bg-white/40 group-hover/link:h-full group-hover/link:bg-lime-400/70",
        )}
      />
      <span
        className={cn(
          "pl-[26px] transition-transform duration-200 group-hover/link:translate-x-1",
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
/*  Announcement Bar                                                   */
/* ------------------------------------------------------------------ */

function AnnouncementBar({
  message,
  link,
  linkText,
  backgroundColor,
  dismissable,
}: {
  message: string;
  link?: string;
  linkText?: string;
  backgroundColor: string;
  dismissable: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const bgColors: Record<string, string> = {
    teal: "bg-teal-600",
    gold: "bg-amber-500 text-neutral-900",
    lime: "bg-lime-500 text-neutral-900",
    red: "bg-red-600",
  };

  const content = link ? (
    linkText ? (
      <span>
        {message}{" "}
        <a href={link} className="underline font-semibold hover:no-underline">
          {linkText}
        </a>
      </span>
    ) : (
      <a href={link} className="underline hover:no-underline">
        {message}
      </a>
    )
  ) : (
    <span>{message}</span>
  );

  return (
    <div className={cn("relative text-white text-sm text-center py-2 px-6", bgColors[backgroundColor] || bgColors.teal)}>
      <div className="max-w-7xl mx-auto">{content}</div>
      {dismissable && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
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
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  const info = useSiteSettings();
  const hs = info.headerSettings;

  // Merge nav groups: Sanity settings -> fallback to hardcoded -> append custom pages
  const baseGroups: NavGroup[] = (hs?.navGroups && hs.navGroups.length > 0)
    ? hs.navGroups
      .filter(g => g.visible !== false)
      .map(g => ({
        label: g.label || "",
        links: (g.links || [])
          .filter(l => l.visible !== false)
          .map(l => ({
            name: l.label || "",
            href: l.url || "#",
            external: l.url ? l.url.startsWith("http") : undefined,
          })),
      }))
    : headerNavGroups;

  // Append custom pages from pageContent with showInNav
  const customPageGroup: NavGroup[] = (info.customNavPages && info.customNavPages.length > 0)
    ? [{
        label: "More",
        links: info.customNavPages.map(p => ({
          name: p.navLabel || p.title,
          href: `/${p.slug}`,
        })),
      }]
    : [];

  const navGroups: NavGroup[] = [...baseGroups, ...customPageGroup];

  /* ---------- Focus trap ---------- */
  useFocusTrap(overlayRef, overlayOpen);

  /* ---------- Helpers ---------- */

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false);
    setExpandedGroup(null);
  }, []);

  /* ---------- Side effects ---------- */

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && overlayOpen) {
        closeOverlay();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [overlayOpen, closeOverlay]);

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
      {/* ===== Announcement Bar ===== */}
      {hs?.announcementBar?.enabled && hs.announcementBar.message && (
        <AnnouncementBar
          message={hs.announcementBar.message}
          link={hs.announcementBar.link}
          linkText={hs.announcementBar.linkText}
          backgroundColor={hs.announcementBar.backgroundColor ?? "teal"}
          dismissable={hs.announcementBar.dismissable !== false}
        />
      )}

      {/* ===== Top bar - Desktop ===== */}
      {(hs?.topBar?.visible !== false) && (
      <>
      <div className="hidden lg:block bg-neutral-900 text-white/90 py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-white/70">{hs?.topBar?.desktopWelcome ?? "Welcome to the Australian Islamic Centre"}</span>
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
          <span className="text-white/70">{hs?.topBar?.mobileWelcome ?? "Welcome to AIC"}</span>
          <a
            href={`tel:${info.phone}`}
            className="flex items-center gap-1.5 text-white/70 hover:text-lime-400 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{info.phone}</span>
          </a>
        </div>
      </div>
      </>
      )}

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
                {(hs?.showSearch !== false) && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-200 mx-2 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                    isScrolled
                      ? "text-gray-600 hover:text-neutral-900 hover:bg-neutral-100"
                      : "text-white/90 hover:text-white hover:bg-white/10",
                  )}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                )}

                <Link
                  href={hs?.ctaButton?.url ?? "/donate"}
                  className={cn(
                    "flex items-center gap-2 h-16 px-4 sm:px-6 font-semibold transition-all duration-200 text-sm sm:text-base",
                    {
                      "bg-lime-500 hover:bg-lime-600 text-neutral-900": (hs?.ctaButton?.accentColor ?? "lime") === "lime",
                      "bg-amber-500 hover:bg-amber-600 text-neutral-900": hs?.ctaButton?.accentColor === "gold",
                      "bg-teal-600 hover:bg-teal-700 text-white": hs?.ctaButton?.accentColor === "teal",
                    }
                  )}
                >
                  <Heart className="w-4 h-4" />
                  <span>{hs?.ctaButton?.label ?? "Donate"}</span>
                </Link>

                <button
                  ref={hamburgerRef}
                  onClick={() => setOverlayOpen(true)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-200 ml-2 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
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

      {/* ===== Navigation overlay ===== */}
      <AnimatePresence>
        {overlayOpen && (
          <>
            {/* ── Mobile / Tablet: Full-screen accordion ── */}
            <motion.div
              ref={overlayRef}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="md:hidden fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950"
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

              {/* Header with logo + close */}
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
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:rotate-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Accordion nav — full width */}
              <div className="relative px-6 py-8">
                <motion.div
                  variants={menuContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {navGroups.map((group) => {
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
                                        className="block py-1.5 text-base text-white/60 hover:text-white transition-colors"
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

                  {/* Contact — standalone link */}
                  {(hs?.contactLink?.visible !== false) && (
                  <motion.div variants={menuItemVariants} className="border-b border-white/10">
                    <Link
                      href={hs?.contactLink?.url ?? "/contact"}
                      onClick={() => handleOverlayNavClick(hs?.contactLink?.url ?? "/contact")}
                      className={cn(
                        "block py-4 text-2xl font-bold transition-colors",
                        isActive(hs?.contactLink?.url ?? "/contact")
                          ? "text-lime-400"
                          : "text-white hover:text-white/80",
                      )}
                    >
                      {hs?.contactLink?.label ?? "Contact Us"}
                    </Link>
                  </motion.div>
                  )}

                  {/* Donate feature card */}
                  {(hs?.menuDonateCard?.visible !== false) && (
                  <motion.div variants={menuItemVariants} className="mt-8">
                    <Link
                      href={hs?.menuDonateCard?.url ?? "/donate"}
                      onClick={() => handleOverlayNavClick(hs?.menuDonateCard?.url ?? "/donate")}
                      className="group/donate flex items-center justify-between gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-lime-500/15 to-green-500/10 border border-lime-500/20 hover:border-lime-400/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-500/20">
                          <Heart className="w-5 h-5 text-lime-400" />
                        </div>
                        <div>
                          <span className="block text-base font-semibold text-white">
                            {hs?.menuDonateCard?.heading ?? "Support Our Community"}
                          </span>
                          <span className="block text-sm text-white/40">
                            {hs?.menuDonateCard?.description ?? "Your generosity helps us serve the community"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
                        <span className="hidden sm:inline">{hs?.menuDonateCard?.buttonText ?? "Donate"}</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/donate:translate-x-1" />
                      </div>
                    </Link>
                  </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Contact info strip */}
              <div className="relative border-t border-white/10 px-6 py-4 mt-auto">
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

            {/* ── Desktop: Drop-down panel + backdrop ── */}

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={closeOverlay}
            />

            {/* Panel */}
            <motion.div
              ref={overlayRef}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="hidden md:block fixed top-0 left-0 right-0 z-50 overflow-y-auto max-h-[85vh] shadow-2xl bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950"
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
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:rotate-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Nav grid — staggered entrance */}
              <div className="relative px-12 lg:px-20 py-8">
                <motion.div
                  variants={groupContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-6xl mx-auto grid grid-cols-3 lg:grid-cols-5 gap-6"
                >
                  {navGroups.map((group) => {
                    const meta = groupMeta[group.label];
                    // Try to get icon from Sanity settings
                    const sanityGroup = hs?.navGroups?.find(g => g.label === group.label);
                    const SanityIcon = getIcon(sanityGroup?.icon);
                    const Icon = SanityIcon || meta?.icon;
                    const description = sanityGroup?.description || meta?.description;

                    return (
                      <motion.div key={group.label} variants={groupItemVariants}>
                        <div className="flex items-center gap-2.5 mb-3">
                          {Icon && (
                            <Icon className="w-4 h-4 text-lime-400/70" />
                          )}
                          <h2 className="text-sm font-semibold tracking-wider uppercase text-white/50">
                            {group.label}
                          </h2>
                        </div>
                        {description && (
                          <p className="text-xs text-white/30 mb-2 -mt-1">{description}</p>
                        )}

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

                  {/* Get In Touch group */}
                  {(hs?.contactLink?.visible !== false) && (
                  <motion.div variants={groupItemVariants}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <MessageCircle className="w-4 h-4 text-lime-400/70" />
                      <h2 className="text-sm font-semibold tracking-wider uppercase text-white/50">
                        Get In Touch
                      </h2>
                    </div>
                    <ul className="space-y-0.5">
                      <NavLinkItem
                        href={hs?.contactLink?.url ?? "/contact"}
                        name={hs?.contactLink?.label ?? "Contact Us"}
                        active={isActive(hs?.contactLink?.url ?? "/contact")}
                        onClick={() => handleOverlayNavClick(hs?.contactLink?.url ?? "/contact")}
                      />
                    </ul>
                  </motion.div>
                  )}
                </motion.div>

                {/* Donate feature card */}
                {(hs?.menuDonateCard?.visible !== false) && (
                <motion.div
                  variants={donateCardVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-6xl mx-auto mt-10"
                >
                  <Link
                    href={hs?.menuDonateCard?.url ?? "/donate"}
                    onClick={() => handleOverlayNavClick(hs?.menuDonateCard?.url ?? "/donate")}
                    className="group/donate flex items-center justify-between gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-lime-500/15 to-green-500/10 border border-lime-500/20 hover:border-lime-400/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-500/20">
                        <Heart className="w-5 h-5 text-lime-400" />
                      </div>
                      <div>
                        <span className="block text-base font-semibold text-white">
                          {hs?.menuDonateCard?.heading ?? "Support Our Community"}
                        </span>
                        <span className="block text-sm text-white/40">
                          {hs?.menuDonateCard?.description ?? "Your generosity helps us serve the community"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
                      <span>{hs?.menuDonateCard?.buttonText ?? "Donate"}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/donate:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
                )}
              </div>

              {/* Contact info strip */}
              <div className="relative border-t border-white/10 px-12 lg:px-20 py-4">
                <div className="max-w-6xl mx-auto flex flex-row items-center gap-8 text-sm text-white/40">
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
