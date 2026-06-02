/**
 * Root Layout
 *
 * Top-level layout wrapping every page in the application. Fetches siteSettings,
 * donationSettings, formSettings, header/footer settings, and prayerSettings from
 * Sanity, then provides them via context. Renders the Header, Footer, ScrollToTop,
 * FundraiseUpScript, and the site-wide PrayerWidget.
 *
 * @module app/layout
 */
import type { Metadata } from "next";
import { Inter, Playfair_Display, Amiri } from "next/font/google";
import { draftMode, headers } from "next/headers";
import { VisualEditing } from "next-sanity";
import "./globals.css";
import { HeaderB } from "@/components/layout/HeaderB";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PreviewBanner } from "@/components/PreviewBanner";
import {
  getSiteSettings,
  getDonationSettings,
  getContactFormSettings,
  getServiceInquiryFormSettings,
  getNewsletterSettings,
  getNavigationPages,
  getHeaderSettings,
  getFooterSettings,
  getPrayerSettings,
} from "@/sanity/lib/fetch";
import { PrayerWidget } from "@/components/layout/PrayerWidget";
import { FundraiseUpScript } from "@/components/FundraiseUpScript";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { getYouTubeLiveStream } from "@/lib/youtube";
import { LiveBanner } from "@/components/LiveBanner";
import { EidBanner } from "@/components/layout/EidBanner";
import { FormSettingsProvider } from "@/contexts/FormSettingsContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

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

// Prayer widget V4 Geometric — typography unified on Inter (already
// loaded site-wide). The widget no longer ships its own font family;
// every element resolves to var(--font-inter) via --v4-serif /
// --v4-sans in globals.css. Drops Spectral + Figtree font loads.

// This layout reads headers() (for the CSP nonce) — a dynamic API. Next would
// otherwise try to STATICALLY prerender the not-found route (and the /[slug]
// catch-all), where headers() throws DYNAMIC_SERVER_USAGE, making every unknown
// URL return 500 instead of our custom 404. Forcing dynamic rendering makes those
// routes render per-request like the rest of the app (already dynamic via
// headers()/draftMode()). The fetch data cache (sanityFetch's explicit
// `revalidate: 120`) is unaffected — verified the Next fetch cache still populates.
export const dynamic = "force-dynamic";

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
  // Disable iOS Safari "format detection" — WebKit auto-wraps phone numbers,
  // dates, and times (prayer times, the Eid banner, etc.) in <a> tags BEFORE
  // React hydrates, mutating the server-rendered DOM and tripping a hydration
  // error on every mobile homepage load. (Sentry AIC-WEBSITE-1 / issue #75.)
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [
    { isEnabled: isDraftMode },
    headersList,
    siteSettings,
    donationSettings,
    contactFormSettingsRaw,
    serviceInquiryFormSettingsRaw,
    newsletterSettingsRaw,
    liveStream,
    navigationPages,
    headerSettings,
    footerSettings,
    prayerSettings,
  ] = await Promise.all([
    draftMode(),
    headers(),
    getSiteSettings(),
    getDonationSettings(),
    getContactFormSettings(),
    getServiceInquiryFormSettings(),
    getNewsletterSettings(),
    getYouTubeLiveStream(),
    getNavigationPages(),
    getHeaderSettings(),
    getFooterSettings(),
    getPrayerSettings(),
  ]);

  // Per-request CSP nonce set by middleware. Threaded onto the executable inline
  // scripts (the FundraiseUp bootstrap) and GA so they run under the enforced
  // script-src policy, which no longer allows 'unsafe-inline'. NOTE: the JSON-LD
  // block below intentionally does NOT receive the nonce — `application/ld+json`
  // is non-executable data (CSP never gates it), and adding a nonce there causes
  // a hydration mismatch because browsers strip the nonce attribute from the DOM.
  const nonce = headersList.get("x-nonce") ?? undefined;

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
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
            <GoogleAnalytics nonce={nonce} />
            <FundraiseUpScript settings={donationSettings} nonce={nonce} />
            <ScrollToTop />
            <EidBanner prayerSettings={prayerSettings} />
            <LiveBanner liveStream={liveStream} />
            <HeaderB />
            <main id="main-content" className="overflow-x-hidden">{children}</main>
            <Footer />
            <PrayerWidget prayerSettings={prayerSettings} />
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
