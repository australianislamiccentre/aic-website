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
  submissionDetailsEmail,
  escapeHtml,
} from "./email-templates";
import type { SubmissionRecord } from "./submission-record";
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
// Staff notifications: reference + "Request details" link, never the IP
// ---------------------------------------------------------------------------
describe("staff notification reference", () => {
  const reference = {
    submissionId: "1c21ff89-a427-436f-95e5-185e8c607e6c",
    detailsUrl: "https://australianislamiccentre.org/submission-details?record=production%2Fcontact%2Fx.json&sig=abc",
  };
  const contact: ContactFormData = {
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    inquiryType: "General",
    message: "Hello",
  };

  const notifications: Array<[string, (r?: typeof reference) => { html: string }]> = [
    ["contactNotificationEmail", (r) => contactNotificationEmail(contact, r)],
    ["serviceNotificationEmail", (r) => serviceNotificationEmail({ ...contact, serviceName: "Nikah" }, r)],
    ["eventNotificationEmail", (r) => eventNotificationEmail({ ...contact, eventName: "Open Day" }, r)],
    ["subscribeNotificationEmail", (r) => subscribeNotificationEmail({ email: "sub@example.com" }, r)],
  ];

  it.each(notifications)("%s shows the reference and a Request details link", (_name, build) => {
    const { html } = build(reference);
    expect(html).toContain(`Ref ${reference.submissionId}`);
    expect(html).toContain(`href="${escapeHtml(reference.detailsUrl)}"`);
    expect(html).toContain(">Request details</a>");
  });

  it.each(notifications)("%s has no reference when none is given", (_name, build) => {
    const { html } = build();
    expect(html).not.toContain("Ref ");
    expect(html).not.toContain("Request details");
  });

  it("shows just the reference when links can't be signed", () => {
    const { html } = contactNotificationEmail(contact, { ...reference, detailsUrl: null });
    expect(html).toContain(`Ref ${reference.submissionId}`);
    expect(html).not.toContain("Request details");
  });
});

// ---------------------------------------------------------------------------
// Submission details email (sent when someone uses the Request details link)
// ---------------------------------------------------------------------------
describe("submissionDetailsEmail", () => {
  const PATH = "production/contact/2026-10-05/2026-10-05T01-02-03-456Z_1c21ff89-a427-436f-95e5-185e8c607e6c.json";
  const record: SubmissionRecord = {
    submissionId: "1c21ff89-a427-436f-95e5-185e8c607e6c",
    form: "contact",
    environment: "production",
    fields: {
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phone: "0412345678",
      inquiryType: "General",
      message: "A message body",
    },
    security: makeRequestMeta({
      ipHeaders: { xForwardedFor: "1.1.1.1, 203.0.113.7", xRealIp: "203.0.113.7", xVercelForwardedFor: "203.0.113.7" },
    }),
    emails: { notification: "email-notification", confirmation: "email-confirmation" },
  };

  it("names the form and the reference in the subject", () => {
    expect(submissionDetailsEmail(record, PATH).subject).toBe(
      "Submission details: contact form (Ref 1c21ff89-a427-436f-95e5-185e8c607e6c)",
    );
  });

  it("includes everything submitted", () => {
    const { html } = submissionDetailsEmail(record, PATH);
    for (const value of ["John", "Smith", "john@example.com", "0412345678", "General", "A message body"]) {
      expect(html).toContain(value);
    }
    expect(html).toContain("First name");
    expect(html).toContain("Enquiry type");
  });

  it("includes the request details: IP, raw x-forwarded-for, location, browser, Vercel request ID", () => {
    const { html } = submissionDetailsEmail(record, PATH);

    expect(html).toContain("Request details");
    expect(html).toContain("1.1.1.1, 203.0.113.7");
    expect(html).toContain("Newport, VIC 3015, AU");
    expect(html).toContain("-37.8444, 144.8836");
    expect(html).toContain("Australia/Melbourne");
    expect(html).toContain("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");
    expect(html).toContain("en-AU,en;q=0.9");
    expect(html).toContain("syd1::iad1::abcde-1759622400000-0123456789ab");
    expect(html).toContain("t13d1516h2_8daaf6152771_02713d6af862");
  });

  it("shows the time received in Melbourne time and in UTC", () => {
    const { html } = submissionDetailsEmail(record, PATH);
    // 01:02 UTC on 5 Oct 2026 is 12:02 pm AEDT
    expect(html).toContain("12:02 pm");
    expect(html).toContain("2026-10-05T01:02:03.456Z");
  });

  it("says where the record is stored and which emails were sent", () => {
    const { html } = submissionDetailsEmail(record, PATH);
    expect(html).toContain(PATH);
    expect(html).toContain("email-notification");
    expect(html).toContain("email-confirmation");
  });

  it("shows yes/no for checkboxes such as the WhatsApp opt-in", () => {
    const signup = { ...record, form: "subscribe" as const, fields: { email: "sub@example.com", whatsapp: true } };
    const { html, subject } = submissionDetailsEmail(signup, PATH);
    expect(subject).toContain("newsletter sign-up");
    expect(html).toContain("WhatsApp group");
    expect(html).toContain("Yes");
  });

  it("escapes everything, since the sender controls the fields and headers", () => {
    const hostile = {
      ...record,
      fields: { ...record.fields, firstName: "<script>alert(1)</script>" },
      security: makeRequestMeta({
        client: { ...makeRequestMeta().client, userAgent: '<img src=x onerror="alert(1)">' },
      }),
    };
    const { html } = submissionDetailsEmail(hostile, PATH);

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("shows 'Not available' for anything the request didn't include", () => {
    const { html } = submissionDetailsEmail({ ...record, security: makeEmptyRequestMeta() }, PATH);

    expect(html).toContain("unknown");
    expect(html).toContain("Not available");
    expect(html).not.toContain(">null<");
  });
});
