import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getEventBySlug, getEventsForStaticGeneration } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { SanityEvent, SanityImage } from "@/types/sanity";
import { formatDate } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Repeat,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import { AddToCalendarButton } from "./AddToCalendarButton";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

// Helper to get image URL
function getImageUrl(image: SanityImage | string | undefined): string {
  if (!image) return "/images/aic 1.jpg";
  if (typeof image === "string") return image;
  return urlFor(image).width(1200).height(600).url();
}

// Generate static params for all events (uses non-draft-mode fetch)
export async function generateStaticParams() {
  const events = (await getEventsForStaticGeneration()) as SanityEvent[];
  return events.map((event) => ({
    slug: event.slug || event._id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) as SanityEvent | null;

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  const imageUrl = getImageUrl(event.image);

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [imageUrl],
      type: "article",
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) as SanityEvent | null;

  if (!event) {
    notFound();
  }

  const imageUrl = getImageUrl(event.image);
  const isRecurring = event.recurring;

  // Format the date display
  const getDateDisplay = () => {
    if (isRecurring) {
      return event.recurringDay || "Weekly";
    }
    if (event.date) {
      if (event.endDate && event.endDate !== event.date) {
        return `${formatDate(event.date)} - ${formatDate(event.endDate)}`;
      }
      return formatDate(event.date);
    }
    return "Date TBA";
  };

  // Format time display
  const getTimeDisplay = () => {
    if (event.time) {
      if (event.endTime) {
        return `${event.time} - ${event.endTime}`;
      }
      return event.time;
    }
    return "Time TBA";
  };

  // Get recurring end date display
  const getRecurringEndDisplay = () => {
    if (isRecurring && event.recurringEndDate) {
      return `Until ${formatDate(event.recurringEndDate)}`;
    }
    return null;
  };

  return (
    <>
      {/* Hero Section with Event Image */}
      <section className="relative h-[40vh] md:h-[50vh] min-h-[300px]">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-24 left-6 z-10">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>

        {/* Category Badges */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-wrap items-center gap-2">
          {isRecurring && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full">
              <Repeat className="w-4 h-4" />
              Recurring
            </span>
          )}
          {event.categories?.map((cat, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-amber-500 text-white text-sm font-semibold rounded-full">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Event Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {event.title}
          </h1>

          {/* Event Details Card */}
          <div className="bg-neutral-50 rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {isRecurring ? "Schedule" : "Date"}
                  </p>
                  <p className="font-semibold text-gray-900">{getDateDisplay()}</p>
                  {getRecurringEndDisplay() && (
                    <p className="text-sm text-gray-500 mt-1">{getRecurringEndDisplay()}</p>
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time</p>
                  <p className="font-semibold text-gray-900">{getTimeDisplay()}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  {event.locationDetails && (
                    <p className="font-semibold text-gray-900">{event.locationDetails}</p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${event.locationDetails ? 'text-sm text-teal-600 hover:text-teal-700' : 'font-semibold text-teal-600 hover:text-teal-700'} hover:underline transition-colors`}
                  >
                    {event.location}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-lg max-w-none mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Contact Information */}
          {(event.contactEmail || event.contactPhone) && (
            <div className="bg-neutral-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="flex flex-wrap gap-6">
                {event.contactEmail && (
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    {event.contactEmail}
                  </a>
                )}
                {event.contactPhone && (
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    {event.contactPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            {/* Registration/RSVP Button */}
            {event.registrationUrl && (
              <Button
                href={event.registrationUrl}
                variant="primary"
                icon={<ExternalLink className="w-5 h-5" />}
                target="_blank"
              >
                Register / RSVP
              </Button>
            )}

            {/* Add to Calendar - only for non-recurring events with dates */}
            {!isRecurring && event.date && (
              <AddToCalendarButton event={event} />
            )}

            <Button
              href="/events"
              variant="outline"
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Related Events Section */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">More Events</h2>
          <p className="text-gray-600 mb-6">
            Discover other events and programs at the Australian Islamic Centre.
          </p>
          <Button href="/events" variant="primary">
            View All Events
          </Button>
        </div>
      </section>
    </>
  );
}
