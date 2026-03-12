import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { QuickAccessSection } from "./QuickAccessSection";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock FadeIn
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock SiteSettings context
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    externalLinks: {
      college: "https://aicc.vic.edu.au/",
      bookstore: "",
      sportsClub: "",
    },
    socialMedia: {
      youtube: "",
      instagram: "",
      facebook: "",
    },
  }),
}));

describe("QuickAccessSection", () => {
  // Card titles render twice (desktop grid + mobile accordion header).
  // Link labels render once (mobile accordion is collapsed by default).
  // Use getAllByText for card titles, getByText for link labels.

  describe("Fallback behaviour", () => {
    it("renders hardcoded cards when no Sanity data provided", () => {
      render(<QuickAccessSection />);

      expect(screen.getAllByText("For Worshippers").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("For Visitors").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("For Community").length).toBeGreaterThanOrEqual(1);
    });

    it("renders hardcoded cards when quickLinksSection is undefined", () => {
      render(<QuickAccessSection quickLinksSection={undefined} />);

      expect(screen.getAllByText("For Worshippers").length).toBeGreaterThanOrEqual(1);
    });

    it("renders hardcoded cards when quickLinkCards array is empty", () => {
      render(
        <QuickAccessSection
          quickLinksSection={{ enabled: true, quickLinkCards: [] }}
        />,
      );

      expect(screen.getAllByText("For Worshippers").length).toBeGreaterThanOrEqual(1);
    });

    it("renders default bottom CTA text when not provided", () => {
      render(<QuickAccessSection />);

      expect(
        screen.getByText(/find what you.re looking for/i),
      ).toBeInTheDocument();
    });
  });

  describe("Sanity-driven cards", () => {
    const sanityCards = [
      {
        title: "Get Involved",
        subtitle: "Join our community",
        accentColor: "sky",
        links: [
          {
            label: "Volunteer",
            linkType: "internal" as const,
            internalPage: "/contact",
          },
          {
            label: "Donate",
            linkType: "internal" as const,
            internalPage: "/donate",
          },
        ],
        active: true,
      },
      {
        title: "Learn More",
        subtitle: "Education & Programs",
        accentColor: "lime",
        links: [
          {
            label: "IQRA Academy",
            linkType: "internal" as const,
            internalPage: "/events",
          },
        ],
        active: true,
      },
    ];

    it("renders Sanity cards when provided", () => {
      render(
        <QuickAccessSection
          quickLinksSection={{ quickLinkCards: sanityCards }}
        />,
      );

      expect(screen.getAllByText("Get Involved").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Join our community").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Learn More").length).toBeGreaterThanOrEqual(1);
    });

    it("renders Sanity link labels", () => {
      render(
        <QuickAccessSection
          quickLinksSection={{ quickLinkCards: sanityCards }}
        />,
      );

      expect(screen.getByText("Volunteer")).toBeInTheDocument();
      expect(screen.getByText("Donate")).toBeInTheDocument();
      expect(screen.getByText("IQRA Academy")).toBeInTheDocument();
    });

    it("resolves internal page links", () => {
      render(
        <QuickAccessSection
          quickLinksSection={{ quickLinkCards: sanityCards }}
        />,
      );

      const link = screen.getByText("Volunteer").closest("a");
      expect(link).toHaveAttribute("href", "/contact");
    });

    it("resolves external URL links", () => {
      const cardsWithExternal = [
        {
          title: "External",
          accentColor: "green",
          links: [
            {
              label: "Visit Partner",
              linkType: "external" as const,
              url: "https://partner.org",
            },
          ],
          active: true,
        },
      ];

      render(
        <QuickAccessSection
          quickLinksSection={{ quickLinkCards: cardsWithExternal }}
        />,
      );

      const link = screen.getByText("Visit Partner").closest("a");
      expect(link).toHaveAttribute("href", "https://partner.org");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("renders external link indicator for external links", () => {
      const cardsWithExternal = [
        {
          title: "External",
          accentColor: "green",
          links: [
            {
              label: "External Site",
              linkType: "external" as const,
              url: "https://example.com",
            },
          ],
          active: true,
        },
      ];

      render(
        <QuickAccessSection
          quickLinksSection={{ quickLinkCards: cardsWithExternal }}
        />,
      );

      const link = screen.getByText("External Site").closest("a");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders custom bottom CTA text", () => {
      render(
        <QuickAccessSection
          quickLinksSection={{
            quickLinkCards: sanityCards,
            bottomCtaText: "Need help? Get in touch",
          }}
        />,
      );

      expect(screen.getByText("Need help? Get in touch")).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("filters out inactive cards", () => {
      const cardsWithInactive = [
        { title: "Active Card", accentColor: "green", links: [{ label: "Link 1", linkType: "internal" as const, internalPage: "/" }], active: true },
        { title: "Inactive Card", accentColor: "sky", links: [{ label: "Link 2", linkType: "internal" as const, internalPage: "/" }], active: false },
      ];

      render(
        <QuickAccessSection
          quickLinksSection={{ quickLinkCards: cardsWithInactive }}
        />,
      );

      expect(screen.getAllByText("Active Card").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Inactive Card")).not.toBeInTheDocument();
    });

    it("falls back to hardcoded cards when all Sanity cards are inactive", () => {
      const allInactive = [
        { title: "Off", accentColor: "green", links: [{ label: "X", linkType: "internal" as const, internalPage: "/" }], active: false },
      ];

      render(
        <QuickAccessSection
          quickLinksSection={{ quickLinkCards: allInactive }}
        />,
      );

      expect(screen.getAllByText("For Worshippers").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Enabled toggle", () => {
    it("returns null when enabled is false", () => {
      const { container } = render(
        <QuickAccessSection
          quickLinksSection={{ enabled: false }}
        />,
      );

      expect(container.innerHTML).toBe("");
    });

    it("renders when enabled is true", () => {
      render(
        <QuickAccessSection
          quickLinksSection={{ enabled: true }}
        />,
      );

      expect(screen.getAllByText("For Worshippers").length).toBeGreaterThanOrEqual(1);
    });

    it("renders when enabled is undefined (defaults to showing)", () => {
      render(
        <QuickAccessSection
          quickLinksSection={{}}
        />,
      );

      expect(screen.getAllByText("For Worshippers").length).toBeGreaterThanOrEqual(1);
    });
  });
});
