/**
 * Tests for POST /api/revalidate and GET /api/revalidate
 *
 * Covers: valid webhook, missing/invalid secret, invalid document type,
 * GET method blocked, slug-based detail page revalidation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock next/cache revalidatePath
const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

function makePostRequest(
  body: Record<string, unknown>,
  secret?: string
) {
  const url = secret
    ? `http://localhost:3000/api/revalidate?secret=${secret}`
    : "http://localhost:3000/api/revalidate";
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  let POST: (req: NextRequest) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    // Set the secret env var
    process.env.SANITY_REVALIDATE_SECRET = "test-secret-123";

    // Reset module to pick up env changes
    vi.resetModules();
    const mod = await import("./route");
    POST = mod.POST;
  });

  it("revalidates paths for a valid event document", async () => {
    const res = await POST(
      makePostRequest({ _type: "event" }, "test-secret-123")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.revalidated).toBe(true);
    expect(json.documentType).toBe("event");
    expect(json.paths).toContain("/events");
    expect(json.paths).toContain("/");
    expect(mockRevalidatePath).toHaveBeenCalled();
  });

  it("revalidates detail page when slug is present", async () => {
    const res = await POST(
      makePostRequest(
        { _type: "event", slug: { current: "community-iftar" } },
        "test-secret-123"
      )
    );
    const json = await res.json();

    expect(json.paths).toContain("/events/community-iftar");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/events/community-iftar");
  });

  it("returns 401 for invalid secret", async () => {
    const res = await POST(
      makePostRequest({ _type: "event" }, "wrong-secret")
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.message).toMatch(/invalid secret/i);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns 401 for missing secret", async () => {
    const res = await POST(makePostRequest({ _type: "event" }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.message).toMatch(/invalid secret/i);
  });

  it("returns 400 for missing document type", async () => {
    const res = await POST(makePostRequest({}, "test-secret-123"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/no document type/i);
  });

  it("returns 400 for unknown document type", async () => {
    const res = await POST(
      makePostRequest({ _type: "unknownType" }, "test-secret-123")
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/unknown document type/i);
  });

  it("revalidates correct paths for siteSettings", async () => {
    const res = await POST(
      makePostRequest({ _type: "siteSettings" }, "test-secret-123")
    );
    const json = await res.json();

    expect(json.paths).toContain("/");
    expect(json.revalidated).toBe(true);
  });

  it("revalidates correct paths for formSettings", async () => {
    const res = await POST(
      makePostRequest({ _type: "formSettings" }, "test-secret-123")
    );
    const json = await res.json();

    expect(json.paths).toContain("/contact");
    expect(json.paths).toContain("/services");
  });

  it("revalidates service detail page with slug", async () => {
    const res = await POST(
      makePostRequest(
        { _type: "service", slug: { current: "funeral" } },
        "test-secret-123"
      )
    );
    const json = await res.json();

    expect(json.paths).toContain("/services/funeral");
  });

  it("returns 500 when SANITY_REVALIDATE_SECRET is not configured", async () => {
    delete process.env.SANITY_REVALIDATE_SECRET;
    vi.resetModules();
    const mod = await import("./route");

    const res = await mod.POST(
      makePostRequest({ _type: "event" }, "any-secret")
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.message).toMatch(/not configured/i);
  });
});

describe("GET /api/revalidate", () => {
  it("returns 405 for GET requests", async () => {
    vi.resetModules();
    process.env.SANITY_REVALIDATE_SECRET = "test-secret-123";
    const mod = await import("./route");

    const res = await mod.GET();
    const json = await res.json();

    expect(res.status).toBe(405);
    expect(json.message).toMatch(/POST/i);
  });
});
