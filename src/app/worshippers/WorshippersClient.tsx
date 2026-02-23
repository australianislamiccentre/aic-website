/**
 * Worshippers Page Client Component
 *
 * Interactive client-side portion of the /worshippers page. Renders
 * prayer times with date picker, Jumu'ah schedule, Taraweeh/Eid info,
 * mosque etiquette guidelines, and the next-prayer countdown.
 *
 * @module app/worshippers/WorshippersClient
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import {
  jumuahTimes,
  mosqueEtiquette as fallbackEtiquette,
} from "@/data/content";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getPrayerTimesForDate } from "@/lib/prayer-times";
import { useNextPrayer } from "@/hooks/usePrayerTimes";
import { TARAWEEH_CONFIG, EID_CONFIG } from "@/lib/prayer-config";
import type { PrayerName } from "@/lib/prayer-times";
import type { SanityPrayerSettings, SanityEtiquette } from "@/types/sanity";
import type { YouTubeVideo } from "@/lib/youtube";
import {
  Clock,
  MapPin,
  Heart,
  CheckCircle2,
  Calendar,
  Footprints,
  Shirt,
  Volume2,
  HandHeart,
  Droplets,
  HelpCircle,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Cloud,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Play,
  ArrowRight,
  Users,
} from "lucide-react";

// Prayer icon mapping
const PRAYER_ICONS: Record<PrayerName, typeof Moon> = {
  fajr: Moon,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: Cloud,
  maghrib: Sunset,
  isha: Moon,
};

// Icon map supports both lowercase (hardcoded) and PascalCase (Sanity) icon names
const etiquetteIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  Footprints: Footprints,
  shirt: Shirt,
  Shirt: Shirt,
  volume: Volume2,
  Volume2: Volume2,
  VolumeX: Volume2,
  hands: HandHeart,
  HandHeart: HandHeart,
  Hand: HandHeart,
  droplets: Droplets,
  Droplets: Droplets,
  help: HelpCircle,
  HelpCircle: HelpCircle,
  Heart: Heart,
  Users: Users,
  Clock: Clock,
  Moon: Moon,
  Star: Star,
};

interface WorshippersClientProps {
  prayerSettings?: SanityPrayerSettings | null;
  etiquette?: SanityEtiquette[];
  youtubeVideos?: YouTubeVideo[];
}

export default function WorshippersClient({
  prayerSettings,
  etiquette = [],
  youtubeVideos = [],
}: WorshippersClientProps) {
  const info = useSiteSettings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const prayerTimes = getPrayerTimesForDate(selectedDate, prayerSettings);
  const nextPrayerData = useNextPrayer(prayerSettings);

  // Normalize Sanity data with hardcoded fallbacks
  const etiquetteItems = etiquette.length > 0
    ? etiquette.map(e => ({ title: e.title, description: e.description, icon: e.icon }))
    : fallbackEtiquette;

  // Jumu'ah times from Sanity with hardcoded fallback
  const jumuahArabicTime = prayerSettings?.jumuahArabicTime ?? jumuahTimes[0]?.time;
  const jumuahEnglishTime = prayerSettings?.jumuahEnglishTime ?? jumuahTimes[1]?.time;

  // Use Sanity data with fallback to hardcoded config
  const taraweehActive = prayerSettings?.taraweehEnabled ?? TARAWEEH_CONFIG.enabled;
  const taraweehTime = prayerSettings?.taraweehTime ?? TARAWEEH_CONFIG.time;
  const eidFitrActive = prayerSettings?.eidFitrActive ?? EID_CONFIG.eidAlFitr.active;
  const eidFitrTime = prayerSettings?.eidFitrTime ?? EID_CONFIG.eidAlFitr.times[0]?.time;
  const eidAdhaActive = prayerSettings?.eidAdhaActive ?? EID_CONFIG.eidAlAdha.active;
  const eidAdhaTime = prayerSettings?.eidAdhaTime ?? EID_CONFIG.eidAlAdha.times[0]?.time;

  const isViewingToday = (() => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  })();

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Australia/Melbourne",
    });
  };

  const formatInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + "T12:00:00");
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  // Build prayer list from dynamic times
  const prayerList: {
    key: PrayerName;
    name: string;
    adhan: string;
    iqamah: string;
    arabic: string;
    isSunrise?: boolean;
  }[] = [
    { key: "fajr", name: "Fajr", adhan: prayerTimes.fajr.adhan, iqamah: prayerTimes.fajr.iqamah, arabic: "الفجر" },
    { key: "sunrise", name: "Sunrise", adhan: prayerTimes.sunrise.adhan, iqamah: prayerTimes.sunrise.iqamah, arabic: "الشروق", isSunrise: true },
    { key: "dhuhr", name: "Dhuhr", adhan: prayerTimes.dhuhr.adhan, iqamah: prayerTimes.dhuhr.iqamah, arabic: "الظهر" },
    { key: "asr", name: "Asr", adhan: prayerTimes.asr.adhan, iqamah: prayerTimes.asr.iqamah, arabic: "العصر" },
    { key: "maghrib", name: "Maghrib", adhan: prayerTimes.maghrib.adhan, iqamah: prayerTimes.maghrib.iqamah, arabic: "المغرب" },
    { key: "isha", name: "Isha", adhan: prayerTimes.isha.adhan, iqamah: prayerTimes.isha.iqamah, arabic: "العشاء" },
  ];

  const nextPrayerKey = nextPrayerData.name;

  return (
    <>
      {/* Hero Section — matches events/services pattern */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-teal-50/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
                <Clock className="w-4 h-4" />
                Prayer Times &amp; Guidance
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                For <span className="text-teal-600">Worshippers</span>
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Join our congregation for daily prayers, Friday Jumu&apos;ah, and spiritual programs at the Australian Islamic Centre.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  Daily Prayers
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Friday Jumu&apos;ah
                </span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Special Prayers
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic start.jpg"
                  alt="Australian Islamic Centre prayer hall"
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Next prayer card overlay */}
              {isViewingToday && (
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Next Prayer</p>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = PRAYER_ICONS[nextPrayerKey];
                      return <Icon className="w-5 h-5 text-teal-600" />;
                    })()}
                    <div>
                      <p className="text-lg font-bold text-gray-900">{nextPrayerData.displayName}</p>
                      <p className="text-sm text-teal-600 font-semibold">{nextPrayerData.adhan}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section id="prayers" className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header + date navigation */}
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  Prayer Schedule
                </h2>
                <p className="text-gray-500 text-sm">
                  {isViewingToday ? "Today's prayer times for Melbourne" : "Prayer times for Melbourne"}
                </p>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousDay}
                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg min-w-[220px] text-center">
                  <span className="text-gray-900 font-medium text-sm">{formatDisplayDate(selectedDate)}</span>
                </div>

                <button
                  onClick={goToNextDay}
                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  aria-label="Next day"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>

                <div className="relative">
                  <button
                    className="p-2 rounded-lg bg-teal-500 hover:bg-teal-600 transition-colors"
                    aria-label="Open calendar"
                  >
                    <Calendar className="w-4 h-4 text-white" />
                  </button>
                  <input
                    type="date"
                    value={formatInputDate(selectedDate)}
                    onChange={handleDateChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Select date"
                  />
                </div>

                {!isViewingToday && (
                  <button
                    onClick={goToToday}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-900 transition-colors"
                    aria-label="Back to today"
                    title="Back to today"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Prayer Cards */}
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {prayerList.map((prayer) => {
              const isNext = isViewingToday && prayer.key === nextPrayerKey;
              const Icon = PRAYER_ICONS[prayer.key];
              return (
                <StaggerItem key={prayer.key}>
                  <div
                    className={`rounded-xl p-4 text-center transition-all ${
                      isNext
                        ? "bg-teal-50 border-2 border-teal-500 shadow-md ring-1 ring-teal-500/20"
                        : "bg-white border border-gray-100 hover:shadow-md"
                    }`}
                  >
                    {isNext && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-2">Next Prayer</p>
                    )}
                    <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                      isNext ? "bg-teal-500" : "bg-gray-100"
                    }`}>
                      <Icon className={`w-5 h-5 ${isNext ? "text-white" : "text-gray-500"}`} />
                    </div>
                    <p className={`text-sm font-arabic mb-0.5 ${isNext ? "text-teal-600" : "text-gray-400"}`}>{prayer.arabic}</p>
                    <h3 className={`font-semibold text-sm mb-2 ${isNext ? "text-teal-700" : "text-gray-900"}`}>{prayer.name}</h3>
                    <div className="space-y-0.5 text-xs">
                      {prayer.isSunrise ? (
                        <>
                          <p className="text-gray-500">Sunrise: <span className="font-medium text-gray-700">{prayer.adhan}</span></p>
                          <p className={`font-bold ${isNext ? "text-teal-700" : "text-gray-900"}`}>Shuruk: {prayer.iqamah}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-500">Adhan: <span className="font-medium text-gray-700">{prayer.adhan}</span></p>
                          <p className={`font-bold ${isNext ? "text-teal-700" : "text-gray-900"}`}>Iqamah: {prayer.iqamah}</p>
                        </>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Jumu'ah, Taraweeh & Eid — inline row below prayer cards */}
          <FadeIn>
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-gray-100">
              <span className="text-gray-500 text-sm font-medium">Jumu&apos;ah</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-gray-500 text-xs">Arabic</span>
                <span className="text-teal-600 font-semibold text-sm">{jumuahArabicTime}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-gray-500 text-xs">English</span>
                <span className="text-teal-600 font-semibold text-sm">{jumuahEnglishTime}</span>
              </div>

              {taraweehActive && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
                    <Star className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-purple-700 text-xs font-medium">Taraweeh</span>
                    <span className="text-purple-600 font-semibold text-sm">{taraweehTime}</span>
                  </div>
                </>
              )}

              {eidFitrActive && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-700 text-xs font-medium">Eid al-Fitr</span>
                    <span className="text-amber-600 font-semibold text-sm">{eidFitrTime}</span>
                  </div>
                </>
              )}

              {eidAdhaActive && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-700 text-xs font-medium">Eid al-Adha</span>
                    <span className="text-amber-600 font-semibold text-sm">{eidAdhaTime}</span>
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* YouTube — Islamic Talks */}
      {youtubeVideos.length > 0 && (
        <section className="py-10 md:py-14 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Islamic Talks</h2>
                  <p className="text-gray-500 text-sm">Khutbahs and lectures from the Australian Islamic Centre</p>
                </div>
                <Link
                  href="/media"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {youtubeVideos.map((video) => (
                <FadeIn key={video.id}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-red-600 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {video.title}
                      </h3>
                    </div>
                  </a>
                </FadeIn>
              ))}
            </div>
            <Link
              href="/media"
              className="sm:hidden flex items-center justify-center gap-1.5 mt-4 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              View All Videos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Mosque Etiquette */}
      <section id="etiquette" className={`py-10 md:py-14 ${youtubeVideos.length > 0 ? "bg-white" : "bg-neutral-50"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Mosque Etiquette
              </h2>
              <p className="text-gray-500 text-sm">
                Please observe these guidelines for a peaceful environment.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {etiquetteItems.map((item) => {
              const Icon = etiquetteIcons[item.icon] || CheckCircle2;
              return (
                <FadeIn key={item.title}>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{item.description}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get Directions CTA */}
      <section className={`py-10 ${youtubeVideos.length > 0 ? "bg-neutral-50" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span className="font-medium text-sm">{info.address.full}</span>
              </div>
              <a
                href="https://maps.app.goo.gl/DZUnHYjsaBvREAmw9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
