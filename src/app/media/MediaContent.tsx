"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FadeIn, StaggerGrid, StaggerGridItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { aicInfo } from "@/data/content";
import { SanityGalleryImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import {
  Camera,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ImageIcon,
  Video,
  Podcast,
  Youtube,
} from "lucide-react";

const categories = ["All", "Prayer Hall", "Architecture", "Education", "Events", "Community"];

const videos = [
  {
    id: "1",
    title: "A Tour of the Australian Islamic Centre",
    thumbnail: "/images/aic 1.jpg",
    duration: "5:32",
    category: "Tour",
  },
  {
    id: "2",
    title: "Ramadan Highlights",
    thumbnail: "/images/aic 8.jpg",
    duration: "8:15",
    category: "Events",
  },
  {
    id: "3",
    title: "Youth Leadership Program Graduation",
    thumbnail: "/images/aic end.jpg",
    duration: "12:45",
    category: "Education",
  },
  {
    id: "4",
    title: "Friday Khutbah: The Importance of Community",
    thumbnail: "/images/aic start.jpg",
    duration: "28:30",
    category: "Khutbah",
  },
];

const podcasts = [
  {
    id: "1",
    title: "Understanding the Quran - Surah Al-Baqarah",
    description: "A deep dive into the meanings and lessons from Surah Al-Baqarah",
    duration: "45 min",
    date: "Latest Episode",
  },
  {
    id: "2",
    title: "Living Islam in Australia",
    description: "Balancing faith and modern life in a multicultural society",
    duration: "38 min",
    date: "Recent",
  },
  {
    id: "3",
    title: "Parenting in the Digital Age",
    description: "Islamic guidance for modern parents navigating technology",
    duration: "52 min",
    date: "Popular",
  },
];

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
}

export default function MediaContent({ galleryImages }: MediaContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTab, setSelectedTab] = useState<"photos" | "videos" | "podcasts">("photos");
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
              Explore photos, videos, and podcasts from the Australian Islamic Centre community.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: "photos", label: "Gallery", icon: ImageIcon },
              { id: "videos", label: "Videos", icon: Video },
              { id: "podcasts", label: "Podcasts", icon: Podcast },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  selectedTab === tab.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {/* Photos Gallery */}
        {selectedTab === "photos" && (
          <motion.section
            key="photos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 bg-neutral-50"
          >
            <div className="max-w-7xl mx-auto px-6">
              {/* Category Filter */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
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
          </motion.section>
        )}

        {/* Videos */}
        {selectedTab === "videos" && (
          <motion.section
            key="videos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 bg-neutral-50"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-8">
                {videos.map((video, index) => (
                  <FadeIn key={video.id} delay={index * 0.1}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer"
                          >
                            <Play className="w-8 h-8 text-green-600 ml-1" />
                          </motion.div>
                        </div>
                        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 rounded text-white text-sm">
                          {video.duration}
                        </div>
                        <div className="absolute top-4 left-4 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                          {video.category}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-neutral-700 transition-colors">
                          {video.title}
                        </h3>
                      </div>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.4}>
                <div className="text-center mt-12">
                  <Button
                    href={aicInfo.socialMedia.youtube}
                    target="_blank"
                    variant="outline"
                    icon={<Youtube className="w-5 h-5" />}
                  >
                    View All Videos on YouTube
                  </Button>
                </div>
              </FadeIn>
            </div>
          </motion.section>
        )}

        {/* Podcasts */}
        {selectedTab === "podcasts" && (
          <motion.section
            key="podcasts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 bg-neutral-50"
          >
            <div className="max-w-3xl mx-auto px-6">
              <FadeIn>
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Islamic Podcasts</h2>
                  <p className="text-gray-600">
                    Listen to lectures, discussions, and educational content from our scholars.
                  </p>
                </div>
              </FadeIn>

              <div className="space-y-4">
                {podcasts.map((podcast, index) => (
                  <FadeIn key={podcast.id} delay={index * 0.1}>
                    <motion.div
                      whileHover={{ x: 8 }}
                      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <Podcast className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{podcast.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{podcast.description}</p>
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <span>{podcast.duration}</span>
                          <span>•</span>
                          <span>{podcast.date}</span>
                        </div>
                      </div>
                      <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors flex-shrink-0 self-end sm:self-center">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                      </button>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.4}>
                <div className="text-center mt-12">
                  <p className="text-gray-600 mb-4">
                    Subscribe to our podcast on your favorite platform
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      href="#"
                      variant="outline"
                      icon={<Podcast className="w-5 h-5" />}
                    >
                      Apple Podcasts
                    </Button>
                    <Button
                      href="#"
                      variant="outline"
                      icon={<Podcast className="w-5 h-5" />}
                    >
                      Spotify
                    </Button>
                  </div>
                </div>
              </FadeIn>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

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
