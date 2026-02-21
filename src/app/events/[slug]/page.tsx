import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEventBySlug, getEventsForStaticGeneration, getAllowedEmbedDomains } from "@/sanity/lib/fetch";
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
  Sparkles,
} from "lucide-react";
import { AddToCalendarButton } from "./AddToCalendarButton";
import { EventContactForm } from "./EventContactForm";
import { FormEmbedSection } from "./FormEmbed";

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

  // Fetch allowed embed domains in parallel (only needed if event has an embed form)
  const allowedDomains = event.formType === "embed" && event.embedFormUrl
    ? await getAllowedEmbedDomains()
    : [];

  const isRecurring = event.eventType === "recurring";

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
      <section className={`${heroImageUrl ? 'pt-6' : 'pt-8'} pb-6 bg-white border-b border-gray-100`}>
        <div className="max-w-5xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {isRecurring && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                  <Repeat className="w-3.5 h-3.5" />
                  Recurring
                </span>
              )}
              {event.categories?.map((cat, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                  {cat}
                </span>
              ))}
              {event.ageGroup && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  {event.ageGroup}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {event.title}
            </h1>
            {event.shortDescription && (
              <p className="text-base text-gray-500 max-w-2xl">
                {event.shortDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content — 2 column layout */}
      <section className="py-8 md:py-10 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column — Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Key Features — quick highlights */}
              {event.keyFeatures && event.keyFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.keyFeatures.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-full border border-teal-100"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {/* About This Event */}
              {event.description && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              )}

              {/* What to Expect */}
              {event.features && event.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What to Expect</h3>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {event.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column — Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-5">

                {/* Event Details Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Event Details</h3>
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getDateDisplay()}</p>
                        {getRecurringEndDisplay() && (
                          <p className="text-xs text-gray-400 mt-0.5">{getRecurringEndDisplay()}</p>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-gray-900">{getTimeDisplay()}</p>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        {event.locationDetails && (
                          <p className="text-sm font-semibold text-gray-900">{event.locationDetails}</p>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm ${event.locationDetails ? 'text-teal-600' : 'font-semibold text-teal-600'} hover:text-teal-700 hover:underline transition-colors`}
                        >
                          {event.location}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Card */}
                {(event.contactEmail || event.contactPhone) && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact</h3>
                    <div className="space-y-3">
                      {event.contactEmail && (
                        <a
                          href={`mailto:${event.contactEmail}`}
                          className="flex items-center gap-2.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{event.contactEmail}</span>
                        </a>
                      )}
                      {event.contactPhone && (
                        <a
                          href={`tel:${event.contactPhone}`}
                          className="flex items-center gap-2.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          {event.contactPhone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  {event.registrationUrl && (
                    <Button
                      href={event.registrationUrl}
                      variant="primary"
                      icon={<ExternalLink className="w-4 h-4" />}
                      target="_blank"
                      className="w-full"
                    >
                      Register / RSVP
                    </Button>
                  )}

                  {event.externalLink && (
                    <Button
                      href={event.externalLink}
                      variant="outline"
                      icon={<Globe className="w-4 h-4" />}
                      target="_blank"
                      className="w-full"
                    >
                      Visit Website
                    </Button>
                  )}

                  {!isRecurring && event.date && (
                    <AddToCalendarButton event={event} />
                  )}

                  <Button
                    href="/events"
                    variant="ghost"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    iconPosition="left"
                    className="w-full"
                  >
                    All Events
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inline contact form — full width below main content */}
      {event.formType === "contact" && (
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-xl mx-auto px-6 py-10">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Enquire About This Event</h2>
            <p className="text-sm text-gray-500 mb-6 text-center">Have a question? Send us a message and we&apos;ll get back to you.</p>
            <EventContactForm
              eventName={event.title}
              contactEmail={event.contactEmail}
            />
          </div>
        </section>
      )}

      {/* Inline form embed — full width below main content */}
      {event.formType === "embed" && event.embedFormUrl && (
        <FormEmbedSection url={event.embedFormUrl} allowedDomains={allowedDomains} />
      )}
    </>
  );
}
