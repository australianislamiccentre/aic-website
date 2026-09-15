import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { render, screen, act, userEvent } from "@/test/test-utils";
import { FormEmbedSection } from "./FormEmbed";

const PAID_FORM = "https://pci.jotform.com/form/262558336270864";
const FREE_FORM = "https://form.jotform.com/AICFORM/2026-quran-halaqa";
// Mirrors the live siteSettings.allowedEmbedDomains list.
const SITE_DOMAINS = ["form.jotform.com", "docs.google.com", "form.typeform.com"];

function postFromWindow(origin: string, data: unknown) {
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { origin, data }));
  });
}

describe("FormEmbedSection", () => {
  it("shows a JotForm payment form served from pci.jotform.com (regression: paid registrations were hidden)", () => {
    render(<FormEmbedSection url={PAID_FORM} allowedDomains={SITE_DOMAINS} />);
    expect(screen.getByTitle("Registration Form")).toHaveAttribute("src", PAID_FORM);
  });

  it("shows a form whose domain is listed in Site Settings", () => {
    const url = "https://docs.google.com/forms/d/e/abc/viewform?embedded=true";
    render(<FormEmbedSection url={url} allowedDomains={SITE_DOMAINS} />);
    expect(screen.getByTitle("Registration Form")).toHaveAttribute("src", url);
  });

  it("renders nothing for an untrusted domain", () => {
    const { container } = render(
      <FormEmbedSection url="https://evil.example/form" allowedDomains={SITE_DOMAINS} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a non-HTTPS URL", () => {
    const { container } = render(
      <FormEmbedSection url="http://form.jotform.com/123" allowedDomains={SITE_DOMAINS} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the iframe out of the server HTML so the resize listener is attached before the form loads", () => {
    // Regression: a server-rendered iframe starts loading before hydration, and JotForm posts its
    // one setHeight message before the listener exists — leaving the form stuck in a 320px box.
    const html = renderToString(<FormEmbedSection url={FREE_FORM} allowedDomains={SITE_DOMAINS} />);
    expect(html).toContain("Register for this event");
    expect(html).not.toContain("<iframe");
  });

  it("grows the iframe to the height the form reports", () => {
    render(<FormEmbedSection url={FREE_FORM} allowedDomains={SITE_DOMAINS} />);
    postFromWindow("https://form.jotform.com", "setHeight:1358:261234567890");
    expect(screen.getByTitle("Registration Form")).toHaveStyle({ height: "1358px" });
  });

  it("ignores height messages from any other origin", () => {
    render(<FormEmbedSection url={FREE_FORM} allowedDomains={SITE_DOMAINS} />);
    postFromWindow("https://evil.example", "setHeight:5000:1");
    expect(screen.getByTitle("Registration Form")).toHaveStyle({ height: "320px" });
  });

  it("collapses and re-opens the form, announcing the state to screen readers", async () => {
    const user = userEvent.setup();
    render(<FormEmbedSection url={FREE_FORM} allowedDomains={SITE_DOMAINS} />);
    const toggle = screen.getByRole("button", { name: /register for this event/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTitle("Registration Form")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTitle("Registration Form")).toBeInTheDocument();
  });
});
