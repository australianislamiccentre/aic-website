/**
 * Scroll-to-Top on Route Change
 *
 * Invisible component that scrolls the window to the top whenever
 * the Next.js pathname changes. Prevents the user from landing
 * mid-page after navigating between routes.
 *
 * @module components/ui/ScrollToTop
 */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scrolls to top on every pathname change. Renders nothing. */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
