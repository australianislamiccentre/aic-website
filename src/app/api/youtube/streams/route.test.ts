/**
 * Tests for GET /api/youtube/streams
 *
 * Verifies completed streams endpoint.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/youtube", () => ({
  getYouTubeStreams: vi.fn(),
}));

import { getYouTubeStreams } from "@/lib/youtube";
const mockGetStreams = vi.mocked(getYouTubeStreams);

describe("GET /api/youtube/streams", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns stream data with cache headers", async () => {
    mockGetStreams.mockResolvedValue([
      { id: "s1", title: "Stream 1", publishedAt: "2026-04-01" },
    ] as never);
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(json[0].title).toBe("Stream 1");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("returns 500 on error", async () => {
    mockGetStreams.mockRejectedValue(new Error("API error"));
    const { GET } = await import("./route");
    const res = await GET();

    expect(res.status).toBe(500);
  });
});
