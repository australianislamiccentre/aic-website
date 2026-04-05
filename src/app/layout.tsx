/**
 * Root Layout
 *
 * Top-level layout wrapping every page in the application. Fetches siteSettings,
 * donationSettings, and formSettings from Sanity, then provides them via context.
 * Renders the Header, Footer, ScrollToTop, ScrollProgress, and FundraiseUpScript.
 *
 * @module app/layout
 */
import type { Metadata } from "next";
import { Inter, Playfair_Display, Amiri } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";
import "./globals.css";
import { HeaderB } from "@/components/layout/HeaderB";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PreviewBanner } from "@/components/PreviewBanner";
import { getSiteSettings, getDonationSettings, getContactFormSettings, getServiceInquiryFormSettings, getNewsletterSettings, getNavigationPages, getHeaderSettings, getFooterSettings } from "@/sanity/lib/fetch";
import { FundraiseUpScript } from "@/components/FundraiseUpScript";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { getYouTubeLiveStream } from "@/lib/youtube";
import { LiveBanner } from "@/components/LiveBanner";
import { FormSettingsProvider } from "@/contexts/FormSettingsContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://australianislamiccentre.org"),
  title: {
    default: "Australian Islamic Centre | A Place of Worship, Learning & Community",
    template: "%s | Australian Islamic Centre",
  },
  description:
    "The Australian Islamic Centre in Newport, Melbourne is one of Australia's most significant Islamic institutions, serving the Muslim community with worship services, educational programs, and community support for over 40 years.",
  keywords: [
    "Australian Islamic Centre",
    "mosque Melbourne",
    "Islamic centre Newport",
    "Muslim community Melbourne",
    "prayer times Melbourne",
    "Islamic education",
    "Quran classes",
    "Newport mosque",
    "Islamic services",
    "AIC Newport",
  ],
  authors: [{ name: "Australian Islamic Centre" }],
  creator: "Australian Islamic Centre",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://australianislamiccentre.org",
    siteName: "Australian Islamic Centre",
    title: "Australian Islamic Centre | A Place of Worship, Learning & Community",
    description:
      "Serving the Muslim community of Melbourne for over 40 years with worship services, educational programs, and community support.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Australian Islamic Centre",
    description:
      "A Place of Worship, Learning & Community - Serving Melbourne for over 40 years.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ isEnabled: isDraftMode }, siteSettings, donationSettings, contactFormSettingsRaw, serviceInquiryFormSettingsRaw, newsletterSettingsRaw, liveStream, navigationPages, headerSettings, footerSettings] = await Promise.all([
    draftMode(),
    getSiteSettings(),
    getDonationSettings(),
    getContactFormSettings(),
    getServiceInquiryFormSettings(),
    getNewsletterSettings(),
    getYouTubeLiveStream(),
    getNavigationPages(),
    getHeaderSettings(),
    getFooterSettings(),
  ]);

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} ${amiri.variable} antialiased bg-neutral-50 text-gray-900 overflow-x-hidden`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-teal-700 focus:rounded-lg focus:shadow-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Mosque",
              name: "Australian Islamic Centre",
              url: "https://australianislamiccentre.org",
              address: {
                "@type": "PostalAddress",
                streetAddress: "23-27 Blenheim Road",
                addressLocality: "Newport",
                addressRegion: "VIC",
                postalCode: "3015",
                addressCountry: "AU",
              },
              telephone: "+61 3 9391 5724",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "04:30",
                closes: "22:30",
              },
            }),
          }}
        />
        <SiteSettingsProvider siteSettings={siteSettings} customNavPages={navigationPages.map(p => ({ title: p.title, slug: p.slug, navLabel: p.navLabel }))} headerSettings={headerSettings} footerSettings={footerSettings}>
          <FormSettingsProvider
            contactFormSettings={contactFormSettingsRaw}
            serviceInquiryFormSettings={serviceInquiryFormSettingsRaw}
            newsletterSettings={newsletterSettingsRaw}
          >
            <FundraiseUpScript settings={donationSettings} />
            <ScrollToTop />
            <ScrollProgress />
            <LiveBanner liveStream={liveStream} />
            <HeaderB />
            <main id="main-content" className="overflow-x-hidden">{children}</main>
            <Footer />
          </FormSettingsProvider>
        </SiteSettingsProvider>
        {isDraftMode && (
          <>
            <PreviewBanner />
            <VisualEditing />
          </>
        )}
      </body>
    </html>
  );
}
