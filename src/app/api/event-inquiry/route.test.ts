/**
 * Tests for POST /api/event-inquiry
 *
 * Covers: valid submission, missing fields, honeypot, rate limiting,
 * form disabled, server-side event lookup (recipient + event name come from
 * Sanity, never from the request), and unknown / non-enquiry events.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

const sanityEvent = {
  _id: "event-1",
  title: "Community Iftar",
  slug: "community-iftar",
  formType: "contact",
  contactEmail: "events@aic.example",
};
const mockGetEventBySlug = vi.fn();

vi.mock("@/sanity/lib/fetch", () => ({
  getEventBySlug: (...args: unknown[]) => mockGetEventBySlug(...args),
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
  eventSlug: "community-iftar",
  message: "Can I attend?",
};

describe("POST /api/event-inquiry", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Route behaviour is tested as the production deployment; non-production email is covered below
    vi.stubEnv("VERCEL_ENV", "production");
    mockIsFormEnabled.mockResolvedValue(true);
    mockCheckRateLimit.mockReturnValue({ allowed: true });
    mockSend.mockResolvedValue({ id: "test-id" });
    mockGetEventBySlug.mockResolvedValue(sanityEvent);

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

  it("returns 400 for missing eventSlug", async () => {
    const { eventSlug: _, ...body } = validBody;
    const res = await POST(makeRequest(body));

    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
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

  it("looks the event up in Sanity by slug", async () => {
    await POST(makeRequest(validBody));
    expect(mockGetEventBySlug).toHaveBeenCalledWith("community-iftar");
  });

  it("sends the notification to the event's contact email from Sanity", async () => {
    await POST(makeRequest(validBody));

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "events@aic.example", replyTo: "omar@example.com" })
    );
  });

  it("ignores a recipient supplied in the request (open-relay regression)", async () => {
    await POST(makeRequest({ ...validBody, contactEmail: "victim@example.com" }));

    const recipients = mockSend.mock.calls.map(([email]) => email.to);
    expect(recipients).not.toContain("victim@example.com");
    expect(recipients).toEqual(["events@aic.example", "omar@example.com"]);
  });

  it("uses the event title from Sanity, not an event name from the request", async () => {
    await POST(makeRequest({ ...validBody, eventName: "Your account is suspended" }));

    for (const [email] of mockSend.mock.calls) {
      expect(email.subject).toContain("Community Iftar");
      expect(email.subject).not.toContain("suspended");
    }
  });

  it("falls back to the global event-inquiry recipient when the event has no contact email", async () => {
    mockGetEventBySlug.mockResolvedValue({ ...sanityEvent, contactEmail: undefined });

    await POST(makeRequest(validBody));

    expect(mockGetFormRecipientEmail).toHaveBeenCalledWith("eventInquiry");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@example.com" })
    );
  });

  it("returns 404 and sends nothing when the event doesn't exist", async () => {
    mockGetEventBySlug.mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(404);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 404 and sends nothing when the event doesn't use the enquiry form", async () => {
    mockGetEventBySlug.mockResolvedValue({ ...sanityEvent, formType: "embed" });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(404);
    expect(mockSend).not.toHaveBeenCalled();
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

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("on a preview deployment, sends every email to the test inbox instead of real people", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("EMAIL_TEST_RECIPIENT", "tester@aic.example");

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    const recipients = mockSend.mock.calls.map(([sent]) => sent.to);
    expect(recipients.length).toBeGreaterThan(0);
    expect(new Set(recipients)).toEqual(new Set(["tester@aic.example"]));
    expect(mockSend.mock.calls[0][0].subject).toContain("[TEST → events@aic.example]");
  });
});
