"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { StaggerGrid, StaggerGridItem } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { SanityGalleryImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import {
  Camera,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import type { YouTubeVideo } from "@/lib/youtube";

const categories = ["All", "Prayer Hall", "Architecture", "Education", "Events", "Community"];


// Interactive Gallery Image component with hover effects
interface GalleryImageProps {
  image: {
    id: string;
    src: string;
    alt: string;
    category: string;
  };
  onClick: () => void;
}

function GalleryImage({ image, onClick }: GalleryImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="relative cursor-pointer rounded-xl overflow-hidden aspect-square"
    >
      <motion.div
        animate={{ scale: isHovered ? 1.15 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Gradient overlay */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
      />

      {/* Center icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.5,
          rotate: isHovered ? 0 : -90
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <LayoutGrid className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      {/* Category label */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{
          y: isHovered ? 0 : 20,
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-4"
      >
        <p className="text-white text-sm font-medium">{image.category}</p>
        <p className="text-white/70 text-xs mt-1">Click to view</p>
      </motion.div>

      {/* Corner accent */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
      >
        <Camera className="w-4 h-4 text-white" />
      </motion.div>
    </motion.div>
  );
}

interface MediaContentProps {
  galleryImages: SanityGalleryImage[];
  youtubeVideos?: YouTubeVideo[];
}

export default function MediaContent({ galleryImages, youtubeVideos = [] }: MediaContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Convert Sanity images to the format expected by the gallery
  // Filter out any images with missing image data
  const convertedImages = galleryImages
    .filter((img) => img.image)
    .map((img) => ({
      id: img._id,
      src: urlFor(img.image).width(800).height(800).url(),
      alt: img.alt,
      category: img.category || "Uncategorized",
    }));

  const filteredImages = convertedImages.filter((image) => {
    if (selectedCategory === "All") return true;
    return image.category === selectedCategory;
  });

  // Handle body overflow when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToNext = () => {
    setLightboxIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const goToPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-6 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Media <span className="text-teal-600">Gallery</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Explore photos from the Australian Islamic Centre community.
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Videos */}
      {youtubeVideos.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {youtubeVideos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl overflow-hidden bg-neutral-50 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-red-600 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {video.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {filteredImages.length > 0 ? (
            <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <StaggerGridItem key={image.id}>
                  <GalleryImage image={image} onClick={() => openLightbox(index)} />
                </StaggerGridItem>
              ))}
            </StaggerGrid>
          ) : (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {galleryImages.length === 0 ? "No Photos Available" : "No Photos Found"}
              </h3>
              <p className="text-gray-500">
                {galleryImages.length === 0
                  ? "Gallery photos will appear here once added."
                  : "Try selecting a different category."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && filteredImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl max-h-[80vh] w-full mx-6"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filteredImages[lightboxIndex]?.src || ""}
                alt={filteredImages[lightboxIndex]?.alt || ""}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white text-lg">{filteredImages[lightboxIndex]?.alt}</p>
                <p className="text-white/60 text-sm">{filteredImages[lightboxIndex]?.category}</p>
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {filteredImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(index);
                  }}
                  className={`w-16 h-12 rounded overflow-hidden transition-all ${
                    index === lightboxIndex
                      ? "ring-2 ring-white opacity-100"
                      : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
