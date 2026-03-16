"use client";

import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import { Moon, Star } from "lucide-react";

const REFRESH_INTERVAL = 30; // seconds

const sanitize = (html: string) =>
  DOMPurify.sanitize(html.replace(/[\u200B-\u200D\uFEFF]/g, "").trim(), {
    ALLOW_DATA_ATTR: true,
  });

function FundraiseUpWidget({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}

const DONATION_GOAL = `<a href="#XNEDLXXS" style="display: none"></a>`;
const RECENT_DONATION = `<a href="#XKYFTMMY" style="display: none"></a>`;
const TOP_SUPPORTERS = `<a href="#XNLUYACK" style="display: none"></a>`;

export default function LiveDonationsContent() {
  const [widgetKey, setWidgetKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWidgetKey((k) => k + 1);
    }, REFRESH_INTERVAL * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#01476b] via-[#01354f] to-[#011e30]">
      {/* Decorative stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Star className="absolute top-[8%] left-[6%] w-3 h-3 text-yellow-300/30 rotate-12" />
        <Star className="absolute top-[15%] right-[10%] w-4 h-4 text-yellow-200/20 -rotate-6" />
        <Star className="absolute bottom-[20%] left-[15%] w-2.5 h-2.5 text-yellow-300/25 rotate-45" />
        <Star className="absolute bottom-[10%] right-[5%] w-3 h-3 text-yellow-200/20 rotate-12" />
        <Star className="absolute top-[40%] left-[3%] w-2 h-2 text-yellow-300/15 -rotate-12" />
        <Star className="absolute top-[60%] right-[3%] w-2.5 h-2.5 text-yellow-200/15 rotate-30" />
        <Moon className="absolute top-6 right-6 sm:top-8 sm:right-10 w-12 h-12 sm:w-16 sm:h-16 text-yellow-200/10 -rotate-45" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/15 text-yellow-200 text-xs font-medium mb-1">
            <Moon className="w-3.5 h-3.5" />
            Laylatul Qadr Campaign
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-serif tracking-tight">
            Live Donations
          </h1>
        </div>

        {/* Donation Goal / Progress — full width */}
        <div className="rounded-lg bg-white/[0.07] border border-white/[0.08] px-4 py-3 mb-3">
          <FundraiseUpWidget key={`goal-${widgetKey}`} html={DONATION_GOAL} />
        </div>

        {/* Main content: Recent | QR (center) | Top Supporters */}
        <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
          {/* Most Recent Donations */}
          <div className="flex-1 rounded-lg bg-white/[0.07] border border-white/[0.08] p-3 overflow-auto order-2 lg:order-1">
            <FundraiseUpWidget key={`recent-${widgetKey}`} html={RECENT_DONATION} />
          </div>

          {/* QR Code — Donate CTA (center focus) */}
          <div className="lg:w-[300px] shrink-0 rounded-lg bg-white/[0.07] border border-white/[0.08] p-4 flex flex-col items-center text-center order-1 lg:order-2">
            <div className="bg-white rounded-lg p-3 mb-3">
              <Image
                src="/images/donate-qr.png"
                alt="QR code linking to australianislamiccentre.org/donate"
                width={200}
                height={200}
                className="w-40 h-40 sm:w-48 sm:h-48"
              />
            </div>
            <p className="text-white text-2xl font-bold mb-1">Donate Now</p>
            <p className="text-yellow-200/70 text-base mb-3 max-w-sm">
              Every good deed on Laylatul Qadr is multiplied beyond measure
            </p>
            <p className="text-white/50 text-xs mb-3">Scan to donate</p>
            <a
              href="https://australianislamiccentre.org/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-[#00ad4c] hover:bg-[#009a43] text-white text-sm font-bold transition-colors"
            >
              australianislamiccentre.org/donate
            </a>
          </div>

          {/* Top Supporters */}
          <div className="flex-1 rounded-lg bg-white/[0.07] border border-white/[0.08] p-3 overflow-auto order-3">
            <FundraiseUpWidget key={`top-${widgetKey}`} html={TOP_SUPPORTERS} />
          </div>
        </div>
      </div>
    </section>
  );
}
