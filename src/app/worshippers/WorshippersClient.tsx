"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { jumuahTimes, mosqueEtiquette, aicInfo, services, upcomingEvents } from "@/data/content";
import { getPrayerTimesForDate } from "@/lib/prayer-times";
import { TARAWEEH_CONFIG, EID_CONFIG } from "@/lib/prayer-config";
import type { SanityPrayerSettings } from "@/types/sanity";
import {
  Clock,
  MapPin,
  Users,
  Heart,
  ArrowRight,
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

const etiquetteIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  shirt: Shirt,
  volume: Volume2,
  hands: HandHeart,
  droplets: Droplets,
  help: HelpCircle,
};

interface WorshippersClientProps {
  prayerSettings?: SanityPrayerSettings | null;
}

export default function WorshippersClient({ prayerSettings }: WorshippersClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const prayerTimes = getPrayerTimesForDate(selectedDate);

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
      <section id="prayers" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
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

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-12">
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
                <strong>Location:</strong> {aicInfo.address.full}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Jumu'ah Section */}
      <section id="jumuah" className="py-20 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-200 text-sm font-medium mb-6">
                  <Calendar className="w-4 h-4" />
                  Every Friday
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Friday Jumu&apos;ah Prayer
                </h2>
                <p className="text-white/80 text-lg mb-8 leading-relaxed">
                  Join us every Friday for congregational prayer. We offer two sessions to
                  accommodate our growing community - an Arabic khutbah session and an English
                  khutbah session.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Inspiring khutbahs on contemporary and spiritual topics",
                    "Large prayer hall with ample space",
                    "Separate women's prayer area",
                    "Free parking available",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="grid gap-6">
                {jumuahTimes.map((session) => (
                  <motion.div
                    key={session.session}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-8 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{session.language} Khutbah</p>
                        <h3 className="text-xl font-bold text-gray-900">{session.session}</h3>
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-neutral-700">{session.time}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Taraweeh Section - Only during Ramadan */}
      {taraweehActive && (
        <section id="taraweeh" className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-purple-200 text-sm font-medium mb-6">
                  <Star className="w-4 h-4" />
                  Ramadan Special
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Taraweeh Prayers
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                  Join us every night during Ramadan for Taraweeh prayers after Isha.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="inline-block bg-white rounded-2xl p-8 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Moon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500 mb-1">Every Night</p>
                      <p className="text-4xl font-bold text-gray-900">{taraweehTime}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Eid Section - Only when Eid is active */}
      {(eidFitrActive || eidAdhaActive) && (
        <section id="eid" className="py-16 bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-amber-100 text-sm font-medium mb-6">
                  <Star className="w-4 h-4" />
                  Special Occasion
                </div>
                {eidFitrActive && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Eid al-Fitr Prayer
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                      Eid Mubarak! Join us to celebrate the end of Ramadan with the community.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="inline-block bg-white rounded-2xl p-8 shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-500 mb-1">Eid al-Fitr Prayer</p>
                          <p className="text-4xl font-bold text-gray-900">{eidFitrTime}</p>
                          <p className="text-sm text-amber-600 font-medium">Main Prayer Hall & Courtyard</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
                {eidAdhaActive && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Eid al-Adha Prayer
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                      Eid Mubarak! Join us to celebrate Eid al-Adha with the community.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="inline-block bg-white rounded-2xl p-8 shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-500 mb-1">Eid al-Adha Prayer</p>
                          <p className="text-4xl font-bold text-gray-900">{eidAdhaTime}</p>
                          <p className="text-sm text-amber-600 font-medium">Main Prayer Hall & Courtyard</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Mosque Etiquette Section */}
      <section id="etiquette" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                <Heart className="w-4 h-4" />
                Mosque Etiquette
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Guidelines for Worshippers
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Please observe these guidelines to ensure a peaceful and respectful environment for all.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mosqueEtiquette.map((item) => {
              const Icon = etiquetteIcons[item.icon] || CheckCircle2;
              return (
                <StaggerItem key={item.title}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-neutral-50 rounded-xl p-6 border border-gray-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Religious Programs Section */}
      <section id="programs" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Religious Programs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Grow Your Faith
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our educational and spiritual programs designed to deepen your understanding of Islam.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.filter(e => e.category === "Education" || e.category === "Prayer").slice(0, 6).map((event) => (
              <StaggerItem key={event.id}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg"
                >
                  <div className="relative h-48">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-medium">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.3}>
            <div className="text-center mt-12">
              <Button href="/programs" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
                View All Programs
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services Quick Links */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Services
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We offer a range of religious services to support our community members.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <StaggerItem key={service.id}>
                <Link href={`/services#${service.id}`}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-neutral-50 rounded-xl p-6 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all cursor-pointer"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                    <div className="mt-4 flex items-center text-teal-600 text-sm font-medium">
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Getting to AIC */}
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-6">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Getting to AIC
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  The Australian Islamic Centre is conveniently located in Newport, Melbourne,
                  with easy access by car and public transport.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                    <p className="text-white/90">{aicInfo.address.full}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                    <p className="text-white/90">Open from Fajr to Isha daily</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button
                    href={`https://maps.google.com/?q=${encodeURIComponent(aicInfo.address.full)}`}
                    variant="gold"
                    icon={<MapPin className="w-5 h-5" />}
                  >
                    Get Directions
                  </Button>
                  <Button href="/visit" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Plan Your Visit
                  </Button>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                <Image
                  src="/images/aic end.jpg"
                  alt="Australian Islamic Centre"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
