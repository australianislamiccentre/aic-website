/**
 * Tests for the signed "Request details" links in staff notification emails.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  SUBMISSION_DETAILS_RECIPIENTS,
  isRecordPath,
  signRecordPath,
  submissionDetailsUrl,
  verifyRecordPath,
} from "./submission-link";

const PATH = "production/contact/2026-10-05/2026-10-05T07-11-01-490Z_1c21ff89-a427-436f-95e5-185e8c607e6c.json";

beforeEach(() => {
  vi.stubEnv("SUBMISSION_LINK_SECRET", "test-secret-0123456789");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("SUBMISSION_DETAILS_RECIPIENTS", () => {
  it("sends requested details to Taher and the developer inbox only", () => {
    expect(SUBMISSION_DETAILS_RECIPIENTS).toEqual([
      "taher@australianislamiccentre.org",
      "developer@australianislamiccentre.org",
    ]);
  });
});

describe("isRecordPath", () => {
  it("accepts the paths submission records are stored under", () => {
    expect(isRecordPath(PATH)).toBe(true);
    expect(isRecordPath(PATH.replace("production/contact", "preview/event-inquiry"))).toBe(true);
  });

  it.each([
    ["another folder", "secrets/contact/2026-10-05/x_1c21ff89-a427-436f-95e5-185e8c607e6c.json"],
    ["an unknown form", PATH.replace("contact", "donate")],
    ["path traversal", "production/contact/../../other.json"],
    ["a non-string", 42],
  ])("rejects %s", (_name, value) => {
    expect(isRecordPath(value)).toBe(false);
  });
});

describe("signRecordPath / verifyRecordPath", () => {
  it("verifies a signature it made", () => {
    const signature = signRecordPath(PATH);
    expect(signature).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(verifyRecordPath(PATH, signature)).toBe(true);
  });

  it("rejects a signature for a different record", () => {
    const signature = signRecordPath(PATH);
    const other = PATH.replace("1c21ff89", "2d32aa90");
    expect(verifyRecordPath(other, signature)).toBe(false);
  });

  it("rejects a made-up or missing signature", () => {
    expect(verifyRecordPath(PATH, "A".repeat(43))).toBe(false);
    expect(verifyRecordPath(PATH, undefined)).toBe(false);
  });

  it("rejects links signed with a different secret", () => {
    const signature = signRecordPath(PATH);
    vi.stubEnv("SUBMISSION_LINK_SECRET", "rotated-secret-9876543210");
    expect(verifyRecordPath(PATH, signature)).toBe(false);
  });

  it("makes no signatures and accepts none when the secret isn't set", () => {
    const signature = signRecordPath(PATH);
    vi.stubEnv("SUBMISSION_LINK_SECRET", "");
    expect(signRecordPath(PATH)).toBeNull();
    expect(verifyRecordPath(PATH, signature)).toBe(false);
  });

  it("refuses to sign anything that isn't a record path", () => {
    expect(signRecordPath("production/contact/../../other.json")).toBeNull();
  });
});

describe("submissionDetailsUrl", () => {
  it("links to the request page on the same site, with the record and its signature", () => {
    const url = new URL(submissionDetailsUrl("https://australianislamiccentre.org", PATH)!);

    expect(url.origin).toBe("https://australianislamiccentre.org");
    expect(url.pathname).toBe("/submission-details");
    expect(url.searchParams.get("record")).toBe(PATH);
    expect(verifyRecordPath(url.searchParams.get("record"), url.searchParams.get("sig"))).toBe(true);
  });

  it("returns null when links can't be signed", () => {
    vi.stubEnv("SUBMISSION_LINK_SECRET", "");
    expect(submissionDetailsUrl("https://australianislamiccentre.org", PATH)).toBeNull();
  });
});
