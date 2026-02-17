// Prayer times - Dynamically calculated based on the current date
// Re-export from the prayer-times utility for convenience
export { getPrayerTimesSimple as getDynamicPrayerTimes, getNextPrayer, getPrayerTimesForDate } from "@/lib/prayer-times";

// Centralized prayer configuration - will be replaced by Sanity CMS
import { getJumuahTimes } from "@/lib/prayer-config";

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

// AIC Information - Used as fallback when Sanity siteSettings is empty
// Prefer using useSiteSettings() hook from @/contexts/SiteSettingsContext
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

// Upcoming Events - Hardcoded fallback for when Sanity events are empty
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

// Services - Hardcoded fallback for when Sanity services are empty
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

// Mosque Etiquette - Hardcoded fallback for when Sanity etiquette is empty
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

// Stats
export const stats = [
  { value: "1000+", label: "Weekly Worshippers" },
  { value: "100+", label: "IQRA Students" },
  { value: "Global", label: "Architecture Recognition" },
  { value: "40+", label: "Years Serving Community" },
];
