"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Globe, Users, BookOpen, Landmark } from "lucide-react";
import Image from "next/image";

export function AboutPreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section ref={containerRef} className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-neutral-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 items-center">
          {/* Image Side with floating stat badges */}
          <FadeIn direction="left">
            <div className="relative">
              {/* Main image */}
              <motion.div
                style={{ y: imageY }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="/images/aic 9.jpeg"
                  alt="Australian Islamic Centre aerial view with crescent moon"
                  width={600}
                  height={800}
                  className="w-full h-[340px] sm:h-[380px] md:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-800/40 to-transparent" />
              </motion.div>

              {/* Decorative frame — hidden on small screens */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-teal-500 rounded-tl-3xl hidden md:block" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-teal-500 rounded-br-3xl hidden md:block" />
            </div>

            {/* ── Stats row — detached under the image ── */}
            <div className="grid grid-cols-4 gap-0 mt-3 md:mt-4">
              {[
                { value: "5", label: "Daily Prayers", icon: BookOpen, color: "from-teal-500 to-teal-600", delay: 0.3 },
                { value: "40+", label: "Years Serving", icon: Users, color: "from-green-500 to-green-600", delay: 0.38 },
                { value: "Global", label: "Recognition", icon: Globe, color: "from-amber-500 to-amber-600", delay: 0.46 },
                { value: "20+", label: "Weekly Programs", icon: Landmark, color: "from-teal-600 to-teal-700", delay: 0.54 },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                  className="text-center py-3 md:py-4 border border-gray-100 bg-white"
                >
                  <div className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-1.5 rounded-none bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <p className="text-sm md:text-base font-bold text-gray-900 leading-none">{stat.value}</p>
                  <p className="text-[9px] md:text-xs text-gray-500 leading-tight mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          {/* Content Side */}
          <FadeIn direction="right">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-neutral-100 text-neutral-700 text-xs sm:text-sm font-medium mb-4 md:mb-6">
                About Our Centre
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                A Beacon of Faith,{" "}
                <span className="text-gradient">Knowledge & Unity</span>
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed">
                The Australian Islamic Centre stands as one of Melbourne&apos;s most significant
                Islamic institutions. Our award-winning architecture houses a vibrant
                community dedicated to worship, education, and service.
              </p>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed hidden sm:block">
                From daily prayers to comprehensive educational programs, from community
                events to social services, we serve as a complete Islamic centre for
                Muslims of all ages and backgrounds.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 md:mb-8">
                {[
                  "Award-winning Architecture",
                  "5 Daily Prayers",
                  "Educational Programs",
                  "Community Services",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-500 flex-shrink-0" />
                    <span className="text-gray-700 text-xs sm:text-sm md:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                href="/about"
                variant="primary"
                size="md"
                icon={<ArrowRight className="w-4 h-4 md:w-5 md:h-5" />}
              >
                Learn More About Us
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
