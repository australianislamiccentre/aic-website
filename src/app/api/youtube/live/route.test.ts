/**
 * Tests for GET /api/youtube/live
 *
 * Verifies live stream status endpoint with caching behaviour.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/youtube", () => ({
  getYouTubeLiveStream: vi.fn(),
}));

import { getYouTubeLiveStream } from "@/lib/youtube";
const mockGetLive = vi.mocked(getYouTubeLiveStream);

describe("GET /api/youtube/live", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns live stream data when stream is live", async () => {
    mockGetLive.mockResolvedValue({
      isLive: true,
      videoId: "abc123",
      title: "Friday Khutbah",
      url: "https://youtube.com/watch?v=abc123",
    });
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.isLive).toBe(true);
    expect(json.videoId).toBe("abc123");
    expect(json.title).toBe("Friday Khutbah");
  });

  it("returns isLive false when no stream", async () => {
    mockGetLive.mockResolvedValue({ isLive: false });
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.isLive).toBe(false);
  });

  it("returns isLive false with 500 on error", async () => {
    mockGetLive.mockRejectedValue(new Error("YouTube API down"));
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.isLive).toBe(false);
  });
});
