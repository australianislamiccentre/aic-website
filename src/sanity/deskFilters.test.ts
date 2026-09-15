import { describe, it, expect } from "vitest";
import { parse, evaluate } from "groq-js";
import {
  expiredEventsFilter,
  liveEventsFilter,
  liveProgramsFilter,
  activeAnnouncementsFilter,
  expiredAnnouncementsFilter,
} from "./deskFilters";
import { eventsQuery } from "./lib/queries";

const today = "2026-09-15";

const events = [
  { _id: "single-past", eventType: "single", displayAs: "event", date: "2026-05-15" },
  { _id: "single-today", eventType: "single", displayAs: "event", date: "2026-09-15" },
  { _id: "multi-ended", eventType: "multi", displayAs: "event", date: "2026-07-10", endDate: "2026-07-12" },
  { _id: "multi-ongoing", eventType: "multi", displayAs: "both", date: "2026-09-14", endDate: "2026-09-16" },
  { _id: "recurring-open", eventType: "recurring", displayAs: "program", recurringDay: "Fridays" },
  { _id: "recurring-ended", eventType: "recurring", displayAs: "program", recurringEndDate: "2026-08-01" },
  { _id: "one-off-program-past", eventType: "single", displayAs: "program", date: "2026-05-24" },
  { _id: "inactive-past", eventType: "single", displayAs: "event", date: "2026-05-15", active: false },
].map((doc) => ({ _type: "event", active: true, ...doc }));

async function idsMatching(filter: string): Promise<string[]> {
  const params = { today };
  const value = await evaluate(parse(`*[${filter}]._id`, { params }), { dataset: events, params });
  return ((await value.get()) as string[]).sort();
}

describe("Studio Events desk filters", () => {
  it("lists every active event whose dates have passed under Expired (regression: single-day events were missing)", async () => {
    expect(await idsMatching(expiredEventsFilter)).toEqual(
      ["multi-ended", "one-off-program-past", "recurring-ended", "single-past"].sort(),
    );
  });

  it("lists current events under Live Events", async () => {
    expect(await idsMatching(liveEventsFilter)).toEqual(["multi-ongoing", "single-today"]);
  });

  it("lists current programs under Live Programs, but not a one-off program whose date has passed", async () => {
    expect(await idsMatching(liveProgramsFilter)).toEqual(["multi-ongoing", "recurring-open"]);
  });

  it("never lists an event as both live and expired", async () => {
    const live = new Set([...(await idsMatching(liveEventsFilter)), ...(await idsMatching(liveProgramsFilter))]);
    const expired = await idsMatching(expiredEventsFilter);
    expect(expired.filter((id) => live.has(id))).toEqual([]);
  });

  it("agrees with what the website's events query shows", async () => {
    const params = { today };
    const siteValue = await evaluate(parse(eventsQuery, { params }), { dataset: events, params });
    const siteIds = ((await siteValue.get()) as Array<{ _id: string }>).map((e) => e._id).sort();
    const deskLive = [...new Set([...(await idsMatching(liveEventsFilter)), ...(await idsMatching(liveProgramsFilter))])].sort();
    expect(deskLive).toEqual(siteIds);
  });
});

describe("Studio Announcements desk filters", () => {
  const announcements = [
    { _id: "no-expiry" },
    { _id: "expires-today", expiresAt: "2026-09-15" },
    { _id: "expired", expiresAt: "2026-09-14" },
    { _id: "inactive", active: false },
  ].map((doc) => ({ _type: "announcement", active: true, ...doc }));

  async function announcementIds(filter: string): Promise<string[]> {
    const params = { today };
    const value = await evaluate(parse(`*[${filter}]._id`, { params }), { dataset: announcements, params });
    return ((await value.get()) as string[]).sort();
  }

  it("lists only announcements the website still shows under Active (regression: an expired one was listed)", async () => {
    expect(await announcementIds(activeAnnouncementsFilter)).toEqual(["expires-today", "no-expiry"]);
  });

  it("lists announcements past their expiry date under Expired", async () => {
    expect(await announcementIds(expiredAnnouncementsFilter)).toEqual(["expired"]);
  });
});

