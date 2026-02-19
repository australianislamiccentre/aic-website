import type { Metadata } from "next";
import { Inter, Playfair_Display, Amiri } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PreviewBanner } from "@/components/PreviewBanner";
import { getSiteSettings, getDonationSettings, getFormSettings } from "@/sanity/lib/fetch";
import { FundraiseUpScript } from "@/components/FundraiseUpScript";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { FormSettingsProvider } from "@/contexts/FormSettingsContext";
import type { SanityFormSettings } from "@/contexts/FormSettingsContext";

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
  title: {
    default: "Australian Islamic Centre | A Place of Worship, Learning & Community",
    template: "%s | Australian Islamic Centre",
  },
  description:
    "The Australian Islamic Centre is one of Sydney's most significant Islamic institutions, serving the Muslim community with worship services, educational programs, and community support for over 40 years.",
  keywords: [
    "Australian Islamic Centre",
    "mosque Sydney",
    "Islamic centre",
    "Muslim community",
    "prayer times Sydney",
    "Islamic education",
    "Quran classes",
    "halal certification",
    "Islamic services",
    "Bass Hill mosque",
  ],
  authors: [{ name: "Australian Islamic Centre" }],
  creator: "Australian Islamic Centre",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://aic.org.au",
    siteName: "Australian Islamic Centre",
    title: "Australian Islamic Centre | A Place of Worship, Learning & Community",
    description:
      "Serving the Muslim community of Sydney for over 40 years with worship services, educational programs, and community support.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Australian Islamic Centre",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Australian Islamic Centre",
    description:
      "A Place of Worship, Learning & Community - Serving Sydney for over 40 years.",
    images: ["/og-image.jpg"],
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ isEnabled: isDraftMode }, siteSettings, donationSettings, formSettingsRaw] = await Promise.all([
    draftMode(),
    getSiteSettings(),
    getDonationSettings(),
    getFormSettings(),
  ]);

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} ${amiri.variable} antialiased bg-neutral-50 text-gray-900 overflow-x-hidden`}
      >
        <SiteSettingsProvider siteSettings={siteSettings}>
          <FormSettingsProvider formSettings={formSettingsRaw as SanityFormSettings | null}>
            <FundraiseUpScript settings={donationSettings} />
            <ScrollToTop />
            <ScrollProgress />
            <Header />
            <main className="overflow-x-hidden">{children}</main>
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
