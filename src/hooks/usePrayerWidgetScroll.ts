/**
 * Prayer Widget Scroll Hook
 *
 * Tracks scroll direction to auto-hide the prayer widget pill on scroll down
 * and reveal it on scroll up. Stays visible within 80px of the top.
 * Respects prefers-reduced-motion and an external paused flag (e.g. when the
 * widget is expanded).
 *
 * @module hooks/usePrayerWidgetScroll
 */
"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD_PX = 80;
const DIRECTION_THRESHOLD_PX = 4; // minimum scroll delta to count as a direction change

export function usePrayerWidgetScroll(paused: boolean = false): boolean {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (paused) return; // no listener when paused; derived return handles visibility

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const prefersReducedMotion = mediaQuery?.matches ?? false;
    if (prefersReducedMotion) return;

    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (y < SCROLL_THRESHOLD_PX) {
        setIsHidden(false);
      } else if (y > lastScrollY.current + DIRECTION_THRESHOLD_PX) {
        setIsHidden(true);
      } else if (y < lastScrollY.current - DIRECTION_THRESHOLD_PX) {
        setIsHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [paused]);

  // When paused, always report visible (don't leak stale scroll state)
  return paused ? false : isHidden;
}
