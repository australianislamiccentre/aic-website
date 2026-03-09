/**
 * Media Content
 *
 * Client component providing an embedded YouTube video player with
 * tabbed navigation (Latest Videos, Playlists, Friday Khutbas),
 * autoplay on click, scroll-to-player behaviour, live stream polling,
 * and a photo gallery with lightbox viewer and keyboard navigation.
 *
 * @module app/media/MediaContent
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";
import type {
  YouTubeVideo,
  YouTubeLiveStream,
  YouTubePlaylist,
} from "@/lib/youtube";
import { ALLOWED_PLAYLIST_IDS } from "@/lib/youtube";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

/** Format an ISO date string to a human-readable Australian date (Melbourne time). */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  });
}

/** Reusable video card used across Latest Videos, Playlists, and Khutbas tabs. */
function VideoCard({
  video,
  isActive,
  isLive,
  onPlay,
}: {
  video: YouTubeVideo;
  isActive: boolean;
  isLive?: boolean;
  onPlay: () => void;
}) {
  return (
    <button
      onClick={onPlay}
      className={`group text-left rounded-lg overflow-hidden transition-all ${
        isActive ? "bg-white/5" : "hover:bg-white/5"
      }`}
      aria-label={`Play ${video.title}`}
    >
      <div className="relative aspect-video rounded-md overflow-hidden bg-white/10">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <Play className="w-10 h-10" />
          </div>
        )}
        {isLive && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
        {isActive ? (
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
      <div className="px-2 pt-2.5 pb-2">
        <h4 className="text-sm font-medium text-white line-clamp-2 leading-snug h-[2.5rem]">
          {video.title}
        </h4>
        <p className="text-xs text-gray-400 mt-1">
          {formatDate(video.publishedAt)}
        </p>
      </div>
    </button>
  );
}

/** Maximum number of videos shown per tab/playlist. */
const MAX_VIDEOS = 12;

/** Videos grid with expand-to-12 for playlist accordions. */
function PlaylistVideosGrid({
  videos,
  currentVideoId,
  onPlay,
  playlistId,
}: {
  videos: YouTubeVideo[];
  currentVideoId?: string;
  onPlay: (video: YouTubeVideo) => void;
  playlistId: string;
}) {
  const visible = videos.slice(0, MAX_VIDEOS);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
        {visible.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isActive={currentVideoId === video.id}
            onPlay={() => onPlay(video)}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-3 pt-4">
        {videos.length > 0 && (
          <a
            href={`https://www.youtube.com/playlist?list=${playlistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            View full playlist on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </>
  );
}

interface MediaContentProps {
  mediaGalleryImages: MediaGalleryImage[];
  youtubeVideos?: YouTubeVideo[];
  liveStream?: YouTubeLiveStream;
  playlists?: YouTubePlaylist[];
}

export default function MediaContent({
  mediaGalleryImages,
  youtubeVideos = [],
  liveStream,
  playlists = [],
}: MediaContentProps) {
  // Video state
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(
    youtubeVideos[0] || null,
  );
  const [autoplay, setAutoplay] = useState(false);
  const [liveStreamState, setLiveStreamState] = useState(liveStream);
  const [activeTab, setActiveTab] = useState<
    "latest" | "playlists" | "khutbas"
  >("latest");

  // Playlist state
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(
    null,
  );
  const [playlistVideosCache, setPlaylistVideosCache] = useState<
    Record<string, YouTubeVideo[]>
  >({});
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(
    null,
  );

  // Khutba (streams) state
  const [khutbaVideos, setKhutbaVideos] = useState<YouTubeVideo[]>([]);
  const [khutbaLoading, setKhutbaLoading] = useState(false);
  const [khutbaLoaded, setKhutbaLoaded] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const playerRef = useRef<HTMLDivElement>(null);
  const playlistRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { socialMedia } = useSiteSettings();

  // Derive live status from polled state
  const isLive = !!(liveStreamState?.isLive && liveStreamState.videoId);

  // Convert Sanity images — show ALL, no category filtering
  const allImages = mediaGalleryImages
    .filter((img) => img.asset)
    .map((img, index) => ({
      id: img._key || `media-${index}`,
      src: urlFor(img).width(600).url(),
      lightboxSrc: urlFor(img).width(1200).url(),
      alt: img.alt || "Gallery image",
      caption: img.caption || "",
    }));

  const visibleVideos = youtubeVideos.slice(0, MAX_VIDEOS);

  // Filter playlists to allowed IDs
  const filteredPlaylists = playlists.filter((p) =>
    ALLOWED_PLAYLIST_IDS.includes(p.id),
  );

  // Live stream status is provided by the server on initial load.
  // The LiveBanner component (in root layout) handles ongoing polling
  // every 5 minutes — no need for duplicate polling here.

  // ── Video play handler — scroll to player and autoplay ──
  const handlePlayVideo = useCallback((video: YouTubeVideo) => {
    setCurrentVideo(video);
    setAutoplay(true);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // ── Playlist accordion toggle ──
  const togglePlaylist = useCallback(
    async (playlistId: string) => {
      if (expandedPlaylistId === playlistId) {
        setExpandedPlaylistId(null);
        return;
      }
      setExpandedPlaylistId(playlistId);

      if (!playlistVideosCache[playlistId]) {
        setLoadingPlaylistId(playlistId);
        try {
          const res = await fetch(`/api/youtube/playlists/${playlistId}`);
          if (res.ok) {
            const videos = await res.json();
            setPlaylistVideosCache((prev) => ({
              ...prev,
              [playlistId]: videos,
            }));
          }
        } catch {
          // Silently fail
        } finally {
          setLoadingPlaylistId(null);
        }
      }
    },
    [expandedPlaylistId, playlistVideosCache],
  );

  // ── Load khutba streams when tab is selected ──
  const loadKhutbaVideos = useCallback(async () => {
    if (khutbaLoaded) return;
    setKhutbaLoading(true);
    try {
      const res = await fetch("/api/youtube/streams");
      if (res.ok) {
        const videos = await res.json();
        setKhutbaVideos(videos);
      }
    } catch {
      // Silently fail
    } finally {
      setKhutbaLoading(false);
      setKhutbaLoaded(true);
    }
  }, [khutbaLoaded]);

  // Load khutba videos when khutbas tab becomes active
  useEffect(() => {
    if (activeTab === "khutbas") {
      loadKhutbaVideos();
    }
  }, [activeTab, loadKhutbaVideos]);

  // ── Lightbox handlers ──
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
      {(youtubeVideos.length > 0 || isLive) && (
        <section className="py-12 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            {/* Featured Player */}
            {currentVideo && (
              <FadeIn>
                <div ref={playerRef} className="sm:max-w-[900px] sm:mx-auto">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideo.id}${autoplay ? "?autoplay=1" : ""}`}
                      title={currentVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  {/* Video Info */}
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white leading-snug">
                        {currentVideo.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(currentVideo.publishedAt)}
                      </p>
                    </div>
                    {currentVideo.url && (
                      <a
                        href={currentVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors shrink-0"
                      >
                        View on YouTube
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Tab Bar */}
            <div className="mt-8 border-b border-white/10">
              <nav className="flex gap-1" aria-label="Media tabs">
                {(["latest", "playlists", "khutbas"] as const).map((tab) => {
                  const labels = {
                    latest: "Latest",
                    playlists: "Playlists",
                    khutbas: "Streams",
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab
                          ? "text-white"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                      aria-selected={activeTab === tab}
                      role="tab"
                    >
                      {labels[tab]}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ── Tab Content: Latest Videos ── */}
            {activeTab === "latest" && (
              <div className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Live stream card — always first when live */}
                  {isLive && liveStreamState?.videoId && (
                    <VideoCard
                      video={{
                        id: liveStreamState.videoId,
                        title: liveStreamState.title || "Live Stream",
                        thumbnail: `https://img.youtube.com/vi/${liveStreamState.videoId}/hqdefault.jpg`,
                        publishedAt: new Date().toISOString(),
                        url:
                          liveStreamState.url ||
                          `https://www.youtube.com/watch?v=${liveStreamState.videoId}`,
                      }}
                      isActive={
                        currentVideo?.id === liveStreamState.videoId
                      }
                      isLive
                      onPlay={() =>
                        handlePlayVideo({
                          id: liveStreamState.videoId!,
                          title:
                            liveStreamState.title || "Live Stream",
                          thumbnail: `https://img.youtube.com/vi/${liveStreamState.videoId}/hqdefault.jpg`,
                          publishedAt: new Date().toISOString(),
                          url:
                            liveStreamState.url ||
                            `https://www.youtube.com/watch?v=${liveStreamState.videoId}`,
                        })
                      }
                    />
                  )}

                  {visibleVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      isActive={currentVideo?.id === video.id}
                      onPlay={() => handlePlayVideo(video)}
                    />
                  ))}
                </div>

                {/* View All */}
                <div className="flex flex-col items-center gap-3 pt-6">
                  {socialMedia.youtube && (
                    <a
                      href={`${socialMedia.youtube}/videos`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      View all videos on YouTube
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab Content: Playlists ── */}
            {activeTab === "playlists" && (
              <div className="mt-6 space-y-3">
                {filteredPlaylists.length > 0 ? (
                  filteredPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      ref={(el) => {
                        playlistRefs.current[playlist.id] = el;
                      }}
                      className="border border-white/10 rounded-lg"
                    >
                      <button
                        onClick={() => togglePlaylist(playlist.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {playlist.thumbnail ? (
                            <Image
                              src={playlist.thumbnail}
                              alt={playlist.title}
                              width={80}
                              height={45}
                              className="rounded"
                            />
                          ) : (
                            <div className="w-[80px] h-[45px] rounded bg-white/10 flex items-center justify-center text-gray-400">
                              <Play className="w-5 h-5" />
                            </div>
                          )}
                          <div className="text-left">
                            <h3 className="font-medium text-white">
                              {playlist.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {playlist.videoCount} videos
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedPlaylistId === playlist.id
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                      {/* CSS grid-rows transition: 0fr ↔ 1fr for smooth accordion without layout thrash */}
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                          expandedPlaylistId === playlist.id
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden min-h-0">
                          {(expandedPlaylistId === playlist.id ||
                            playlistVideosCache[playlist.id]) && (
                            <div className="p-4 pt-0 border-t border-white/10">
                              {loadingPlaylistId === playlist.id ? (
                                <p className="text-sm text-gray-400 py-4 text-center">
                                  Loading videos...
                                </p>
                              ) : (
                                <PlaylistVideosGrid
                                  videos={
                                    playlistVideosCache[playlist.id] || []
                                  }
                                  currentVideoId={currentVideo?.id}
                                  onPlay={handlePlayVideo}
                                  playlistId={playlist.id}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Youtube className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400">No playlists available.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab Content: Friday Khutbas ── */}
            {activeTab === "khutbas" && (
              <div className="mt-6">
                {khutbaLoading ? (
                  <p className="text-sm text-gray-400 py-8 text-center">
                    Loading khutbas...
                  </p>
                ) : khutbaVideos.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {khutbaVideos
                        .slice(0, MAX_VIDEOS)
                        .map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            isActive={currentVideo?.id === video.id}
                            onPlay={() => handlePlayVideo(video)}
                          />
                        ))}
                    </div>
                    <div className="flex flex-col items-center gap-3 pt-6">
                      {socialMedia.youtube && (
                        <a
                          href={`${socialMedia.youtube}/streams`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          View all streams on YouTube
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Youtube className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400">
                      No khutba streams available.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Photo Gallery — Album Preview ── */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Photos</h2>
          </FadeIn>

          {allImages.length > 0 ? (
            <FadeIn>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Main/Hero Image — spans 2 cols and 2 rows */}
                <button
                  onClick={() => openLightbox(0)}
                  className="relative col-span-2 row-span-2 rounded-xl overflow-hidden group cursor-pointer"
                  aria-label={
                    allImages.length > 1
                      ? `View all ${allImages.length} photos`
                      : `View ${allImages[0].alt}`
                  }
                >
                  <Image
                    src={allImages[0].src}
                    alt={allImages[0].alt}
                    width={600}
                    height={600}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {/* Mobile count overlay — visible only on small screens */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-3 right-3 sm:hidden bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      +{allImages.length - 1}
                    </div>
                  )}
                </button>

                {/* Smaller thumbnails — hidden on mobile, show up to 5 on sm+ with counter on the last */}
                {allImages.slice(1, 6).map((image, index) => {
                  const isLastVisible =
                    index === 4 && allImages.length > 6;
                  const remaining = allImages.length - 6;

                  return (
                    <button
                      key={image.id}
                      onClick={() => openLightbox(index + 1)}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer hidden sm:block"
                      aria-label={
                        isLastVisible
                          ? `+${remaining} more photos`
                          : `View ${image.alt}`
                      }
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={300}
                        height={300}
                        sizes="33vw"
                        className="w-full h-full object-cover"
                      />
                      {isLastVisible ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            +{remaining}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>
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
