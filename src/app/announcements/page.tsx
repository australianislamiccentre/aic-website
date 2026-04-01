/**
 * Announcements Listing Page
 *
 * Server component that fetches all announcements from Sanity and passes
 * them to the AnnouncementsContent client component for category filtering,
 * search, and display.
 *
 * @route /announcements
 * @module app/announcements/page
 */
import type { Metadata } from "next";
import { getAnnouncements, getAnnouncementsPageSettings } from "@/sanity/lib/fetch";
import { SanityAnnouncement } from "@/types/sanity";
import AnnouncementsContent from "./AnnouncementsContent";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAnnouncementsPageSettings();
  return {
    title: settings?.seo?.title ?? "Announcements | Australian Islamic Centre",
    description: settings?.seo?.description ?? "Stay informed about important updates, community news, and upcoming activities at the Australian Islamic Centre.",
  };
}

export default async function AnnouncementsPage() {
  const [announcements, settings] = await Promise.all([
    getAnnouncements() as Promise<SanityAnnouncement[]>,
    getAnnouncementsPageSettings(),
  ]);

  return <AnnouncementsContent announcements={announcements} pageSettings={settings} />;
}
