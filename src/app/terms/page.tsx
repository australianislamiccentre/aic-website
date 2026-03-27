/**
 * Terms of Use Page
 *
 * Server component that fetches terms page content from Sanity.
 * Falls back to hardcoded TermsContent if no Sanity document exists.
 *
 * @route /terms
 * @module app/terms/page
 */
import type { Metadata } from "next";
import { getPageContentBySlug } from "@/sanity/lib/fetch";
import { SanityPageContent } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/PortableTextComponents";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import TermsContent from "./TermsContent";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getPageContentBySlug("terms")) as SanityPageContent | null;

  if (page?.seo) {
    const ogImage = page.seo.ogImage
      ? urlFor(page.seo.ogImage).width(1200).height(630).url()
      : undefined;
    return {
      title: page.seo.metaTitle || page.title || "Terms of Use",
      description: page.seo.metaDescription || "Terms of use for the Australian Islamic Centre website.",
      alternates: { canonical: "/terms" },
      openGraph: {
        title: page.seo.metaTitle || page.title,
        description: page.seo.metaDescription,
        ...(ogImage && { images: [{ url: ogImage }] }),
      },
    };
  }

  return {
    title: "Terms of Use",
    description: "Terms of use for the Australian Islamic Centre website.",
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const page = (await getPageContentBySlug("terms")) as SanityPageContent | null;

  if (!page || page.active === false) {
    return <TermsContent />;
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
