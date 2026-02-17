import type { Metadata } from "next";
import { Inter, Playfair_Display, Amiri } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PreviewBanner } from "@/components/PreviewBanner";
import { getSiteSettings } from "@/sanity/lib/fetch";

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
  const [{ isEnabled: isDraftMode }, siteSettings] = await Promise.all([
    draftMode(),
    getSiteSettings(),
  ]);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Fundraise Up: the new standard for online giving */}
        <Script
          id="fundraise-up"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,n,a){if(!w[n]){var l='call,catch,on,once,set,then,track,openCheckout'
.split(','),i,o=function(n){return'function'==typeof n?o.l.push([arguments])&&o
:function(){return o.l.push([n,arguments])&&o}},t=d.getElementsByTagName(s)[0],
j=d.createElement(s);j.async=!0;j.src='https://cdn.fundraiseup.com/widget/'+a+'';
t.parentNode.insertBefore(j,t);o.s=Date.now();o.v=5;o.h=w.location.href;o.l=[];
for(i=0;i<8;i++)o[l[i]]=o(l[i]);w[n]=o}
})(window,document,'script','FundraiseUp','AGUWBDNC');`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${amiri.variable} antialiased bg-neutral-50 text-gray-900 overflow-x-hidden`}
      >
        <ScrollToTop />
        <ScrollProgress />
        <Header siteSettings={siteSettings} />
        <main className="overflow-x-hidden">{children}</main>
        <Footer siteSettings={siteSettings} />
        {isDraftMode && (
          <>
            <PreviewBanner />
            <VisualEditing />
          </>
        )}
        <SpeedInsights />
      </body>
    </html>
  );
}
