"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import {
  jumuahTimes,
  mosqueEtiquette as fallbackEtiquette,
} from "@/data/content";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getPrayerTimesForDate } from "@/lib/prayer-times";
import { TARAWEEH_CONFIG, EID_CONFIG } from "@/lib/prayer-config";
import type { SanityPrayerSettings, SanityEtiquette } from "@/types/sanity";
import {
  Clock,
  MapPin,
  Users,
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
  Sunset,
  Cloud,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
} from "lucide-react";

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
}

export default function WorshippersClient({
  prayerSettings,
  etiquette = [],
}: WorshippersClientProps) {
  const info = useSiteSettings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const prayerTimes = getPrayerTimesForDate(selectedDate, prayerSettings);

  // Normalize Sanity data with hardcoded fallbacks
  const etiquetteItems = etiquette.length > 0
    ? etiquette.map(e => ({ title: e.title, description: e.description, icon: e.icon }))
    : fallbackEtiquette;

  // Jumu'ah times from Sanity with hardcoded fallback
  const jumuahArabicTime = prayerSettings?.jumuahArabicTime ?? jumuahTimes[0]?.time;
  const jumuahEnglishTime = prayerSettings?.jumuahEnglishTime ?? jumuahTimes[1]?.time;
  const sanityJumuahSessions = [
    { session: "Arabic Session", time: jumuahArabicTime, language: "Arabic" },
    { session: "English Session", time: jumuahEnglishTime, language: "English" },
  ];

  // Use Sanity data with fallback to hardcoded config
  const taraweehActive = prayerSettings?.taraweehEnabled ?? TARAWEEH_CONFIG.enabled;
  const taraweehTime = prayerSettings?.taraweehTime ?? TARAWEEH_CONFIG.time;
  const eidFitrActive = prayerSettings?.eidFitrActive ?? EID_CONFIG.eidAlFitr.active;
  const eidFitrTime = prayerSettings?.eidFitrTime ?? EID_CONFIG.eidAlFitr.times[0]?.time;
  const eidAdhaActive = prayerSettings?.eidAdhaActive ?? EID_CONFIG.eidAlAdha.active;
  const eidAdhaTime = prayerSettings?.eidAdhaTime ?? EID_CONFIG.eidAlAdha.times[0]?.time;

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

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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
  const prayerList = [
    { name: "Fajr", adhan: prayerTimes.fajr.adhan, iqamah: prayerTimes.fajr.iqamah, arabic: "الفجر", icon: Moon, color: "from-indigo-500 to-purple-600" },
    { name: "Sunrise", adhan: prayerTimes.sunrise.adhan, iqamah: prayerTimes.sunrise.iqamah, arabic: "الشروق", icon: Sun, color: "from-amber-400 to-orange-500", isSunrise: true },
    { name: "Dhuhr", adhan: prayerTimes.dhuhr.adhan, iqamah: prayerTimes.dhuhr.iqamah, arabic: "الظهر", icon: Sun, color: "from-yellow-400 to-orange-500" },
    { name: "Asr", adhan: prayerTimes.asr.adhan, iqamah: prayerTimes.asr.iqamah, arabic: "العصر", icon: Cloud, color: "from-blue-400 to-cyan-500" },
    { name: "Maghrib", adhan: prayerTimes.maghrib.adhan, iqamah: prayerTimes.maghrib.iqamah, arabic: "المغرب", icon: Sunset, color: "from-rose-400 to-red-500" },
    { name: "Isha", adhan: prayerTimes.isha.adhan, iqamah: prayerTimes.isha.iqamah, arabic: "العشاء", icon: Moon, color: "from-purple-500 to-indigo-600" },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              For <span className="text-teal-600">Worshippers</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Join our congregation for daily prayers, Friday Jumu&apos;ah, and spiritual programs at the Australian Islamic Centre.
            </p>
          </div>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section id="prayers" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                <Clock className="w-4 h-4" />
                {isToday(selectedDate) ? "Today's Prayer Times" : "Prayer Times"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Prayer Schedule
              </h2>

              {/* Date Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousDay}
                    className="p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Date Display */}
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm min-w-[240px] text-center">
                    <span className="text-gray-900 font-medium">{formatDisplayDate(selectedDate)}</span>
                  </div>

                  <button
                    onClick={goToNextDay}
                    className="p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                    aria-label="Next day"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Calendar Button */}
                  <div className="relative">
                    <button
                      className="p-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 transition-colors shadow-sm"
                      aria-label="Open calendar"
                    >
                      <Calendar className="w-5 h-5 text-white" />
                    </button>
                    <input
                      type="date"
                      value={formatInputDate(selectedDate)}
                      onChange={handleDateChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Select date"
                    />
                  </div>
                </div>

                {/* Today Button */}
                {!isToday(selectedDate) && (
                  <button
                    onClick={goToToday}
                    className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-900 transition-colors shadow-sm"
                    aria-label="Back to today"
                    title="Back to today"
                  >
                    <RotateCcw className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-8">
            {prayerList.map((prayer) => (
              <StaggerItem key={prayer.name}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100 text-center"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto rounded-lg sm:rounded-xl bg-gradient-to-br ${prayer.color} flex items-center justify-center mb-2 sm:mb-3 md:mb-4 shadow-lg`}>
                    <prayer.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <p className="text-teal-600 text-sm sm:text-base md:text-lg font-arabic mb-0.5 sm:mb-1">{prayer.arabic}</p>
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 md:mb-3">{prayer.name}</h3>
                  <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                    {prayer.isSunrise ? (
                      <>
                        <p className="text-gray-500">Sunrise: <span className="font-medium text-gray-700">{prayer.adhan}</span></p>
                        <p className="text-neutral-700 font-bold">Shuruk: {prayer.iqamah}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500">Adhan: <span className="font-medium text-gray-700">{prayer.adhan}</span></p>
                        <p className="text-neutral-700 font-bold">Iqamah: {prayer.iqamah}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn>
            <div className="bg-neutral-50 rounded-2xl p-8 text-center">
              <p className="text-gray-600">
                <strong>Location:</strong> {info.address.full}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Special Prayers — compact info cards */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Special Prayers</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Jumu'ah sessions */}
            {sanityJumuahSessions.map((session) => (
              <FadeIn key={session.session}>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Friday</p>
                      <p className="font-semibold text-gray-900 text-sm">{session.session}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{session.time}</p>
                </div>
              </FadeIn>
            ))}

            {/* Taraweeh */}
            {taraweehActive && (
              <FadeIn>
                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ramadan</p>
                      <p className="font-semibold text-gray-900 text-sm">Taraweeh</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{taraweehTime}</p>
                </div>
              </FadeIn>
            )}

            {/* Eid */}
            {eidFitrActive && (
              <FadeIn>
                <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Eid al-Fitr</p>
                      <p className="font-semibold text-gray-900 text-sm">Eid Prayer</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{eidFitrTime}</p>
                </div>
              </FadeIn>
            )}
            {eidAdhaActive && (
              <FadeIn>
                <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Eid al-Adha</p>
                      <p className="font-semibold text-gray-900 text-sm">Eid Prayer</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{eidAdhaTime}</p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </section>

      {/* Mosque Etiquette — compact 2-column checklist */}
      <section id="etiquette" className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mosque Etiquette
              </h2>
              <p className="text-gray-600 text-sm">
                Please observe these guidelines for a peaceful environment.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-3">
            {etiquetteItems.map((item) => {
              const Icon = etiquetteIcons[item.icon] || CheckCircle2;
              return (
                <FadeIn key={item.title}>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get Directions CTA */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span className="font-medium">{info.address.full}</span>
              </div>
              <a
                href="https://maps.app.goo.gl/DZUnHYjsaBvREAmw9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
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
