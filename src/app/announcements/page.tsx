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
