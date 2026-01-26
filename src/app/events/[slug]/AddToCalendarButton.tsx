"use client";

import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SanityEvent } from "@/types/sanity";

interface AddToCalendarButtonProps {
  event: SanityEvent;
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const [showModal, setShowModal] = useState(false);

  // Format date for calendar (YYYYMMDD format)
  const formatCalendarDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  // Parse time string to get hours and minutes
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (!match) return { hours: 9, minutes: 0 };

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2] || "0");
    const period = match[3]?.toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  };

  // Create calendar event URL for Google Calendar
  const getGoogleCalendarUrl = () => {
    if (!event.date) return "#";

    const { hours, minutes } = parseTime(event.time || "9:00 AM");
    const startDate = new Date(event.date);
    startDate.setHours(hours, minutes, 0, 0);

    // Default duration of 2 hours
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${formatCalendarDate(startDate.toISOString())}/${formatCalendarDate(endDate.toISOString())}`,
      details: event.description || "",
      location: `${event.location}, Australian Islamic Centre, 23-27 Blenheim Rd, Newport VIC 3015`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Create iCal file content
  const generateICalContent = () => {
    if (!event.date) return "";

    const { hours, minutes } = parseTime(event.time || "9:00 AM");
    const startDate = new Date(event.date);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const formatICalDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Australian Islamic Centre//Events//EN
BEGIN:VEVENT
UID:${event._id}@australianislamiccentre.org
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}
LOCATION:${event.location}, Australian Islamic Centre, 23-27 Blenheim Rd, Newport VIC 3015
END:VEVENT
END:VCALENDAR`;

    return icalContent;
  };

  // Download iCal file
  const downloadICalFile = () => {
    const icalContent = generateICalContent();
    const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowModal(false);
  };

  // Create Outlook Web calendar URL
  const getOutlookUrl = () => {
    if (!event.date) return "#";

    const { hours, minutes } = parseTime(event.time || "9:00 AM");
    const startDate = new Date(event.date);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: event.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: event.description || "",
      location: `${event.location}, Australian Islamic Centre`,
    });

    return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
  };

  return (
    <>
      <Button
        variant="primary"
        icon={<CalendarPlus className="w-5 h-5" />}
        onClick={() => setShowModal(true)}
      >
        Add to Calendar
      </Button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add to Calendar
            </h3>
            <p className="text-gray-600 mb-6">
              Choose your calendar application:
            </p>

            <div className="space-y-3">
              {/* Google Calendar */}
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setShowModal(false)}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-900">Google Calendar</span>
              </a>

              {/* Apple Calendar / iCal */}
              <button
                onClick={downloadICalFile}
                className="flex items-center gap-3 w-full p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#000" strokeWidth="2" />
                  <path d="M3 10h18" stroke="#000" strokeWidth="2" />
                  <path d="M8 2v4M16 2v4" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-medium text-gray-900">Apple Calendar / iCal</span>
              </button>

              {/* Outlook */}
              <a
                href={getOutlookUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setShowModal(false)}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#0078D4"
                    d="M24 7.387v10.478c0 .23-.08.424-.238.576-.16.152-.353.228-.581.228h-8.322v-6.94l1.907 1.39a.27.27 0 0 0 .334-.003.268.268 0 0 0 .088-.133l.018-.036.59-1.583-2.937-2.14v-2.31h8.322c.228 0 .422.076.58.228.16.152.239.346.239.577v-.332zM14.859 12.73l-2.954 2.154a.277.277 0 0 1-.17.053.277.277 0 0 1-.17-.053L8.61 12.73v5.939h6.249v-5.94zm-3.124-1.396l6.05 4.409-.018-.036-.59-1.583-2.506-1.827v-.003l-2.936-2.14a.268.268 0 0 0-.334.003.277.277 0 0 0-.088.133l-.578 1.547v-.503zM0 4.91v14.18L9.818 22V2L0 4.91zm6.14 9.652c-.335.444-.774.666-1.318.666-.544 0-.983-.222-1.318-.666-.335-.444-.502-.989-.502-1.636 0-.647.167-1.192.502-1.636.335-.444.774-.666 1.318-.666.544 0 .983.222 1.318.666.335.444.502.989.502 1.636 0 .647-.167 1.192-.502 1.636z"
                  />
                </svg>
                <span className="font-medium text-gray-900">Outlook</span>
              </a>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
