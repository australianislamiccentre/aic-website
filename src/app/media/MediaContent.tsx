/**
 * Media Content
 *
 * Client component providing an embedded YouTube video player with
 * thumbnail strip navigation, and a CSS-columns masonry photo gallery
 * with lightbox viewer and keyboard navigation.
 *
 * @module app/media/MediaContent
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import type { MediaGalleryImage } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import {
  Camera,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import type { YouTubeVideo, YouTubeLiveStream } from "@/lib/youtube";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

/** Format an ISO date string to a human-readable Australian date. */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface MediaContentProps {
  mediaGalleryImages: MediaGalleryImage[];
  youtubeVideos?: YouTubeVideo[];
  liveStream?: YouTubeLiveStream;
}

export default function MediaContent({
  mediaGalleryImages,
  youtubeVideos = [],
  liveStream,
}: MediaContentProps) {
  const [featuredVideoIndex, setFeaturedVideoIndex] = useState(0);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { socialMedia } = useSiteSettings();

  // Convert Sanity images — show ALL, no category filtering
  const allImages = mediaGalleryImages
    .filter((img) => img.image)
    .map((img, index) => ({
      id: `media-${index}`,
      src: urlFor(img.image).width(600).url(),
      lightboxSrc: urlFor(img.image).width(1200).url(),
      alt: img.alt,
      caption: img.caption || "",
    }));

  const featuredVideo = youtubeVideos[featuredVideoIndex];
  const isLive = !!(liveStream?.isLive && liveStream.videoId);
  const effectiveVideoId = isLive ? liveStream!.videoId! : featuredVideo?.id;
  const effectiveTitle = isLive
    ? liveStream!.title || "Live Stream"
    : featuredVideo?.title;
  const effectiveUrl = isLive ? liveStream!.url : featuredVideo?.url;
  const visibleVideos = showAllVideos
    ? youtubeVideos
    : youtubeVideos.slice(0, 4);

  // Lock body scroll when lightbox is open
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

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goToPrev = useCallback(() => {
    setLightboxIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  }, [allImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrev();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToNext, goToPrev]);

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
              Explore photos and videos from the Australian Islamic Centre
              community.
            </p>
          </div>
        </div>
      </section>

      {/* ── Video Section ── */}
      {youtubeVideos.length > 0 && featuredVideo && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            {/* Featured Player */}
            <FadeIn>
              <div className="sm:max-w-[900px] sm:mx-auto">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-lg">
                  {isLive && (
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  )}
                  <iframe
                    src={`https://www.youtube.com/embed/${effectiveVideoId}`}
                    title={effectiveTitle || ""}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Video Info */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                      {effectiveTitle}
                    </h3>
                    {!isLive && featuredVideo && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(featuredVideo.publishedAt)}
                      </p>
                    )}
                  </div>
                  {effectiveUrl && (
                    <a
                      href={effectiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#01476b] hover:text-[#01476b]/80 transition-colors shrink-0"
                    >
                      View on YouTube
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Video Grid */}
            {youtubeVideos.length > 1 && (
              <div className="mt-8">
                <FadeIn>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Latest Videos
                  </h2>
                </FadeIn>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleVideos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() =>
                        setFeaturedVideoIndex(
                          youtubeVideos.findIndex((v) => v.id === video.id),
                        )
                      }
                      className={`group text-left rounded-lg overflow-hidden transition-all ${
                        youtubeVideos[featuredVideoIndex]?.id === video.id
                          ? "bg-[#01476b]/5"
                          : "hover:shadow-md"
                      }`}
                      aria-label={`Play ${video.title}`}
                    >
                      <div className="relative aspect-video rounded-md overflow-hidden">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {youtubeVideos[featuredVideoIndex]?.id === video.id ? (
                          <div className="absolute inset-0 bg-[#01476b]/40 flex items-center justify-center">
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-md">
                              <span className="w-2 h-2 rounded-full bg-[#01476b] animate-pulse" />
                              <span className="text-xs font-semibold text-[#01476b]">
                                Now Playing
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-red-600 ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 pb-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(video.publishedAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Show More / Channel Link */}
                <div className="flex items-center justify-center gap-4 pt-6">
                  {!showAllVideos && youtubeVideos.length > 4 && (
                    <button
                      onClick={() => setShowAllVideos(true)}
                      className="text-sm font-medium text-[#01476b] hover:text-[#01476b]/80 transition-colors"
                    >
                      Show More
                    </button>
                  )}
                  {showAllVideos && (
                    <a
                      href={socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#01476b] hover:text-[#01476b]/80 transition-colors"
                    >
                      View all videos on YouTube
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Social Links ── */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="text-sm font-medium text-gray-600">Follow Us</span>
          <div className="flex items-center gap-4">
            {socialMedia.facebook && (
              <a
                href={socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#01476b] hover:text-white transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {socialMedia.instagram && (
              <a
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#01476b] hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {socialMedia.youtube && (
              <a
                href={socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#01476b] hover:text-white transition-colors"
                aria-label="Follow us on YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Photo Gallery — Masonry ── */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Photos</h2>
          </FadeIn>

          {allImages.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {allImages.map((image, index) => (
                <div key={image.id} className="mb-4 break-inside-avoid">
                  <button
                    onClick={() => openLightbox(index)}
                    className="relative w-full rounded-xl overflow-hidden group cursor-pointer block text-left"
                    aria-label={`View ${image.alt}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={600}
                      height={400}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="w-full h-auto"
                    />

                    {/* Hover overlay with caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white text-sm leading-snug">
                        {image.caption || image.alt}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Photos Available
              </h3>
              <p className="text-gray-500">
                Gallery photos will appear here once added.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && allImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
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
                src={allImages[lightboxIndex]?.lightboxSrc || ""}
                alt={allImages[lightboxIndex]?.alt || ""}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white text-lg">
                  {allImages[lightboxIndex]?.alt}
                </p>
                {allImages[lightboxIndex]?.caption && (
                  <p className="text-white/70 text-sm mt-1">
                    {allImages[lightboxIndex].caption}
                  </p>
                )}

              </div>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
