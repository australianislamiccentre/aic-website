import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import ContactContent from "./ContactContent";
import type { SanityContactPageSettings } from "@/types/sanity";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
    a: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
  },
}));
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
}));
vi.mock("@/contexts/SiteSettingsContext", () => ({
  useSiteSettings: () => ({
    phone: "+61 3 9391 1933",
    email: "info@aic.org.au",
    address: { full: "23-27 Blenheim Road, Newport VIC 3015" },
    socialMedia: { facebook: "#", instagram: "#", youtube: "#" },
    operatingHours: "Open Daily from Fajr to Isha",
  }),
}));
vi.mock("@/contexts/FormSettingsContext", () => ({
  useFormSettings: () => ({
    contactHeading: "Get in",
    contactHeadingAccent: "Touch",
    contactDescription: "We would love to hear from you.",
    contactFormHeading: "Send Us a Message",
    contactFormDescription: "Fill out the form below.",
    contactInquiryTypes: [{ value: "general", label: "General Inquiry" }],
    contactSuccessHeading: "Message Sent",
    contactSuccessMessage: "We will get back to you soon.",
  }),
}));

describe("ContactContent", () => {
  it("renders without settings (null) without crashing", () => {
    expect(() => render(<ContactContent settings={null} />)).not.toThrow();
  });

  it("shows hero heading from Sanity settings", () => {
    const settings: SanityContactPageSettings = {
      heroHeading: "Reach Out to Us",
      heroHeadingAccent: "Us",
    };
    render(<ContactContent settings={settings} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Reach Out to Us");
  });

  it("shows fallback heading from FormSettings when settings is null", () => {
    render(<ContactContent settings={null} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Get in");
    expect(heading).toHaveTextContent("Touch");
  });

  it("hides sidebar when sidebarVisible is false", () => {
    const settings: SanityContactPageSettings = { sidebarVisible: false };
    render(<ContactContent settings={settings} />);
    expect(screen.queryByTitle("Australian Islamic Centre Location")).not.toBeInTheDocument();
    expect(screen.queryByText("Contact Details")).not.toBeInTheDocument();
  });

  it("shows sidebar by default when sidebarVisible is undefined", () => {
    const settings: SanityContactPageSettings = {};
    render(<ContactContent settings={settings} />);
    expect(screen.getByTitle("Australian Islamic Centre Location")).toBeInTheDocument();
    expect(screen.getByText("Contact Details")).toBeInTheDocument();
  });

  it("shows operating hours from site settings context", () => {
    render(<ContactContent settings={null} />);
    expect(screen.getByText("Open Daily from Fajr to Isha")).toBeInTheDocument();
  });

  it("renders form submit button", () => {
    render(<ContactContent settings={null} />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("renders page description from Sanity settings", () => {
    const settings: SanityContactPageSettings = {
      heroDescription: "Custom description from Sanity.",
    };
    render(<ContactContent settings={settings} />);
    expect(screen.getByText("Custom description from Sanity.")).toBeInTheDocument();
  });
});
