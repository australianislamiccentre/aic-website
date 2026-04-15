/**
 * Tests for /api/disable-draft
 *
 * Verifies draft mode disabling with CSRF origin validation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockDisable = vi.fn();
vi.mock("next/headers", () => ({
  draftMode: () => ({ disable: mockDisable }),
}));

describe("/api/disable-draft", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("POST disables draft mode with valid origin", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/disable-draft", {
      method: "POST",
      headers: { origin: "http://localhost:3000", host: "localhost:3000" },
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.disabled).toBe(true);
    expect(mockDisable).toHaveBeenCalled();
  });

  it("POST returns 403 with mismatched origin", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/disable-draft", {
      method: "POST",
      headers: { origin: "http://evil.com", host: "localhost:3000" },
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it("GET returns 405", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(405);
  });
});
