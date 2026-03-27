/**
 * Dynamic CMS Page
 *
 * Server component that renders Sanity `pageContent` documents at their slug.
 * Supports hero images, rich-text content, flexible sections with image
 * positioning, and image galleries.
 *
 * @route /[slug]
 * @module app/[slug]/page
 */
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getPageContent,
  getPageContentBySlug,
} from "@/sanity/lib/fetch";
import { SanityPageContent } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = (await getPageContent()) as SanityPageContent[];
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = (await getPageContentBySlug(slug)) as SanityPageContent | null;

  if (!page) {
    return { title: "Page Not Found" };
  }

  const title = page.seo?.metaTitle || page.title;
  const description =
    page.seo?.metaDescription || page.introduction || undefined;
  const ogImage = page.seo?.ogImage
    ? urlFor(page.seo.ogImage).width(1200).height(630).url()
    : page.heroImage
      ? urlFor(page.heroImage).width(1200).height(630).url()
      : undefined;

  return {
    title: `${title} | Australian Islamic Centre`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = (await getPageContentBySlug(slug)) as SanityPageContent | null;

  if (!page || page.active === false) {
    notFound();
  }

  const heroImageUrl = page.heroImage
    ? urlFor(page.heroImage).width(1400).height(500).url()
    : null;

  return (
    <>
      {/* Hero Image Banner */}
      {heroImageUrl && (
        <section className="relative h-64 md:h-80 lg:h-96 bg-gray-900">
          <Image
            src={heroImageUrl}
            alt={page.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </section>
      )}

      {/* Page Header */}
      <section
        className={`${heroImageUrl ? "pt-6" : "pt-8"} pb-6 bg-white border-b border-gray-100`}
      >
        <div className="max-w-5xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-lg text-teal-600 font-medium">
                {page.subtitle}
              </p>
            )}
            {page.introduction && (
              <p className="text-base text-gray-500 max-w-2xl mt-2">
                {page.introduction}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-10 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          {/* Rich Text Content */}
          {page.content && page.content.length > 0 && (
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline mb-10">
              <PortableText value={page.content} />
            </div>
          )}

          {/* Content Sections */}
          {page.sections && page.sections.length > 0 && (
            <div className="space-y-12">
              {page.sections.map((section, index) => {
                const sectionImageUrl = section.image
                  ? urlFor(section.image).width(800).height(500).url()
                  : null;
                const isHorizontal =
                  section.imagePosition === "left" ||
                  section.imagePosition === "right";
                const imageFirst = section.imagePosition === "left" || section.imagePosition === "above";

                return (
                  <div
                    key={index}
                    className={
                      isHorizontal && sectionImageUrl
                        ? "grid md:grid-cols-2 gap-8 items-start"
                        : "space-y-4"
                    }
                  >
                    {/* Image — before content when position is left/above */}
                    {sectionImageUrl && imageFirst && (
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <Image
                          src={sectionImageUrl}
                          alt={section.title || `Section ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Text content */}
                    <div>
                      {section.title && (
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                          {section.title}
                        </h2>
                      )}
                      {section.content && section.content.length > 0 && (
                        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
                          <PortableText value={section.content} />
                        </div>
                      )}
                    </div>

                    {/* Image — after content when position is right/below */}
                    {sectionImageUrl && !imageFirst && (
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <Image
                          src={sectionImageUrl}
                          alt={section.title || `Section ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Image Gallery */}
          {page.gallery && page.gallery.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {page.gallery.map((image, index) => {
                  const galleryImageUrl = urlFor(image)
                    .width(600)
                    .height(400)
                    .url();
                  return (
                    <figure key={index} className="group">
                      <div className="relative aspect-[3/2] rounded-xl overflow-hidden">
                        <Image
                          src={galleryImageUrl}
                          alt={image.alt || `Gallery image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {image.caption && (
                        <figcaption className="text-sm text-gray-500 mt-2 text-center">
                          {image.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-10">
            <Button
              href="/"
              variant="ghost"
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
