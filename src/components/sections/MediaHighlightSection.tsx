"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { aicImages, aicInfo } from "@/data/content";
import { Play, ExternalLink, Youtube, Instagram, Facebook } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Featured video data
const featuredVideo = {
  title: "Experience the Australian Islamic Centre",
  description:
    "Take a virtual tour of our award-winning architectural masterpiece and discover the heart of our community.",
  thumbnail: aicImages.exterior.aerial,
  youtubeUrl: aicInfo.socialMedia.youtube,
  duration: "3:42",
};

// Social media links
const socialLinks = [
  {
    platform: "YouTube",
    icon: Youtube,
    url: aicInfo.socialMedia.youtube,
    color: "bg-red-600 hover:bg-red-700",
    label: "Subscribe",
  },
  {
    platform: "Instagram",
    icon: Instagram,
    url: aicInfo.socialMedia.instagram,
    color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90",
    label: "Follow",
  },
  {
    platform: "Facebook",
    icon: Facebook,
    url: aicInfo.socialMedia.facebook,
    color: "bg-blue-600 hover:bg-blue-700",
    label: "Like",
  },
];

export function MediaHighlightSection() {
  return (
    <section className="py-12 md:py-20 bg-neutral-950 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-4">
              <Play className="w-4 h-4" />
              Media & Videos
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Explore Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Centre
              </span>
            </h2>
          </div>
        </FadeIn>

        {/* Featured Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <Link
            href={featuredVideo.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
              {/* Thumbnail */}
              <Image
                src={featuredVideo.thumbnail}
                alt={featuredVideo.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/30 group-hover:bg-red-500 transition-colors"
                >
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                </motion.div>
              </div>

              {/* Duration badge */}
              <div className="absolute top-4 right-4 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
                {featuredVideo.duration}
              </div>

              {/* Video info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-red-300 transition-colors">
                  {featuredVideo.title}
                </h3>
                <p className="text-sm text-neutral-300 line-clamp-2 max-w-2xl">
                  {featuredVideo.description}
                </p>
              </div>

              {/* YouTube badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium">
                <Youtube className="w-4 h-4 text-red-500" />
                Watch on YouTube
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {socialLinks.map((social) => (
            <Link
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all ${social.color}`}
            >
              <social.icon className="w-5 h-5" />
              {social.label} on {social.platform}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
