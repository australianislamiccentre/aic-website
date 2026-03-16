import type { MetadataRoute } from "next";
import { getEventsForStaticGeneration, getAnnouncements, getServices } from "@/sanity/lib/fetch";
import type { SanityEvent, SanityAnnouncement, SanityService } from "@/types/sanity";

const BASE_URL = "https://australianislamiccentre.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/services`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/announcements`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/donate`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/visit`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/worshippers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/media`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/resources`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/imams`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/architecture`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/partners`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/accessibility`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic routes from Sanity
  const [events, announcements, services] = await Promise.all([
    getEventsForStaticGeneration(),
    getAnnouncements(),
    getServices(),
  ]);

  const eventRoutes: MetadataRoute.Sitemap = ((events || []) as SanityEvent[]).map((event) => ({
    url: `${BASE_URL}/events/${event.slug || event._id}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const announcementRoutes: MetadataRoute.Sitemap = ((announcements || []) as SanityAnnouncement[]).map((a) => ({
    url: `${BASE_URL}/announcements/${a.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = ((services || []) as SanityService[]).map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...eventRoutes, ...announcementRoutes, ...serviceRoutes];
}
