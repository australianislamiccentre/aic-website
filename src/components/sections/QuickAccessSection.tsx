/**
 * QuickAccessSection
 *
 * Quick-access cards section providing shortcuts to the most common visitor
 * actions -- prayer times, event calendar, programs, directions, and more.
 * Uses expandable category groups with animated reveal and icon-driven links.
 *
 * @module components/sections/QuickAccessSection
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  Users,
  Compass,
  ArrowRight,
  Calendar,
  BookOpen,
  Heart,
  MapPin,
  GraduationCap,
  Mic,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface QuickLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface AccessCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  links: QuickLink[];
}

function buildAccessCards(collegeLink: string): AccessCardData[] {
  return [
    {
      id: "worshippers",
      title: "For Worshippers",
      subtitle: "Prayer & Services",
      icon: <Clock className="w-5 h-5" />,
      accentColor: "text-green-400",
      accentBg: "bg-green-500/20 border-green-500/30",
      links: [
        { name: "Prayer Times", href: "/#prayer-times", icon: <Clock className="w-4 h-4" /> },
        { name: "Friday Jumu'ah", href: "/services#jumuah", icon: <Mic className="w-4 h-4" /> },
        { name: "Religious Services", href: "/services", icon: <Heart className="w-4 h-4" /> },
      ],
    },
    {
      id: "visitors",
      title: "For Visitors",
      subtitle: "Explore Our Centre",
      icon: <Compass className="w-5 h-5" />,
      accentColor: "text-sky-400",
      accentBg: "bg-sky-500/20 border-sky-500/30",
      links: [
        { name: "Plan Your Visit", href: "/visit", icon: <MapPin className="w-4 h-4" /> },
        { name: "Architecture", href: "/architecture", icon: <Compass className="w-4 h-4" /> },
        { name: "Events Calendar", href: "/events", icon: <Calendar className="w-4 h-4" /> },
      ],
    },
    {
      id: "community",
      title: "For Community",
      subtitle: "Programs & Education",
      icon: <Users className="w-5 h-5" />,
      accentColor: "text-lime-400",
      accentBg: "bg-lime-500/20 border-lime-500/30",
      links: [
        { name: "IQRA Academy", href: "/events/iqra-academy", icon: <BookOpen className="w-4 h-4" /> },
        { name: "AIC College", href: collegeLink, icon: <GraduationCap className="w-4 h-4" />, external: true },
        { name: "Youth Programs", href: "/events", icon: <Users className="w-4 h-4" /> },
      ],
    },
  ];
}

function QuickLinkItem({ link }: { link: QuickLink }) {
  const className =
    "flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all duration-200 group/link";

  const content = (
    <>
      <span className="text-lime-400/80 group-hover/link:text-lime-400 transition-colors">{link.icon}</span>
      <span className="text-white/80 group-hover/link:text-white text-sm font-medium flex-1 transition-colors">
        {link.name}
      </span>
      {link.external ? (
        <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover/link:text-white/60 transition-colors" />
      ) : (
        <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover/link:text-white/60 group-hover/link:translate-x-0.5 transition-all" />
      )}
    </>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}

export function QuickAccessSection() {
  const info = useSiteSettings();
  const accessCards = buildAccessCards(info.externalLinks.college);
  const [mobileExpandedCard, setMobileExpandedCard] = useState<string | null>(null);

  const toggleMobileCard = (id: string) => {
    setMobileExpandedCard(mobileExpandedCard === id ? null : id);
  };

  return (
    <section className="relative py-8 md:py-10 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Desktop & Tablet: 3-column grid, always visible */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4">
          {accessCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`rounded-xl p-4 border ${card.accentBg}`}
            >
              {/* Card header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center ${card.accentColor}`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{card.title}</h3>
                  <p className="text-white/50 text-xs">{card.subtitle}</p>
                </div>
              </div>

              {/* Always-visible links */}
              <div className="space-y-1.5">
                {card.links.map((link) => (
                  <QuickLinkItem key={link.name} link={link} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Compact expandable cards */}
        <div className="sm:hidden space-y-2">
          {accessCards.map((card, index) => {
            const isExpanded = mobileExpandedCard === card.id;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className={`rounded-xl border overflow-hidden ${card.accentBg}`}
              >
                {/* Tap header */}
                <button
                  onClick={() => toggleMobileCard(card.id)}
                  className="w-full flex items-center justify-between p-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${card.accentColor}`}>
                      {card.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold text-sm">{card.title}</h3>
                      <p className="text-white/50 text-xs">{card.subtitle}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </motion.div>
                </button>

                {/* Expandable links */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 space-y-1.5">
                        {card.links.map((link) => (
                          <QuickLinkItem key={link.name} link={link} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors group"
          >
            Can&apos;t find what you&apos;re looking for?
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
