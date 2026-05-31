/**
 * Tests for GET /api/youtube/playlists/[id]
 *
 * Verifies playlist video fetching with parameter validation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/youtube", () => ({
  getPlaylistVideos: vi.fn(),
}));

import { getPlaylistVideos } from "@/lib/youtube";
const mockGetPlaylist = vi.mocked(getPlaylistVideos);

describe("GET /api/youtube/playlists/[id]", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns playlist videos with cache headers", async () => {
    mockGetPlaylist.mockResolvedValue([
      { id: "v1", title: "Video 1" },
    ] as never);
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/api/youtube/playlists/PL123"),
      { params: Promise.resolve({ id: "PL123" }) }
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(mockGetPlaylist).toHaveBeenCalledWith("PL123");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("returns 400 when playlist ID is missing", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/api/youtube/playlists/"),
      { params: Promise.resolve({ id: "" }) }
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for a playlist ID containing injected query params (#74)", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/api/youtube/playlists/x"),
      { params: Promise.resolve({ id: "PLabc123&maxResults=0&key=evil" }) }
    );

    expect(res.status).toBe(400);
    expect(mockGetPlaylist).not.toHaveBeenCalled();
  });

  it("returns 400 for a playlist ID with illegal characters (#74)", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/api/youtube/playlists/x"),
      { params: Promise.resolve({ id: "../../etc/passwd" }) }
    );

    expect(res.status).toBe(400);
    expect(mockGetPlaylist).not.toHaveBeenCalled();
  });

  it("returns 500 when fetch fails", async () => {
    mockGetPlaylist.mockRejectedValue(new Error("API error"));
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost:3000/api/youtube/playlists/PL123"),
      { params: Promise.resolve({ id: "PL123" }) }
    );

    expect(res.status).toBe(500);
  });
});
