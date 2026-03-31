"use client";

import { PortableText } from "@portabletext/react";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
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

interface TermsContentProps {
  settings: SanityLegalPageSettings | null;
}

export default function TermsContent({ settings }: TermsContentProps) {
  const heading = settings?.heading ?? "Terms of Use";

  let lastUpdatedDisplay = "March 2026";
  if (settings?.lastUpdated) {
    lastUpdatedDisplay = new Date(settings.lastUpdated).toLocaleDateString(
      "en-AU",
      { month: "long", year: "numeric" },
    );
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
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing and using the Australian Islamic Centre website
                  (australianislamiccentre.org), you agree to be bound by these
                  Terms of Use. If you do not agree with any part of these
                  terms, please do not use our website.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  2. Use of the Website
                </h2>
                <p className="mb-3">
                  You agree to use this website only for lawful purposes and in
                  a manner that:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Does not infringe the rights of others</li>
                  <li>
                    Does not restrict or inhibit anyone else&apos;s use of the
                    website
                  </li>
                  <li>
                    Does not attempt to gain unauthorised access to any part of
                    the website
                  </li>
                  <li>
                    Does not introduce malicious software or harmful code
                  </li>
                  <li>
                    Complies with all applicable Australian laws and regulations
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  3. Intellectual Property
                </h2>
                <p>
                  All content on this website, including text, images, logos,
                  graphics, and design elements, is the property of the
                  Australian Islamic Centre or its content suppliers and is
                  protected by Australian and international copyright laws. You
                  may not reproduce, distribute, or create derivative works from
                  this content without our prior written consent.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  4. User Submissions
                </h2>
                <p>
                  When you submit information through our contact forms, event
                  registrations, or newsletter subscriptions, you grant us
                  permission to use that information for the purposes described
                  in our Privacy Policy. You are responsible for ensuring that
                  any information you submit is accurate and does not violate
                  the rights of any third party.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  5. Donations
                </h2>
                <p>
                  Donations made through our website are processed by
                  FundraiseUp, a third-party payment processor. By making a
                  donation, you agree to FundraiseUp&apos;s terms and conditions
                  in addition to these terms. All donations are made voluntarily
                  and are generally non-refundable unless required by law. Tax
                  receipts are issued in accordance with Australian Taxation
                  Office requirements.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  6. Event Registration
                </h2>
                <p>
                  Registrations for events and programs are subject to
                  availability. We reserve the right to cancel, reschedule, or
                  modify events at our discretion. In such cases, registered
                  participants will be notified through the contact details
                  provided during registration.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  7. Third-Party Links
                </h2>
                <p>
                  Our website may contain links to third-party websites,
                  including those of our partner organisations. We are not
                  responsible for the content, privacy practices, or terms of
                  use of these external sites. Visiting linked websites is at
                  your own risk.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  8. Disclaimer of Warranties
                </h2>
                <p>
                  This website is provided on an &ldquo;as is&rdquo; and
                  &ldquo;as available&rdquo; basis. While we strive to keep the
                  information accurate and up to date, we make no warranties or
                  representations about the completeness, accuracy, or
                  reliability of any content on this website. Prayer times,
                  event schedules, and other time-sensitive information should
                  be confirmed directly with the centre.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  9. Limitation of Liability
                </h2>
                <p>
                  To the fullest extent permitted by Australian law, the
                  Australian Islamic Centre shall not be liable for any direct,
                  indirect, incidental, consequential, or punitive damages
                  arising from your use of or inability to use this website.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  10. Governing Law
                </h2>
                <p>
                  These Terms of Use are governed by and construed in accordance
                  with the laws of the State of Victoria, Australia. Any
                  disputes arising from these terms shall be subject to the
                  exclusive jurisdiction of the courts of Victoria.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  11. Changes to These Terms
                </h2>
                <p>
                  We reserve the right to modify these Terms of Use at any time.
                  Changes will be effective immediately upon posting to this
                  page. Your continued use of the website after any changes
                  constitutes acceptance of the updated terms.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  12. Contact Us
                </h2>
                <p>
                  If you have any questions about these Terms of Use, please
                  contact us:
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
