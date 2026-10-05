/**
 * Tests for the "Request details" page: one button that emails a submission's
 * full record to IT.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import SubmissionDetailsContent from "./SubmissionDetailsContent";

const PATH = "production/contact/2026-10-05/2026-10-05T01-02-03-456Z_1c21ff89-a427-436f-95e5-185e8c607e6c.json";
const props = { record: PATH, sig: "signature", reference: "1c21ff89-a427-436f-95e5-185e8c607e6c", valid: true };

function respond(status: number, body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
}

describe("SubmissionDetailsContent", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(() => respond(200, { success: true }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks before sending, naming the submission", () => {
    render(<SubmissionDetailsContent {...props} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Request submission details");
    expect(screen.getByText(/1c21ff89-a427-436f-95e5-185e8c607e6c/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send details" })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the signed record path when the button is pressed, then confirms", async () => {
    render(<SubmissionDetailsContent {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "Send details" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/submission-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record: PATH, sig: "signature" }),
    });
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Details sent");
    expect(screen.queryByRole("button", { name: "Send details" })).not.toBeInTheDocument();
  });

  it("shows the server's error and lets them try again", async () => {
    fetchMock.mockImplementationOnce(() => respond(404, { error: "We couldn't find the details for this submission." }));
    render(<SubmissionDetailsContent {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "Send details" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't find the details for this submission.");
    await userEvent.click(screen.getByRole("button", { name: "Send details" }));
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Details sent");
  });

  it("shows a general error when the request fails", async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError("Failed to fetch")));
    render(<SubmissionDetailsContent {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "Send details" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/couldn't send/i));
  });

  it("explains an invalid link and offers no button", () => {
    render(<SubmissionDetailsContent record={null} sig={null} reference={null} valid={false} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("This link isn't valid");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
