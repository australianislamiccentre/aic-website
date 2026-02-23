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
import { getAnnouncements } from "@/sanity/lib/fetch";
import { SanityAnnouncement } from "@/types/sanity";
import AnnouncementsContent from "./AnnouncementsContent";

export const metadata = {
  title: "Announcements | Australian Islamic Centre",
  description: "Stay informed about important updates, community news, and upcoming activities at the Australian Islamic Centre.",
};

export default async function AnnouncementsPage() {
  const announcements = (await getAnnouncements()) as SanityAnnouncement[];

  return <AnnouncementsContent announcements={announcements} />;
}
