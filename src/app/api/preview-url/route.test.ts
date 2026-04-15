/**
 * Tests for POST /api/preview-url
 *
 * Verifies preview URL generation for different Sanity document types.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

describe("POST /api/preview-url", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    process.env.SANITY_PREVIEW_SECRET = "test-secret";
  });

  function makeRequest(body: unknown) {
    return new NextRequest("http://localhost:3000/api/preview-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns preview URL for event with slug", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ documentType: "event", slug: "friday-prayer" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toContain("/api/draft");
    expect(json.url).toContain("secret=test-secret");
    expect(json.url).toContain("slug=");
  });

  it("returns preview URL for siteSettings (no slug)", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ documentType: "siteSettings" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toContain("/api/draft");
  });

  it("returns 400 for missing documentType", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown document type", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ documentType: "unknownType" }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/preview-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
