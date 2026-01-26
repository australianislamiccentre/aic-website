"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { SanityTestimonial } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { ChevronLeft, ChevronRight, Quote, MessageSquare } from "lucide-react";
import Image from "next/image";

interface TestimonialsSectionProps {
  testimonials: SanityTestimonial[];
}

function getImageUrl(image: SanityTestimonial["image"]): string {
  if (!image) return "/images/aic 1.jpg";
  return urlFor(image).width(128).height(128).url();
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Don't render if no testimonials
  if (testimonials.length === 0) {
    return null;
  }

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-teal-50 to-neutral-50 rounded-full blur-3xl opacity-40" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-4">
              Community Voices
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">Says</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from the members of our vibrant community about their experiences
              at the Australian Islamic Centre.
            </p>
          </div>
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Large quote icon */}
            <div className="absolute -top-6 -left-6 text-teal-100">
              <Quote className="w-20 h-20" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 relative"
              >
                <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic text-center">
                  &quot;{currentTestimonial.quote}&quot;
                </blockquote>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-neutral-100">
                    <Image
                      src={getImageUrl(currentTestimonial.image)}
                      alt={currentTestimonial.author}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {currentTestimonial.author}
                  </p>
                  {currentTestimonial.role && (
                    <p className="text-neutral-600">
                      {currentTestimonial.role}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation - only show if more than one testimonial */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevTestimonial}
                  className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-teal-600 hover:shadow-lg border border-gray-100 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-6 bg-teal-500"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextTestimonial}
                  className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-teal-600 hover:shadow-lg border border-gray-100 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
