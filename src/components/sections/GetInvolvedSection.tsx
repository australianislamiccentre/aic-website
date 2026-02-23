/**
 * GetInvolvedSection
 *
 * "Get Involved" section on the homepage presenting action cards for visiting,
 * volunteering, donating, and contacting the centre. Each card links to the
 * relevant page with an icon and short description.
 *
 * @module components/sections/GetInvolvedSection
 */
"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import Link from "next/link";
import {
  MapPin,
  HandHeart,
  Heart,
  Phone,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    title: "Visit Us",
    description: "Explore our award-winning centre and join us for prayer",
    icon: MapPin,
    href: "/visit",
    color: "from-teal-500 to-teal-600",
    hoverBorder: "hover:border-teal-400/50",
  },
  {
    title: "Volunteer",
    description: "Give your time and skills to help our community thrive",
    icon: HandHeart,
    href: "/contact?subject=volunteer",
    color: "from-green-500 to-green-600",
    hoverBorder: "hover:border-green-400/50",
  },
  {
    title: "Donate",
    description: "Support our programs, services, and centre upkeep",
    icon: Heart,
    href: "/donate",
    color: "from-lime-500 to-lime-600",
    hoverBorder: "hover:border-lime-400/50",
  },
  {
    title: "Contact",
    description: "Reach out with questions, feedback, or to learn more",
    icon: Phone,
    href: "/contact",
    color: "from-sky-500 to-sky-600",
    hoverBorder: "hover:border-sky-400/50",
  },
];

export function GetInvolvedSection() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Get{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
                Involved
              </span>
            </h2>
            <p className="text-white/50 text-sm md:text-base max-w-md mx-auto">
              There are many ways to be part of the AIC community
            </p>
          </div>
        </FadeIn>

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Link href={action.href} className="block group h-full">
                <div
                  className={`h-full p-4 md:p-5 rounded-xl bg-white/5 border border-white/10 ${action.hoverBorder} hover:bg-white/[0.08] transition-all duration-300 text-center`}
                >
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>

                  <h3 className="text-white font-semibold text-sm md:text-base mb-1">
                    {action.title}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed hidden md:block">
                    {action.description}
                  </p>

                  <div className="mt-2 md:mt-3 flex items-center justify-center gap-1 text-white/30 group-hover:text-white/60 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
