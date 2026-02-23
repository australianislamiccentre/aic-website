/**
 * Resources Page
 *
 * Placeholder page displaying a "Coming Soon" message for the future
 * community resource library. Links back to the homepage.
 *
 * @route /resources
 * @module app/resources/page
 */
import Link from "next/link";

export const metadata = {
  title: "Resources | Australian Islamic Centre",
  description: "Community resources - coming soon.",
};

export default function ResourcesPage() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-gray-600 mb-8">
          We&apos;re working on bringing you a comprehensive resource library. Check back soon!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}
