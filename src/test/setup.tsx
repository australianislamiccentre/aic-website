import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next/headers (used by Sanity fetch)
vi.mock("next/headers", () => ({
  draftMode: () => ({ isEnabled: false }),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => new Headers(),
}));

// Mock Sanity fetch functions - return empty arrays so fallback content is used
vi.mock("@/sanity/lib/fetch", () => ({
  getEvents: vi.fn().mockResolvedValue([]),
  getEventsForStaticGeneration: vi.fn().mockResolvedValue([]),
  getFeaturedEvents: vi.fn().mockResolvedValue([]),
  getEventBySlug: vi.fn().mockResolvedValue(null),
  getPastEvents: vi.fn().mockResolvedValue([]),
  getAnnouncements: vi.fn().mockResolvedValue([]),
  getAnnouncementBySlug: vi.fn().mockResolvedValue(null),
  getAnnouncementsForStaticGeneration: vi.fn().mockResolvedValue([]),
  getFeaturedAnnouncements: vi.fn().mockResolvedValue([]),
  getUrgentAnnouncements: vi.fn().mockResolvedValue([]),
  getPrograms: vi.fn().mockResolvedValue([]),
  getServices: vi.fn().mockResolvedValue([]),
  getServiceBySlug: vi.fn().mockResolvedValue(null),
  getFeaturedServices: vi.fn().mockResolvedValue([]),
  getDonationCauses: vi.fn().mockResolvedValue([]),
  getDonationCauseBySlug: vi.fn().mockResolvedValue(null),
  getFeaturedDonationCauses: vi.fn().mockResolvedValue([]),
  getGalleryImages: vi.fn().mockResolvedValue([]),
  getFeaturedGalleryImages: vi.fn().mockResolvedValue([]),
  getTestimonials: vi.fn().mockResolvedValue([]),
  getFaqs: vi.fn().mockResolvedValue([]),
  getFaqsByCategory: vi.fn().mockResolvedValue([]),
  getFeaturedFaqs: vi.fn().mockResolvedValue([]),
  getEtiquette: vi.fn().mockResolvedValue([]),
  getTourTypes: vi.fn().mockResolvedValue([]),
  getTeamMembers: vi.fn().mockResolvedValue([]),
  getTeamMemberBySlug: vi.fn().mockResolvedValue(null),
  getTeamMembersByCategory: vi.fn().mockResolvedValue([]),
  getFeaturedTeamMembers: vi.fn().mockResolvedValue([]),
  getPageContent: vi.fn().mockResolvedValue([]),
  getPageContentBySlug: vi.fn().mockResolvedValue(null),
  getPageContentByType: vi.fn().mockResolvedValue(null),
  getNavigationPages: vi.fn().mockResolvedValue([]),
  getResources: vi.fn().mockResolvedValue([]),
  getResourceBySlug: vi.fn().mockResolvedValue(null),
  getResourcesByCategory: vi.fn().mockResolvedValue([]),
  getResourcesByType: vi.fn().mockResolvedValue([]),
  getFeaturedResources: vi.fn().mockResolvedValue([]),
  getSiteSettings: vi.fn().mockResolvedValue(null),
  getPrayerSettings: vi.fn().mockResolvedValue(null),
  // Campaign functions
  getDonationCampaigns: vi.fn().mockResolvedValue([]),
  getDonationCampaignBySlug: vi.fn().mockResolvedValue(null),
  getDonationCampaignsForStaticGeneration: vi.fn().mockResolvedValue([]),
  getFeaturedDonationCampaigns: vi.fn().mockResolvedValue([]),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("ResizeObserver", MockResizeObserver);

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// Suppress console errors for jsdom navigation warnings
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    (message.includes("Not implemented: navigation") ||
      message.includes("Not implemented: window.scrollTo"))
  ) {
    return;
  }
  originalConsoleError(...args);
};
