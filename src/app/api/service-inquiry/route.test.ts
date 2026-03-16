/**
 * Tests for POST /api/service-inquiry
 *
 * Covers: valid submission, missing fields, honeypot, rate limiting,
 * form disabled, per-service recipient lookup, and fallback.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockSend = vi.fn().mockResolvedValue({ id: "test-id" });

vi.mock("@/lib/resend", () => ({
  getResendClient: () => ({
    emails: { send: mockSend },
  }),
}));

const mockIsFormEnabled = vi.fn().mockResolvedValue(true);
const mockGetFormRecipientEmail = vi
  .fn()
  .mockResolvedValue("admin@example.com");

vi.mock("@/lib/form-settings", () => ({
  isFormEnabled: (...args: unknown[]) => mockIsFormEnabled(...args),
  getFormRecipientEmail: (...args: unknown[]) =>
    mockGetFormRecipientEmail(...args),
}));

const mockCheckRateLimit = vi.fn().mockReturnValue({ allowed: true });

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

const mockGetServiceBySlug = vi.fn().mockResolvedValue(null);

vi.mock("@/sanity/lib/fetch", () => ({
  getServiceBySlug: (...args: unknown[]) => mockGetServiceBySlug(...args),
}));

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/service-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  firstName: "Ali",
  lastName: "Hassan",
  email: "ali@example.com",
  serviceName: "Funeral Services",
  message: "I need information.",
};

describe("POST /api/service-inquiry", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockIsFormEnabled.mockResolvedValue(true);
    mockCheckRateLimit.mockReturnValue({ allowed: true });
    mockSend.mockResolvedValue({ id: "test-id" });
    mockGetServiceBySlug.mockResolvedValue(null);

    const mod = await import("./route");
    POST = mod.POST;
  });

  it("returns 200 on valid submission and sends two emails", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("returns 403 when form is disabled", async () => {
    mockIsFormEnabled.mockResolvedValue(false);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 200 silently for honeypot", async () => {
    const res = await POST(makeRequest({ ...validBody, _gotcha: "bot" }));
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for missing firstName", async () => {
    const { firstName: _, ...body } = validBody;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing serviceName", async () => {
    const { serviceName: _, ...body } = validBody;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/service name/i);
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "bad" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing message", async () => {
    const { message: _, ...body } = validBody;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it("uses per-service recipient from Sanity when serviceSlug is provided", async () => {
    mockGetServiceBySlug.mockResolvedValue({
      formRecipientEmail: "service-lead@aic.org",
    });

    const body = { ...validBody, serviceSlug: "funeral-services" };
    await POST(makeRequest(body));

    expect(mockGetServiceBySlug).toHaveBeenCalledWith("funeral-services");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "service-lead@aic.org" })
    );
  });

  it("falls back to global recipient when service has no custom email", async () => {
    mockGetServiceBySlug.mockResolvedValue({ formRecipientEmail: null });

    const body = { ...validBody, serviceSlug: "education" };
    await POST(makeRequest(body));

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@example.com" })
    );
  });

  it("falls back to global recipient when service lookup fails", async () => {
    mockGetServiceBySlug.mockRejectedValue(new Error("fetch error"));

    const body = { ...validBody, serviceSlug: "broken" };
    await POST(makeRequest(body));

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@example.com" })
    );
  });

  it("sends confirmation to the submitter", async () => {
    await POST(makeRequest(validBody));

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ali@example.com" })
    );
  });

  it("returns 500 on email failure", async () => {
    mockSend.mockRejectedValueOnce(new Error("fail"));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });
});
