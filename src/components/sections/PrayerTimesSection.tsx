"use client";

import { useState } from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import { PrayerTimesCard } from "@/components/ui/PrayerTimesCard";
import { jumuahTimes } from "@/data/content";
import { Clock, ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react";

export function PrayerTimesSection() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
    // Format as YYYY-MM-DD for input element
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

  return (
    <section id="prayer-times" className="py-20 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L55 30L30 55L5 30z' fill='none' stroke='%2316a34a' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              {isToday(selectedDate) ? "Today's Prayer Times" : "Prayer Times"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Prayer Times for Newport, Melbourne
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

        <FadeIn delay={0.1}>
          <PrayerTimesCard
            variant="full"
            showIqamah={true}
            showArabic={true}
            highlightNext={true}
            selectedDate={selectedDate}
          />
        </FadeIn>

        {/* Jumu'ah Times */}
        <FadeIn delay={0.3}>
          <div className="mt-12 bg-gradient-to-r from-neutral-600 to-sage-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Friday Jumu&apos;ah Prayer</h3>
              <p className="text-white/80">Join us every Friday for congregational prayer</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {jumuahTimes.map((session) => (
                <div key={session.session} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <p className="text-white/70 text-sm mb-1">{session.language} Khutbah</p>
                  <p className="text-xl font-bold mb-1">{session.session}</p>
                  <p className="text-3xl font-bold text-teal-300">{session.time}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Times are calculated for Newport, VIC. Please arrive early for congregational prayer.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
