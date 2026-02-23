/**
 * Scroll-Based Animation Hooks
 *
 * Two hooks for scroll-driven UI effects:
 * - `useScrollAnimation` — triggers "visible" state when an element enters the viewport
 *   (via IntersectionObserver). Used by FadeIn and other animation components.
 * - `useScrollProgress` — tracks overall page scroll progress as a 0–100 percentage.
 *   Used by the ScrollProgress bar at the top of long pages.
 *
 * @module hooks/useScrollAnimation
 * @see src/components/animations/FadeIn.tsx — consumes useScrollAnimation
 * @see src/components/ui/ScrollProgress.tsx — consumes useScrollProgress
 */
"use client";

import { useEffect, useRef, useState, RefObject } from "react";

/** Configuration for the IntersectionObserver that drives `useScrollAnimation`. */
interface UseScrollAnimationOptions {
  /** Fraction of the element that must be visible to trigger (0–1). Default: 0.1 */
  threshold?: number;
  /** CSS-style margin around the root (viewport). Default: "0px" */
  rootMargin?: string;
  /** If true (default), the element stays "visible" once triggered and never resets. */
  triggerOnce?: boolean;
}

/**
 * Observes an element and returns `[ref, isVisible]`.
 * Attach `ref` to the target element; `isVisible` flips to `true` when it enters the viewport.
 *
 * @typeParam T - The HTML element type (default: HTMLDivElement)
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

/**
 * Tracks overall page scroll progress as a percentage (0–100).
 * Updates on every scroll event (passive listener for performance).
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      setProgress(totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}
