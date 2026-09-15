import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { EventContactForm } from "./EventContactForm";

describe("EventContactForm", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function fillAndSubmit() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/first name/i), "Omar");
    await user.type(screen.getByLabelText(/last name/i), "Khan");
    await user.type(screen.getByLabelText(/email/i), "omar@example.com");
    await user.type(screen.getByLabelText(/message/i), "Can I attend?");
    await user.click(screen.getByRole("button", { name: /send/i }));
  }

  it("identifies the event by slug and never sends a recipient address (open-relay regression)", async () => {
    render(<EventContactForm eventName="Community Iftar" eventSlug="community-iftar" />);
    await fillAndSubmit();

    expect(fetchMock).toHaveBeenCalledWith("/api/event-inquiry", expect.anything());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({
      eventSlug: "community-iftar",
      firstName: "Omar",
      email: "omar@example.com",
      message: "Can I attend?",
    });
    expect(body).not.toHaveProperty("contactEmail");
  });

  it("shows the event name in the message placeholder", () => {
    render(<EventContactForm eventName="Community Iftar" eventSlug="community-iftar" />);
    expect(screen.getByLabelText(/message/i)).toHaveAttribute("placeholder", "Question about Community Iftar...");
  });

  it("shows the server's error message when the enquiry is rejected", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "This event isn't accepting enquiries." }),
    });
    render(<EventContactForm eventName="Community Iftar" eventSlug="community-iftar" />);
    await fillAndSubmit();

    expect(await screen.findByText("This event isn't accepting enquiries.")).toBeInTheDocument();
  });
});
