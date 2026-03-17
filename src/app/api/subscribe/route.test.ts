/**
 * Tests for POST /api/subscribe
 *
 * Covers: valid subscription, missing/invalid email, honeypot, rate limiting,
 * form disabled, and audience sync.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockSend = vi.fn().mockResolvedValue({ id: "test-id" });
const mockContactsCreate = vi.fn().mockResolvedValue({ id: "contact-id" });

vi.mock("@/lib/resend", () => ({
  getResendClient: () => ({
    emails: { send: mockSend },
    contacts: { create: mockContactsCreate },
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

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockIsFormEnabled.mockResolvedValue(true);
    mockCheckRateLimit.mockReturnValue({ allowed: true });
    mockSend.mockResolvedValue({ id: "test-id" });

    const mod = await import("./route");
    POST = mod.POST;
  });

  it("returns 200 on valid subscription", async () => {
    const res = await POST(
      makeRequest({ email: "sub@example.com", name: "Ahmed", phone: "0412345678" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("returns 403 when newsletter is disabled", async () => {
    mockIsFormEnabled.mockResolvedValue(false);

    const res = await POST(makeRequest({ email: "sub@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/disabled/i);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false });

    const res = await POST(makeRequest({ email: "sub@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toMatch(/too many/i);
  });

  it("returns 200 silently when honeypot is filled", async () => {
    const res = await POST(
      makeRequest({ email: "sub@example.com", _gotcha: "bot" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({ name: "Ahmed" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/email/i);
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/email/i);
  });

  it("returns 400 for empty email string", async () => {
    const res = await POST(makeRequest({ email: "   " }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/email/i);
  });

  it("checks the newsletter form type", async () => {
    await POST(makeRequest({ email: "sub@example.com", phone: "0412345678" }));
    expect(mockIsFormEnabled).toHaveBeenCalledWith("newsletter");
    expect(mockGetFormRecipientEmail).toHaveBeenCalledWith("newsletter");
  });

  it("returns 500 when email sending fails", async () => {
    mockSend.mockRejectedValueOnce(new Error("API error"));

    const res = await POST(makeRequest({ email: "sub@example.com", phone: "0412345678" }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toMatch(/failed/i);
  });

  it("returns 400 when phone is missing", async () => {
    const res = await POST(makeRequest({ email: "sub@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/phone/i);
  });

  it("handles name as optional", async () => {
    const res = await POST(makeRequest({ email: "sub@example.com", phone: "0412345678" }));
    expect(res.status).toBe(200);
  });

  it("includes whatsapp preference in notification email", async () => {
    await POST(makeRequest({ email: "sub@example.com", phone: "0412345678", whatsapp: true }));
    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.html).toContain("WhatsApp Group");
    expect(call.html).toContain("Yes");
  });
});
