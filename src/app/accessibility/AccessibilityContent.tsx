"use client";

import { BreadcrumbLight } from "@/components/ui/Breadcrumb";

export default function AccessibilityContent() {
  return (
    <>
      <section className="bg-gradient-to-br from-neutral-50 via-white to-teal-50/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <BreadcrumbLight />
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">
            Accessibility Statement
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Last updated: March 2026
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-10 text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Commitment</h2>
            <p>
              The Australian Islamic Centre is committed to ensuring that our website is accessible to
              all visitors, regardless of ability or the technology they use. We strive to meet the
              Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA conformance, and we
              continuously work to improve the accessibility and usability of our website.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Accessibility Features</h2>
            <p className="mb-3">Our website incorporates the following accessibility features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Keyboard navigation</strong> &mdash; all interactive elements can be accessed
                and operated using a keyboard alone.
              </li>
              <li>
                <strong>Skip to content</strong> &mdash; a skip link is provided to allow keyboard
                users to bypass repetitive navigation and jump directly to the main content.
              </li>
              <li>
                <strong>Semantic HTML</strong> &mdash; we use proper HTML elements (headings, lists,
                landmarks) to ensure content is structured logically for screen readers.
              </li>
              <li>
                <strong>Text alternatives</strong> &mdash; meaningful alt text is provided for all
                images to convey their content or function.
              </li>
              <li>
                <strong>Colour contrast</strong> &mdash; text and interactive elements meet WCAG AA
                minimum contrast ratios to ensure readability.
              </li>
              <li>
                <strong>Focus indicators</strong> &mdash; visible focus styles are provided on all
                interactive elements for keyboard users.
              </li>
              <li>
                <strong>Responsive design</strong> &mdash; the website adapts to different screen
                sizes and can be zoomed up to 200% without loss of content or functionality.
              </li>
              <li>
                <strong>Reduced motion</strong> &mdash; animations respect the
                &ldquo;prefers-reduced-motion&rdquo; system setting for users who are sensitive to motion.
              </li>
              <li>
                <strong>Form labels</strong> &mdash; all form inputs have associated labels to ensure
                they are identifiable by assistive technology.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Known Limitations</h2>
            <p className="mb-3">
              While we strive for full accessibility, some areas of our website may have limitations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Third-party content</strong> &mdash; some embedded content from third-party
                services (such as donation forms provided by FundraiseUp) may not fully meet
                accessibility standards. We work with our service providers to improve this.
              </li>
              <li>
                <strong>PDF documents</strong> &mdash; some older PDF documents may not be fully
                accessible. We are working to provide accessible alternatives.
              </li>
              <li>
                <strong>Arabic content</strong> &mdash; Quranic verses and Arabic text are displayed
                with proper right-to-left formatting and the Amiri font for accurate rendering.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Standards We Follow</h2>
            <p className="mb-3">Our accessibility efforts are guided by:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</li>
              <li>Disability Discrimination Act 1992 (Australia)</li>
              <li>WAI-ARIA best practices for dynamic web content</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Feedback and Assistance</h2>
            <p>
              We welcome your feedback on the accessibility of our website. If you encounter any
              barriers or have suggestions for improvement, please contact us. We take accessibility
              feedback seriously and will make reasonable efforts to address any issues.
            </p>
            <div className="mt-3 bg-neutral-50 rounded-xl p-5 border border-gray-100">
              <p className="font-semibold text-gray-900">Australian Islamic Centre</p>
              <p>23-27 Blenheim Road, Newport VIC 3015</p>
              <p>Phone: (03) 9391 5724</p>
              <p>
                Email:{" "}
                <a href="mailto:info@australianislamiccentre.org" className="text-teal-600 hover:underline">
                  info@australianislamiccentre.org
                </a>
              </p>
            </div>
            <p className="mt-4">
              If you need information from our website in an alternative format, please contact us and
              we will do our best to accommodate your request.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
