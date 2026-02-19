"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useFormSettings } from "@/contexts/FormSettingsContext";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Footer() {
  const info = useSiteSettings();
  const forms = useFormSettings();

  const footerLinks = {
    explore: [
      { name: "About Us", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Programs", href: "/programs" },
      { name: "Events", href: "/events" },
      { name: "News & Media", href: "/media" },
      { name: "Architecture", href: "/architecture" },
    ],
    worship: [
      { name: "Prayer Times", href: "/#prayer-times" },
      { name: "Friday Jumu'ah", href: "/worshippers#jumuah" },
      { name: "Mosque Etiquette", href: "/worshippers#etiquette" },
      { name: "For Worshippers", href: "/worshippers" },
      { name: "For Visitors", href: "/visit" },
    ],
    getInvolved: [
      { name: "Book a Visit", href: "/visit#book" },
      { name: "Donate", href: "/donate" },
      { name: "Volunteer", href: "/contact" },
      { name: "Contact Us", href: "/contact" },
    ],
    external: [
      { name: "AIC College", href: info.externalLinks.college },
      { name: "AIC Bookstore", href: info.externalLinks.bookstore },
      { name: "Newport Storm FC", href: info.externalLinks.newportStorm },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: info.socialMedia.facebook },
    { name: "Instagram", icon: Instagram, href: info.socialMedia.instagram },
    { name: "Youtube", icon: Youtube, href: info.socialMedia.youtube },
  ];
  const currentYear = new Date().getFullYear();
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subError, setSubError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubStatus("loading");
    setSubError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subName,
          email: subEmail,
          phone: subPhone,
          _gotcha: (document.getElementById("_gotcha_sub") as HTMLInputElement)?.value || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setSubStatus("success");
      setSubName("");
      setSubEmail("");
      setSubPhone("");
    } catch (err) {
      setSubError(err instanceof Error ? err.message : "Something went wrong.");
      setSubStatus("error");
    }
  };

  return (
    <footer className="relative bg-neutral-900 text-white overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L80 40L40 80L0 40z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }} />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {forms.newsletterHeading}
              </h2>
              <p className="text-white/70 text-lg">
                {forms.newsletterDescription}
              </p>
            </div>
            {subStatus === "success" ? (
              <div className="flex items-center gap-3 text-teal-400">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <p className="text-lg">{forms.newsletterSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="text"
                  id="_gotcha_sub"
                  name="_gotcha_sub"
                  autoComplete="off"
                  tabIndex={-1}
                  className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                  aria-hidden="true"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (optional)"
                    value={subPhone}
                    onChange={(e) => setSubPhone(e.target.value)}
                    className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={subStatus === "loading"}
                    icon={subStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  >
                    {subStatus === "loading" ? "Subscribing..." : forms.newsletterButtonText}
                  </Button>
                </div>
                {subStatus === "error" && (
                  <p className="text-red-400 text-sm">{subError}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/aic logo.png"
                alt="Australian Islamic Centre"
                width={150}
                height={60}
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="text-white/70 mb-6 leading-relaxed">
              {info.tagline}. A centre for prayer, education, and community building, welcoming all who seek knowledge and spiritual growth.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/80">
                  {info.address.street}<br />
                  {info.address.suburb}, {info.address.state} {info.address.postcode}<br />
                  {info.address.country}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <a href={`tel:${info.phone}`} className="text-white/80 hover:text-teal-400 transition-colors">
                  {info.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <a href={`mailto:${info.email}?subject=${encodeURIComponent('General Enquiry - Australian Islamic Centre')}`} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-teal-400 transition-colors">
                  {info.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/80">
                  Open Daily<br />
                  From Fajr to Isha
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-8">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-gold-500 hover:text-neutral-900 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-teal-400 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Worship Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Worship</h4>
            <ul className="space-y-3">
              {footerLinks.worship.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-teal-400 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Get Involved</h4>
            <ul className="space-y-3">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-teal-400 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* External Links */}
            <h4 className="font-semibold text-lg mt-8 mb-4">Affiliates</h4>
            <ul className="space-y-3">
              {footerLinks.external.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Donate CTA */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Support Us</h4>
            <div className="p-4 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30">
              <p className="text-sm text-white/80 mb-3">
                Support our community programs, services, and the maintenance of our centre.
              </p>
              <Button href="/donate" variant="gold" size="sm" icon={<Heart className="w-4 h-4" />}>
                Donate Now
              </Button>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/70 text-sm font-arabic text-center leading-relaxed">
                &ldquo;مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ&rdquo;
              </p>
              <p className="text-white/50 text-xs text-center mt-2">Qur&apos;an 2:261</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>&copy; {currentYear} {info.name}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-teal-400 transition-colors">
                Terms of Use
              </Link>
              <Link href="/accessibility" className="hover:text-teal-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
