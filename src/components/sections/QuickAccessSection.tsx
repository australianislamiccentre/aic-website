"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  Play,
  Mic,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { aicImages } from "@/data/content";
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
  description: string;
  image: string;
  icon: React.ReactNode;
  accentColor: string;
  links: QuickLink[];
}

function buildAccessCards(collegeLink: string): AccessCardData[] {
  return [
    {
      id: "worshippers",
      title: "For Worshippers",
      subtitle: "Prayer & Spiritual Services",
      description: "Access daily prayers, Friday sermons, and spiritual guidance",
      image: aicImages.interior.prayerHallBright,
      icon: <Clock className="w-6 h-6 md:w-8 md:h-8" />,
      accentColor: "from-green-500 to-green-600",
      links: [
        { name: "Prayer Times", href: "/#prayer-times", icon: <Clock className="w-4 h-4" /> },
        { name: "Friday Jumu'ah", href: "/services#jumuah", icon: <Mic className="w-4 h-4" /> },
        { name: "Events Calendar", href: "/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Religious Services", href: "/services", icon: <Heart className="w-4 h-4" /> },
      ],
    },
    {
      id: "visitors",
      title: "For Visitors",
      subtitle: "Explore Our Iconic Centre",
      description: "Discover the award-winning architecture and book a guided tour",
      image: aicImages.exterior.aerial,
      icon: <Compass className="w-6 h-6 md:w-8 md:h-8" />,
      accentColor: "from-primary-600 to-primary-700",
      links: [
        { name: "Book a Visit", href: "/visit#book", icon: <Calendar className="w-4 h-4" /> },
        { name: "Architecture Tour", href: "/architecture", icon: <Compass className="w-4 h-4" /> },
        { name: "360° Virtual Tour", href: "/visit#virtual-tour", icon: <Play className="w-4 h-4" /> },
        { name: "Getting Here", href: "/visit#directions", icon: <MapPin className="w-4 h-4" /> },
      ],
    },
    {
      id: "community",
      title: "For Community",
      subtitle: "Programs & Education",
      description: "Join our educational programs, youth activities, and community events",
      image: aicImages.exterior.courtyard,
      icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
      accentColor: "from-lime-500 to-lime-600",
      links: [
        { name: "Latest Updates", href: "/media#updates", icon: <BookOpen className="w-4 h-4" /> },
        { name: "IQRA Academy", href: "/programs#iqra", icon: <BookOpen className="w-4 h-4" /> },
        { name: "AIC College", href: collegeLink, icon: <GraduationCap className="w-4 h-4" />, external: true },
        { name: "Youth Programs", href: "/programs#youth", icon: <Users className="w-4 h-4" /> },
      ],
    },
  ];
}

// Mobile Card - tap to expand
function MobileAccessCard({
  card,
  isExpanded,
  onToggle,
  index,
}: {
  card: AccessCardData;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="rounded-2xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full relative h-[200px] overflow-hidden"
      >
        {/* Background Image */}
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${card.accentColor} opacity-60 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-left">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white mb-3">
                {card.icon}
              </div>
              <p className="text-lime-300 text-xs font-medium mb-1 tracking-wide uppercase">
                {card.subtitle}
              </p>
              <h3 className="text-xl font-bold text-white">
                {card.title}
              </h3>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor}`} />
      </button>

      {/* Expandable Links */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-neutral-800"
          >
            <div className="p-4 space-y-2">
              <p className="text-white/70 text-sm mb-3">{card.description}</p>
              {card.links.map((link) => (
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <span className="text-lime-400">{link.icon}</span>
                    <span className="text-white font-medium flex-1">{link.name}</span>
                    <ExternalLink className="w-4 h-4 text-white/50" />
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <span className="text-lime-400">{link.icon}</span>
                    <span className="text-white font-medium flex-1">{link.name}</span>
                    <ArrowRight className="w-4 h-4 text-white/50" />
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Desktop Card - hover to expand
function DesktopAccessCard({
  card,
  isExpanded,
  onHover,
  index,
}: {
  card: AccessCardData;
  isExpanded: boolean;
  onHover: (id: string | null) => void;
  index: number;
}) {
  return (
    <motion.div
      onMouseEnter={() => onHover(card.id)}
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      className={`relative h-[500px] lg:h-[550px] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 ${
        isExpanded ? "flex-[2]" : "flex-1"
      }`}
    >
      {/* Background Image */}
      <motion.div
        animate={{ scale: isExpanded ? 1.08 : 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0"
      >
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        animate={{ opacity: isExpanded ? 0.75 : 0.5 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`absolute inset-0 bg-gradient-to-t ${card.accentColor} mix-blend-multiply`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
        {/* Icon */}
        <motion.div
          animate={{
            scale: isExpanded ? 1.1 : 1,
            y: isExpanded ? -10 : 0,
          }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white mb-4"
        >
          {card.icon}
        </motion.div>

        {/* Title Section */}
        <motion.div
          animate={{ y: isExpanded ? -10 : 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.p
            animate={{ opacity: isExpanded ? 1 : 0.8 }}
            transition={{ duration: 0.5 }}
            className="text-lime-300 text-sm font-medium mb-1 tracking-wide uppercase"
          >
            {card.subtitle}
          </motion.p>
          <motion.h3
            className="text-2xl lg:text-3xl font-bold text-white mb-2"
            animate={{ scale: isExpanded ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformOrigin: "left" }}
          >
            {card.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isExpanded ? 1 : 0,
              height: isExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-white/80 text-sm mb-4 overflow-hidden"
          >
            {card.description}
          </motion.p>
        </motion.div>

        {/* Quick Links - Revealed on Hover */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-2"
            >
              {card.links.map((link, linkIndex) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ delay: 0.15 + linkIndex * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 group/link"
                    >
                      <span className="text-lime-400">{link.icon}</span>
                      <span className="text-white font-medium flex-1">{link.name}</span>
                      <ExternalLink className="w-4 h-4 text-white/50 group-hover/link:text-white transition-colors" />
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 group/link"
                    >
                      <span className="text-lime-400">{link.icon}</span>
                      <span className="text-white font-medium flex-1">{link.name}</span>
                      <ArrowRight className="w-4 h-4 text-white/50 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed State - "View More" hint */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-2 text-white/60 text-sm mt-4"
            >
              <span>Hover to explore</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top accent line */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformOrigin: "left" }}
      />

      {/* Decorative corner element */}
      <motion.div
        className="absolute top-4 right-4 w-12 h-12"
        animate={{
          opacity: isExpanded ? 1 : 0.3,
          scale: isExpanded ? 1.2 : 1,
          rotate: isExpanded ? 45 : 0,
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="absolute inset-0 border-t-2 border-r-2 border-white/30 rounded-tr-xl" />
      </motion.div>
    </motion.div>
  );
}

export function QuickAccessSection() {
  const info = useSiteSettings();
  const accessCards = buildAccessCards(info.externalLinks.college);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [mobileExpandedCard, setMobileExpandedCard] = useState<string | null>(null);

  const toggleMobileCard = (id: string) => {
    setMobileExpandedCard(mobileExpandedCard === id ? null : id);
  };

  return (
    <section className="relative py-12 md:py-16 lg:py-20 bg-neutral-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Animated gradient orbs - hidden on mobile for performance */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl hidden md:block"
      />
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl hidden md:block"
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-green-500 to-lime-400 mx-auto mb-4 md:mb-6 rounded-full"
          />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            How Can We{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
              Serve You?
            </span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base px-4">
            Whether you&apos;re joining us for prayer, visiting our iconic architecture,
            or engaging with our community programs, we&apos;re here to welcome you.
          </p>
        </motion.div>

        {/* Mobile/Tablet Cards - Stacked with tap to expand */}
        <div className="lg:hidden space-y-4">
          {accessCards.map((card, index) => (
            <MobileAccessCard
              key={card.id}
              card={card}
              isExpanded={mobileExpandedCard === card.id}
              onToggle={() => toggleMobileCard(card.id)}
              index={index}
            />
          ))}
        </div>

        {/* Desktop Cards - Horizontal with hover to expand (1024px and up) */}
        <div className="hidden lg:flex gap-6">
          {accessCards.map((card, index) => (
            <DesktopAccessCard
              key={card.id}
              card={card}
              isExpanded={expandedCard === card.id}
              onHover={setExpandedCard}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-8 md:mt-12"
        >
          <p className="text-white/50 text-sm mb-3 md:mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300 font-medium transition-colors group"
          >
            Contact our team
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
