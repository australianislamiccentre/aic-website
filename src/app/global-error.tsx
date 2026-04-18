/**
 * Global Error Boundary
 *
 * Catches errors in the root layout itself (which the regular error.tsx cannot).
 * Must provide its own <html> and <body> tags since the root layout has failed.
 *
 * @module app/global-error
 */
"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-neutral-50 text-gray-900 font-sans antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We&apos;re sorry — an unexpected error occurred. Please try refreshing
              the page.
            </p>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-lg bg-[#01476b] text-white font-medium hover:bg-[#01476b]/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
