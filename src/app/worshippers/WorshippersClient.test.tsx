import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import WorshippersClient from "./WorshippersClient";
import type { SanityEtiquette } from "@/types/sanity";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>{children}</div>
    ),
    span: ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => 0 }),
  useMotionValueEvent: () => {},
}));

// Mock FadeIn and Stagger components
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock Breadcrumb
vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
}));

// Mock SiteSettingsContext
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    name: "Australian Islamic Centre",
    shortName: "AIC",
    tagline: "Welcome to AIC",
    parentOrganization: "ISWM",
    address: {
      street: "15 Blenheim Road",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
      full: "15 Blenheim Road, Newport VIC 3015, Australia",
    },
    phone: "(03) 9391 2834",
    email: "info@aic.org.au",
    socialMedia: { facebook: "", instagram: "", youtube: "" },
    externalLinks: { college: "", bookstore: "", newportStorm: "" },
  }),
}));

// Mock getPrayerTimesForDate
vi.mock("@/lib/prayer-times", () => ({
  getPrayerTimesForDate: () => ({
    fajr: { adhan: "05:30", iqamah: "05:45" },
    sunrise: { adhan: "07:00", iqamah: "07:00" },
    dhuhr: { adhan: "12:30", iqamah: "12:45" },
    asr: { adhan: "15:30", iqamah: "15:45" },
    maghrib: { adhan: "18:00", iqamah: "18:05" },
    isha: { adhan: "19:30", iqamah: "19:45" },
  }),
}));

// Mock useNextPrayer
vi.mock("@/hooks/usePrayerTimes", () => ({
  useNextPrayer: () => ({
    name: "dhuhr" as const,
    displayName: "Dhuhr",
    adhan: "12:30",
    iqamah: "12:45",
  }),
}));

// Mock prayer-config
vi.mock("@/lib/prayer-config", () => ({
  TARAWEEH_CONFIG: { enabled: false, time: "9:00 PM" },
  EID_CONFIG: {
    eidAlFitr: { active: false, times: [{ time: "8:00 AM" }] },
    eidAlAdha: { active: false, times: [{ time: "8:00 AM" }] },
  },
  getJumuahTimes: () => [
    { session: "Arabic Session", time: "12:30 PM", language: "Arabic" },
    { session: "English Session", time: "1:30 PM", language: "English" },
  ],
  JUMUAH_CONFIG: {
    sessions: [
      { language: "Arabic", khutbahTime: "12:30 PM", iqamahTime: "12:45 PM", enabled: true },
      { language: "English", khutbahTime: "1:30 PM", iqamahTime: "1:45 PM", enabled: true },
    ],
  },
}));

function makeEtiquette(overrides: Partial<SanityEtiquette> = {}): SanityEtiquette {
  return {
    _id: "etq-1",
    title: "Remove Shoes",
    description: "Please remove your shoes before entering.",
    icon: "footprints",
    ...overrides,
  };
}

describe("WorshippersClient", () => {
  it("renders the page hero heading fallback", () => {
    render(<WorshippersClient />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("For");
    expect(h1).toHaveTextContent("Worshippers");
  });

  it("renders the prayer schedule section", () => {
    render(<WorshippersClient />);
    expect(screen.getByText("Prayer Schedule")).toBeInTheDocument();
  });

  it("renders all 6 prayer names", () => {
    render(<WorshippersClient />);
    expect(screen.getAllByText("Fajr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sunrise").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dhuhr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Asr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maghrib").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Isha").length).toBeGreaterThan(0);
  });

  it("renders Jumu'ah times", () => {
    render(<WorshippersClient />);
    expect(screen.getAllByText(/Jumu['']ah/i).length).toBeGreaterThan(0);
  });

  it("renders etiquette section when etiquette prop is provided", () => {
    const etiquette = [
      makeEtiquette({ _id: "e1", title: "Remove Shoes", description: "Take off shoes at entrance." }),
      makeEtiquette({ _id: "e2", title: "Dress Modestly", description: "Cover arms and legs.", icon: "shirt" }),
    ];
    render(<WorshippersClient etiquette={etiquette} />);
    expect(screen.getByText("Mosque Etiquette")).toBeInTheDocument();
    expect(screen.getByText("Remove Shoes")).toBeInTheDocument();
    expect(screen.getByText("Dress Modestly")).toBeInTheDocument();
  });

  it("renders fallback etiquette when no etiquette prop provided", () => {
    render(<WorshippersClient />);
    // The fallback from @/data/content should be used
    expect(screen.getByText("Mosque Etiquette")).toBeInTheDocument();
  });

  it("renders Get Directions CTA section by default", () => {
    render(<WorshippersClient />);
    expect(screen.getByText("Get Directions")).toBeInTheDocument();
    expect(screen.getByText(/15 Blenheim Road/)).toBeInTheDocument();
  });

  it("does not render YouTube section when no videos provided", () => {
    render(<WorshippersClient youtubeVideos={[]} />);
    expect(screen.queryByText("Islamic Talks")).not.toBeInTheDocument();
  });

  it("renders YouTube section when videos are provided", () => {
    const videos = [
      {
        id: "abc123",
        title: "Friday Khutbah",
        thumbnail: "https://example.com/thumb.jpg",
        url: "https://youtube.com/watch?v=abc123",
        publishedAt: "2024-01-01",
        duration: "30:00",
      },
    ];
    render(<WorshippersClient youtubeVideos={videos} />);
    expect(screen.getByText("Islamic Talks")).toBeInTheDocument();
    expect(screen.getByText("Friday Khutbah")).toBeInTheDocument();
  });

  describe("pageSettings wiring", () => {
    it("renders fallback hero content when pageSettings is null", () => {
      render(<WorshippersClient pageSettings={null} />);
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("For");
      expect(h1).toHaveTextContent("Worshippers");
    });

    it("renders Sanity heroBadge", () => {
      render(
        <WorshippersClient
          pageSettings={{ heroBadge: "Community Times" }}
        />
      );
      expect(screen.getByText("Community Times")).toBeInTheDocument();
    });

    it("renders Sanity heroHeading and heroHeadingAccent", () => {
      render(
        <WorshippersClient
          pageSettings={{ heroHeading: "For Our", heroHeadingAccent: "Community" }}
        />
      );
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("For Our");
      expect(h1).toHaveTextContent("Community");
    });

    it("renders Sanity hero description", () => {
      render(
        <WorshippersClient
          pageSettings={{ heroDescription: "Join us for daily prayers and more." }}
        />
      );
      expect(screen.getByText("Join us for daily prayers and more.")).toBeInTheDocument();
    });

    it("hides etiquette section when etiquetteVisible is false", () => {
      render(
        <WorshippersClient
          etiquette={[makeEtiquette()]}
          pageSettings={{ etiquetteVisible: false }}
        />
      );
      expect(screen.queryByText("Mosque Etiquette")).not.toBeInTheDocument();
    });

    it("renders Sanity etiquetteHeading and etiquetteDescription", () => {
      render(
        <WorshippersClient
          pageSettings={{
            etiquetteHeading: "House Guidelines",
            etiquetteDescription: "Please follow these guidelines.",
          }}
        />
      );
      expect(screen.getByText("House Guidelines")).toBeInTheDocument();
      expect(screen.getByText("Please follow these guidelines.")).toBeInTheDocument();
    });

    it("uses pageSettings.etiquetteItems over the etiquette prop", () => {
      render(
        <WorshippersClient
          etiquette={[makeEtiquette({ _id: "e-prop", title: "From Prop Item" })]}
          pageSettings={{
            etiquetteItems: [{ title: "From Settings Item", description: "Settings etiquette." }],
          }}
        />
      );
      expect(screen.getByText("From Settings Item")).toBeInTheDocument();
      expect(screen.queryByText("From Prop Item")).not.toBeInTheDocument();
    });

    it("renders Sanity khutbahHeading for the YouTube section", () => {
      const videos = [
        {
          id: "vid1",
          title: "Khutbah",
          thumbnail: "https://example.com/thumb.jpg",
          url: "https://youtube.com/watch?v=vid1",
          publishedAt: "2024-01-01",
          duration: "20:00",
        },
      ];
      render(
        <WorshippersClient
          youtubeVideos={videos}
          pageSettings={{ khutbahHeading: "Friday Sermons" }}
        />
      );
      expect(screen.getByText("Friday Sermons")).toBeInTheDocument();
    });

    it("hides CTA section when ctaVisible is false", () => {
      render(
        <WorshippersClient
          pageSettings={{ ctaVisible: false }}
        />
      );
      expect(screen.queryByText("Get Directions")).not.toBeInTheDocument();
    });

    it("renders Sanity CTA heading and description", () => {
      render(
        <WorshippersClient
          pageSettings={{
            ctaHeading: "Find Our Mosque",
            ctaDescription: "We are easy to find.",
          }}
        />
      );
      expect(screen.getByText("Find Our Mosque")).toBeInTheDocument();
      expect(screen.getByText("We are easy to find.")).toBeInTheDocument();
    });

    it("renders Sanity CTA button label", () => {
      render(
        <WorshippersClient
          pageSettings={{ ctaButtonLabel: "Navigate Here", ctaButtonUrl: "/map" }}
        />
      );
      expect(screen.getByText("Navigate Here")).toBeInTheDocument();
    });
  });

  describe("Taraweeh and Eid settings", () => {
    it("shows Taraweeh when prayerSettings.taraweehEnabled is true", () => {
      render(
        <WorshippersClient
          prayerSettings={{ taraweehEnabled: true, taraweehTime: "9:00 PM" } as Parameters<typeof WorshippersClient>[0]["prayerSettings"]}
        />
      );
      expect(screen.getByText("Taraweeh")).toBeInTheDocument();
      expect(screen.getByText("9:00 PM")).toBeInTheDocument();
    });

    it("shows Eid al-Fitr when prayerSettings.eidFitrActive is true", () => {
      render(
        <WorshippersClient
          prayerSettings={{ eidFitrActive: true, eidFitrTime: "8:00 AM" } as Parameters<typeof WorshippersClient>[0]["prayerSettings"]}
        />
      );
      expect(screen.getByText("Eid al-Fitr")).toBeInTheDocument();
    });

    it("shows Eid al-Adha when prayerSettings.eidAdhaActive is true", () => {
      render(
        <WorshippersClient
          prayerSettings={{ eidAdhaActive: true, eidAdhaTime: "8:30 AM" } as Parameters<typeof WorshippersClient>[0]["prayerSettings"]}
        />
      );
      expect(screen.getByText("Eid al-Adha")).toBeInTheDocument();
    });
  });
});
