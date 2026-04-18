"use client";

import { PortableText } from "@portabletext/react";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { formatMelbourneDate } from "@/lib/time";
import type { SanityLegalPageSettings } from "@/types/sanity";

const portableTextComponents = {
  marks: {
    link: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value?: { href?: string };
    }) => (
      <a
        href={value?.href}
        className="text-teal-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

interface PrivacyContentProps {
  settings: SanityLegalPageSettings | null;
}

export default function PrivacyContent({ settings }: PrivacyContentProps) {
  const heading = settings?.heading ?? "Privacy Policy";

  // Format via `formatMelbourneDate` (lib/time.ts) so SSR and hydration agree
  // and the month label reflects Melbourne's calendar (not the runtime's).
  let lastUpdatedDisplay = "March 2026";
  if (settings?.lastUpdated) {
    lastUpdatedDisplay = formatMelbourneDate(new Date(settings.lastUpdated), {
      month: "long",
      year: "numeric",
    });
  }

  return (
    <>
      <section className="bg-gradient-to-br from-neutral-50 via-white to-teal-50/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <BreadcrumbLight />
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">
            {heading}
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Last updated: {lastUpdatedDisplay}
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-10 text-gray-600 leading-relaxed">
          {settings?.content ? (
            <div className="prose prose-lg max-w-none">
              <PortableText
                value={settings.content}
                components={portableTextComponents}
              />
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  1. Introduction
                </h2>
                <p>
                  The Australian Islamic Centre (&ldquo;AIC&rdquo;,
                  &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is
                  committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your
                  information when you visit our website at
                  australianislamiccentre.org.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  2. Information We Collect
                </h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Personal Information
                </h3>
                <p className="mb-3">
                  We may collect personal information you voluntarily provide
                  when you:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Submit a contact or enquiry form</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Register for an event or program</li>
                  <li>Make a donation through our platform</li>
                </ul>
                <p className="mt-3">
                  This information may include your name, email address, phone
                  number, and any message content you choose to provide.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
                  Automatically Collected Information
                </h3>
                <p>
                  When you visit our website, we may automatically collect
                  certain information about your device and browsing behaviour,
                  including your IP address, browser type, operating system,
                  referring URLs, and pages viewed. This data is collected
                  through cookies and similar technologies.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  3. How We Use Your Information
                </h2>
                <p className="mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Respond to your enquiries and requests</li>
                  <li>
                    Send newsletter communications you have subscribed to
                  </li>
                  <li>Process event registrations and donations</li>
                  <li>Improve our website and services</li>
                  <li>Analyse website usage patterns and trends</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  4. Third-Party Services
                </h2>
                <p className="mb-3">
                  Our website uses the following third-party services:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>FundraiseUp</strong> &mdash; processes donations on
                    our behalf. When you make a donation, your payment
                    information is handled directly by FundraiseUp in accordance
                    with their privacy policy. We do not store your credit card
                    or banking details.
                  </li>
                  <li>
                    <strong>Google Analytics</strong> &mdash; helps us
                    understand how visitors interact with our website. Google
                    Analytics uses cookies to collect anonymised usage data.
                  </li>
                  <li>
                    <strong>Sanity CMS</strong> &mdash; manages our website
                    content. No personal visitor data is shared with Sanity.
                  </li>
                  <li>
                    <strong>Vercel</strong> &mdash; hosts our website. Vercel
                    may collect standard server logs including IP addresses.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  5. Cookies
                </h2>
                <p>
                  Our website uses cookies to enhance your browsing experience
                  and to analyse site traffic. Cookies are small text files
                  stored on your device. You can control cookie preferences
                  through your browser settings. Disabling cookies may affect
                  some website functionality.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  6. Data Security
                </h2>
                <p>
                  We implement appropriate technical and organisational measures
                  to protect your personal information against unauthorised
                  access, alteration, disclosure, or destruction. However, no
                  method of transmission over the internet is completely secure,
                  and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  7. Data Retention
                </h2>
                <p>
                  We retain personal information only for as long as necessary
                  to fulfil the purposes for which it was collected, or as
                  required by law. Newsletter subscribers can unsubscribe at any
                  time, after which their data will be removed from our mailing
                  list.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  8. Your Rights
                </h2>
                <p className="mb-3">
                  Under the Australian Privacy Act 1988, you have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Access the personal information we hold about you
                  </li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  9. Children&apos;s Privacy
                </h2>
                <p>
                  Our website is not directed at children under 13. We do not
                  knowingly collect personal information from children under 13.
                  If you believe we have inadvertently collected such
                  information, please contact us so we can promptly remove it.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  10. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page with an updated revision
                  date. We encourage you to review this policy periodically.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  11. Contact Us
                </h2>
                <p>
                  If you have questions or concerns about this Privacy Policy or
                  our data practices, please contact us:
                </p>
                <div className="mt-3 bg-neutral-50 rounded-xl p-5 border border-gray-100">
                  <p className="font-semibold text-gray-900">
                    Australian Islamic Centre
                  </p>
                  <p>23-27 Blenheim Road, Newport VIC 3015</p>
                  <p>Phone: (03) 9391 5724</p>
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:info@australianislamiccentre.org"
                      className="text-teal-600 hover:underline"
                    >
                      info@australianislamiccentre.org
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
