"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PrayerTimesCard } from "@/components/ui/PrayerTimesCard";
import { jumuahTimes } from "@/data/content";
import {
  Clock,
  Calendar,
  BookOpen,
  Download,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

const downloads = [
  {
    title: "Ramadan Timetable 2024",
    description: "Complete prayer and iftar times for Ramadan",
    fileType: "PDF",
    fileSize: "1.2 MB",
    category: "Prayer Times",
  },
  {
    title: "Islamic Calendar 1446 AH",
    description: "Hijri calendar with important dates",
    fileType: "PDF",
    fileSize: "800 KB",
    category: "Calendar",
  },
  {
    title: "New Muslim Guide",
    description: "Essential guide for those new to Islam",
    fileType: "PDF",
    fileSize: "2.5 MB",
    category: "Education",
  },
  {
    title: "Quran Recitation Guide",
    description: "Tajweed rules and pronunciation guide",
    fileType: "PDF",
    fileSize: "3.1 MB",
    category: "Education",
  },
  {
    title: "Marriage Application Form",
    description: "Form for Islamic marriage registration",
    fileType: "PDF",
    fileSize: "450 KB",
    category: "Forms",
  },
  {
    title: "Membership Application",
    description: "Become a member of the centre",
    fileType: "PDF",
    fileSize: "320 KB",
    category: "Forms",
  },
];

const articles = [
  {
    title: "The Importance of Community in Islam",
    excerpt: "Exploring the significance of ummah and community bonds in Islamic teachings.",
    date: "January 15, 2024",
    category: "Spirituality",
  },
  {
    title: "Preparing for Ramadan: A Practical Guide",
    excerpt: "Tips and guidance for making the most of the blessed month.",
    date: "January 10, 2024",
    category: "Worship",
  },
  {
    title: "Islamic Parenting in the Modern Age",
    excerpt: "Balancing Islamic values with contemporary parenting challenges.",
    date: "January 5, 2024",
    category: "Family",
  },
  {
    title: "Understanding Zakat: Your Complete Guide",
    excerpt: "Everything you need to know about this pillar of Islam.",
    date: "December 28, 2023",
    category: "Education",
  },
];

const faqs = [
  {
    question: "What are the prayer times at the centre?",
    answer: "We hold all five daily prayers. Prayer times change throughout the year based on the sun's position. Please check our prayer times section above or call us for the most current times.",
  },
  {
    question: "How can I register for Quran classes?",
    answer: "You can register for Quran classes by visiting our education office during business hours, calling us, or filling out the enrollment form on our Programs page. Classes are available for all ages and skill levels.",
  },
  {
    question: "Do you provide halal certification services?",
    answer: "Yes, we offer halal certification services for food establishments and products. Please contact our halal certification department for more information and application procedures.",
  },
  {
    question: "How can I book the centre for a nikah ceremony?",
    answer: "To book a nikah ceremony, please contact our marriage services department at least 4 weeks in advance. You'll need to provide documentation and complete pre-marital counselling.",
  },
  {
    question: "Is the centre accessible for people with disabilities?",
    answer: "Yes, our centre is fully accessible with wheelchair ramps, accessible bathrooms, and dedicated prayer spaces. Please let us know if you have specific requirements.",
  },
  {
    question: "How can I make a donation?",
    answer: "You can donate online through our secure donation page, in person at the centre, or via bank transfer. All donations are tax-deductible and receipts are provided.",
  },
];

export default function ResourcesPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDownloads = downloads.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-neutral-900 via-neutral-800 to-sage-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="mb-8">
            <Breadcrumb />
          </div>
          <FadeIn>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-lime-400 text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                Resources
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">Resources</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Access prayer times, Islamic calendar, educational materials,
                and helpful resources for your spiritual journey.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section id="prayer-times" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                <Clock className="w-4 h-4" />
                Today&apos;s Prayer Times
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Prayer Times for Sydney
              </h2>
              <p className="text-gray-600">{today}</p>
            </div>
          </FadeIn>

          <PrayerTimesCard variant="full" showIqamah={true} showArabic={true} highlightNext={true} />

          <FadeIn delay={0.4}>
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm mb-4">
                Friday Jumu&apos;ah prayer: Arabic Khutbah at {jumuahTimes[0].time}, English Khutbah at {jumuahTimes[1].time}
              </p>
              <Button
                href="#"
                variant="outline"
                icon={<Download className="w-4 h-4" />}
              >
                Download Monthly Timetable
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Islamic Calendar */}
      <section id="calendar" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
                <Calendar className="w-4 h-4" />
                Islamic Calendar
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Upcoming Islamic Dates
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { date: "1 Rajab 1446", gregorian: "January 1, 2025", event: "Beginning of Rajab" },
              { date: "27 Rajab 1446", gregorian: "January 27, 2025", event: "Isra & Mi'raj" },
              { date: "1 Ramadan 1446", gregorian: "March 1, 2025", event: "Beginning of Ramadan" },
              { date: "1 Shawwal 1446", gregorian: "March 30, 2025", event: "Eid al-Fitr" },
            ].map((item, index) => (
              <FadeIn key={item.event} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <p className="text-teal-600 font-medium mb-1">{item.date}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.event}</h3>
                  <p className="text-gray-500 text-sm">{item.gregorian}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-4">
                  <FileText className="w-4 h-4" />
                  Articles & Khutbah
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Latest Articles
                </h2>
              </div>
              <Button href="#" variant="outline">
                View All Articles
              </Button>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <StaggerItem key={article.title}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="bg-neutral-50 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full mb-4">
                    {article.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-neutral-700 transition-colors cursor-pointer">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <p className="text-sm text-gray-500">{article.date}</p>
                </motion.article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Downloads Section */}
      <section id="downloads" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-sage-600 text-sm font-medium mb-4">
                <Download className="w-4 h-4" />
                Downloads
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Downloadable Resources
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto mb-8">
                Access forms, guides, and educational materials.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search downloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      {item.fileType}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{item.fileSize}</span>
                    <Button href="#" variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                      Download
                    </Button>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-neutral-50 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedFaq === index ? "auto" : 0,
                      opacity: expandedFaq === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-gray-600">{faq.answer}</p>
                  </motion.div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Button href="/contact" variant="primary">
                Contact Us
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
