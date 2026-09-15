/**
 * Parameter wiring for fetch functions whose queries filter on `$today`.
 *
 * Fetch functions swallow errors and return `[]`, so a query that references
 * `$today` without the param being passed would silently hide every item.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.unmock("@/sanity/lib/fetch");

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.mock("./client", () => ({
  client: { fetch: fetchMock },
  noCdnClient: { fetch: fetchMock },
  previewClient: { fetch: fetchMock },
}));

import {
  getAnnouncements,
  getAnnouncementsForStaticGeneration,
  getUrgentAnnouncements,
  getLatestAnnouncements,
} from "./fetch";

describe("announcement fetchers pass Melbourne's date for the expiry filter", () => {
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue([]);
  });

  it.each([
    ["getAnnouncements", getAnnouncements],
    ["getAnnouncementsForStaticGeneration", getAnnouncementsForStaticGeneration],
    ["getUrgentAnnouncements", getUrgentAnnouncements],
    ["getLatestAnnouncements", getLatestAnnouncements],
  ])("%s", async (_name, fetcher) => {
    await fetcher();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [query, params] = fetchMock.mock.calls[0];
    expect(query).toContain("$today");
    expect(params).toEqual(expect.objectContaining({ today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }));
  });
});
