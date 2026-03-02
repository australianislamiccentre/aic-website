/**
 * Root Error Boundary
 *
 * Catches rendering errors across all routes and displays a user-friendly
 * fallback with a retry button. Logs the error for debugging.
 *
 * @module app/error
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We&apos;re sorry — an unexpected error occurred. Please try again or
          return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-[#01476b] text-white font-medium hover:bg-[#01476b]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01476b] focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01476b] focus-visible:ring-offset-2"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
