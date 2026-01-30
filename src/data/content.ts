// Prayer times - Dynamically calculated based on the current date
// Re-export from the prayer-times utility for convenience
export { getPrayerTimesSimple as getDynamicPrayerTimes, getNextPrayer, getPrayerTimesForDate } from "@/lib/prayer-times";

// Centralized prayer configuration - will be replaced by Sanity CMS
import { getJumuahTimes } from "@/lib/prayer-config";

// Static fallback prayer times (used for SSR initial render)
// These will be replaced by dynamic times on the client
export const prayerTimes = {
  fajr: { adhan: "5:30 AM", iqamah: "5:45 AM" },
  sunrise: { adhan: "6:45 AM", iqamah: "-" },
  dhuhr: { adhan: "1:30 PM", iqamah: "1:45 PM" },
  asr: { adhan: "5:15 PM", iqamah: "5:30 PM" },
  maghrib: { adhan: "8:30 PM", iqamah: "8:35 PM" },
  isha: { adhan: "9:45 PM", iqamah: "10:00 PM" },
};

// Jumu'ah (Friday) prayer times - now from centralized config
// This will automatically update when JUMUAH_CONFIG changes in prayer-config.ts
// Eventually this will come from Sanity CMS
export const jumuahTimes = getJumuahTimes();

// AIC Images - Local images from public/images folder
export const aicImages = {
  exterior: {
    courtyard: "/images/aic 1.jpg", // Exterior courtyard with people
    front: "/images/aic end.jpg", // Front view with minaret and trees
    aerial: "/images/aic 4.jpg", // Aerial view with qibla wall
    aerialDrone: "/images/aic 9.jpeg", // Aerial drone shot with crescent moon
    night: "/images/aic 8.jpg", // Night exterior with lights
  },
  architecture: {
    roofGolden: "/images/aic 2.jpg", // Aerial view of golden roof lanterns
    roofDetail: "/images/aic 3.jpeg", // Close-up of golden roof architecture
    roofDusk: "/images/aic 7.webp", // Golden roof detail at dusk
    minaret: "/images/aic 6.webp", // Minaret/qibla wall close-up
  },
  interior: {
    prayerHallBright: "/images/aic start.jpg", // Interior prayer hall with colorful skylights (bright)
    prayerHallNight: "/images/aic 10.webp", // Interior prayer hall at night with calligraphy
    ceilingDetail: "/images/aic 5.jpg", // Interior detail of colorful ceiling lights
  },
};

// AIC Information
export const aicInfo = {
  name: "Australian Islamic Centre",
  shortName: "AIC",
  tagline: "A unique Islamic environment that integrates Australian values with the beauty of Islam",
  parentOrganization: "Newport Islamic Society",
  address: {
    street: "23-27 Blenheim Rd",
    suburb: "Newport",
    state: "VIC",
    postcode: "3015",
    country: "Australia",
    full: "23-27 Blenheim Rd, Newport VIC 3015, Australia",
  },
  phone: "03 9000 0177",
  email: "contact@australianislamiccentre.org",
  socialMedia: {
    facebook: "https://www.facebook.com/AustralianIslamicCentre",
    instagram: "https://www.instagram.com/australianislamiccentre",
    youtube: "https://www.youtube.com/@AustralianIslamicCentre",
  },
  externalLinks: {
    college: "https://aicc.vic.edu.au/",
    bookstore: "https://shop.australianislamiccentre.org/",
    newportStorm: "https://www.newportstormfc.com.au/",
  },
};

// Upcoming Events
export const upcomingEvents = [
  // Dated events (these should appear first)
  {
    id: "eid-al-fitr-2025",
    title: "Eid Al-Fitr Prayer",
    date: "2025-03-30",
    time: "7:30 AM",
    location: "Main Prayer Hall & Courtyard",
    image: "/images/aic 1.jpg",
    description: "Join us for the blessed Eid Al-Fitr prayers followed by community celebrations and festivities for all ages.",
    category: "Special Event",
    recurring: false,
  },
  {
    id: "ramadan-iftar-2025",
    title: "Community Iftar",
    date: "2025-03-15",
    time: "6:30 PM",
    location: "Community Hall",
    image: "/images/aic 8.jpg",
    description: "Break your fast with the community. Free iftar meal provided. All welcome.",
    category: "Community",
    recurring: false,
  },
  // Recurring events
  {
    id: "jumuah-arabic",
    title: "Jumu'ah Prayer - Arabic Khutbah",
    date: "Fridays",
    recurringDay: "Fridays",
    time: "1:00 PM",
    location: "Main Prayer Hall",
    image: "/images/aic start.jpg",
    description: "Weekly congregational Friday prayer with khutbah delivered in Arabic. All brothers and sisters welcome.",
    category: "Prayer",
    recurring: true,
  },
  {
    id: "jumuah-english",
    title: "Jumu'ah Prayer - English Khutbah",
    date: "Fridays",
    recurringDay: "Fridays",
    time: "2:15 PM",
    location: "Main Prayer Hall",
    image: "/images/aic 10.webp",
    description: "Weekly congregational Friday prayer with khutbah delivered in English. All brothers and sisters welcome.",
    category: "Prayer",
    recurring: true,
  },
  {
    id: "iqra-academy",
    title: "IQRA Academy",
    date: "Saturdays",
    recurringDay: "Saturdays",
    time: "9:00 AM - 1:00 PM",
    location: "Education Centre",
    image: "/images/aic 1.jpg",
    description: "Quran recitation, Islamic studies, and memorization classes for children aged 5-12. Building strong foundations in Islamic knowledge.",
    category: "Education",
    recurring: true,
  },
  {
    id: "salam-arabic",
    title: "Salam Arabic School",
    date: "Weekends",
    recurringDay: "Weekends",
    time: "Various Sessions",
    location: "Education Centre",
    image: "/images/aic end.jpg",
    description: "Comprehensive Arabic language instruction for all levels, from beginners to advanced.",
    category: "Education",
    recurring: true,
  },
  {
    id: "girls-jiujitsu",
    title: "Girls Jiu-Jitsu Classes",
    date: "Wednesdays",
    recurringDay: "Wednesdays",
    time: "5:00 PM",
    location: "Youth Centre",
    image: "/images/aic 4.jpg",
    description: "Self-defense and fitness classes for girls through AIYC in a safe, supportive environment.",
    category: "Youth",
    recurring: true,
  },
  {
    id: "boys-wrestling",
    title: "Boys Wrestling Classes",
    date: "Thursdays",
    recurringDay: "Thursdays",
    time: "5:00 PM",
    location: "Youth Centre",
    image: "/images/aic 8.jpg",
    description: "Wrestling and fitness program for boys through AIYC. Building strength and discipline.",
    category: "Youth",
    recurring: true,
  },
];

// Services
export const services = [
  {
    id: "prayers",
    title: "Daily Prayers",
    description: "Join us for the five daily prayers in our beautiful main prayer hall. Experience the serenity of congregational worship.",
    icon: "prayer",
    image: "/images/aic start.jpg",
  },
  {
    id: "jumuah",
    title: "Friday Jumu'ah",
    description: "Our Friday prayer service features inspiring khutbahs in both Arabic (1:00 PM) and English (2:15 PM) sessions.",
    icon: "mosque",
    image: "/images/aic 10.webp",
  },
  {
    id: "nikah",
    title: "Nikah Services",
    description: "Islamic marriage ceremonies with official Islamic Law certificates and comprehensive documentation.",
    icon: "heart",
    image: "/images/aic 5.jpg",
  },
  {
    id: "funeral",
    title: "Funeral Services",
    description: "Compassionate funeral services including ghusl, janazah prayers, and burial arrangements with care and dignity.",
    icon: "support",
    image: "/images/aic end.jpg",
  },
  {
    id: "counselling",
    title: "Counselling & Support",
    description: "Confidential Islamic counselling services for individuals and families, providing guidance and support.",
    icon: "users",
    image: "/images/aic 1.jpg",
  },
  {
    id: "religious",
    title: "Religious Services",
    description: "Advice, guidance, and services related to births, marriages, deaths, and all aspects of Islamic practice.",
    icon: "certificate",
    image: "/images/aic 6.webp",
  },
];

// Programs - Education & Youth
export const programs = [
  {
    id: "iqra",
    title: "IQRA Academy",
    description: "Weekend school established in 2013 with 100+ students from kindergarten through Year 7. Focused on Quran recitation, Islamic studies, and memorization.",
    schedule: "Saturdays & Sundays, 9AM - 1PM",
    image: "/images/aic start.jpg",
    features: ["Iqra Program - Fluent Quranic Reading", "Islamic Studies Foundation", "Quranic Memorization", "Understanding & Tafsir"],
    category: "Education",
  },
  {
    id: "salam",
    title: "Salam Arabic School",
    description: "Comprehensive Arabic language instruction for students of all ages and levels.",
    schedule: "Weekends",
    image: "/images/aic 10.webp",
    features: ["Classical Arabic", "Modern Standard Arabic", "Conversational Skills", "Reading & Writing"],
    category: "Education",
  },
  {
    id: "alnoor",
    title: "Al-Noor Institute",
    description: "Advanced Islamic education programs for deeper understanding of Islamic sciences.",
    schedule: "Contact for details",
    image: "/images/aic 5.jpg",
    features: ["Advanced Islamic Studies", "Fiqh & Aqeedah", "Seerah & History", "Contemporary Issues"],
    category: "Education",
  },
  {
    id: "newportstorm",
    title: "Newport Storm FC",
    description: "Community football club fostering teamwork, fitness, and Islamic values in youth.",
    schedule: "See club website for training times",
    image: "/images/aic 1.jpg",
    features: ["Junior Teams", "Senior Teams", "Professional Coaching", "Community Spirit"],
    category: "Sports & Youth",
    externalLink: "https://www.newportstormfc.com.au/",
  },
  {
    id: "boysynights",
    title: "Boys Youth Nights",
    description: "Regular youth gatherings for boys featuring Islamic learning, sports, and brotherhood activities.",
    schedule: "Contact for schedule",
    image: "/images/aic 8.jpg",
    features: ["Islamic Learning", "Sports Activities", "Brotherhood Building", "Leadership Development"],
    category: "Sports & Youth",
  },
  {
    id: "girlsjiujitsu",
    title: "Girls Jiu-Jitsu Classes",
    description: "Self-defense and fitness classes designed specifically for girls in a safe, supportive environment.",
    schedule: "Weekly sessions",
    image: "/images/aic 4.jpg",
    features: ["Self-Defense Skills", "Physical Fitness", "Confidence Building", "Female Instructors"],
    category: "Sports & Youth",
  },
];

// Tour Types
export const tourTypes = [
  {
    id: "architectural",
    title: "Architectural Tours",
    description: "Explore our award-winning architectural design that has attracted visitors from around the world.",
    icon: "building",
    image: "/images/aic 2.jpg",
  },
  {
    id: "school",
    title: "School Tours",
    description: "Educational excursions for students to learn about Islam, Muslim culture, and interfaith understanding.",
    icon: "graduation",
    image: "/images/aic 1.jpg",
  },
  {
    id: "masjid",
    title: "Masjid Tours",
    description: "Experience the spiritual heart of our centre with a guided tour of the prayer facilities.",
    icon: "mosque",
    image: "/images/aic start.jpg",
  },
  {
    id: "info",
    title: "Information Sessions",
    description: "Learn about Islam, ask questions, and engage in meaningful dialogue in a welcoming environment.",
    icon: "info",
    image: "/images/aic end.jpg",
  },
];

// Testimonials
export const testimonials = [
  {
    id: "1",
    quote: "The Australian Islamic Centre is not just a mosque - it's a global architectural icon that serves as a hub for our local community. The integration of Australian values with Islamic beauty is truly remarkable.",
    author: "Community Member",
    role: "Newport Local",
    image: "/images/aic 9.jpeg",
  },
  {
    id: "2",
    quote: "IQRA Academy has transformed my children's understanding of Islam. The teachers are dedicated and the environment nurtures both Islamic knowledge and Australian identity.",
    author: "Parent",
    role: "IQRA Academy Parent",
    image: "/images/aic start.jpg",
  },
  {
    id: "3",
    quote: "The visitor tour was an eye-opening experience. The architecture is stunning and the community was so welcoming. I learned so much about Islam and the Muslim community.",
    author: "Visitor",
    role: "Architecture Enthusiast",
    image: "/images/aic 2.jpg",
  },
];

// Stats
export const stats = [
  { value: "1000+", label: "Weekly Worshippers" },
  { value: "100+", label: "IQRA Students" },
  { value: "Global", label: "Architecture Recognition" },
  { value: "40+", label: "Years Serving Community" },
];

// Gallery Images
export const galleryImages = [
  {
    id: "1",
    src: "/images/aic start.jpg",
    alt: "Main prayer hall interior with colorful skylights",
    category: "Prayer Hall",
  },
  {
    id: "2",
    src: "/images/aic end.jpg",
    alt: "Exterior front view with minaret",
    category: "Architecture",
  },
  {
    id: "3",
    src: "/images/aic 2.jpg",
    alt: "Aerial view of golden roof lanterns",
    category: "Architecture",
  },
  {
    id: "4",
    src: "/images/aic 1.jpg",
    alt: "Courtyard with community members",
    category: "Community",
  },
  {
    id: "5",
    src: "/images/aic 5.jpg",
    alt: "Interior ceiling with colorful lights",
    category: "Prayer Hall",
  },
  {
    id: "6",
    src: "/images/aic 9.jpeg",
    alt: "Aerial drone shot with crescent moon",
    category: "Architecture",
  },
  {
    id: "7",
    src: "/images/aic 10.webp",
    alt: "Prayer hall at night with calligraphy",
    category: "Prayer Hall",
  },
  {
    id: "8",
    src: "/images/aic 8.jpg",
    alt: "Night exterior with lights",
    category: "Events",
  },
  {
    id: "9",
    src: "/images/aic 6.webp",
    alt: "Minaret close-up view",
    category: "Architecture",
  },
  {
    id: "10",
    src: "/images/aic 4.jpg",
    alt: "Aerial view of the centre",
    category: "Architecture",
  },
];

// Donation Causes
export const donationCauses = [
  {
    id: "general",
    title: "General Fund",
    description: "Support the daily operations and maintenance of the centre.",
    icon: "building",
  },
  {
    id: "education",
    title: "Education Programs",
    description: "Fund scholarships and educational materials for IQRA Academy and Salam School students.",
    icon: "book",
  },
  {
    id: "zakat",
    title: "Zakat",
    description: "Fulfill your Zakat obligation through our verified distribution channels.",
    icon: "heart",
  },
  {
    id: "sadaqah",
    title: "Sadaqah",
    description: "Give voluntary charity to support those in need in our community.",
    icon: "gift",
  },
  {
    id: "youth",
    title: "Youth Programs",
    description: "Support AIYC programs including sports, youth nights, and development activities.",
    icon: "users",
  },
  {
    id: "maintenance",
    title: "Building Maintenance",
    description: "Help maintain and preserve our architectural landmark for future generations.",
    icon: "hammer",
  },
];

export const donationFrequencies = [
  { value: "once", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export const donationAmounts = [25, 50, 100, 250, 500, 1000];

// News/Announcements
export const announcements = [
  {
    id: "1",
    title: "Ramadan 2024 Prayer Times",
    date: "2024-03-01",
    excerpt: "Special Taraweeh prayers and Iftar programs throughout the blessed month.",
    category: "Announcement",
    featured: true,
  },
  {
    id: "2",
    title: "IQRA Academy Enrolments Open",
    date: "2024-02-15",
    excerpt: "Enrolments now open for the new term. Limited spots available for Quran and Islamic studies classes.",
    category: "Education",
    featured: true,
  },
  {
    id: "3",
    title: "Community Eid Celebration",
    date: "2024-04-10",
    excerpt: "Join us for Eid prayers followed by community breakfast and festivities for all ages.",
    category: "Event",
    featured: false,
  },
];

// FAQ for Visitors
export const visitorFAQs = [
  {
    question: "Do I need to book a visit in advance?",
    answer: "While walk-ins are welcome for individual visits, we recommend booking group tours in advance to ensure a guide is available.",
  },
  {
    question: "What should I wear when visiting the mosque?",
    answer: "Modest dress is required. Shoulders and knees should be covered. Headscarves are provided for women if needed.",
  },
  {
    question: "Can non-Muslims visit the mosque?",
    answer: "Absolutely! We welcome visitors of all faiths and backgrounds. Our tours are designed to be educational and inclusive.",
  },
  {
    question: "Is photography allowed?",
    answer: "Photography is permitted in designated areas. Please ask your guide and be respectful during prayer times.",
  },
  {
    question: "Are there parking facilities?",
    answer: "Yes, free parking is available on-site for visitors.",
  },
  {
    question: "Is there a 360-degree virtual tour available?",
    answer: "Yes! We offer a virtual 360-degree tour for those who cannot visit in person. Contact us for access.",
  },
];

// Mosque Etiquette
export const mosqueEtiquette = [
  {
    title: "Remove Shoes",
    description: "Please remove your shoes before entering the prayer areas. Shoe racks are provided.",
    icon: "footprints",
  },
  {
    title: "Dress Modestly",
    description: "Wear clothing that covers shoulders and knees. Headscarves available for women.",
    icon: "shirt",
  },
  {
    title: "Maintain Silence",
    description: "Keep voices low, especially during prayer times. Phones should be on silent.",
    icon: "volume",
  },
  {
    title: "Respect Prayer",
    description: "Do not walk in front of those praying. Wait until prayers conclude before moving.",
    icon: "hands",
  },
  {
    title: "Wudu Facilities",
    description: "Ablution (wudu) facilities are available for those wishing to pray.",
    icon: "droplets",
  },
  {
    title: "Ask Questions",
    description: "Feel free to ask questions respectfully. Our community is happy to help.",
    icon: "help",
  },
];

// Partners
export const partners = [
  { name: "Hobsons Bay City Council", category: "Government" },
  { name: "Victorian Government", category: "Government" },
  { name: "Victoria Police", category: "Community" },
  { name: "Fire Rescue Victoria", category: "Community" },
  { name: "Western Health", category: "Health" },
];
