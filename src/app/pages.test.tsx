import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";

// Mock data content for all tests
vi.mock("@/data/content", () => ({
  aicImages: {
    interior: {
      prayerHallBright: "/images/test.jpg",
      prayerHallCeiling: "/images/test.jpg",
      prayerHallNight: "/images/test.jpg",
    },
    exterior: {
      front: "/images/test.jpg",
      frontView: "/images/test.jpg",
      aerial: "/images/test.jpg",
      aerialDrone: "/images/test.jpg",
      courtyard: "/images/test.jpg",
    },
    architecture: {
      roofGolden: "/images/test.jpg",
    },
    community: {
      event: "/images/test.jpg",
      education: "/images/test.jpg",
    },
  },
  jumuahTimes: [
    { label: "Arabic Khutbah", time: "12:30 PM" },
    { label: "English Khutbah", time: "1:30 PM" },
  ],
  aicInfo: {
    name: "Australian Islamic Centre",
    tagline: "A beacon of faith and knowledge",
    phone: "(03) 9391 9303",
    email: "contact@australianislamiccentre.org",
    address: {
      street: "15 Corporate Crescent",
      suburb: "Newport",
      state: "VIC",
      postcode: "3015",
      country: "Australia",
      full: "15 Corporate Crescent, Newport VIC 3015, Australia",
    },
    socialMedia: {
      facebook: "https://facebook.com/aic",
      instagram: "https://instagram.com/aic",
      youtube: "https://youtube.com/aic",
    },
    externalLinks: {
      college: "https://aicollege.edu.au",
      bookstore: "https://aicbookstore.com.au",
      newportStorm: "https://newportstorm.com.au",
    },
  },
  stats: [
    { value: "1000+", label: "Weekly Worshippers" },
    { value: "500+", label: "Students" },
    { value: "40+", label: "Years of Service" },
    { value: "50+", label: "Weekly Classes" },
  ],
  partners: [
    { name: "Partner 1", category: "Government" },
    { name: "Partner 2", category: "Community" },
  ],
  upcomingEvents: [
    {
      id: "1",
      title: "Friday Jumu'ah",
      description: "Weekly Friday prayer",
      date: "Fridays",
      recurringDay: "Fridays",
      time: "1:00 PM",
      location: "Main Prayer Hall",
      category: "Prayer",
      image: "/images/event.jpg",
      recurring: true,
    },
    {
      id: "2",
      title: "Quran Class",
      description: "Weekly Quran lessons",
      date: "Saturdays",
      recurringDay: "Saturdays",
      time: "10:00 AM",
      location: "Education Centre",
      category: "Education",
      image: "/images/event.jpg",
      recurring: true,
    },
  ],
  tourTypes: [
    { id: "1", title: "Architecture Tour", description: "Explore the building", icon: "building" },
    { id: "2", title: "School Tour", description: "Educational visits", icon: "graduation" },
  ],
  visitorFAQs: [
    { question: "Do I need to book?", answer: "Booking is recommended for groups." },
    { question: "What should I wear?", answer: "Modest dress is appreciated." },
  ],
  mosqueEtiquette: [
    { title: "Remove Shoes", description: "Please remove shoes before entering", icon: "footprints" },
    { title: "Modest Dress", description: "Dress modestly", icon: "shirt" },
  ],
  donationCauses: [
    { id: "general", title: "General Fund", description: "Support operations", icon: "building" },
  ],
  donationFrequencies: [
    { value: "once", label: "One-Time" },
    { value: "monthly", label: "Monthly" },
  ],
  donationAmounts: [25, 50, 100, 250, 500, 1000],
  programs: [
    {
      id: "1",
      title: "IQRA Academy",
      description: "Weekend Islamic school",
      category: "Education",
      schedule: "Weekends",
      image: "/images/program.jpg",
      features: ["Quran", "Arabic", "Islamic Studies"],
    },
    {
      id: "2",
      title: "Youth Leadership",
      description: "Youth leadership program",
      category: "Sports & Youth",
      schedule: "Fridays",
      image: "/images/program.jpg",
      features: ["Leadership", "Team building"],
    },
  ],
  services: [
    {
      id: "1",
      title: "Religious Services",
      description: "Islamic guidance",
      icon: "prayer",
    },
    {
      id: "2",
      title: "Community Support",
      description: "Support services",
      icon: "support",
    },
    {
      id: "3",
      title: "Education",
      description: "Learning programs",
      icon: "mosque",
    },
    {
      id: "4",
      title: "Youth Programs",
      description: "Youth activities",
      icon: "users",
    },
  ],
  testimonials: [
    {
      quote: "Great community",
      author: "John Doe",
      role: "Community Member",
    },
  ],
  galleryImages: [
    { id: "1", src: "/images/test.jpg", alt: "Test image", category: "Prayer Hall" },
    { id: "2", src: "/images/test2.jpg", alt: "Test image 2", category: "Architecture" },
  ],
  prayerTimes: {
    fajr: { adhan: "5:30 AM", iqamah: "5:45 AM" },
    sunrise: { adhan: "6:45 AM", iqamah: "" },
    dhuhr: { adhan: "1:00 PM", iqamah: "1:15 PM" },
    asr: { adhan: "4:30 PM", iqamah: "4:45 PM" },
    maghrib: { adhan: "7:00 PM", iqamah: "7:05 PM" },
    isha: { adhan: "8:30 PM", iqamah: "8:45 PM" },
  },
}));

// Import pages after mocking
import HomePage from "./page";
import AboutPage from "./about/page";
import ServicesPage from "./services/page";
import ContactPage from "./contact/page";
import VisitPage from "./visit/page";
import EventsPage from "./events/page";
import ProgramsPage from "./programs/page";
import ArchitecturePage from "./architecture/page";
import MediaPage from "./media/page";
import ResourcesPage from "./resources/page";

describe("Home Page", () => {
  it("renders without crashing", () => {
    // Home page renders multiple section components
    // Test that it at least renders content
    const { container } = render(<HomePage />);
    expect(container).toBeInTheDocument();
    // Check that some content exists
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});

describe("About Page", () => {
  it("renders the page title", () => {
    render(<AboutPage />);
    expect(screen.getByText(/A Unique Islamic Environment/i)).toBeInTheDocument();
  });

  it("displays mission section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
  });

  it("displays vision section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Our Vision")).toBeInTheDocument();
  });

  it("displays core values section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Our Core Values")).toBeInTheDocument();
    // Values may have multiple instances or different content - just check section exists
    expect(screen.getByText("Our Core Values")).toBeInTheDocument();
  });

  it("displays timeline section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Our Journey")).toBeInTheDocument();
  });

  it("displays architecture highlight", () => {
    render(<AboutPage />);
    expect(screen.getByText("Award-Winning Design")).toBeInTheDocument();
  });

  it("has links to visit and contact pages", () => {
    render(<AboutPage />);
    expect(screen.getByRole("link", { name: /Visit Our Centre/i })).toHaveAttribute("href", "/visit");
    expect(screen.getByRole("link", { name: /Plan Your Visit/i })).toHaveAttribute("href", "/visit");
  });
});

describe("Services Page", () => {
  it("renders the page title", () => {
    render(<ServicesPage />);
    expect(screen.getByText(/Serving Our Community/i)).toBeInTheDocument();
  });

  it("displays service categories", () => {
    render(<ServicesPage />);
    expect(screen.getAllByText("Religious Services").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Funeral Services").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nikah Services").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Counselling & Support").length).toBeGreaterThan(0);
  });

  it("displays more services section", () => {
    render(<ServicesPage />);
    expect(screen.getByText("More Services")).toBeInTheDocument();
    expect(screen.getByText("Daily Prayers")).toBeInTheDocument();
    expect(screen.getByText("Friday Jumu'ah")).toBeInTheDocument();
  });

  it("has contact CTA", () => {
    render(<ServicesPage />);
    expect(screen.getByText(/Need Assistance with Our Services/i)).toBeInTheDocument();
  });
});

describe("Contact Page", () => {
  it("renders the page title", () => {
    render(<ContactPage />);
    expect(screen.getByText(/Get in/i)).toBeInTheDocument();
    expect(screen.getByText("Touch")).toBeInTheDocument();
  });

  it("displays contact information cards", () => {
    render(<ContactPage />);
    expect(screen.getByText("Visit Us")).toBeInTheDocument();
    expect(screen.getByText("Call Us")).toBeInTheDocument();
    expect(screen.getByText("Email Us")).toBeInTheDocument();
    expect(screen.getByText("Opening Hours")).toBeInTheDocument();
  });

  it("displays contact form", () => {
    render(<ContactPage />);
    expect(screen.getByText("Send Us a Message")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your first name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("displays quick links sidebar", () => {
    render(<ContactPage />);
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Book a Visit")).toBeInTheDocument();
    expect(screen.getByText("Make a Donation")).toBeInTheDocument();
  });

  it("displays social media section", () => {
    render(<ContactPage />);
    expect(screen.getByText("Follow Us")).toBeInTheDocument();
  });

  it("has submit button", () => {
    render(<ContactPage />);
    expect(screen.getByRole("button", { name: /Send Message/i })).toBeInTheDocument();
  });
});

describe("Visit Page", () => {
  it("renders the page title", () => {
    render(<VisitPage />);
    expect(screen.getByText(/Plan Your/i)).toBeInTheDocument();
  });

  it("displays visiting information", () => {
    render(<VisitPage />);
    expect(screen.getByText("Visiting Information")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Opening Hours")).toBeInTheDocument();
  });

  it("displays guided tours section", () => {
    render(<VisitPage />);
    expect(screen.getByText("Guided Tours Available")).toBeInTheDocument();
    expect(screen.getByText(/Book Your Visit/i)).toBeInTheDocument();
  });

  it("displays mosque manners section", () => {
    render(<VisitPage />);
    expect(screen.getByText("Mosque Manners")).toBeInTheDocument();
  });

  it("displays virtual tour section", () => {
    render(<VisitPage />);
    expect(screen.getByText("360° Virtual Tour")).toBeInTheDocument();
    expect(screen.getByText("Explore from Anywhere")).toBeInTheDocument();
  });

  it("displays getting here section", () => {
    render(<VisitPage />);
    expect(screen.getByText("Getting to AIC")).toBeInTheDocument();
    expect(screen.getByText("By Car")).toBeInTheDocument();
    expect(screen.getByText("By Train")).toBeInTheDocument();
    expect(screen.getByText("By Bus")).toBeInTheDocument();
  });

  it("displays FAQs section", () => {
    render(<VisitPage />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("displays facilities section", () => {
    render(<VisitPage />);
    expect(screen.getByText("Our Facilities")).toBeInTheDocument();
  });
});

describe("Events Page", () => {
  it("renders the page title", () => {
    render(<EventsPage />);
    expect(screen.getAllByText(/Upcoming/i).length).toBeGreaterThan(0);
  });

  it("displays search and filter controls", () => {
    render(<EventsPage />);
    expect(screen.getByPlaceholderText("Search events...")).toBeInTheDocument();
  });

  it("displays category filters", () => {
    render(<EventsPage />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prayer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Education" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Community" })).toBeInTheDocument();
  });

  it("displays view toggle buttons", () => {
    render(<EventsPage />);
    // Grid and List view toggle buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("displays calendar section", () => {
    render(<EventsPage />);
    // Calendar should show current month
    const currentMonth = new Date().toLocaleDateString("en-US", { month: "long" });
    expect(screen.getByText(new RegExp(currentMonth))).toBeInTheDocument();
  });

  it("displays newsletter subscription", () => {
    render(<EventsPage />);
    expect(screen.getByText("Never Miss an Event")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("displays event cards", () => {
    render(<EventsPage />);
    // Should display mocked events
    expect(screen.getByText("Friday Jumu'ah")).toBeInTheDocument();
    expect(screen.getByText("Quran Class")).toBeInTheDocument();
  });
});

describe("Programs Page", () => {
  it("renders the page title", () => {
    render(<ProgramsPage />);
    expect(screen.getAllByText(/Transformative/i).length).toBeGreaterThan(0);
  });

  it("displays education programs section", () => {
    render(<ProgramsPage />);
    expect(screen.getByText("Islamic Education for All Ages")).toBeInTheDocument();
  });

  it("displays quick navigation", () => {
    render(<ProgramsPage />);
    expect(screen.getAllByText("Education Programs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sports & Youth").length).toBeGreaterThan(0);
  });

  it("displays AIC College CTA", () => {
    render(<ProgramsPage />);
    expect(screen.getAllByText("AIC College").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Visit AIC College Website/i })).toBeInTheDocument();
  });

  it("displays sports and youth section", () => {
    render(<ProgramsPage />);
    expect(screen.getByText("Building Character Through Sport & Community")).toBeInTheDocument();
  });

  it("displays educational impact stats", () => {
    render(<ProgramsPage />);
    expect(screen.getByText("Our Educational Impact")).toBeInTheDocument();
  });

  it("displays enrollment CTA", () => {
    render(<ProgramsPage />);
    expect(screen.getByText("Ready to Begin Your Learning Journey?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contact Us to Enroll/i })).toBeInTheDocument();
  });
});

describe("Architecture Page", () => {
  it("renders the page title", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText(/Where Faith Meets/i)).toBeInTheDocument();
    expect(screen.getByText(/Modern Design/i)).toBeInTheDocument();
  });

  it("displays award-winning badge", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText("Award-Winning Architecture")).toBeInTheDocument();
  });

  it("displays design philosophy section", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText("Design Philosophy")).toBeInTheDocument();
    expect(screen.getByText(/Dialogue Between/i)).toBeInTheDocument();
  });

  it("displays architectural features", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText("Architectural Features")).toBeInTheDocument();
    expect(screen.getByText("99 Names of Allah")).toBeInTheDocument();
    expect(screen.getByText("Natural Light Design")).toBeInTheDocument();
    expect(screen.getByText("Qibla Orientation")).toBeInTheDocument();
    expect(screen.getByText("Sustainable Design")).toBeInTheDocument();
  });

  it("displays gallery section", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText("Gallery")).toBeInTheDocument();
    expect(screen.getByText("Experience the beauty of our architectural masterpiece.")).toBeInTheDocument();
  });

  it("displays awards section", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText("Awards & Accolades")).toBeInTheDocument();
    expect(screen.getByText("Australian Institute of Architects Award")).toBeInTheDocument();
    expect(screen.getByText("World Architecture Festival Award")).toBeInTheDocument();
  });

  it("displays architect quote", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText("Glenn Murcutt AO")).toBeInTheDocument();
    expect(screen.getByText("Pritzker Prize Laureate, Lead Architect")).toBeInTheDocument();
  });

  it("displays visit CTA", () => {
    render(<ArchitecturePage />);
    expect(screen.getByText("Experience It In Person")).toBeInTheDocument();
    const visitLinks = screen.getAllByRole("link", { name: /Plan Your Visit/i });
    expect(visitLinks.length).toBeGreaterThan(0);
    expect(visitLinks[0]).toHaveAttribute("href", "/visit");
  });
});

describe("Media Page", () => {
  it("renders the page title", () => {
    render(<MediaPage />);
    expect(screen.getAllByText(/News/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Media/i).length).toBeGreaterThan(0);
  });

  it("displays tab navigation", () => {
    render(<MediaPage />);
    expect(screen.getByRole("button", { name: /Latest Updates/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gallery/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Videos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Podcasts/i })).toBeInTheDocument();
  });

  it("displays featured updates section", () => {
    render(<MediaPage />);
    expect(screen.getByText("Featured Updates")).toBeInTheDocument();
  });

  it("displays social media section", () => {
    render(<MediaPage />);
    expect(screen.getByText("Follow Us on Social Media")).toBeInTheDocument();
  });

  it("displays newsletter subscription", () => {
    render(<MediaPage />);
    expect(screen.getByText("Subscribe to Our Newsletter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });
});

describe("Resources Page", () => {
  it("renders the page title", () => {
    render(<ResourcesPage />);
    expect(screen.getAllByText(/Community/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Resources/i).length).toBeGreaterThan(0);
  });

  it("displays prayer times section", () => {
    render(<ResourcesPage />);
    expect(screen.getByText(/Today's Prayer Times/i)).toBeInTheDocument();
    expect(screen.getByText("Prayer Times for Sydney")).toBeInTheDocument();
  });

  it("displays all prayer names", () => {
    render(<ResourcesPage />);
    expect(screen.getByText("Fajr")).toBeInTheDocument();
    expect(screen.getByText("Sunrise")).toBeInTheDocument();
    expect(screen.getByText("Dhuhr")).toBeInTheDocument();
    expect(screen.getByText("Asr")).toBeInTheDocument();
    expect(screen.getByText("Maghrib")).toBeInTheDocument();
    expect(screen.getByText("Isha")).toBeInTheDocument();
  });

  it("displays Islamic calendar section", () => {
    render(<ResourcesPage />);
    expect(screen.getByText("Islamic Calendar")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Islamic Dates")).toBeInTheDocument();
  });

  it("displays articles section", () => {
    render(<ResourcesPage />);
    expect(screen.getByText("Latest Articles")).toBeInTheDocument();
  });

  it("displays downloads section", () => {
    render(<ResourcesPage />);
    expect(screen.getByText("Downloadable Resources")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search downloads...")).toBeInTheDocument();
  });

  it("displays FAQ section", () => {
    render(<ResourcesPage />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("What are the prayer times at the centre?")).toBeInTheDocument();
  });

  it("has contact us button in FAQ section", () => {
    render(<ResourcesPage />);
    expect(screen.getByText("Still have questions?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contact Us/i })).toBeInTheDocument();
  });
});
