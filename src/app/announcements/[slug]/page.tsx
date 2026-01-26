import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAnnouncementBySlug, getAnnouncementsForStaticGeneration } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { SanityAnnouncement, SanityImage } from "@/types/sanity";
import { formatDate } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PortableText } from "@portabletext/react";
import { ShareButton } from "./ShareButton";
import {
  Calendar,
  ArrowLeft,
  AlertTriangle,
  Bell,
} from "lucide-react";

interface AnnouncementPageProps {
  params: Promise<{ slug: string }>;
}

// Helper to get image URL
function getImageUrl(image: SanityImage | undefined): string | null {
  if (!image) return null;
  return urlFor(image).width(1200).height(600).url();
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
    case "Maintenance":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-teal-100 text-teal-700";
  }
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

  const imageUrl = getImageUrl(announcement.image);

  return {
    title: `${announcement.title} | Australian Islamic Centre`,
    description: announcement.excerpt,
    openGraph: {
      title: announcement.title,
      description: announcement.excerpt,
      images: imageUrl ? [imageUrl] : [],
      type: "article",
    },
  };
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { slug } = await params;
  const announcement = (await getAnnouncementBySlug(slug)) as SanityAnnouncement | null;

  if (!announcement) {
    notFound();
  }

  const imageUrl = getImageUrl(announcement.image);
  const isHighlighted = announcement.priority === "important" || announcement.priority === "urgent";
  const categoryStyles = getCategoryStyles(announcement.category);

  return (
    <>
      {/* Hero Section */}
      <section className={`relative ${imageUrl ? 'h-[40vh] md:h-[50vh] min-h-[300px]' : 'py-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-900'}`}>
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={announcement.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-24 left-6 z-10">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Announcements
          </Link>
        </div>

        {/* Priority and Category Badges */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-wrap items-center gap-2">
          {isHighlighted && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full ${
              announcement.priority === "urgent"
                ? "bg-red-500 text-white"
                : "bg-amber-500 text-white"
            }`}>
              <AlertTriangle className="w-4 h-4" />
              {announcement.priority === "urgent" ? "Urgent" : "Important"}
            </span>
          )}
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${imageUrl ? 'bg-white/90' : ''} ${categoryStyles}`}>
            {announcement.category}
          </span>
        </div>
      </section>

      {/* Announcement Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {announcement.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>{formatDate(announcement.date)}</span>
            </div>
            {announcement.expiresAt && (
              <div className="text-sm text-gray-500">
                Valid until {formatDate(announcement.expiresAt)}
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-neutral-50 rounded-xl p-6 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              {announcement.excerpt}
            </p>
          </div>

          {/* Full Content */}
          {announcement.content && announcement.content.length > 0 && (
            <div className="prose prose-lg max-w-none mb-8">
              <PortableText value={announcement.content} />
            </div>
          )}

          {/* Share and Actions */}
          <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-200">
            <ShareButton title={announcement.title} text={announcement.excerpt} />

            <Button
              href="/announcements"
              variant="outline"
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              All Announcements
            </Button>
          </div>
        </div>
      </section>

      {/* More Announcements Section */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Check out more announcements and community news from the Australian Islamic Centre.
          </p>
          <Button href="/announcements" variant="primary" icon={<Bell className="w-5 h-5" />}>
            View All Announcements
          </Button>
        </div>
      </section>
    </>
  );
}
