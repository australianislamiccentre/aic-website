/**
 * Tests for email-templates.ts
 *
 * Covers: all template generators produce valid HTML, user input is escaped,
 * subject lines contain expected content, and all template types work.
 */
import { describe, it, expect } from "vitest";
import {
  contactNotificationEmail,
  contactConfirmationEmail,
  serviceNotificationEmail,
  serviceConfirmationEmail,
  eventNotificationEmail,
  eventConfirmationEmail,
  subscribeNotificationEmail,
  escapeHtml,
} from "./email-templates";
import type { ContactFormData, ServiceInquiryFormData, EventInquiryFormData } from "./contact-validation";
import { makeEmptyRequestMeta, makeRequestMeta } from "@/test/request-meta-fixtures";

// ---------------------------------------------------------------------------
// escapeHtml
// ---------------------------------------------------------------------------
describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert('xss')&lt;/script&gt;"
    );
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });
});

// ---------------------------------------------------------------------------
// contactNotificationEmail
// ---------------------------------------------------------------------------
describe("contactNotificationEmail", () => {
  const data: ContactFormData = {
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    phone: "0412345678",
    inquiryType: "General",
    message: "Hello, I have a question.",
  };

  it("returns subject containing inquiry type", () => {
    const result = contactNotificationEmail(data);
    expect(result.subject).toContain("General");
  });

  it("generates valid HTML with DOCTYPE", () => {
    const result = contactNotificationEmail(data);
    expect(result.html).toContain("<!DOCTYPE html>");
  });

  it("includes the submitter name", () => {
    const result = contactNotificationEmail(data);
    expect(result.html).toContain("John");
    expect(result.html).toContain("Smith");
  });

  it("includes the email as a mailto link", () => {
    const result = contactNotificationEmail(data);
    expect(result.html).toContain("john@example.com");
    expect(result.html).toContain("mailto:");
  });

  it("includes the message", () => {
    const result = contactNotificationEmail(data);
    expect(result.html).toContain("I have a question");
  });

  it("escapes XSS in user input", () => {
    const xssData: ContactFormData = {
      ...data,
      firstName: '<script>alert("xss")</script>',
      message: '<img onerror="alert(1)" src="x">',
    };
    const result = contactNotificationEmail(xssData);
    expect(result.html).not.toContain("<script>");
    expect(result.html).not.toContain('<img onerror=');
    expect(result.html).toContain("&lt;script&gt;");
    expect(result.html).toContain("&lt;img onerror=");
  });

  it("shows 'Not provided' when phone is missing", () => {
    const result = contactNotificationEmail({ ...data, phone: undefined });
    expect(result.html).toContain("Not provided");
  });
});

// ---------------------------------------------------------------------------
// contactConfirmationEmail
// ---------------------------------------------------------------------------
describe("contactConfirmationEmail", () => {
  const data: ContactFormData = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    inquiryType: "Feedback",
    message: "Great work!",
  };

  it("returns a user-facing subject line", () => {
    const result = contactConfirmationEmail(data);
    expect(result.subject).toContain("received your message");
  });

  it("greets the user by first name", () => {
    const result = contactConfirmationEmail(data);
    expect(result.html).toContain("Jane");
    expect(result.html).toContain("Assalamu Alaikum");
  });

  it("includes the AIC logo", () => {
    const result = contactConfirmationEmail(data);
    expect(result.html).toContain("aic%20logo.png");
  });

  it("includes footer with address", () => {
    const result = contactConfirmationEmail(data);
    expect(result.html).toContain("Blenheim Rd");
    expect(result.html).toContain("Newport");
  });
});

// ---------------------------------------------------------------------------
// serviceNotificationEmail
// ---------------------------------------------------------------------------
describe("serviceNotificationEmail", () => {
  const data: ServiceInquiryFormData = {
    firstName: "Ali",
    lastName: "Hassan",
    email: "ali@example.com",
    serviceName: "Funeral Services",
    message: "Please advise on arrangements.",
  };

  it("returns subject with service name", () => {
    const result = serviceNotificationEmail(data);
    expect(result.subject).toContain("Funeral Services");
  });

  it("generates HTML containing the service name", () => {
    const result = serviceNotificationEmail(data);
    expect(result.html).toContain("Funeral Services");
  });

  it("escapes HTML in service name", () => {
    const result = serviceNotificationEmail({
      ...data,
      serviceName: '<img src="x">',
    });
    expect(result.html).not.toContain('<img src="x">');
    expect(result.html).toContain("&lt;img");
  });
});

// ---------------------------------------------------------------------------
// serviceConfirmationEmail
// ---------------------------------------------------------------------------
describe("serviceConfirmationEmail", () => {
  const data: ServiceInquiryFormData = {
    firstName: "Sara",
    lastName: "Ali",
    email: "sara@example.com",
    serviceName: "Education",
    message: "I want to enrol.",
  };

  it("returns subject referencing the service", () => {
    const result = serviceConfirmationEmail(data);
    expect(result.subject).toContain("Education");
  });

  it("greets the user", () => {
    const result = serviceConfirmationEmail(data);
    expect(result.html).toContain("Sara");
  });
});

// ---------------------------------------------------------------------------
// eventNotificationEmail
// ---------------------------------------------------------------------------
describe("eventNotificationEmail", () => {
  const data: EventInquiryFormData = {
    firstName: "Omar",
    lastName: "Khan",
    email: "omar@example.com",
    eventName: "Community Iftar",
    message: "Can I bring guests?",
  };

  it("returns subject with event name", () => {
    const result = eventNotificationEmail(data);
    expect(result.subject).toContain("Community Iftar");
  });

  it("generates HTML with event name", () => {
    const result = eventNotificationEmail(data);
    expect(result.html).toContain("Community Iftar");
  });
});

// ---------------------------------------------------------------------------
// eventConfirmationEmail
// ---------------------------------------------------------------------------
describe("eventConfirmationEmail", () => {
  const data: EventInquiryFormData = {
    firstName: "Fatima",
    lastName: "Zain",
    email: "fatima@example.com",
    eventName: "Youth Camp",
    message: "My child wants to attend.",
  };

  it("returns subject referencing the event", () => {
    const result = eventConfirmationEmail(data);
    expect(result.subject).toContain("Youth Camp");
  });

  it("greets the user", () => {
    const result = eventConfirmationEmail(data);
    expect(result.html).toContain("Fatima");
  });
});

// ---------------------------------------------------------------------------
// subscribeNotificationEmail
// ---------------------------------------------------------------------------
describe("subscribeNotificationEmail", () => {
  it("returns subject with subscriber name", () => {
    const result = subscribeNotificationEmail({
      email: "sub@example.com",
      name: "Ahmed",
    });
    expect(result.subject).toContain("Ahmed");
  });

  it("falls back to email in subject when name is missing", () => {
    const result = subscribeNotificationEmail({ email: "sub@example.com" });
    expect(result.subject).toContain("sub@example.com");
  });

  it("includes email in the HTML body", () => {
    const result = subscribeNotificationEmail({ email: "sub@example.com" });
    expect(result.html).toContain("sub@example.com");
  });

  it("includes name when provided", () => {
    const result = subscribeNotificationEmail({
      email: "sub@example.com",
      name: "Ahmed",
    });
    expect(result.html).toContain("Ahmed");
  });

  it("includes phone when provided", () => {
    const result = subscribeNotificationEmail({
      email: "sub@example.com",
      phone: "0400000000",
    });
    expect(result.html).toContain("0400000000");
  });

  it("omits name row when not provided", () => {
    const result = subscribeNotificationEmail({ email: "sub@example.com" });
    // Should not have a Name label row
    expect(result.html).not.toContain(">Name<");
  });

  it("includes WhatsApp preference when true", () => {
    const result = subscribeNotificationEmail({
      email: "sub@example.com",
      whatsapp: true,
    });
    expect(result.html).toContain("WhatsApp Group");
    expect(result.html).toContain("Yes");
  });

  it("shows No for WhatsApp when not opted in", () => {
    const result = subscribeNotificationEmail({
      email: "sub@example.com",
      whatsapp: false,
    });
    expect(result.html).toContain("WhatsApp Group");
    expect(result.html).toContain("No");
  });
});

// ---------------------------------------------------------------------------
// Phone field HTML escaping (regression: issue #70)
//
// The `phone` field was interpolated raw into every notification/confirmation
// email while the module claimed all input was escaped. A short payload like
// `<img src=x>` fits under MAX_PHONE=20 and injected markup into staff emails.
// ---------------------------------------------------------------------------
describe("phone field HTML escaping (#70)", () => {
  const MALICIOUS_PHONE = '<img src="x" onerror="alert(1)">';

  const generators: Array<[string, () => { html: string }]> = [
    [
      "contactNotificationEmail",
      () =>
        contactNotificationEmail({
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phone: MALICIOUS_PHONE,
          inquiryType: "General",
          message: "Hello",
        }),
    ],
    [
      "contactConfirmationEmail",
      () =>
        contactConfirmationEmail({
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phone: MALICIOUS_PHONE,
          inquiryType: "General",
          message: "Hello",
        }),
    ],
    [
      "serviceNotificationEmail",
      () =>
        serviceNotificationEmail({
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phone: MALICIOUS_PHONE,
          serviceName: "Funeral Services",
          message: "Hello",
        }),
    ],
    [
      "serviceConfirmationEmail",
      () =>
        serviceConfirmationEmail({
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phone: MALICIOUS_PHONE,
          serviceName: "Funeral Services",
          message: "Hello",
        }),
    ],
    [
      "eventNotificationEmail",
      () =>
        eventNotificationEmail({
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phone: MALICIOUS_PHONE,
          eventName: "Community Iftar",
          message: "Hello",
        }),
    ],
    [
      "eventConfirmationEmail",
      () =>
        eventConfirmationEmail({
          firstName: "John",
          lastName: "Smith",
          email: "john@example.com",
          phone: MALICIOUS_PHONE,
          eventName: "Community Iftar",
          message: "Hello",
        }),
    ],
  ];

  it.each(generators)(
    "%s escapes a malicious phone value into inert markup",
    (_name, generate) => {
      const { html } = generate();
      // The raw payload must NOT survive; the escaped entity MUST be present.
      expect(html).not.toContain(MALICIOUS_PHONE);
      expect(html).toContain("&lt;img src=&quot;x&quot;");
    }
  );

  it("subscribeNotificationEmail escapes a malicious phone value", () => {
    const { html } = subscribeNotificationEmail({
      email: "sub@example.com",
      phone: MALICIOUS_PHONE,
    });
    expect(html).not.toContain(MALICIOUS_PHONE);
    expect(html).toContain("&lt;img src=&quot;x&quot;");
  });

  it("still shows 'Not provided' when phone is missing", () => {
    const { html } = contactNotificationEmail({
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phone: undefined,
      inquiryType: "General",
      message: "Hello",
    });
    expect(html).toContain("Not provided");
  });
});

// ---------------------------------------------------------------------------
// Branding assets
// ---------------------------------------------------------------------------
describe("email logo", () => {
  it("loads from the public site, not the login-protected aic-website.vercel.app host (regression: broken logo)", () => {
    const { html } = contactConfirmationEmail({
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      inquiryType: "General",
      message: "Hello",
    });
    expect(html).toContain('src="https://australianislamiccentre.org/images/aic%20logo.png"');
    expect(html).not.toContain("vercel.app");
  });
});

// ---------------------------------------------------------------------------
// Request details (security record) on staff notifications
// ---------------------------------------------------------------------------
describe("request details block", () => {
  const details = { submissionId: "3f2b9c1e-0000-4000-8000-000000000001", meta: makeRequestMeta() };
  const contact: ContactFormData = {
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    inquiryType: "General",
    message: "Hello",
  };

  const notifications: Array<[string, (d?: typeof details) => { html: string }]> = [
    ["contactNotificationEmail", (d) => contactNotificationEmail(contact, d)],
    ["serviceNotificationEmail", (d) => serviceNotificationEmail({ ...contact, serviceName: "Nikah" }, d)],
    ["eventNotificationEmail", (d) => eventNotificationEmail({ ...contact, eventName: "Open Day" }, d)],
    ["subscribeNotificationEmail", (d) => subscribeNotificationEmail({ email: "sub@example.com" }, d)],
  ];

  it.each(notifications)("%s shows the request details when given", (_name, build) => {
    const { html } = build(details);
    expect(html).toContain("Request details");
    expect(html).toContain(details.submissionId);
    expect(html).toContain("203.0.113.7");
  });

  it.each(notifications)("%s has no request details when none are given", (_name, build) => {
    expect(build().html).not.toContain("Request details");
  });

  it("lists the IP, raw x-forwarded-for, location, browser and Vercel request ID", () => {
    const meta = makeRequestMeta({
      ipHeaders: { xForwardedFor: "1.1.1.1, 203.0.113.7", xRealIp: "203.0.113.7", xVercelForwardedFor: "203.0.113.7" },
    });
    const { html } = contactNotificationEmail(contact, { submissionId: "sub-1", meta });

    expect(html).toContain("IP address");
    expect(html).toContain("1.1.1.1, 203.0.113.7");
    expect(html).toContain("Newport, VIC 3015, AU");
    expect(html).toContain("-37.8444, 144.8836");
    expect(html).toContain("Australia/Melbourne");
    expect(html).toContain("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");
    expect(html).toContain("en-AU,en;q=0.9");
    expect(html).toContain("https://australianislamiccentre.org/contact");
    expect(html).toContain("syd1::iad1::abcde-1759622400000-0123456789ab");
    expect(html).toContain("t13d1516h2_8daaf6152771_02713d6af862");
  });

  it("shows the time received in Melbourne time and in UTC", () => {
    const { html } = contactNotificationEmail(contact, details);
    // 01:02 UTC on 5 Oct 2026 is 12:02 pm AEDT
    expect(html).toContain("12:02 pm");
    expect(html).toContain("2026-10-05T01:02:03.456Z");
  });

  it("escapes header values, which the sender controls", () => {
    const meta = makeRequestMeta({
      client: { ...makeRequestMeta().client, userAgent: '<img src=x onerror="alert(1)">' },
    });
    const { html } = contactNotificationEmail(contact, { submissionId: "sub-1", meta });

    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("shows 'Not available' for anything the request didn't include", () => {
    const { html } = contactNotificationEmail(contact, { submissionId: "sub-1", meta: makeEmptyRequestMeta() });

    expect(html).toContain("unknown");
    expect(html).toContain("Not available");
    expect(html).not.toContain("null");
  });
});
