/**
 * Tests for GET /api/draft — secret validation (regression: issue #71)
 *
 * The secret is now compared with a constant-time `safeEqual`. These tests pin
 * the externally-observable behaviour: wrong/missing secret → 401 (draft mode
 * never enabled), correct secret → enable + redirect.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockEnable = vi.fn();
vi.mock("next/headers", () => ({
  draftMode: vi.fn().mockResolvedValue({ enable: mockEnable }),
}));

const mockRedirect = vi.fn((path: string) => {
  // next/navigation's redirect() signals via a thrown error.
  throw new Error(`NEXT_REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/draft");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

describe("GET /api/draft secret validation", () => {
  let GET: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.SANITY_PREVIEW_SECRET = "preview-secret-123";
    const mod = await import("./route");
    GET = mod.GET;
  });

  it("returns 401 for a wrong secret", async () => {
    const res = await GET(makeRequest({ secret: "wrong", slug: "/events" }));
    expect(res.status).toBe(401);
    expect(mockEnable).not.toHaveBeenCalled();
  });

  it("returns 401 for a missing secret", async () => {
    const res = await GET(makeRequest({ slug: "/events" }));
    expect(res.status).toBe(401);
    expect(mockEnable).not.toHaveBeenCalled();
  });

  it("enables draft mode and redirects for the correct secret", async () => {
    await expect(
      GET(makeRequest({ secret: "preview-secret-123", slug: "/events" }))
    ).rejects.toThrow("NEXT_REDIRECT:/events");
    expect(mockEnable).toHaveBeenCalled();
  });
});
