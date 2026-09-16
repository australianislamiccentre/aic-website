import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const { sendMock, contactsCreateMock, contactsUpdateMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  contactsCreateMock: vi.fn(),
  contactsUpdateMock: vi.fn(),
}));

vi.mock("@/lib/resend", () => ({
  getResendClient: () => ({
    emails: { send: sendMock },
    contacts: { create: contactsCreateMock, update: contactsUpdateMock },
  }),
}));

import { addToNewsletterAudience, isProductionDeployment, sendEmail } from "./email-delivery";

const email = {
  from: "AIC Website <forms@aic.example>",
  to: "staff@aic.example",
  replyTo: "visitor@example.com",
  subject: "New Contact Enquiry: General",
  html: "<p>Hello</p>",
};

const subscriber = {
  audienceId: "aud_123",
  email: "sub@example.com",
  firstName: "Ahmed",
  lastName: "Khan",
  unsubscribed: false,
  properties: { phone: "0412345678", whatsapp: "no" },
};

beforeEach(() => {
  sendMock.mockReset().mockResolvedValue({ data: { id: "email-1" }, error: null });
  contactsCreateMock.mockReset().mockResolvedValue({ data: { id: "contact-1" }, error: null });
  contactsUpdateMock.mockReset().mockResolvedValue({ data: { id: "contact-1" }, error: null });
  // Start every test as local development: no Vercel environment, no test inbox
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "");
  vi.stubEnv("EMAIL_TEST_RECIPIENT", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("isProductionDeployment", () => {
  it("is true on the production deployment", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isProductionDeployment()).toBe(true);
  });

  it("is false on preview deployments and in local development", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(isProductionDeployment()).toBe(false);
    vi.stubEnv("VERCEL_ENV", "");
    expect(isProductionDeployment()).toBe(false);
  });

  it("falls back to the build-time NEXT_PUBLIC_VERCEL_ENV when VERCEL_ENV isn't set at runtime", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");
    expect(isProductionDeployment()).toBe(true);
  });
});

describe("sendEmail", () => {
  it("sends to the real recipient on the production deployment", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("EMAIL_TEST_RECIPIENT", "tester@aic.example");

    await sendEmail(email);

    expect(sendMock).toHaveBeenCalledWith(email);
  });

  it("redirects email to the test inbox on a preview deployment, naming the intended recipient", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("EMAIL_TEST_RECIPIENT", "tester@aic.example");

    await sendEmail(email);

    expect(sendMock).toHaveBeenCalledWith({
      ...email,
      to: "tester@aic.example",
      subject: "[TEST → staff@aic.example] New Contact Enquiry: General",
    });
  });

  it("redirects email in local development too", async () => {
    vi.stubEnv("EMAIL_TEST_RECIPIENT", "tester@aic.example");

    await sendEmail(email);

    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ to: "tester@aic.example" }));
  });

  it("sends nothing outside production when no test inbox is set, and says how to get test emails", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await sendEmail(email);

    expect(sendMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("EMAIL_TEST_RECIPIENT"));
  });

  it("logs a rejection from Resend, which reports failures instead of throwing", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    sendMock.mockResolvedValue({ data: null, error: { name: "validation_error", message: "Invalid `to` field" } });
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});

    await sendEmail(email);

    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining("New Contact Enquiry: General"),
      expect.objectContaining({ message: "Invalid `to` field" }),
    );
  });
});

describe("addToNewsletterAudience", () => {
  it("adds the subscriber to the Resend audience on the production deployment", async () => {
    vi.stubEnv("VERCEL_ENV", "production");

    await addToNewsletterAudience(subscriber);

    expect(contactsCreateMock).toHaveBeenCalledWith(subscriber);
    expect(contactsUpdateMock).not.toHaveBeenCalled();
  });

  it("updates the contact instead when Resend can't create it (e.g. already subscribed)", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    contactsCreateMock.mockResolvedValue({ data: null, error: { name: "validation_error", message: "Contact already exists" } });

    await addToNewsletterAudience(subscriber);

    expect(contactsUpdateMock).toHaveBeenCalledWith(subscriber);
  });

  it("keeps test sign-ups out of the real audience outside production", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await addToNewsletterAudience(subscriber);

    expect(contactsCreateMock).not.toHaveBeenCalled();
    expect(contactsUpdateMock).not.toHaveBeenCalled();
  });
});

describe("API routes", () => {
  it("never use the Resend client directly, so none can bypass the non-production guard", () => {
    const apiDir = path.resolve(__dirname, "../app/api");
    const routes = readdirSync(apiDir, { recursive: true, encoding: "utf8" }).filter(
      (file) => file.endsWith("route.ts"),
    );
    const direct = routes.filter((file) => readFileSync(path.join(apiDir, file), "utf8").includes("getResendClient"));

    expect(routes.length).toBeGreaterThan(0);
    expect(direct).toEqual([]);
  });
});
