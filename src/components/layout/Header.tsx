"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SearchDialog } from "@/components/ui/SearchDialog";
import { aicInfo } from "@/data/content";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Heart,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
} from "lucide-react";

const navigation = [
  {
    name: "Home",
    href: "/",
    children: [
      { name: "Prayer Times", href: "/#prayer-times" },
      { name: "For Worshippers", href: "/worshippers" },
      { name: "For Visitors", href: "/visit" },
      { name: "AIC College", href: aicInfo.externalLinks.college, external: true },
      { name: "AIC Bookstore", href: aicInfo.externalLinks.bookstore, external: true },
      { name: "Newport Storm FC", href: aicInfo.externalLinks.newportStorm, external: true },
    ],
  },
  { name: "About", href: "/about" },
  {
    name: "Worshippers",
    href: "/worshippers",
    children: [
      { name: "Daily Prayers", href: "/worshippers#prayers" },
      { name: "Friday Sermons", href: "/worshippers#jumuah" },
      { name: "Mosque Etiquette", href: "/worshippers#etiquette" },
      { name: "Religious Programs", href: "/worshippers#programs" },
      { name: "Events", href: "/events" },
      { name: "Services", href: "/services" },
      { name: "Getting to AIC", href: "/visit#directions" },
    ],
  },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "Religious Services", href: "/services#religious" },
      { name: "Funeral Services", href: "/services#funeral" },
      { name: "Nikah Services", href: "/services#nikah" },
      { name: "Counselling & Support", href: "/services#counselling" },
    ],
  },
  {
    name: "Visitors",
    href: "/visit",
    children: [
      { name: "Visiting Hours", href: "/visit#hours" },
      { name: "Book a Visit", href: "/visit#book" },
      { name: "Mosque Manners", href: "/visit#manners" },
      { name: "360° Tour", href: "/visit#virtual-tour" },
      { name: "Getting to AIC", href: "/visit#directions" },
      { name: "FAQs", href: "/visit#faq" },
    ],
  },
  {
    name: "Programs",
    href: "/programs",
    children: [
      { name: "Education Programs", href: "/programs#education" },
      { name: "AIC College", href: aicInfo.externalLinks.college, external: true },
      { name: "AIC Salam School", href: "/programs#salam" },
      { name: "IQRA Academy", href: "/programs#iqra" },
      { name: "Al-Noor Institute", href: "/programs#alnoor" },
      { name: "Sports & Youth", href: "/programs#youth" },
      { name: "Newport Storm FC", href: aicInfo.externalLinks.newportStorm, external: true },
      { name: "Boys Youth Nights", href: "/programs#boysynights" },
    ],
  },
  {
    name: "News & Media",
    href: "/media",
    children: [
      { name: "Latest Updates", href: "/media#updates" },
      { name: "Social Media", href: "/media#social" },
      { name: "Podcasts", href: "/media#podcasts" },
      { name: "Gallery", href: "/media#gallery" },
    ],
  },
  { name: "Architecture", href: "/architecture" },
  { name: "Contact", href: "/contact" },
];

// Hook to subscribe to scroll position using useSyncExternalStore
function useIsScrolled(threshold = 50) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("scroll", callback, { passive: true });
    return () => window.removeEventListener("scroll", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return window.scrollY > threshold;
  }, [threshold]);

  const getServerSnapshot = useCallback(() => {
    return false; // Default to not scrolled on server
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function Header() {
  const pathname = usePathname();
  const isScrolled = useIsScrolled(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
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

  const handleLogoClick = () => {
    // If already on home page, scroll to top
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMobileNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setMobileExpandedItem(null);
    // If navigating to home, scroll to top
    if (href === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleMobileExpand = (name: string) => {
    setMobileExpandedItem(mobileExpandedItem === name ? null : name);
  };

  return (
    <>
      {/* Top bar */}
      <div className="hidden lg:block bg-neutral-900 text-white/90 py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-lime-400" />
              <span>Next Prayer: Dhuhr 1:30 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-lime-400" />
              <span>{aicInfo.address.full}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href={`tel:${aicInfo.phone}`} className="flex items-center gap-2 hover:text-lime-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>{aicInfo.phone}</span>
            </a>
            <Link href="/contact" className="hover:text-lime-400 transition-colors">
              Contact
            </Link>
            <Link href="/media#updates" className="hover:text-teal-400 transition-colors">
              Announcements
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-neutral-900/90 backdrop-blur-sm"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" onClick={handleLogoClick} className="flex items-center group relative h-12">
              {/* Logo for dark background (not scrolled) */}
              <Image
                src="/images/aic logo.png"
                alt="Australian Islamic Centre"
                width={120}
                height={48}
                className={cn(
                  "h-12 w-auto object-contain transition-opacity duration-300",
                  isScrolled ? "opacity-0" : "opacity-100"
                )}
              />
              {/* Logo for white background (scrolled) */}
              <Image
                src="/images/aic website logo.svg"
                alt="Australian Islamic Centre"
                width={120}
                height={48}
                className={cn(
                  "h-12 w-auto object-contain absolute left-0 top-0 transition-opacity duration-300",
                  isScrolled ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    onClick={item.href === "/" ? handleLogoClick : undefined}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm",
                      isScrolled
                        ? "text-gray-700 hover:text-neutral-900 hover:bg-neutral-100"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {item.name}
                    {item.children && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        activeDropdown === item.name && "rotate-180"
                      )} />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 py-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          child.external ? (
                            <a
                              key={child.name}
                              href={child.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-4 py-2.5 text-gray-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            >
                              <span className="text-green-600 font-medium">{child.name}</span>
                              <ExternalLink className="w-3 h-3 text-green-500" />
                            </a>
                          ) : (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2.5 text-gray-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            >
                              {child.name}
                            </Link>
                          )
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-200",
                  isScrolled
                    ? "text-gray-600 hover:text-neutral-900 hover:bg-neutral-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Button
                href="/donate"
                variant={isScrolled ? "gold" : "gold"}
                size="sm"
                icon={<Heart className="w-4 h-4" />}
                className="hidden sm:inline-flex"
              >
                Donate
              </Button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className={cn(
                  "xl:hidden p-2.5 rounded-lg transition-all duration-200",
                  isScrolled
                    ? "text-gray-600 hover:text-neutral-900 hover:bg-neutral-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu - Full Screen Redesign */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 bg-neutral-900 z-50 xl:hidden flex flex-col"
            >
              {/* Sticky Header with Close Button */}
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

              {/* Scrollable Navigation */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.children ? (
                        // Item with children - expandable
                        <>
                          <button
                            onClick={() => toggleMobileExpand(item.name)}
                            className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-white hover:bg-white/10 transition-colors"
                          >
                            <span className="text-lg font-semibold">{item.name}</span>
                            <motion.div
                              animate={{ rotate: mobileExpandedItem === item.name ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-5 h-5 text-white/60" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {mobileExpandedItem === item.name && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 pl-4 border-l-2 border-lime-500/30 space-y-1 py-2">
                                  {/* Main page link */}
                                  <Link
                                    href={item.href}
                                    onClick={() => handleMobileNavClick(item.href)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-lime-400 hover:bg-white/10 transition-colors"
                                  >
                                    <span className="font-medium">View All {item.name}</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </Link>
                                  {/* Children links */}
                                  {item.children.map((child) => (
                                    child.external ? (
                                      <a
                                        key={child.name}
                                        href={child.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 rounded-lg text-green-400 hover:bg-white/10 transition-colors"
                                      >
                                        <span>{child.name}</span>
                                        <ExternalLink className="w-4 h-4 text-green-500/60" />
                                      </a>
                                    ) : (
                                      <Link
                                        key={child.name}
                                        href={child.href}
                                        onClick={() => handleMobileNavClick(child.href)}
                                        className="block px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                      >
                                        {child.name}
                                      </Link>
                                    )
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        // Item without children - direct link
                        <Link
                          href={item.href}
                          onClick={() => handleMobileNavClick(item.href)}
                          className="block px-4 py-4 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="sticky bottom-0 bg-neutral-900 border-t border-white/10 px-6 py-6 space-y-4">
                <Button
                  href="/donate"
                  variant="gold"
                  className="w-full py-4 text-lg"
                  icon={<Heart className="w-5 h-5" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Make a Donation
                </Button>

                <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                  <a href={`tel:${aicInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>{aicInfo.phone}</span>
                  </a>
                  <span className="text-white/20">|</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{aicInfo.address.suburb}</span>
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
