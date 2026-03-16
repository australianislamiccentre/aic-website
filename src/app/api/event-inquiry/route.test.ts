/**
 * Tests for POST /api/event-inquiry
 *
 * Covers: valid submission, missing fields, honeypot, rate limiting,
 * form disabled, and event-specific contact email.
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

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/event-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  firstName: "Omar",
  lastName: "Khan",
  email: "omar@example.com",
  eventName: "Community Iftar",
  message: "Can I attend?",
};

describe("POST /api/event-inquiry", () => {
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
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false });

    const res = await POST(makeRequest(validBody));

    expect((await res.json()).error).toMatch(/too many/i);
    expect(res.status).toBe(429);
  });

  it("returns 200 silently for honeypot", async () => {
    const res = await POST(makeRequest({ ...validBody, _gotcha: "spam" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for missing firstName", async () => {
    const { firstName: _, ...body } = validBody;
    const res = await POST(makeRequest(body));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/first name/i);
  });

  it("returns 400 for missing eventName", async () => {
    const { eventName: _, ...body } = validBody;
    const res = await POST(makeRequest(body));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/event name/i);
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

  it("uses event-specific contactEmail when provided", async () => {
    const body = { ...validBody, contactEmail: "organiser@event.com" };
    await POST(makeRequest(body));

    // First send call (notification) should go to the event-specific email
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "organiser@event.com" })
    );
  });

  it("falls back to global recipient when no contactEmail", async () => {
    await POST(makeRequest(validBody));

    expect(mockGetFormRecipientEmail).toHaveBeenCalledWith("eventInquiry");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@example.com" })
    );
  });

  it("sends confirmation to the submitter", async () => {
    await POST(makeRequest(validBody));

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "omar@example.com" })
    );
  });

  it("returns 500 on email failure", async () => {
    mockSend.mockRejectedValueOnce(new Error("fail"));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/failed/i);
  });
});
