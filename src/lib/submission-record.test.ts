/**
 * Tests for the form-submission record: private storage, the structured log
 * line, and the Sentry context.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { VERCEL_REQUEST_HEADERS } from "@/test/request-meta-fixtures";

const { putMock, getMock, captureExceptionMock, setContextMock, setTagMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
  getMock: vi.fn(),
  captureExceptionMock: vi.fn(),
  setContextMock: vi.fn(),
  setTagMock: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({ put: putMock, get: getMock }));
vi.mock("@sentry/nextjs", () => ({
  captureException: captureExceptionMock,
  setContext: setContextMock,
  setTag: setTagMock,
}));

import {
  finishSubmission,
  logSubmission,
  readSubmissionRecord,
  reportSubmissionError,
  startSubmission,
  storeSubmission,
} from "./submission-record";
import { verifyRecordPath } from "./submission-link";

function makeRequest(): NextRequest {
  return new NextRequest("https://australianislamiccentre.org/api/contact", {
    method: "POST",
    headers: VERCEL_REQUEST_HEADERS,
  });
}

const fields = {
  firstName: "John",
  lastName: "Smith",
  email: "john@example.com",
  inquiryType: "General",
  message: "A private message body",
};

/** The JSON lines written by logSubmission. */
function loggedLines(info: ReturnType<typeof vi.spyOn>): Array<Record<string, unknown>> {
  return info.mock.calls.map((call: unknown[]) => JSON.parse(String(call[0])));
}

/** A Blob `get()` result whose body is `text`. */
function blobResult(text: string) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  return { statusCode: 200, stream, headers: new Headers(), blob: {} };
}

beforeEach(() => {
  putMock.mockReset().mockResolvedValue({ pathname: "stored.json" });
  getMock.mockReset();
  captureExceptionMock.mockReset();
  setContextMock.mockReset();
  setTagMock.mockReset();
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("BLOB_STORE_ID", "store_abc123");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  vi.stubEnv("SUBMISSION_LINK_SECRET", "test-secret-0123456789");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("startSubmission", () => {
  it("gives the submission a unique ID and captures the request's security record", () => {
    const first = startSubmission("contact", makeRequest());
    const second = startSubmission("contact", makeRequest());

    expect(first.submissionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(first.submissionId).not.toBe(second.submissionId);
    expect(first.form).toBe("contact");
    expect(first.meta.ip).toBe("203.0.113.7");
    expect(first.meta.location.city).toBe("Newport");
  });

  it("gives the submission a signed Request details link to the record it will be stored as", async () => {
    const submission = startSubmission("contact", makeRequest());
    await storeSubmission(submission, fields, {});

    const link = new URL(submission.detailsUrl!);
    expect(link.origin).toBe("https://australianislamiccentre.org");
    expect(link.pathname).toBe("/submission-details");
    expect(link.searchParams.get("record")).toBe(putMock.mock.calls[0][0]);
    expect(verifyRecordPath(link.searchParams.get("record"), link.searchParams.get("sig"))).toBe(true);
  });

  it("has no Request details link when links can't be signed", () => {
    vi.stubEnv("SUBMISSION_LINK_SECRET", "");
    expect(startSubmission("contact", makeRequest()).detailsUrl).toBeNull();
  });

  it("attaches the security record to Sentry, tagged with the form and submission ID", () => {
    const submission = startSubmission("contact", makeRequest());

    expect(setTagMock).toHaveBeenCalledWith("form", "contact");
    expect(setTagMock).toHaveBeenCalledWith("submission_id", submission.submissionId);
    expect(setContextMock).toHaveBeenCalledWith(
      "form_submission",
      expect.objectContaining({
        submissionId: submission.submissionId,
        form: "contact",
        ip: "203.0.113.7",
        xForwardedFor: "203.0.113.7",
        city: "Newport",
        requestId: "syd1::iad1::abcde-1759622400000-0123456789ab",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      }),
    );
  });
});

describe("storeSubmission", () => {
  it("writes one private JSON record with the fields, security record and email IDs", async () => {
    const submission = startSubmission("contact", makeRequest());

    const stored = await storeSubmission(submission, fields, { notification: "email-1", confirmation: "email-2" });

    expect(stored).toBe(true);
    expect(putMock).toHaveBeenCalledTimes(1);
    const [, body, options] = putMock.mock.calls[0];
    expect(options).toEqual({
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    expect(JSON.parse(body)).toEqual({
      submissionId: submission.submissionId,
      form: "contact",
      environment: "production",
      fields,
      security: submission.meta,
      emails: { notification: "email-1", confirmation: "email-2" },
    });
  });

  it("files records by environment, form and UTC date", async () => {
    const submission = startSubmission("event-inquiry", makeRequest());
    const { receivedAt } = submission.meta;

    await storeSubmission(submission, fields, {});

    const timestamp = receivedAt.replace(/[:.]/g, "-");
    expect(putMock.mock.calls[0][0]).toBe(
      `production/event-inquiry/${receivedAt.slice(0, 10)}/${timestamp}_${submission.submissionId}.json`,
    );
  });

  it("keeps preview test submissions apart from production records", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const submission = startSubmission("contact", makeRequest());

    await storeSubmission(submission, fields, {});

    expect(putMock.mock.calls[0][0]).toMatch(/^preview\/contact\//);
  });

  it("works with a read-write token instead of OIDC", async () => {
    vi.stubEnv("BLOB_STORE_ID", "");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_abc123");

    await expect(storeSubmission(startSubmission("contact", makeRequest()), fields, {})).resolves.toBe(true);
    expect(putMock).toHaveBeenCalledTimes(1);
  });

  it("reports a storage failure to Sentry instead of throwing", async () => {
    const failure = new Error("Blob store unavailable");
    putMock.mockRejectedValue(failure);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const submission = startSubmission("contact", makeRequest());

    await expect(storeSubmission(submission, fields, {})).resolves.toBe(false);

    expect(captureExceptionMock).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({
        tags: { form: "contact", submission_id: submission.submissionId },
        contexts: { form_submission: expect.objectContaining({ ip: "203.0.113.7" }) },
      }),
    );
  });

  it("skips storage in local development when no store is connected", async () => {
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("BLOB_STORE_ID", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(storeSubmission(startSubmission("contact", makeRequest()), fields, {})).resolves.toBe(false);

    expect(putMock).not.toHaveBeenCalled();
    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("BLOB_STORE_ID"));
  });

  it("reports a deployment with no store connected to Sentry, since records are being lost", async () => {
    vi.stubEnv("BLOB_STORE_ID", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(storeSubmission(startSubmission("contact", makeRequest()), fields, {})).resolves.toBe(false);

    expect(putMock).not.toHaveBeenCalled();
    expect(captureExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("No Blob store") }),
      expect.anything(),
    );
  });
});

describe("logSubmission", () => {
  it("writes one JSON line of request metadata", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const submission = startSubmission("contact", makeRequest());

    logSubmission(submission, "rate_limited");

    expect(loggedLines(info)).toEqual([
      {
        event: "form_submission",
        form: "contact",
        submissionId: submission.submissionId,
        outcome: "rate_limited",
        receivedAt: submission.meta.receivedAt,
        ip: "203.0.113.7",
        country: "AU",
        region: "VIC",
        city: "Newport",
        requestId: "syd1::iad1::abcde-1759622400000-0123456789ab",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      },
    ]);
  });

  it("includes storage status, email IDs and message length when known", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    logSubmission(startSubmission("contact", makeRequest()), "accepted", {
      stored: true,
      emails: { notification: "email-1" },
      messageLength: 22,
    });

    expect(loggedLines(info)[0]).toEqual(
      expect.objectContaining({ stored: true, emails: { notification: "email-1" }, messageLength: 22 }),
    );
  });

  it("logs each submission once, even if the route reports it twice", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const submission = startSubmission("contact", makeRequest());

    logSubmission(submission, "error", { stored: true });
    logSubmission(submission, "error");

    expect(info).toHaveBeenCalledTimes(1);
  });
});

describe("finishSubmission", () => {
  it("stores the record and logs it without the form's contents", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const submission = startSubmission("contact", makeRequest());

    await finishSubmission(submission, "accepted", {
      fields,
      emails: { notification: "email-1", confirmation: "email-2" },
      messageLength: fields.message.length,
    });

    expect(putMock).toHaveBeenCalledTimes(1);
    const [line] = loggedLines(info);
    expect(line).toEqual(
      expect.objectContaining({
        outcome: "accepted",
        stored: true,
        emails: { notification: "email-1", confirmation: "email-2" },
        messageLength: fields.message.length,
      }),
    );
    const raw = String(info.mock.calls[0][0]);
    for (const value of Object.values(fields)) expect(raw).not.toContain(value);
  });

  it("still logs the submission when storage fails", async () => {
    putMock.mockRejectedValue(new Error("Blob store unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await finishSubmission(startSubmission("contact", makeRequest()), "accepted", { fields, emails: {} });

    expect(loggedLines(info)[0]).toEqual(expect.objectContaining({ outcome: "accepted", stored: false }));
  });
});

describe("reportSubmissionError", () => {
  it("sends the error to Sentry with the security record and logs an error line", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const submission = startSubmission("subscribe", makeRequest());
    const failure = new Error("Resend client unavailable");

    reportSubmissionError(submission, failure);

    expect(captureExceptionMock).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({ tags: { form: "subscribe", submission_id: submission.submissionId } }),
    );
    expect(loggedLines(info)[0]).toEqual(expect.objectContaining({ outcome: "error" }));
  });
});

describe("readSubmissionRecord", () => {
  const PATH = "production/contact/2026-10-05/2026-10-05T07-11-01-490Z_1c21ff89-a427-436f-95e5-185e8c607e6c.json";

  it("reads a stored record from the private store", async () => {
    const record = { submissionId: "1c21ff89-a427-436f-95e5-185e8c607e6c", form: "contact", fields };
    getMock.mockResolvedValue(blobResult(JSON.stringify(record)));

    await expect(readSubmissionRecord(PATH)).resolves.toEqual(record);
    expect(getMock).toHaveBeenCalledWith(PATH, { access: "private" });
  });

  it("returns null when there is no record at that path", async () => {
    getMock.mockResolvedValue(null);
    await expect(readSubmissionRecord(PATH)).resolves.toBeNull();
  });
});
