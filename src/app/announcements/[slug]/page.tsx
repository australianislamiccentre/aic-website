import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAnnouncementBySlug, getAnnouncementsForStaticGeneration } from "@/sanity/lib/fetch";
import { SanityAnnouncement } from "@/types/sanity";
import { formatDate } from "@/lib/utils";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
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

  return {
    title: `${announcement.title} | Australian Islamic Centre`,
    description: announcement.excerpt,
    openGraph: {
      title: announcement.title,
      description: announcement.excerpt,
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

  const isHighlighted = announcement.priority === "important" || announcement.priority === "urgent";
  const categoryStyles = getCategoryStyles(announcement.category);

  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
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
              <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${categoryStyles}`}>
                {announcement.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {announcement.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>{formatDate(announcement.date)}</span>
              {announcement.expiresAt && (
                <span className="text-sm text-gray-500 ml-2">
                  · Valid until {formatDate(announcement.expiresAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Announcement Content */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          {/* Excerpt */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
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
