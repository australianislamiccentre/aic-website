"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { Play, ExternalLink, ArrowRight, Instagram, Facebook, Youtube } from "lucide-react";
import Image from "next/image";
import { aicImages } from "@/data/content";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// Featured video content
const featuredVideo = {
  id: "featured",
  title: "Experience the Australian Islamic Centre",
  description: "Take a virtual tour of our award-winning architectural masterpiece",
  thumbnail: aicImages.exterior.aerial,
  duration: "3:42",
  views: "12K",
};

// Recent social posts (placeholder data)
const socialPosts = [
  {
    id: 1,
    platform: "instagram",
    image: aicImages.interior.prayerHallBright,
    caption: "Friday prayers at the AIC - a beautiful gathering of our community",
    likes: 234,
    date: "2 days ago",
  },
  {
    id: 2,
    platform: "facebook",
    image: aicImages.exterior.courtyard,
    caption: "Join us for the upcoming community iftar during Ramadan",
    likes: 456,
    date: "3 days ago",
  },
  {
    id: 3,
    platform: "instagram",
    image: aicImages.architecture.roofGolden,
    caption: "Golden hour at the AIC - our unique roof design catching the sunset",
    likes: 567,
    date: "5 days ago",
  },
  {
    id: 4,
    platform: "youtube",
    image: aicImages.interior.prayerHallNight,
    caption: "Friday Khutbah: The Importance of Community",
    likes: 123,
    date: "1 week ago",
  },
];

export function SocialMediaSection() {
  const info = useSiteSettings();

  const socialLinks = [
    { name: "Instagram", icon: Instagram, url: info.socialMedia.instagram, color: "from-pink-500 to-purple-500" },
    { name: "Facebook", icon: Facebook, url: info.socialMedia.facebook, color: "from-blue-600 to-blue-500" },
    { name: "YouTube", icon: Youtube, url: info.socialMedia.youtube, color: "from-red-600 to-red-500" },
  ];
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-100 to-neutral-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d4d4d4 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-4">
              <Instagram className="w-4 h-4" />
              Social Media
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stay{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                Connected
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow our journey and stay updated with the latest from our community
              through our social media channels.
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Featured Video */}
          <FadeIn direction="left">
            <div className="group relative rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl">
              <div className="relative aspect-video">
                <Image
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:bg-white transition-colors"
                >
                  <Play className="w-8 h-8 text-green-600 fill-green-600 ml-1" />
                </motion.button>

                {/* Duration badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {featuredVideo.duration}
                </div>
              </div>

              {/* Video info */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-2">
                  <Youtube className="w-4 h-4" />
                  <span>Featured Video</span>
                  <span className="text-gray-500">• {featuredVideo.views} views</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{featuredVideo.title}</h3>
                <p className="text-gray-400 text-sm">{featuredVideo.description}</p>

                <Button
                  href={info.socialMedia.youtube}
                  variant="outline"
                  className="mt-4 border-white/20 text-white hover:bg-white/10"
                  icon={<ExternalLink className="w-4 h-4" />}
                >
                  Watch on YouTube
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Social Grid */}
          <FadeIn direction="right" delay={0.2}>
            <div className="space-y-6">
              {/* Social posts grid */}
              <div className="grid grid-cols-2 gap-4">
                {socialPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative rounded-xl overflow-hidden bg-white shadow-lg cursor-pointer"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={post.image}
                        alt={post.caption}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Platform icon */}
                      <div className="absolute top-2 right-2">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                            post.platform === "instagram"
                              ? "from-pink-500 to-purple-500"
                              : post.platform === "facebook"
                              ? "from-blue-600 to-blue-500"
                              : "from-red-600 to-red-500"
                          } flex items-center justify-center shadow-lg`}
                        >
                          {post.platform === "instagram" ? (
                            <Instagram className="w-4 h-4 text-white" />
                          ) : post.platform === "facebook" ? (
                            <Facebook className="w-4 h-4 text-white" />
                          ) : (
                            <Youtube className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Hover overlay with caption */}
                      <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social follow buttons */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${social.color} text-white font-medium shadow-lg hover:shadow-xl transition-shadow`}
                    >
                      <social.icon className="w-5 h-5" />
                      <span>{social.name}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Bottom CTA */}
        <FadeIn delay={0.4}>
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              Want to see more? Visit our media gallery for photos, videos, and past events.
            </p>
            <Button
              href="/media"
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Explore Media Gallery
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
