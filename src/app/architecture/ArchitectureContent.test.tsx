import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import ArchitectureContent from "./ArchitectureContent";
import type { SanityArchitecturePageSettings } from "@/types/sanity";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}));
vi.mock("@/components/animations/FadeIn", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("next/image", () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean },
  ) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
vi.mock("@/sanity/lib/image", () => ({
  urlFor: () => ({
    width: () => ({ height: () => ({ url: () => "https://cdn.sanity.io/test.jpg" }) }),
  }),
}));
vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown[] }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));
vi.mock("@/components/ui/Breadcrumb", () => ({
  BreadcrumbLight: () => <nav aria-label="Breadcrumb">Breadcrumb</nav>,
}));

const defaultSettings: SanityArchitecturePageSettings = {
  heroHeading: "Our Architecture",
  heroHeadingAccent: "Architecture",
  heroBadge: "Award-Winning Design",
};

describe("ArchitectureContent", () => {
  it("renders without settings (null) without crashing", () => {
    render(<ArchitectureContent settings={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders hero heading fallback text when settings is null", () => {
    render(<ArchitectureContent settings={null} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Architecture");
  });

  it("renders hero heading from Sanity settings", () => {
    render(
      <ArchitectureContent
        settings={{ ...defaultSettings, heroHeading: "Islamic Architecture", heroHeadingAccent: "Architecture" }}
      />,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Islamic Architecture");
  });

  it("hides philosophy section when philosophyVisible is false", () => {
    render(
      <ArchitectureContent settings={{ ...defaultSettings, philosophyVisible: false }} />,
    );
    expect(screen.queryByText(/Design Philosophy/i)).not.toBeInTheDocument();
  });

  it("hides features section when featuresVisible is false", () => {
    render(
      <ArchitectureContent settings={{ ...defaultSettings, featuresVisible: false }} />,
    );
    expect(screen.queryByText(/Architectural Features/i)).not.toBeInTheDocument();
  });

  it("renders awards data when awardsCards are provided", () => {
    const settings: SanityArchitecturePageSettings = {
      ...defaultSettings,
      awardsCards: [
        { year: "2020", title: "Best Mosque Design", category: "Religious Architecture" },
        { year: "2021", title: "Sustainability Prize", category: "Green Buildings" },
      ],
    };
    render(<ArchitectureContent settings={settings} />);
    expect(screen.getByText("Best Mosque Design")).toBeInTheDocument();
    expect(screen.getByText("Religious Architecture")).toBeInTheDocument();
    expect(screen.getByText("Sustainability Prize")).toBeInTheDocument();
  });

  it("renders default fallback awards when no awardsCards provided", () => {
    render(<ArchitectureContent settings={null} />);
    expect(screen.getByText("Australian Institute of Architects Award")).toBeInTheDocument();
    expect(screen.getByText("World Architecture Festival Award")).toBeInTheDocument();
  });

  it("renders PortableText for heroContent when provided", () => {
    const heroContent = [{ _type: "block", _key: "abc", children: [] }];
    render(
      <ArchitectureContent
        settings={{ ...defaultSettings, heroContent }}
      />,
    );
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();
  });
});
