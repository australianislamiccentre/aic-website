import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { SanityDonationCampaign } from "@/types/sanity";

// Mock Stripe before importing the route
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/test",
          }),
        },
      },
    })),
    errors: {
      StripeError: class StripeError extends Error {},
    },
  };
});

// Mock Sanity client - define mock function at module level
const mockSanityFetch = vi.fn();
vi.mock("@/sanity/lib/client", () => ({
  client: {
    fetch: (...args: unknown[]) => mockSanityFetch(...args),
  },
}));

// Import after mocks
import { POST } from "./route";

describe("Create Campaign Subscription API", () => {
  const mockCampaign: Partial<SanityDonationCampaign> = {
    _id: "campaign-123",
    title: "Test Ramadan Campaign",
    slug: "test-ramadan",
    description: "A test campaign",
    startDate: "2025-03-10",
    endDate: "2025-03-20",
    presetAmounts: [5, 10, 20, 50],
    minimumAmount: 1,
    maximumAmount: 100,
    allowCustomAmount: true,
    active: true,
  };

  const mockOngoingCampaign: Partial<SanityDonationCampaign> = {
    ...mockCampaign,
    _id: "campaign-ongoing-123",
    title: "Ongoing Sadaqah",
    slug: "ongoing-sadaqah",
    endDate: undefined,
    isOngoing: true,
  };

  const validDonorInfo = {
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "0412345678",
    message: "",
    anonymous: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSanityFetch.mockReset();
    // Set environment variable
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");

    // Mock current date to be before campaign starts
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  // Helper to create request
  function createRequest(body: Record<string, unknown>): NextRequest {
    return new NextRequest("http://localhost:3000/api/create-campaign-subscription", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  describe("Input Validation", () => {
    it("rejects missing campaign slug", async () => {
      const request = createRequest({
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Campaign slug");
    });

    it("rejects missing daily amount", async () => {
      const request = createRequest({
        campaignSlug: "test-ramadan",
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Daily amount");
    });

    it("rejects missing donor email", async () => {
      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: { ...validDonorInfo, email: undefined },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("email");
    });
  });

  describe("Campaign Validation", () => {
    it("returns 404 for non-existent campaign", async () => {
      mockSanityFetch.mockResolvedValueOnce(null);

      const request = createRequest({
        campaignSlug: "non-existent",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });

    it("rejects inactive campaign", async () => {
      mockSanityFetch.mockResolvedValueOnce({ ...mockCampaign, active: false });

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("not currently active");
    });

    it("rejects signup before signup window opens", async () => {
      mockSanityFetch.mockResolvedValueOnce({
        ...mockCampaign,
        signupStartDate: "2025-03-05", // After current mock date of 2025-03-01
      });

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Signup opens on");
    });

    it("rejects signup after signup window closes", async () => {
      vi.setSystemTime(new Date("2025-03-25T12:00:00Z")); // After campaign end
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("closed");
    });
  });

  describe("Amount Validation", () => {
    it("rejects amount below minimum", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 0.5, // Below minimum of 1
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Minimum");
    });

    it("rejects amount above maximum", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 150, // Above maximum of 100
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Maximum");
    });

    it("rejects custom amount when not allowed", async () => {
      mockSanityFetch.mockResolvedValueOnce({
        ...mockCampaign,
        allowCustomAmount: false,
      });

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 7, // Not in preset amounts [5, 10, 20, 50]
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("preset amount");
    });

    it("accepts preset amount when custom not allowed", async () => {
      mockSanityFetch.mockResolvedValueOnce({
        ...mockCampaign,
        allowCustomAmount: false,
      });

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10, // In preset amounts
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBeDefined();
    });
  });

  describe("Ongoing Campaign Handling", () => {
    it("rejects upfront payment for ongoing campaigns", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockOngoingCampaign);

      const request = createRequest({
        campaignSlug: "ongoing-sadaqah",
        dailyAmount: 10,
        billingType: "upfront",
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Upfront payment is not available");
    });

    it("accepts daily subscription for ongoing campaigns", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockOngoingCampaign);

      const request = createRequest({
        campaignSlug: "ongoing-sadaqah",
        dailyAmount: 10,
        billingType: "daily",
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBeDefined();
      expect(data.billingInfo.isOngoing).toBe(true);
      expect(data.billingInfo.remainingDays).toBeUndefined();
      expect(data.billingInfo.totalAmount).toBeUndefined();
    });

    it("returns ongoing flag in billing info", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockOngoingCampaign);

      const request = createRequest({
        campaignSlug: "ongoing-sadaqah",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.billingInfo.isOngoing).toBe(true);
      expect(data.billingInfo.endDate).toBeUndefined();
    });
  });

  describe("Time-bound Campaign Success", () => {
    it("creates subscription for pre-signup (before campaign starts)", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe("cs_test_123");
      expect(data.url).toBe("https://checkout.stripe.com/test");
      expect(data.billingInfo.isLateJoin).toBe(false);
      expect(data.billingInfo.dailyAmount).toBe(10);
      expect(data.billingInfo.remainingDays).toBeGreaterThan(0);
    });

    it("calculates correct total for time-bound campaign", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Total should be dailyAmount * remainingDays
      expect(data.billingInfo.totalAmount).toBe(
        data.billingInfo.dailyAmount * data.billingInfo.remainingDays
      );
    });

    it("creates upfront payment for time-bound campaign", async () => {
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        billingType: "upfront",
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBeDefined();
    });

    it("handles late join correctly", async () => {
      // Set date to middle of campaign
      vi.setSystemTime(new Date("2025-03-15T12:00:00Z"));
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.billingInfo.isLateJoin).toBe(true);
      // Remaining days should be less than full campaign
      expect(data.billingInfo.remainingDays).toBeLessThan(11);
    });
  });

  describe("Ended Campaign Handling", () => {
    it("rejects signup for ended time-bound campaign", async () => {
      vi.setSystemTime(new Date("2025-03-25T12:00:00Z")); // After end date
      mockSanityFetch.mockResolvedValueOnce(mockCampaign);

      const request = createRequest({
        campaignSlug: "test-ramadan",
        dailyAmount: 10,
        donorInfo: validDonorInfo,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("closed");
    });
  });
});
