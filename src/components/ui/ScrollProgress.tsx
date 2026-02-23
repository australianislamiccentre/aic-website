/**
 * Scroll Progress Bar
 *
 * Thin gradient bar fixed to the top of the viewport that grows from
 * left to right as the user scrolls down the page. Uses Framer Motion's
 * `useScroll` + spring physics for smooth animation.
 *
 * @module components/ui/ScrollProgress
 */
"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Renders a fixed progress indicator at the very top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}
