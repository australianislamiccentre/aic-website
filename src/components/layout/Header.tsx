"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/ui/SearchDialog";
import { aicInfo } from "@/data/content";
import { SanitySiteSettings } from "@/types/sanity";
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
  // Category icons
  HandHeart,
  Clock,
  Building2,
  GraduationCap,
  Trophy,
  Newspaper,
  Camera,
} from "lucide-react";

interface HeaderProps {
  siteSettings?: SanitySiteSettings | null;
}

// Navigation structure - simplified like MyCentre
interface NavChild {
  name: string;
  href: string;
  external?: boolean;
}

interface NavCategory {
  title: string;
  icon: React.ReactNode;
  items: NavChild[];
}

interface NavItem {
  name: string;
  href: string;
  categories?: NavCategory[];
  promoImage?: {
    src: string;
    alt: string;
    title: string;
    href: string;
  };
}

// Build navigation with external links
function buildNavigation(externalLinks: { college: string; bookstore: string; newportStorm: string }): NavItem[] {
  return [
    {
      name: "About Us",
      href: "/about",
      categories: [
        {
          title: "About AIC",
          icon: <Building2 className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "Our Story", href: "/about" },
            { name: "Our Imams", href: "/imams" },
            { name: "Architecture", href: "/architecture" },
          ],
        },
        {
          title: "Visit Us",
          icon: <MapPin className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "Plan Your Visit", href: "/visit" },
            { name: "360° Virtual Tour", href: "/visit#virtual-tour" },
            { name: "Getting Here", href: "/visit#directions" },
          ],
        },
      ],
      promoImage: {
        src: "/images/aic 1.jpg",
        alt: "AIC Mosque Interior",
        title: "Discover Our Architecture",
        href: "/architecture",
      },
    },
    {
      name: "Services & Worship",
      href: "/services",
      categories: [
        {
          title: "Prayer & Worship",
          icon: <Clock className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "Prayer Times", href: "/#prayer-times" },
            { name: "Friday Sermons", href: "/worshippers#jumuah" },
            { name: "For Worshippers", href: "/worshippers" },
          ],
        },
        {
          title: "Religious Services",
          icon: <HandHeart className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "Nikah Services", href: "/services/nikah" },
            { name: "Funeral Services", href: "/services/funeral" },
            { name: "Counselling & Support", href: "/services/counselling" },
          ],
        },
      ],
      promoImage: {
        src: "/images/aic 2.jpg",
        alt: "Prayer Hall",
        title: "Join Our Community",
        href: "/worshippers",
      },
    },
    {
      name: "Programs & Education",
      href: "/programs",
      categories: [
        {
          title: "Education",
          icon: <GraduationCap className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "IQRA Academy", href: "/events/iqra-academy" },
            { name: "Al-Noor Institute", href: "/programs#alnoor" },
            { name: "AIC Salam School", href: "/programs#salam" },
            { name: "AIC College", href: externalLinks.college, external: true },
          ],
        },
        {
          title: "Youth & Sports",
          icon: <Trophy className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "Newport Storm FC", href: externalLinks.newportStorm, external: true },
            { name: "Boys Youth Nights", href: "/programs#boysynights" },
            { name: "Events & Activities", href: "/events" },
          ],
        },
      ],
      promoImage: {
        src: "/images/aic 4.jpg",
        alt: "Education Programs",
        title: "Explore Our Programs",
        href: "/programs",
      },
    },
    {
      name: "News & Events",
      href: "/media",
      categories: [
        {
          title: "Stay Updated",
          icon: <Newspaper className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "Announcements", href: "/announcements" },
            { name: "Upcoming Events", href: "/events" },
            { name: "Active Campaigns", href: "/campaigns" },
          ],
        },
        {
          title: "Media",
          icon: <Camera className="w-5 h-5 text-lime-500" />,
          items: [
            { name: "Photo Gallery", href: "/media#gallery" },
            { name: "Videos", href: "/media#videos" },
          ],
        },
      ],
      promoImage: {
        src: "/images/aic 5.jpg",
        alt: "Community Event",
        title: "See What's Happening",
        href: "/events",
      },
    },
    {
      name: "Contact",
      href: "/contact",
    },
  ];
}

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

export function Header({ siteSettings }: HeaderProps) {
  const pathname = usePathname();
  const isScrolled = useIsScrolled(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Use Sanity data if available, fallback to hardcoded values
  const info = {
    address: {
      suburb: siteSettings?.address?.suburb ?? aicInfo.address.suburb,
      state: siteSettings?.address?.state ?? aicInfo.address.state,
    },
    phone: siteSettings?.phone ?? aicInfo.phone,
    externalLinks: {
      college: siteSettings?.externalLinks?.college ?? aicInfo.externalLinks.college,
      bookstore: siteSettings?.externalLinks?.bookstore ?? aicInfo.externalLinks.bookstore,
      newportStorm: siteSettings?.externalLinks?.sportsClub ?? aicInfo.externalLinks.newportStorm,
    },
  };

  const navigation = buildNavigation(info.externalLinks);

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

  // Check if current path matches nav item
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top bar - Desktop */}
      <div className="hidden lg:block bg-neutral-900 text-white/90 py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm">
          {/* Left side - placeholder for announcements */}
          <div className="flex items-center gap-6">
            <span className="text-white/70">Welcome to the Australian Islamic Centre</span>
          </div>
          {/* Right side - contact info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/50" />
              <span className="text-white/70">{info.address.suburb}, {info.address.state}</span>
            </div>
            <a href={`tel:${info.phone}`} className="flex items-center gap-2 hover:text-lime-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>{info.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Top bar - Mobile/Tablet */}
      <div className="lg:hidden bg-neutral-900 text-white py-2 px-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/70">Welcome to AIC</span>
          <a href={`tel:${info.phone}`} className="flex items-center gap-1.5 text-white/70 hover:text-lime-400 transition-colors">
            <Phone className="w-3.5 h-3.5" />
            <span>{info.phone}</span>
          </a>
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
        {/* Nav container - full width for dropdown positioning */}
        <div className="relative">
          <nav className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" onClick={handleLogoClick} className="flex items-center group relative h-10 flex-shrink-0">
                {/* Logo for dark background (not scrolled) */}
                <Image
                  src="/images/aic logo.png"
                  alt="Australian Islamic Centre"
                  width={100}
                  height={40}
                  className={cn(
                    "h-10 w-auto object-contain transition-opacity duration-300",
                    isScrolled ? "opacity-0" : "opacity-100"
                  )}
                />
                {/* Logo for white background (scrolled) */}
                <Image
                  src="/images/aic website logo.svg"
                  alt="Australian Islamic Centre"
                  width={100}
                  height={40}
                  className={cn(
                    "h-10 w-auto object-contain absolute left-0 top-0 transition-opacity duration-300",
                    isScrolled ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>

              {/* Desktop Navigation - with relative container for dropdown */}
              <div
                className="hidden lg:flex items-center h-full relative"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {navigation.map((item) => (
                  <div
                    key={item.name}
                    className="relative h-16 flex items-center"
                    onMouseEnter={() => item.categories && setActiveDropdown(item.name)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1 px-4 h-full font-semibold transition-all duration-200 border-b-2",
                        isScrolled
                          ? cn(
                              "text-gray-700 hover:text-primary-600 border-transparent hover:border-primary-600",
                              isActive(item.href) && "text-primary-600 border-primary-600"
                            )
                          : cn(
                              "text-white/90 hover:text-white border-transparent hover:border-lime-400",
                              isActive(item.href) && "text-lime-400 border-lime-400"
                            )
                      )}
                    >
                      {item.name}
                      {item.categories && (
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          activeDropdown === item.name && "rotate-180"
                        )} />
                      )}
                    </Link>
                  </div>
                ))}

                {/* Dropdown - clean white background */}
                <AnimatePresence>
                  {activeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-xl overflow-hidden z-50"
                    >
                      {navigation.map((item) => {
                        if (item.name !== activeDropdown || !item.categories) return null;

                        return (
                          <div key={item.name} className="flex">
                            {/* Category Columns */}
                            <div className="flex gap-10 p-6 flex-1">
                              {item.categories.map((category) => (
                                <div key={category.title}>
                                  {/* Category Header */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-primary-600">{category.icon}</span>
                                    <h3 className="font-bold text-gray-900">
                                      {category.title}
                                    </h3>
                                  </div>
                                  {/* Category Items */}
                                  <ul className="space-y-1">
                                    {category.items.map((child) => (
                                      <li key={child.name}>
                                        {child.external ? (
                                          <a
                                            href={child.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 py-1.5 text-gray-600 hover:text-primary-600 transition-colors group"
                                          >
                                            <span>{child.name}</span>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </a>
                                        ) : (
                                          <Link
                                            href={child.href}
                                            className="block py-1.5 text-gray-600 hover:text-primary-600 transition-colors"
                                          >
                                            {child.name}
                                          </Link>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>

                            {/* Promo Image Section - full height edge to edge */}
                            {item.promoImage && (
                              <Link href={item.promoImage.href} className="group block relative w-44 flex-shrink-0">
                                <Image
                                  src={item.promoImage.src}
                                  alt={item.promoImage.alt}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <p className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white group-hover:text-lime-300 transition-colors">
                                  {item.promoImage.title}
                                </p>
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions - Search + Donate + Mobile Menu */}
              <div className="flex items-center h-16">
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-200 mx-2",
                    isScrolled
                      ? "text-gray-600 hover:text-neutral-900 hover:bg-neutral-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Donate Button - Full height, lime green color */}
                <Link
                  href="/donate"
                  className="hidden sm:flex items-center gap-2 h-16 px-6 bg-lime-500 hover:bg-lime-600 text-neutral-900 font-semibold transition-all duration-200"
                >
                  <Heart className="w-4 h-4" />
                  <span>Donate</span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className={cn(
                    "lg:hidden p-2.5 rounded-lg transition-all duration-200 ml-2",
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
        </div>
      </header>

      {/* Mobile Menu - Full Screen */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 bg-neutral-900 z-50 lg:hidden flex flex-col"
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
                      {item.categories ? (
                        // Item with categories - expandable
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
                                <div className="ml-4 pl-4 border-l-2 border-lime-500/30 space-y-4 py-2">
                                  {item.categories.map((category) => (
                                    <div key={category.title}>
                                      {/* Category Header */}
                                      <div className="flex items-center gap-2 mb-2 px-2">
                                        {category.icon}
                                        <span className="text-sm font-bold text-white/70 uppercase tracking-wide">
                                          {category.title}
                                        </span>
                                      </div>
                                      {/* Category Items */}
                                      <div className="space-y-1">
                                        {category.items.map((child) => (
                                          child.external ? (
                                            <a
                                              key={child.name}
                                              href={child.href}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={() => setMobileMenuOpen(false)}
                                              className="flex items-center justify-between px-4 py-3 rounded-lg text-lime-400 hover:bg-white/10 transition-colors"
                                            >
                                              <span>{child.name}</span>
                                              <ExternalLink className="w-4 h-4 text-lime-500/60" />
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
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        // Item without categories - direct link
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
                <Link
                  href="/donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  <Heart className="w-5 h-5" />
                  <span>Make a Donation</span>
                </Link>

                <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                  <a href={`tel:${info.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
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
