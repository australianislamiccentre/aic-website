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
