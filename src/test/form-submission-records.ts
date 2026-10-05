/**
 * Shared tests for the security trail every form route must leave: the private
 * stored record, the reference + "Request details" link in the staff email,
 * the log line, and Sentry reporting. Each form route's test file runs these against its own
 * route, so a new form can't skip any of it.
 *
 * The calling file must mock `@vercel/blob` (`put`), `@sentry/nextjs`
 * (`captureException`, `setContext`, `setTag`) and `@/lib/resend`, and pass the
 * mocks in.
 */
import { describe, it, expect, beforeEach, vi, type Mock, type MockInstance } from "vitest";
import { NextRequest } from "next/server";
import type { FormName } from "@/lib/submission-record";
import { verifyRecordPath } from "@/lib/submission-link";
import { VERCEL_REQUEST_HEADERS } from "./request-meta-fixtures";

interface SubmissionRecordTestOptions {
  form: FormName;
  /** The route's path, e.g. `/api/contact`. */
  path: string;
  /** Returns the route's POST handler (imported in the file's `beforeEach`). */
  post: () => (request: NextRequest) => Promise<Response>;
  validBody: Record<string, unknown>;
  invalidBody: Record<string, unknown>;
  /** The `fields` the stored record should hold for `validBody`. */
  expectedFields: Record<string, unknown>;
  /** Submitted values that must never appear in the log line. */
  privateValues: string[];
  /** Whether the route emails the submitter a confirmation. */
  sendsConfirmation: boolean;
  sendMock: Mock;
  putMock: Mock;
  captureExceptionMock: Mock;
  rateLimitMock: Mock;
}

export function describeSubmissionRecords(options: SubmissionRecordTestOptions): void {
  const { form, path, validBody, invalidBody, sendMock, putMock, captureExceptionMock, rateLimitMock } = options;

  describe("submission security records", () => {
    let info: MockInstance;

    beforeEach(() => {
      vi.stubEnv("VERCEL_ENV", "production");
      vi.stubEnv("BLOB_STORE_ID", "store_abc123");
      vi.stubEnv("SUBMISSION_LINK_SECRET", "test-secret-0123456789");
      putMock.mockReset().mockResolvedValue({ pathname: "record.json" });
      captureExceptionMock.mockReset();
      sendMock
        .mockReset()
        .mockResolvedValueOnce({ data: { id: "email-notification" }, error: null })
        .mockResolvedValueOnce({ data: { id: "email-confirmation" }, error: null });
      rateLimitMock.mockReturnValue({ allowed: true });
      info = vi.spyOn(console, "info").mockImplementation(() => {});
    });

    function submit(body: Record<string, unknown>): Promise<Response> {
      return options.post()(
        new NextRequest(`https://australianislamiccentre.org${path}`, {
          method: "POST",
          headers: { ...VERCEL_REQUEST_HEADERS, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
    }

    function storedRecord() {
      expect(putMock).toHaveBeenCalledTimes(1);
      return JSON.parse(putMock.mock.calls[0][1]);
    }

    function logLines(): Array<Record<string, unknown>> {
      return info.mock.calls
        .map((call) => String(call[0]))
        .filter((line) => line.includes('"event":"form_submission"'))
        .map((line) => JSON.parse(line));
    }

    it("stores one private record with the fields, the request's security record and the email IDs", async () => {
      await submit(validBody);

      const [pathname, , putOptions] = putMock.mock.calls[0];
      const record = storedRecord();
      expect(pathname).toMatch(new RegExp(`^production/${form}/\\d{4}-\\d{2}-\\d{2}/.+\\.json$`));
      expect(putOptions).toEqual(expect.objectContaining({ access: "private" }));
      expect(record.form).toBe(form);
      expect(record.fields).toEqual(options.expectedFields);
      expect(record.security).toEqual(
        expect.objectContaining({
          ip: "203.0.113.7",
          ipHeaders: expect.objectContaining({ xForwardedFor: "203.0.113.7" }),
          location: expect.objectContaining({ city: "Newport", country: "AU" }),
          vercel: expect.objectContaining({ requestId: VERCEL_REQUEST_HEADERS["x-vercel-id"] }),
          client: expect.objectContaining({ userAgent: VERCEL_REQUEST_HEADERS["user-agent"] }),
        }),
      );
      expect(record.emails).toEqual(
        options.sendsConfirmation
          ? { notification: "email-notification", confirmation: "email-confirmation" }
          : { notification: "email-notification" },
      );
    });

    it("responds exactly as before: no submission ID or request details reach the submitter", async () => {
      const res = await submit(validBody);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it("ends the staff notification with the reference and a signed Request details link to the stored record", async () => {
      await submit(validBody);

      const [notification] = sendMock.mock.calls.map(([sent]) => sent);
      const [pathname] = putMock.mock.calls[0];
      expect(notification.html).toContain(`Ref ${storedRecord().submissionId}`);
      const href = notification.html.match(/href="([^"]+)"[^>]*>Request details<\/a>/)?.[1];
      const link = new URL(href!.replace(/&amp;/g, "&"));
      expect(link.origin).toBe("https://australianislamiccentre.org");
      expect(link.searchParams.get("record")).toBe(pathname);
      expect(verifyRecordPath(link.searchParams.get("record"), link.searchParams.get("sig"))).toBe(true);
    });

    it("keeps the sender's IP and browser out of every email", async () => {
      await submit(validBody);

      const sent = sendMock.mock.calls.map(([email]) => email);
      expect(sent).toHaveLength(options.sendsConfirmation ? 2 : 1);
      for (const email of sent) {
        expect(email.html).not.toContain("203.0.113.7");
        expect(email.html).not.toContain(VERCEL_REQUEST_HEADERS["user-agent"]);
        expect(email.html).not.toContain(VERCEL_REQUEST_HEADERS["x-vercel-id"]);
      }
      if (options.sendsConfirmation) {
        const confirmation = sent[1];
        expect(confirmation.html).not.toContain("Request details");
        expect(confirmation.html).not.toContain(storedRecord().submissionId);
      }
    });

    it("still sends the emails and succeeds when storage fails, and reports the failure to Sentry", async () => {
      const failure = new Error("Blob store unavailable");
      putMock.mockRejectedValue(failure);
      vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await submit(validBody);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
      expect(sendMock).toHaveBeenCalledTimes(options.sendsConfirmation ? 2 : 1);
      expect(captureExceptionMock).toHaveBeenCalledWith(
        failure,
        expect.objectContaining({ tags: expect.objectContaining({ form }) }),
      );
      expect(logLines()).toEqual([expect.objectContaining({ outcome: "accepted", stored: false })]);
    });

    it("keeps the record when an email fails to send, and reports the error to Sentry", async () => {
      const failure = new Error("Resend unreachable");
      sendMock.mockReset().mockRejectedValue(failure);
      vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await submit(validBody);

      expect(res.status).toBe(500);
      expect(storedRecord().emails.notification).toBeNull();
      expect(captureExceptionMock).toHaveBeenCalledWith(failure, expect.anything());
      expect(logLines()).toEqual([expect.objectContaining({ outcome: "error", stored: true })]);
    });

    it.each([
      ["rate_limited", () => rateLimitMock.mockReturnValue({ allowed: false }), () => validBody],
      ["honeypot", () => {}, () => ({ ...validBody, _gotcha: "bot" })],
      ["invalid", () => {}, () => invalidBody],
    ])("logs a %s request but doesn't store it", async (outcome, arrange, body) => {
      arrange();

      await submit(body());

      expect(putMock).not.toHaveBeenCalled();
      expect(logLines()).toEqual([expect.objectContaining({ outcome, ip: "203.0.113.7" })]);
    });

    it("logs one line per submission, with the request metadata but none of the form's contents", async () => {
      await submit(validBody);

      const lines = logLines();
      expect(lines).toEqual([
        expect.objectContaining({
          event: "form_submission",
          form,
          outcome: "accepted",
          submissionId: storedRecord().submissionId,
          ip: "203.0.113.7",
          city: "Newport",
          requestId: VERCEL_REQUEST_HEADERS["x-vercel-id"],
          stored: true,
        }),
      ]);
      const raw = JSON.stringify(lines);
      for (const value of options.privateValues) expect(raw).not.toContain(value);
    });
  });
}
