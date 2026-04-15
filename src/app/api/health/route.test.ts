/**
 * Tests for GET /api/health
 *
 * Verifies the health check endpoint reports correct status
 * based on Sanity CMS reachability.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "test-project";
    process.env.NEXT_PUBLIC_SANITY_DATASET = "production";
  });

  it("returns 200 with status ok when Sanity is reachable", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("ok");
    expect(json.services.sanity).toBe("ok");
    expect(json.timestamp).toBeTruthy();
  });

  it("returns 503 with status degraded when Sanity is unreachable", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("degraded");
    expect(json.services.sanity).toBe("error");
  });

  it("returns 503 when Sanity fetch throws (timeout/network error)", async () => {
    mockFetch.mockRejectedValue(new Error("timeout"));
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("degraded");
    expect(json.services.sanity).toBe("error");
  });

  it("returns 200 ok when SANITY_PROJECT_ID is not set (skips check)", async () => {
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const { GET } = await import("./route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("ok");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
