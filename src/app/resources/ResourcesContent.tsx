/**
 * Resources Content
 *
 * Client component rendering the resources listing page. Displays a
 * filterable, searchable grid of downloadable and linkable resources
 * (PDFs, audio, video, eBooks, external links). Includes category pills,
 * resource type tabs, and a search bar.
 *
 * @module app/resources/ResourcesContent
 */
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { SanityResource, SanitySimplePageSettings } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import { formatMelbourneDate } from "@/lib/time";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Image as ImageIcon,
  Library,
  Link as LinkIcon,
  Search,
  Video,
  X,
  Calendar,
  User,
  Clock,
  HardDrive,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Resource type configuration ────────────────────────────────────────────

interface ResourceTypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  badgeBg: string;
}

const RESOURCE_TYPE_CONFIG: Record<string, ResourceTypeConfig> = {
  pdf: {
    label: "PDF",
    icon: FileText,
    color: "text-red-600",
    bgColor: "bg-red-50",
    badgeBg: "bg-red-100 text-red-700",
  },
  audio: {
    label: "Audio",
    icon: Headphones,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    badgeBg: "bg-purple-100 text-purple-700",
  },
  video: {
    label: "Video",
    icon: Video,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  link: {
    label: "Link",
    icon: LinkIcon,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    badgeBg: "bg-teal-100 text-teal-700",
  },
  image: {
    label: "Image",
    icon: ImageIcon,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    badgeBg: "bg-amber-100 text-amber-700",
  },
  ebook: {
    label: "eBook",
    icon: BookOpen,
    color: "text-green-600",
    bgColor: "bg-green-50",
    badgeBg: "bg-green-100 text-green-700",
  },
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ur: "Urdu",
  tr: "Turkish",
  id: "Indonesian",
  multi: "Multilingual",
};

// ─── Helper functions ───────────────────────────────────────────────────────

function getResourceUrl(resource: SanityResource): string | null {
  return resource.fileUrl || resource.externalUrl || null;
}

function getResourceTypeConfig(type: string): ResourceTypeConfig {
  return RESOURCE_TYPE_CONFIG[type] || RESOURCE_TYPE_CONFIG.link;
}

function formatResourceDate(dateStr: string): string {
  return formatMelbourneDate(new Date(dateStr), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

interface ResourcesContentProps {
  resources: SanityResource[];
  pageSettings?: SanitySimplePageSettings | null;
}

export default function ResourcesContent({ resources, pageSettings }: ResourcesContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Extract unique categories from data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    resources.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    return Array.from(cats).sort();
  }, [resources]);

  // Extract unique resource types present in data
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    resources.forEach((r) => {
      if (r.resourceType) types.add(r.resourceType);
    });
    return Array.from(types).sort();
  }, [resources]);

  // Filter resources based on search, category, and type
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Category filter
      if (selectedCategory !== "all" && resource.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== "all" && resource.resourceType !== selectedType) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = resource.title.toLowerCase().includes(query);
        const descriptionMatch = resource.description?.toLowerCase().includes(query);
        const authorMatch = resource.author?.toLowerCase().includes(query);
        const tagsMatch = resource.tags?.some((tag) => tag.toLowerCase().includes(query));
        return titleMatch || descriptionMatch || authorMatch || tagsMatch;
      }

      return true;
    });
  }, [resources, searchQuery, selectedCategory, selectedType]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== "all" || selectedType !== "all";

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-teal-50/30 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
              <Library className="w-4 h-4" />
              {pageSettings?.heroBadge ?? "Resource Library"}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
              {pageSettings?.heroHeading ?? "Community"}{" "}
              {pageSettings?.heroHeadingAccent !== undefined ? (
                <span className="text-teal-600">{pageSettings.heroHeadingAccent}</span>
              ) : (
                <span className="text-teal-600">Resources</span>
              )}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              {pageSettings?.heroDescription ?? "Browse our collection of Islamic literature, audio lectures, video content, and educational materials. Download or access resources to support your learning journey."}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Content */}
      <section className="py-10 md:py-14 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          {resources.length === 0 ? (
            <EmptyLibrary />
          ) : (
            <>
              {/* Search Bar */}
              <FadeIn>
                <div className="mb-8">
                  <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resources by title, author, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-shadow"
                      aria-label="Search resources"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </FadeIn>

              {/* Category and Type Filters */}
              <FadeIn delay={0.05}>
                <div className="mb-8 space-y-4">
                  {/* Category Pills */}
                  {categories.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Category</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                            selectedCategory === "all"
                              ? "bg-[#01476b] text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          All
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                              selectedCategory === category
                                ? "bg-[#01476b] text-white"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource Type Pills */}
                  {availableTypes.length > 1 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Type</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedType("all")}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                            selectedType === "all"
                              ? "bg-[#01476b] text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          All Types
                        </button>
                        {availableTypes.map((type) => {
                          const config = getResourceTypeConfig(type);
                          const TypeIcon = config.icon;
                          return (
                            <button
                              key={type}
                              onClick={() => setSelectedType(type)}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                selectedType === type
                                  ? "bg-[#01476b] text-white"
                                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              )}
                            >
                              <TypeIcon className="w-3.5 h-3.5" />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {filteredResources.length === resources.length
                    ? `${resources.length} resource${resources.length !== 1 ? "s" : ""}`
                    : `${filteredResources.length} of ${resources.length} resource${resources.length !== 1 ? "s" : ""}`}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Resource Grid or Empty State */}
              {filteredResources.length === 0 ? (
                <NoResultsState onReset={resetFilters} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <FadeIn key={resource._id}>
                      <ResourceCard resource={resource} />
                    </FadeIn>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Resource Card ──────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: SanityResource }) {
  const config = getResourceTypeConfig(resource.resourceType);
  const TypeIcon = config.icon;
  const url = getResourceUrl(resource);
  const isExternal = !resource.fileUrl && !!resource.externalUrl;

  const thumbnailUrl = resource.thumbnail
    ? urlFor(resource.thumbnail).width(400).height(240).url()
    : null;

  const cardContent = (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
      {/* Thumbnail or Fallback */}
      <div className="relative h-44 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={resource.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center", config.bgColor)}>
            <TypeIcon className={cn("w-16 h-16 opacity-30", config.color)} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", config.badgeBg)}>
            <TypeIcon className="w-3 h-3" />
            {config.label}
          </span>
        </div>

        {/* Language Badge */}
        {resource.language && resource.language !== "en" && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm">
              <Globe className="w-3 h-3" />
              {LANGUAGE_LABELS[resource.language] || resource.language}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
            {resource.description}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
          {resource.author && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              {resource.author}
            </span>
          )}
          {resource.date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              {formatResourceDate(resource.date)}
            </span>
          )}
          {resource.fileSize && (
            <span className="inline-flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-gray-400" />
              {resource.fileSize}
            </span>
          )}
          {resource.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {resource.duration}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        {url ? (
          <span className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-600 group-hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm">
            {isExternal ? (
              <>
                View Resource
                <ExternalLink className="w-4 h-4" />
              </>
            ) : (
              <>
                Download
                <Download className="w-4 h-4" />
              </>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-500 font-semibold rounded-lg text-sm cursor-default">
            Not Available
          </span>
        )}
      </div>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
        aria-label={`${isExternal ? "View" : "Download"} ${resource.title}`}
      >
        {cardContent}
      </a>
    );
  }

  return <div className="h-full">{cardContent}</div>;
}

// ─── Empty States ───────────────────────────────────────────────────────────

function EmptyLibrary() {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
      <Library className="w-14 h-14 mx-auto text-gray-300 mb-5" />
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No Resources Available Yet</h3>
      <p className="text-gray-500 max-w-lg mx-auto">
        We&apos;re currently building our resource library. Check back soon for Islamic literature,
        audio lectures, video content, and educational materials.
      </p>
    </div>
  );
}

function NoResultsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
      <Search className="w-14 h-14 mx-auto text-gray-300 mb-5" />
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No Resources Found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        No resources match your current filters. Try adjusting your search or clearing the filters.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        Clear All Filters
      </button>
    </div>
  );
}
