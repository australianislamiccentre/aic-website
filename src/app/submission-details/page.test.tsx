/**
 * Tests for the /submission-details server page: it only offers the button for
 * links carrying this site's signature, and is kept out of search engines.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import SubmissionDetailsPage, { metadata } from "./page";
import { signRecordPath } from "@/lib/submission-link";

const PATH = "production/contact/2026-10-05/2026-10-05T01-02-03-456Z_1c21ff89-a427-436f-95e5-185e8c607e6c.json";

async function renderPage(params: Record<string, string>) {
  render(await SubmissionDetailsPage({ searchParams: Promise.resolve(params) }));
}

describe("/submission-details page", () => {
  beforeEach(() => {
    vi.stubEnv("SUBMISSION_LINK_SECRET", "test-secret-0123456789");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("offers the button, with the reference, for a signed link", async () => {
    await renderPage({ record: PATH, sig: signRecordPath(PATH)! });

    expect(screen.getByRole("button", { name: "Send details" })).toBeInTheDocument();
    expect(screen.getByText(/1c21ff89-a427-436f-95e5-185e8c607e6c/)).toBeInTheDocument();
  });

  it("refuses a link with a wrong or missing signature", async () => {
    await renderPage({ record: PATH, sig: "A".repeat(43) });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("This link isn't valid");
  });

  it("refuses a link with no record", async () => {
    await renderPage({});
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("is kept out of search engines", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
