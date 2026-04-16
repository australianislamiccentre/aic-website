"use client";

import DOMPurify from "isomorphic-dompurify";
import { Moon, Star, Heart } from "lucide-react";

const sanitize = (html: string) =>
  DOMPurify.sanitize(html.replace(/[\u200B-\u200D\uFEFF]/g, "").trim(), {
    ALLOW_DATA_ATTR: true,
  });

function FundraiseUpWidget({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}

const FUNDRAISER_BUTTON = `<a href="#XAAHRYSE" style="display: none"></a>`;
const TOP_FUNDRAISERS = `<a href="#XCXEPVKR" style="display: none"></a>`;

export default function LaylatulQadrContent() {
  return (
    <>
      {/* Main section — hero left, leaderboard right, all above the fold */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-[#01476b] via-[#01354f] to-[#011e30]">
        {/* Decorative stars */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Star className="absolute top-[12%] left-[8%] w-3 h-3 text-yellow-300/30 rotate-12" />
          <Star className="absolute top-[20%] right-[15%] w-4 h-4 text-yellow-200/20 -rotate-6" />
          <Star className="absolute bottom-[25%] left-[12%] w-2.5 h-2.5 text-yellow-300/25 rotate-45" />
          <Star className="absolute bottom-[15%] right-[8%] w-3 h-3 text-yellow-200/20 rotate-12" />
          <Moon className="absolute top-8 right-8 sm:top-10 sm:right-12 w-14 h-14 sm:w-20 sm:h-20 text-yellow-200/10 -rotate-45" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
            {/* Left — hero content */}
            <div className="flex-1 text-center lg:text-left lg:py-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/15 text-yellow-200 text-xs sm:text-sm font-medium mb-4">
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                The Night of Power
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 font-serif tracking-tight">
                Laylatul Qadr Fundraiser
              </h1>

              <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto lg:mx-0 mb-5 leading-relaxed">
                Multiply your rewards on the most blessed night of the year.
                Start a fundraiser, join a team, or donate to support our community.
              </p>

              {/* Arabic ayah */}
              <blockquote className="mb-2" dir="rtl" lang="ar">
                <p className="text-xl sm:text-2xl lg:text-3xl font-arabic text-yellow-200/90 leading-relaxed">
                  لَيْلَةُ ٱلْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ
                </p>
              </blockquote>
              <blockquote className="max-w-lg mx-auto lg:mx-0 mb-1">
                <p className="text-sm sm:text-base font-serif italic text-white/60">
                  &ldquo;The Night of Qadr is better than a thousand months.&rdquo;
                </p>
              </blockquote>
              <p className="text-xs text-white/40 mb-6">Surah Al-Qadr 97:3</p>

              {/* CTA button */}
              <FundraiseUpWidget
                html={FUNDRAISER_BUTTON}
                className="inline-block"
              />
            </div>

            {/* Right — top fundraisers leaderboard */}
            <div className="mt-10 lg:mt-0 lg:w-[400px] xl:w-[440px] flex-shrink-0">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 text-center">
                  Top Fundraisers
                </h2>
                <FundraiseUpWidget html={TOP_FUNDRAISERS} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtues of Laylatul Qadr — below the fold */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              The Virtues of Laylatul Qadr
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              Laylatul Qadr — the Night of Power — is the most sacred night in
              the Islamic calendar. It falls within the last ten nights of
              Ramadan and is the night the Quran was first revealed to Prophet
              Muhammad (peace be upon him).
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                <Moon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">Better Than 1,000 Months</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Worship and good deeds performed on this single night are
                greater in reward than those performed over a thousand months
                — more than 83 years.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">Angels Descend</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                The angels and the Spirit (Jibreel) descend therein by
                permission of their Lord for every matter. It is peace until
                the rising of the dawn.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">Sins Forgiven</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                The Prophet (peace be upon him) said: &ldquo;Whoever stands
                in prayer on Laylatul Qadr out of faith and seeking reward,
                all their previous sins will be forgiven.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
