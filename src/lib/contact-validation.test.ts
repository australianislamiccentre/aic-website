/**
 * Tests for contact-validation.ts
 *
 * Covers all three validators: validateContactForm, validateServiceInquiry, validateEventInquiry.
 * Tests required fields, email format, length limits, trimming, and type coercion.
 */
import { describe, it, expect } from "vitest";
import {
  validateContactForm,
  validateServiceInquiry,
  validateEventInquiry,
} from "./contact-validation";

// ---------------------------------------------------------------------------
// validateContactForm
// ---------------------------------------------------------------------------
describe("validateContactForm", () => {
  const validData = {
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    phone: "0412345678",
    inquiryType: "General",
    message: "Hello, I have a question.",
  };

  it("accepts valid data and returns trimmed/lowercased values", () => {
    const result = validateContactForm({
      ...validData,
      firstName: "  John  ",
      email: "John@Example.COM",
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.firstName).toBe("John");
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("phone is optional", () => {
    const { phone: _, ...noPhone } = validData;
    const result = validateContactForm(noPhone);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.phone).toBeUndefined();
    }
  });

  it("rejects null body", () => {
    expect(validateContactForm(null)).toEqual({
      valid: false,
      error: "Invalid request body",
    });
  });

  it("rejects non-object body", () => {
    expect(validateContactForm("string")).toEqual({
      valid: false,
      error: "Invalid request body",
    });
  });

  it("rejects missing firstName", () => {
    const { firstName: _, ...data } = validData;
    const result = validateContactForm(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/first name/i);
  });

  it("rejects empty firstName", () => {
    const result = validateContactForm({ ...validData, firstName: "   " });
    expect(result.valid).toBe(false);
  });

  it("rejects missing lastName", () => {
    const { lastName: _, ...data } = validData;
    const result = validateContactForm(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/last name/i);
  });

  it("rejects missing email", () => {
    const { email: _, ...data } = validData;
    const result = validateContactForm(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/email/i);
  });

  it("rejects invalid email format", () => {
    const result = validateContactForm({ ...validData, email: "not-an-email" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/email/i);
  });

  it("rejects missing inquiryType", () => {
    const { inquiryType: _, ...data } = validData;
    const result = validateContactForm(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/enquiry type/i);
  });

  it("rejects missing message", () => {
    const { message: _, ...data } = validData;
    const result = validateContactForm(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/message/i);
  });

  it("rejects empty message (whitespace only)", () => {
    const result = validateContactForm({ ...validData, message: "   " });
    expect(result.valid).toBe(false);
  });

  it("rejects firstName exceeding 100 characters", () => {
    const result = validateContactForm({
      ...validData,
      firstName: "a".repeat(101),
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/first name/i);
  });

  it("rejects lastName exceeding 100 characters", () => {
    const result = validateContactForm({
      ...validData,
      lastName: "a".repeat(101),
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/last name/i);
  });

  it("rejects email exceeding 254 characters", () => {
    const result = validateContactForm({
      ...validData,
      email: "a".repeat(246) + "@test.com",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/email/i);
  });

  it("rejects phone exceeding 20 characters", () => {
    const result = validateContactForm({
      ...validData,
      phone: "1".repeat(21),
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/phone/i);
  });

  it("rejects inquiryType exceeding 200 characters", () => {
    const result = validateContactForm({
      ...validData,
      inquiryType: "a".repeat(201),
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/enquiry type/i);
  });

  it("rejects message exceeding 5000 characters", () => {
    const result = validateContactForm({
      ...validData,
      message: "a".repeat(5001),
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/message/i);
  });
});

// ---------------------------------------------------------------------------
// validateServiceInquiry
// ---------------------------------------------------------------------------
describe("validateServiceInquiry", () => {
  const validData = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    serviceName: "Funeral Services",
    message: "I need information about this service.",
  };

  it("accepts valid data", () => {
    const result = validateServiceInquiry(validData);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.serviceName).toBe("Funeral Services");
    }
  });

  it("rejects null body", () => {
    expect(validateServiceInquiry(null).valid).toBe(false);
  });

  it("rejects missing firstName", () => {
    const { firstName: _, ...data } = validData;
    const result = validateServiceInquiry(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/first name/i);
  });

  it("rejects missing lastName", () => {
    const { lastName: _, ...data } = validData;
    const result = validateServiceInquiry(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/last name/i);
  });

  it("rejects invalid email", () => {
    const result = validateServiceInquiry({ ...validData, email: "bad" });
    expect(result.valid).toBe(false);
  });

  it("rejects missing serviceName", () => {
    const { serviceName: _, ...data } = validData;
    const result = validateServiceInquiry(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/service name/i);
  });

  it("rejects serviceName exceeding 200 characters", () => {
    const result = validateServiceInquiry({
      ...validData,
      serviceName: "x".repeat(201),
    });
    expect(result.valid).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...data } = validData;
    const result = validateServiceInquiry(data);
    expect(result.valid).toBe(false);
  });

  it("phone is optional", () => {
    const result = validateServiceInquiry(validData);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.data.phone).toBeUndefined();
  });

  it("rejects phone exceeding 20 characters", () => {
    const result = validateServiceInquiry({
      ...validData,
      phone: "1".repeat(21),
    });
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateEventInquiry
// ---------------------------------------------------------------------------
describe("validateEventInquiry", () => {
  const validData = {
    firstName: "Ali",
    lastName: "Hassan",
    email: "ali@example.com",
    eventSlug: "community-iftar",
    message: "How can I participate?",
  };

  it("accepts valid data and identifies the event by slug", () => {
    const result = validateEventInquiry(validData);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.eventSlug).toBe("community-iftar");
    }
  });

  it("never passes a client-supplied recipient or event name through (open-relay regression)", () => {
    const result = validateEventInquiry({
      ...validData,
      contactEmail: "victim@example.com",
      eventName: "Your account is suspended",
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).not.toHaveProperty("contactEmail");
      expect(result.data).not.toHaveProperty("eventName");
    }
  });

  it("rejects null body", () => {
    expect(validateEventInquiry(null).valid).toBe(false);
  });

  it("rejects missing firstName", () => {
    const { firstName: _, ...data } = validData;
    expect(validateEventInquiry(data).valid).toBe(false);
  });

  it("rejects missing eventSlug", () => {
    const { eventSlug: _, ...data } = validData;
    const result = validateEventInquiry(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/event/i);
  });

  it("rejects eventSlug exceeding 200 characters", () => {
    const result = validateEventInquiry({
      ...validData,
      eventSlug: "x".repeat(201),
    });
    expect(result.valid).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...data } = validData;
    expect(validateEventInquiry(data).valid).toBe(false);
  });

  it("lowercases email", () => {
    const result = validateEventInquiry({
      ...validData,
      email: "ALI@Example.COM",
    });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.data.email).toBe("ali@example.com");
  });
});
