import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEventBySlug, getEventsForStaticGeneration } from "@/sanity/lib/fetch";
import { SanityEvent } from "@/types/sanity";
import { formatDate } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Repeat,
  ExternalLink,
  Mail,
  Phone,
  Users,
  CheckCircle,
  Globe,
} from "lucide-react";
import { AddToCalendarButton } from "./AddToCalendarButton";

interface EventPageProps {
  params: Promise<{ slug: string }>;
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

  const ogImage = event.image ? urlFor(event.image).width(1200).height(630).url() : undefined;

  return {
    title: event.title,
    description: event.shortDescription || event.description,
    openGraph: {
      title: event.title,
      description: event.shortDescription || event.description,
      type: "article",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) as SanityEvent | null;

  if (!event) {
    notFound();
  }

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

  const heroImageUrl = event.image
    ? urlFor(event.image).width(1200).height(500).url()
    : null;

  return (
    <>
      {/* Hero Image Banner */}
      {heroImageUrl && (
        <section className="relative h-64 md:h-80 lg:h-96 bg-gray-900">
          <Image
            src={heroImageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </section>
      )}

      {/* Page Header */}
      <section className={`${heroImageUrl ? 'pt-6' : 'pt-8'} pb-8 bg-white`}>
        <div className="max-w-4xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
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
              {event.ageGroup && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  <Users className="w-4 h-4" />
                  {event.ageGroup}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            {event.shortDescription && (
              <p className="text-lg text-gray-600 max-w-2xl">
                {event.shortDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Event Content */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">

          {/* Event Details Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-sm border border-gray-100">
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

          {/* Key Features / Highlights */}
          {event.features && event.features.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {event.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Information */}
          {(event.contactEmail || event.contactPhone) && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
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

            {/* External Link / Website Button */}
            {event.externalLink && (
              <Button
                href={event.externalLink}
                variant="outline"
                icon={<Globe className="w-5 h-5" />}
                target="_blank"
              >
                Visit Website
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
