"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { YouTubeLiveStream } from "@/lib/youtube";

/** Polls every 60s during Friday Khutbah window, 5 min otherwise. */
const FRIDAY_POLL_MS = 60_000;
const DEFAULT_POLL_MS = 300_000;

/** Minimum gap between visibility-triggered polls (prevents bursts on tab switch). */
const VISIBILITY_THROTTLE_MS = 60_000;

/** Check if it's Friday 12pm–3pm in Melbourne (peak live stream window). */
function isFridayPrayerWindow(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Australia/Melbourne",
    weekday: "long",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  return weekday === "Friday" && hour >= 12 && hour < 15;
}

interface LiveBannerProps {
  liveStream: YouTubeLiveStream;
}

export function LiveBanner({ liveStream: initialLiveStream }: LiveBannerProps) {
  const [liveStream, setLiveStream] = useState(initialLiveStream);
  const lastPollTimeRef = useRef(0);

  const poll = useCallback(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch("/api/youtube/live");
      if (res.ok) {
        const data = await res.json();
        setLiveStream(data);
      }
    } catch {
      // Silently fail — keep last known state
    }
    lastPollTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    // Use setTimeout chain so the interval adapts when Friday prayer window starts/ends
    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedulePoll = () => {
      const delay = isFridayPrayerWindow() ? FRIDAY_POLL_MS : DEFAULT_POLL_MS;
      timeoutId = setTimeout(async () => {
        await poll();
        if (!cancelled) schedulePoll();
      }, delay);
    };

    schedulePoll();

    // Throttled visibility handler — only poll on tab-focus if enough time has
    // elapsed since the last poll. This prevents request bursts when the user
    // switches between terminal and browser during development (every open tab
    // fires visibilitychange simultaneously).
    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        Date.now() - lastPollTimeRef.current > VISIBILITY_THROTTLE_MS
      ) {
        poll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [poll]);

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
