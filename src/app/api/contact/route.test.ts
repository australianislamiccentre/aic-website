/**
 * Tests for POST /api/contact
 *
 * Covers: valid submission, missing fields, honeypot, rate limiting,
 * form disabled, and email send failure.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies before importing the route
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

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  firstName: "John",
  lastName: "Smith",
  email: "john@example.com",
  phone: "0412345678",
  inquiryType: "General",
  message: "Hello, I have a question.",
};

describe("POST /api/contact", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockIsFormEnabled.mockResolvedValue(true);
    mockCheckRateLimit.mockReturnValue({ allowed: true });
    mockSend.mockResolvedValue({ id: "test-id" });

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
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/disabled/i);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toMatch(/too many/i);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 200 silently when honeypot is filled", async () => {
    const res = await POST(makeRequest({ ...validBody, _gotcha: "bot" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for missing required fields", async () => {
    const { firstName: _, ...noFirstName } = validBody;
    const res = await POST(makeRequest(noFirstName));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/first name/i);
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "not-email" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/email/i);
  });

  it("returns 400 for missing message", async () => {
    const { message: _, ...noMessage } = validBody;
    const res = await POST(makeRequest(noMessage));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/message/i);
  });

  it("returns 500 when email sending fails", async () => {
    mockSend.mockRejectedValueOnce(new Error("Resend API error"));

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toMatch(/failed/i);
  });

  it("passes correct recipient from form settings", async () => {
    mockGetFormRecipientEmail.mockResolvedValue("custom@aic.org");

    await POST(makeRequest(validBody));

    expect(mockGetFormRecipientEmail).toHaveBeenCalledWith("contact");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "custom@aic.org" })
    );
  });

  it("sends confirmation email to the submitter", async () => {
    await POST(makeRequest(validBody));

    // Second call is the confirmation email
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "john@example.com" })
    );
  });

  it("extracts IP from x-forwarded-for header", async () => {
    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
      },
      body: JSON.stringify(validBody),
    });

    await POST(req);

    expect(mockCheckRateLimit).toHaveBeenCalledWith("1.2.3.4");
  });
});
