"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { YouTubeLiveStream } from "@/lib/youtube";

interface LiveBannerProps {
  liveStream: YouTubeLiveStream;
}

export function LiveBanner({ liveStream: initialLiveStream }: LiveBannerProps) {
  const [liveStream, setLiveStream] = useState(initialLiveStream);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/youtube/live");
        if (res.ok) {
          const data = await res.json();
          setLiveStream(data);
        }
      } catch {
        // Silently fail — keep last known state
      }
    };

    const interval = setInterval(poll, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!liveStream.isLive || !liveStream.url) return null;

  return (
    <div className="bg-red-600 text-white">
      <a
        href={liveStream.url}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-2.5 h-2.5 rounded-full bg-white shrink-0"
        />
        <span>
          We&apos;re Live{liveStream.title ? ` — ${liveStream.title}` : ""}
        </span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
      </a>
    </div>
  );
}
