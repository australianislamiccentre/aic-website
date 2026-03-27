/**
 * Accessibility Statement Page
 *
 * Server component that fetches accessibility page content from Sanity.
 * Falls back to hardcoded AccessibilityContent if no Sanity document exists.
 *
 * @route /accessibility
 * @module app/accessibility/page
 */
import type { Metadata } from "next";
import { getPageContentBySlug } from "@/sanity/lib/fetch";
import { SanityPageContent } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/PortableTextComponents";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import AccessibilityContent from "./AccessibilityContent";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getPageContentBySlug("accessibility")) as SanityPageContent | null;

  if (page?.seo) {
    const ogImage = page.seo.ogImage
      ? urlFor(page.seo.ogImage).width(1200).height(630).url()
      : undefined;
    return {
      title: page.seo.metaTitle || page.title || "Accessibility Statement",
      description: page.seo.metaDescription || "Accessibility statement for the Australian Islamic Centre website, outlining our commitment to WCAG 2.1 AA compliance.",
      alternates: { canonical: "/accessibility" },
      openGraph: {
        title: page.seo.metaTitle || page.title,
        description: page.seo.metaDescription,
        ...(ogImage && { images: [{ url: ogImage }] }),
      },
    };
  }

  return {
    title: "Accessibility Statement",
    description: "Accessibility statement for the Australian Islamic Centre website, outlining our commitment to WCAG 2.1 AA compliance.",
    alternates: { canonical: "/accessibility" },
  };
}

export default async function AccessibilityPage() {
  const page = (await getPageContentBySlug("accessibility")) as SanityPageContent | null;

  if (!page || page.active === false) {
    return <AccessibilityContent />;
  }

  return (
    <>
      <section className="bg-gradient-to-br from-neutral-50 via-white to-teal-50/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <BreadcrumbLight />
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="mt-2 text-gray-500 text-sm">{page.subtitle}</p>
          )}
          {page.introduction && (
            <p className="mt-2 text-gray-500">{page.introduction}</p>
          )}
        </div>
      </section>

      {page.content && page.content.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
            <PortableText value={page.content} components={portableTextComponents} />
          </div>
        </section>
      )}
    </>
  );
}
