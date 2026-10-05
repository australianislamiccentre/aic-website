/**
 * Tests for POST /api/submission-details
 *
 * Covers: a signed request emails the stored record to the fixed recipients,
 * and nothing is sent for forged links, missing records, rate-limited callers
 * or bad bodies.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { makeRequestMeta, VERCEL_REQUEST_HEADERS } from "@/test/request-meta-fixtures";

const { sendMock, getMock, captureExceptionMock, rateLimitMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  getMock: vi.fn(),
  captureExceptionMock: vi.fn(),
  rateLimitMock: vi.fn(),
}));

vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: sendMock } }) }));
vi.mock("@vercel/blob", () => ({ get: getMock, put: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock, setContext: vi.fn(), setTag: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: (...args: unknown[]) => rateLimitMock(...args) }));

import { POST } from "./route";
import { signRecordPath } from "@/lib/submission-link";

const PATH = "production/contact/2026-10-05/2026-10-05T01-02-03-456Z_1c21ff89-a427-436f-95e5-185e8c607e6c.json";
const record = {
  submissionId: "1c21ff89-a427-436f-95e5-185e8c607e6c",
  form: "contact",
  environment: "production",
  fields: { firstName: "John", lastName: "Smith", email: "john@example.com", inquiryType: "General", message: "Hello" },
  security: makeRequestMeta(),
  emails: { notification: "email-notification", confirmation: "email-confirmation" },
};

function blobResult(text: string) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  return { statusCode: 200, stream, headers: new Headers(), blob: {} };
}

function post(body: unknown): Promise<Response> {
  return POST(
    new NextRequest("https://australianislamiccentre.org/api/submission-details", {
      method: "POST",
      headers: { ...VERCEL_REQUEST_HEADERS, "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/submission-details", () => {
  beforeEach(() => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("SUBMISSION_LINK_SECRET", "test-secret-0123456789");
    sendMock.mockReset().mockResolvedValue({ data: { id: "email-details" }, error: null });
    getMock.mockReset().mockImplementation(async () => blobResult(JSON.stringify(record)));
    captureExceptionMock.mockReset();
    rateLimitMock.mockReset().mockReturnValue({ allowed: true });
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("emails the stored record to Taher and the developer inbox", async () => {
    const res = await post({ record: PATH, sig: signRecordPath(PATH) });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(getMock).toHaveBeenCalledWith(PATH, { access: "private" });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const email = sendMock.mock.calls[0][0];
    expect(email.to).toEqual(["taher@australianislamiccentre.org", "developer@australianislamiccentre.org"]);
    expect(email.subject).toContain("Ref 1c21ff89-a427-436f-95e5-185e8c607e6c");
    expect(email.html).toContain("203.0.113.7");
    expect(email.html).toContain("Hello");
  });

  it("logs who asked for the details", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await post({ record: PATH, sig: signRecordPath(PATH) });

    const [line] = info.mock.calls.map(([logged]) => JSON.parse(String(logged)));
    expect(line).toEqual(
      expect.objectContaining({
        event: "submission_details_requested",
        submissionId: "1c21ff89-a427-436f-95e5-185e8c607e6c",
        ip: "203.0.113.7",
        emailId: "email-details",
      }),
    );
  });

  it("sends nothing for a forged or altered link", async () => {
    const forged = await post({ record: PATH, sig: "A".repeat(43) });
    const altered = await post({ record: PATH.replace("1c21ff89", "2d32aa90"), sig: signRecordPath(PATH) });

    expect(forged.status).toBe(403);
    expect(altered.status).toBe(403);
    expect(getMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("says so when the record isn't in the store", async () => {
    getMock.mockResolvedValue(null);

    const res = await post({ record: PATH, sig: signRecordPath(PATH) });

    expect(res.status).toBe(404);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects a request without a record and signature", async () => {
    expect((await post({})).status).toBe(403);
    expect((await post("not json")).status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("is rate limited", async () => {
    rateLimitMock.mockReturnValue({ allowed: false });

    const res = await post({ record: PATH, sig: signRecordPath(PATH) });

    expect(res.status).toBe(429);
    expect(rateLimitMock).toHaveBeenCalledWith("203.0.113.7");
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("reports failure when the email isn't sent", async () => {
    sendMock.mockResolvedValue({ data: null, error: { name: "validation_error", message: "Invalid `to` field" } });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await post({ record: PATH, sig: signRecordPath(PATH) });

    expect(res.status).toBe(500);
    expect(captureExceptionMock).toHaveBeenCalled();
  });

  it("reports an unexpected error to Sentry", async () => {
    const failure = new Error("Blob store unavailable");
    getMock.mockRejectedValue(failure);
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await post({ record: PATH, sig: signRecordPath(PATH) });

    expect(res.status).toBe(500);
    expect(captureExceptionMock).toHaveBeenCalledWith(failure, expect.anything());
  });
});
