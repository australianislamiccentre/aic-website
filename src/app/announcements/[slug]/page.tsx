import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAnnouncementBySlug, getAnnouncementsForStaticGeneration } from "@/sanity/lib/fetch";
import { SanityAnnouncement } from "@/types/sanity";
import { formatDate } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PortableText } from "@portabletext/react";
import { ShareButton } from "./ShareButton";
import Image from "next/image";
import {
  Calendar,
  ArrowLeft,
  AlertTriangle,
  Tag,
  Clock,
  ExternalLink,
} from "lucide-react";

interface AnnouncementPageProps {
  params: Promise<{ slug: string }>;
}

// Category styling
function getCategoryStyles(category: string) {
  switch (category) {
    case "Prayer":
      return "bg-green-100 text-green-700";
    case "Ramadan":
    case "Eid":
      return "bg-purple-100 text-purple-700";
    case "Education":
      return "bg-blue-100 text-blue-700";
    case "Youth":
      return "bg-orange-100 text-orange-700";
    case "Sisters":
    case "Women":
      return "bg-pink-100 text-pink-700";
    case "Maintenance":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-teal-100 text-teal-700";
  }
}

// Get call-to-action href
function getCtaHref(cta: SanityAnnouncement["callToAction"]): string | null {
  if (!cta?.label) return null;
  if (cta.linkType === "internal" && cta.internalPage) return cta.internalPage;
  if (cta.linkType === "external" && cta.url) return cta.url;
  if (cta.url) return cta.url;
  return null;
}

// Generate static params for all announcements
export async function generateStaticParams() {
  const announcements = (await getAnnouncementsForStaticGeneration()) as SanityAnnouncement[];
  return announcements.map((announcement) => ({
    slug: announcement.slug || announcement._id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AnnouncementPageProps): Promise<Metadata> {
  const { slug } = await params;
  const announcement = (await getAnnouncementBySlug(slug)) as SanityAnnouncement | null;

  if (!announcement) {
    return {
      title: "Announcement Not Found",
    };
  }

  const ogImage = announcement.image ? urlFor(announcement.image).width(1200).height(630).url() : undefined;

  return {
    title: `${announcement.title} | Australian Islamic Centre`,
    description: announcement.excerpt,
    openGraph: {
      title: announcement.title,
      description: announcement.excerpt,
      type: "article",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
  };
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { slug } = await params;
  const announcement = (await getAnnouncementBySlug(slug)) as SanityAnnouncement | null;

  if (!announcement) {
    notFound();
  }

  const isHighlighted = announcement.priority === "important" || announcement.priority === "urgent";
  const categoryStyles = getCategoryStyles(announcement.category);
  const heroImageUrl = announcement.image
    ? urlFor(announcement.image).width(1200).height(500).url()
    : null;
  const ctaHref = getCtaHref(announcement.callToAction);
  const isExternalCta = announcement.callToAction?.linkType === "external";

  return (
    <>
      {/* Hero Image Banner */}
      {heroImageUrl && (
        <section className="relative h-64 md:h-80 lg:h-96 bg-gray-900">
          <Image
            src={heroImageUrl}
            alt={announcement.title}
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
              {isHighlighted && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                  announcement.priority === "urgent"
                    ? "bg-red-500 text-white"
                    : "bg-amber-500 text-white"
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {announcement.priority === "urgent" ? "Urgent" : "Important"}
                </span>
              )}
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${categoryStyles}`}>
                {announcement.category}
              </span>
              {announcement.tags?.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {announcement.title}
            </h1>
            {announcement.excerpt && (
              <p className="text-base text-gray-500 max-w-2xl">
                {announcement.excerpt}
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
            <div className="lg:col-span-2">
              {announcement.content && announcement.content.length > 0 ? (
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
                  <PortableText value={announcement.content} />
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {announcement.excerpt}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column — Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-5">

                {/* Details Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Details</h3>
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(announcement.date)}</p>
                      </div>
                    </div>

                    {/* Expiry */}
                    {announcement.expiresAt && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Valid until</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(announcement.expiresAt)}</p>
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-gray-900">{announcement.category}</p>
                    </div>

                    {/* Priority */}
                    {isHighlighted && (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className={`text-sm font-semibold ${announcement.priority === "urgent" ? "text-red-600" : "text-amber-600"}`}>
                          {announcement.priority === "urgent" ? "Urgent" : "Important"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call to Action Card */}
                {ctaHref && announcement.callToAction?.label && (
                  <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                    <Button
                      href={ctaHref}
                      variant="primary"
                      icon={isExternalCta ? <ExternalLink className="w-4 h-4" /> : undefined}
                      target={isExternalCta ? "_blank" : undefined}
                      className="w-full"
                    >
                      {announcement.callToAction.label}
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <ShareButton title={announcement.title} text={announcement.excerpt} />

                  <Button
                    href="/announcements"
                    variant="ghost"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    iconPosition="left"
                    className="w-full"
                  >
                    All Announcements
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
