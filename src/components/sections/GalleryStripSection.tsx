"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { SanityGalleryImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { Camera, ArrowRight } from "lucide-react";
import { aicImages } from "@/data/content";

interface GalleryStripSectionProps {
  images: SanityGalleryImage[];
}

// Get image URL from Sanity — returns null if image source is invalid
function getSanityImageUrl(image: SanityGalleryImage): string | null {
  try {
    if (!image?.image) return null;
    return urlFor(image.image).width(600).height(400).url();
  } catch {
    return null;
  }
}

// Fallback images when Sanity gallery is empty
const fallbackImages = [
  { src: aicImages.interior.prayerHallBright, alt: "Prayer hall with colorful skylights" },
  { src: aicImages.architecture.roofGolden, alt: "Golden roof lanterns" },
  { src: aicImages.exterior.courtyard, alt: "Exterior courtyard" },
  { src: aicImages.interior.ceilingDetail, alt: "Colorful ceiling lights" },
  { src: aicImages.exterior.night, alt: "Centre at night" },
  { src: aicImages.architecture.roofDusk, alt: "Architecture at dusk" },
];

export function GalleryStripSection({ images }: GalleryStripSectionProps) {
  const hasSanityImages = images.length > 0;
  const displayCount = 6;

  return (
    <section className="py-8 md:py-14 bg-neutral-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70" />
              </div>
              <h2 className="text-base md:text-xl font-semibold text-white">
                Life at AIC
              </h2>
            </div>
            <Link
              href="/media"
              className="text-xs md:text-sm text-white/50 hover:text-white/80 font-medium flex items-center gap-1 md:gap-1.5 transition-colors group"
            >
              Gallery
              <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        {/* Image Strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-3">
          {hasSanityImages
            ? images.slice(0, displayCount).map((image, index) => {
                const imageUrl = getSanityImageUrl(image);
                if (!imageUrl) return null;
                return (
                  <motion.div
                    key={image._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                  >
                    <Link href="/media" className="block group">
                      <div className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden bg-neutral-800">
                        <Image
                          src={imageUrl}
                          alt={image.alt || "AIC Gallery"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        {/* Caption on hover */}
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-xs line-clamp-1">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            : fallbackImages.slice(0, displayCount).map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                >
                  <Link href="/media" className="block group">
                    <div className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden bg-neutral-800">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
